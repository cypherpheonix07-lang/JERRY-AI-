/**
 * Main dashboard layout component
 */
import React, { useState } from 'react';
import {
  Activity,
  Airplay,
  BatteryCharging,
  Cpu,
  Globe,
  Layers,
  Shield,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { ChatContainer } from '@/components/Chat';
import { VoiceControls } from '@/components/VoiceControls';
import { useConversationStore } from '@/store';

const navItems = [
  { label: 'Dashboard', icon: Activity },
  { label: 'Systems', icon: Cpu },
  { label: 'Network', icon: Wifi },
  { label: 'Security', icon: Shield },
  { label: 'Sensors', icon: Airplay },
  { label: 'Ops', icon: Layers },
];

const statusItems = [
  { label: 'Power', value: '98%', icon: BatteryCharging },
  { label: 'Net', value: '21ms', icon: Globe },
  { label: 'AI', value: '4/5', icon: Sparkles },
];

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { messages, isLoading } = useConversationStore();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030515] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.16),transparent_18%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,25,0.95),rgba(2,5,15,0.96))]" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_40%)]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[28px] border border-sky-400/20 bg-slate-950/70 shadow-[0_0_40px_rgba(56,189,248,0.16)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-slate-700/60 bg-slate-900/80 text-sky-300 font-black tracking-[0.35em] uppercase">
                AI
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.5em] text-sky-300/60">Holographic Interface</p>
              <h1 className="text-3xl font-black uppercase tracking-[-0.02em] text-white glow-text">J.A.R.V.I.S.</h1>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Command Suite</p>
            </div>
          </div>

          <div className="flex gap-3 text-[10px] uppercase tracking-[0.35em] text-slate-300">
            <span className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sky-300/90">Active</span>
            <span className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-slate-300/90">Sync</span>
            <span className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-slate-300/90">Core 18.4</span>
          </div>
        </header>
        <div className="mx-8 mb-5 h-px bg-slate-600/20" />

        <main className="flex-1 px-8 pb-8">
          <div className="grid h-full grid-cols-[260px_minmax(0,1fr)_360px] gap-5">
            <aside className="space-y-5">
              <div className="hud-panel p-5">
                <div className="mb-4 flex items-center justify-between text-slate-400">
                  <div className="space-y-0.5 text-[10px] uppercase tracking-[0.5em] text-slate-300/80">
                    <p>Command</p>
                    <p>Channels</p>
                  </div>
                  <span className="rounded-full border border-sky-400/20 bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-sky-300">Live</span>
                </div>
                <div className="space-y-3">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const active = activeTab === item.label;
                    return (
                      <button
                        key={item.label}
                        onClick={() => setActiveTab(item.label)}
                        className={`group flex w-full items-center gap-3 rounded-[32px] border px-4 py-3 text-left transition ${
                          active
                            ? 'border-sky-400/60 bg-sky-500/10 text-white shadow-[0_22px_46px_rgba(56,189,248,0.2)]'
                            : 'border-slate-700/70 bg-slate-950/70 text-slate-300 hover:border-slate-500/70 hover:bg-slate-900/80'
                        }`}
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-slate-700/70 bg-slate-900/85 text-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.08)]">
                          <Icon size={18} />
                        </span>
                        <span className="font-semibold tracking-[0.04em]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hud-panel p-5">
                <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-400">
                  <span className="text-[10px] uppercase tracking-[0.45em] text-slate-300/80">System Status</span>
                  <span className="rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-300">Real-time</span>
                </div>
                <div className="grid gap-3">
                  {statusItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center justify-between rounded-3xl border border-slate-700/70 bg-slate-900/80 px-4 py-3 shadow-[inset_0_0_25px_rgba(0,0,0,0.2)]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/85 text-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.08)]">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{item.label}</p>
                            <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            <section className="hud-panel relative overflow-hidden rounded-[56px] border border-slate-700/70 bg-[#08111f]/95 p-6 shadow-[0_40px_90px_rgba(0,0,0,0.46)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_45%)] pointer-events-none" />
              <div className="absolute -left-24 top-1/2 h-[440px] w-[440px] -translate-y-1/2 rounded-full border border-sky-500/10 opacity-30" />
              <div className="absolute right-8 top-12 h-24 w-24 rounded-full border border-sky-400/20 opacity-30" />
              <div className="absolute left-16 bottom-20 h-24 w-24 rounded-full border border-slate-600/20 opacity-30" />

              <div className="relative flex h-full flex-col items-center justify-center">
                <div className="relative flex h-[420px] w-[420px] items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-slate-600/40 animate-spin-slow" />
                  <div className="absolute inset-6 rounded-full border border-slate-600/30" />
                  <div className="absolute inset-14 rounded-full border border-sky-500/20 animate-spin-rev" />
                  <div className="absolute inset-22 rounded-full border border-slate-600/25" />
                  <div className="absolute inset-30 rounded-full border border-sky-300/15" />
                  <div className="absolute inset-36 rounded-full border border-sky-400/10 animate-spin-slow" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-40 w-40 items-center justify-center rounded-full border border-slate-500/30 bg-slate-950/70 backdrop-blur-xl shadow-[0_0_45px_rgba(56,189,248,0.12)] animate-pulse-arc">
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.55em] text-sky-300/60">Core Sync</p>
                        <h2 className="mt-3 text-7xl font-black uppercase tracking-[-0.03em] text-gradient-hud">32</h2>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.6em] text-slate-400">Holographic Engine</p>
                      </div>
                    </div>
                  </div>

                  {Array.from({ length: 12 }).map((_, index) => (
                    <div
                      key={index}
                      className="absolute left-1/2 top-1/2 h-10 w-1 rounded-full bg-sky-400/20"
                      style={{ transform: `translate(-50%, -50%) rotate(${index * 30}deg) translateY(-210px)` }}
                    />
                  ))}
                </div>

                <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-4">
                  {['CPU', 'MEM', 'DDS'].map((label) => (
                    <div key={label} className="rounded-3xl border border-slate-700/70 bg-slate-950/75 px-4 py-4 text-center shadow-[inset_0_0_18px_rgba(0,0,0,0.18)] glow-sm">
                      <p className="text-[10px] uppercase tracking-[0.45em] text-slate-400">{label}</p>
                      <p className="mt-2 text-3xl font-semibold text-gradient-hud glow-text">{label === 'CPU' ? '68%' : label === 'MEM' ? '42%' : '18ms'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <div className="hud-panel p-5">
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-400">
                  <span className="text-[10px] uppercase tracking-[0.45em] text-slate-300/80">Environmental Feed</span>
                  <span className="rounded-full bg-slate-900/80 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-sky-300">Live</span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-700/70 bg-slate-900/85 px-4 py-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.25)]">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>External Temp</span>
                      <span className="text-white font-semibold">31°F</span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-slate-400">
                      <div className="flex justify-between"><span>Pressure</span><span>1016 hPa</span></div>
                      <div className="flex justify-between"><span>Humidity</span><span>42%</span></div>
                      <div className="flex justify-between"><span>Cloud</span><span>Partly cloudy</span></div>
                    </div>
                  </div>
                  <div className="rounded-[32px] border border-slate-700/70 bg-slate-900/85 px-4 py-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Traffic</span>
                      <span className="text-white font-semibold">54%</span>
                    </div>
                    <div className="mt-3 rounded-[28px] bg-slate-950/90 px-4 py-3 text-[10px] uppercase tracking-[0.45em] text-slate-400 ring-1 ring-slate-700/60">
                      stable throughput, low latency
                    </div>
                  </div>
                </div>
              </div>

              <div className="hud-panel p-5 scanline">
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-400">
                  <span className="text-[10px] uppercase tracking-[0.45em] text-slate-300/80">Communication</span>
                  <span className="rounded-full bg-slate-900/80 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-300">Messages</span>
                </div>
                <div className="rounded-[26px] border border-slate-700/60 bg-[#071018]/60 p-3">
                  <ChatContainer messages={messages} isLoading={isLoading} />
                </div>
              </div>

              <VoiceControls />
            </aside>
          </div>
        </main>

        <footer className="px-8 pb-6">
          <div className="hud-panel px-6 py-4 text-sm text-slate-400">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>System health 98% · Autonomous mode engaged · Persistence logs stabilized</span>
              <span className="rounded-full bg-slate-900/80 px-3 py-2 text-[11px] uppercase tracking-[0.35em] text-slate-400">Last update 00:14</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
