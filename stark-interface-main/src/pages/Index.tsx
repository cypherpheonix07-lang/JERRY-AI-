import { useEffect, useState } from "react";
import { BootSequence } from "@/components/jarvis/BootSequence";
import { ParticleField } from "@/components/jarvis/ParticleField";
import { Header } from "@/components/jarvis/Header";
import { HudPanel } from "@/components/jarvis/HudPanel";
import { CommandCenter } from "@/components/jarvis/CommandCenter";
import { SystemMonitor } from "@/components/jarvis/SystemMonitor";
import { WeatherIntel } from "@/components/jarvis/WeatherIntel";
import { TaskManager } from "@/components/jarvis/TaskManager";
import { Notes } from "@/components/jarvis/Notes";
import { SettingsDrawer } from "@/components/jarvis/Settings";
import { GestureHud } from "@/components/jarvis/GestureHud";
import { Activity, Brain, CloudSun, ListTodo, StickyNote } from "lucide-react";
import { useWakeWord } from "@/hooks/useWakeWord";
import { jarvisBus } from "@/lib/jarvisBus";
import { toast } from "sonner";
import { RufloPanel } from "@/components/integrations/RufloPanel";
import { HermesPanel } from "@/components/integrations/HermesPanel";

const Index = () => {
  const [booted, setBooted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState("IDLE");
  const [wakeWord, setWakeWord] = useState(localStorage.getItem("jarvis-wake") === "1");
  const [gestures, setGestures] = useState(localStorage.getItem("jarvis-gestures") === "1");

  useEffect(() => { localStorage.setItem("jarvis-wake", wakeWord ? "1" : "0"); }, [wakeWord]);
  useEffect(() => { localStorage.setItem("jarvis-gestures", gestures ? "1" : "0"); }, [gestures]);

  // Apply saved theme
  useEffect(() => {
    const t = localStorage.getItem("jarvis-theme");
    if (t) document.documentElement.setAttribute("data-theme", t);
  }, []);

  useWakeWord(wakeWord && booted, () => {
    toast.success("Wake word detected", { description: "Listening..." });
    jarvisBus.emit("voice");
  });

  return (
    <>
      <ParticleField />
      {!booted && <BootSequence onDone={() => setBooted(true)} />}

      {booted && (
        <main className="min-h-screen p-3 md:p-5 max-w-[1600px] mx-auto">
          <Header onSettings={() => setSettingsOpen(true)} status={status} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <HudPanel title="Command Center" icon={<Brain className="w-3.5 h-3.5" />} className="lg:col-span-2 lg:row-span-2 min-h-[480px]" delay={0.05}>
              <CommandCenter onStatusChange={setStatus} />
            </HudPanel>

            <HudPanel title="System Monitor" icon={<Activity className="w-3.5 h-3.5" />} delay={0.15}>
              <SystemMonitor />
            </HudPanel>

            <HudPanel title="Weather Intel" icon={<CloudSun className="w-3.5 h-3.5" />} delay={0.25}>
              <WeatherIntel />
            </HudPanel>

            <HudPanel title="Task Directives" icon={<ListTodo className="w-3.5 h-3.5" />} delay={0.35}>
              <TaskManager />
            </HudPanel>

            <HudPanel title="Memory Bank" icon={<StickyNote className="w-3.5 h-3.5" />} className="lg:col-span-2" delay={0.45}>
              <Notes />
            </HudPanel>

            <div className="lg:col-span-1 lg:row-span-2 space-y-3">
              <RufloPanel />
              <HermesPanel />
            </div>
          </div>

          <footer className="mt-4 text-center text-[10px] tracking-[0.3em] text-muted-foreground animate-flicker">
            J.A.R.V.I.S v1.0 · STARK INDUSTRIES
          </footer>
        </main>
      )}

      <GestureHud enabled={gestures && booted} onClose={() => setGestures(false)} />

      <SettingsDrawer
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        wakeWord={wakeWord} setWakeWord={setWakeWord}
        gestures={gestures} setGestures={setGestures}
      />
    </>
  );
};

export default Index;
