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

def add_log(msg: str):
    timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]
    server_logs.append(f"[{timestamp}] {msg}")
    if len(server_logs) > 50:
        server_logs.pop(0)

@app.on_event("startup")
async def startup_event():
    add_log("SYSTEM BOOT: FastAPI Server initialized successfully.")
    add_log(f"POD ID: {os.environ.get('HOSTNAME', 'unknown-pod-id')}")

@app.get("/")
def read_root():
    add_log("API: / requested (Live Preview ping)")
    return {"status": "ok", "message": "App is running normally!", "pod_name": os.environ.get('HOSTNAME', 'local')}

@app.get("/health")
def health_check():
    """Kubernetes liveness probe endpoint."""
    add_log("K8S: Liveness probe received. Status: 200 OK.")
    return {"status": "healthy"}

@app.get("/logs")
def get_logs():
    return {"logs": server_logs}

@app.get("/metrics")
def get_metrics():
    process = psutil.Process(os.getpid())
    mem_mb = process.memory_info().rss / (1024 * 1024)
    mem_percent = min((mem_mb / 150.0) * 100, 100.0)
    
    return {
        "cpu_usage": psutil.cpu_percent(interval=0.1) if not cpu_stress_active else 99.9,
        "memory_usage": round(mem_percent, 2),
        "memory_mb": round(mem_mb, 2),
        "limit_mb": 150
    }

async def continuous_memory_leak():
    add_log("CRITICAL: Continuous Memory Leak Thread Started.")
    global memory_hog
    while True:
        junk_data = "A" * (5 * 1024 * 1024) # 5MB chunks
        memory_hog.append(junk_data)
        process = psutil.Process(os.getpid())
        current_mem = process.memory_info().rss / (1024 * 1024)
        add_log(f"WARNING: Memory expanding. Current RAM: {current_mem:.1f}MB / 150MB Limit")
        await asyncio.sleep(1) # Leak 5MB every second until OOMKill

@app.post("/chaos/memory_continuous")
async def start_continuous_leak(background_tasks: BackgroundTasks):
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
    add_log("USER ACTION: Injecting CPU stress (10s).")
    background_tasks.add_task(cpu_intensive_task)
    return {"message": "CPU stress test started."}

@app.post("/chaos/recover")
def recover_app():
    global memory_hog
    memory_hog.clear()
    add_log("SYSTEM: Manual recovery triggered. Memory flushed.")
    return {"message": "Memory cleared!"}
