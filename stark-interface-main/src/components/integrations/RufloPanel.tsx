import { useState } from "react";
import { HudPanel } from "@/components/jarvis/HudPanel";
import { runRuflo } from "@/lib/integrations/rufloClient";

export const RufloPanel = () => {
  const [out, setOut] = useState('');
  const [args, setArgs] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true); setOut('');
    const r = await runRuflo(args ? args.split(' ') : []);
    setOut(JSON.stringify(r, null, 2)); setBusy(false);
  };

  return (
    <HudPanel title="Ruflo CLI" icon={null}>
      <div className="space-y-2">
        <input value={args} onChange={e => setArgs(e.target.value)} placeholder="args e.g. --help" className="w-full bg-input/60 border border-primary/40 rounded px-2 py-1 text-xs" />
        <button onClick={run} disabled={busy} className="p-2 bg-primary/20 border border-primary rounded text-xs">{busy ? 'RUNNING...' : 'Run Ruflo'}</button>
        <pre className="mt-2 text-xs bg-background/30 p-2 rounded overflow-auto max-h-48">{out}</pre>
      </div>
    </HudPanel>
  );
};
