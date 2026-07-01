from __future__ import annotations

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, Callable, Coroutine

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Internal HAL modules
from hal.tuya_sockets import TuyaManager
from hal.laptop_sensors import LaptopSensorManager

# ─── Logging ─────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("jerry.hal")

# ─── Pydantic Models ─────────────────────────────────────────────────────────

class DeviceModel(BaseModel):
    id: str
    name: str
    type: str
    status: str = "offline"
    lastSeen: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metrics: dict[str, Any] = Field(default_factory=dict)
    controls: list[dict] = Field(default_factory=list)
    location: str | None = None
    battery: float | None = None


class SensorReadingModel(BaseModel):
    id: str
    deviceId: str
    sensorType: str
    value: float
    unit: str
    timestamp: str
    threshold: dict[str, float] | None = None
    alert: bool = False


class CommandModel(BaseModel):
    deviceId: str
    command: str
    params: dict[str, Any] = Field(default_factory=dict)


class PipelineJobModel(BaseModel):
    id: str
    name: str
    status: str = "queued"
    progress: float = 0.0
    stage: str = ""
    logs: list[str] = Field(default_factory=list)


class GuardRailModel(BaseModel):
    id: str
    name: str
    condition: str
    action: str
    targetDevices: list[str]
    enabled: bool = True
    triggeredCount: int = 0


# ─── Hardware Abstraction Layer ──────────────────────────────────────────────

