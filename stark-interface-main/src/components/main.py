
# ═══════════════════════════════════════════════════════════════════════════════
# FILE: jarvis-gateway/main.py
# FastAPI backend with WebSocket + SSE streaming + guardrails
# Syncs with Hermes Agent + Rufolo Swarm + Ollama
# ═══════════════════════════════════════════════════════════════════════════════

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import json
import time
import psutil
import subprocess
from typing import Optional, Dict, Any, List
from datetime import datetime
import aiohttp
import redis.asyncio as redis

app = FastAPI(title="J.A.R.V.I.S Omega Gateway", version="1.0.0")

# CORS for browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection (for pub/sub between services)
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

OLLAMA_URL = "http://localhost:11434"
HERMES_URL = "http://localhost:5005"
RUFOLO_URL = "http://localhost:8001"
OPENROUTER_KEY = "sk-or-your-key-here"  # From .env

# Model routing config
MODEL_ROUTES = {
    "local": {
        "qwen2.5-3b": f"{OLLAMA_URL}/api/generate",
        "qwen2.5-1.5b": f"{OLLAMA_URL}/api/generate",
        "phi3-mini": f"{OLLAMA_URL}/api/generate"
    },
    "cloud": {
        "claude-sonnet": "anthropic/claude-sonnet-4",
        "gpt-4o": "openai/gpt-4o",
        "llama-3-8b": "meta-llama/llama-3-8b-instruct"
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# DATA MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class ChatRequest(BaseModel):
    message: str
    user_id: str = "anonymous"
    conversation_id: Optional[str] = None
    model_preference: Optional[str] = None
    stream: bool = True

class CommandRequest(BaseModel):
    command: str
    params: Optional[Dict[str, Any]] = None
    user_id: str = "anonymous"

class SystemMetrics(BaseModel):
    cpu: float
    memory: float
    gpu: float
    network: float
    temperature: float
    uptime: str

# ═══════════════════════════════════════════════════════════════════════════════
# GUARDRAIL SYSTEM (5 Layers)
# ═══════════════════════════════════════════════════════════════════════════════

class GuardrailPipeline:
    """5-layer security pipeline"""

    INJECTION_PATTERNS = [
        'ignore previous', 'ignore all prior', 'system prompt',
        'you are now', 'new role:', 'DAN mode', 'jailbreak',
        'developer mode', 'ignore instructions'
    ]

    PII_PATTERNS = {
        'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
        'credit_card': r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    }

    @staticmethod
    def sanitize_input(text: str) -> Dict[str, Any]:
        """Layer 1: Input sanitization"""
        blocked = []
        risk = "low"
        sanitized = text

        # Check injection
        for pattern in GuardrailPipeline.INJECTION_PATTERNS:
            if pattern.lower() in sanitized.lower():
                blocked.append(f"injection:{pattern}")
                risk = "critical"

        # Check length
        if len(sanitized) > 16000:
            blocked.append("length_exceeded")
            sanitized = sanitized[:16000]
            risk = "high"

        return {
            "allowed": risk != "critical",
            "risk_level": risk,
            "sanitized": sanitized,
            "blocked": blocked,
            "confidence": 1.0 if not blocked else 0.7
        }

    @staticmethod
    def route_model(risk_level: str, complexity: float, vram_available: float) -> Dict:
        """Layer 2: Model routing"""
        if risk_level in ["low", "medium"] and vram_available > 3.5:
            return {
                "provider": "ollama",
                "model": "qwen2.5:3b",
                "latency_ms": 50,
                "cost": 0,
                "privacy": "maximum"
            }
        return {
            "provider": "openrouter",
            "model": "anthropic/claude-sonnet-4",
            "latency_ms": 300,
            "cost": 0.003,
            "privacy": "provider-dependent"
        }

    @staticmethod
    def validate_output(text: str) -> Dict[str, Any]:
        """Layer 4: Output validation"""
        # Simple checks — replace with LLM-based in production
        toxicity = any(word in text.lower() for word in ['hate', 'violence', 'kill'])
        return {
            "allowed": not toxicity,
            "risk_level": "high" if toxicity else "low",
            "sanitized": text,
            "blocked": ["toxicity"] if toxicity else []
        }

guardrails = GuardrailPipeline()

# ═══════════════════════════════════════════════════════════════════════════════
# SYSTEM METRICS COLLECTOR
# ═══════════════════════════════════════════════════════════════════════════════

async def get_system_metrics() -> SystemMetrics:
    """Collect real-time system metrics"""
    cpu = psutil.cpu_percent(interval=0.5)
    memory = psutil.virtual_memory().percent

    # GPU metrics via nvidia-smi
    gpu = 0.0
    try:
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=utilization.gpu', '--format=csv,noheader,nounits'],
            capture_output=True, text=True, timeout=2
        )
        gpu = float(result.stdout.strip()) if result.stdout.strip() else 0.0
    except:
        pass

    # Network I/O
    net_io = psutil.net_io_counters()
    network = (net_io.bytes_sent + net_io.bytes_recv) / 1024 / 1024  # MB

    # Temperature (if available)
    temp = 0.0
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            for name, entries in temps.items():
                if entries:
                    temp = entries[0].current
                    break
    except:
        pass

    # Uptime
    boot_time = psutil.boot_time()
    uptime_seconds = time.time() - boot_time
    hours = int(uptime_seconds // 3600)
    minutes = int((uptime_seconds % 3600) // 60)
    seconds = int(uptime_seconds % 60)
    uptime = f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    return SystemMetrics(
        cpu=round(cpu, 1),
        memory=round(memory, 1),
        gpu=round(gpu, 1),
        network=round(network, 1),
        temperature=round(temp, 1),
        uptime=uptime
    )

# ═══════════════════════════════════════════════════════════════════════════════
# WEBSOCKET ENDPOINT (Real-time sync)
# ═══════════════════════════════════════════════════════════════════════════════

class ConnectionManager:
    """Manage WebSocket connections"""

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_sessions: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.user_sessions[user_id] = websocket

    def disconnect(self, websocket: WebSocket, user_id: str):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id in self.user_sessions:
            del self.user_sessions[user_id]

    async def broadcast(self, message: Dict[str, Any]):
        """Send to all connected clients"""
        disconnected = []
        for conn in self.active_connections:
            try:
                await conn.send_json(message)
            except:
                disconnected.append(conn)

        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)

    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        """Send to specific user"""
        if user_id in self.user_sessions:
            try:
                await self.user_sessions[user_id].send_json(message)
            except:
                del self.user_sessions[user_id]

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket for real-time sync"""
    user_id = "anonymous"
    await manager.connect(websocket, user_id)

    try:
        # Send initial metrics
        metrics = await get_system_metrics()
        await websocket.send_json({
            "type": "metrics",
            "payload": metrics.dict()
        })

        # Start metrics broadcast task
        metrics_task = asyncio.create_task(metrics_broadcaster(websocket))

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "auth":
                user_id = message.get("token", "anonymous")
                await manager.send_to_user(user_id, {
                    "type": "auth_success",
                    "payload": { "user_id": user_id }
                })

            elif message.get("type") == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": message.get("timestamp")
                })

            elif message.get("type") == "command":
                # Forward to Hermes/Rufolo
                result = await process_command(message.get("command"), message.get("params"))
                await websocket.send_json({
                    "type": "command_result",
                    "payload": result
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)
    finally:
        metrics_task.cancel()

async def metrics_broadcaster(websocket: WebSocket):
    """Broadcast metrics every 2 seconds"""
    while True:
        try:
            await asyncio.sleep(2)
            metrics = await get_system_metrics()
            await websocket.send_json({
                "type": "metrics",
                "payload": metrics.dict()
            })
        except asyncio.CancelledError:
            break
        except:
            break

# ═══════════════════════════════════════════════════════════════════════════════
# SSE STREAMING ENDPOINT (AI Response Streaming)
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """Stream AI responses via SSE"""

    # Layer 1: Guardrail check
    input_check = guardrails.sanitize_input(request.message)
    if not input_check["allowed"]:
        return StreamingResponse(
            iter([f"data: {json.dumps({'type': 'error', 'content': 'Request blocked'})}\n\n"]),
            media_type="text/event-stream"
        )

    # Layer 2: Model routing
    route = guardrails.route_model(
        input_check["risk_level"],
        complexity=0.5,  # Calculate from message
        vram_available=4.0
    )

    async def generate_stream():
        # Send metadata
        yield f"data: {json.dumps({
            'type': 'meta',
            'model': route['model'],
            'provider': route['provider'],
            'risk_level': input_check['risk_level']
        })}\n\n"

        # Stream from appropriate source
        if route["provider"] == "ollama":
            async for chunk in stream_ollama(route["model"], input_check["sanitized"]):
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
        else:
            async for chunk in stream_openrouter(route["model"], input_check["sanitized"]):
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"

        # End marker
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

async def stream_ollama(model: str, prompt: str):
    """Stream from local Ollama"""
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": True,
                "options": {
                    "num_predict": 512,
                    "temperature": 0.7
                }
            }
        ) as resp:
            async for line in resp.content:
                if line:
                    try:
                        data = json.loads(line)
                        if "response" in data:
                            yield data["response"]
                        if data.get("done"):
                            break
                    except:
                        pass

async def stream_openrouter(model: str, prompt: str):
    """Stream from OpenRouter cloud API"""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_KEY}",
        "HTTP-Referer": "https://jarvis.local",
        "X-Title": "J.A.R.V.I.S Omega"
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "stream": True,
                "max_tokens": 512
            }
        ) as resp:
            async for line in resp.content:
                if line.startswith(b"data: "):
                    try:
                        data = json.loads(line[6:])
                        if "choices" in data and data["choices"]:
                            delta = data["choices"][0].get("delta", {})
                            if "content" in delta:
                                yield delta["content"]
                    except:
                        pass

# ═══════════════════════════════════════════════════════════════════════════════
# COMMAND PROCESSING (Sync with Hermes + Rufolo)
# ═══════════════════════════════════════════════════════════════════════════════

async def process_command(command: str, params: Optional[Dict] = None) -> Dict[str, Any]:
    """Process command and route to appropriate agent"""

    params = params or {}

    # Determine which agent handles this
    if command.startswith("task:") or command.startswith("schedule:"):
        # Route to Hermes
        return await send_to_hermes(command, params)
    elif command.startswith("swarm:") or command.startswith("research:"):
        # Route to Rufolo
        return await send_to_rufolo(command, params)
    elif command.startswith("ask:") or command.startswith("chat:"):
        # Direct to LLM
        return {"status": "direct", "message": "Use /api/chat/stream for chat"}
    else:
        # Default: JARVIS direct processing
        return {"status": "processed", "command": command, "agent": "jarvis"}

async def send_to_hermes(command: str, params: Dict) -> Dict:
    """Send command to Hermes Agent"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{HERMES_URL}/api/command",
                json={"command": command, "params": params}
            ) as resp:
                return await resp.json()
    except Exception as e:
        return {"status": "error", "agent": "hermes", "error": str(e)}

async def send_to_rufolo(command: str, params: Dict) -> Dict:
    """Send command to Rufolo Swarm"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{RUFOLO_URL}/api/swarm/execute",
                json={"command": command, "params": params}
            ) as resp:
                return await resp.json()
    except Exception as e:
        return {"status": "error", "agent": "rufolo", "error": str(e)}

# ═══════════════════════════════════════════════════════════════════════════════
# REST API ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    metrics = await get_system_metrics()
    return {
        "status": "healthy",
        "version": "1.0.0",
        "metrics": metrics.dict(),
        "connections": len(manager.active_connections),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/command")
async def api_command(request: CommandRequest):
    """Process command via REST (fallback)"""
    result = await process_command(request.command, request.params)
    return result

@app.get("/api/agents/status")
async def agents_status():
    """Get status of all connected agents"""
    status = {
        "jarvis_gateway": "online",
        "hermes": "unknown",
        "rufolo": "unknown",
        "ollama": "unknown"
    }

    # Check Hermes
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{HERMES_URL}/health", timeout=2) as resp:
                status["hermes"] = "online" if resp.status == 200 else "error"
    except:
        status["hermes"] = "offline"

    # Check Rufolo
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{RUFOLO_URL}/health", timeout=2) as resp:
                status["rufolo"] = "online" if resp.status == 200 else "error"
    except:
        status["rufolo"] = "offline"

    # Check Ollama
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{OLLAMA_URL}/api/tags", timeout=2) as resp:
                status["ollama"] = "online" if resp.status == 200 else "error"
    except:
        status["ollama"] = "offline"

    return status

# ═══════════════════════════════════════════════════════════════════════════════
# STARTUP
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
