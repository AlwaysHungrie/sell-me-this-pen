'use client';

import React, { useState, useEffect } from 'react';

const CircusLogo = () => {
  const [pattern, setPattern] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPattern(p => (p + 1) % 4), 300);
    return () => clearInterval(timer);
  }, []);

  const getBulbClass = (i: number) => {
    const base = "w-3 h-3 rounded-full border border-yellow-300 transition-all duration-300";
    const active = i % 4 === pattern;
    return `${base} ${active ? 'bg-yellow-300 shadow-lg shadow-yellow-300/80 scale-110' : 'bg-red-800 border-red-600'}`;
  };

  const Bulb = ({ i }: { i: number }) => (
    <div className="relative">
      <div className={getBulbClass(i)}>
        <div className="absolute inset-0.5 rounded-full bg-white/30" />
        {i % 4 === pattern && (
          <div className="absolute -inset-1 rounded-full bg-yellow-300/20 animate-ping" />
        )}
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
      {/* Main marquee structure */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl shadow-2xl border-2 border-yellow-400 relative overflow-hidden">
        {/* Inner border glow */}
        <div className="absolute inset-2 border border-yellow-300/40 rounded-2xl" />
        
        {/* Bulb borders - more realistic spacing */}
        <BulbRow count={12} start={0} className="-top-1.5 left-6 right-6 justify-between" />
        <BulbRow count={12} start={12} className="-bottom-1.5 left-6 right-6 justify-between" />
        <BulbRow count={6} start={24} className="-left-1.5 top-6 bottom-6 flex-col justify-between" />
        <BulbRow count={6} start={30} className="-right-1.5 top-6 bottom-6 flex-col justify-between" />
        
        {/* Main content area */}
        <div className="px-8 py-6 text-center relative">
          {/* Text shadow overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent rounded-2xl" />
          
          <h1 className="text-3xl font-black text-yellow-200 mb-1 tracking-wider font-serif relative z-10">
            <span style={{ 
              textShadow: '2px 2px 0 #7f1d1d, 4px 4px 0 #450a0a, 6px 6px 8px rgba(0,0,0,0.8)',
              filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.3))'
            }}>
              SELL ME
            </span>
          </h1>
          
          <h2 className="text-3xl font-black text-yellow-200 tracking-wider font-serif relative z-10">
            <span style={{ 
              textShadow: '2px 2px 0 #7f1d1d, 4px 4px 0 #450a0a, 6px 6px 8px rgba(0,0,0,0.8)',
              filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.3))'
            }}>
              THIS PEN
            </span>
          </h2>
          
          {/* Decorative elements */}
          <div className="flex justify-center items-center gap-4 mt-1 relative z-10">
            <div className="text-yellow-300 text-lg animate-spin" style={{ animationDuration: '4s' }}>✦</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
            <div className="text-yellow-300 text-lg animate-spin" style={{ animationDuration: '8s' }}>★</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
            <div className="text-yellow-300 text-lg animate-spin" style={{ animationDuration: '4s' }}>✦</div>
          </div>
        </div>
        
        {/* Corner decorations - more subtle */}
        {['top-4 left-4 border-l-2 border-t-2 rounded-tl-lg', 
          'top-4 right-4 border-r-2 border-t-2 rounded-tr-lg',
          'bottom-4 left-4 border-l-2 border-b-2 rounded-bl-lg',
          'bottom-4 right-4 border-r-2 border-b-2 rounded-br-lg'].map((pos, i) => (
          <div key={i} className={`absolute w-6 h-6 border-yellow-300/60 ${pos}`} />
        ))}
        
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent rounded-3xl" />
      </div>
      
      {/* Realistic shadow */}
      <div className="absolute inset-0 bg-black/40 rounded-3xl transform translate-x-1 translate-y-1 -z-10 blur-sm" />
      <div className="absolute inset-0 bg-black/20 rounded-3xl transform translate-x-2 translate-y-2 -z-20 blur-md" />
    </div>
  );
};

export default CircusLogo; 