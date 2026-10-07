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
  const { metrics, currentMetrics } = useMetrics();
  const { logs } = useLogs();
  const { preview, status, podCounter } = useCluster();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6 font-sans selection:bg-zinc-800">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        <Header status={status} />

        {/* Dashboard Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Metrics */}
          <div className="flex flex-col gap-6 h-[600px]">
            <CpuChart metrics={metrics} currentMetrics={currentMetrics} />
            <MemoryChart metrics={metrics} currentMetrics={currentMetrics} />
            <LivePreview preview={preview} />
          </div>

          {/* Column 2: Logs */}
          <LogPanel logs={logs} />

          {/* Column 3: Kubernetes Topology */}
          <TopologyPanel 
            status={status} 
            podCounter={podCounter} 
            currentMetrics={currentMetrics} 
          />

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          from { transform: translateY(-50%); }
          to { transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
