import React, { useState } from 'react';
import { CheckCircle2, Ticket, QrCode, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Movie, Theatre, Showtime, Booking } from '../../../server/src/db/types';

interface ConfirmationProps {
  movie: Movie;
  theatre: Theatre;
  showtime: Showtime;
  booking: Booking;
  onHome: () => void;
}

export default function Confirmation({
  movie,
  theatre,
  showtime,
  booking,
  onHome
}: ConfirmationProps) {
  const [verifyHash, setVerifyHash] = useState('');

  const getHashIndex = (hashKey: string) => {
    let hashVal = 5381;
    for (let i = 0; i < hashKey.length; i++) {
      hashVal = (hashVal * 33) ^ hashKey.charCodeAt(i);
    }
    return Math.abs(hashVal) % 16;
  };

  const [verificationResult, setVerificationResult] = useState<{
    searched: boolean;
    valid: boolean;
    booking?: Booking;
    message?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Handle HashMap O(1) verify call
  const handleVerify = async () => {
    if (!verifyHash.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch(`/api/verify/${verifyHash.trim()}`);
      const data = await res.json();

      if (res.ok && data.verified) {
        setVerificationResult({
          searched: true,
          valid: true,
          booking: data.booking
        });
      } else {
        setVerificationResult({
          searched: true,
          valid: false,
          message: data.message || 'Booking confirmation hash not found in the custom Hash Map index.'
        });
      }
    } catch (err) {
      setVerificationResult({
        searched: true,
        valid: false,
        message: 'Network verification failure.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Success Title */}
      <div className="text-center flex flex-col items-center mb-10">
        <CheckCircle2 className="w-16 h-16 text-teal-400 animate-bounce mb-4" />
        <h2 className="text-3xl font-extrabold text-white tracking-wide">
          BOOKING CONFIRMED!
        </h2>
        <p className="text-slate-400 text-sm mt-1">Your seats have been locked and tickets issued successfully.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ticket Summary Card */}
        <div className="glass-panel border-2 border-gold-500/20 rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 border-b border-cinema-border p-5 flex items-center gap-3">
            <Ticket className="w-6 h-6 text-gold-400" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CineBook Ticket</span>
              <h3 className="font-extrabold text-white text-sm line-clamp-1">{booking.movieTitle}</h3>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Theater</span>
                <span className="font-semibold text-slate-200">{booking.theatreName}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Showtime</span>
                <span className="font-semibold text-slate-200">{booking.showtime}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Seats Booked</span>
                <span className="font-bold text-teal-400 font-mono tracking-wider">{booking.seats.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Amount Paid</span>
                <span className="font-extrabold text-white">₹{booking.totalPrice}</span>
              </div>
            </div>

            {/* Hash / QR box redesigned to show HashMap info */}
            <div className="border-t border-cinema-border pt-4 mt-4 bg-slate-950 p-4 rounded-xl border space-y-3">
              <div className="flex items-center gap-4">
                <QrCode className="w-12 h-12 text-slate-400" />
                <div className="flex-1">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Gate Confirmation Hash ID</span>
                  <span className="text-sm font-extrabold text-gold-400 font-mono tracking-widest">{booking.bookingHash}</span>
                </div>
              </div>
              <div className="border-t border-cinema-border/50 pt-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                <div>Booking ID: <span className="text-slate-300 font-bold">{booking._id}</span></div>
                <div>Hash Index: <span className="text-teal-400 font-bold">{getHashIndex(booking.bookingHash)}</span></div>
                <div>Method: <span className="text-slate-300">Retrieved using Hash Map</span></div>
                <div>Avg Lookup: <span className="text-teal-400 font-bold">O(1) Constant</span></div>
              </div>
            </div>
          </div>

          {/* Ticket bottom edge cut-outs */}
          <div className="absolute left-0 bottom-16 -translate-x-1/2 w-6 h-6 rounded-full bg-cinema-black" />
          <div className="absolute right-0 bottom-16 translate-x-1/2 w-6 h-6 rounded-full bg-cinema-black" />
        </div>

        {/* Gate Entry HashMap Verification sandbox */}
        <div className="glass-panel border border-cinema-border rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-400" />
              Gate Verification Agent
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-light mb-6">
              Simulates the ticket checker gate. Type the Ticket Hash Code shown on the left to verify this booking
              using our backend **Custom HashMap** in constant time $O(1)$.
            </p>

            {/* Verify input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Ticket Hash ID here..."
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="flex-1 bg-cinema-black border border-cinema-border rounded-xl px-4 py-3 text-xs font-bold font-mono tracking-widest focus:outline-none focus:border-teal-400"
              />
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="bg-teal-400 hover:bg-teal-300 text-cinema-black font-extrabold text-xs px-5 py-3 rounded-xl transition-all"
              >
                {isVerifying ? 'Verifying...' : 'VERIFY'}
              </button>
            </div>

            {/* Verification Result Display */}
            {verificationResult && (
              <div className="mt-6 animate-fade-in">
                {verificationResult.valid ? (
                  <div className="border border-teal-500/30 bg-teal-500/5 p-4 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">TICKET VALIDATED</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Booking verified for <strong>{verificationResult.booking?.movieTitle}</strong>.
                        Seats: {verificationResult.booking?.seats.join(', ')} confirmed at {verificationResult.booking?.theatreName}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">TICKET INVALID</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        {verificationResult.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-cinema-border pt-6 mt-6 flex flex-col gap-3.5">
            <button
              onClick={onHome}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs py-4 rounded-xl transition-colors border border-cinema-border"
            >
              BOOK MORE TICKETS
            </button>

            <p className="text-[9px] text-slate-500 leading-relaxed font-light font-mono text-center">
              Constant-Time Search O(1) HashMap bucket query.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
