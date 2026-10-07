import React from 'react';
import { useMetrics } from './hooks/useMetrics';
import { useLogs } from './hooks/useLogs';
import { useCluster } from './hooks/useCluster';

import { Header } from './components/Header';
import { CpuChart } from './components/CpuChart';
import { MemoryChart } from './components/MemoryChart';
import { LivePreview } from './components/LivePreview';
import { LogPanel } from './components/LogPanel';
import { TopologyPanel } from './components/TopologyPanel';

export default function App() {
  const { clusterState, status } = useCluster();
  const { metrics, currentMetrics } = useMetrics(clusterState);
  const { logs } = useLogs();

  return (
    <div className="min-h-screen bg-bg text-text p-6 font-sans selection:bg-surface-raised">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        <Header status={status} clusterState={clusterState} />

        {/* Dashboard Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Metrics */}
          <div className="flex flex-col gap-6 h-[600px]">
            <CpuChart metrics={metrics} currentMetrics={currentMetrics} />
            <MemoryChart metrics={metrics} currentMetrics={currentMetrics} />
            <LivePreview preview={clusterState} />
          </div>

          {/* Column 2: Logs */}
          <LogPanel logs={logs} />

          {/* Column 3: Kubernetes Topology */}
          <TopologyPanel 
            status={status} 
            clusterState={clusterState}
          />

        </div>
      </div>
    </div>
  );
}
