export const Waveform = ({ active }: { active: boolean }) => (
  <div className="flex items-center gap-1 h-8">
    {Array.from({ length: 24 }).map((_, i) => (
      <div
        key={i}
        className="w-1 bg-primary glow-sm rounded-full origin-center"
        style={{
          height: "100%",
          animation: active ? `wave ${0.6 + (i % 5) * 0.1}s ease-in-out ${i * 0.05}s infinite` : "none",
          transform: active ? undefined : "scaleY(0.15)",
          opacity: active ? 1 : 0.4,
        }}
      />
    ))}
  </div>
);
