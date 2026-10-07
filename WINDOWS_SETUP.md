# 🚀 Complete Windows Setup Guide
*How to run the Autonomous Cloud Platform from scratch on a Windows machine.*

This project runs a Python backend inside a local Kubernetes cluster, managed by Docker, with a React frontend. To run this on Windows, you need to follow these exact steps carefully.

---

## 🛠️ Phase 1: Prerequisites
Before cloning the code, you **must** install these 4 tools on your Windows PC:

1. **Docker Desktop:** This provides the core Linux engine.
   - Download & Install from: [docker.com](https://www.docker.com/products/docker-desktop/)
   - **Crucial:** Open Docker Desktop after installing and make sure the engine is "Running" (green icon in bottom left).
2. **Minikube & Kubectl:** The local Kubernetes cluster manager.
   - Open **PowerShell as Administrator** and run:
     ```powershell
     winget install minikube
     winget install Kubernetes.kubectl
     ```
3. **Node.js:** Needed to run the React Dashboard.
   - Download & Install the LTS version from: [nodejs.org](https://nodejs.org/)
4. **Git Bash:** Because the `resilient_tunnel.sh` script is a Linux bash script, you **must** run terminal commands using Git Bash, *not* PowerShell or Command Prompt.
   - Download & Install from: [gitforwindows.org](https://gitforwindows.org/)

---

## 🏗️ Phase 2: Building the Infrastructure
Open **Git Bash** (search for it in your Windows Start Menu) and run these commands step-by-step.

### 1. Clone the repository
```bash
git clone https://github.com/vibek01/autonomous-cloud-platform.git
cd autonomous-cloud-platform
```

### 2. Start your Kubernetes Cluster
*(Ensure Docker Desktop is open and running in the background before doing this!)*
```bash
minikube start
```

### 3. Point your terminal to Minikube's Docker Engine
Because Kubernetes needs to find the Docker image locally, you must point your terminal to Minikube's internal Docker before building. **Run this exactly as written in Git Bash:**
```bash
eval $(minikube docker-env)
```

### 4. Build the Backend Image
Now, we package the Python code into a Docker container.
```bash
docker build -t autonomous-api:latest ./app
```

### 5. Deploy to Kubernetes
This tells Kubernetes to read the YAML file, grab the image you just built, and spin up the backend pods with strict 150MB RAM limits.
```bash
kubectl apply -f k8s/deployment.yaml
```

---

## 🚀 Phase 3: Launching the App
You will now need **TWO separate Git Bash windows**.

### Window 1: The Resilient Network Tunnel
Kubernetes runs in an isolated virtual network. This script bridges your Windows machine to the cluster, and automatically reconnects if a pod crashes.
In your first Git Bash window, run:
```bash
# Make sure you are in the root 'autonomous-cloud-platform' folder
./resilient_tunnel.sh
```
*(Leave this window open and running! Do not close it.)*

### Window 2: The React Dashboard
Open a **brand new Git Bash window**, navigate to the project folder, install the Node packages, and start the frontend server.
```bash
cd /path/to/autonomous-cloud-platform/frontend
npm install
npm run dev
```

### 🌐 View the App
Open your web browser (Chrome, Edge, etc.) and go to:
[http://localhost:5173](http://localhost:5173)

---

## 🧠 What happens when you click "Leak Memory"?
1. The React app sends a signal to the Python API.
2. Python starts generating junk data in memory.
3. Once the memory crosses **150MB**, the Kubernetes orchestrator detects the hardware breach and instantly triggers an **OOMKill** (Out-of-Memory Kill), killing the container.
4. The dashboard's topology map will show the pod crash.
5. Kubernetes automatically creates a new pod to replace the dead one.
6. The `resilient_tunnel.sh` script detects the new pod and automatically reconnects the networking.
7. The system recovers!
