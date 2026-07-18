import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, TrendingUp, CircleDollarSign } from 'lucide-react';
import { Movie } from '../../../server/src/db/dbService';
import { LinearSearch } from '../../../DSA/Searching/LinearSearch';
import { MergeSort } from '../../../DSA/Sorting/MergeSort';
import { QuickSort } from '../../../DSA/Sorting/QuickSort';
import { HeapSort } from '../../../DSA/Sorting/HeapSort';

interface HomeProps {
  onSelectMovie: (movie: Movie) => void;
}

export default function Home({ onSelectMovie }: HomeProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStats, setSearchStats] = useState<string>('');
  const [sortStats, setSortStats] = useState<string>('');
  const [activeSort, setActiveSort] = useState<string>('');

  useEffect(() => {
    // Load movies from backend Express API
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        setMovies(data);
      })
      .catch(err => console.error('Error loading movies:', err));
  }, []);

  // 1. Search Movie Title using Linear Search (as requested, highlighting sequential check)
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetch('/api/movies')
        .then(res => res.json())
        .then(data => {
          setMovies(data);
          setSearchStats('');
        });
      return;
    }

    const tStart = performance.now();
    let comparisons = 0;
    
    // Perform Linear Search
    const searchTarget = searchQuery.toLowerCase();
    const matches: Movie[] = [];

    for (let i = 0; i < movies.length; i++) {
      comparisons++;
      if (movies[i].title.toLowerCase().includes(searchTarget)) {
        matches.push(movies[i]);
      }
    }

    const tEnd = performance.now();
    setMovies(matches);
    setSearchStats(
      `LinearSearch found ${matches.length} matching movies. Checked all ${comparisons} movies sequentially in ${(tEnd - tStart).toFixed(3)}ms.`
    );
  };

  // 2. Sorting handlers utilizing the custom DSA folder
  const handleSort = (type: 'rating' | 'price' | 'popularity') => {
    let sortedList = [...movies];
    let comparisons = 0;
    const tStart = performance.now();

    if (type === 'rating') {
      // Rating: Descending order (highest rating first) using MergeSort
      const comp = (a: Movie, b: Movie) => {
        comparisons++;
        return b.rating - a.rating; // Descending
      };
      sortedList = MergeSort.run(sortedList, comp);
      setActiveSort('Rating (Merge Sort)');
      setSortStats(`Stable Merge Sort complete. Comparisons: ${comparisons}. Time: ${(performance.now() - tStart).toFixed(3)}ms.`);
    } else if (type === 'price') {
      // Price: Ascending order (lowest price first) using QuickSort
      const comp = (a: Movie, b: Movie) => {
        comparisons++;
        return a.price - b.price; // Ascending
      };
      sortedList = QuickSort.run(sortedList, comp);
      setActiveSort('Price (Quick Sort)');
      setSortStats(`In-place Quick Sort complete. Comparisons: ${comparisons}. Time: ${(performance.now() - tStart).toFixed(3)}ms.`);
    } else if (type === 'popularity') {
      // Popularity: Descending order (highest sales first) using HeapSort
      const comp = (a: Movie, b: Movie) => {
        comparisons++;
        return b.popularity - a.popularity; // Descending
      };
      sortedList = HeapSort.run(sortedList, comp);
      setActiveSort('Popularity (Heap Sort)');
      setSortStats(`In-place Heap Sort complete. Comparisons: ${comparisons}. Time: ${(performance.now() - tStart).toFixed(3)}ms.`);
    }

    setMovies(sortedList);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setSearchStats('');
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        setMovies(data);
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-wide">
            NOW SHOWING
          </h2>
          <p className="text-slate-400 text-sm mt-1">Browse catalogue using search and sorting algorithms.</p>
        </div>

        {/* Algorithm Trace Panels */}
        <div className="flex flex-col gap-2 max-w-md w-full">
          {searchStats && (
            <div className="text-[11px] font-mono border border-teal-500/20 bg-teal-500/5 text-teal-400 px-3 py-2 rounded-lg leading-relaxed">
              <strong>[DSA Search Log]:</strong> {searchStats}
            </div>
          )}
          {sortStats && (
            <div className="text-[11px] font-mono border border-gold-500/20 bg-gold-500/5 text-gold-400 px-3 py-2 rounded-lg leading-relaxed">
              <strong>[DSA Sort Log]:</strong> {sortStats}
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-10 w-full">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search movie titles (triggers Linear Search)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full bg-cinema-card border border-cinema-border rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={handleResetSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sorting Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-slate-500 text-xs font-semibold uppercase flex items-center gap-1.5 whitespace-nowrap mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Sort By:
          </span>
          <button
            onClick={() => handleSort('rating')}
            className={`flex items-center gap-1 text-xs font-semibold px-4 py-3 rounded-lg border transition-all duration-300 ${
              activeSort.includes('Rating')
                ? 'bg-gold-500/10 border-gold-400 text-gold-400 glow-gold'
                : 'bg-cinema-card border-cinema-border text-slate-400 hover:border-slate-600'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Rating (Merge)
          </button>
          <button
            onClick={() => handleSort('price')}
            className={`flex items-center gap-1 text-xs font-semibold px-4 py-3 rounded-lg border transition-all duration-300 ${
              activeSort.includes('Price')
                ? 'bg-teal-500/10 border-teal-400 text-teal-400 glow-teal'
                : 'bg-cinema-card border-cinema-border text-slate-400 hover:border-slate-600'
            }`}
          >
            <CircleDollarSign className="w-3.5 h-3.5" />
            Price (Quick)
          </button>
          <button
            onClick={() => handleSort('popularity')}
            className={`flex items-center gap-1 text-xs font-semibold px-4 py-3 rounded-lg border transition-all duration-300 ${
              activeSort.includes('Popularity')
                ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                : 'bg-cinema-card border-cinema-border text-slate-400 hover:border-slate-600'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Popularity (Heap)
          </button>
        </div>
      </div>

      {/* Movies Grid */}
      {movies.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-cinema-border rounded-2xl">
          <p className="text-slate-500 text-sm">No movies match your search query.</p>
          <button onClick={handleResetSearch} className="text-teal-400 text-xs mt-2 underline">Reset filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map(movie => (
            <div
              key={movie._id}
              onClick={() => onSelectMovie(movie)}
              className="glass-panel group rounded-2xl overflow-hidden cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300 border border-cinema-border hover:border-gold-500/30"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden bg-slate-900">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/20 to-transparent" />
                
                {/* Rating Badge */}
                <div className="absolute top-4 left-4 bg-cinema-black/80 backdrop-blur border border-cinema-border text-gold-400 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                  {movie.rating.toFixed(1)}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-bold text-white group-hover:text-gold-400 transition-colors duration-300 line-clamp-1">
                  {movie.title}
                </h3>
                <p className="text-slate-500 text-xs mt-1.5 line-clamp-1">{movie.genre}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-cinema-border">
                  <span className="text-slate-400 text-xs">{movie.duration} mins</span>
                  <span className="text-teal-400 font-extrabold text-sm">₹{movie.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
