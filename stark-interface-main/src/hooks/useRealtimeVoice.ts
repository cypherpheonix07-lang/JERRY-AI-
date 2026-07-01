/**
 * Hook for managing real-time voice streaming with OpenAI Realtime API
 * Implements WebRTC connection with interruption handling and audio visualization
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useConversationStore, useVoicePipelineStore, useAudioStore } from '@/store';
import type { RealtimeEvent, AudioLevels, ConversationMessage } from '@/types';

interface UseRealtimeVoiceOptions {
  apiKey: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

interface UseRealtimeVoiceReturn {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: Error | null;
}

/**
 * Circuit breaker implementation for reliability
 */
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly maxFailures = 5;
  private readonly resetTimeout = 30000; // 30s
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  isOpen(): boolean {
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.resetTimeout) {
        this.state = 'half-open';
        this.failureCount = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.maxFailures) {
      this.state = 'open';
    }
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  reset(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }
}

/**
 * Exponential backoff implementation
 */
function createBackoffDelays(): number[] {
  return [100, 200, 400, 800, 1600];
}

export function useRealtimeVoice(options: UseRealtimeVoiceOptions): UseRealtimeVoiceReturn {
  const {
    apiKey,
    onConnected,
    onDisconnected,
    onError,
  } = options;

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const circuitBreakerRef = useRef(new CircuitBreaker());
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);

  const { setConnected, setListening, setSpeaking } = useVoicePipelineStore();
  const { addMessage, setConnectionStatus, setVoiceStatus, setAvatarState } = useConversationStore();
  const { updateAudioLevels } = useAudioStore();

  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Initialize audio context and Web Audio API
   */
  const initializeAudioContext = useCallback(async (): Promise<void> => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Create analyser for audio visualization
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize audio context');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [onError]);

  /**
   * Get user's microphone stream
   */
  const getMicrophoneStream = useCallback(async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        },
      });
      return stream;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Microphone access denied');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [onError]);

  /**
   * Extract audio levels for visualization (used for lip-sync)
   */
  const extractAudioLevels = useCallback((): void => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const waveformData = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(waveformData);

    // Calculate RMS (Root Mean Square) for amplitude
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length) / 255;
    const amplitude = Math.min(1, rms * 2);

    const levels: AudioLevels = {
      frequency: dataArray,
      waveform: waveformData,
      amplitude,
      rms,
    };

    updateAudioLevels(levels);
  }, [updateAudioLevels]);

  /**
   * Handle incoming audio from API
   */
  const handleIncomingAudio = useCallback((data: ArrayBuffer): void => {
    try {
      if (!audioContextRef.current || !mediaSourceRef.current) {
        return;
      }

      if (mediaSourceRef.current.readyState === 'open' && sourceBufferRef.current) {
        sourceBufferRef.current.appendBuffer(new Uint8Array(data));
      }
    } catch (err) {
      console.error('Error appending audio buffer:', err);
    }
  }, []);

  /**
   * Stop TTS immediately on user interrupt
   */
  const interruptTTS = useCallback((): void => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }

    if (sourceBufferRef.current && mediaSourceRef.current?.readyState === 'open') {
      try {
        sourceBufferRef.current.abort();
      } catch (err) {
        console.error('Error aborting source buffer:', err);
      }
    }

    // Send cancel event to API
    if (dcRef.current && dcRef.current.readyState === 'open') {
      dcRef.current.send(
        JSON.stringify({
          type: 'response.cancel',
        })
      );
    }

    setSpeaking(false);
    setAvatarState('listening');
  }, [setSpeaking, setAvatarState]);

  /**
   * Handle realtime API events
   */
  const handleRealtimeEvent = useCallback((event: RealtimeEvent): void => {
    switch (event.type) {
      case 'input_audio_buffer.speech_started':
        setListening(true);
        setVoiceStatus('speech_start');
        setAvatarState('listening');
        break;

      case 'input_audio_buffer.speech_stopped':
        setListening(false);
        setVoiceStatus('speech_end');
        break;

      case 'response.output_item.added':
        setSpeaking(true);
        setAvatarState('speaking');
        break;

      case 'response.done':
        setSpeaking(false);
        setAvatarState('idle');
        break;

      case 'error':
        if (event.error) {
          const err = new Error(event.error.message);
          setError(err);
          onError?.(err);
        }
        break;

      default:
        break;
    }
  }, [setListening, setSpeaking, setVoiceStatus, setAvatarState, onError]);

  /**
   * Setup WebRTC data channel
   */
  const setupDataChannel = useCallback((pc: RTCPeerConnection): void => {
    const dc = pc.createDataChannel('oai-events');
    dcRef.current = dc;

    dc.onopen = (): void => {
      console.log('Data channel opened');
      setConnected(true);
      setConnectionStatus('connected');
      onConnected?.();
    };

    dc.onclose = (): void => {
      console.log('Data channel closed');
      setConnected(false);
      setConnectionStatus('disconnected');
      onDisconnected?.();
    };

    dc.onerror = (event): void => {
      const err = new Error(`Data channel error: ${event.type}`);
      setError(err);
      onError?.(err);
    };

    dc.onmessage = (event): void => {
      try {
        const data = JSON.parse(event.data);
        handleRealtimeEvent(data as RealtimeEvent);
      } catch (err) {
        console.error('Error parsing realtime event:', err);
      }
    };
  }, [setConnected, setConnectionStatus, onConnected, onDisconnected, onError, handleRealtimeEvent]);

  /**
   * Main connection function with exponential backoff
   */
  const connect = useCallback(async (): Promise<void> => {
    if (isConnected || circuitBreakerRef.current.isOpen()) {
      throw new Error('Cannot connect: already connected or circuit breaker open');
    }

    try {
      abortControllerRef.current = new AbortController();
      await initializeAudioContext();

      // Get microphone stream
      const micStream = await getMicrophoneStream();
      mediaStreamRef.current = micStream;

      // Create WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
      });

      pcRef.current = pc;

      // Add microphone tracks to connection
      for (const track of micStream.getTracks()) {
        pc.addTrack(track, micStream);
      }

      // Setup audio output
      pc.ontrack = (event): void => {
        const audioElement = new Audio();
        audioElement.srcObject = event.streams[0];
        audioElement.play().catch(err => console.error('Play error:', err));
        audioElementRef.current = audioElement;
      };

      // Setup data channel
      setupDataChannel(pc);

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Get session token from OpenAI
      const sessionTokenResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!sessionTokenResponse.ok) {
        throw new Error(`Failed to get session token: ${sessionTokenResponse.statusText}`);
      }

      const { client_secret } = await sessionTokenResponse.json() as { client_secret: { value: string } };

      // Exchange offer for answer
      const answerResponse = await fetch('https://api.openai.com/v1/realtime', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/sdp',
        },
        body: pc.localDescription?.sdp || '',
        signal: abortControllerRef.current.signal,
      });

      if (!answerResponse.ok) {
        throw new Error(`Failed to connect to realtime API: ${answerResponse.statusText}`);
      }

      const answerSdp = await answerResponse.text();
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSdp }));

      setConnectionStatus('connected');
      setConnected(true);
      setError(null);
      circuitBreakerRef.current.recordSuccess();
      reconnectAttemptsRef.current = 0;

      // Start audio visualization loop
      const visualizationInterval = setInterval(() => {
        if (isConnected) {
          extractAudioLevels();
        } else {
          clearInterval(visualizationInterval);
        }
      }, 50);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Connection failed');
      setError(error);
      onError?.(error);
      circuitBreakerRef.current.recordFailure();
      setConnectionStatus('error');
      throw error;
    }
  }, [
    isConnected,
    initializeAudioContext,
    getMicrophoneStream,
    setupDataChannel,
    setConnectionStatus,
    setConnected,
    setError,
    onError,
    extractAudioLevels,
    apiKey,
  ]);

  /**
   * Disconnect from realtime API
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      // Stop all tracks
      if (mediaStreamRef.current) {
        for (const track of mediaStreamRef.current.getTracks()) {
          track.stop();
        }
        mediaStreamRef.current = null;
      }

      // Close data channel
      if (dcRef.current) {
        dcRef.current.close();
        dcRef.current = null;
      }

      // Close peer connection
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      // Cancel pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setConnected(false);
      setConnectionStatus('disconnected');
      onDisconnected?.();
    } catch (err) {
      console.error('Error during disconnect:', err);
    }
  }, [setConnected, setConnectionStatus, onDisconnected]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect().catch(err => console.error('Cleanup disconnect error:', err));
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    isListening,
    isSpeaking,
    error,
  };
}