class HardwareHAL:
    """
    Unified Hardware Abstraction Layer.
    Manages all device backends: Tuya, Laptop sensors, GPIO, MQTT, BLE.
    """

    def __init__(self) -> None:
        self.tuya: TuyaManager | None = None
        self.laptop: LaptopSensorManager | None = None
        self.devices: dict[str, DeviceModel] = {}
        self.sensors: list[SensorReadingModel] = []
        self.pipelines: dict[str, PipelineJobModel] = {}
        self.guardrails: list[GuardRailModel] = []
        self._callbacks: list[Callable[[str, Any], Coroutine[Any, Any, None]]] = []
        self._running = False
        self._tasks: set[asyncio.Task] = set()

    async def initialize(self) -> None:
        """Initialize all hardware backends."""
        logger.info("HAL initializing...")

        # Tuya Smart Plugs / Devices
        try:
            self.tuya = TuyaManager()
            await self.tuya.connect()
            logger.info("Tuya manager initialized")
        except Exception as e:
            logger.warning(f"Tuya init failed: {e}")

        # Laptop sensors (CPU, RAM, disk, network)
        try:
            self.laptop = LaptopSensorManager()
            await self.laptop.connect()
            logger.info("Laptop sensor manager initialized")
        except Exception as e:
            logger.warning(f"Laptop sensor init failed: {e}")

        self._running = True

        # Start background polling loops
        if self.tuya:
            self._start_task(self._tuya_poll_loop())
        if self.laptop:
            self._start_task(self._laptop_poll_loop())
        self._start_task(self._guardrail_eval_loop())

        logger.info("HAL fully initialized")

    async def shutdown(self) -> None:
        """Graceful shutdown of all hardware backends."""
        logger.info("HAL shutting down...")
        self._running = False

        for task in self._tasks:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        if self.tuya:
            await self.tuya.disconnect()
        if self.laptop:
            await self.laptop.shutdown()

        logger.info("HAL shutdown complete")

    def _start_task(self, coro: Coroutine[Any, Any, None]) -> None:
        task = asyncio.create_task(coro)
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)

    def on_event(self, callback: Callable[[str, Any], Coroutine[Any, Any, None]]) -> None:
        """Register a callback for hardware events."""
        self._callbacks.append(callback)

    async def _emit(self, event: str, payload: Any) -> None:
        for cb in self._callbacks:
            try:
                await cb(event, payload)
            except Exception as e:
                logger.error(f"Event callback error: {e}")

    # ── Tuya Polling ────────────────────────────────────────────────────────
    async def _tuya_poll_loop(self) -> None:
        """Poll Tuya devices every 5 seconds."""
        while self._running:
            try:
                if not self.tuya:
                    await asyncio.sleep(5)
                    continue

                devices = await self.tuya.get_devices()
                for dev in devices:
                    existing = self.devices.get(dev.id)
                    if not existing:
                        self.devices[dev.id] = DeviceModel(
                            id=dev.id,
                            name=dev.name,
                            type="tuya",
                            status="online",
                            metrics=dev.metrics,
                            controls=dev.controls,
                        )
                    else:
                        existing.status = "online"
                        existing.lastSeen = datetime.utcnow().isoformat()
                        existing.metrics.update(dev.metrics)

                    # Emit sensor readings
                    for key, value in dev.metrics.items():
                        if isinstance(value, (int, float)):
                            self.sensors.append(SensorReadingModel(
                                id=f"{dev.id}_{key}_{datetime.utcnow().timestamp()}",
                                deviceId=dev.id,
                                sensorType="custom",
                                value=float(value),
                                unit=dev.units.get(key, ""),
                                timestamp=datetime.utcnow().isoformat(),
                            ))

                    await self._emit("device_update", existing or self.devices[dev.id])

                await self._emit("sensor_batch", [s.model_dump() for s in self.sensors[-20:]])
                await asyncio.sleep(5)
            except Exception as e:
                logger.error(f"Tuya poll error: {e}")
                await asyncio.sleep(5)

    # ── Laptop Sensor Polling ───────────────────────────────────────────────
    async def _laptop_poll_loop(self) -> None:
        """Poll laptop sensors every 2 seconds."""
        laptop_id = "laptop_local"
        while self._running:
            try:
                if not self.laptop:
                    await asyncio.sleep(2)
                    continue

                readings = await self.laptop.get_readings()
                now = datetime.utcnow().isoformat()

                if laptop_id not in self.devices:
                    self.devices[laptop_id] = DeviceModel(
                        id=laptop_id,
                        name="Local Machine",
                        type="laptop",
                        status="online",
                        metrics={},
                    )

                device = self.devices[laptop_id]
                device.lastSeen = now
                device.status = "online"

                for reading in readings:
                    device.metrics[reading.sensorType] = reading.value
                    self.sensors.append(SensorReadingModel(
                        id=f"{laptop_id}_{reading.sensorType}_{datetime.utcnow().timestamp()}",
                        deviceId=laptop_id,
                        sensorType=reading.sensorType,
                        value=reading.value,
                        unit=reading.unit,
                        timestamp=now,
                        threshold=reading.threshold,
                        alert=reading.alert,
                    ))

                await self._emit("device_update", device.model_dump())
                await self._emit("sensor_batch", [s.model_dump() for s in self.sensors[-10:]])
                await asyncio.sleep(2)
            except Exception as e:
                logger.error(f"Laptop sensor poll error: {e}")
                await asyncio.sleep(2)

    # ── Guardrail Evaluation ────────────────────────────────────────────────
    async def _guardrail_eval_loop(self) -> None:
        """Evaluate guardrail rules every 3 seconds."""
        while self._running:
            try:
                for rule in self.guardrails:
                    if not rule.enabled:
                        continue

                    # Simple condition parser: "cpu > 90"
                    parts = rule.condition.split()
                    if len(parts) == 3:
                        metric, op, val = parts[0], parts[1], float(parts[2])
                        for device_id in rule.targetDevices:
                            device = self.devices.get(device_id)
                            if not device:
                                continue
                            current = device.metrics.get(metric)
                            if current is None:
                                continue

                            triggered = False
                            if op == ">" and current > val:
                                triggered = True
                            elif op == "<" and current < val:
                                triggered = True
                            elif op == ">=" and current >= val:
                                triggered = True
                            elif op == "<=" and current <= val:
                                triggered = True
                            elif op == "==" and current == val:
                                triggered = True

                            if triggered:
                                rule.triggeredCount += 1
                                await self._emit("guardrail_triggered", {
                                    "ruleId": rule.id,
                                    "ruleName": rule.name,
                                    "action": rule.action,
                                    "deviceId": device_id,
                                    "metric": metric,
                                    "value": current,
                                    "threshold": val,
                                })
                                await self._execute_guardrail_action(rule, device_id)

                await asyncio.sleep(3)
            except Exception as e:
                logger.error(f"Guardrail eval error: {e}")
                await asyncio.sleep(3)

    async def _execute_guardrail_action(self, rule: GuardRailModel, device_id: str) -> None:
        """Execute the action defined by a guardrail rule."""
        logger.warning(f"Guardrail '{rule.name}' triggered on {device_id}, action: {rule.action}")
        if rule.action == "notify":
            await self._emit("notification", {
                "type": "guardrail",
                "message": f"Guardrail '{rule.name}' triggered on {device_id}",
            })
        elif rule.action == "throttle":
            # Example: reduce CPU priority
            pass
        elif rule.action == "shutdown":
            await self.send_command(device_id, "shutdown", {})

    # ── Public API ──────────────────────────────────────────────────────────
    async def get_devices(self) -> list[DeviceModel]:
        return list(self.devices.values())

    async def get_device(self, device_id: str) -> DeviceModel | None:
        return self.devices.get(device_id)

    async def send_command(self, device_id: str, command: str, params: dict) -> dict:
        """Send a command to a device through the appropriate backend."""
        device = self.devices.get(device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")

        result = {"success": False, "message": "Unknown backend"}

        if device.type == "tuya" and self.tuya:
            result = await self.tuya.send_command(device_id, command, params)
        elif device.type == "laptop" and self.laptop:
            result = await self.laptop.execute(command, params)

        await self._emit("command_executed", {
            "deviceId": device_id,
            "command": command,
            "result": result,
        })
        return result

    async def scan_devices(self) -> list[DeviceModel]:
        """Trigger a device discovery scan across all backends."""
        found: list[DeviceModel] = []
        if self.tuya:
            tuya_devs = await self.tuya.discover()
            found.extend(tuya_devs)
        # Add more backends here
        for dev in found:
            if dev.id not in self.devices:
                self.devices[dev.id] = dev
        return found

    def add_guardrail(self, rule: GuardRailModel) -> None:
        self.guardrails.append(rule)

    def remove_guardrail(self, rule_id: str) -> None:
        self.guardrails = [r for r in self.guardrails if r.id != rule_id]


# ─── Global HAL Instance ─────────────────────────────────────────────────────

hal = HardwareHAL()


# ─── FastAPI App ─────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await hal.initialize()
    yield
    await hal.shutdown()


app = FastAPI(
    title="JERRY HAL API",
    description="Hardware Abstraction Layer for STARK/JARVIS",
    version="2.0.0",
    lifespan=lifespan,
)

# Configure CORS - environment-driven whitelist for production
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,
)


