import { useState, useEffect } from 'react';
import client from '../api/client';
import { POLL_INTERVAL_MS } from '../lib/constants';

export function useLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await client.get('/api/logs');
        setLogs(res.data.logs);
      } catch (err) {
        setLogs(prev => {
          const msg = "FATAL: Lost connection to controller API.";
          if (prev.length > 0 && prev[prev.length - 1].includes(msg)) return prev;
          return [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
        });
      }
    };
    
    fetchLogs();
    const interval = setInterval(fetchLogs, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return { logs };
}
