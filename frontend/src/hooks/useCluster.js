import { useState, useEffect } from 'react';
import client from '../api/client';
import { POLL_INTERVAL_MS } from '../lib/constants';

export function useCluster() {
  const [clusterState, setClusterState] = useState({ deployment: {}, pods: [] });
  const [status, setStatus] = useState('healthy');

  useEffect(() => {
    const fetchCluster = async () => {
      try {
        const res = await client.get('/api/cluster');
        setStatus('healthy');
        setClusterState(res.data);
      } catch (err) {
        setStatus('error');
        setClusterState({ deployment: {}, pods: [] });
      }
    };
    
    fetchCluster();
    const interval = setInterval(fetchCluster, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return { clusterState, status };
}
