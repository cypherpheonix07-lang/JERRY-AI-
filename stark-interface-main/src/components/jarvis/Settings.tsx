import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  wakeWord: boolean;
  setWakeWord: (v: boolean) => void;
  gestures: boolean;
  setGestures: (v: boolean) => void;
}

const THEMES = [
  { id: "", name: "JARVIS Cyan" },
  { id: "red", name: "Killmonger Red" },
  { id: "gold", name: "War Machine Gold" },
];

export const SettingsDrawer = ({ open, onClose, wakeWord, setWakeWord, gestures, setGestures }: Props) => {
  const [theme, setTheme] = useState(localStorage.getItem("jarvis-theme") || "");
  const [claude, setClaude] = useState(localStorage.getItem("jarvis-claude") || "");
  const [openai, setOpenai] = useState(localStorage.getItem("jarvis-openai") || "");
  const [model, setModel] = useState(localStorage.getItem("jarvis-model") || "local");

  useEffect(() => {
    if (theme) document.documentElement.setAttribute("data-theme", theme);
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("jarvis-theme", theme);
  }, [theme]);

  const save = () => {
    localStorage.setItem("jarvis-claude", claude);
    localStorage.setItem("jarvis-openai", openai);
    localStorage.setItem("jarvis-model", model);
    toast.success("Configuration committed");
    onClose();
  };

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/auth"; };

  const requestNotif = async () => {
    if (!("Notification" in window)) return toast.error("Notifications not supported");
    const p = await Notification.requestPermission();
    toast[p === "granted" ? "success" : "error"](`Notifications: ${p}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-[min(420px,100vw)] hud-panel z-50 p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm tracking-[0.3em] text-primary glow-text">SYSTEM CONFIG</h2>
              <button onClick={onClose} className="p-1 text-primary hover:glow-sm border border-primary/40 rounded"><X className="w-4 h-4" /></button>
            </div>

            <Section title="API KEYS">
              <Field label="Claude API Key">
                <input type="password" value={claude} onChange={e => setClaude(e.target.value)} className={inputCls} placeholder="sk-ant-..." />
              </Field>
              <Field label="OpenAI API Key">
                <input type="password" value={openai} onChange={e => setOpenai(e.target.value)} className={inputCls} placeholder="sk-..." />
              </Field>
              <Field label="Active Model">
                <select value={model} onChange={e => setModel(e.target.value)} className={inputCls}>
                  <option value="claude">Claude (Sonnet 4)</option>
                  <option value="openai">OpenAI (GPT-4o-mini)</option>
                  <option value="local">Local Echo (no key)</option>
                </select>
              </Field>
              <p className="text-[10px] text-muted-foreground">Keys stay in your browser only. They're sent directly to Anthropic / OpenAI from this device.</p>
            </Section>

            <Section title="VOICE & GESTURE">
              <Toggle label="Wake Word ('Hey JARVIS')" checked={wakeWord} onChange={setWakeWord} />
              <Toggle label="Hand Gesture Control" checked={gestures} onChange={setGestures} />
              <button onClick={requestNotif} className="mt-2 w-full text-[11px] p-1.5 border border-primary/40 rounded text-primary hover:glow-sm">
                ENABLE NOTIFICATIONS
              </button>
            </Section>

            <Section title="THEME">
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    className={`p-2 text-[10px] rounded border ${theme === t.id ? "border-primary glow-sm text-primary" : "border-muted text-muted-foreground"}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="DATA & ACCESS">
              <button onClick={() => {
                const blob = new Blob([JSON.stringify({
                  notes: localStorage.getItem("jarvis-notes") || "",
                  tasks: localStorage.getItem("jarvis-tasks") || "[]",
                  exported_at: new Date().toISOString(),
                }, null, 2)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob); a.download = "jarvis-export.json"; a.click();
              }} className="w-full text-xs p-2 border border-primary/50 rounded text-primary hover:glow-sm mb-2">
                EXPORT LOCAL DATA (JSON)
              </button>
            </Section>

            <button onClick={save} className="w-full mt-4 p-2 bg-primary/20 border border-primary text-primary glow-sm rounded text-sm tracking-widest">
              COMMIT CONFIG
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const inputCls = "w-full bg-input/60 border border-primary/40 rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-primary text-foreground";
const Field = ({ label, children }: any) => (
  <label className="block mb-2">
    <span className="block text-[10px] tracking-widest text-muted-foreground mb-1">{label}</span>
    {children}
  </label>
);
const Section = ({ title, children }: any) => (
  <div className="mb-5">
    <div className="text-[10px] tracking-[0.3em] text-primary/70 mb-2 border-b border-primary/20 pb-1">{title}</div>
    {children}
  </div>
);
const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center justify-between py-1.5 cursor-pointer">
    <span className="text-xs text-foreground">{label}</span>
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full border transition-all relative ${checked ? "bg-primary/30 border-primary glow-sm" : "bg-muted border-muted-foreground/30"}`}>
      <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${checked ? "left-[18px] bg-primary" : "left-0.5 bg-muted-foreground"}`} />
    </button>
  </label>
);
