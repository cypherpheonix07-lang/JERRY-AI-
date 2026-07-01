
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/store/jarvisStore.ts
// Zustand store with persistence — syncs with backend via WebSocket
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SystemMetrics {
  cpu: number;
  memory: number;
  gpu: number;
  network: number;
  temperature: number;
  uptime: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success';
  source: string;
  message: string;
}

export interface AgentTask {
  id: string;
  agent: 'hermes' | 'rufolo' | 'jarvis';
  status: 'pending' | 'running' | 'completed' | 'failed';
  description: string;
  progress: number;
  startedAt: number;
  completedAt?: number;
}

interface JarvisState {
  // System state
  systemMetrics: SystemMetrics;
  modelStatus: 'local' | 'cloud' | 'hybrid' | 'offline';
  activeAgents: number;

  // UI state
  activeTab: string;
  bootComplete: boolean;
  sidebarOpen: boolean;

  // Data
  logEntries: LogEntry[];
  agentTasks: AgentTask[];
  skills: string[];
  memories: number;

  // Actions
  setSystemMetrics: (metrics: SystemMetrics) => void;
  setModelStatus: (status: JarvisState['modelStatus']) => void;
  setActiveAgents: (count: number) => void;
  setActiveTab: (tab: string) => void;
  setBootComplete: (complete: boolean) => void;
  addLogEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  addAgentTask: (task: Omit<AgentTask, 'id' | 'startedAt'>) => void;
  updateAgentTask: (id: string, updates: Partial<AgentTask>) => void;
  setSkills: (skills: string[]) => void;
  setMemories: (count: number) => void;
}

export const useJarvisStore = create<JarvisState>()(
  persist(
    (set, get) => ({
      // Initial state
      systemMetrics: {
        cpu: 0,
        memory: 0,
        gpu: 0,
        network: 0,
        temperature: 0,
        uptime: '00:00:00'
      },
      modelStatus: 'offline',
      activeAgents: 0,
      activeTab: 'overview',
      bootComplete: false,
      sidebarOpen: true,
      logEntries: [],
      agentTasks: [],
      skills: [],
      memories: 0,

      // Actions
      setSystemMetrics: (metrics) => set({ systemMetrics: metrics }),

      setModelStatus: (status) => set({ modelStatus: status }),

      setActiveAgents: (count) => set({ activeAgents: count }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setBootComplete: (complete) => set({ bootComplete: complete }),

      addLogEntry: (entry) => set((state) => ({
        logEntries: [
          {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            ...entry
          },
          ...state.logEntries.slice(0, 499) // Keep last 500
        ]
      })),

      addAgentTask: (task) => set((state) => ({
        agentTasks: [
          {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            startedAt: Date.now(),
            ...task
          },
          ...state.agentTasks
        ]
      })),

      updateAgentTask: (id, updates) => set((state) => ({
        agentTasks: state.agentTasks.map(t =>
          t.id === id ? { ...t, ...updates } : t
        )
      })),

      setSkills: (skills) => set({ skills }),

      setMemories: (count) => set({ memories: count })
    }),
    {
      name: 'jarvis-storage',
      partialize: (state) => ({
        activeTab: state.activeTab,
        bootComplete: state.bootComplete,
        sidebarOpen: state.sidebarOpen,
        skills: state.skills,
        memories: state.memories
      })
    }
  )
);
