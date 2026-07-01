interface Props { size?: number; className?: string; }
export const ArcReactor = ({ size = 56, className = "" }: Props) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full animate-pulse-arc" style={{ background: "var(--gradient-arc)" }} />
    <div className="absolute inset-1 rounded-full border-2 border-primary/60 animate-spin-slow" style={{ borderTopColor: "transparent", borderRightColor: "transparent" }} />
    <div className="absolute inset-3 rounded-full border border-primary/40 animate-spin-rev" style={{ borderBottomColor: "transparent" }} />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-1/3 h-1/3 rounded-full bg-primary glow-md" />
    </div>
  </div>
);
