import React from 'react';

export const PremiumBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#040405] contain-strict">
      {/* 
        Optimized ambient gradients using CSS radial gradients.
        Using radial-gradient is significantly faster than using DOM elements with massive blur filters.
        Animations are handled via CSS which offloads to the GPU more efficiently than JS-based framing.
      */}
      <div className="absolute inset-0 opacity-40">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] animate-liquid-drift-1 origin-center opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0) 70%)' }}
        />
        <div 
          className="absolute top-[20%] -right-[10%] w-[50%] h-[70%] animate-liquid-drift-2 origin-center opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 70%)' }}
        />
        <div 
          className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] animate-liquid-drift-3 origin-center opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(147,51,234,0) 70%)' }}
        />
      </div>
      
      {/* Simple, optimized noise overlay without mix-blend-mode (which is very expensive) */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%221%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }} 
      />
    </div>
  );
};
