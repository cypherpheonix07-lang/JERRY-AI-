/**
 * J.A.R.V.I.S Enhanced Event Bus
 * Central pub/sub for ALL systems — 30+ event types
 * All cross-module communication flows through here
 */

export interface EventMap {
  // Boot Sequence
  'boot:phase': { phase: number; name: string };
  'boot:complete': { duration: number };

  // AI / Model
  'model:changed': { modelId: string; label: string };
  'jarvis:thinking': { visible: boolean };
  'jarvis:speaking': { text: string; context?: 'normal' | 'urgent' | 'whisper' | 'empathy' | 'celebratory' };
  'jarvis:idle': {};
  'jarvis:response': { text: string; model: string; latency: number };
  'jarvis:alert': { message: string; urgent: boolean; actionId?: string };

  // Tasks
  'task:created': { taskId: string; title: string; priority?: 'low' | 'medium' | 'high' };
  'task:completed': { taskId: string; duration: number; satisfaction?: number };

  // Memory
  'memory:extracted': { count: number; type: string[] };
  'memory:contradiction': { statementA: string; statementB: string; confidence: number };

  // Emotion / Digital Twin
  'emotion:detected': { valence: number; arousal: number; label: string };
  'twin:state-updated': { cognitiveLoad: number; stressIndex: number; focusDepth: number; energy: number };
  'twin:prediction': { query: string; confidence: number; category: string };

  // Focus / Flow
  'focus:start': { score: number; phase: 'entering' | 'light' | 'deep' | 'peak' };
  'focus:complete': { duration: number; peak: number; quality: number };

  // Social / Media
  'social:notification': { platform: string; type: string; summary: string };
  'spotify:playing': { track: string; artist: string; progress: number; duration: number };

  // Gesture / Screen
  'gesture:detected': { type: string; confidence: number };
  'screen:context': { mode: 'idle' | 'document' | 'code' | 'meeting' | 'presentation' };

  // Wake / Presence
  'wake:detected': { source: 'mic' | 'camera' | 'keyboard'; confidence: number };

  // Mesh (multi-tab)
  'mesh:peer-joined': { peerId: string; count: number };
  'mesh:peer-left': { peerId: string; count: number };
  'mesh:state-sync': { from: string; payload: Record<string, unknown> };

  // Autonomy
  'autonomy:action': { level: number; action: string; status: 'pending' | 'approved' | 'rejected' | 'executed' };

  // Scenario
  'scenario:generated': { decision: string; scenarios: { best: string; base: string; worst: string } };

  // Research
  'research:experiment': { hypothesis: string; result: 'positive' | 'negative' | 'inconclusive'; significance: number };

  // Ambient
  'ambient:sound': { classification: string; intensity: number };
  'ambient:mesh-status': { online: number; stale: number };

  // Zero Knowledge Vault
  'vault:locked': {};
  'vault:unlocked': {};
  'vault:breach-attempt': { count: number };

  // System
  'system:error': { source: string; error: string; recoverable: boolean };
  'system:health': { servicesOnline: number; servicesTotal: number; memory: number; cpu: number };
}

type EventCallback = (...args: unknown[]) => void;

class JarvisBus {
  private listeners: Map<keyof EventMap, Set<EventCallback>> = new Map();
  private history: Array<{ event: string; data: unknown; timestamp: number }> = [];
  private maxHistory = 200;

  on<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
    return () => {
      this.listeners.get(event)?.delete(callback as EventCallback);
    };
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          (callback as (data: EventMap[K]) => void)(data);
        } catch (error) {
          console.error(`[JarvisBus] Error in handler for ${String(event)}:`, error);
        }
      });
    }

    // Archive
    this.history.push({ event: String(event), data, timestamp: Date.now() });
    if (this.history.length > this.maxHistory) this.history.shift();
  }

  once<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): void {
    const wrapper = (data: EventMap[K]) => {
      callback(data);
      this.off(event, wrapper as (data: EventMap[K]) => void);
    };
    this.on(event, wrapper as (data: EventMap[K]) => void);
  }

  off<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  listenerCount<K extends keyof EventMap>(event: K): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /** Get recent event history for context injection */
  getHistory(lastN = 10): Array<{ event: string; data: unknown; timestamp: number }> {
    return this.history.slice(-lastN);
  }

  /** Clear all listeners (useful for hot-reload / cleanup) */
  clearAll(): void {
    this.listeners.clear();
  }
}

export const jarvisBus = new JarvisBus();
