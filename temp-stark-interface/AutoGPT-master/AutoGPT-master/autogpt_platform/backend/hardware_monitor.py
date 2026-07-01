import asyncio
import json
import time
import psutil
from backend.data.redis_client import get_redis
from backend.util.settings import Settings

settings = Settings()
logger = __import__("logging").getLogger(__name__)

def get_hardware_data():
    """Collect real-time hardware data from laptop sensors"""
    cpu_usage = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    battery = psutil.sensors_battery() if hasattr(psutil, 'sensors_battery') else None
    # Windows-compatible disk usage (uses C: drive instead of /)
    disk = psutil.disk_usage('C:\\')
    
    return {
        "timestamp": time.time(),
        "cpu": {
            "usage_percent": cpu_usage,
            "core_count": psutil.cpu_count()
        },
        "memory": {
            "total_gb": round(memory.total / (1024**3), 2),
            "used_gb": round(memory.used / (1024**3), 2),
            "usage_percent": memory.percent
        },
        "battery": {
            "percent": battery.percent if battery else None,
            "power_plugged": battery.power_plugged if battery else None
        },
        "disk": {
            "total_gb": round(disk.total / (1024**3), 2),
            "used_gb": round(disk.used / (1024**3), 2),
            "usage_percent": disk.percent
        }
    }

async def publish_hardware_data():
    """Publish hardware data to Redis for WebSocket broadcasting"""
    # Use default user ID that matches WebSocket auth expectations
    user_id = "default_user"
    channel_key = f"hardware:{user_id}"
    full_channel = f"{settings.config.execution_event_bus_name}/{channel_key}"
    
    # Get a single Redis client to reuse
    redis_client = get_redis()
    
    while True:
        # Get hardware data
        hw_data = get_hardware_data()
        
        # Format as WebSocket event matching the backend's WSMessage format
        ws_message = {
            "payload": {
                "event_type": "hardware_data_event",
                "data": hw_data
            }
        }
        
        # Publish to Redis (matches the event bus format used by the backend)
        try:
            await redis_client.spublish(full_channel, json.dumps(ws_message).encode())
            logger.debug(f"Published hardware data: CPU {hw_data['cpu']['usage_percent']}% | RAM {hw_data['memory']['usage_percent']}%")
        except Exception as e:
            logger.error(f"Failed to publish hardware data: {e}")
        
        # Wait 2 seconds before next update
        await asyncio.sleep(2)

if __name__ == "__main__":
    # Install psutil first if not installed: poetry add psutil
    print("Starting laptop hardware monitor - publishing real-time data to WebSocket server...")
    asyncio.run(publish_hardware_data())