/**
 * Zustand store for conversation and voice state management
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ConversationMessage,
  ConversationState,
  ConnectionStatus,
  VADState,
  AvatarState,
  UserPreferences,
  AudioLevels,
} from '@/types';

interface ConversationStore extends ConversationState {
  addMessage: (message: ConversationMessage) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setVoiceStatus: (status: VADState) => void;
  setAvatarState: (state: AvatarState) => void;
}

export const useConversationStore = create<ConversationStore>(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      error: null,
      connectionStatus: 'disconnected',
      voiceStatus: 'idle',
      avatarState: 'idle',

      addMessage: (message: ConversationMessage) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      removeMessage: (id: string) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        })),

      clearMessages: () =>
        set(() => ({
          messages: [],
        })),

      setIsLoading: (loading: boolean) =>
        set(() => ({
          isLoading: loading,
        })),

      setError: (error: string | null) =>
        set(() => ({
          error,
        })),

      setConnectionStatus: (status: ConnectionStatus) =>
        set(() => ({
          connectionStatus: status,
        })),

      setVoiceStatus: (status: VADState) =>
        set(() => ({
          voiceStatus: status,
        })),

      setAvatarState: (state: AvatarState) =>
        set(() => ({
          avatarState: state,
        })),
    }),
    {
      name: 'conversation-store',
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);

interface PreferencesStore extends UserPreferences {
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  voiceSpeed: 1.0,
  voiceVolume: 0.8,
  avatarStyle: 'default',
  theme: 'dark',
  language: 'en',
  enableAudio: true,
  enableVideo: true,
  microphone: 'default',
  speaker: 'default',
};

export const usePreferencesStore = create<PreferencesStore>(
  persist(
    (set) => ({
      ...defaultPreferences,

      updatePreference: (key, value) =>
        set((state) => ({
          ...state,
          [key]: value,
        })),

      resetPreferences: () =>
        set(() => ({
          ...defaultPreferences,
        })),
    }),
    {
      name: 'preferences-store',
    }
  )
);

interface AudioStore {
  audioLevels: AudioLevels | null;
  isMuted: boolean;
  volume: number;
  updateAudioLevels: (levels: AudioLevels) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  audioLevels: null,
  isMuted: false,
  volume: 0.8,

  updateAudioLevels: (levels: AudioLevels) =>
    set(() => ({
      audioLevels: levels,
    })),

  setMuted: (muted: boolean) =>
    set(() => ({
      isMuted: muted,
    })),

  setVolume: (volume: number) =>
    set(() => ({
      volume: Math.max(0, Math.min(1, volume)),
    })),
}));

interface VoicePipelineStore {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  setConnected: (connected: boolean) => void;
  setListening: (listening: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
}

export const useVoicePipelineStore = create<VoicePipelineStore>((set) => ({
  isConnected: false,
  isListening: false,
  isSpeaking: false,

  setConnected: (connected: boolean) =>
    set(() => ({
      isConnected: connected,
    })),

  setListening: (listening: boolean) =>
    set(() => ({
      isListening: listening,
    })),

  setSpeaking: (speaking: boolean) =>
    set(() => ({
      isSpeaking: speaking,
    })),
}));
