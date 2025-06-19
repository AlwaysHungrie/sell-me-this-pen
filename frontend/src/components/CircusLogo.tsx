'use client';

import React, { useState, useEffect } from 'react';

const CircusLogo = () => {
  const [pattern, setPattern] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPattern(p => (p + 1) % 4), 400);
    return () => clearInterval(timer);
  }, []);

  const getBulbClass = (i: number) => {
    const base = "w-4 h-4 rounded-full border-2 border-yellow-500 transition-all duration-200";
    const active = i % 4 === pattern;
    return `${base} ${active ? 'bg-yellow-400 shadow-lg shadow-yellow-400/70 animate-pulse' : 'bg-red-900'}`;
  };

  const Bulb = ({ i }: { i: number }) => (
    <div className="relative">
      <div className={getBulbClass(i)}>
        <div className="absolute inset-1 rounded-full bg-white/20" />
      </div>
    </div>
  );

  const BulbRow = ({ count, start = 0, className }: { count: number; start?: number; className: string }) => (
    <div className={`absolute flex ${className}`}>
      {Array.from({ length: count }, (_, i) => <Bulb key={i} i={start + i} />)}
    </div>
  );

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-2xl border-4 border-yellow-400 relative overflow-hidden .bricked">
        <div className="absolute inset-3 border-2 border-yellow-300 rounded-xl opacity-60" />
        
        {/* Bulb borders - more bulbs and larger */}
        <BulbRow count={16} start={0} className="-top-2 left-4 right-4 justify-between" />
        <BulbRow count={16} start={16} className="-bottom-2 left-4 right-4 justify-between" />
        <BulbRow count={8} start={32} className="-left-2 top-4 bottom-4 flex-col justify-between" />
        <BulbRow count={8} start={40} className="-right-2 top-4 bottom-4 flex-col justify-between" />
        
        <div className="px-12 py-4 text-center">
          <h1 className="text-4xl font-black text-yellow-300 mb-1 tracking-wide font-mono">
            <span style={{ textShadow: '3px 3px 0 #dc2626, 6px 6px 0 #991b1b, 9px 9px 15px rgba(0,0,0,0.6)' }}>
              SELL ME
            </span>
          </h1>
          
          <h2 className="text-4xl font-black text-yellow-300 tracking-wide font-mono">
            <span style={{ textShadow: '3px 3px 0 #dc2626, 6px 6px 0 #991b1b, 9px 9px 15px rgba(0,0,0,0.6)' }}>
              THIS PEN
            </span>
          </h2>
          
          <div className="flex justify-center items-center gap-6 mt-1 mb-1">
            <div className="text-yellow-400 text-xl animate-spin" style={{ animationDuration: '3s' }}>✦</div>
            <div className="w-12 h-1.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            <div className="text-yellow-400 text-xl animate-spin" style={{ animationDuration: '12s' }}>★</div>
            <div className="w-12 h-1.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            <div className="text-yellow-400 text-xl animate-spin" style={{ animationDuration: '3s' }}>✦</div>
          </div>
        </div>
        
        {/* Corner decorations - larger */}
        {['top-3 left-3 border-l-4 border-t-4 rounded-tl-xl', 
          'top-3 right-3 border-r-4 border-t-4 rounded-tr-xl',
          'bottom-3 left-3 border-l-4 border-b-4 rounded-bl-xl',
          'bottom-3 right-3 border-r-4 border-b-4 rounded-br-xl'].map((pos, i) => (
          <div key={i} className={`absolute w-8 h-8 border-yellow-400 ${pos}`} />
        ))}
      </div>
      
      <div className="absolute inset-0 bg-black/30 rounded-2xl transform translate-x-2 translate-y-2 -z-10" />
    </div>
  );
};

export default CircusLogo; 