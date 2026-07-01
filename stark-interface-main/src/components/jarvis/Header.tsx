import { ArcReactor } from "./ArcReactor";
import { Settings, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export const Header = ({ onSettings, status }: { onSettings: () => void; status: string }) => {
  const [online, setOnline] = useState(navigator.onLine);
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); clearInterval(t); };
  }, []);

  return (
    <header className="hud-panel scanline relative flex items-center gap-4 px-4 py-3 mb-4 overflow-hidden">
      <ArcReactor size={48} />
      <div className="flex-1 min-w-0">
        <h1
          data-text="J.A.R.V.I.S"
          className="glitch text-2xl md:text-3xl font-bold tracking-[0.25em] text-gradient-hud glow-text"
        >
          J.A.R.V.I.S
        </h1>
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
          Status: <span className="text-primary glow-text">{status}</span>
        </p>
      </div>

      <div className="hidden md:flex flex-col items-end text-xs font-mono text-primary/80">
        <span className="glow-text">{time.toLocaleTimeString()}</span>
        <span className="text-muted-foreground">{time.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
      </div>

      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${online ? "border-success/60 text-success" : "border-destructive/60 text-destructive"}`}>
        {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span className="hidden sm:inline">{online ? "ONLINE" : "OFFLINE"}</span>
      </div>

      <button onClick={onSettings} className="p-2 rounded border border-primary/40 hover:border-primary hover:glow-sm transition-all">
        <Settings className="w-4 h-4 text-primary" />
      </button>
    </header>
  );
};
