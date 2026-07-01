import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArcReactor } from "./ArcReactor";

const LINES = [
  "INITIALIZING J.A.R.V.I.S CORE...",
  "LOADING NEURAL SUBSYSTEMS...",
  "CALIBRATING HOLOGRAPHIC INTERFACE...",
  "ESTABLISHING SECURE UPLINK...",
  "MOUNTING MEMORY BANKS...",
  "ARC REACTOR ONLINE — 100%",
  "ALL SYSTEMS NOMINAL.",
];

export const BootSequence = ({ onDone }: { onDone: () => void }) => {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (i >= LINES.length) {
      const t = setTimeout(() => { setDone(true); setTimeout(onDone, 600); }, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI(i + 1), 280);
    return () => clearTimeout(t);
  }, [i, onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}>
            <ArcReactor size={140} />
          </motion.div>
          <h1 className="mt-8 text-3xl md:text-5xl font-bold tracking-[0.3em] text-gradient-hud glow-text">
            J.A.R.V.I.S
          </h1>
          <p className="mt-2 text-xs tracking-widest text-muted-foreground">JUST A RATHER VERY INTELLIGENT SYSTEM</p>

          <div className="mt-10 w-[min(560px,90vw)] font-mono text-xs text-primary/90">
            {LINES.slice(0, i).map((l, k) => (
              <motion.div key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 py-0.5">
                <span className="text-success">›</span>
                <span>{l}</span>
                <span className="ml-auto text-success">[OK]</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 w-[min(560px,90vw)] h-1 bg-muted overflow-hidden rounded">
            <motion.div className="h-full bg-primary glow-sm" initial={{ width: 0 }} animate={{ width: `${(i / LINES.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
