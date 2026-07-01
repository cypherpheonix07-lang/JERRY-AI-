import { useEffect, useRef, useState } from "react";

export const Notes = () => {
  const [val, setVal] = useState("");
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<number>();

  useEffect(() => {
    const stored = localStorage.getItem("jarvis-notes");
    setVal(stored ?? "# JARVIS Memory Bank\n\n- Sir prefers tea over coffee\n");
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      localStorage.setItem("jarvis-notes", val);
    }, 600);
  }, [val, loaded]);

  return (
    <textarea
      value={val}
      onChange={e => setVal(e.target.value)}
      className="w-full h-full min-h-[180px] bg-input/40 border border-primary/30 rounded p-2 text-xs font-mono text-primary/90 outline-none focus:border-primary resize-none"
      spellCheck={false}
    />
  );
};
