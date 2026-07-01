/**
 * Voice control UI component with status indicators
 */
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { useVoicePipelineStore, useAudioStore, useConversationStore } from '@/store';

export const VoiceControls: React.FC = () => {
  const { isConnected, setConnected } = useVoicePipelineStore();
  const { isMuted, setMuted, volume, setVolume } = useAudioStore();
  const { connectionStatus } = useConversationStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleToggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  }, [setVolume]);

  const handleConnection = useCallback(() => {
    setIsConnecting(true);
    setConnected(!isConnected);
    setTimeout(() => {
      setIsConnecting(false);
    }, 1000);
  }, [isConnected, setConnected]);

  return (
    <div className="hud-panel p-5">
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-400">
        <span>Voice Interface</span>
        <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.35em] ${
          isConnected ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-700/70 bg-slate-900/80 text-slate-300'
        }`}>
          {isConnected ? 'Connected' : 'Offline'}
        </span>
      </div>

      <div className="grid gap-4">
        <div className="rounded-3xl border border-slate-700/70 bg-slate-900/85 px-4 py-4 shadow-[inset_0_0_22px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-400">
            <span>Mic</span>
            <span className="text-white font-semibold">{isMuted ? 'Muted' : 'Live'}</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={handleToggleMute}
              className={`flex-1 rounded-[28px] px-4 py-3 text-sm font-semibold transition ${
                isMuted ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-500/20' : 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30 hover:bg-sky-500/20'
              }`}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <div className="rounded-[28px] bg-slate-950/85 px-4 py-3 text-sm text-slate-300 ring-1 ring-slate-700/50">
              {connectionStatus}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/70 bg-slate-900/85 px-4 py-4">
          <div className="mb-2 text-xs uppercase tracking-[0.35em] text-slate-400">Volume</div>
          <div className="flex items-center gap-3">
            <VolumeX size={18} className="text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-slate-700"
            />
            <Volume2 size={18} className="text-slate-400" />
          </div>
        </div>

        <button
          onClick={handleConnection}
          disabled={isConnecting}
          className={`w-full rounded-3xl border border-slate-700/70 px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] transition ${
            isConnected
              ? 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20'
              : 'bg-sky-500/15 text-sky-200 hover:bg-sky-500/20'
          } ${isConnecting ? 'opacity-60 pointer-events-none' : ''}`}
        >
          {isConnecting ? 'Establishing...' : isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
};
