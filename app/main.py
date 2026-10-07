from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import psutil
import time
import os
import math
import asyncio
from datetime import datetime

app = FastAPI(title="Autonomous Cloud App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global states
memory_hog = []
cpu_stress_active = False
server_logs = []
CHAOS_ENABLED = os.environ.get('CHAOS_ENABLED', 'true').lower() == 'true'

def add_log(msg: str):
    timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]
    # In a real app we'd just use a logger, but we need these in memory for the /logs endpoint
    # The controller aggregates these and prepends the pod name
    server_logs.append(f"[{timestamp}] {msg}")
    if len(server_logs) > 50:
        server_logs.pop(0)

def get_cgroup_memory_limit():
    try:
        # cgroup v2
        with open("/sys/fs/cgroup/memory.max", "r") as f:
            val = f.read().strip()
            if val != "max": return int(val)
    except FileNotFoundError:
        pass
    try:
        # cgroup v1
        with open("/sys/fs/cgroup/memory/memory.limit_in_bytes", "r") as f:
            val = f.read().strip()
            # extremely large values mean no limit
            limit = int(val)
            if limit < 1024**4: return limit
    except FileNotFoundError:
        pass
    return 150 * 1024 * 1024 # Fallback to 150MB

def get_cgroup_memory_current():
    try:
        # cgroup v2
        with open("/sys/fs/cgroup/memory.current", "r") as f:
            return int(f.read().strip())
    except FileNotFoundError:
        pass
    try:
        # cgroup v1
        with open("/sys/fs/cgroup/memory/memory.usage_in_bytes", "r") as f:
            return int(f.read().strip())
    except FileNotFoundError:
        pass
    process = psutil.Process(os.getpid())
    return process.memory_info().rss

@app.on_event("startup")
async def startup_event():
    add_log("SYSTEM BOOT: FastAPI Server initialized successfully.")
    add_log(f"POD ID: {os.environ.get('HOSTNAME', 'unknown-pod-id')}")

@app.get("/")
def read_root():
    # We no longer log every / ping to avoid spamming the controller scraper
    return {"status": "ok", "message": "App is running normally!", "pod_name": os.environ.get('HOSTNAME', 'local')}

@app.get("/health")
def health_check():
    """Kubernetes liveness probe endpoint."""
    return {"status": "healthy"}

@app.get("/ready")
def readiness_check():
    """Kubernetes readiness probe endpoint."""
    return {"status": "ready"}

@app.get("/logs")
def get_logs():
    return {"logs": server_logs}

@app.get("/metrics")
def get_metrics():
    mem_limit_bytes = get_cgroup_memory_limit()
    mem_current_bytes = get_cgroup_memory_current()
    
    mem_mb = mem_current_bytes / (1024 * 1024)
    limit_mb = mem_limit_bytes / (1024 * 1024)
    mem_percent = min((mem_mb / limit_mb) * 100, 100.0) if limit_mb > 0 else 0
    
    return {
        "cpu_usage": psutil.cpu_percent(interval=0.1) if not cpu_stress_active else 99.9,
        "memory_usage": round(mem_percent, 2),
        "memory_mb": round(mem_mb, 2),
        "limit_mb": round(limit_mb, 2)
    }

async def continuous_memory_leak():
    add_log("CRITICAL: Continuous Memory Leak Thread Started.")
    global memory_hog
    limit_mb = get_cgroup_memory_limit() / (1024 * 1024)
    while True:
        junk_data = "A" * (5 * 1024 * 1024) # 5MB chunks
        memory_hog.append(junk_data)
        
        current_mem = get_cgroup_memory_current() / (1024 * 1024)
        add_log(f"WARNING: Memory expanding. Current RAM: {current_mem:.1f}MB / {limit_mb:.1f}MB Limit")
        await asyncio.sleep(1) # Leak 5MB every second until OOMKill

@app.post("/chaos/memory_continuous")
async def start_continuous_leak(background_tasks: BackgroundTasks):
    if not CHAOS_ENABLED:
        raise HTTPException(status_code=403, detail="Chaos endpoints are disabled")
    add_log("USER ACTION: Injecting continuous memory leak.")
    background_tasks.add_task(continuous_memory_leak)
    return {"message": "Continuous leak started."}

def cpu_intensive_task():
    global cpu_stress_active
    cpu_stress_active = True
    add_log("CRITICAL: CPU Stress Thread Started. Maxing out CPU cores.")
    end_time = time.time() + 10
    while time.time() < end_time:
        math.factorial(500)
    cpu_stress_active = False
    add_log("INFO: CPU Stress Thread Finished.")

@app.post("/chaos/cpu")
def inject_cpu_stress(background_tasks: BackgroundTasks):
    if not CHAOS_ENABLED:
        raise HTTPException(status_code=403, detail="Chaos endpoints are disabled")
    add_log("USER ACTION: Injecting CPU stress (10s).")
    background_tasks.add_task(cpu_intensive_task)
    return {"message": "CPU stress test started."}

@app.post("/chaos/recover")
def recover_app():
    if not CHAOS_ENABLED:
        raise HTTPException(status_code=403, detail="Chaos endpoints are disabled")
    global memory_hog
    memory_hog.clear()
    add_log("SYSTEM: Manual recovery triggered. Memory flushed.")
    return {"message": "Memory cleared!"}
