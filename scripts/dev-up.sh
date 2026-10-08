#!/bin/bash
set -e

echo "🚀 Starting Autonomous Cloud Platform Dev Environment..."

# 1. Start minikube if not running
if ! minikube status > /dev/null 2>&1; then
    echo "📦 Starting Minikube..."
    minikube start
fi

# 2. Build images natively inside minikube (avoids buildkit errors)
echo "🔨 Building app image..."
minikube image build -t autonomous-api:latest ./app
echo "🔨 Building controller image..."
minikube image build -t autonomous-controller:latest ./controller

# 4. Apply K8s manifests
echo "☸️ Applying Kubernetes manifests..."
kubectl apply -f k8s/

# 5. Wait for rollout
echo "⏳ Waiting for deployments to roll out..."
kubectl rollout status deployment/autonomous-api-deployment
kubectl rollout status deployment/autonomous-controller

# 6. Start Port Forwards
echo "🌐 Starting port-forward tunnels..."
# Kill any existing port-forwards
pkill -f "kubectl port-forward" || true

kubectl port-forward svc/autonomous-api-service 8000:80 > /dev/null 2>&1 &
kubectl port-forward svc/autonomous-controller-service 8001:80 > /dev/null 2>&1 &

CONTROLLER_URL="http://localhost:8001"
echo "✅ App Service URL: http://localhost:8000"
echo "✅ Controller Service URL: $CONTROLLER_URL"

# 7. Start Vite
echo "🚀 Starting Frontend..."
export VITE_CONTROLLER_URL=$CONTROLLER_URL
cd frontend
npm run dev
