"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dbService_1 = require("../db/dbService");
const Mutex_1 = require("../../../DSA/Concurrency/Mutex");
const Semaphore_1 = require("../../../DSA/Concurrency/Semaphore");
const BookingHashMap_1 = require("../../../DSA/Hashing/BookingHashMap");
const BookingQueue_1 = require("../../../DSA/Queue/BookingQueue");
const router = (0, express_1.Router)();
// Concurrency Locks (reusable instances from shared DSA folder)
const bookingMutex = new Mutex_1.Mutex();
const checkoutSemaphore = new Semaphore_1.Semaphore(2); // Throttles checkouts to max 2 concurrent workers
// Custom Hash Map for Booking Lookups
const bookingHashMap = new BookingHashMap_1.BookingHashMap(16);
// Custom BookingQueue to simulate waiting lines
const simulationQueue = new BookingQueue_1.BookingQueue();
// Helper to generate a random 8-character confirmation code
function generateHash(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
// 1. Get all movies
router.get('/movies', async (req, res) => {
    try {
        const movies = await dbService_1.db.getMovies();
        res.json(movies);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 2. Get movie by ID
router.get('/movies/:id', async (req, res) => {
    try {
        const movie = await dbService_1.db.getMovie(req.params.id);
        if (!movie)
            return res.status(404).json({ error: 'Movie not found' });
        res.json(movie);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 3. Get theatres
router.get('/theatres', async (req, res) => {
    try {
        const theatres = await dbService_1.db.getTheatres();
        res.json(theatres);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 4. Get showtimes
router.get('/showtimes', async (req, res) => {
    try {
        const movieId = req.query.movieId;
        if (!movieId)
            return res.status(400).json({ error: 'movieId is required' });
        const showtimes = await dbService_1.db.getShowtimes(movieId);
        res.json(showtimes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 5. Get seats
router.get('/seats', async (req, res) => {
    try {
        const showtimeId = req.query.showtimeId;
        if (!showtimeId)
            return res.status(400).json({ error: 'showtimeId is required' });
        const seats = await dbService_1.db.getSeats(showtimeId);
        res.json(seats);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Reset seats helper for testing/concurrency simulation
router.post('/seats/reset', async (req, res) => {
    try {
        const { showtimeId, seats } = req.body;
        await dbService_1.db.unbookSeats(showtimeId, seats);
        res.json({ message: 'Seats reset successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 6. Verification lookup using Custom Hash Map
router.get('/verify/:hash', (req, res) => {
    const hash = req.params.hash.toUpperCase();
    const booking = bookingHashMap.get(hash);
    if (!booking) {
        return res.status(404).json({ verified: false, message: 'Invalid or expired booking confirmation ID.' });
    }
    res.json({ verified: true, booking });
});
// 7. Booking endpoint with Concurrency Options
router.post('/book', async (req, res) => {
    const { showtimeId, seats, userName, syncMode } = req.body;
    const requestId = generateHash(6);
    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0 || !userName) {
        return res.status(400).json({ error: 'Missing booking details.' });
    }
    // FIFO Waiting Queue simulation insertion
    simulationQueue.enqueue({ id: requestId, user: userName });
    const logPrefix = `[Req: ${requestId} | User: ${userName}]`;
    console.log(`${logPrefix} Received booking request for seats: ${seats.join(', ')}`);
    let lockAcquired = false;
    let semaphoreAcquired = false;
    try {
        // Mode A: Semaphore Limit (throttles active checkout sessions)
        if (syncMode === 'Semaphore') {
            console.log(`${logPrefix} Waiting to acquire Semaphore permit...`);
            await checkoutSemaphore.acquire(userName);
            semaphoreAcquired = true;
            console.log(`${logPrefix} Semaphore permit acquired. Proceeding to booking.`);
            // Add extra latency to visually see concurrency limits
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        // Mode B: Mutex Exclusion Lock (ensures sequential seat validation and booking)
        if (syncMode === 'Mutex') {
            console.log(`${logPrefix} Waiting to acquire Mutex lock...`);
            await bookingMutex.acquire(userName);
            lockAcquired = true;
            console.log(`${logPrefix} Mutex lock acquired. Validating seats.`);
        }
        // --- CRITICAL SECTION: SEAT VALIDATION & RESEVATION ---
        // Fetch seats
        const currentSeats = await dbService_1.db.getSeats(showtimeId);
        // Artificial DB Network delay to create an asynchronous gap.
        // This allows concurrent threads to context-switch during reads, triggering race conditions without Mutex.
        await new Promise(resolve => setTimeout(resolve, 150));
        // Check if seats are available
        const unavailable = [];
        for (const row of currentSeats) {
            for (const s of row) {
                if (seats.includes(s.label) && s.isBooked) {
                    unavailable.push(s.label);
                }
            }
        }
        if (unavailable.length > 0) {
            console.log(`${logPrefix} Booking FAILED. Seats already booked: ${unavailable.join(', ')}`);
            // Cleanup Concurrency queues
            if (lockAcquired)
                bookingMutex.release();
            if (semaphoreAcquired)
                checkoutSemaphore.release(userName);
            simulationQueue.dequeue();
            return res.status(409).json({
                success: false,
                error: `Seats already reserved: ${unavailable.join(', ')}`,
                doubleBooked: true
            });
        }
        // Reserve seats in DB
        const success = await dbService_1.db.bookSeats(showtimeId, seats);
        if (!success) {
            if (lockAcquired)
                bookingMutex.release();
            if (semaphoreAcquired)
                checkoutSemaphore.release(userName);
            simulationQueue.dequeue();
            return res.status(409).json({ success: false, error: 'Booking failed. Seats reserved by another thread.' });
        }
        // Process payment and final confirmation
        const showtime = await dbService_1.db.getShowtime(showtimeId);
        const movie = await dbService_1.db.getMovie(showtime?.movieId || '');
        const theatre = await dbService_1.db.getTheatre(showtime?.theatreId || '');
        const bookingHash = generateHash(8);
        const newBooking = {
            _id: `bk_${generateHash(6)}`,
            movieId: movie?._id || '',
            movieTitle: movie?.title || '',
            theatreId: theatre?._id || '',
            theatreName: theatre?.name || '',
            showtimeId,
            showtime: `${showtime?.date} @ ${showtime?.time}`,
            seats,
            totalPrice: (showtime?.price || 0) * seats.length,
            bookingHash,
            createdAt: new Date()
        };
        // Store in global custom indexer (BookingHashMap)
        bookingHashMap.put(bookingHash, newBooking);
        // Release locks
        if (lockAcquired) {
            bookingMutex.release();
            lockAcquired = false;
            console.log(`${logPrefix} Mutex lock released.`);
        }
        if (semaphoreAcquired) {
            checkoutSemaphore.release(userName);
            semaphoreAcquired = false;
            console.log(`${logPrefix} Semaphore permit released.`);
        }
        // Dequeue from waiting simulation list
        simulationQueue.dequeue();
        console.log(`${logPrefix} Booking SUCCESSFUL. Booking Confirmation Hash: ${bookingHash}`);
        res.json({
            success: true,
            booking: newBooking
        });
    }
    catch (err) {
        // Safety lock cleanup
        if (lockAcquired)
            bookingMutex.release();
        if (semaphoreAcquired)
            checkoutSemaphore.release(userName);
        simulationQueue.dequeue();
        console.error(`${logPrefix} Server Error:`, err);
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
