import React, { useState, useEffect } from 'react';
import { ArrowLeft, Undo2, Compass, GitMerge, RotateCcw, ShieldCheck } from 'lucide-react';
import { Movie, Theatre, Showtime } from '../../../server/src/db/types';
import { Seat, SeatAllocator } from '../../../DSA/Greedy/SeatAllocator';
import { AdjacentSeatFinder } from '../../../DSA/Backtracking/AdjacentSeatFinder';
import { UndoSeatSelection } from '../../../DSA/Stack/UndoSeatSelection';
import { motion, AnimatePresence } from 'framer-motion';

interface SeatingGridProps {
  movie: Movie;
  theatre: Theatre;
  showtime: Showtime;
  onBack: () => void;
  onProceedToCheckout: (selectedSeats: string[]) => void;
}

export default function SeatingGrid({
  movie,
  theatre,
  showtime,
  onBack,
  onProceedToCheckout
}: SeatingGridProps) {
  const [grid, setGrid] = useState<Seat[][]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketCount, setTicketCount] = useState<number>(2);
  const [dsaLogs, setDsaLogs] = useState<string[]>([]);
  const [stackState, setStackState] = useState<string[]>([]);

  // Custom undo stack from shared DSA directory
  const [undoStack] = useState(() => new UndoSeatSelection<string>());

  useEffect(() => {
    // Load seat grid from Express backend
    fetch(`/api/seats?showtimeId=${showtime._id}`)
      .then(res => res.json())
      .then((data: { label: string; isBooked: boolean }[][]) => {
        // Map to Seat interface (with row/col indices)
        const mappedGrid = data.map((row, rIdx) =>
          row.map((seat, cIdx) => ({
            row: rIdx,
            col: cIdx,
            label: seat.label,
            isBooked: seat.isBooked
          }))
        );
        setGrid(mappedGrid);
      })
      .catch(err => console.error(err));
  }, [showtime._id]);

  // Handle seat clicks
  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked) return;

    const label = seat.label;
    if (selectedSeats.includes(label)) {
      // Unselect: filter out and clear stack (simplifies undo chain, or user can click clear)
      setSelectedSeats(prev => prev.filter(s => s !== label));
      // Re-synchronize stack
      const tempStack: string[] = [];
      selectedSeats.forEach(s => { if (s !== label) tempStack.push(s); });
      undoStack.clear();
      tempStack.forEach(s => undoStack.push(s));
      setStackState(undoStack.getStack());
    } else {
      // Select: push to undo stack
      setSelectedSeats(prev => [...prev, label]);
      undoStack.push(label);
      setStackState(undoStack.getStack());
      setDsaLogs(prev => [`[Stack Push]: Added ${label} to selection history.`]);
    }
  };

  // Undo button handler using our stack structure
  const handleUndo = () => {
    if (undoStack.isEmpty()) {
      setDsaLogs(['[Stack Error]: Undo Stack is empty. Nothing to undo.']);
      return;
    }

    const popped = undoStack.pop();
    if (popped) {
      setSelectedSeats(prev => prev.filter(s => s !== popped));
      setStackState(undoStack.getStack());
      setDsaLogs([`[Stack Pop]: Undone seat selection for "${popped}".`]);
    }
  };

  const handleClear = () => {
    setSelectedSeats([]);
    undoStack.clear();
    setStackState([]);
    setDsaLogs(['[Stack Reset]: Selection history cleared.']);
  };

  // Run Greedy seat allocation
  const handleGreedyAllocate = () => {
    if (ticketCount <= 0) return;
    handleClear();

    const resultSeats = SeatAllocator.allocate(grid, ticketCount);

    // Apply selection
    setSelectedSeats(resultSeats);
    resultSeats.forEach(s => undoStack.push(s));
    setStackState(undoStack.getStack());
    setDsaLogs([
      "Step 1: Find theatre center",
      "↓",
      "Step 2: Rank seats by distance",
      "↓",
      "Step 3: Ignore booked seats",
      "↓",
      "Step 4: Recommend optimal seats: " + resultSeats.join(', ')
    ]);
  };

  // Run Backtracking seat finder
  const handleBacktrackingAllocate = () => {
    if (ticketCount <= 0) return;
    handleClear();

    const resultSeats = AdjacentSeatFinder.find(grid, ticketCount);

    // Generate user-friendly backtracking trace
    const logs: string[] = [];
    const rowsChecked = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const targetRow = resultSeats[0] ? resultSeats[0][0] : 'C';
    const targetIdx = rowsChecked.indexOf(targetRow);

    for (let i = 0; i <= targetIdx; i++) {
      if (i < targetIdx) {
        logs.push(`Trying Row ${rowsChecked[i]}... ×`);
      } else {
        logs.push(`Trying Row ${rowsChecked[i]}... ✓`);
      }
    }
    logs.push("Best arrangement found: " + resultSeats.join(', '));

    setSelectedSeats(resultSeats);
    resultSeats.forEach(s => undoStack.push(s));
    setStackState(undoStack.getStack());
    setDsaLogs(logs);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to showtimes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Seating Grid Canvas */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="mb-4 text-center w-full">
            <h2 className="text-2xl font-extrabold text-white">CHOOSE YOUR SEATS</h2>
            <p className="text-slate-400 text-xs mt-1">₹{showtime.price} per ticket • VIP Screen</p>
          </div>

          {/* Screen boundary */}
          <div className="w-4/5 h-2 bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 rounded-full shadow-lg opacity-80 glow-teal my-6 relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] text-teal-400 font-bold uppercase tracking-[0.3em]">
              SCREEN THIS WAY
            </div>
          </div>

          {/* Seating Grid */}
          <div className="flex flex-col gap-3.5 my-8 w-full items-center">
            {grid.map((row, rIdx) => (
              <div key={`row_${rIdx}`} className="flex items-center gap-3">
                {/* Row label left */}
                <span className="w-5 text-right font-bold text-slate-500 text-xs mr-2">
                  {String.fromCharCode(65 + rIdx)}
                </span>

                {/* Seats */}
                <div className="flex gap-2">
                  {row.map(seat => {
                    const isSelected = selectedSeats.includes(seat.label);
                    return (
                      <button
                        key={seat.label}
                        disabled={seat.isBooked}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${seat.isBooked
                            ? 'bg-slate-800/80 border-slate-900 text-slate-600 cursor-not-allowed'
                            : isSelected
                              ? 'bg-gold-500 border-gold-400 text-cinema-black glow-gold'
                              : 'bg-cinema-card border-cinema-border text-slate-400 hover:border-slate-500'
                          }`}
                      >
                        {seat.col + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Row label right */}
                <span className="w-5 text-left font-bold text-slate-500 text-xs ml-2">
                  {String.fromCharCode(65 + rIdx)}
                </span>
              </div>
            ))}
          </div>

          {/* Seating Legend */}
          <div className="flex items-center gap-6 text-xs text-slate-400 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cinema-card border border-cinema-border" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gold-500 border border-gold-400" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-800 border border-slate-900" />
              <span>Booked</span>
            </div>
          </div>
        </div>

        {/* Right Column: Allocation & Undo Controls */}
        <div className="flex flex-col gap-6">
          {/* Automatic Allocators panel */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-4">Smart Seat Recommender</h3>

            {/* Ticket Counter */}
            <div className="flex items-center justify-between bg-cinema-black border border-cinema-border rounded-xl p-3.5 mb-4">
              <span className="text-xs text-slate-400 font-semibold">Seat Count:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTicketCount(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 font-extrabold text-sm flex items-center justify-center text-slate-300"
                >
                  -
                </button>
                <span className="font-extrabold text-white text-base w-6 text-center">{ticketCount}</span>
                <button
                  onClick={() => setTicketCount(prev => Math.min(8, prev + 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 font-extrabold text-sm flex items-center justify-center text-slate-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Recommendation Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleGreedyAllocate}
                className="flex items-center justify-center gap-1.5 bg-cinema-black hover:bg-slate-950 border border-gold-500/30 hover:border-gold-400 text-[11px] font-bold text-gold-400 py-3.5 rounded-xl transition-all"
              >
                <Compass className="w-3.5 h-3.5" />
                Greedy Center
              </button>
              <button
                onClick={handleBacktrackingAllocate}
                className="flex items-center justify-center gap-1.5 bg-cinema-black hover:bg-slate-950 border border-teal-500/30 hover:border-teal-400 text-[11px] font-bold text-teal-400 py-3.5 rounded-xl transition-all"
              >
                <GitMerge className="w-3.5 h-3.5" />
                Backtrack Cluster
              </button>
            </div>

            {/* Undo Stack Visual */}
            <div className="border-t border-cinema-border pt-4 mt-4">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selection History Stack</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={stackState.length === 0}
                    className="flex items-center gap-1 text-[10px] font-bold text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-md disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <Undo2 className="w-3 h-3" />
                    Undo
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={selectedSeats.length === 0}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-cinema-border px-2.5 py-1 rounded-md disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear
                  </button>
                </div>
              </div>

              {stackState.length === 0 ? (
                <p className="text-[10px] text-slate-600 font-mono italic">Stack is currently empty.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-lg border border-cinema-border max-h-[80px] overflow-y-auto">
                  <AnimatePresence>
                    {stackState.map((seat, index) => (
                      <motion.span
                        key={`${seat}-${index}`}
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-[9px] font-mono font-bold bg-slate-900 border border-cinema-border px-2 py-0.5 rounded text-gold-400 glow-gold"
                      >
                        [{index}]: {seat}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Allocation Logs console */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-5 max-h-[220px] overflow-y-auto">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Recommendation Steps Trace</h4>
            <div className="flex flex-col gap-1.5 font-mono text-[9px] text-slate-400">
              {dsaLogs.map((log, idx) => (
                <div key={idx} className="border-l-2 border-gold-500/40 pl-2 leading-relaxed">
                  {log}
                </div>
              ))}
              {dsaLogs.length === 0 && (
                <span className="text-slate-600 italic">Select seats or trigger recommendation filters to record algorithm trace logs.</span>
              )}
            </div>
          </div>

          {/* Checkout proceeds */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Selected Seats:</span>
              <span className="font-extrabold text-white">{selectedSeats.join(', ') || 'None'}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-cinema-border pt-3">
              <span className="text-slate-400">Subtotal Price:</span>
              <span className="font-extrabold text-teal-400 text-base">₹{selectedSeats.length * showtime.price}</span>
            </div>
            <button
              onClick={() => onProceedToCheckout(selectedSeats)}
              disabled={selectedSeats.length === 0}
              className={`w-full py-4 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${selectedSeats.length > 0
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-cinema-black shadow-lg glow-gold'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
