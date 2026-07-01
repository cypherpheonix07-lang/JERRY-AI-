import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { Waveform } from "./Waveform";
import { chat, type ChatMsg } from "@/lib/aiClient";
import { jarvisBus } from "@/lib/jarvisBus";
import { toast } from "sonner";

interface Props { onStatusChange: (s: string) => void; }

export const CommandCenter = ({ onStatusChange }: Props) => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Welcome back, sir. All subsystems online. How may I assist?" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [typingText, setTypingText] = useState("");
  const recogRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [messages, typingText]);

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.pitch = 0.8; u.rate = 0.95; u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const pick = voices.find(v => /uk|british|google uk|daniel/i.test(v.name + v.lang)) || voices[0];
    if (pick) u.voice = pick;
    u.onstart = () => { setSpeaking(true); onStatusChange("SPEAKING"); };
    u.onend   = () => { setSpeaking(false); onStatusChange("IDLE"); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const typewriter = (full: string, cb: () => void) => {
    let k = 0; setTypingText("");
    const id = setInterval(() => {
      k++; setTypingText(full.slice(0, k));
      if (k >= full.length) { clearInterval(id); setTypingText(""); cb(); }
    }, 14);
  };

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    setInput("");
    const next: ChatMsg[] = [...messagesRef.current, { role: "user", content: text }];
    setMessages(next);
    onStatusChange("PROCESSING");
    try {
      const reply = await chat(next);
      typewriter(reply, () => {
        setMessages(m => [...m, { role: "assistant", content: reply }]);
        speak(reply);
      });
    } catch (e: any) {
      toast.error(e.message || "Neural link disrupted");
      onStatusChange("IDLE");
    }
  };

  const startMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported in this browser"); return; }
    if (listening) { recogRef.current?.stop(); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = "en-US";
    r.onstart = () => { setListening(true); onStatusChange("LISTENING"); };
    r.onend   = () => { setListening(false); onStatusChange("IDLE"); };
    r.onerror = () => { setListening(false); onStatusChange("IDLE"); };
    r.onresult = (e: any) => send(e.results[0][0].transcript);
    recogRef.current = r; r.start();
  };

  // Hotkey: hold J then Space
  useEffect(() => {
    const keys = new Set<string>();
    const down = (e: KeyboardEvent) => {
      keys.add(e.key.toLowerCase());
      if (keys.has("j") && e.code === "Space" && (document.activeElement as HTMLElement)?.tagName !== "INPUT") {
        e.preventDefault(); startMic();
      }
    };
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // Wire up bus (gestures + wake word)
  useEffect(() => {
    const off = jarvisBus.on(cmd => {
      if (cmd === "voice") startMic();
      else if (cmd === "cancel") { window.speechSynthesis.cancel(); recogRef.current?.stop(); onStatusChange("IDLE"); }
      else if (cmd === "scroll-up") scrollRef.current?.scrollBy({ top: -120, behavior: "smooth" });
      else if (cmd === "scroll-down") scrollRef.current?.scrollBy({ top: 120, behavior: "smooth" });
    });
    return () => { off(); };
  }, []);

  return (
    <div className="flex flex-col h-full min-h-[360px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 space-y-2 font-mono text-sm">
        {messages.map((m, i) => (
          <div key={i} className={`animate-fade-in ${m.role === "user" ? "text-right" : ""}`}>
            <div className={`inline-block max-w-[90%] px-3 py-2 rounded whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-secondary/20 border border-secondary/40 text-foreground"
                : "bg-primary/10 border border-primary/40 text-primary glow-text"
            }`}>
              <span className="text-[10px] opacity-60 block">{m.role === "user" ? "USER" : "J.A.R.V.I.S"}</span>
              {m.content}
            </div>
          </div>
        ))}
        {typingText && (
          <div>
            <div className="inline-block max-w-[90%] px-3 py-2 rounded bg-primary/10 border border-primary/40 text-primary whitespace-pre-wrap">
              <span className="text-[10px] opacity-60 block">J.A.R.V.I.S</span>
              {typingText}<span className="animate-pulse">▌</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3"><Waveform active={speaking || listening} /></div>

      <div className="mt-2 flex items-center gap-2">
        <button onClick={startMic}
          className={`p-2 rounded border transition-all ${listening ? "border-destructive bg-destructive/20 text-destructive glow-sm" : "border-primary/50 text-primary hover:glow-sm"}`}
          title="Hold J + Space">
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Speak to JARVIS or type a command..."
          className="flex-1 bg-input/60 border border-primary/40 rounded px-3 py-2 text-sm font-mono outline-none focus:border-primary focus:glow-sm placeholder:text-muted-foreground/60" />
        <button onClick={() => send()} className="p-2 rounded border border-primary/50 text-primary hover:glow-sm">
          <Send className="w-4 h-4" />
        </button>
        <button onClick={() => speak(messages.filter(m => m.role === "assistant").slice(-1)[0]?.content || "Online.")}
          className="p-2 rounded border border-primary/50 text-primary hover:glow-sm">
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
