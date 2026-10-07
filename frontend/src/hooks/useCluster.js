import { useState, useEffect } from 'react';
import client from '../api/client';
import { POLL_INTERVAL_MS } from '../lib/constants';

export function useCluster() {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('healthy');
  const [podCounter, setPodCounter] = useState(1);
  const [wasError, setWasError] = useState(false);

  useEffect(() => {
    const fetchCluster = async () => {
      try {
        const res = await client.get('/');
        setStatus('healthy');
        setPreview(res.data);
      } catch (err) {
        setStatus('error');
        setPreview({ error: "CONNECTION REFUSED" });
      }
    };
    
    fetchCluster();
    const interval = setInterval(fetchCluster, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === 'error') {
       setWasError(true);
    } else if (status === 'healthy' && wasError) {
       setWasError(false);
       setPodCounter(prev => prev + 1);
    }
  }, [status, wasError]);

  return { preview, status, podCounter };
}
