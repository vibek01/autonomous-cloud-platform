import React from 'react';
import client from '../api/client';
import { Button } from './ui/Button';

export function Header({ status }) {
  const [loadingAction, setLoadingAction] = React.useState(false);

  const injectChaos = async (type) => {
    setLoadingAction(true);
    try {
      await client.post(`/chaos/${type}`);
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  const recover = async () => {
    setLoadingAction(true);
    try {
      await client.post('/chaos/recover');
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  return (
    <header className="flex justify-between items-center h-12 border-b border-border mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-[14px] font-medium tracking-tight text-text">
          Autonomous Cloud Platform
        </h1>
        <div className="h-4 w-px bg-border"></div>
        <div className="flex items-center space-x-2 text-[11px] text-text-muted font-mono">
          <span>minikube</span>
          <span>/</span>
          <span>default</span>
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
