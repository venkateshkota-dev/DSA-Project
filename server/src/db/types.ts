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
