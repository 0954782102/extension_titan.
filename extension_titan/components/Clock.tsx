
import React, { useState, useEffect } from 'react';
import { ClockStyle } from '../types';

interface ClockProps {
  styleType?: ClockStyle;
}

const Clock: React.FC<ClockProps> = ({ styleType = 'standard' }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    const d = date.toLocaleDateString('uk-UA', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    return d.charAt(0).toUpperCase() + d.slice(1);
  };

  const renderClock = () => {
    switch (styleType) {
      case 'minimal':
        return (
          <div className="flex flex-col items-center text-white/90">
            <div className="text-6xl font-light tracking-[0.2em] tabular-nums">
              {formatTime(time)}
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.4em] mt-2 opacity-40">
              {formatDate(time)}
            </div>
          </div>
        );

      case 'analog':
        const seconds = time.getSeconds();
        const minutes = time.getMinutes();
        const hours = time.getHours();
        return (
          <div className="relative w-64 h-64 rounded-full border-[6px] border-white/20 glass shadow-2xl flex items-center justify-center">
            {/* Center dot */}
            <div className="absolute w-3 h-3 bg-white rounded-full z-30 shadow-lg" />
            {/* Hour hand */}
            <div 
              className="absolute w-1.5 h-16 bg-white rounded-full origin-bottom z-10 transition-transform duration-500"
              style={{ transform: `translateY(-50%) rotate(${hours * 30 + minutes * 0.5}deg)` }}
            />
            {/* Minute hand */}
            <div 
              className="absolute w-1 h-24 bg-white/60 rounded-full origin-bottom z-10 transition-transform duration-500"
              style={{ transform: `translateY(-50%) rotate(${minutes * 6 + seconds * 0.1}deg)` }}
            />
            {/* Second hand */}
            <div 
              className="absolute w-0.5 h-28 bg-red-500 rounded-full origin-bottom z-20 transition-transform"
              style={{ transform: `translateY(-50%) rotate(${seconds * 6}deg)` }}
            />
            {/* Ticks */}
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1 h-3 bg-white/20 origin-bottom" 
                style={{ height: '50%', transform: `rotate(${i * 30}deg)` }}
              >
                <div className="w-full h-2 bg-white/40 rounded-full" />
              </div>
            ))}
          </div>
        );

      case 'cyber':
        return (
          <div className="flex flex-col items-center">
            <div className="text-[120px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              {formatTime(time)}
            </div>
            <div className="mt-4 px-4 py-1 bg-blue-500/20 border border-blue-500/40 rounded-sm skew-x-[-15deg]">
              <span className="text-sm font-black italic text-blue-400 tracking-widest">
                {formatDate(time).toUpperCase()}
              </span>
            </div>
          </div>
        );

      case 'glass-pill':
        return (
          <div className="glass-dark px-12 py-8 rounded-[60px] flex flex-col items-center border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="text-8xl font-black tabular-nums tracking-tighter">
              {formatTime(time)}
            </div>
            <div className="h-[1px] w-12 bg-white/20 my-4" />
            <div className="text-sm font-bold uppercase tracking-widest opacity-60">
              {formatDate(time)}
            </div>
          </div>
        );

      case 'standard':
      default:
        return (
          <div className="flex flex-col items-center justify-center text-white drop-shadow-2xl">
            <div className="text-lg font-medium opacity-80 mb-2 tracking-wide uppercase">
              {formatDate(time)}
            </div>
            <div className="text-9xl font-bold tracking-tight tabular-nums leading-none">
              {formatTime(time)}
            </div>
          </div>
        );
    }
  };

  return <div className="animate-in fade-in zoom-in duration-700">{renderClock()}</div>;
};

export default Clock;
