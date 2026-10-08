import React from 'react';
import client from '../api/client';
import { Button } from './ui/Button';
import { Slider } from './ui/Slider';
import { SegmentedControl } from './ui/SegmentedControl';

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
        <div className="flex flex-col items-end mr-4 border-r border-border pr-4">
          <span className="text-[10px] text-text-muted uppercase tracking-wider mb-1 font-medium">Strategy</span>
          <SegmentedControl 
            options={[
              { label: 'Predictive (AI)', value: 'predictive' },
            ]}
            value={clusterState?.strategy || 'reactive'}
            onChange={async (val) => {
              try {
                await client.post('/api/strategy', { strategy: val });
              } catch (e) {
                console.error("Strategy change failed", e);
              }
            }}
          />
        </div>

        <Button 
          onClick={() => injectChaos('cpu')} 
          disabled={loadingAction || status === 'error'}
          disabledReason="Cluster unavailable"
        >
          Spike CPU
        </Button>
        <div className="relative">
          <select 
            className="appearance-none bg-surface-raised border border-border text-text text-xs font-medium rounded-md px-4 py-1.5 pr-8 focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-raised hover:border-border-strong transition-all cursor-pointer"
            disabled={loadingAction || status === 'error'}
            onChange={(e) => {
              if (e.target.value) {
                injectChaos(e.target.value);
                e.target.value = ''; // reset
              }
            }}
            value=""
          >
            <option value="" disabled>Leak Memory...</option>
            <option value="memory_continuous">Slow Leak (Linear)</option>
            <option value="memory_step">Step Leak</option>
            <option value="memory_spike">Spike Leak</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
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
