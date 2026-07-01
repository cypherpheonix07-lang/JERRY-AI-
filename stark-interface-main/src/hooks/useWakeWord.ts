// Continuous "Hey JARVIS" wake-word listener using Web Speech API.
import { useEffect, useRef } from "react";

export const useWakeWord = (enabled: boolean, onWake: () => void) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { console.warn("SpeechRecognition not supported"); return; }

    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = "en-US";

    let stopped = false;

    r.onresult = (e: any) => {
      const txt = Array.from(e.results)
        .slice(e.resultIndex)
        .map((res: any) => res[0].transcript)
        .join(" ")
        .toLowerCase();
      if (/hey\s*jarvis|hi\s*jarvis|ok\s*jarvis/.test(txt)) {
        try { r.stop(); } catch {}
        onWake();
      }
    };
    r.onerror = (e: any) => { /* swallow no-speech / aborted */ };
    r.onend = () => {
      if (!stopped) { try { r.start(); } catch {} } // auto-restart
    };
    try { r.start(); } catch {}
    ref.current = r;

    return () => {
      stopped = true;
      try { r.stop(); } catch {}
    };
  }, [enabled, onWake]);
};
