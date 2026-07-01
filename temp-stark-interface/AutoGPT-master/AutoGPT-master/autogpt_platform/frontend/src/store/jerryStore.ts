// src/store/jerryStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HardwareDevice {
  id: string;
  name: string;
  type: 'tuya' | 'laptop' | 'gpio' | 'mqtt' | 'ble';
  status: 'online' | 'offline' | 'warning' | 'error';
  lastSeen: string; // ISO timestamp
  metrics: Record<string, number | string>;
  controls: DeviceControl[];
  location?: string;
  battery?: number;
}

export interface DeviceControl {
  id: string;
  label: string;
  type: 'toggle' | 'slider' | 'button' | 'select' | 'color';
  value: boolean | number | string;
  min?: number;
  max?: number;
  options?: string[];
  unit?: string;
  disabled?: boolean;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  sensorType: 'temperature' | 'humidity' | 'power' | 'cpu' | 'ram' | 'disk' | 'network' | 'custom';
  value: number;
  unit: string;
  timestamp: string;
  threshold?: { min: number; max: number };
  alert?: boolean;
}

export interface PipelineJob {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  stage: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  logs: string[];
}

export interface GuardRailRule {
  id: string;
  name: string;
  condition: string; // e.g., "cpu > 90"
  action: 'notify' | 'kill' | 'throttle' | 'shutdown' | 'custom';
  targetDevices: string[];
  enabled: boolean;
  triggeredCount: number;
  lastTriggered?: string;
}

export interface CommandLog {
  id: string;
  command: string;
  source: 'user' | 'agent' | 'pipeline' | 'guardrail';
  status: 'pending' | 'success' | 'error';
  timestamp: string;
  response?: string;
  latencyMs?: number;
}

export interface HardwareState {
  devices: HardwareDevice[];
  sensors: SensorReading[];
  pipelines: PipelineJob[];
  guardrails: GuardRailRule[];
  commandLog: CommandLog[];
  selectedDeviceId: string | null;
  isScanning: boolean;
  scanProgress: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  wsUrl: string;
}

export interface HardwareActions {
  // Device management
  addDevice: (device: HardwareDevice) => void;
  updateDevice: (id: string, patch: Partial<HardwareDevice>) => void;
  removeDevice: (id: string) => void;
  setDeviceStatus: (id: string, status: HardwareDevice['status']) => void;
  updateDeviceMetric: (deviceId: string, key: string, value: number | string) => void;
  setControlValue: (deviceId: string, controlId: string, value: unknown) => void;
  
  // Sensor management
  addSensorReading: (reading: SensorReading) => void;
  clearOldReadings: (beforeTimestamp: string) => void;
  getSensorHistory: (deviceId: string, sensorType: string, limit?: number) => SensorReading[];
  
  // Pipeline management
  addPipeline: (job: PipelineJob) => void;
  updatePipeline: (id: string, patch: Partial<PipelineJob>) => void;
  removePipeline: (id: string) => void;
  appendPipelineLog: (id: string, log: string) => void;
  
  // Guardrails
  addGuardRail: (rule: GuardRailRule) => void;
  toggleGuardRail: (id: string) => void;
  triggerGuardRail: (id: string) => void;
  
  // Command log
  logCommand: (entry: Omit<CommandLog, 'id' | 'timestamp'>) => void;
  clearCommandLog: () => void;
  
  // UI state
  selectDevice: (id: string | null) => void;
  setScanning: (scanning: boolean) => void;
  setScanProgress: (progress: number) => void;
  setConnectionStatus: (status: HardwareState['connectionStatus']) => void;
  setWsUrl: (url: string) => void;
  
