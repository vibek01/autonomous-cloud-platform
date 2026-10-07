#!/bin/bash
echo "🛑 Tearing down Autonomous Cloud Platform Dev Environment..."

# Delete Kubernetes resources
echo "☸️ Deleting Kubernetes resources..."
kubectl delete -f k8s/ --ignore-not-found=true

# Stop any dangling Vite servers on port 5173
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "🔌 Killing Vite dev server..."
    kill -9 $(lsof -Pi :5173 -sTCP:LISTEN -t)
fi

echo "✅ Teardown complete."
