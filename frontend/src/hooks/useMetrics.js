import { useState, useEffect } from 'react';
import { MAX_METRICS_POINTS } from '../lib/constants';

export function useMetrics(clusterState) {
  const [metricsHistory, setMetricsHistory] = useState([]);

  useEffect(() => {
    if (!clusterState || !clusterState.pods || clusterState.pods.length === 0) return;

    // For the aggregate chart, we'll track the MAXIMUM usage across all pods.
    // This is the most critical metric for OOM/CPU limits.
    const maxCpu = Math.max(...clusterState.pods.map(p => p.cpu_usage || 0));
    const maxMemUsage = Math.max(...clusterState.pods.map(p => p.memory_usage || 0));
    const maxMemMb = Math.max(...clusterState.pods.map(p => p.memory_mb || 0));
    const limitMb = clusterState.pods[0]?.limit_mb || 150;

    const newPoint = {
      time: new Date().toLocaleTimeString(),
      cpu_usage: maxCpu,
      memory_usage: maxMemUsage,
      memory_mb: maxMemMb,
      limit_mb: limitMb
    };

    setMetricsHistory(prev => {
      const updated = [...prev, newPoint];
      if (updated.length > MAX_METRICS_POINTS) {
        return updated.slice(updated.length - MAX_METRICS_POINTS);
      }
      return updated;
    });
  }, [clusterState]);

  const currentMetrics = metricsHistory.length > 0 
    ? metricsHistory[metricsHistory.length - 1] 
    : { cpu_usage: 0, memory_usage: 0, memory_mb: 0, limit_mb: 150 };

  return { metrics: metricsHistory, currentMetrics };
}
