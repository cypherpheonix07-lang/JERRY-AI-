"""
STARK INTERFACE - EXTREME LIMITS STRESS SIMULATION
Pushes J.A.R.V.I.S + all AI agents (Hermes, Ruflo, Goose) to absolute breaking point
"""
import asyncio
import time
import random
import psutil
import threading
from datetime import datetime
import json
import requests
import websockets
import numpy as np
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

# ==============================================
# EXTREME SIMULATION CONFIGURATION
# ==============================================
SIMULATION_CONFIG = {
    "max_cpu_threads": psutil.cpu_count(logical=True) * 8,  # DOUBLED for unified agent
    "max_websocket_connections": 1000,  # DOUBLED for unified orchestrator
    "concurrent_api_requests": 2000,  # DOUBLED for unified stack
    "memory_stress_mb": int(psutil.virtual_memory().total // (1024*1024) * 0.8),  # 80% RAM (was 50%)
    "message_rate_per_second": 50000,  # 5x increased for unified processing
    "test_duration_seconds": 180,  # 3 minutes to push unified limits
    "agents": ["STARK-UNIFIED"],  # ALL THREE MERGED INTO ONE: Hermes + Ruflo + Goose(AAIF)
    "providers": ["anthropic", "openai", "google", "ollama", "openrouter", "azure", "bedrock"],
}

# ==============================================
# MEMORY STRESS ENGINE
# ==============================================
class MemoryStressEngine:
    def __init__(self):
        self.memory_bloats = []
        self.running = False
        
    def start_stress(self, target_mb):
        """Allocate massive memory to push RAM limits"""
        self.running = True
        chunk_size = 10 * 1024 * 1024  # 10MB chunks
        chunks_needed = target_mb // 10
        
        print(f"🧠 Starting memory stress: allocating {target_mb}MB...")
        while self.running and len(self.memory_bloats) < chunks_needed:
            try:
                self.memory_bloats.append(bytearray(chunk_size))
                if len(self.memory_bloats) % 10 == 0:
                    print(f"   Memory allocated: {len(self.memory_bloats)*10}MB")
            except MemoryError:
                print(f"💥 Memory limit hit! Could only allocate {len(self.memory_bloats)*10}MB")
                break
            time.sleep(0.01)
    
    def stop(self):
        self.running = False
        self.memory_bloats.clear()

# ==============================================
# CPU STRESS ENGINE
# ==============================================
def cpu_intensive_task():
    """Generate pure CPU load - prime number generation"""
    while True:
        num = random.randint(1000000, 100000000)
        for i in range(2, int(num**0.5)+1):
            if num % i == 0:
                break
        time.sleep(0.0001)

# ==============================================
# NETWORK STRESS ENGINE
# ==============================================
class NetworkStressEngine:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.request_count = 0
        self.error_count = 0
        self.latencies = []
        
    async def spam_websocket(self, connection_id):
        """Create and flood WebSocket connections"""
        try:
            async with websockets.connect(f"ws://localhost:8000/ws") as ws:
                while True:
                    message = {
                        "id": f"stress_{connection_id}_{time.time()}",
                        "agent": "STARK-UNIFIED",  # Always use the unified merged agent
                        "provider": random.choice(SIMULATION_CONFIG["providers"]),
                        "content": "X" * random.randint(100, 16000),  # Larger payloads for unified stack
                        "timestamp": time.time()
                    }
                    start = time.time()
                    await ws.send(json.dumps(message))
                    response = await ws.recv()
                    latency = (time.time() - start) * 1000
                    self.latencies.append(latency)
                    self.request_count += 1
        except Exception as e:
            self.error_count += 1
    
    def spam_http_requests(self):
        """Spam HTTP endpoints"""
        endpoints = ["/health", "/api/status", "/api/metrics", "/api/tasks", "/api/memories"]
        while True:
            try:
                endpoint = random.choice(endpoints)
                start = time.time()
                r = requests.get(f"http://localhost:8000{endpoint}", timeout=1)
                latency = (time.time() - start) * 1000
                self.latencies.append(latency)
                self.request_count += 1
            except:
                self.error_count += 1

# ==============================================
# ZUSTAND STORE STRESS (frontend simulation)
# ==============================================
class ZustandStressSimulator:
    """Simulate thousands of Zustand store mutations"""
    def __init__(self):
        self.mutation_count = 0
        
    def spam_store_mutations(self):
        """Generate constant store updates simulating thousands of components"""
        base_state = {
            "cpu": random.uniform(0, 100),
            "memory": random.uniform(0, 100),
            "network": random.uniform(0, 100),
            "temperature": random.uniform(40, 100),
            "wsConnected": random.choice([True, False]),
        }
        while True:
            # Simulate Zustand set() calls
            base_state["cpu"] = random.uniform(0, 100)
            base_state["memory"] = random.uniform(0, 100)
            base_state["network"] = random.uniform(0, 100)
            base_state["temperature"] = random.uniform(40, 100)
            base_state["wsConnected"] = random.choice([True, False])
            self.mutation_count += 1
            time.sleep(0.00001)  # 100k mutations/sec potential

# ==============================================
# MAIN EXTREME SIMULATION RUNNER
# ==============================================
async def run_extreme_simulation():
    print("="*80)
    print("🚀 STARK INTERFACE - EXTREME LIMITS STRESS SIMULATION STARTING")
    print("="*80)
    print(f"System specs detected:")
    print(f"   CPU Cores (logical): {psutil.cpu_count(logical=True)}")
    print(f"   Total RAM: {psutil.virtual_memory().total // (1024*1024*1024)}GB")
    print(f"   Target RAM usage: {SIMULATION_CONFIG['memory_stress_mb']}MB")
    print(f"   Max WebSocket connections: {SIMULATION_CONFIG['max_websocket_connections']}")
    print(f"   Concurrent API requests: {SIMULATION_CONFIG['concurrent_api_requests']}")
    print(f"   AI Agents under test: {SIMULATION_CONFIG['agents']}")
    print(f"   Test duration: {SIMULATION_CONFIG['test_duration_seconds']}s")
    print("-"*80)
    
    # Initialize all stress engines
    mem_stress = MemoryStressEngine()
    net_stress = NetworkStressEngine()
    zustand_stress = ZustandStressSimulator()
    
    # Start memory stress in thread
    mem_thread = threading.Thread(target=mem_stress.start_stress, args=(SIMULATION_CONFIG['memory_stress_mb'],))
    mem_thread.start()
    
    # Spawn CPU stress processes
    print("\n🔥 Spawning CPU stress processes...")
    with ProcessPoolExecutor(max_workers=psutil.cpu_count(logical=True)) as cpu_exec:
        for _ in range(psutil.cpu_count(logical=True)):
            cpu_exec.submit(cpu_intensive_task)
    
    # Spawn Zustand mutation threads
    print("\n📦 Spawning Zustand store mutation simulators...")
    zustand_threads = []
    for i in range(50):  # 50 threads spamming store mutations
        t = threading.Thread(target=zustand_stress.spam_store_mutations)
        t.daemon = True
        t.start()
        zustand_threads.append(t)
    
    # Spawn HTTP spam threads
    print("\n🌐 Spawning HTTP request spam threads...")
    http_threads = []
    for i in range(100):
        t = threading.Thread(target=net_stress.spam_http_requests)
        t.daemon = True
        t.start()
        http_threads.append(t)
    
    # Spawn WebSocket connections
    print("\n🔌 Spawning WebSocket connections...")
    ws_tasks = []
    for i in range(SIMULATION_CONFIG['max_websocket_connections']):
        task = asyncio.create_task(net_stress.spam_websocket(i))
        ws_tasks.append(task)
        if i % 50 == 0:
            print(f"   Created {i}/{SIMULATION_CONFIG['max_websocket_connections']} WebSockets")
    
    # Monitor system for duration
    start_time = time.time()
    while time.time() - start_time < SIMULATION_CONFIG['test_duration_seconds']:
        elapsed = time.time() - start_time
        mem = psutil.virtual_memory()
        cpu = psutil.cpu_percent(interval=1)
        net_stats = psutil.net_io_counters()
        
        print(f"\n⏱️  Elapsed: {int(elapsed)}s / {SIMULATION_CONFIG['test_duration_seconds']}s")
        print(f"   CPU Usage: {cpu}% | RAM Usage: {mem.percent}% ({mem.used//(1024*1024*1024)}GB/{mem.total//(1024*1024*1024)}GB)")
        print(f"   Network bytes sent: {net_stats.bytes_sent//(1024*1024)}MB | recv: {net_stats.bytes_recv//(1024*1024)}MB")
        print(f"   Total requests: {net_stress.request_count} | Errors: {net_stress.error_count}")
        print(f"   Store mutations: {zustand_stress.mutation_count:,}")
        if len(net_stress.latencies) > 10:
            avg_latency = np.mean(net_stress.latencies[-100:])
            print(f"   Avg last 100 req latency: {avg_latency:.2f}ms")
    
    # Cleanup
    print("\n" + "="*80)
    print("🛑 SIMULATION COMPLETE - Cleaning up...")
    mem_stress.stop()
    mem_thread.join()
    
    # Generate final report
    print("\n📊 FINAL EXTREME SIMULATION REPORT")
    print("-"*60)
    print(f"Total runtime: {SIMULATION_CONFIG['test_duration_seconds']}s")
    print(f"Peak CPU usage: {max(psutil.cpu_percent() for _ in range(10))}%")
    print(f"Peak RAM usage: {psutil.virtual_memory().percent}%")
    print(f"Total network requests: {net_stress.request_count:,}")
    print(f"Total store mutations: {zustand_stress.mutation_count:,}")
    print(f"WebSocket errors encountered: {net_stress.error_count}")
    if len(net_stress.latencies) > 0:
        print(f"Average latency across all requests: {np.mean(net_stress.latencies):.2f}ms")
        print(f"P95 latency: {np.percentile(net_stress.latencies, 95):.2f}ms")
        print(f"P99 latency: {np.percentile(net_stress.latencies, 99):.2f}ms")
    print("="*80)
    print("\n✅ STARK INTERFACE pushed to EXTREME LIMITS!")

if __name__ == "__main__":
    # Install dependencies first
    try:
        import psutil
        import numpy
        import websockets
    except ImportError:
        print("📦 Installing required stress test dependencies...")
        import subprocess
        subprocess.run(["pip", "install", "psutil", "numpy", "websockets", "requests"])
        print("✅ Dependencies installed, starting simulation...")
        time.sleep(2)
    
    asyncio.run(run_extreme_simulation())