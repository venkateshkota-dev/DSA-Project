import React, { useState, useEffect } from 'react';
import { Ticket, Search, Calendar, MapPin, Clock, Hash, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Booking } from '../../../server/src/db/types';

interface BookingHistoryProps {
  onNavigate: (page: any) => void;
}

export default function BookingHistory({ onNavigate }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(b => 
    b.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.bookingHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.theatreName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-md">
              Order History
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-wide mt-3 flex items-center gap-3">
            <Ticket className="w-8 h-8 text-gold-400" />
            BOOKING HISTORY
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            View and manage all your confirmed cinema ticket reservations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cinema-border bg-cinema-card hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all duration-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-cinema-black font-extrabold text-xs tracking-wider uppercase shadow-md glow-gold transition-all duration-300"
          >
            Book New Ticket
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by movie, theatre, or confirmation ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-cinema-card border border-cinema-border rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-all duration-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-20 border border-dashed border-cinema-border rounded-2xl">
          <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading booking history...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-cinema-border rounded-2xl bg-cinema-card/30">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">No Bookings Found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No reservations match "${searchQuery}". Try clearing your search filter.`
              : "You haven't made any ticket reservations yet. Browse movies to make your first booking!"}
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-cinema-black font-extrabold text-xs uppercase tracking-wider glow-gold hover:from-gold-400 hover:to-gold-500 transition-all"
          >
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => (
            <div
              key={b._id}
              className="glass-panel border border-cinema-border hover:border-gold-500/30 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-cinema-border/50 bg-gradient-to-r from-slate-900/80 via-cinema-card to-slate-900/80 flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-400 uppercase tracking-widest bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-md mb-2">
                    <CheckCircle2 className="w-3 h-3 text-teal-400" /> Confirmed
                  </span>
                  <h3 className="text-xl font-extrabold text-white tracking-wide line-clamp-1">
                    {b.movieTitle}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold-400" />
                    {b.theatreName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block font-mono">Total Paid</span>
                  <span className="text-xl font-black text-teal-400">₹{b.totalPrice}</span>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 border border-cinema-border/60 rounded-xl p-3">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block mb-1">
                      Showtime & Date
                    </span>
                    <div className="text-slate-200 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold-400" />
                      {b.showtime}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-cinema-border/60 rounded-xl p-3">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block mb-1">
                      Reserved Seats ({b.seats.length})
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {b.seats.map((seat) => (
                        <span
                          key={seat}
                          className="bg-gold-500/10 border border-gold-400/40 text-gold-400 font-extrabold px-2 py-0.5 rounded text-[11px]"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Hash Code */}
                <div className="pt-3 border-t border-cinema-border/40 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Confirmation Code</span>
                      <span className="text-xs font-bold text-slate-200 tracking-wider">
                        {b.bookingHash}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-500">
                    {new Date(b.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
