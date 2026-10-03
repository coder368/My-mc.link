import React, { useEffect, useRef } from 'react';

export const AsciiBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Set actual canvas size mapped to device pixel ratio for crispness
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      // Set CSS size to viewport size
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Scale context to normalize drawing operations to CSS pixels
      ctx.scale(dpr, dpr);
      
      // Responsive sizing: slightly larger on mobile for performance and readability
      const isMobile = width < 768;
      const fontSize = isMobile ? 10 : 9;
      
      ctx.font = `${fontSize}px "SF Mono", "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    };

    window.addEventListener('resize', resize);
    resize();

    // The ASCII set in halftone order
    const chars = ['.', ':', 'o', 'O', '8', '@'];

    const draw = () => {
      // Use CSS dimensions for calculations since context is scaled
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);
      
      const isMobile = width < 768;
      const spacing = isMobile ? 12 : 10; // Wider spacing on mobile for performance

      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);
      
      const offsetX = (width - cols * spacing) / 2;
      const offsetY = (height - rows * spacing) / 2;

      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          const nx = x * 0.04; 
          const ny = y * 0.04;
          
          // Multi-octave wave interference for organic noise
          const w1 = Math.sin(nx + ny + time * 0.5);
          const w2 = Math.sin(nx - ny - time * 0.3);
          const w3 = Math.sin(nx * 2.3 + time * 0.8);
          const w4 = Math.sin(ny * 2.1 - time * 0.7);

          let noise = (w1 + w2 + w3 * 0.5 + w4 * 0.5) / 3;
            
          // Normalize roughly to 0..1
          noise = (noise + 1) / 2;
          
          // Apply curve to create distinct light/dark patches
          let intensity = Math.pow(noise, 2.5) * 2;
          
          if (intensity > 0.05) {
            intensity = Math.min(1, intensity);
            
            const charIdx = Math.floor(intensity * (chars.length - 1));
            const char = chars[charIdx];
            
            // Make the ASCII text prominent, high contrast, and visible
            const alpha = Math.min(0.8, intensity * 1.5);
            ctx.fillStyle = `rgba(228, 228, 231, ${alpha})`; // zinc-200 for bright contrast
            
            ctx.fillText(
              char, 
              offsetX + x * spacing, 
              offsetY + y * spacing
            );
          }
        }
      }

      time += 0.012; // Animation speed
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};
