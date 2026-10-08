# Autonomous Cloud Platform

A real-time dashboard and control plane that demonstrates AI-driven Kubernetes self-healing and chaos engineering. Built for a 4th-year CSE final-year project.

## Architecture

1. **Frontend:** React + Vite, styled with modern Tailwind CSS v4 design tokens.
2. **App (Backend):** FastAPI python service that reports its own resource usage and allows injecting memory/CPU chaos.
3. **Controller:** FastAPI python service running inside Kubernetes that aggregates cluster state, scrapes pod metrics, and orchestrates predictive healing and anomaly detection using Machine Learning.

## Core Capabilities

- **Predictive Auto-Healing (Memory):** Uses a Linear Regression ML model to predict when a pod will experience an Out-of-Memory (OOM) crash due to a memory leak.
- **Anomaly Detection (CPU):** Uses an Isolation Forest ML model to instantly identify irregular compute usage patterns like infinite loops or CPU spikes.
- **Zero-Downtime Failover:** Automatically scales up a healthy replacement pod, waits for it to become ready, and cleanly destroys the degraded pod before users experience any downtime or dropped requests.
- **AI Reasoning Dashboard:** Exposes the raw ML decision-making logs in real-time on the frontend UI.

## Prerequisites

- Docker Desktop or Minikube
- `kubectl`
- Node.js 18+ (for frontend development)

## How to Run

### Automated Dev Environment (Recommended)

Run the automated startup script. This will start Minikube (if not running), build the Docker images locally, apply Kubernetes manifests, wait for deployment, establish tunnels, and start the frontend dashboard.

```bash
# On Linux/macOS or Git Bash (Windows)
./scripts/dev-up.sh
```

To tear down the environment:

```bash
./scripts/dev-down.sh
```

## Demo Guide for Presentation

This platform allows you to demonstrate intelligent cloud infrastructure maturity.

### 1. Memory Leak Healing
1. Check the **AI Reasoning** tab in the Intelligence Panel to see the AI evaluating normal pod patterns.
2. Inject a **Slow Leak (Linear)** using the dashboard controls.
3. *Observation:* The linear regression model detects the leak trajectory. The AI accurately predicts the ETA until the pod crashes (150MB limit). At exactly 60% memory capacity, the AI preemptively provisions a replacement pod, reroutes traffic, and deletes the leaking pod—ensuring zero downtime.

### 2. CPU Spike Healing
1. Inject a **Spike CPU** payload from the dashboard controls.
2. *Observation:* The Isolation Forest model instantly detects that the compute resource pattern is anomalous (Score < 0). The AI flags a suspected CPU Spike or Deadlock and immediately triggers the zero-downtime failover process.
