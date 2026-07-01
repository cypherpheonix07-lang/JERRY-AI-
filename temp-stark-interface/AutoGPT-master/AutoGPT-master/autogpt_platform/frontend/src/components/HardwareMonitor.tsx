"use client";
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useJerryStore } from "@/store/jerryStore";
import type { SensorReading, HardwareDevice } from "@/store/jerryStore";

// Zod schema for runtime validation of backend WebSocket messages
const WebSocketMessageSchema = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("connected"),
    payload: z.object({
      devices: z.array(z.unknown()),
      guardrails: z.array(z.unknown()),
    }),
    timestamp: z.string(),
  }),
  z.object({
    event: z.literal("device_update"),
    payload: z.object({
      id: z.string(),
      name: z.string(),
      status: z.string(),
      lastSeen: z.string(),
      metrics: z.record(z.union([z.number(), z.string()])),
      controls: z.array(z.unknown()),
    }).passthrough(),
    timestamp: z.string(),
  }),
  z.object({
    event: z.literal("sensor_batch"),
    payload: z.array(z.object({
      id: z.string(),
      deviceId: z.string(),
      sensorType: z.string(),
      value: z.number(),
      unit: z.string(),
      timestamp: z.string(),
      threshold: z.object({ min: z.number(), max: z.number() }).optional(),
      alert: z.boolean().optional(),
    })).optional(),
    timestamp: z.string(),
  }),
  z.object({
    event: z.literal("command_result"),
    payload: z.unknown(),
    timestamp: z.string(),
  }),
  z.object({
    event: z.literal("pong"),
    payload: z.object({}),
    timestamp: z.string(),
  }),
  z.object({
    event: z.literal("error"),
    payload: z.string(),
    timestamp: z.string(),
  }),
]);

export type ValidWebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

export default function HardwareMonitor() {
  const {
    connectionStatus,
    setConnectionStatus,
    addDevice,
    updateDevice,
    addSensorReading,
    devices,
  } = useJerryStore();

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const laptopId = "laptop_local"; // Matches backend laptop device ID
  const laptopDevice = devices.find(d => d.id === laptopId);

  useEffect(() => {
    // Add local laptop device to store on mount if not exists
    if (!laptopDevice) {
      const initialLaptopDevice: HardwareDevice = {
        id: laptopId,
        name: "Local Machine",
        type: "laptop",
        status: "offline",
        lastSeen: new Date().toISOString(),
        metrics: {},
        controls: [],
        location: "Local",
      };
      addDevice(initialLaptopDevice);
    }

    // Connect to the backend WebSocket server
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const wsUrl = `${wsProtocol}//${new URL(wsHost).host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
      // Update laptop device status to online in store
      updateDevice(laptopId, { status: "online", lastSeen: new Date().toISOString() });
      
      // Send subscribe action to backend (matches our backend's protocol)
      ws.send(JSON.stringify({
        action: "subscribe",
        deviceIds: [laptopId]
      }));

      // Start ping interval to keep connection alive
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: "ping" }));
        }
      }, 30000); // Ping every 30 seconds
    };

    ws.onmessage = (event) => {
      try {
        const rawMessage = JSON.parse(event.data);
        const parseResult = WebSocketMessageSchema.safeParse(rawMessage);
        
        if (!parseResult.success) {
          console.warn("Invalid WebSocket message:", parseResult.error);
          return;
        }

        const message = parseResult.data;

        switch (message.event) {
          case "device_update": {
            // Only process updates for our local laptop
            if (message.payload.id === laptopId) {
              updateDevice(laptopId, {
                lastSeen: message.payload.lastSeen,
                status: message.payload.status as HardwareDevice['status'],
                metrics: message.payload.metrics,
              });
            }
            break;
          }

          case "sensor_batch": {
            // Add all valid sensor readings to the store
            if (message.payload) {
              message.payload.forEach((reading) => {
                if (reading.deviceId === laptopId) {
                  const validReading: SensorReading = {
                    id: reading.id || crypto.randomUUID(),
                    deviceId: reading.deviceId,
                    sensorType: reading.sensorType as SensorReading['sensorType'],
                    value: reading.value,
                    unit: reading.unit,
                    timestamp: reading.timestamp,
                    threshold: reading.threshold,
                    alert: reading.alert,
                  };
                  addSensorReading(validReading);
                }
              });
            }
            break;
          }

          case "error":
            console.error("Backend WebSocket error:", message.payload);
            break;

          default:
            // Ignore other event types
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      updateDeviceMetric(laptopId, "status", "offline");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("disconnected");
      updateDevice(laptopId, { status: "error" });
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      updateDevice(laptopId, { status: "offline" });
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [addDevice, updateDeviceMetric, addSensorReading, setConnectionStatus, laptopDevice]);

  const wsStatus = connectionStatus === "connected" ? "Connected" : 
                    connectionStatus === "connecting" ? "Connecting" : 
                    connectionStatus === "disconnected" ? "Disconnected" : "Error";

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Laptop Hardware Monitor</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          connectionStatus === "connected" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {wsStatus}
        </span>
      </div>

      {laptopDevice?.metrics && (
        <div className="space-y-3">
          {/* CPU Usage */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>CPU ({laptopDevice.metrics.core_count || '?'} cores)</span>
              <span>{laptopDevice.metrics.cpu_usage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${laptopDevice.metrics.cpu_usage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Memory ({laptopDevice.metrics.memory_used_gb || '?'}/{laptopDevice.metrics.memory_total_gb || '?'} GB)</span>
              <span>{laptopDevice.metrics.memory_usage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${laptopDevice.metrics.memory_usage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Disk Usage */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Disk ({laptopDevice.metrics.disk_used_gb || '?'}/{laptopDevice.metrics.disk_total_gb || '?'} GB)</span>
              <span>{laptopDevice.metrics.disk_usage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-yellow-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${laptopDevice.metrics.disk_usage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Battery */}
          {laptopDevice.metrics.battery !== undefined && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Battery</span>
                <span>{laptopDevice.metrics.battery}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${laptopDevice.metrics.battery}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}