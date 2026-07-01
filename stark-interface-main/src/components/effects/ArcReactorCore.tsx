/**
 * J.A.R.V.I.S Arc Reactor Core
 * 3D CSS rotating rings + pulsing core
 * Use: boot sequence centerpiece, header icon, loading states
 */
import React, { useEffect, useState } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';

interface ArcReactorCoreProps {
  size?: number;         // diameter in px (default 220)
  pulse?: boolean;       // enable pulse animation
  className?: string;
  onComplete?: () => void;
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  size = 220,
  pulse = true,
  className = '',
  onComplete,
}) => {
  const [phase, setPhase] = useState(0);
  const activeTheme = useJarvisStore((s) => s.activeTheme);

  // Boot animation: rings materialize one by one
  useEffect(() => {
    if (phase >= 4) {
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => setPhase((p) => p + 1), 300);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  const ringSizes = [size * 0.9, size * 0.72, size * 0.54, size * 0.36];
  const ringDelays = [0, 0.3, 0.6, 0.9];

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      data-theme={activeTheme}
    >
      {/* Rings */}
      {ringSizes.map((ringSize, i) => (
        <div
          key={i}
          className="arc-ring"
          style={{
            width: ringSize,
            height: ringSize,
            opacity: phase > i ? 1 : 0,
            transition: `opacity 0.4s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`,
            transform: phase > i ? 'scale(1)' : 'scale(0.3)',
            transitionDelay: `${ringDelays[i]}s`,
            animationDelay: `${ringDelays[i]}s`,
          }}
        />
      ))}

      {/* Pulsing Core */}
      <div
        className={`arc-core ${pulse ? 'animate-pulse-arc' : ''}`}
        style={{
          opacity: phase > 3 ? 1 : 0,
          transition: 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: phase > 3 ? 'scale(1)' : 'scale(0)',
          transitionDelay: '1.2s',
        }}
      />

      {/* Scanning Line */}
      <div
        className="absolute w-full h-0.5"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.8), transparent)',
          animation: 'scan-line 2s ease-in-out infinite',
          opacity: phase > 2 ? 0.7 : 0,
          transition: 'opacity 0.5s ease',
          transitionDelay: '0.9s',
        }}
      />

      {/* Glow effect */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)',
          opacity: phase > 3 ? 1 : 0,
          transition: 'opacity 1s ease',
          transitionDelay: '1.4s',
        }}
      />
    </div>
  );
};
