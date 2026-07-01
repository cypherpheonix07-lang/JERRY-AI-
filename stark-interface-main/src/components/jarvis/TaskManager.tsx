import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Priority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
type Task = { id: string; title: string; priority: Priority; done: boolean };

const priColor: Record<Priority, string> = {
  CRITICAL: "text-destructive border-destructive/60",
  HIGH: "text-warning border-warning/60",
  NORMAL: "text-primary border-primary/60",
  LOW: "text-muted-foreground border-muted-foreground/40",
};

export const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [pri, setPri] = useState<Priority>("NORMAL");

  useEffect(() => {
    const stored = localStorage.getItem("jarvis-tasks");
    if (stored) {
      try { setTasks(JSON.parse(stored)); }
      catch { setTasks([]); }
    }
  }, []);

  const saveTasks = (next: Task[]) => {
    setTasks(next);
    localStorage.setItem("jarvis-tasks", JSON.stringify(next));
  };

  const add = () => {
    if (!title.trim()) return;
    const newTask = { id: crypto.randomUUID(), title: title.trim(), priority: pri, done: false };
    saveTasks([newTask, ...tasks]);
    setTitle("");
  };

  const toggle = (t: Task) => {
    saveTasks(tasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x));
  };

  const remove = (id: string) => {
    saveTasks(tasks.filter(x => x.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 mb-2">
        <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
          placeholder="New directive..."
          className="flex-1 bg-input/60 border border-primary/40 rounded px-2 py-1 text-xs font-mono outline-none focus:border-primary" />
        <select value={pri} onChange={e => setPri(e.target.value as Priority)}
          className="bg-input/60 border border-primary/40 rounded px-1 text-[10px] font-mono text-primary">
          {(["CRITICAL","HIGH","NORMAL","LOW"] as Priority[]).map(p => <option key={p}>{p}</option>)}
        </select>
        <button onClick={add} className="p-1 border border-primary/50 rounded text-primary hover:glow-sm"><Plus className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {tasks.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No directives queued.</div>}
        {tasks.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-2 py-1.5 rounded border ${priColor[t.priority]} bg-background/40`}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t)} className="accent-primary" />
            <span className={`text-xs flex-1 font-mono ${t.done ? "line-through opacity-50" : ""}`}>{t.title}</span>
            <span className="text-[9px] tracking-wider">{t.priority}</span>
            <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 hover:text-destructive">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
