/**
 * J.A.R.V.I.S Comprehensive Zustand Store
 * Persisted to localStorage — single source of truth for all state
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────────

export interface JARVISMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  latency?: number;
  tokens?: number;
}

export interface JARVISTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'todo' | 'in-progress' | 'done' | 'archived';
  tags: string[];
  createdAt: number;
  dueDate?: number;
  completedAt?: number;
  duration?: number;
  source?: 'memory' | 'conversation' | 'email' | 'manual' | 'autonomous';
  category?: string;
}

export interface JARVISMemory {
  id: string;
  text: string;
  type: 'fact' | 'preference' | 'event' | 'decision' | 'emotion' | 'observation' | 'contradiction';
  category: string;
  timestamp: number;
  confidence: number;
  source?: string;
  tags: string[];
  relatedIds?: string[];
}

export interface ServiceStatus {
  name: string;
  label: string;
  online: boolean;
  lastCheck: number;
  type: 'ai' | 'os' | 'communication' | 'media' | 'productivity' | 'social' | 'iot' | 'data';
}

export interface ThemeConfig {
  name: string;
  color: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
}

export interface AlertItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}

export interface MetricDataPoint {
  timestamp: number;
  value: number;
  metric: string;
}

export interface PacketEntry {
  time: string;
  source: string;
  dest: string;
  proto: string;
  size: number;
  flag: 'IN' | 'OUT';
}

export interface SecurityAlert {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  source: string;
}

export interface GuardrailStatus {
  contentFilter: boolean;
  jailbreakProtection: boolean;
  promptInjection: boolean;
  toxicContent: boolean;
}

export interface BiometricReading {
  timestamp: number;
  heartRate: number;
  stressLevel: number;
  focusScore: number;
}

export interface AgentTask {
  id: string;
  agent: 'hermes' | 'rufolo' | 'jarvis';
  title: string;
  status: 'running' | 'pending' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
  read: boolean;
}

// ── State ──────────────────────────────────────────────────────────────────

interface ConnectionState {
  wsConnected: boolean;
  mode: 'online' | 'offline';
  lastSync: number;
}

interface MetricsState {
  cpu: number;
  memory: number;
  network: number;
  uptime: string;
  temperature: number;
  activeConnections: number;
  requestsToday: number;
}

interface DashboardState {
  selectedTimeRange: '1h' | '6h' | '24h' | '7d';
  pinnedWidgets: string[];
  alertHistory: AlertItem[];
}

interface SystemsState {
  selectedMetric: 'cpu' | 'memory' | 'disk' | 'network';
  processSort: { column: string; direction: 'asc' | 'desc' };
  processFilter: string;
  showKernelProcesses: boolean;
  historicalData: MetricDataPoint[];
}

interface NetworkState {
  selectedInterface: string;
  trafficView: 'realtime' | 'hourly' | 'daily';
  connectionFilter: 'all' | 'incoming' | 'outgoing';
  latencyTarget: string;
  packetLog: PacketEntry[];
}

interface SecurityState {
  selectedTimeRange: '1h' | '24h' | '7d' | '30d';
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeAlerts: SecurityAlert[];
  auditFilter: string;
  guardrailStatus: GuardrailStatus;
}

interface SensorsState {
  cameraActive: boolean;
  selectedSensor: 'camera' | 'microphone' | 'environmental';
  biometricData: BiometricReading[];
  calibrationStatus: 'uncalibrated' | 'calibrating' | 'calibrated';
  rppgEnabled: boolean;
}

interface OpsState {
  selectedAgent: 'hermes' | 'rufolo' | 'jarvis' | 'all';
  taskFilter: 'all' | 'running' | 'pending' | 'completed' | 'failed';
  workflowView: 'list' | 'graph' | 'timeline';
  activeTasks: AgentTask[];
  queueDepth: number;
}

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  notifications: Notification[];
}

interface JARVISState {
  // Identity
  userName: string;
  userTitle: string;
  activeTheme: string;

  // Connection & UI
  connection: ConnectionState;
  ui: UIState;
  
  // Shared system metrics
  metrics: MetricsState;
  
  // Page-specific states
  dashboard: DashboardState;
  systems: SystemsState;
  network: NetworkState;
  security: SecurityState;
  sensors: SensorsState;
  ops: OpsState;

  // AI / Model
  activeModel: string;
  isThinking: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  messages: JARVISMessage[];
  totalTokens: number;
  totalCostUsd: number;

  // Tasks
  tasks: JARVISTask[];

  // Memory
  memories: JARVISMemory[];

  // Services
  services: ServiceStatus[];

  // Social
  instagramUnread: number;
  twitterMentions: number;
  gmailUnread: number;
  githubNotifications: number;

  // Media
  spotifyConnected: boolean;
  googleConnected: boolean;
  nowPlaying: { track: string; artist: string; progress: number; duration: number } | null;

  // System
  hermesOnline: boolean;
  pythonServerOnline: boolean;
  homeDevices: number;
  upcomingEvents: number;
  connectedServices: number;

  // Focus
  inFocusMode: boolean;
  focusScore: number;
  focusDuration: number;

  // Mesh
  meshNodes: number;

  // Boot
  bootComplete: boolean;
  bootPhase: number;

  // Actions
  setUserName: (name: string) => void;
  setUserTitle: (title: string) => void;
  setActiveTheme: (theme: string) => void;
  setActiveModel: (model: string) => void;
  setIsThinking: (v: boolean) => void;
  setIsSpeaking: (v: boolean) => void;
  setIsListening: (v: boolean) => void;
  addMessage: (msg: JARVISMessage) => void;
  addTask: (task: JARVISTask) => void;
  updateTask: (id: string, update: Partial<JARVISTask>) => void;
  addMemory: (memory: JARVISMemory) => void;
  updateService: (name: string, online: boolean) => void;
  setSpotifyConnected: (v: boolean) => void;
  setGoogleConnected: (v: boolean) => void;
  setNowPlaying: (v: JARVISState['nowPlaying']) => void;
  setHermesOnline: (v: boolean) => void;
  setPythonServerOnline: (v: boolean) => void;
  setInFocusMode: (v: boolean) => void;
  setFocusScore: (v: number) => void;
  setBootPhase: (v: number) => void;
  setBootComplete: (v: boolean) => void;
  setMeshNodes: (v: number) => void;
  addTokens: (t: number, cost: number) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_SERVICES: ServiceStatus[] = [
  { name: 'ai', label: 'AI', online: false, lastCheck: 0, type: 'ai' },
  { name: 'os', label: 'OS', online: false, lastCheck: 0, type: 'os' },
  { name: 'hermes', label: 'HERMES', online: false, lastCheck: 0, type: 'communication' },
  { name: 'claw', label: 'CLAW', online: false, lastCheck: 0, type: 'communication' },
  { name: 'ig', label: 'IG', online: false, lastCheck: 0, type: 'social' },
  { name: 'x', label: 'X', online: false, lastCheck: 0, type: 'social' },
  { name: 'spotify', label: 'SPOTIFY', online: false, lastCheck: 0, type: 'media' },
  { name: 'mail', label: 'MAIL', online: false, lastCheck: 0, type: 'productivity' },
  { name: 'gh', label: 'GH', online: false, lastCheck: 0, type: 'productivity' },
  { name: 'notion', label: 'NOTION', online: false, lastCheck: 0, type: 'productivity' },
  { name: 'ha', label: 'HA', online: false, lastCheck: 0, type: 'iot' },
  { name: 'local', label: 'LOCAL', online: true, lastCheck: Date.now(), type: 'os' },
];

// ── Store ──────────────────────────────────────────────────────────────────

export const useJarvisStore = create<JARVISState>()(
  persist(
    (set, get) => ({
      // Identity
      userName: 'Phanindra',
      userTitle: 'Commander',
      activeTheme: 'classic',

      // Connection & UI
      connection: {
        wsConnected: false,
        mode: 'online' as const,
        lastSync: Date.now(),
      },
      
      // Shared system metrics
      metrics: {
        cpu: 34,
        memory: 62,
        network: 12,
        uptime: '14:32:18',
        temperature: 58,
        activeConnections: 12,
        requestsToday: 47,
      },
      
      // Page-specific initial states
      dashboard: {
        selectedTimeRange: '1h',
        pinnedWidgets: ['reactor', 'overview', 'activity', 'actions'],
        alertHistory: [],
      },
      systems: {
        selectedMetric: 'cpu',
        processSort: { column: 'cpu', direction: 'desc' },
        processFilter: '',
        showKernelProcesses: false,
        historicalData: [],
      },
      network: {
        selectedInterface: 'eth0',
        trafficView: 'realtime',
        connectionFilter: 'all',
        latencyTarget: '',
        packetLog: [],
      },
      security: {
        selectedTimeRange: '1h',
        threatLevel: 'low',
        activeAlerts: [],
        auditFilter: '',
        guardrailStatus: {
          contentFilter: true,
          jailbreakProtection: true,
          promptInjection: true,
          toxicContent: true,
        },
      },
      sensors: {
        cameraActive: false,
        selectedSensor: 'camera',
        biometricData: [],
        calibrationStatus: 'uncalibrated',
        rppgEnabled: false,
      },
      ops: {
        selectedAgent: 'all',
        taskFilter: 'all',
        workflowView: 'list',
        activeTasks: [],
        queueDepth: 0,
      },
      
      ui: {
        sidebarCollapsed: false,
        theme: 'dark',
        notifications: [],
      },

      // AI
      activeModel: 'claude-sonnet-4',
      isThinking: false,
      isSpeaking: false,
      isListening: false,
      messages: [],
      totalTokens: 0,
      totalCostUsd: 0,

      // Tasks
      tasks: [],

      // Memory
      memories: [],

      // Services
      services: DEFAULT_SERVICES,

      // Social
      instagramUnread: 0,
      twitterMentions: 0,
      gmailUnread: 0,
      githubNotifications: 0,

      // Media
      spotifyConnected: false,
      googleConnected: false,
      nowPlaying: null,

      // System
      hermesOnline: false,
      pythonServerOnline: false,
      homeDevices: 0,
      upcomingEvents: 0,
      connectedServices: 0,

      // Focus
      inFocusMode: false,
      focusScore: 0,
      focusDuration: 0,

      // Mesh
      meshNodes: 1,

      // Boot
      bootComplete: false,
      bootPhase: 0,

      // ── Actions ──

      setUserName: (name) => set({ userName: name }),
      setUserTitle: (title) => set({ userTitle: title }),
      setActiveTheme: (theme) => set({ activeTheme: theme }),
      setActiveModel: (model) => set({ activeModel: model }),
      setIsThinking: (v) => set({ isThinking: v }),
      setIsSpeaking: (v) => set({ isSpeaking: v }),
      setIsListening: (v) => set({ isListening: v }),

      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),

      updateTask: (id, update) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...update } : t)),
        })),

      addMemory: (memory) =>
        set((state) => ({
          memories: [...state.memories, memory],
        })),

      updateService: (name, online) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.name === name ? { ...s, online, lastCheck: Date.now() } : s
          ),
          connectedServices: state.services.filter((s) =>
            s.name === name ? online : s.online
          ).length,
        })),

      setSpotifyConnected: (v) => set({ spotifyConnected: v }),
      setGoogleConnected: (v) => set({ googleConnected: v }),
      setNowPlaying: (np) => set({ nowPlaying: np }),
      setHermesOnline: (v) => set({ hermesOnline: v }),
      setPythonServerOnline: (v) => set({ pythonServerOnline: v }),
      setInFocusMode: (v) => set({ inFocusMode: v }),
      setFocusScore: (v) => set({ focusScore: v }),
      setBootPhase: (v) => set({ bootPhase: v }),
      setBootComplete: (v) => set({ bootComplete: v }),
      setMeshNodes: (v) => set({ meshNodes: v }),

      addTokens: (tokens, cost) =>
        set((state) => ({
          totalTokens: state.totalTokens + tokens,
          totalCostUsd: state.totalCostUsd + cost,
        })),

      // Connection & UI actions
      setWsConnected: (connected: boolean) => 
        set((state) => ({ 
          connection: { ...state.connection, wsConnected: connected, lastPing: Date.now() } 
        })),
      setLatency: (latency: number) =>
        set((state) => ({
          connection: { ...state.connection, latency, lastPing: Date.now() }
        })),
      toggleSidebar: () =>
        set((state) => ({
          ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed }
        })),
      setSidebarCollapsed: (collapsed: boolean) =>
        set((state) => ({
          ui: { ...state.ui, sidebarCollapsed: collapsed }
        })),
      setTheme: (theme: 'dark' | 'light') =>
        set((state) => ({
          ui: { ...state.ui, theme }
        })),
      addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) =>
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, {
              ...notification,
              id: Date.now().toString(),
              timestamp: Date.now(),
              read: false
            }]
          }
        })),
      
      // Dashboard actions
      setDashboardTimeRange: (range: '1h' | '6h' | '24h' | '7d') =>
        set((state) => ({
          dashboard: { ...state.dashboard, selectedTimeRange: range }
        })),
      addDashboardAlert: (alert: Omit<AlertItem, 'timestamp'>) =>
        set((state) => ({
          dashboard: {
            ...state.dashboard,
            alertHistory: [...state.dashboard.alertHistory, { ...alert, timestamp: Date.now() }]
          }
        })),
      
      // Systems actions
      setSystemsSelectedMetric: (metric: 'cpu' | 'memory' | 'disk' | 'network') =>
        set((state) => ({
          systems: { ...state.systems, selectedMetric: metric }
        })),
      setSystemsProcessSort: (sort: { column: string; direction: 'asc' | 'desc' }) =>
        set((state) => ({
          systems: { ...state.systems, processSort: sort }
        })),
      addMetricDataPoint: (point: MetricDataPoint) =>
        set((state) => ({
          systems: {
            ...state.systems,
            historicalData: [...state.systems.historicalData.slice(-99), point]
          }
        })),
      
      // Network actions
      setNetworkSelectedInterface: (iface: string) =>
        set((state) => ({
          network: { ...state.network, selectedInterface: iface }
        })),
      setNetworkTrafficView: (view: 'realtime' | 'hourly' | 'daily') =>
        set((state) => ({
          network: { ...state.network, trafficView: view }
        })),
      addPacketLog: (packet: PacketEntry) =>
        set((state) => ({
          network: {
            ...state.network,
            packetLog: [...state.network.packetLog.slice(-49), packet]
          }
        })),
      
      // Security actions
      setSecurityTimeRange: (range: '1h' | '24h' | '7d' | '30d') =>
        set((state) => ({
          security: { ...state.security, selectedTimeRange: range }
        })),
      setThreatLevel: (level: 'low' | 'medium' | 'high' | 'critical') =>
        set((state) => ({
          security: { ...state.security, threatLevel: level }
        })),
      addSecurityAlert: (alert: Omit<SecurityAlert, 'timestamp'>) =>
        set((state) => ({
          security: {
            ...state.security,
            activeAlerts: [...state.security.activeAlerts, { ...alert, timestamp: Date.now() }]
          }
        })),
      
      // Sensors actions
      setCameraActive: (active: boolean) =>
        set((state) => ({
          sensors: { ...state.sensors, cameraActive: active }
        })),
      setSelectedSensor: (sensor: 'camera' | 'microphone' | 'environmental') =>
        set((state) => ({
          sensors: { ...state.sensors, selectedSensor: sensor }
        })),
      setCalibrationStatus: (status: 'uncalibrated' | 'calibrating' | 'calibrated') =>
        set((state) => ({
          sensors: { ...state.sensors, calibrationStatus: status }
        })),
      addBiometricReading: (reading: BiometricReading) =>
        set((state) => ({
          sensors: {
            ...state.sensors,
            biometricData: [...state.sensors.biometricData.slice(-99), reading]
          }
        })),
      
      // Ops actions
      setSelectedAgent: (agent: 'hermes' | 'rufolo' | 'jarvis' | 'all') =>
        set((state) => ({
          ops: { ...state.ops, selectedAgent: agent }
        })),
      setTaskFilter: (filter: 'all' | 'running' | 'pending' | 'completed' | 'failed') =>
        set((state) => ({
          ops: { ...state.ops, taskFilter: filter }
        })),
      setWorkflowView: (view: 'list' | 'graph' | 'timeline') =>
        set((state) => ({
          ops: { ...state.ops, workflowView: view }
        })),
      addAgentTask: (task: Omit<AgentTask, 'createdAt'>) =>
        set((state) => ({
          ops: {
            ...state.ops,
            activeTasks: [...state.ops.activeTasks, { ...task, createdAt: Date.now() }],
            queueDepth: state.ops.queueDepth + 1
          }
        })),
      updateAgentTask: (id: string, update: Partial<AgentTask>) =>
        set((state) => ({
          ops: {
            ...state.ops,
            activeTasks: state.ops.activeTasks.map(t => t.id === id ? { ...t, ...update } : t)
          }
        })),
      
      // Global metrics update
      updateMetrics: (metrics: Partial<MetricsState>) =>
        set((state) => ({
          metrics: { ...state.metrics, ...metrics }
        })),
    }),
    {
      name: 'jarvis-store',
      version: 1,
      partialize: (state) => ({
        userName: state.userName,
        userTitle: state.userTitle,
        activeTheme: state.activeTheme,
        activeModel: state.activeModel,
        messages: state.messages.slice(-100),
        tasks: state.tasks,
        memories: state.memories.slice(-200),
        totalTokens: state.totalTokens,
        totalCostUsd: state.totalCostUsd,
        ui: state.ui,
        connection: state.connection,
      }),
    }
  )
);