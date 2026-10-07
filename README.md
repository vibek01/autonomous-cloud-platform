# Autonomous Cloud Platform

A real-time dashboard and control plane that demonstrates Kubernetes self-healing and chaos engineering, upgraded with AI-driven predictive capabilities. 

Built for a 4th-year CSE final-year project.

## Architecture

1. **Frontend:** React + Vite, styled with modern Tailwind CSS v4 design tokens.
2. **App (Backend):** FastAPI python service that reports its own resource usage and allows injecting memory/CPU chaos.
3. **Controller:** FastAPI python service running inside Kubernetes that aggregates cluster state, scrapes pod metrics, and orchestrates predictive healing and anomaly detection.

## Prerequisites

- Docker Desktop or Minikube
- `kubectl`
- Node.js 18+ (for frontend development)

## How to Run

### Option 1: Automated Dev Environment (Recommended)

Run the automated startup script. This will start Minikube (if not running), build the Docker images locally, apply Kubernetes manifests, wait for deployment, and start the frontend dashboard.

```bash
# On Linux/macOS or Git Bash (Windows)
./scripts/dev-up.sh
```

To tear down the environment:

```bash
./scripts/dev-down.sh
```

### Option 2: Manual Setup

If you prefer to run the steps manually:

1. **Start Minikube and point Docker env:**
   ```bash
   minikube start
   eval $(minikube docker-env)
   ```

2. **Build images:**
   ```bash
   docker build -t autonomous-api:latest ./app
   docker build -t autonomous-controller:latest ./controller
   ```

3. **Deploy to Kubernetes:**
   ```bash
   kubectl apply -f k8s/
   ```

4. **Start Frontend:**
   ```bash
   # Get the controller URL
   minikube service autonomous-controller-service --url
   
   # Set the environment variable and start Vite
   export VITE_CONTROLLER_URL=<url-from-above>
   cd frontend
   npm install
   npm run dev
   ```

## Demo Guide for Presentation

This platform allows you to demonstrate three distinct stages of cloud maturity:

### 1. Reactive Mode (Kubernetes Native)
1. Select **Reactive** strategy in the dashboard.
2. Inject a **Spike Leak** or **Step Leak**.
3. *Observation:* You will see memory usage rise until it hits 150MB. Kubernetes will forcefully `OOMKill` the pod. The platform experiences downtime until the pod restarts.

### 2. Threshold Mode (Heuristic Healing)
1. Select **Threshold** strategy.
2. Inject a **Slow Leak**.
3. *Observation:* When memory crosses 75%, the controller provisions a replacement pod *before* the original crashes, reroutes traffic, and deletes the leaking pod. Zero downtime.

### 3. Predictive Mode (AI-Driven)
1. Select **Predictive** strategy.
2. Check the **AI Reasoning** tab in the Intelligence Panel.
3. Inject a **Slow Leak**.
4. *Observation:* The linear regression model detects the leak early, predicting the OOMKill. The Isolation Forest model confirms the anomaly. The system preemptively heals the cluster long before the 75% threshold is reached.

## Notes on Compatibility
- The frontend proxy is configured to forward `/api` to the controller.
- Windows users using WSL/Git Bash may need to run `minikube tunnel` if NodePort services are unreachable.
