import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, Star, Clock, Ticket, Check, ChevronDown, ChevronUp, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Movie, Theatre, Showtime } from '../../../server/src/db/dbService';
import { Graph } from '../../../DSA/Graphs/Graph';
import { Dijkstra } from '../../../DSA/Graphs/Dijkstra';
import { AStar } from '../../../DSA/Graphs/AStar';
import { BinarySearch } from '../../../DSA/Searching/BinarySearch';

interface TheatreSelectionProps {
  movie: Movie;
  selectedDate: string;
  onBack: () => void;
  onSelectShowtime: (theatre: Theatre, showtime: Showtime) => void;
}

const THEATRE_METRICS: Record<string, { rating: number; type: string; facilities: string[]; seats: number }> = {
  th_1: { rating: 4.2, type: 'Dolby Atmos', facilities: ['Parking', 'Food Court'], seats: 120 },
  th_2: { rating: 4.8, type: 'IMAX 3D', facilities: ['Parking', 'Food Court', 'Wheelchair Access'], seats: 248 },
  th_3: { rating: 4.0, type: 'Drive-In Cinema', facilities: ['Parking', 'Outdoor Dining'], seats: 160 },
  th_4: { rating: 4.1, type: 'Retro Lounge', facilities: ['Parking', 'Vintage Bar'], seats: 88 },
  th_5: { rating: 4.9, type: 'Gold VIP Premium', facilities: ['Valet Parking', 'Fine Dining', 'Wheelchair Access', 'Recliners'], seats: 45 },
  th_6: { rating: 4.5, type: 'Dolby Cinema Multiplex', facilities: ['Parking', 'Food Court', 'Arcade Zone', 'Wheelchair Access'], seats: 194 },
};

const graphNodes = [
  { id: 'U', name: 'Your Location', x: 10, y: 40 },
  { id: 'th_1', name: 'PVR 4DX', x: 30, y: 20 },
  { id: 'th_2', name: 'Allu Cinemas', x: 50, y: 45 },
  { id: 'th_3', name: 'Asian Movies', x: 75, y: 20 },
  { id: 'th_4', name: 'Cinepolis', x: 30, y: 75 },
  { id: 'th_5', name: 'INOX', x: 70, y: 70 }
];

