import React from 'react';
import { Activity, Globe, Server } from 'lucide-react';
import { THRESHOLD_WARN, THRESHOLD_DANGER } from '../lib/constants';
import { Panel } from './ui/Panel';
import { PanelHeader } from './ui/PanelHeader';
import { StatusChip } from './ui/StatusChip';
import { Banner } from './ui/Banner';

function formatAge(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function TopologyPanel({ status, clusterState }) {
  const getBarColorClass = (val) => {
    if (val > THRESHOLD_DANGER) return 'bg-danger';
    if (val > THRESHOLD_WARN) return 'bg-warning';
    return 'bg-success';
  };

  const getPodBorderClass = (maxLoad) => {
    if (maxLoad > THRESHOLD_DANGER) return 'border-danger-border';
    if (maxLoad > THRESHOLD_WARN) return 'border-warning-border';
    return 'border-border';
  };

  const pods = clusterState?.pods || [];
  // Sort pods by name for consistent rendering
  const sortedPods = [...pods].sort((a, b) => a.name.localeCompare(b.name));

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
      
      <div className="flex-1 bg-bg p-6 flex flex-col items-center justify-start relative overflow-hidden overflow-y-auto">
        {/* Connection lost banner */}
        {status === 'error' && (
          <div className="absolute top-4 left-4 right-4 z-50">
            <Banner message="Connection lost to Controller API." type="danger" />
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        
        <div className={`bg-surface-raised border border-border px-6 py-3 rounded-lg flex items-center relative z-10 min-w-[220px] ${status === 'error' ? 'mt-16' : 'mt-4'}`}>
          <Globe className="w-5 h-5 text-accent mr-3" />
          <div>
            <div className="text-[13px] font-medium text-text">Service / LB</div>
            <div className="text-[10px] text-text-muted font-mono mt-0.5">Ingress / 10.0.0.1</div>
          </div>
        </div>

        {status === 'healthy' && sortedPods.length > 0 && (
          <>
            <div className="w-px h-8 bg-border relative z-0 transition-colors duration-500"></div>
            
            {/* Draw horizontal distribution line if multiple pods */}
            {sortedPods.length > 1 && (
              <div 
                className="h-px bg-border relative z-0" 
                style={{ width: `${Math.max(100, (sortedPods.length - 1) * 220)}px` }}
              ></div>
            )}
            
            {/* Draw vertical drops */}
            {sortedPods.length > 1 && (
               <div className="relative z-0 flex justify-between" style={{ width: `${Math.max(100, (sortedPods.length - 1) * 220)}px` }}>
                 {sortedPods.map((_, i) => (
                    <div key={i} className="w-px h-8 bg-border"></div>
                 ))}
               </div>
            )}
            {sortedPods.length === 1 && (
               <div className="w-px h-8 bg-border relative z-0"></div>
            )}

            <div className="flex justify-center gap-6 w-full flex-wrap relative z-10">
              {sortedPods.map((pod) => {
                const maxLoad = Math.max(pod.cpu_usage, pod.memory_usage);
                const isPending = pod.phase === 'Pending';
                const isFailed = pod.phase === 'Failed' || pod.lastTerminationReason === 'OOMKilled';
                const opacityClass = isPending ? 'opacity-60 animate-pulse' : (isFailed ? 'opacity-50' : 'opacity-100');

                return (
                  <div key={pod.name} className={`w-full max-w-[240px] bg-surface-raised border rounded-lg p-4 transition-all duration-300 ${getPodBorderClass(maxLoad)} ${opacityClass}`}>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center overflow-hidden mr-2">
                        <Server className="w-4 h-4 mr-2 text-text-muted shrink-0" />
                        <div className="font-mono text-[11px] font-medium text-text truncate" title={pod.name}>{pod.name}</div>
                      </div>
                      <StatusChip status={pod.phase === 'Running' && !pod.ready ? 'Starting' : (isFailed ? pod.lastTerminationReason || 'Failed' : pod.phase)} />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                          <span className="text-text-muted">CPU</span>
                          <span className="text-text">{pod.cpu_usage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-surface h-1 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${getBarColorClass(pod.cpu_usage)}`} style={{ width: `${Math.min(pod.cpu_usage, 100)}%` }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                          <span className="text-text-muted">RAM</span>
                          <span className="text-text">{pod.memory_usage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-surface h-1 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${getBarColorClass(pod.memory_usage)}`} style={{ width: `${Math.min(pod.memory_usage, 100)}%` }}></div>
                        </div>
                      </div>

                      <div className="flex justify-between border-t border-border pt-2 mt-2">
                         <div className="text-[9px] text-text-muted uppercase tracking-wider">Restarts: <span className="font-mono text-text">{pod.restartCount}</span></div>
                         <div className="text-[9px] text-text-muted uppercase tracking-wider">Age: <span className="font-mono text-text">{formatAge(pod.ageSeconds)}</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
