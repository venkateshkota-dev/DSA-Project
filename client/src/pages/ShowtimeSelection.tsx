import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, History, Search } from 'lucide-react';
import { Movie, Theatre, Showtime } from '../../../server/src/db/dbService';
import { BinarySearch } from '../../../DSA/Searching/BinarySearch';

interface ShowtimeSelectionProps {
  movie: Movie;
  theatre: Theatre;
  selectedDate: string;
  onBack: () => void;
  onSelectShowtime: (showtime: Showtime) => void;
}

export default function ShowtimeSelection({
  movie,
  theatre,
  selectedDate,
  onBack,
  onSelectShowtime
}: ShowtimeSelectionProps) {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [activeShowtime, setActiveShowtime] = useState<Showtime | null>(null);
  const [binarySearchLogs, setBinarySearchLogs] = useState<string[]>([]);
  const [searchTarget, setSearchTarget] = useState<string>('');

  useEffect(() => {
    // Load showtimes for selected movie
    fetch(`/api/showtimes?movieId=${movie._id}`)
      .then(res => res.json())
      .then((data: Showtime[]) => {
        // Filter by date and theatre
        const filtered = data.filter(s => s.theatreId === theatre._id && s.date === selectedDate);

        // Sort showtimes by timing (ascending) to guarantee binary search works correctly
        const sorted = filtered.sort((a, b) => a.time.localeCompare(b.time));
        setShowtimes(sorted);
      })
      .catch(err => console.error(err));
  }, [movie._id, theatre._id, selectedDate]);

  // Run Binary Search on the sorted showtimes list
  const handleSelectShowtime = (showtime: Showtime) => {
    setActiveShowtime(showtime);
    const logs: string[] = [];

    // Binary search target
    const targetTime = showtime.time;

    // Custom binary search generator trace
    const gen = BinarySearch.runGenerator(showtimes, showtime, (a, b) => a.time.localeCompare(b.time));

    let step = gen.next();
    while (!step.done) {
      if (step.value.explanation) {
        logs.push(step.value.explanation);
      }
      step = gen.next();
    }

    setBinarySearchLogs(logs);

    // Short timeout to let the user see the log, then proceed
    setTimeout(() => {
      onSelectShowtime(showtime);
    }, 1200);
  };

  // Manual search interface to verify custom showtime
  const handleManualSearch = () => {
    if (!searchTarget.trim()) return;
    const logs: string[] = [];

    // Find matching time
    const dummyShowtime = { time: searchTarget } as Showtime;
    const gen = BinarySearch.runGenerator(showtimes, dummyShowtime, (a, b) => a.time.localeCompare(b.time));

    let step = gen.next();
    let foundIdx = -1;
    while (!step.done) {
      logs.push(step.value.explanation);
      if (step.value.foundIndex !== -1) {
        foundIdx = step.value.foundIndex;
      }
      step = gen.next();
    }
    const finalVal = (step as IteratorReturnResult<number>).value;
    if (finalVal !== -1) foundIdx = finalVal;

    if (foundIdx !== -1) {
      logs.push(`SUCCESS: Showtime ${searchTarget} found at sorted index ${foundIdx}.`);
      setActiveShowtime(showtimes[foundIdx]);
    } else {
      logs.push(`FAILED: Showtime ${searchTarget} not found in schedule.`);
    }

    setBinarySearchLogs(logs);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-300 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Theatre selection
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Schedule pick */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cinema Scheduler</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">AVAILABLE SHOWTIMES</h2>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Showtimes for <strong className="text-gold-400">{movie.title}</strong> at <strong className="text-teal-400">{theatre.name}</strong> on {selectedDate}.
            </p>
          </div>

          {showtimes.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-cinema-border rounded-xl">
              <p className="text-slate-500 text-sm">No shows scheduled for this date combination.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
              {showtimes.map((st) => {
                const isSelected = activeShowtime?._id === st._id;
                return (
                  <button
                    key={st._id}
                    onClick={() => handleSelectShowtime(st)}
                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 ${isSelected
                        ? 'bg-teal-500/10 border-teal-400 text-teal-400 glow-teal scale-105'
                        : 'bg-cinema-card border-cinema-border text-slate-300 hover:border-slate-700'
                      }`}
                  >
                    <Clock className={`w-5 h-5 ${isSelected ? 'text-teal-400 animate-spin' : 'text-slate-500'}`} />
                    <span className="font-extrabold text-base">{st.time}</span>
                    <span className="text-[11px] text-slate-500">₹{st.price}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Manual Query Input */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-6 mt-10">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Verify Showtime Schedule</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type timing (e.g. 13:30)..."
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                className="flex-1 bg-cinema-black border border-cinema-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-400"
              />
              <button
                onClick={handleManualSearch}
                className="bg-slate-800 hover:bg-slate-700 border border-cinema-border text-xs px-4 py-2 rounded-xl text-slate-200 transition-colors"
              >
                Binary Search
              </button>
            </div>
          </div>
        </div>

        {/* Right Search logs */}
        <div className="glass-panel border border-cinema-border rounded-2xl p-6 h-fit">
          <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-gold-400" />
            Binary Search Trace Logs
          </h3>

          {binarySearchLogs.length === 0 ? (
            <p className="text-slate-500 text-xs font-light leading-relaxed">
              Click a showtime block or type in the verification input to view the binary search index comparison log.
            </p>
          ) : (
            <div className="flex flex-col gap-2 font-mono text-[10px] bg-slate-950 p-4 rounded-xl max-h-[300px] overflow-y-auto leading-relaxed border border-cinema-border">
              {binarySearchLogs.map((log, idx) => (
                <div key={idx} className="text-slate-400 border-l border-teal-500/20 pl-2 py-0.5">
                  <span className="text-teal-400">Step {idx + 1}:</span> {log}
                </div>
              ))}
            </div>
          )}

          <div className="text-[10px] text-slate-500 font-light mt-6 leading-relaxed bg-slate-900/50 p-3 rounded border border-cinema-border">
            💡 <strong>Algorithmic Context:</strong> Showtime lists are pre-sorted in ascending chronological order, enabling logarithmic lookup. Rather than scanning sequentially, the system halves the search range at each step.
          </div>
        </div>
      </div>
    </div>
  );
}
