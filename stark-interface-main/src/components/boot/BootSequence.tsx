/**
 * J.A.R.V.I.S Iron Man 2 Boot Sequence
 * State machine: VOID → REACTOR → SCAN → TERMINAL → WELCOME → PANELS → DONE
 *
 * Phase 0 (0-1s): Pure black. Absolute silence.
 * Phase 1 (1-3.5s): ArcReactor appears center screen. Web Audio bass thump.
 * Phase 2 (3.5-6s): 3 scan beams top→bottom. HUD corners fly in.
 * Phase 3 (6-10.5s): Terminal typewriter. "[ONLINE]" = #00FF88.
 * Phase 4 (10.5-13s): "WELCOME HOME, SIR." per-char animation. Gold pulse.
 * Phase 5 (13-18s): Panels materialize one by one.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArcReactorCore } from '@/components/effects/ArcReactorCore';
import { jarvisBus } from '@/lib/jarvisBus';
import { useJarvisStore } from '@/store/jarvisStore';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: 'Initializing J.A.R.V.I.S neural matrix...', delay: 0 },
  { text: 'Loading holographic interface...', delay: 400 },
  { text: 'Establishing quantum entanglement...', delay: 800 },
  { text: 'Calibrating arc reactor power coupling...', delay: 1200 },
  { text: 'Synchronizing satellite uplink...', delay: 1600 },
  { text: '[ONLINE]', delay: 2000, color: '#00FF88' },
  { text: 'All systems nominal. Boot signature verified.', delay: 2400 },
  { text: 'Proceeding to user authentication...', delay: 2800 },
];

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLines, setTerminalLines] = useState<number>(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPanels, setShowPanels] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isFirstBoot = useRef(!localStorage.getItem('jarvis_boot_date'));
  const welcomeRef = useRef<HTMLDivElement>(null);

  const userName = useJarvisStore((s) => s.userName);

  // Phase 0: VOID — just black screen
  // Phase 1: Reactor appears
  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase(1);
      jarvisBus.emit('boot:phase', { phase: 1, name: 'REACTOR' });
      playBootSound(80, 0.15); // bass thump
    }, 1000);
    return () => clearTimeout(t1);
  }, []);

  // Phase 1→2: Scan beams
  useEffect(() => {
    if (phase !== 1) return;
    const t2 = setTimeout(() => {
      setPhase(2);
      jarvisBus.emit('boot:phase', { phase: 2, name: 'SCAN' });
      playBootSound(2000, 0.08); // shimmer
    }, 2500);
    return () => clearTimeout(t2);
  }, [phase]);

  // Phase 2→3: Terminal
  useEffect(() => {
    if (phase !== 2) return;
    const t3 = setTimeout(() => {
      setPhase(3);
      setShowTerminal(true);
      jarvisBus.emit('boot:phase', { phase: 3, name: 'TERMINAL' });
    }, 2500);
    return () => clearTimeout(t3);
  }, [phase]);

  // Terminal typewriter effect
  useEffect(() => {
    if (!showTerminal) return;
    if (terminalLines >= BOOT_LINES.length) {
      // Terminal complete → phase 4
      const t = setTimeout(() => {
        setPhase(4);
        setShowWelcome(true);
        playBootSound(800, 0.1);
        jarvisBus.emit('boot:phase', { phase: 4, name: 'WELCOME' });
      }, 600);
      return () => clearTimeout(t);
    }

    const line = BOOT_LINES[terminalLines];
    const delay = line.delay + 18 * line.text.length; // 18ms/char

    const t = setTimeout(() => {
      setTerminalLines((l) => l + 1);
      playBootSound(800, 0.03);
    }, Math.min(delay, 600));

    return () => clearTimeout(t);
  }, [showTerminal, terminalLines]);

  // Phase 4→5: Welcome → Panels
  useEffect(() => {
    if (phase !== 4) return;
    const t = setTimeout(() => {
      setPhase(5);
      setShowPanels(true);
      jarvisBus.emit('boot:phase', { phase: 5, name: 'PANELS' });
    }, 3500);
    return () => clearTimeout(t);
  }, [phase]);

  // Phase 5→DONE
  useEffect(() => {
    if (phase !== 5) return;
    const t = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        jarvisBus.emit('boot:complete', { duration: 18000 });
        useJarvisStore.getState().setBootComplete(true);
        localStorage.setItem('jarvis_boot_date', new Date().toISOString().split('T')[0]);
        onComplete();
      }, 1000);
    }, 5000);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  const playBootSound = useCallback((freq: number, duration: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available
    }
  }, []);

  // Determine if today is first boot
  const today = new Date().toISOString().split('T')[0];
  const lastBoot = localStorage.getItem('jarvis_boot_date');
  const isNewDay = lastBoot !== today;
  const isFirstDailyBoot = isNewDay || !lastBoot;

  // Condensed boot for same-day returns (3s total)
  const [isCondensed] = useState(!isFirstDailyBoot);

  useEffect(() => {
    if (isCondensed && !isFirstBoot.current) {
      // Skip to welcome quickly
      setPhase(4);
      const t = setTimeout(() => {
        setShowWelcome(true);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            onComplete();
          }, 1000);
        }, 2000);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isCondensed, onComplete]);

  // Get time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Working late';
  };

  return (
    <div className={`boot-overlay ${fadeOut ? 'opacity-0 transition-opacity duration-1000' : ''}`}>
      {/* Phase 1-2: Arc Reactor Center */}
      {(phase === 0 || phase === 1 || phase === 2) && (
        <div className="flex items-center justify-center w-full h-full">
          <ArcReactorCore
            size={phase === 0 ? 0 : 220}
            pulse={phase >= 1}
            className="transition-all duration-1000"
          />
        </div>
      )}

      {/* Phase 2: Scan Beams */}
      {phase === 2 && (
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)`,
                boxShadow: `0 0 20px hsl(var(--primary) / 0.4)`,
                animation: `scan-beam 2.5s ease-in-out ${i * 0.8}s infinite`,
                animationFillMode: 'forwards',
              }}
            />
          ))}
          <style>{`
            @keyframes scan-beam {
              0% { top: -10px; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: calc(100% + 10px); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Phase 3: Terminal */}
      {phase === 3 && showTerminal && (
        <div className="boot-terminal max-w-2xl mx-auto px-8">
          <div className="mb-6 text-center">
            <span className="text-xs tracking-[0.3em] text-[#00FF88] opacity-60">
              J.A.R.V.I.S v9.2 — BOOT SEQUENCE
            </span>
          </div>
          {BOOT_LINES.slice(0, terminalLines).map((line, i) => (
            <div
              key={i}
              className="line"
              style={{
                animationDelay: `${i * 0.05}s`,
                color: line.color || 'inherit',
              }}
            >
              <span className="opacity-40 mr-3">{`>`}</span>
              {line.text}
            </div>
          ))}
          {terminalLines < BOOT_LINES.length && (
            <div className="inline-block w-3 h-4 bg-[#00FF88] animate-pulse ml-5" />
          )}
        </div>
      )}

      {/* Phase 4: Welcome */}
      {phase >= 4 && showWelcome && (
        <div
          ref={welcomeRef}
          className="flex flex-col items-center justify-center gap-6"
          style={{
            opacity: showWelcome ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          {/* Gold radial pulse */}
          <div
            className="absolute rounded-full"
            style={{
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.12), transparent 70%)',
              animation: 'pulse-arc 3s ease-in-out infinite',
            }}
          />

          <div className="boot-welcome relative">
            {'WELCOME HOME'.split('').map((char, i) => (
              <span
                key={i}
                className="glow-text"
                style={{
                  animationDelay: `${i * 0.08 + 0.3}s`,
                  color: `hsl(var(--primary) / ${1 - i * 0.02})`,
                }}
              >
                {char}
              </span>
            ))}
          </div>

          <div
            className="font-orbitron text-sm tracking-[0.3em] opacity-80"
            style={{
              color: `hsl(var(--primary) / 0.9)`,
              animation: 'fade-in-up 0.5s ease 1.5s both',
            }}
          >
            {getGreeting()}, {userName.toUpperCase()}
          </div>

          {/* Arc reactor shrinks + moves to header position */}
          <div className="mt-8" style={{ animation: 'fade-in-up 0.5s ease 2s both' }}>
            <ArcReactorCore size={60} pulse className="opacity-60" />
          </div>

          <div
            className="font-mono text-xs tracking-widest opacity-40"
            style={{
              animation: 'fade-in-up 0.5s ease 2.5s both',
            }}
          >
            SYSTEMS [12/12] ONLINE ◆ ALL NOMINAL
          </div>
        </div>
      )}

      {/* HUD corners — fly in during phase 2 */}
      {phase >= 2 && (
        <>
          <div
            className="fixed top-8 left-8 w-32 h-32"
            style={{
              borderTop: '2px solid hsl(var(--primary) / 0.4)',
              borderLeft: '2px solid hsl(var(--primary) / 0.4)',
              animation: 'slide-in-left 0.6s ease both',
              transitionDelay: '1.5s',
            }}
          />
          <div
            className="fixed top-8 right-8 w-32 h-32"
            style={{
              borderTop: '2px solid hsl(var(--primary) / 0.4)',
              borderRight: '2px solid hsl(var(--primary) / 0.4)',
              animation: 'slide-in-right 0.6s ease both',
              transitionDelay: '1.5s',
            }}
          />
          <div
            className="fixed bottom-8 left-8 w-32 h-32"
            style={{
              borderBottom: '2px solid hsl(var(--primary) / 0.4)',
              borderLeft: '2px solid hsl(var(--primary) / 0.4)',
              animation: 'slide-in-left 0.6s ease both',
              transitionDelay: '1.5s',
            }}
          />
          <div
            className="fixed bottom-8 right-8 w-32 h-32"
            style={{
              borderBottom: '2px solid hsl(var(--primary) / 0.4)',
              borderRight: '2px solid hsl(var(--primary) / 0.4)',
              animation: 'slide-in-right 0.6s ease both',
              transitionDelay: '1.5s',
            }}
          />
        </>
      )}
    </div>
  );
};
