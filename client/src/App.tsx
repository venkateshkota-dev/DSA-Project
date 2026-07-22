import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Splash from './pages/Splash';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import TheatreSelection from './pages/TheatreSelection';
import ShowtimeSelection from './pages/ShowtimeSelection';
import SeatingGrid from './pages/SeatingGrid';
import CheckoutSimulation from './pages/CheckoutSimulation';
import Confirmation from './pages/Confirmation';
import BookingHistory from './pages/BookingHistory';
import { Movie, Theatre, Showtime, Booking } from '../../server/src/db/types';

type Page =
  | 'splash'
  | 'home'
  | 'movie'
  | 'theatres'
  | 'shows'
  | 'seating'
  | 'checkout'
  | 'confirmation'
  | 'history';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('splash');

  // Shared Booking Flow State
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-17');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleEnterCinema = () => {
    setCurrentPage('home');
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentPage('movie');
  };

  const handleSelectShowtime = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentPage('theatres'); // Go to graph-based theater selection route
  };

  const handleSelectTheatre = (theatre: Theatre) => {
    setSelectedTheatre(theatre);
    setCurrentPage('shows'); // Pick a showtime slot using Binary Search
  };

  const handleConfirmShowtime = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setCurrentPage('seating'); // Select seats with Greedy Allocator / Stack History
  };

  const handleProceedToCheckout = (seats: string[]) => {
    setSelectedSeats(seats);
    setCurrentPage('checkout'); // Concurrency simulation room
  };

  const handleConfirmBooking = (bookingDetails: Booking) => {
    setConfirmedBooking(bookingDetails);
    setCurrentPage('confirmation'); // HashMap validation gate
  };

  const handleResetToHome = () => {
    setSelectedMovie(null);
    setSelectedTheatre(null);
    setSelectedTime('');
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setConfirmedBooking(null);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-cinema-black text-slate-100 flex flex-col justify-between">
      {/* Conditionally render navbar (omit on Splash screen) */}
      {currentPage !== 'splash' && (
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      )}

      <main className="flex-1 w-full">
        {currentPage === 'splash' && <Splash onEnter={handleEnterCinema} />}
        {currentPage === 'home' && <Home onSelectMovie={handleSelectMovie} />}

        {currentPage === 'movie' && selectedMovie && (
          <MovieDetail
            movie={selectedMovie}
            onBack={() => handleNavigate('home')}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setCurrentPage('theatres');
            }}
          />
        )}

        {currentPage === 'theatres' && selectedMovie && (
          <TheatreSelection
            movie={selectedMovie}
            selectedDate={selectedDate}
            onBack={() => setCurrentPage('movie')}
            onSelectShowtime={(theatre, showtime) => {
              setSelectedTheatre(theatre);
              setSelectedShowtime(showtime);
              setCurrentPage('seating');
            }}
          />
        )}

        {currentPage === 'seating' && selectedMovie && selectedTheatre && selectedShowtime && (
          <SeatingGrid
            movie={selectedMovie}
            theatre={selectedTheatre}
            showtime={selectedShowtime}
            onBack={() => setCurrentPage('theatres')}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}

        {currentPage === 'checkout' && selectedMovie && selectedTheatre && selectedShowtime && (
          <CheckoutSimulation
            movie={selectedMovie}
            theatre={selectedTheatre}
            showtime={selectedShowtime}
            selectedSeats={selectedSeats}
            onBack={() => setCurrentPage('seating')}
            onConfirmBooking={handleConfirmBooking}
          />
        )}

        {currentPage === 'confirmation' && selectedMovie && selectedTheatre && selectedShowtime && confirmedBooking && (
          <Confirmation
            movie={selectedMovie}
            theatre={selectedTheatre}
            showtime={selectedShowtime}
            booking={confirmedBooking}
            onHome={handleResetToHome}
          />
        )}

        {currentPage === 'history' && <BookingHistory onNavigate={handleNavigate} />}
      </main>
    </div>
  );
}
