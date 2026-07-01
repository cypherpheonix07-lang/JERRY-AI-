
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/App.tsx
// Main application entry with WebSocket sync to backend
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState, useCallback } from 'react';
import { JarvisHUD } from './components/hud/JarvisHUD';
import { BootSequence } from './components/boot/BootSequence';
import { useJarvisStore } from './store/jarvisStore';

// WebSocket connection to FastAPI gateway
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

const App: React.FC = () => {
  const [bootComplete, setBootComplete] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);

  const { 
    setSystemMetrics, 
    setModelStatus, 
    setActiveAgents,
    addLogEntry 
  } = useJarvisStore();

  // WebSocket connection with auto-reconnect
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const MAX_RECONNECT = 5;

    const connect = () => {
      if (reconnectAttempts >= MAX_RECONNECT) {
        setWsError('Max reconnection attempts reached. Running in offline mode.');
        setModelStatus('offline');
        return;
      }

      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('J.A.R.V.I.S WebSocket connected');
        setWsConnected(true);
        setWsError(null);
        reconnectAttempts = 0;

        // Authenticate
        ws?.send(JSON.stringify({
          type: 'auth',
          token: localStorage.getItem('jarvis_token') || 'guest'
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'metrics':
              setSystemMetrics(data.payload);
              break;

            case 'model_status':
              setModelStatus(data.payload.status);
              break;

            case 'agents':
              setActiveAgents(data.payload.count);
              break;

            case 'log':
              addLogEntry(data.payload);
              break;

            case 'alert':
              // Trigger UI alert
              console.warn('JARVIS Alert:', data.payload.message);
              break;

            case 'pong':
              // Heartbeat response
              break;
          }
        } catch (err) {
          console.error('WS message parse error:', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectAttempts++;
        reconnectTimer = setTimeout(connect, 3000 * reconnectAttempts);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setWsError('Connection error. Retrying...');
      };
    };

    connect();

    // Heartbeat
    const heartbeat = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [setSystemMetrics, setModelStatus, setActiveAgents, addLogEntry]);

  // Send command to backend
  const sendCommand = useCallback((command: string, params?: Record<string, any>) => {
    // Implementation via HTTP API fallback
    fetch('http://localhost:8000/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, params, timestamp: Date.now() })
    });
  }, []);

  if (!bootComplete) {
    return <BootSequence onComplete={() => setBootComplete(true)} />;
  }

  return (
    <div className="app-container">
      {/* Connection status indicator */}
      <div style={{
        position: 'fixed',
        top: '8px',
        right: '8px',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 12px',
        background: 'rgba(5, 13, 26, 0.9)',
        border: `1px solid ${wsConnected ? 'rgba(0, 255, 159, 0.3)' : 'rgba(255, 71, 87, 0.3)'}`,
        borderRadius: '4px',
        fontSize: '10px',
        fontFamily: "'Courier New', monospace"
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: wsConnected ? '#00ff9f' : '#ff4757',
          boxShadow: wsConnected 
            ? '0 0 6px rgba(0, 255, 159, 0.6)' 
            : '0 0 6px rgba(255, 71, 87, 0.6)'
        }} />
        <span style={{ color: wsConnected ? '#00ff9f' : '#ff4757' }}>
          {wsConnected ? 'SYNCED' : wsError || 'OFFLINE'}
        </span>
      </div>

      <JarvisHUD />
    </div>
  );
};

export default App;
