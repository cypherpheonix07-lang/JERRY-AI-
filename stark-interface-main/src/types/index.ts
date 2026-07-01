/**
 * Core type definitions for the real-time 3D AI assistant
 */

/**
 * Avatar state machine states
 */
export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

/**
 * Voice pipeline connection status
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Voice activity detection states
 */
export type VADState = 'idle' | 'speech_start' | 'speech_detected' | 'speech_end';

/**
 * Audio levels for visualization
 */
export interface AudioLevels {
  frequency: Uint8Array;
  waveform: Uint8Array;
  amplitude: number;
  rms: number;
}

/**
 * Voice pipeline configuration
 */
export interface VoiceConfig {
  apiKey: string;
  model: 'gpt-4o-realtime-preview';
  sampleRate: 24000;
  channelCount: 1;
  bitDepth: 16;
  transport: 'webrtc' | 'websocket';
}

/**
 * Conversation message
 */
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Conversation state
 */
export interface ConversationState {
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  voiceStatus: VADState;
  avatarState: AvatarState;
}

/**
 * 3D Avatar morph target configuration
 */
export interface MorphTargetConfig {
  jawOpen: number;
  mouthSmile: number;
  mouthSad: number;
  browRaise: number;
  browFurrow: number;
  eyeWide: number;
  eyeSquint: number;
  cheekPuff: number;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  voiceSpeed: number;
  voiceVolume: number;
  avatarStyle: string;
  theme: 'light' | 'dark';
  language: string;
  enableAudio: boolean;
  enableVideo: boolean;
  microphone: string;
  speaker: string;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  toolId: string;
  status: 'success' | 'error';
  data: unknown;
  error?: string;
  executionTime: number;
}

/**
 * MCP Tool definition
 */
export interface MCPTool {
  id: string;
  name: string;
  description: string;
  schema: Record<string, unknown>;
  handler: (input: unknown) => Promise<ToolResult>;
}

/**
 * Realtime API event types
 */
export type RealtimeEventType =
  | 'session.created'
  | 'session.updated'
  | 'input_audio_buffer.created'
  | 'input_audio_buffer.append'
  | 'input_audio_buffer.commit'
  | 'input_audio_buffer.clear'
  | 'response.created'
  | 'response.done'
  | 'response.output_item.added'
  | 'response.output_item.done'
  | 'response.content_part.added'
  | 'response.content_part.delta'
  | 'response.text_delta'
  | 'response.audio_delta'
  | 'response.audio_transcript_delta'
  | 'response.function_calls_done'
  | 'conversation.item.created'
  | 'conversation.item.input_audio_transcription.completed'
  | 'conversation.item.input_audio_transcription.failed'
  | 'error';

/**
 * Realtime API event
 */
export interface RealtimeEvent {
  type: RealtimeEventType;
  event_id?: string;
  data?: Record<string, unknown>;
  error?: {
    type: string;
    code: string;
    message: string;
  };
}

/**
 * Error boundary fallback props
 */
export interface ErrorBoundaryProps {
  error: Error;
  resetError: () => void;
}
