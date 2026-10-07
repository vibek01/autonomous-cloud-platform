import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

from .k8s_client import k8s_client
from .scraper import scraper
from .events import event_log

app = FastAPI(title="Autonomous Cloud Controller")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await scraper.start()
    event_log.add_event("Controller started and scraper initialized", level="INFO")

@app.on_event("shutdown")
async def shutdown_event():
    await scraper.stop()

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/cluster")
def get_cluster_state():
    state = k8s_client.get_deployment_state()
    pods = k8s_client.get_pods()
    
    pod_details = []
    for pod in pods:
        name = pod.metadata.name
        metrics = scraper.pod_metrics.get(name, {})
        
        # Get restart count and termination reason
        restart_count = 0
        last_reason = None
        if pod.status.container_statuses:
            status = pod.status.container_statuses[0]
            restart_count = status.restart_count
            if status.last_state and status.last_state.terminated:
                last_reason = status.last_state.terminated.reason

        # Calculate age
        age_seconds = 0
        if pod.status.start_time:
            # start_time is datetime with tzinfo
            delta = datetime.now(pod.status.start_time.tzinfo) - pod.status.start_time
            age_seconds = int(delta.total_seconds())

        pod_details.append({
            "name": name,
            "phase": pod.status.phase,
            "ready": any(cond.type == "Ready" and cond.status == "True" for cond in (pod.status.conditions or [])),
            "restartCount": restart_count,
            "lastTerminationReason": last_reason,
            "ageSeconds": age_seconds,
            "cpu_usage": metrics.get("cpu_usage", 0),
            "memory_usage": metrics.get("memory_usage", 0),
            "memory_mb": metrics.get("memory_mb", 0),
            "limit_mb": metrics.get("limit_mb", 150)
        })

    return {
        "deployment": state,
        "pods": pod_details
    }

class ScaleRequest(BaseModel):
    replicas: int

@app.post("/api/scale")
def scale_deployment(req: ScaleRequest):
    if req.replicas < 1 or req.replicas > 5:
        raise HTTPException(status_code=400, detail="Replicas must be between 1 and 5")
    
    success = k8s_client.scale_deployment(req.replicas)
    if success:
        event_log.add_event(f"Manual scale requested: {req.replicas} replicas", level="INFO")
        return {"status": "success", "replicas": req.replicas}
    raise HTTPException(status_code=500, detail="Failed to scale deployment")

@app.get("/api/logs")
def get_merged_logs():
    pods = k8s_client.get_pods()
    all_logs = []
    
    for pod in pods:
        name = pod.metadata.name
        # Current logs
        logs = k8s_client.get_pod_logs(name)
        if logs:
            for line in logs.splitlines():
                if line.strip():
                    all_logs.append(f"[{name}] {line}")
        
        # Check if we should get previous logs (e.g., just OOMKilled)
        if pod.status.container_statuses and pod.status.container_statuses[0].restart_count > 0:
            prev_logs = k8s_client.get_pod_logs(name, previous=True)
            if prev_logs:
                for line in prev_logs.splitlines():
                    if line.strip():
                        all_logs.append(f"[{name}] (previous) {line}")
                        
    # This is a simple merge. We rely on the timestamp in the log string to sort if needed.
    # In main.py the logs look like "[HH:MM:SS.mmm] MSG"
    # So we sort by the string after the pod tag.
    all_logs.sort(key=lambda x: x.split("] ", 1)[-1] if "] " in x else x)
    
    # Return last 50
    return {"logs": all_logs[-50:]}

@app.get("/api/events")
def get_events():
    return {"events": event_log.get_events()}
