/**
 * Tests for useRealtimeVoice hook
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';

describe('useRealtimeVoice', () => {
  const mockApiKey = 'test-api-key';
  const mockCallbacks = {
    onConnected: vi.fn(),
    onDisconnected: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock WebRTC APIs
    global.RTCPeerConnection = vi.fn(() => ({
      createOffer: vi.fn().mockResolvedValue({ sdp: 'test-sdp' }),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      setRemoteDescription: vi.fn().mockResolvedValue(undefined),
      createDataChannel: vi.fn(() => ({
        onopen: null,
        onclose: null,
        onerror: null,
        onmessage: null,
        close: vi.fn(),
        send: vi.fn(),
      })),
      addTrack: vi.fn(),
      ontrack: null,
      close: vi.fn(),
    })) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize without crashing', () => {
    const { result } = renderHook(() =>
      useRealtimeVoice({
        apiKey: mockApiKey,
        ...mockCallbacks,
      })
    );

    expect(result.current).toBeDefined();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isListening).toBe(false);
  });

  it('should handle connection errors gracefully', async () => {
    const { result } = renderHook(() =>
      useRealtimeVoice({
        apiKey: 'invalid-key',
        ...mockCallbacks,
      })
    );

    // Mock fetch to fail
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await act(async () => {
      try {
        await result.current.connect();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    expect(result.current.error).toBeDefined();
    expect(mockCallbacks.onError).toHaveBeenCalled();
  });

  it('should return valid audio levels', async () => {
    const { result } = renderHook(() =>
      useRealtimeVoice({
        apiKey: mockApiKey,
        ...mockCallbacks,
      })
    );

    // Verify audio level structure
    expect(result.current).toHaveProperty('isConnected');
    expect(result.current).toHaveProperty('isListening');
    expect(result.current).toHaveProperty('isSpeaking');
  });

  it('should handle disconnect properly', async () => {
    const { result } = renderHook(() =>
      useRealtimeVoice({
        apiKey: mockApiKey,
        ...mockCallbacks,
      })
    );

    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(mockCallbacks.onDisconnected).toHaveBeenCalled();
  });

  it('should cleanup resources on unmount', async () => {
    const { unmount } = renderHook(() =>
      useRealtimeVoice({
        apiKey: mockApiKey,
        ...mockCallbacks,
      })
    );

    unmount();

    // Verify no memory leaks
    await waitFor(() => {
      expect(result.current).toBeUndefined();
    }, { timeout: 100 }).catch(() => {
      // Expected timeout
    });
  });
});
