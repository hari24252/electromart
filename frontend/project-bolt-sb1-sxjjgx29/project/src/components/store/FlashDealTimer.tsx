import React, { useState, useEffect } from 'react';
import { Flame, Clock } from 'lucide-react';

interface FlashDealTimerProps {
  targetDate?: Date;
  title?: string;
}

export const FlashDealTimer: React.FC<FlashDealTimerProps> = ({
  targetDate = new Date(Date.now() + 14 * 3600 * 1000 + 45 * 60 * 1000), // Default 14h 45m from now
  title = 'FLASH DEALS END IN',
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-600/20 border border-amber-500/30 px-4 py-2.5 rounded-2xl backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs tracking-wider uppercase">
        <Flame className="w-4 h-4 animate-bounce text-amber-400" />
        <span>{title}</span>
      </div>

      <div className="flex items-center gap-1 font-mono font-extrabold text-sm text-white">
        <span className="bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-lg">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-amber-400">:</span>
        <span className="bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-lg">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-amber-400">:</span>
        <span className="bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-lg text-amber-400">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};
