
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

const FocusTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        }
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            alert("Час відпочити!");
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <div className="glass-dark p-6 rounded-[32px] w-[200px] flex flex-col items-center shadow-3xl border border-white/5">
      <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-4">
        <Coffee size={12} />
        Focus Flow
      </div>
      <div className="text-4xl font-black tabular-nums mb-6">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex gap-3">
        <button 
          onClick={toggle}
          className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-white/10 text-white' : 'bg-white text-black'}`}
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button 
          onClick={reset}
          className="p-3 glass rounded-2xl hover:bg-white/10 transition-all"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default FocusTimer;
