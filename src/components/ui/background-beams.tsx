import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'absolute inset-0 w-full h-full overflow-hidden pointer-events-none [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_80%)]',
        className
      )}
    >
      <svg
        className="absolute w-full h-full left-0 top-0 opacity-40"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="beam-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="beam-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="beam-grad-3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0" />
            <stop offset="50%" stopColor="#6ee7b7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient static background grid paths */}
        <g stroke="#27272a" strokeWidth="1" strokeOpacity="0.35">
          <path d="M-200 150 C 300 200, 700 50, 1640 180" />
          <path d="M-200 350 C 400 450, 900 250, 1640 400" />
          <path d="M-200 550 C 200 650, 800 450, 1640 600" />
          <path d="M-200 750 C 500 850, 1000 650, 1640 800" />
          
          <path d="M150 -100 C 250 300, 100 600, 200 1000" />
          <path d="M450 -100 C 550 250, 350 700, 480 1000" />
          <path d="M750 -100 C 850 400, 650 750, 780 1000" />
          <path d="M1050 -100 C 1150 300, 950 650, 1080 1000" />
          <path d="M1350 -100 C 1450 350, 1250 700, 1380 1000" />
        </g>

        {/* Animated Beams traversing the grid curves */}
        <motion.path
          d="M-200 150 C 300 200, 700 50, 1640 180"
          stroke="url(#beam-grad-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0.15, pathOffset: -0.2 }}
          animate={{ pathOffset: 1.2 }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 0.5,
          }}
        />

        <motion.path
          d="M-200 350 C 400 450, 900 250, 1640 400"
          stroke="url(#beam-grad-2)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0.2, pathOffset: -0.25 }}
          animate={{ pathOffset: 1.25 }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'linear',
            delay: 1.5,
          }}
        />

        <motion.path
          d="M-200 550 C 200 650, 800 450, 1640 600"
          stroke="url(#beam-grad-1)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0.25, pathOffset: -0.3 }}
          animate={{ pathOffset: 1.3 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
            delay: 3,
          }}
        />

        <motion.path
          d="M-200 750 C 500 850, 1000 650, 1640 800"
          stroke="url(#beam-grad-3)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0.18, pathOffset: -0.2 }}
          animate={{ pathOffset: 1.2 }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'linear',
            delay: 2,
          }}
        />

        {/* Vertical traversing beams */}
        <motion.path
          d="M450 -100 C 550 250, 350 700, 480 1000"
          stroke="url(#beam-grad-1)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0.2, pathOffset: -0.2 }}
          animate={{ pathOffset: 1.2 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
            delay: 0.8,
          }}
        />

        <motion.path
          d="M1050 -100 C 1150 300, 950 650, 1080 1000"
          stroke="url(#beam-grad-2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0.22, pathOffset: -0.25 }}
          animate={{ pathOffset: 1.25 }}
          transition={{
            duration: 8.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 2.2,
          }}
        />
      </svg>
    </div>
  );
};