# ─── REST Endpoints ────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "hal_running": hal._running,
        "devices_online": len([d for d in hal.devices.values() if d.status == "online"]),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/devices", response_model=list[DeviceModel])
async def list_devices():
    return await hal.get_devices()


@app.get("/api/devices/{device_id}")
async def get_device(device_id: str):
    device = await hal.get_device(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@app.post("/api/devices/{device_id}/command")
async def device_command(device_id: str, cmd: CommandModel):
    return await hal.send_command(device_id, cmd.command, cmd.params)


@app.post("/api/devices/scan")
async def scan_devices(background_tasks: BackgroundTasks):
    background_tasks.add_task(hal.scan_devices)
    return {"message": "Device scan started in background"}


@app.get("/api/sensors")
async def list_sensors(limit: int = 100):
    return hal.sensors[-limit:]


@app.get("/api/sensors/{device_id}")
async def device_sensors(device_id: str, limit: int = 100):
    return [s for s in hal.sensors if s.deviceId == device_id][-limit:]


@app.post("/api/pipelines")
async def create_pipeline(job: PipelineJobModel):
    hal.pipelines[job.id] = job
    return job


@app.get("/api/pipelines")
async def list_pipelines():
    return list(hal.pipelines.values())


@app.get("/api/pipelines/{job_id}")
async def get_pipeline(job_id: str):
    job = hal.pipelines.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return job


@app.post("/api/guardrails")
async def create_guardrail(rule: GuardRailModel):
    hal.add_guardrail(rule)
    return rule


@app.get("/api/guardrails")
async def list_guardrails():
    return hal.guardrails


@app.delete("/api/guardrails/{rule_id}")
async def delete_guardrail(rule_id: str):
    hal.remove_guardrail(rule_id)
    return {"message": "Guardrail removed"}


# ─── WebSocket Endpoint ──────────────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()


async def hal_event_handler(event: str, payload: Any):
    await manager.broadcast({"event": event, "payload": payload, "timestamp": datetime.utcnow().isoformat()})


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    hal.on_event(hal_event_handler)

    try:
        await websocket.send_json({
            "event": "connected",
            "payload": {
                "devices": [d.model_dump() for d in hal.devices.values()],
                "guardrails": [g.model_dump() for g in hal.guardrails],
            },
        })

        while True:
            data = await websocket.receive_json()
            
            # Runtime type validation for all incoming WebSocket messages
            if not isinstance(data, dict):
                await websocket.send_json({"event": "error", "payload": "Invalid message format: expected object"})
                continue

            action = data.get("action")
            if not isinstance(action, str):
                await websocket.send_json({"event": "error", "payload": "Invalid action: must be string"})
                continue

            if action == "command":
                device_id = data.get("deviceId")
                command = data.get("command")
                params = data.get("params", {})
                
                if not isinstance(device_id, str) or not isinstance(command, str) or not isinstance(params, dict):
                    await websocket.send_json({"event": "error", "payload": "Invalid command parameters"})
                    continue

                result = await hal.send_command(device_id, command, params)
                await websocket.send_json({"event": "command_result", "payload": result})

            elif action == "scan":
                await hal.scan_devices()
                await websocket.send_json({"event": "scan_complete", "payload": {}})

            elif action == "ping":
                await websocket.send_json({"event": "pong", "payload": {}})

            elif action == "subscribe":
                # Client can subscribe to specific device events
                device_ids = data.get("deviceIds", [])
                if isinstance(device_ids, list) and all(isinstance(d, str) for d in device_ids):
                    logger.debug(f"Client subscribed to devices: {device_ids}")
                pass

            else:
                await websocket.send_json({"event": "error", "payload": f"Unknown action: {action}"})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)