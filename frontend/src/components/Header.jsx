import React from 'react';
import client from '../api/client';
import { Button } from './ui/Button';
import { Slider } from './ui/Slider';

export function Header({ status, clusterState }) {
  const [loadingAction, setLoadingAction] = React.useState(false);
  const [localReplicas, setLocalReplicas] = React.useState(1);
  const debounceTimer = React.useRef(null);

  React.useEffect(() => {
    if (clusterState?.deployment?.desired) {
      setLocalReplicas(clusterState.deployment.desired);
    }
  }, [clusterState?.deployment?.desired]);

  const injectChaos = async (type) => {
    setLoadingAction(true);
    try {
      await client.post(`/api/chaos/${type}`); // We'll need the controller to proxy this or frontend to talk direct. Wait, controller needs to proxy chaos endpoints since we want to target pods or global.
      // Actually, we can just proxy /chaos to the app via vite proxy, but vite proxy only has /api pointing to controller.
      // We will proxy /chaos through controller in Phase 3.
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  const recover = async () => {
    setLoadingAction(true);
    try {
      await client.post('/api/chaos/recover');
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  const handleScaleChange = (val) => {
    setLocalReplicas(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        await client.post('/api/scale', { replicas: val });
      } catch (e) {
        console.error("Scale failed", e);
      }
    }, 500);
  };

  const ready = clusterState?.deployment?.ready || 0;
  const desired = clusterState?.deployment?.desired || 1;

  return (
    <header className="flex justify-between items-center h-16 border-b border-border mb-6">
      <div className="flex items-center space-x-6">
        <div>
          <h1 className="text-[14px] font-medium tracking-tight text-text">
            Autonomous Cloud Platform
          </h1>
          <div className="flex items-center space-x-2 text-[10px] text-text-muted font-mono mt-1">
            <span>minikube</span>
            <span>/</span>
            <span>default</span>
            <span>/</span>
            <span className="text-accent">{desired} Replicas</span>
          </div>
        </div>
        
        <div className="h-8 w-px bg-border"></div>
        
        <div className="w-48">
          <Slider 
            label="Replicas" 
            min={1} max={5} 
            value={localReplicas} 
            onChange={handleScaleChange}
            disabled={status === 'error'}
            readout={`${ready}/${desired} Ready`}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => injectChaos('cpu')} 
          disabled={loadingAction || status === 'error'}
          disabledReason="Cluster unavailable"
        >
          Spike CPU
        </Button>
        <Button 
          onClick={() => injectChaos('memory_continuous')} 
          disabled={loadingAction || status === 'error'}
          disabledReason="Cluster unavailable"
        >
          Leak Memory
        </Button>
        <div className="h-4 w-px bg-border mx-2"></div>
        <Button 
          onClick={recover} 
          disabled={loadingAction || status === 'error'}
          variant="primary"
          disabledReason="Cluster unavailable"
        >
          Recover
        </Button>
      </div>
    </header>
  );
}
