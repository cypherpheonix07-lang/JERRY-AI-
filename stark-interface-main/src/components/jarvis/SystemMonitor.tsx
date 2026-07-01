import { useEffect, useState } from "react";

const Gauge = ({ label, value, unit = "%" }: { label: string; value: number; unit?: string }) => {
  const r = 32, c = 2 * Math.PI * r;
  const off = c - (Math.min(100, value) / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r={r} stroke="hsl(var(--primary) / 0.15)" strokeWidth="4" fill="none" />
          <circle cx="40" cy="40" r={r} stroke="hsl(var(--primary))" strokeWidth="4" fill="none"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
            style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary)))", transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary glow-text">
          {Math.round(value)}{unit}
        </div>
      </div>
      <div className="mt-1 text-[10px] tracking-widest uppercase text-muted-foreground">{label}</div>
    </div>
  );
};

export const SystemMonitor = () => {
  const [cpu, setCpu] = useState(34);
  const [mem, setMem] = useState(58);
  const [net, setNet] = useState(72);
  const [bat, setBat] = useState(100);

  useEffect(() => {
    const id = setInterval(() => {
      setCpu(v => Math.max(8, Math.min(95, v + (Math.random() - 0.5) * 18)));
      setMem(v => Math.max(20, Math.min(92, v + (Math.random() - 0.5) * 8)));
      setNet(v => Math.max(10, Math.min(99, v + (Math.random() - 0.5) * 22)));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (navigator as any).getBattery?.().then((b: any) => {
      const upd = () => setBat(Math.round(b.level * 100));
      upd(); b.addEventListener("levelchange", upd);
    });
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 place-items-center h-full">
      <Gauge label="CPU" value={cpu} />
      <Gauge label="MEM" value={mem} />
      <Gauge label="NET" value={net} />
      <Gauge label="BATT" value={bat} />
    </div>
  );
};
