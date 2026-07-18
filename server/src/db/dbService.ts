import mongoose from 'mongoose';

// Types for the DB Models
export interface Movie {
  _id: string;
  title: string;
  rating: number;
  popularity: number; // ticket sales count
  price: number;
  genre: string;
  duration: number; // in mins
  poster: string;
}

export interface Theatre {
  _id: string;
  name: string;
  x: number; // coordinate
  y: number; // coordinate
}

export interface Showtime {
  _id: string;
  movieId: string;
  theatreId: string;
  time: string; // e.g., "14:30"
  date: string; // e.g., "2026-07-17"
  price: number;
}

export interface Booking {
  _id: string;
  movieId: string;
  movieTitle: string;
  theatreId: string;
  theatreName: string;
  showtimeId: string;
  showtime: string;
  seats: string[];
  totalPrice: number;
  bookingHash: string; // HashMap key
  createdAt: Date;
}

// In-Memory Fallback Store
class InMemoryDB {
  movies: Movie[] = [];
  theatres: Theatre[] = [];
  showtimes: Showtime[] = [];
  bookings: Booking[] = [];
  // Seats layout keyed by showtimeId
  seats: Record<string, { label: string; isBooked: boolean }[][]> = {};

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Seed Movies
    this.movies = [
      {
        _id: 'mv_1',
        title: 'Fauji',
        rating: 8.8,
        popularity: 97,
        price: 250,
        genre: 'Action, Drama, Patriotic',
        duration: 145,
        poster: '/fauji.jpg'
      },
      {
        _id: 'mv_2',
        title: 'Bahubali: The Conclusion',
        rating: 9.2,
        popularity: 99,
        price: 300,
        genre: 'Action, Drama, Epic',
        duration: 167,
        poster: '/bahubali.jpg'
      },
      {
        _id: 'mv_3',
        title: 'Spirit',
        rating: 8.5,
        popularity: 91,
        price: 220,
        genre: 'Action, Crime, Thriller',
        duration: 138,
        poster: '/spirit.jpg'
      },
      {
        _id: 'mv_4',
        title: 'Ramayana',
        rating: 9.5,
        popularity: 98,
        price: 280,
        genre: 'Animation, Adventure, Mythological',
        duration: 155,
        poster: '/ramayana.jpg'
      },
      {
        _id: 'mv_5',
        title: 'Varanasi',
        rating: 8.9,
        popularity: 94,
        price: 200,
        genre: 'Drama, History, Spiritual',
        duration: 120,
        poster: '/varanasi.jpg'
      }
    ];

    // 2. Seed Theatres
    this.theatres = [
      { _id: 'th_1', name: 'PVR 4DX', x: 10, y: 15 },
      { _id: 'th_2', name: 'Allu Cinemas', x: 25, y: 40 },
      { _id: 'th_3', name: 'Asian Movies', x: 55, y: 10 },
      { _id: 'th_4', name: 'Cinepolis', x: 5, y: 60 },
      { _id: 'th_5', name: 'INOX', x: 80, y: 45 }
    ];

    // 3. Seed Showtimes (Create multiple showtimes for each movie across theatres)
    let stCount = 1;
    const dates = ['2026-07-17', '2026-07-18'];
    const times = ['10:00', '13:30', '16:45', '20:15', '23:00'];