  // Bulk operations
  syncFromServer: (state: Partial<HardwareState>) => void;
  resetHardware: () => void;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialHardwareState: HardwareState = {
  devices: [],
  sensors: [],
  pipelines: [],
  guardrails: [],
  commandLog: [],
  selectedDeviceId: null,
  isScanning: false,
  scanProgress: 0,
  connectionStatus: 'disconnected',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useJerryStore = create<HardwareState & HardwareActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialHardwareState,

        // ── Devices ──────────────────────────────────────────────────────────
        addDevice: (device) =>
          set((state) => {
            const exists = state.devices.find((d) => d.id === device.id);
            if (!exists) state.devices.push(device);
          }),

        updateDevice: (id, patch) =>
          set((state) => {
            const idx = state.devices.findIndex((d) => d.id === id);
            if (idx !== -1) Object.assign(state.devices[idx], patch);
          }),

        removeDevice: (id) =>
          set((state) => {
            state.devices = state.devices.filter((d) => d.id !== id);
            if (state.selectedDeviceId === id) state.selectedDeviceId = null;
          }),

        setDeviceStatus: (id, status) =>
          set((state) => {
            const device = state.devices.find((d) => d.id === id);
            if (device) device.status = status;
          }),

        updateDeviceMetric: (deviceId, key, value) =>
          set((state) => {
            const device = state.devices.find((d) => d.id === deviceId);
            if (device) device.metrics[key] = value;
          }),

        setControlValue: (deviceId, controlId, value) =>
          set((state) => {
            const device = state.devices.find((d) => d.id === deviceId);
            if (device) {
              const control = device.controls.find((c) => c.id === controlId);
              if (control) control.value = value as never;
            }
          }),

        // ── Sensors ─────────────────────────────────────────────────────────
        addSensorReading: (reading) =>
          set((state) => {
            state.sensors.push(reading);
            // Auto-prune to last 1000 readings per device+sensor combo
            const key = `${reading.deviceId}:${reading.sensorType}`;
            const related = state.sensors.filter(
              (s) => `${s.deviceId}:${s.sensorType}` === key
            );
            if (related.length > 1000) {
              const toRemove = related.length - 1000;
              state.sensors = state.sensors.filter(
                (s, i) => `${s.deviceId}:${s.sensorType}` !== key || i >= toRemove
              );
            }
          }),

        clearOldReadings: (beforeTimestamp) =>
          set((state) => {
            state.sensors = state.sensors.filter(
              (s) => s.timestamp > beforeTimestamp
            );
          }),

        getSensorHistory: (deviceId, sensorType, limit = 100) => {
          const { sensors } = get();
          return sensors
            .filter((s) => s.deviceId === deviceId && s.sensorType === sensorType)
            .slice(-limit);
        },

        // ── Pipelines ───────────────────────────────────────────────────────
        addPipeline: (job) =>
          set((state) => {
            state.pipelines.push(job);
          }),

        updatePipeline: (id, patch) =>
          set((state) => {
            const idx = state.pipelines.findIndex((p) => p.id === id);
            if (idx !== -1) Object.assign(state.pipelines[idx], patch);
          }),

        removePipeline: (id) =>
          set((state) => {
            state.pipelines = state.pipelines.filter((p) => p.id !== id);
          }),

        appendPipelineLog: (id, log) =>
          set((state) => {
            const job = state.pipelines.find((p) => p.id === id);
            if (job) {
              job.logs.push(`[${new Date().toISOString()}] ${log}`);
              if (job.logs.length > 500) job.logs.shift();
            }
          }),

        // ── Guardrails ──────────────────────────────────────────────────────
        addGuardRail: (rule) =>
          set((state) => {
            state.guardrails.push(rule);
          }),

        toggleGuardRail: (id) =>
          set((state) => {
            const rule = state.guardrails.find((r) => r.id === id);
            if (rule) rule.enabled = !rule.enabled;
          }),

        triggerGuardRail: (id) =>
          set((state) => {
            const rule = state.guardrails.find((r) => r.id === id);
            if (rule) {
              rule.triggeredCount += 1;
              rule.lastTriggered = new Date().toISOString();
            }
          }),

        // ── Command Log ─────────────────────────────────────────────────────
        logCommand: (entry) =>
          set((state) => {
            state.commandLog.unshift({
              ...entry,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            });
            if (state.commandLog.length > 200) state.commandLog.pop();
          }),

        clearCommandLog: () =>
          set((state) => {
            state.commandLog = [];
          }),

        // ── UI State ─────────────────────────────────────────────────────────
        selectDevice: (id) =>
          set((state) => {
            state.selectedDeviceId = id;
          }),

        setScanning: (scanning) =>
          set((state) => {
            state.isScanning = scanning;
            if (!scanning) state.scanProgress = 0;
          }),

        setScanProgress: (progress) =>
          set((state) => {
            state.scanProgress = Math.min(100, Math.max(0, progress));
          }),

        setConnectionStatus: (status) =>
          set((state) => {
            state.connectionStatus = status;
          }),

        setWsUrl: (url) =>
          set((state) => {
            state.wsUrl = url;
          }),

        // ── Bulk Operations ─────────────────────────────────────────────────
        syncFromServer: (serverState) =>
          set((state) => {
            Object.assign(state, serverState);
          }),

        resetHardware: () =>
          set((state) => {
            Object.assign(state, initialHardwareState);
          }),
      })),
      {
        name: 'jerry-hardware-store',
        partialize: (state) => ({
          devices: state.devices,
          guardrails: state.guardrails,
          wsUrl: state.wsUrl,
        }),
      }
    ),
    { name: 'JerryStore' }
  )
);

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectOnlineDevices = (state: HardwareState) =>
  state.devices.filter((d) => d.status === 'online');

export const selectDevicesByType = (type: HardwareDevice['type']) => (state: HardwareState) =>
  state.devices.filter((d) => d.type === type);

export const selectActivePipelines = (state: HardwareState) =>
  state.pipelines.filter((p) => p.status === 'running' || p.status === 'queued');

export const selectAlertSensors = (state: HardwareState) =>
  state.sensors.filter((s) => s.alert);

export const selectSelectedDevice = (state: HardwareState) =>
  state.devices.find((d) => d.id === state.selectedDeviceId) ?? null;

export const selectCommandStats = (state: HardwareState) => ({
  total: state.commandLog.length,
  success: state.commandLog.filter((c) => c.status === 'success').length,
  error: state.commandLog.filter((c) => c.status === 'error').length,
  pending: state.commandLog.filter((c) => c.status === 'pending').length,
});