import React, { useState } from 'react';
import { ArrowLeft, Terminal, AlertTriangle, ShieldCheck, UserCheck, Cpu, CheckCircle2, XCircle } from 'lucide-react';
import { Movie, Theatre, Showtime } from '../../../server/src/db/dbService';

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
  const [syncMode, setSyncMode] = useState<'None' | 'Mutex' | 'Semaphore'>('None');
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [successfulBooking, setSuccessfulBooking] = useState<any>(null);
  const [doubleBookingsCount, setDoubleBookingsCount] = useState<number>(0);

  const virtualUsers = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];

  // Track state of each user request for the timeline and counters
  const [requestStates, setRequestStates] = useState<Record<string, {
    status: 'idle' | 'waiting' | 'processing' | 'completed' | 'rejected';
    duration: number;
    delay: number;
  }>>({
    Alice: { status: 'idle', duration: 0, delay: 0 },
    Bob: { status: 'idle', duration: 0, delay: 0 },
    Charlie: { status: 'idle', duration: 0, delay: 0 },
    David: { status: 'idle', duration: 0, delay: 0 },
    Eve: { status: 'idle', duration: 0, delay: 0 },
  });

  // Run the concurrency simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSuccessfulBooking(null);
    setDoubleBookingsCount(0);
    setSimLogs([`[SIM] Initializing concurrent booking simulation with sync mode: ${syncMode}...`]);

    // Reset request states
    setRequestStates({
      Alice: { status: 'idle', duration: 0, delay: 0 },
      Bob: { status: 'idle', duration: 0, delay: 0 },
      Charlie: { status: 'idle', duration: 0, delay: 0 },
      David: { status: 'idle', duration: 0, delay: 0 },
      Eve: { status: 'idle', duration: 0, delay: 0 },
    });

    // 1. Reset seats on the backend database
    try {
      await fetch('/api/seats/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId: showtime._id, seats: selectedSeats })
      });
      setSimLogs(prev => [
        ...prev,
        `[SIM] Reset database reservation status for seats: ${selectedSeats.join(', ')}.`,
        `[SIM] Queueing 5 concurrent booking requests in API gateway...`
      ]);
    } catch (err) {
      console.error(err);
    }

    // 2. Fire requests concurrently with a 250ms visual stagger delay
    const requests = virtualUsers.map(async (user, idx) => {
      const staggerDelay = idx * 250;
      
      // Update state to show request is queued (waiting in FIFO queue)
      setRequestStates(prev => ({
        ...prev,
        [user]: { status: 'waiting', duration: 0, delay: staggerDelay }
      }));

      // Wait for stagger delay
      await new Promise(resolve => setTimeout(resolve, staggerDelay));

      // Update state to show processing
      setRequestStates(prev => ({
        ...prev,
        [user]: { ...prev[user], status: 'processing' }
      }));

      const tStart = performance.now();
      try {
        const response = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            showtimeId: showtime._id,
            seats: selectedSeats,
            userName: user,
            syncMode
          })
        });
        const tEnd = performance.now();
        const data = await response.json();
        const duration = Math.round(tEnd - tStart);

        // Update state with result
        setRequestStates(prev => ({
          ...prev,
          [user]: { ...prev[user], status: data.success ? 'completed' : 'rejected', duration }
        }));

        return { user, success: data.success, data, duration };
      } catch (err: any) {
        setRequestStates(prev => ({
          ...prev,
          [user]: { ...prev[user], status: 'rejected', duration: 0 }
        }));
        return { user, success: false, data: { error: err.message }, duration: 0 };
      }
    });

    const results = await Promise.all(requests);

    // 3. Process results and calculate statistics
    const newLogs: string[] = [];
    let successCount = 0;
    let mainBooking: any = null;

    results.forEach(res => {
      if (res.success) {
        successCount++;
        newLogs.push(`✅ [SUCCESS] User "${res.user}" secured reservation for ${selectedSeats.join(', ')} (${res.duration}ms). Booking Hash: ${res.data.booking.bookingHash}`);
        if (!mainBooking) {
          mainBooking = res.data.booking;
        }
      } else {
        newLogs.push(`❌ [REJECTED] User "${res.user}" request failed (${res.duration}ms). Error: ${res.data.error || 'Conflict'}`);
      }
    });

    if (syncMode === 'None') {
      setDoubleBookingsCount(successCount - 1);
      newLogs.push(`⚠️ [ANALYSIS] RACE CONDITION DETECTED! Without synchronization, ${successCount} out of 5 users booked the exact same seats!`);
    } else if (syncMode === 'Mutex') {
      newLogs.push(`🔒 [ANALYSIS] MUTEX ACTIVE & STABLE. The locking primitive serialized the checkout transaction, allowing only 1 user to secure seats while rejecting conflicts.`);
    } else if (syncMode === 'Semaphore') {
      newLogs.push(`🚦 [ANALYSIS] SEMAPHORE ACTIVE. Throttled processing pipeline capacity. (Note: Without a Mutex inside the critical section, concurrency racing still occurs inside slot limits).`);
    }

    setSimLogs(prev => [...prev, ...newLogs]);
    setSuccessfulBooking(mainBooking);
    setIsSimulating(false);
  };

  const handleProceed = () => {
    if (!successfulBooking) return;
    onConfirmBooking(successfulBooking);
  };

  // Compute stats on the fly
  const requestCounter = Object.values(requestStates).filter(r => r.status !== 'idle').length;
  const completedRequests = Object.values(requestStates).filter(r => r.status === 'completed').length;
  const blockedRequests = Object.values(requestStates).filter(r => r.status === 'rejected').length;
  
  const isRaceCondition = syncMode === 'None' && completedRequests > 1;
  const isMutexActive = syncMode === 'Mutex' && isSimulating;
  const isSemaphoreActive = syncMode === 'Semaphore' && isSimulating;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-300 mb-8 text-xs font-bold uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to seating grid
      </button>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-cinema-border pb-6">
        <div>
          <span className="text-[10px] text-teal-400 font-bold uppercase tracking-[0.2em] bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-md">
            Thread Sandbox Room
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-wide mt-4">
            CONCURRENT CHECKOUT GATEWAY
          </h2>
          <p className="text-slate-400 text-xs mt-2">
            Simulate 5 users purchasing seats <strong className="text-gold-400">{selectedSeats.join(', ')}</strong> at the exact same millisecond.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Sandbox Settings & Stats */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Settings Panel */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gold-400" />
              Synchronization Protocol
            </h3>
            
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setSyncMode('None')}
                className={`w-full py-3.5 rounded-xl border text-xs font-bold transition-all duration-300 text-left px-5 flex items-center justify-between ${
                  syncMode === 'None'
                    ? 'bg-red-500/10 border-red-500 text-red-400 glow-red'
                    : 'bg-cinema-black border-cinema-border text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>No Synchronization</span>
                <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono font-normal">Race Condition</span>
              </button>

              <button
                onClick={() => setSyncMode('Mutex')}
                className={`w-full py-3.5 rounded-xl border text-xs font-bold transition-all duration-300 text-left px-5 flex items-center justify-between ${
                  syncMode === 'Mutex'
                    ? 'bg-teal-500/10 border-teal-400 text-teal-400 glow-teal'
                    : 'bg-cinema-black border-cinema-border text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>Mutex Exclusion Lock</span>
                <span className="text-[9px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded font-mono font-normal">Atomic lock</span>
              </button>

              <button
                onClick={() => setSyncMode('Semaphore')}
                className={`w-full py-3.5 rounded-xl border text-xs font-bold transition-all duration-300 text-left px-5 flex items-center justify-between ${
                  syncMode === 'Semaphore'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                    : 'bg-cinema-black border-cinema-border text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>Semaphore Throttling</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-normal">Permits: 2</span>
              </button>
            </div>

            {/* Simulation Run Button */}
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-cinema-black font-extrabold text-xs py-4 rounded-xl mt-6 transition-all duration-300 glow-gold shadow-md disabled:opacity-40"
            >
              {isSimulating ? 'Processing Requests...' : 'FIRE SIMULATION (5 Users)'}
            </button>
          </div>

          {/* Real-time Status Badges & Counters */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Live Monitor System</h3>
            
            {/* Glowing Status BADGES */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold font-mono uppercase">
              <div className={`p-2 rounded-lg border text-center transition-all ${
                isRaceCondition ? 'bg-red-500/25 border-red-500 text-red-400 glow-red animate-pulse' : 'bg-slate-900/50 border-cinema-border text-slate-600'
              }`}>
                Race Detected
              </div>
              <div className={`p-2 rounded-lg border text-center transition-all ${
                isMutexActive ? 'bg-teal-500/20 border-teal-400 text-teal-400 glow-teal animate-pulse' : 'bg-slate-900/50 border-cinema-border text-slate-600'
              }`}>
                Mutex Active
              </div>
              <div className={`p-2 rounded-lg border text-center transition-all col-span-2 ${
                isSemaphoreActive ? 'bg-purple-500/20 border-purple-500 text-purple-400 animate-pulse' : 'bg-slate-900/50 border-cinema-border text-slate-600'
              }`}>
                Semaphore Throttling Active
              </div>
            </div>

            {/* Statistical Counters */}
            <div className="border-t border-cinema-border pt-4 space-y-2.5 text-xs text-slate-400">
              <div className="flex justify-between font-mono">
                <span>Request Counter:</span>
                <span className="font-extrabold text-white">{requestCounter} / 5</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Completed Requests:</span>
                <span className="font-extrabold text-teal-400">{completedRequests}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Blocked Requests:</span>
                <span className="font-extrabold text-red-400">{blockedRequests}</span>
              </div>
            </div>
          </div>

          {/* Secure Proceeds */}
          {successfulBooking && (
            <div className="glass-panel border border-teal-500/30 bg-teal-500/5 rounded-2xl p-5 animate-fade-in">
              <h4 className="text-xs font-bold text-teal-400 flex items-center gap-1.5 uppercase">
                <UserCheck className="w-4 h-4" />
                Seat Secured
              </h4>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-light">
                Ticket confirmed for one of the concurrent clients under reservation code: <strong>{successfulBooking.bookingHash}</strong>.
              </p>
              <button
                onClick={handleProceed}
                className="w-full bg-teal-400 hover:bg-teal-300 text-cinema-black font-extrabold text-xs py-3.5 rounded-xl mt-4 transition-all duration-300 glow-teal"
              >
                PROCEED TO TICKET GATE
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Timeline chart & horizontal Queue */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Horizontal FIFO Queue tracker */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Gateway Request Buffer Queue (FIFO)
            </h3>
            <div className="flex items-center flex-wrap gap-2 text-xs font-bold font-mono">
              {virtualUsers.map((user, idx) => {
                const state = requestStates[user];
                let statusColor = 'bg-cinema-black border-cinema-border text-slate-600';
                
                if (state.status === 'waiting') {
                  statusColor = 'bg-slate-900 border-slate-700 text-slate-300 animate-pulse';
                } else if (state.status === 'processing') {
                  statusColor = 'bg-teal-500/20 border-teal-400 text-teal-400 glow-teal';
                } else if (state.status === 'completed') {
                  statusColor = 'bg-teal-400 text-cinema-black border-teal-400 font-extrabold';
                } else if (state.status === 'rejected') {
                  statusColor = 'bg-red-500/20 border-red-500/40 text-red-400 font-normal';
                }

                return (
                  <React.Fragment key={user}>
                    <div className={`px-3 py-2 rounded-xl border tracking-wider transition-all duration-300 ${statusColor}`}>
                      {user}
                      <span className="block text-[8px] text-slate-500 font-normal mt-0.5 font-sans">
                        {state.status === 'idle' && 'Idle'}
                        {state.status === 'waiting' && 'In Queue'}
                        {state.status === 'processing' && 'Processing'}
                        {state.status === 'completed' && 'Completed'}
                        {state.status === 'rejected' && 'Rejected'}
                      </span>
                    </div>
                    {idx < virtualUsers.length - 1 && (
                      <span className="text-slate-600 px-1 font-extrabold">→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Latency / Request Timeline Chart */}
          <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-cinema-border">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Thread Timeline & Latency Chart
            </span>
            <div className="space-y-3">
              {virtualUsers.map((user) => {
                const state = requestStates[user];
                return (
                  <div key={user} className="flex items-center justify-between text-xs font-mono">
                    <span className="w-16 font-bold text-slate-300">{user}</span>
                    <div className="flex-1 mx-4 h-6 bg-cinema-black border border-cinema-border rounded-lg relative overflow-hidden flex items-center">
                      {/* Queue Stagger Delay block */}
                      {state.status !== 'idle' && (
                        <div
                          className="bg-slate-900 border-r border-cinema-border/50 h-full transition-all duration-300"
                          style={{ width: `${(state.delay) / 12}%` }}
                        />
                      )}
                      
                      {/* Processing locks status bar */}
                      {state.status === 'processing' && (
                        <div className="bg-teal-500/10 text-teal-400 text-[9px] h-full flex items-center pl-2 animate-pulse w-full">
                          Acquiring lock permit...
                        </div>
                      )}
                      
                      {/* Success Reservation line */}
                      {state.status === 'completed' && (
                        <div
                          className="bg-teal-500 text-cinema-black font-extrabold text-[9px] h-full flex items-center pl-2 transition-all duration-500"
                          style={{ width: `${Math.min(100, (state.duration) / 3.5)}%` }}
                        >
                          Secured ({state.duration}ms)
                        </div>
                      )}
                      
                      {/* Rejected block */}
                      {state.status === 'rejected' && (
                        <div className="bg-red-500/25 border-l border-red-500 text-red-400 text-[9px] h-full flex items-center pl-2 w-full transition-all duration-300">
                          Conflict Blocked
                        </div>
                      )}
                    </div>
                    <span className="w-20 text-right text-[11px]">
                      {state.status === 'idle' && <span className="text-slate-600">Idle</span>}
                      {state.status === 'waiting' && <span className="text-slate-400 font-normal">Waiting...</span>}
                      {state.status === 'processing' && <span className="text-teal-400 animate-pulse font-bold">Locks...</span>}
                      {state.status === 'completed' && <span className="text-teal-400 font-bold">Completed</span>}
                      {state.status === 'rejected' && <span className="text-red-500">Rejected</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Console logger output */}
          <div className="flex-1 bg-slate-950 border border-cinema-border rounded-2xl p-6 font-mono text-xs text-slate-300 shadow-2xl leading-relaxed flex flex-col justify-between">
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
              {simLogs.map((log, idx) => {
                const isSuccess = log.includes('SUCCESS') || log.includes('✅');
                const isError = log.includes('REJECTED') || log.includes('❌');
                const isWarning = log.includes('RACE CONDITION') || log.includes('⚠️');
                const isSystem = log.includes('[SIM]');

                let color = 'text-slate-400';
                if (isSuccess) color = 'text-teal-400 font-bold';
                else if (isError) color = 'text-red-400';
                else if (isWarning) color = 'text-red-500 font-bold bg-red-500/5 p-2 rounded border border-red-500/10';
                else if (isSystem) color = 'text-slate-500';

                return (
                  <div key={idx} className={`${color}`}>
                    {log}
                  </div>
                );
              })}

              {simLogs.length === 0 && (
                <div className="text-slate-600 italic py-6 text-center">
                  Select a synchronization protocol and click "FIRE SIMULATION" to launch requests.
                </div>
              )}
            </div>

            {/* Sandbox footer */}
            <div className="border-t border-cinema-border pt-4 mt-6 text-[10px] text-slate-500 flex justify-between items-center">
              <span>Simulation Server Engine: Express Gateway API v1.0</span>
              <span className="text-[9px] bg-slate-900 border border-cinema-border px-2 py-0.5 rounded text-slate-400 font-sans">Multi-Threaded Sandbox</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
