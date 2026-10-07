import { useState, useEffect } from 'react';
import client from '../api/client';
import { MAX_METRICS_POINTS, POLL_INTERVAL_MS } from '../lib/constants';

export function useMetrics() {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await client.get('/metrics');
        setMetrics(prev => {
          const newMetrics = [...prev, { time: new Date().toLocaleTimeString(), ...res.data }];
          if (newMetrics.length > MAX_METRICS_POINTS) return newMetrics.slice(newMetrics.length - MAX_METRICS_POINTS);
          return newMetrics;
        });
      } catch (err) {
        // Silently fail or handled by useCluster hook in App
      }
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const currentMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : { cpu_usage: 0, memory_usage: 0, memory_mb: 0, limit_mb: 150 };

  return { metrics, currentMetrics };
}
