import React, { useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

interface SplashProps {
  onEnter: () => void;
}

export default function Splash({ onEnter }: SplashProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create random graph nodes
    const nodes = Array.from({ length: 45 }, (_, id) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 3 + 2,
      pulse: Math.random() * Math.PI
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.fillStyle = '#08080A';
      ctx.fillRect(0, 0, width, height);

      // Pulse calculations
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw connections
        nodes.forEach(other => {
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(0, 255, 209, ${0.15 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });

        // Draw glowing nodes
        const r = node.radius + Math.sin(node.pulse) * 1.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 209, ${0.3 + Math.sin(node.pulse) * 0.2})`;
        ctx.shadowColor = '#00ffd1';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-transparent to-transparent z-10" />

      <div className="z-20 text-center flex flex-col items-center max-w-2xl px-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-500 to-teal-400 flex items-center justify-center font-bold text-cinema-black text-3xl shadow-2xl glow-gold mb-6">
          CB
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-slate-100 to-teal-400 drop-shadow-2xl">
          CINE<span className="text-teal-400">BOOK</span>
        </h1>
        
        <p className="text-teal-400 text-xs md:text-sm tracking-[0.4em] font-bold uppercase mt-2 mb-8">
          Interactive DSA Visualization Platform
        </p>

        <button
          onClick={onEnter}
          className="flex items-center gap-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-cinema-black font-extrabold text-base px-10 py-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 glow-gold"
        >
          <Play className="w-5 h-5 fill-cinema-black" />
          ENTER CINEBOOK
        </button>
      </div>
    </div>
  );
}
