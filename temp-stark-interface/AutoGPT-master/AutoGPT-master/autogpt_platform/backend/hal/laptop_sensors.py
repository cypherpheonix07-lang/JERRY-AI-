"""
Local machine sensor monitoring using psutil.
CPU, RAM, disk, network, temperature, and battery.
"""

from __future__ import annotations

import asyncio
import logging
import os
import platform
from dataclasses import dataclass, field
from typing import Any, List

logger = logging.getLogger("jerry.hal.laptop")

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    logger.warning("psutil not installed. Laptop sensors unavailable.")


@dataclass
class SensorReading:
    sensorType: str
    value: float
    unit: str
    threshold: dict[str, float] | None = None
    alert: bool = False


@dataclass
class LaptopDeviceInfo:
    id: str
    name: str
    ip: str
    key: str = ""
    version: str = "1.0.0"
    metrics: dict[str, Any] = field(default_factory=dict)
    controls: list[dict] = field(default_factory=list)
    units: dict[str, str] = field(default_factory=dict)


class LaptopSensorManager:
    """
    Monitors local machine hardware sensors.
    Uses psutil for cross-platform system monitoring.
    """

    def __init__(self) -> None:
        if not PSUTIL_AVAILABLE:
            raise RuntimeError("psutil is required for laptop sensors")

        self._running = False
        self._readings_cache: list[SensorReading] = []
        self._history: dict[str, list[float]] = {}
        self._poll_task: asyncio.Task | None = None
        self.device_info: LaptopDeviceInfo | None = None

        # Default thresholds
        self.thresholds = {
            "cpu_percent": {"min": 0, "max": 85},
            "cpu_temp": {"min": 0, "max": 80},
            "ram_percent": {"min": 0, "max": 90},
            "disk_percent": {"min": 0, "max": 90},
            "battery_percent": {"min": 15, "max": 100},
            "network_mbps": {"min": 0, "max": 1000},
        }

    async def connect(self) -> None:
        """Initialize laptop sensor monitoring."""
        self._running = True

        # Create laptop device info
        hostname = platform.node()
        self.device_info = LaptopDeviceInfo(
            id="laptop-local-001",
            name=hostname,
            ip="127.0.0.1",
            version=psutil.__version__,
            metrics={},
            controls=[
                {"id": "get_processes", "label": "List Processes", "type": "button"},
                {"id": "set_threshold", "label": "Set Threshold", "type": "input"},
            ],
            units={
                "cpu": "%",
                "memory": "%",
                "disk": "%",
                "battery": "%",
            }
        )

        # Start background polling task
        self._poll_task = asyncio.create_task(self._poll_sensors())
        logger.info("Laptop sensor manager initialized")

    async def _poll_sensors(self) -> None:
        """Background task to poll sensors continuously."""
        while self._running:
            try:
                await self.get_readings()
            except Exception as e:
                logger.debug(f"Sensor polling error: {e}")
            await asyncio.sleep(2)  # Poll every 2 seconds

    async def get_readings(self) -> list[SensorReading]:
        """Collect all sensor readings from the local machine."""
        readings: list[SensorReading] = []

        # ── CPU ─────────────────────────────────────────────────────────────
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            readings.append(SensorReading(
                sensorType="cpu",
                value=round(cpu_percent, 1),
                unit="%",
                threshold=self.thresholds["cpu_percent"],
                alert=cpu_percent > self.thresholds["cpu_percent"]["max"],
            ))

            # Per-core CPU
            per_cpu = psutil.cpu_percent(interval=0.1, percpu=True)
            for i, pct in enumerate(per_cpu):
                readings.append(SensorReading(
                    sensorType=f"cpu_core_{i}",
                    value=round(pct, 1),
                    unit="%",
                ))

            # CPU frequency
            freq = psutil.cpu_freq()
            if freq:
                readings.append(SensorReading(
                    sensorType="cpu_freq",
                    value=round(freq.current, 0),
                    unit="MHz",
                ))
        except (PermissionError, Exception) as e:
            logger.debug(f"Could not read CPU metrics: {e}")

        # CPU temperature (if available)
        temps = self._get_cpu_temperature()
        if temps:
            for name, temp in temps.items():
                readings.append(SensorReading(
                    sensorType=f"cpu_temp_{name}",
                    value=round(temp, 1),
                    unit="°C",
                    threshold=self.thresholds["cpu_temp"],
                    alert=temp > self.thresholds["cpu_temp"]["max"],
                ))

        # ── Memory ──────────────────────────────────────────────────────────
        try:
            mem = psutil.virtual_memory()
            readings.append(SensorReading(
                sensorType="ram",
                value=round(mem.percent, 1),
                unit="%",
                threshold=self.thresholds["ram_percent"],
                alert=mem.percent > self.thresholds["ram_percent"]["max"],
            ))
            readings.append(SensorReading(
                sensorType="ram_used",
                value=round(mem.used / (1024 ** 3), 2),
                unit="GB",
            ))
            readings.append(SensorReading(
                sensorType="ram_available",
                value=round(mem.available / (1024 ** 3), 2),
                unit="GB",
            ))
        except (PermissionError, Exception) as e:
            logger.debug(f"Could not read memory metrics: {e}")

        # ── Disk ─────────────────────────────────────────────────────────────
        try:
            disk = psutil.disk_usage("/")
            readings.append(SensorReading(
                sensorType="disk",
                value=round(disk.percent, 1),
                unit="%",
                threshold=self.thresholds["disk_percent"],
                alert=disk.percent > self.thresholds["disk_percent"]["max"],
            ))
            readings.append(SensorReading(
                sensorType="disk_used",
                value=round(disk.used / (1024 ** 3), 2),
                unit="GB",
            ))
            readings.append(SensorReading(
                sensorType="disk_free",
                value=round(disk.free / (1024 ** 3), 2),
                unit="GB",
            ))

            # I/O counters
            io = psutil.disk_io_counters()
            if io:
                readings.append(SensorReading(
                    sensorType="disk_read",
                    value=round(io.read_bytes / (1024 ** 2), 2),
                    unit="MB",
                ))
                readings.append(SensorReading(
                    sensorType="disk_write",
                    value=round(io.write_bytes / (1024 ** 2), 2),
                    unit="MB",
                ))
        except (PermissionError, Exception) as e:
            logger.debug(f"Could not read disk metrics: {e}")

        # ── Network ────────────────────────────────────────────────────────
        try:
            net = psutil.net_io_counters()
            readings.append(SensorReading(
                sensorType="net_sent",
                value=round(net.bytes_sent / (1024 ** 2), 2),
                unit="MB",
            ))
            readings.append(SensorReading(
                sensorType="net_recv",
                value=round(net.bytes_recv / (1024 ** 2), 2),
                unit="MB",
            ))

            # Network connections
            connections = len(psutil.net_connections())
            readings.append(SensorReading(
                sensorType="net_connections",
                value=float(connections),
                unit="count",
            ))
        except (PermissionError, Exception) as e:
            logger.debug(f"Could not read network metrics: {e}")

        # ── Battery ─────────────────────────────────────────────────────────
        battery = self._get_battery()
        if battery:
            readings.append(SensorReading(
                sensorType="battery",
                value=round(battery["percent"], 1),
                unit="%",
                threshold=self.thresholds["battery_percent"],
                alert=battery["percent"] < self.thresholds["battery_percent"]["min"],
            ))
            readings.append(SensorReading(
                sensorType="battery_plugged",
                value=1.0 if battery["plugged"] else 0.0,
                unit="bool",
            ))
            if battery.get("time_left"):
                readings.append(SensorReading(
                    sensorType="battery_time",
                    value=round(battery["time_left"] / 60, 1),
                    unit="min",
                ))

        # ── Load Average (Unix) ────────────────────────────────────────────
        if hasattr(os, "getloadavg"):
            import os
            try:
                load1, load5, load15 = os.getloadavg()
                readings.append(SensorReading(
                    sensorType="load_1m",
                    value=round(load1, 2),
                    unit="",
                ))
                readings.append(SensorReading(
                    sensorType="load_5m",
                    value=round(load5, 2),
                    unit="",
                ))
                readings.append(SensorReading(
                    sensorType="load_15m",
                    value=round(load15, 2),
                    unit="",
                ))
            except (OSError, Exception) as e:
                logger.debug(f"Could not read load average: {e}")

        # ── Boot Time / Uptime ─────────────────────────────────────────────
        try:
            boot_time = psutil.boot_time()
            uptime = asyncio.get_event_loop().time() - boot_time
            readings.append(SensorReading(
                sensorType="uptime",
                value=round(uptime / 3600, 2),
                unit="hours",
            ))
        except (PermissionError, Exception) as e:
            logger.debug(f"Could not read boot time: {e}")

        # ── Process Count ───────────────────────────────────────────────────
        try:
            pids = psutil.pids()
            readings.append(SensorReading(
                sensorType="processes",
                value=float(len(pids)),
                unit="count",
            ))
        except (PermissionError, Exception) as e:
            logger.debug(f"Could not read process list: {e}")

        # Update device info metrics
        if self.device_info:
            self.device_info.metrics = {r.sensorType: r.value for r in readings}
            self.device_info.lastSeen = asyncio.get_event_loop().time()

        self._readings_cache = readings
        return readings

    def _get_cpu_temperature(self) -> dict[str, float]:
        """Get CPU temperature using psutil sensors."""
        temps: dict[str, float] = {}
        try:
            if hasattr(psutil, "sensors_temperatures"):
                sensors = psutil.sensors_temperatures()
                for name, entries in sensors.items():
                    for entry in entries:
                        if entry.current:
                            temps[f"{name}_{entry.label or '0'}"] = entry.current
        except Exception as e:
            logger.debug(f"Could not read CPU temperature: {e}")
        return temps

    def _get_battery(self) -> dict[str, Any] | None:
        """Get battery status."""
        try:
            battery = psutil.sensors_battery()
            if battery:
                return {
                    "percent": battery.percent,
                    "plugged": battery.power_plugged,
                    "time_left": battery.secsleft if battery.secsleft != psutil.POWER_TIME_UNLIMITED else None,
                }
        except Exception as e:
            logger.debug(f"Could not read battery: {e}")
        return None

    async def execute(self, command: str, params: dict) -> dict:
        """Execute a system command (limited, safe operations only)."""
        if command == "shutdown":
            return {"success": False, "message": "Shutdown disabled for safety"}
        elif command == "restart":
            return {"success": False, "message": "Restart disabled for safety"}
        elif command == "set_threshold":
            metric = params.get("metric")
            if metric in self.thresholds:
                self.thresholds[metric] = {
                    "min": params.get("min", self.thresholds[metric]["min"]),
                    "max": params.get("max", self.thresholds[metric]["max"]),
                }
                return {"success": True, "thresholds": self.thresholds[metric]}
            return {"success": False, "message": f"Unknown metric: {metric}"}
        elif command == "get_processes":
            procs = []
            for p in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]):
                try:
                    procs.append(p.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            return {"success": True, "processes": procs[:params.get("limit", 50)]}
        else:
            return {"success": False, "message": f"Unknown command: {command}"}

    async def shutdown(self) -> None:
        """Clean up."""
        self._running = False
        if self._poll_task:
            self._poll_task.cancel()
            try:
                await self._poll_task
            except asyncio.CancelledError:
                pass
        logger.info("Laptop sensor manager shutdown")

    async def get_devices(self) -> list[LaptopDeviceInfo]:
        """Get the laptop device with current readings."""
        if self.device_info:
            return [self.device_info]
        return []

    async def discover(self) -> list[LaptopDeviceInfo]:
        """Return the local laptop device (always discovered)."""
        return await self.get_devices()

    async def send_command(self, device_id: str, command: str, params: dict) -> dict:
        """Compatibility wrapper for send_command -> execute."""
        return await self.execute(command, params)

    async def disconnect(self) -> None:
        """Compatibility wrapper for disconnect -> shutdown."""
        await self.shutdown()