export default function TheatreSelection({
  movie,
  selectedDate,
  onBack,
  onSelectShowtime
}: TheatreSelectionProps) {
  const [sortedTheatres, setSortedTheatres] = useState<any[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedTheatreId, setSelectedTheatreId] = useState<string>('');
  const [isAlgoExpanded, setIsAlgoExpanded] = useState<boolean>(false);
  const [algorithmDetails, setAlgorithmDetails] = useState<any>({
    pathfinding: null,
    binarySearch: null,
  });

  useEffect(() => {
    // 1. Build graph structure from DSA files
    const graph = new Graph();
    graphNodes.forEach(node => graph.addVertex(node));
    graph.addEdge('U', 'th_1', 1.2);
    graph.addEdge('U', 'th_2', 3.4);
    graph.addEdge('U', 'th_4', 2.3);
    graph.addEdge('th_1', 'th_2', 1.8);
    graph.addEdge('th_1', 'th_3', 4.5);
    graph.addEdge('th_2', 'th_3', 2.1);
    graph.addEdge('th_2', 'th_5', 3.0);
    graph.addEdge('th_4', 'th_2', 2.2);
    graph.addEdge('th_4', 'th_5', 2.8);
    graph.addEdge('th_3', 'th_5', 3.1);

    // 2. Fetch theatres from backend and run Dijkstra/A* internally
    Promise.all([
      fetch('/api/theatres').then(res => res.json()),
      fetch(`/api/showtimes?movieId=${movie._id}`).then(res => res.json())
    ])
      .then(([theatresData, showtimesData]: [Theatre[], Showtime[]]) => {
        // Filter showtimes by selected date
        const filteredShowtimes = showtimesData.filter(s => s.date === selectedDate);
        setShowtimes(filteredShowtimes);

        // Run pathfinding internally for each theatre
        const enrichedTheatres = theatresData.map(theatre => {
          const metrics = THEATRE_METRICS[theatre._id] || { rating: 4.0, type: 'Digital 2D', facilities: ['Parking'], seats: 100 };

          // Run Dijkstra generator
          const dStart = performance.now();
          const dGen = Dijkstra.runGenerator(graph, 'U', theatre._id);
          let dSteps = 0;
          let dStepVal = dGen.next();
          while (!dStepVal.done) {
            dSteps++;
            dStepVal = dGen.next();
          }
          const dTime = performance.now() - dStart;
          const dPath = dStepVal.value.path;
          const dDist = dStepVal.value.distance;

          // Run A* generator
          const aStart = performance.now();
          const aGen = AStar.runGenerator(graph, 'U', theatre._id);
          let aSteps = 0;
          let aStepVal = aGen.next();
          while (!aStepVal.done) {
            aSteps++;
            aStepVal = aGen.next();
          }
          const aTime = performance.now() - aStart;
          const aPath = aStepVal.value.path;
          const aDist = aStepVal.value.distance;

          return {
            ...theatre,
            distance: Number(dDist.toFixed(1)),
            path: dPath,
            dijkstraSteps: dSteps,
            dijkstraTimeMs: dTime,
            aStarSteps: aSteps,
            aStarTimeMs: aTime,
            rating: metrics.rating,
            type: metrics.type,
            facilities: metrics.facilities,
            seats: metrics.seats,
            travelTime: Math.round(dDist * 3.5 + 4), // travel speed ratio + traffic offset
          };
        });

        // Sort by distance ascending
        enrichedTheatres.sort((a, b) => a.distance - b.distance);
        setSortedTheatres(enrichedTheatres);

        // Set default pathfinding details using the closest theatre
        if (enrichedTheatres.length > 0) {
          const closest = enrichedTheatres[0];
          setAlgorithmDetails({
            pathfinding: {
              name: closest.name,
              algorithm: 'Dijkstra',
              visitedNodes: closest.dijkstraSteps,
              executionTime: closest.dijkstraTimeMs,
              distance: closest.distance,
              timeComplexity: 'O((V+E) log V)',
              path: closest.path.join(' → '),
            },
            binarySearch: null,
          });
        }
      })
      .catch(err => console.error('Error fetching/processing theatres:', err));
  }, [movie._id, selectedDate]);

  const handleTimeClick = (theatre: any, targetShowtime: Showtime) => {
    setSelectedTheatreId(theatre._id);
    setSelectedTimeSlot(st => targetShowtime._id);

    // Get sorted showtimes for this specific theatre
    const theatreShowtimes = showtimes
      .filter(s => s.theatreId === theatre._id)
      .sort((a, b) => a.time.localeCompare(b.time));

    const binarySearchLogs: string[] = [];
    const searchStart = performance.now();

    // Run binary search generator to show step-by-step trace logs internally
    const gen = BinarySearch.runGenerator(theatreShowtimes, targetShowtime, (a, b) => a.time.localeCompare(b.time));
    let step = gen.next();
    while (!step.done) {
      if (step.value.explanation) {
        binarySearchLogs.push(step.value.explanation);
      }
      step = gen.next();
    }
    const searchTime = performance.now() - searchStart;

    // Save logs in internal Algorithm Details
    setAlgorithmDetails({
      pathfinding: {
        name: theatre.name,
        algorithm: 'Dijkstra',
        visitedNodes: theatre.dijkstraSteps,
        executionTime: theatre.dijkstraTimeMs,
        distance: theatre.distance,
        timeComplexity: 'O((V+E) log V)',
        path: theatre.path.join(' → '),
      },
      binarySearch: {
        target: targetShowtime.time,
        executionTime: searchTime,
        steps: binarySearchLogs,
        timeComplexity: 'O(log N)',
      }
    });

    // Proceed to seating layout grid
    setTimeout(() => {
      onSelectShowtime(theatre, targetShowtime);
    }, 850);
  };

  const getFormatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Back to movie details */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-300 mb-8 text-xs font-semibold uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Movie details
      </button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-cinema-border pb-6">
        <div>
          <span className="text-[10px] text-teal-400 font-bold uppercase tracking-[0.2em] bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-md">
            Nearby Cinema Hubs
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-wide mt-4">
            SELECT CINEMA THEATRE
          </h2>
          <p className="text-slate-400 text-xs mt-2">
            Showing locations for <strong className="text-gold-400">{movie.title}</strong> on <strong className="text-white">{getFormatDate(selectedDate)}</strong>.
          </p>
        </div>

        <div className="text-right text-xs text-slate-500 font-mono mt-4 md:mt-0">
          📍 Sorted automatically by closest network routing distance (Dijkstra)
        </div>
      </div>

      {/* Algorithm Details Expandable Drawer */}
      <div className="mb-8 bg-cinema-card/50 border border-cinema-border rounded-2xl overflow-hidden shadow-xl transition-all duration-300">
        <button
          onClick={() => setIsAlgoExpanded(!isAlgoExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-gold-400 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-200 uppercase tracking-widest">
              Algorithm Details & Trace Logs
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>Click to inspect DSA metrics</span>
            {isAlgoExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isAlgoExpanded && (
          <div className="p-6 border-t border-cinema-border grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 font-mono text-[11px] text-slate-400">
            {/* Dijkstra details */}
            {algorithmDetails.pathfinding ? (
              <div className="border border-cinema-border bg-cinema-black/80 rounded-xl p-4.5 space-y-3">
                <div className="flex justify-between border-b border-cinema-border pb-2">
                  <span className="font-bold text-slate-200">1. Distance Sorting</span>
                  <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">Dijkstra & A*</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>Algorithm: <span className="text-white font-bold">{algorithmDetails.pathfinding.algorithm}</span></div>
                  <div>Source Node: <span className="text-teal-400">Your Location (U)</span></div>
                  <div>Target Node: <span className="text-gold-400">{algorithmDetails.pathfinding.name}</span></div>
                  <div>Shortest Path: <span className="text-slate-300">{algorithmDetails.pathfinding.path}</span></div>
                  <div>Distance Calculated: <span className="text-white font-bold">{algorithmDetails.pathfinding.distance} KM</span></div>
                  <div>Visited Nodes: <span className="text-teal-400 font-bold">{algorithmDetails.pathfinding.visitedNodes}</span></div>
                  <div>Execution Time: <span className="text-teal-400 font-bold">{algorithmDetails.pathfinding.executionTime.toFixed(3)}ms</span></div>
                  <div>Time Complexity: <span className="text-purple-400 font-bold">{algorithmDetails.pathfinding.timeComplexity}</span></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-6 border border-cinema-border border-dashed rounded-xl text-slate-600">
                Pathfinding details initialized on load.
              </div>
            )}

            {/* Binary search details */}
            {algorithmDetails.binarySearch ? (
              <div className="border border-teal-500/20 bg-teal-500/5 rounded-xl p-4.5 space-y-3">
                <div className="flex justify-between border-b border-teal-500/20 pb-2">
                  <span className="font-bold text-teal-400">2. Showtime Lookup</span>
                  <span className="text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">Binary Search</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>Target Time Slot: <span className="text-teal-400 font-bold">{algorithmDetails.binarySearch.target}</span></div>
                  <div>Execution Time: <span className="text-teal-400 font-bold">{algorithmDetails.binarySearch.executionTime.toFixed(3)}ms</span></div>
                  <div>Time Complexity: <span className="text-gold-400 font-bold">{algorithmDetails.binarySearch.timeComplexity}</span></div>
                  <div className="pt-2 text-[10px] text-slate-500 border-t border-cinema-border">
                    <span className="font-bold block mb-1">Trace Iterations:</span>
                    <div className="space-y-1 max-h-[85px] overflow-y-auto pr-1">
                      {algorithmDetails.binarySearch.steps.map((log: string, idx: number) => (
                        <div key={idx} className="border-l-2 border-teal-400 pl-1.5 py-0.5">{log}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-6 border border-cinema-border border-dashed rounded-xl text-slate-500 text-center font-light leading-relaxed">
                💡 Select any showtime timing badge on a theatre card to trigger internal Binary Search lookup.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Theatre Card Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedTheatres.map((theatre, index) => {
          const isClosest = index === 0;
          const theatreShowtimes = showtimes
            .filter(s => s.theatreId === theatre._id)
            .sort((a, b) => a.time.localeCompare(b.time));

          return (
            <div
              key={theatre._id}
              className={`glass-panel border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative shadow-md hover:scale-[1.01] ${isClosest
                  ? 'border-gold-500/30 shadow-gold hover:border-gold-400'
                  : 'border-cinema-border hover:border-slate-700'
                }`}
            >
              {/* Badge Overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                {isClosest ? (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-gold-400 text-cinema-black px-2.5 py-1 rounded-md shadow flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-cinema-black" />
                    Nearest Theatre
                  </span>
                ) : (
                  <span className="text-[8px] font-bold font-mono tracking-wider bg-slate-900 border border-cinema-border px-2 py-1 rounded text-slate-400">
                    Route: {theatre.distance} km away
                  </span>
                )}
              </div>

              {/* Theatre Card Info */}
              <div className="p-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide pr-24 leading-snug">
                    {theatre.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <div className="flex items-center gap-0.5 text-gold-400">
                      <Star className="w-3.5 h-3.5 fill-gold-400" />
                      <span className="text-xs font-bold">{theatre.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-slate-600 text-[10px]">•</span>
                    <span className="text-teal-400 text-xs font-semibold">{theatre.type}</span>
                    <span className="text-slate-600 text-[10px]">•</span>
                    <span className="text-slate-400 text-xs font-semibold">{theatre.travelTime} min drive</span>
                  </div>
                </div>

                {/* Facilities / Amenities */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {theatre.facilities.map((fac: string) => (
                    <span
                      key={fac}
                      className="text-[9px] font-bold text-slate-400 bg-slate-900 border border-cinema-border px-2.5 py-1 rounded-full"
                    >
                      {fac}
                    </span>
                  ))}
                </div>

                {/* Route Details */}
                <div className="mt-4 pt-3.5 border-t border-cinema-border/50 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dijkstra: {theatre.path.join(' → ')}</span>
                </div>
              </div>

              {/* Showtimes & Booking Area */}
              <div className="border-t border-cinema-border bg-slate-950/40 p-6 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Show Timings:</span>
                    <span className="text-[10px] text-teal-400 font-semibold font-mono">Seats Available: {theatre.seats}</span>
                  </div>

                  {theatreShowtimes.length === 0 ? (
                    <p className="text-[11px] text-slate-600 italic py-2">No shows scheduled for this date.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {theatreShowtimes.map((st) => {
                        const isSelected = selectedTheatreId === theatre._id && selectedTimeSlot === st._id;
                        return (
                          <button
                            key={st._id}
                            onClick={() => handleTimeClick(theatre, st)}
                            className={`px-4 py-2.5 rounded-xl border text-[11px] font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 ${isSelected
                                ? 'bg-teal-400 border-teal-400 text-cinema-black glow-teal scale-105'
                                : 'bg-cinema-black border-cinema-border text-slate-300 hover:border-slate-600 hover:text-white'
                              }`}
                          >
                            <Clock className="w-3 h-3" />
                            {st.time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
