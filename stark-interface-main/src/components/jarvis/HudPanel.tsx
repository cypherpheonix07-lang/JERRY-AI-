import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props { title: string; icon?: ReactNode; children: ReactNode; className?: string; delay?: number; }

export const HudPanel = ({ title, icon, children, className = "", delay = 0 }: Props) => (
  <motion.section
    initial={{ opacity: 0, y: 14, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`hud-panel scanline overflow-hidden flex flex-col ${className}`}
  >
    <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/30 bg-primary/5">
      {icon && <span className="text-primary">{icon}</span>}
      <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary glow-text">{title}</h2>
      <div className="ml-auto flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
      </div>
    </div>
    <div className="p-3 flex-1 min-h-0">{children}</div>
  </motion.section>
);