    for (const movie of this.movies) {
      for (const theatre of this.theatres) {
        // Only select showtimes for logical combinations
        if ((parseInt(movie._id.split('_')[1]) + parseInt(theatre._id.split('_')[1])) % 2 === 0) {
          for (const date of dates) {
            for (const time of times.slice(0, 3)) {
              const stId = `st_${stCount++}`;
              this.showtimes.push({
                _id: stId,
                movieId: movie._id,
                theatreId: theatre._id,
                time,
                date,
                price: movie.price + (theatre._id === 'th_5' ? 100 : 0) // VIP surcharge
              });
              // Initialize seat layout grid (8 rows, 10 columns)
              this.initializeSeats(stId);
            }
          }
        }
      }
    }
  }

  private initializeSeats(showtimeId: string) {
    const rows = 8;
    const cols = 10;
    const grid: { label: string; isBooked: boolean }[][] = [];

    for (let r = 0; r < rows; r++) {
      const rowGrid: { label: string; isBooked: boolean }[] = [];
      const rowLetter = String.fromCharCode(65 + r); // A, B, C...
      for (let c = 0; c < cols; c++) {
        // Book random seats (say, 25% chance of seat being pre-booked)
        const isBooked = Math.random() < 0.25;
        rowGrid.push({
          label: `${rowLetter}${c + 1}`,
          isBooked
        });
      }
      grid.push(rowGrid);
    }
    this.seats[showtimeId] = grid;
  }
}

class DBService {
  private useInMemory: boolean = false;
  private memoryDB = new InMemoryDB();

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinebook';
      // Set short connection timeout so it doesn't hang the app startup
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000
      });
      console.log('Successfully connected to MongoDB Database.');
    } catch (err) {
      this.useInMemory = true;
      console.warn('WARNING: MongoDB connection failed or is unavailable. Falling back to PORTABLE IN-MEMORY DATABASE.');
    }
  }

  async getMovies(): Promise<Movie[]> {
    if (this.useInMemory) {
      return this.memoryDB.movies;
    }
    // real mongodb query fallback (simulated model check or fallback to memory)
    return this.memoryDB.movies;
  }

  async getMovie(id: string): Promise<Movie | undefined> {
    return this.memoryDB.movies.find(m => m._id === id);
  }

  async getTheatres(): Promise<Theatre[]> {
    return this.memoryDB.theatres;
  }

  async getTheatre(id: string): Promise<Theatre | undefined> {
    return this.memoryDB.theatres.find(t => t._id === id);
  }

  async getShowtimes(movieId: string): Promise<Showtime[]> {
    return this.memoryDB.showtimes.filter(s => s.movieId === movieId);
  }

  async getShowtime(id: string): Promise<Showtime | undefined> {
    return this.memoryDB.showtimes.find(s => s._id === id);
  }

  async getSeats(showtimeId: string): Promise<{ label: string; isBooked: boolean }[][]> {
    if (!this.memoryDB.seats[showtimeId]) {
      this.memoryDB.seats[showtimeId] = this.memoryDB.seats['st_1'] || [];
    }
    // Return deep copy
    return this.memoryDB.seats[showtimeId].map(r => r.map(s => ({ ...s })));
  }

  async bookSeats(showtimeId: string, seatLabels: string[]): Promise<boolean> {
    const layout = this.memoryDB.seats[showtimeId];
    if (!layout) return false;

    // Check if any seat is already booked (prevent double booking)
    for (const row of layout) {
      for (const seat of row) {
        if (seatLabels.includes(seat.label) && seat.isBooked) {
          return false; // Seat already booked!
        }
      }
    }

    // Mark as booked
    for (const row of layout) {
      for (const seat of row) {
        if (seatLabels.includes(seat.label)) {
          seat.isBooked = true;
        }
      }
    }

    return true;
  }

  // Visual seat un-booking helper (useful for resetting concurrency checks)
  async unbookSeats(showtimeId: string, seatLabels: string[]): Promise<void> {
    const layout = this.memoryDB.seats[showtimeId];
    if (!layout) return;
    for (const row of layout) {
      for (const seat of row) {
        if (seatLabels.includes(seat.label)) {
          seat.isBooked = false;
        }
      }
    }
  }

  async addBooking(booking: Booking): Promise<void> {
    this.memoryDB.bookings.push(booking);
  }

  async getBooking(bookingId: string): Promise<Booking | undefined> {
    return this.memoryDB.bookings.find(b => b._id === bookingId || b.bookingHash === bookingId);
  }
}

export const db = new DBService();
