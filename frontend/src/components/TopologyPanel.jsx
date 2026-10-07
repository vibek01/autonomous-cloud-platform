import React from 'react';
import { Activity, Globe, Server } from 'lucide-react';
import { THRESHOLD_WARN, THRESHOLD_DANGER } from '../lib/constants';
import { Panel } from './ui/Panel';
import { PanelHeader } from './ui/PanelHeader';
import { StatusChip } from './ui/StatusChip';
import { Banner } from './ui/Banner';

export function TopologyPanel({ status, podCounter, currentMetrics }) {
  const maxLoad = Math.max(currentMetrics.cpu_usage, currentMetrics.memory_usage);
  
  let loadState = 'healthy';
  let borderColorClass = "border-border";
  if (maxLoad > THRESHOLD_WARN) {
    loadState = 'warning';
    borderColorClass = "border-warning-border";
  }
  if (maxLoad > THRESHOLD_DANGER) {
    loadState = 'danger';
    borderColorClass = "border-danger-border";
  }

  const getBarColorClass = (val) => {
    if (val > THRESHOLD_DANGER) return 'bg-danger';
    if (val > THRESHOLD_WARN) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <Panel className="h-[600px]">
      <PanelHeader 
        icon={Activity} 
        title="Cluster Topology" 
        rightContent={
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-success animate-pulse' : 'bg-danger'}`} />
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Live</span>
          </div>
        }
      />
      
      <div className="flex-1 bg-bg p-6 flex flex-col items-center justify-start relative overflow-hidden">
        {/* Connection lost banner */}
        {status === 'error' && (
          <div className="absolute top-4 left-4 right-4 z-50">
            <Banner message="Connection lost. Cluster may be replacing a crashed pod." type="danger" />
          </div>
        )}

        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        
        {/* Load Balancer */}
        <div className={`bg-surface-raised border border-border px-6 py-3 rounded-lg flex items-center relative z-10 min-w-[220px] ${status === 'error' ? 'mt-16' : 'mt-4'}`}>
          <Globe className="w-5 h-5 text-accent mr-3" />
          <div>
            <div className="text-[13px] font-medium text-text">Service / LB</div>
            <div className="text-[10px] text-text-muted font-mono mt-0.5">Ingress / 10.0.0.1</div>
          </div>
        </div>

        {/* Dynamic Connection Lines & Pods */}
        {status === 'healthy' ? (
          <>
            <div className={`w-px h-16 bg-border relative z-0 transition-colors duration-500`}></div>
            
            {/* Active Pod */}
            <div className={`w-full max-w-[280px] bg-surface-raised border rounded-lg p-4 transition-all duration-300 relative z-10 ${borderColorClass}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Server className="w-4 h-4 mr-2 text-text-muted" />
                  <div className="font-mono text-[12px] font-medium text-text truncate">app-pod-{podCounter}</div>
                </div>
                <StatusChip status="Running" />
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                    <span className="text-text-muted">CPU</span>
                    <span className="text-text">{currentMetrics.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-surface h-1 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${getBarColorClass(currentMetrics.cpu_usage)}`} style={{ width: `${Math.min(currentMetrics.cpu_usage, 100)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                    <span className="text-text-muted">RAM</span>
                    <span className="text-text">{currentMetrics.memory_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-surface h-1 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${getBarColorClass(currentMetrics.memory_usage)}`} style={{ width: `${Math.min(currentMetrics.memory_usage, 100)}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between border-t border-border pt-2 mt-2">
                   <div className="text-[9px] text-text-muted uppercase tracking-wider">Restarts: <span className="font-mono text-text">0</span></div>
                   <div className="text-[9px] text-text-muted uppercase tracking-wider">Age: <span className="font-mono text-text">1m</span></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Crash State Routing */}
            <div className="w-px h-8 bg-border relative z-0"></div>
            <div className="w-[200px] h-px bg-border relative z-0 flex justify-between">
              <div className="w-px h-8 bg-danger-border absolute left-0 top-0"></div>
              <div className="absolute right-0 top-0 h-8 overflow-hidden flex flex-col w-px">
                 <div className="w-full h-[200%] bg-[linear-gradient(to_bottom,var(--color-accent)_50%,transparent_50%)] bg-[length:1px_6px] animate-[slide_1s_linear_infinite]"></div>
              </div>
            </div>

            <div className="flex gap-4 w-full px-4 mt-8 relative z-10 max-w-[400px]">
              {/* Dead Pod */}
              <div className="flex-1 bg-surface-raised border border-danger-border rounded-lg p-3 opacity-60">
                <div className="flex items-center text-danger mb-2">
                  <Server className="w-3.5 h-3.5 mr-1.5" />
                  <span className="font-mono text-[11px] truncate">app-pod-{podCounter}</span>
                </div>
                <StatusChip status="OOMKilled" className="block text-center mt-2" />
              </div>

              {/* Pending Pod */}
              <div className="flex-1 bg-surface-raised border border-dashed border-accent-border rounded-lg p-3">
                <div className="flex items-center text-accent mb-2">
                  <Server className="w-3.5 h-3.5 mr-1.5" />
                  <span className="font-mono text-[11px] truncate">app-pod-{podCounter + 1}</span>
                </div>
                <StatusChip status="Pending" className="block text-center mt-2 animate-pulse" />
              </div>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
