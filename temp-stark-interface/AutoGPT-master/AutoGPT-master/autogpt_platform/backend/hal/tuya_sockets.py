"""
Tuya Smart Device Integration via TinyTuya.
Handles smart plugs, bulbs, switches, and sensors.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from dataclasses import dataclass, field
from typing import Any, List

logger = logging.getLogger("jerry.hal.tuya")

try:
    import tinytuya
    TUYA_AVAILABLE = True
except ImportError:
    TUYA_AVAILABLE = False
    logger.warning("tinytuya not installed. Tuya devices will be unavailable.")


@dataclass
class TuyaDeviceInfo:
    id: str
    name: str
    ip: str
    key: str
    version: str = "3.3"
    metrics: dict[str, Any] = field(default_factory=dict)
    controls: list[dict] = field(default_factory=list)
    units: dict[str, str] = field(default_factory=dict)
    dps: dict[str, Any] = field(default_factory=dict)


class TuyaManager:
    """
    Manages Tuya smart devices using TinyTuya.
    Supports local LAN control and cloud fallback.
    """

    def __init__(self) -> None:
        self.devices: dict[str, tinytuya.Device] = {}
        self.device_info: dict[str, TuyaDeviceInfo] = {}
        self.cloud: tinytuya.Cloud | None = None
        self._connected = False

        # Load config from environment or local files
        self.api_key = os.getenv("TUYA_API_KEY", "")
        self.api_secret = os.getenv("TUYA_API_SECRET", "")
        self.device_file = os.getenv("TUYA_DEVICE_FILE", "devices.json")

    async def connect(self) -> None:
        """Initialize Tuya connection (cloud + local)."""
        if not TUYA_AVAILABLE:
            raise RuntimeError("tinytuya not installed")

        # Try cloud connection first
        if self.api_key and self.api_secret:
            try:
                self.cloud = tinytuya.Cloud(
                    apiRegion=os.getenv("TUYA_REGION", "us"),
                    apiKey=self.api_key,
                    apiSecret=self.api_secret,
                )
                logger.info("Tuya cloud connected")
            except Exception as e:
                logger.warning(f"Tuya cloud connection failed: {e}")

        # Load local device list
        await self._load_devices()
        self._connected = True

    async def _load_devices(self) -> None:
        """Load device list from TinyTuya snapshot or cloud."""
        try:
            if os.path.exists(self.device_file):
                with open(self.device_file) as f:
                    device_data = json.load(f)

                for dev in device_data.get("devices", []):
                    info = TuyaDeviceInfo(
                        id=dev["id"],
                        name=dev.get("name", "Unknown"),
                        ip=dev.get("ip", ""),
                        key=dev.get("key", ""),
                        version=dev.get("version", "3.3"),
                    )
                    self.device_info[info.id] = info

                    # Create local device connection
                    if info.ip and info.key:
                        device = tinytuya.Device(info.id, info.ip, info.key)
                        device.set_version(float(info.version))
                        self.devices[info.id] = device

                logger.info(f"Loaded {len(self.devices)} Tuya devices")
        except Exception as e:
            logger.error(f"Failed to load Tuya devices: {e}")

    async def discover(self) -> list[TuyaDeviceInfo]:
        """Scan local network for Tuya devices."""
        if not TUYA_AVAILABLE:
            return []

        try:
            # TinyTuya scanner (blocking, run in thread)
            loop = asyncio.get_event_loop()
            devices = await loop.run_in_executor(
                None, tinytuya.deviceScan, False, 20
            )

            found: list[TuyaDeviceInfo] = []
            for ip, dev in devices.items():
                info = TuyaDeviceInfo(
                    id=dev["id"],
                    name=dev.get("name", f"Tuya-{dev['id'][:6]}"),
                    ip=ip,
                    key=dev.get("key", ""),
                    version=dev.get("version", "3.3"),
                )
                found.append(info)
                self.device_info[info.id] = info

                # Create/update local connection
                if info.key:
                    device = tinytuya.Device(info.id, info.ip, info.key)
                    device.set_version(float(info.version))
                    self.devices[info.id] = device

            return found
        except Exception as e:
            logger.error(f"Tuya discovery failed: {e}")
            return []

    async def get_devices(self) -> list[TuyaDeviceInfo]:
        """Poll all connected Tuya devices for current state."""
        if not self._connected:
            return list(self.device_info.values())

        results: list[TuyaDeviceInfo] = []
        for dev_id, device in self.devices.items():
            try:
                info = self.device_info.get(dev_id)
                if not info:
                    continue

                # Get DPS (Data Point Status) - blocking I/O
                loop = asyncio.get_event_loop()
                payload = await loop.run_in_executor(None, device.status)

                if "dps" in payload:
                    info.dps = payload["dps"]
                    info.metrics = self._parse_dps(payload["dps"])
                    info.controls = self._infer_controls(payload["dps"])

                info.units = {
                    "power": "W",
                    "current": "mA",
                    "voltage": "V",
                    "temp": "°C",
                }

                results.append(info)
            except Exception as e:
                logger.debug(f"Failed to poll Tuya device {dev_id}: {e}")
                # Mark as potentially offline
                info = self.device_info.get(dev_id)
                if info:
                    info.metrics["connection_error"] = str(e)

        return results

    def _parse_dps(self, dps: dict[str, Any]) -> dict[str, Any]:
        """Parse Tuya DPS values into normalized metrics."""
        metrics: dict[str, Any] = {}

        # Common DPS mappings for smart plugs
        dps_map = {
            "1": ("switch", bool),           # Main switch
            "9": ("power", float),            # Current power (W)
            "18": ("current", float),         # Current (mA)
            "19": ("power_total", float),     # Total power (kWh)
            "20": ("voltage", float),         # Voltage (V)
            "21": ("test_bit", int),          # Test bit
            "22": ("voltage_coe", int),       # Voltage coefficient
            "23": ("electric_coe", int),      # Electric coefficient
            "24": ("power_coe", int),         # Power coefficient
            "25": ("electricity_coe", int),   # Electricity coefficient
            "26": ("fault", str),             # Fault code
        }

        for key, (name, type_fn) in dps_map.items():
            if key in dps:
                try:
                    raw = dps[key]
                    if type_fn == bool:
                        metrics[name] = bool(raw)
                    elif type_fn == float:
                        # Tuya often sends values * 10 or * 100
                        metrics[name] = float(raw) / 10.0 if name in ["power", "voltage"] else float(raw)
                    else:
                        metrics[name] = type_fn(raw)
                except (ValueError, TypeError):
                    metrics[name] = raw

        # Handle raw DPS for unknown devices
        for k, v in dps.items():
            if k not in dps_map:
                metrics[f"dps_{k}"] = v

        return metrics

    def _infer_controls(self, dps: dict[str, Any]) -> list[dict]:
        """Infer UI controls from DPS schema."""
        controls: list[dict] = []

        if "1" in dps:
            controls.append({
                "id": "switch",
                "label": "Power",
                "type": "toggle",
                "value": bool(dps["1"]),
            })

        if "2" in dps and isinstance(dps["2"], int):
            controls.append({
                "id": "brightness",
                "label": "Brightness",
                "type": "slider",
                "value": dps["2"],
                "min": 0,
                "max": 255,
            })

        if "3" in dps and isinstance(dps["3"], str):
            controls.append({
                "id": "color",
                "label": "Color",
                "type": "color",
                "value": dps["3"],
            })

        if "5" in dps and isinstance(dps["5"], str):
            controls.append({
                "id": "mode",
                "label": "Mode",
                "type": "select",
                "value": dps["5"],
                "options": ["white", "colour", "scene", "music"],
            })

        return controls

    async def send_command(self, device_id: str, command: str, params: dict) -> dict:
        """Send a command to a Tuya device."""
        device = self.devices.get(device_id)
        if not device:
            return {"success": False, "message": "Device not connected locally"}

        try:
            loop = asyncio.get_event_loop()

            if command == "toggle":
                current = await loop.run_in_executor(None, device.status)
                new_state = not bool(current.get("dps", {}).get("1", False))
                result = await loop.run_in_executor(None, device.turn_on if new_state else device.turn_off)
                return {"success": True, "state": new_state, "raw": result}

            elif command == "turn_on":
                result = await loop.run_in_executor(None, device.turn_on)
                return {"success": True, "raw": result}

            elif command == "turn_off":
                result = await loop.run_in_executor(None, device.turn_off)
                return {"success": True, "raw": result}

            elif command == "set_brightness":
                dps = {"2": int(params.get("value", 128))}
                result = await loop.run_in_executor(None, device.set_dps, dps)
                return {"success": True, "raw": result}

            elif command == "set_color":
                dps = {"3": params.get("value", "000000")}
                result = await loop.run_in_executor(None, device.set_dps, dps)
                return {"success": True, "raw": result}

            elif command == "set_dps":
                dps = params.get("dps", {})
                result = await loop.run_in_executor(None, device.set_dps, dps)
                return {"success": True, "raw": result}

            else:
                return {"success": False, "message": f"Unknown command: {command}"}

        except Exception as e:
            logger.error(f"Tuya command failed: {e}")
            return {"success": False, "message": str(e)}

    async def disconnect(self) -> None:
        """Clean up Tuya connections."""
        self._connected = False
        self.devices.clear()
        logger.info("Tuya manager disconnected")