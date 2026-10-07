# AI Project Guideline

## 1. What Has Been Done
- **Backend Setup**: Built a FastAPI python server that exposes `/metrics` for hardware stats, `/logs` for tailing events, and `/chaos/*` endpoints to inject CPU stress and continuous Memory leaks.
- **Docker & K8s**: Containerized the backend and deployed it to Minikube. Set strict `resources.limits.memory` to `150Mi` in the deployment to force OOMKills.
- **Resilient Tunnel**: Created a bash script (`resilient_tunnel.sh`) that acts as a watchdog, automatically restarting the `kubectl port-forward` when the Kubernetes pod gets killed and replaced.
- **Frontend Core**: Built a React (Vite) application using Tailwind CSS.
- **UI/UX Polish**: 
  - Designed a 3-column professional layout (Metrics, Logs, Topology).
  - Implemented real-time AreaCharts for CPU and RAM.
  - Built a custom CSS `flex-col-reverse` log viewer that anchors to the bottom flawlessly.
  - Built an animated Kubernetes Topology Map that changes colors based on pod stress (Green/Amber/Red) and animates the Load Balancer failing over to a new pod during a crash.

## 2. What We Are Currently Doing
- Finalizing the repository structure and uploading the codebase to GitHub for version control and portfolio showcase.
- Ensuring all sensitive or bulky files (`node_modules`, `venv`, `.env`) are ignored via `.gitignore`.

## 3. Next Steps (To-Do)
- **Predictive AI Auto-Healer**: Implement a system that actively monitors the telemetry. If it detects a memory leak trajectory that will breach the 150MB limit, it should proactively scale the deployment to 2 replicas *before* the crash happens, ensuring 0 seconds of downtime.
- **Manual Scaling Controls**: Add a slider to the UI to allow manual scaling of the Kubernetes cluster (e.g., scale from 1 to 5 replicas instantly).
- **Refactoring**: Move the inline SVGs and complex React components into their own modular files for cleaner code.
