#!/bin/bash
while true; do
  echo "Starting port-forward..."
  kubectl port-forward svc/autonomous-api-service 8000:80 &
  PF_PID=$!
  
  while true; do
    sleep 3
    if ! curl -s -m 2 http://localhost:8000/health > /dev/null; then
      echo "Tunnel dead, restarting..."
      kill -9 $PF_PID 2>/dev/null
      wait $PF_PID 2>/dev/null
      break
    fi
  done
done
