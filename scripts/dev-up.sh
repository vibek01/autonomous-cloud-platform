#!/bin/bash
set -e

echo "🚀 Starting Autonomous Cloud Platform Dev Environment..."

# 1. Start minikube if not running
if ! minikube status > /dev/null 2>&1; then
    echo "📦 Starting Minikube..."
    minikube start
fi

# 2. Point to minikube docker-env
echo "🐳 Configuring Docker env..."
eval $(minikube docker-env)

# 3. Build images
echo "🔨 Building app image..."
docker build -t autonomous-api:latest ./app
echo "🔨 Building controller image..."
docker build -t autonomous-controller:latest ./controller

# 4. Apply K8s manifests
echo "☸️ Applying Kubernetes manifests..."
kubectl apply -f k8s/

# 5. Wait for rollout
echo "⏳ Waiting for deployments to roll out..."
kubectl rollout status deployment/autonomous-api-deployment
kubectl rollout status deployment/autonomous-controller

# 6. Expose services and get URLs
echo "🌐 Getting service URLs..."
if [ "$OS" = "Windows_NT" ] || uname -a | grep -i microsoft > /dev/null; then
    echo "⚠️ Detected Windows / WSL. You might need to run 'minikube tunnel' in a separate admin window if services are unreachable."
fi

APP_URL=$(minikube service autonomous-api-service --url | head -n 1)
CONTROLLER_URL=$(minikube service autonomous-controller-service --url | head -n 1)

echo "✅ App Service URL: $APP_URL"
echo "✅ Controller Service URL: $CONTROLLER_URL"

# 7. Start Vite
echo "🚀 Starting Frontend..."
export VITE_CONTROLLER_URL=$CONTROLLER_URL
cd frontend
npm run dev
