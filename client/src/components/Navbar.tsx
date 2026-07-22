import React from 'react';
import { Film, Ticket } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const isBookingFlow = ['splash', 'home', 'movie', 'theatres', 'shows', 'seating', 'checkout', 'confirmation'].includes(currentPage);

  return (
    <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-cinema-border glow-gold">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('splash')}>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-gold-500 to-teal-400 flex items-center justify-center font-bold text-cinema-black text-xl shadow-lg">
          C
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-slate-100">
            CINE<span className="text-teal-400 font-bold">BOOK</span>
          </h1>
          <p className="text-[10px] text-teal-400 font-semibold tracking-widest uppercase">Cinema Ticket Booking</p>
        </div>
      </div>

      <nav className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('home')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
            isBookingFlow
              ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-cinema-black shadow-md glow-gold'
              : 'text-slate-400 hover:text-gold-400 hover:bg-white/5'
          }`}
        >
          <Film className="w-4 h-4" />
          Movie Tickets
        </button>

        <button
          onClick={() => onNavigate('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
            currentPage === 'history'
              ? 'bg-teal-400 text-cinema-black shadow-md glow-teal'
              : 'text-slate-400 hover:text-teal-400 hover:bg-white/5'
          }`}
        >
          <Ticket className="w-4 h-4" />
          Booking History
        </button>
      </nav>
    </header>
  );
}
