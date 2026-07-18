import React, { useState } from 'react';
import { ArrowLeft, Star, Clock, Ticket, Award } from 'lucide-react';
import { Movie } from '../../../server/src/db/dbService';

interface MovieDetailProps {
  movie: Movie;
  onBack: () => void;
  onSelectDate: (date: string) => void;
}

export default function MovieDetail({ movie, onBack, onSelectDate }: MovieDetailProps) {
  const [selectedDate, setSelectedDate] = useState('2026-07-17');

  const dates = [
    { label: 'Fri, 17 Jul', value: '2026-07-17' },
    { label: 'Sat, 18 Jul', value: '2026-07-18' }
  ];

  const handleSubmit = () => {
    onSelectDate(selectedDate);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-300 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Movies
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Poster */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-cinema-border h-[450px] relative bg-slate-900">
          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-transparent to-transparent" />
        </div>

        {/* Details & Scheduler */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <span className="text-teal-400 text-xs font-bold tracking-widest uppercase bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-md">
              {movie.genre.split(',')[0]}
            </span>
            <h2 className="text-4xl font-extrabold text-white mt-4 tracking-wide">{movie.title}</h2>
            <p className="text-slate-400 text-xs mt-2 italic">{movie.genre}</p>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-gold-400 fill-gold-400" />
                <span className="font-extrabold text-white">{movie.rating.toFixed(1)}</span>
                <span className="text-slate-500 text-xs">/ 10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-slate-200 font-semibold">{movie.duration} mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-slate-200 font-semibold">Popularity #{movie.popularity}</span>
              </div>
            </div>

            <p className="text-slate-400 text-sm mt-8 leading-relaxed font-light">
              Experience the cinematic brilliance of {movie.title}. Book your tickets now and select the 
              optimal theater routes and seating alignments powered by our advanced graph and heap scheduling logic.
            </p>
          </div>

          {/* Showtime Picker Card */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-6 mt-10">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-gold-400" />
              Select Booking Date
            </h3>

            {/* Date Select */}
            <div className="mb-8">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-2.5">
                Select Date:
              </span>
              <div className="flex gap-3">
                {dates.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDate(d.value)}
                    className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all duration-300 ${
                      selectedDate === d.value
                        ? 'bg-gold-500/10 border-gold-400 text-gold-400 glow-gold'
                        : 'bg-cinema-black border-cinema-border text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Proceed */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all duration-300 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-cinema-black shadow-lg glow-gold"
            >
              Choose Theater Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
