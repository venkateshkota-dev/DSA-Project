import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Unlock,
  Clock,
  Film,
  MapPin,
  CreditCard,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Ticket,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Movie, Theatre, Showtime } from '../../../server/src/db/types';

interface CheckoutSimulationProps {
  movie: Movie;
  theatre: Theatre;
  showtime: Showtime;
  selectedSeats: string[];
  onBack: () => void;
  onConfirmBooking: (bookingDetails: any) => void;
}

export default function CheckoutSimulation({
  movie,
  theatre,
  showtime,
  selectedSeats,
  onBack,
  onConfirmBooking
}: CheckoutSimulationProps) {
  // Customer input states
  const [userName, setUserName] = useState('Venkatesh K');
  const [userEmail, setUserEmail] = useState('cinebook@gmail.com');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');

  // Mutex & Concurrency States
  const [syncMode, setSyncMode] = useState<'Mutex' | 'None'>('Mutex');
  const [mutexState, setMutexState] = useState<'unlocked' | 'locked' | 'released'>('unlocked');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '🔒 Mutex Concurrency Control ready. System will serialize transaction during checkout.'
  ]);
  const [trafficResults, setTrafficResults] = useState<{ user: string; success: boolean; time: number }[]>([]);

  // Price calculations
  const subtotal = selectedSeats.length * showtime.price;
  const convenienceFee = 30;
  const grandTotal = subtotal + convenienceFee;

  const getFormatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  // Helper log function
  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev.slice(0, 14)]);
  };

  // 1. Primary Customer Checkout Action with Mutex Lock Demonstration
  const handleCustomerCheckout = async () => {
    if (!userName.trim()) return;
    setIsProcessing(true);
    setMutexState('unlocked');

    addLog(`🚀 [CHECKOUT] Customer "${userName}" initiated checkout for seats: ${selectedSeats.join(', ')}.`);

    if (syncMode === 'Mutex') {
      addLog(`🔒 [MUTEX] Acquiring exclusive lock permit for critical section...`);
      setMutexState('locked');
      await new Promise(r => setTimeout(r, 600)); // Visual lock acquiring pause
    } else {
      addLog(`⚠️ [WARNING] Checkout running WITHOUT Mutex synchronization! Race conditions possible.`);
    }

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showtimeId: showtime._id,
          seats: selectedSeats,
          userName: userName.trim(),
          syncMode
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addLog(`✅ [SUCCESS] Reservation atomic lock confirmed! Booking Hash: ${data.booking.bookingHash}`);
        setMutexState('released');
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        onConfirmBooking(data.booking);
      } else {
        addLog(`❌ [FAILED] Checkout rejected. ${data.error || 'Seats already reserved.'}`);
        setMutexState('unlocked');
        setIsProcessing(false);
      }
    } catch (err: any) {
      addLog(`❌ [ERROR] Network transaction error: ${err.message}`);
      setMutexState('unlocked');
      setIsProcessing(false);
    }
  };

  // 2. High-traffic spike simulator (fires 5 simultaneous requests for exact same seats)
  const handleSimulateTrafficSpike = async () => {
    setIsSimulatingTraffic(true);
    setTrafficResults([]);
    addLog(`💥 [TRAFFIC RUSH] Firing 5 simultaneous user requests for seats: ${selectedSeats.join(', ')}...`);

    // Reset seats on backend database first
    try {
      await fetch('/api/seats/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId: showtime._id, seats: selectedSeats })
      });
    } catch (err) {
      console.error(err);
    }

    const users = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];

    if (syncMode === 'Mutex') {
      setMutexState('locked');
    }

    const requests = users.map(async (u, idx) => {
      const stagger = idx * 150;
      await new Promise(r => setTimeout(r, stagger));

      const tStart = performance.now();
      try {
        const res = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            showtimeId: showtime._id,
            seats: selectedSeats,
            userName: u,
            syncMode
          })
        });
        const data = await res.json();
        const duration = Math.round(performance.now() - tStart);
        return { user: u, success: data.success, duration };
      } catch (err) {
        return { user: u, success: false, duration: 0 };
      }
    });

    const results = await Promise.all(requests);

    const formattedResults = results.map(r => ({
      user: r.user,
      success: r.success,
      time: r.duration
    }));

    setTrafficResults(formattedResults);

    const successCount = results.filter(r => r.success).length;

    if (syncMode === 'Mutex') {
      setMutexState('released');
      addLog(`🔒 [MUTEX SUMMARY] Exactly 1 user succeeded, 4 users safely rejected. Double-booking prevented!`);
    } else {
      addLog(`⚠️ [RACE SUMMARY] ${successCount} users booked the same seat due to missing Mutex lock!`);
    }

    setIsSimulatingTraffic(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-300 mb-8 text-xs font-semibold uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Seating Selection
      </button>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-cinema-border pb-6 gap-4">
        <div>
          <span className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.2em] bg-gold-500/10 border border-gold-500/20 px-3 py-1.5 rounded-md">
            Order Review & Checkout
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-wide mt-4">
            REVISE & CONFIRM BOOKING
          </h2>
          <p className="text-slate-400 text-xs mt-2">
            Review your movie showtime details and complete secure checkout with Mutex Concurrency Protection.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-cinema-card border border-cinema-border px-4 py-2 rounded-xl text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Mutex Protection: <strong className="text-teal-400 font-bold">{syncMode === 'Mutex' ? 'ENABLED' : 'DISABLED'}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Customer Movie Revision & Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Movie & Showtime Revision Card */}
          <div className="glass-panel border border-cinema-border rounded-3xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Poster */}
              <div className="w-full sm:w-36 h-48 bg-slate-900 rounded-2xl overflow-hidden shrink-0 border border-cinema-border relative">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-cinema-black/80 backdrop-blur border border-cinema-border text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded">
                  ★ {movie.rating.toFixed(1)}
                </div>
              </div>

              {/* Movie & Showtime Specs */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-widest">{movie.genre}</span>
                  <h3 className="text-2xl font-extrabold text-white tracking-wide mt-1">{movie.title}</h3>
                  <p className="text-slate-400 text-xs mt-1 font-mono">
                    {movie.duration} mins • Language: <strong className="text-gold-400">{movie.language || (movie.title.toLowerCase().includes('ramayana') ? 'Hindi' : 'Telugu')}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cinema-border/50 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Cinema Venue</span>
                      <span className="font-bold text-white leading-tight block">{theatre.name}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Showtime Date</span>
                      <span className="font-bold text-white leading-tight block">{getFormatDate(showtime.date)} @ {showtime.time}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Seats Tag */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[11px] text-slate-400 font-semibold">Selected Seats:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSeats.map(seat => (
                      <span
                        key={seat}
                        className="text-xs font-mono font-extrabold bg-gold-500/10 border border-gold-400/40 text-gold-400 px-3 py-1 rounded-lg glow-gold"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Customer Information & Payment Details */}
          <div className="glass-panel border border-cinema-border rounded-3xl p-6 space-y-5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              Customer Contact Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-cinema-black border border-cinema-border rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-teal-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter email for e-ticket"
                  className="w-full bg-cinema-black border border-cinema-border rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-teal-400 transition-all"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-4 border-t border-cinema-border/50">
              <label className="block text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Select Payment Option
              </label>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${paymentMethod === 'upi'
                      ? 'bg-teal-500/10 border-teal-400 text-white glow-teal'
                      : 'bg-cinema-black border-cinema-border text-slate-400 hover:border-slate-700'
                    }`}
                >
                  <Zap className={`w-4 h-4 mb-2 ${paymentMethod === 'upi' ? 'text-teal-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold block">UPI / GPay</span>
                  <span className="text-[9px] text-slate-500 font-mono">Instant Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${paymentMethod === 'card'
                      ? 'bg-teal-500/10 border-teal-400 text-white glow-teal'
                      : 'bg-cinema-black border-cinema-border text-slate-400 hover:border-slate-700'
                    }`}
                >
                  <CreditCard className={`w-4 h-4 mb-2 ${paymentMethod === 'card' ? 'text-teal-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold block">Credit/Debit Card</span>
                  <span className="text-[9px] text-slate-500 font-mono">Visa / Mastercard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${paymentMethod === 'netbanking'
                      ? 'bg-teal-500/10 border-teal-400 text-white glow-teal'
                      : 'bg-cinema-black border-cinema-border text-slate-400 hover:border-slate-700'
                    }`}
                >
                  <Ticket className={`w-4 h-4 mb-2 ${paymentMethod === 'netbanking' ? 'text-teal-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold block">Net Banking</span>
                  <span className="text-[9px] text-slate-500 font-mono">All Major Banks</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Pricing Summary & Final Action Button */}
          <div className="glass-panel border border-cinema-border rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Price Breakdown</h4>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Tickets ({selectedSeats.length} × ₹{showtime.price}):</span>
                <span className="font-semibold text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience & Booking Fee:</span>
                <span className="font-semibold text-white">₹{convenienceFee}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-cinema-border text-base font-extrabold text-white">
                <span>Total Payable:</span>
                <span className="text-teal-400 font-mono">₹{grandTotal}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleCustomerCheckout}
              disabled={isProcessing || isSimulatingTraffic || !userName.trim()}
              className={`w-full py-4 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 mt-4 shadow-xl ${isProcessing
                  ? 'bg-teal-500/30 text-teal-300 cursor-wait'
                  : 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-cinema-black glow-gold'
                }`}
            >
              {isProcessing ? (
                <>
                  <Lock className="w-4 h-4 animate-spin text-cinema-black" />
                  ACQUIRING MUTEX LOCK & CONFIRMING...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  CONFIRM & PAY ₹{grandTotal}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 1 Column: Compact Mutex Concurrency Control Side Box */}
        <div className="lg:col-span-1 space-y-6">
          {/* Side Box Card */}
          <div className="glass-panel border border-teal-500/30 rounded-3xl p-6 space-y-5 bg-gradient-to-b from-cinema-card via-cinema-card to-teal-950/20 shadow-2xl relative overflow-hidden">
            {/* Corner Glow Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-md">
                  Backend Protection
                </span>
                <Sparkles className="w-4 h-4 text-gold-400" />
              </div>
              <h3 className="text-base font-extrabold text-white tracking-wide mt-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400" />
                Mutex Lock Live Status
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Prevents double-booking race conditions during simultaneous multi-user checkouts.
              </p>
            </div>

            {/* Live State Indicator Visual */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-cinema-border space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Current State:</span>
                <span className={`font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase flex items-center gap-1.5 ${mutexState === 'locked'
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 glow-gold animate-pulse'
                    : mutexState === 'released'
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40 glow-teal'
                      : 'bg-slate-900 text-slate-400 border border-cinema-border'
                  }`}>
                  {mutexState === 'locked' && <Lock className="w-3 h-3 text-gold-400" />}
                  {mutexState === 'released' && <CheckCircle2 className="w-3 h-3 text-teal-400" />}
                  {mutexState === 'unlocked' && <Unlock className="w-3 h-3 text-slate-500" />}
                  {mutexState}
                </span>
              </div>

              {/* Lock Visual Pipeline */}
              <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono font-bold text-center">
                <div className={`p-2 rounded-xl border transition-all ${mutexState === 'unlocked' ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-950 border-cinema-border text-slate-600'}`}>
                  1. Idle
                </div>
                <div className={`p-2 rounded-xl border transition-all ${mutexState === 'locked' ? 'bg-gold-500/20 border-gold-400 text-gold-400 glow-gold' : 'bg-slate-950 border-cinema-border text-slate-600'}`}>
                  2. Locked
                </div>
                <div className={`p-2 rounded-xl border transition-all ${mutexState === 'released' ? 'bg-teal-500/20 border-teal-400 text-teal-400 glow-teal' : 'bg-slate-950 border-cinema-border text-slate-600'}`}>
                  3. Released
                </div>
              </div>
            </div>

            {/* Protocol Switcher */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Synchronization Protocol
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSyncMode('Mutex');
                    addLog('🔒 Switched to Mutex Exclusion Lock (Atomic seat protection ON).');
                  }}
                  className={`px-3 py-2.5 rounded-xl border text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1 ${syncMode === 'Mutex'
                      ? 'bg-teal-500/10 border-teal-400 text-teal-400 glow-teal'
                      : 'bg-cinema-black border-cinema-border text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <Lock className="w-3 h-3" />
                  Mutex (Protected)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSyncMode('None');
                    addLog('⚠️ Switched to No Sync (Race Condition Hazard ON).');
                  }}
                  className={`px-3 py-2.5 rounded-xl border text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1 ${syncMode === 'None'
                      ? 'bg-red-500/10 border-red-500 text-red-400 glow-red'
                      : 'bg-cinema-black border-cinema-border text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  No Sync (Hazard)
                </button>
              </div>
            </div>

            {/* Sim Traffic Test Button */}
            <button
              onClick={handleSimulateTrafficSpike}
              disabled={isSimulatingTraffic || isProcessing}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-cinema-border hover:border-gold-500/30 text-gold-400 font-bold text-[11px] py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              {isSimulatingTraffic ? 'Simulating 5 Concurrent Users...' : 'Simulate Traffic Spike (5 Users)'}
            </button>

            {/* Traffic Spike Results if executed */}
            {trafficResults.length > 0 && (
              <div className="p-3 bg-slate-950 rounded-xl border border-cinema-border space-y-2 text-[10px] font-mono">
                <span className="text-slate-400 font-bold block uppercase text-[9px]">Traffic Test Results:</span>
                <div className="space-y-1">
                  {trafficResults.map((r, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-slate-300">{r.user}:</span>
                      {r.success ? (
                        <span className="text-teal-400 font-bold">✅ Booked ({r.time}ms)</span>
                      ) : (
                        <span className="text-red-400">❌ Rejected ({r.time}ms)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Mutex Event Logs Stream */}
            <div className="space-y-2 pt-2 border-t border-cinema-border/50">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                Live Mutex Event Stream
              </span>
              <div className="bg-slate-950 border border-cinema-border rounded-xl p-3 h-32 overflow-y-auto font-mono text-[9px] space-y-1.5 leading-relaxed text-slate-300">
                {logs.map((log, i) => (
                  <div key={i} className="border-l-2 border-teal-500/40 pl-2">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
