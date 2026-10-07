# Autonomous Cloud Platform

A real-time, interactive cloud resilience visualization platform. This project demonstrates Kubernetes pod orchestration, liveness probing, and self-healing mechanisms via a sleek, modern React dashboard.

## Features

- **Chaos Engineering**: Inject CPU stress and Memory leaks directly into the backend via the UI.
- **Live Telemetry**: Real-time monitoring of container CPU and RAM allocation using Recharts.
- **Interactive Kubernetes Topology**: A dynamic, pure-React visualization of the Ingress Load Balancer and active Pods.
- **Visual OOMKill Recovery**: Watch as Kubernetes detects a memory breach, terminates the pod, and provisions a replacement in real-time.
- **Smart Terminal Logs**: Embedded log viewer that parses backend warnings and critical errors with color-coded severity.

## Architecture

- **Backend**: Python FastAPI with `psutil` for hardware metrics and artificial load generation.
- **Frontend**: React (Vite) + Tailwind CSS + Lucide React.
- **Infrastructure**: Docker & Kubernetes (Minikube).
- **Networking**: Custom bash watchdog (`resilient_tunnel.sh`) to maintain resilient `kubectl port-forward` connections during pod crashes.

## Running Locally

Please see `startup_guide.md` (or the AI Guideline) for exact commands to boot the Minikube cluster and launch the development servers.
