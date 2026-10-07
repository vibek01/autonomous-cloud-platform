import React from 'react';
import { Activity, Globe, Server } from 'lucide-react';
import { THRESHOLD_WARN, THRESHOLD_DANGER } from '../lib/constants';

export function TopologyPanel({ status, podCounter, currentMetrics }) {
  // Calculate dynamic pod colors
  const maxLoad = Math.max(currentMetrics.cpu_usage, currentMetrics.memory_usage);
  let loadColorClass = "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  let loadGlowClass = "shadow-[0_0_20px_rgba(16,185,129,0.05)]";
  let badgeColor = "bg-emerald-500/20 text-emerald-400";
  let lineColor = "bg-emerald-500/40";
  
  if (maxLoad > THRESHOLD_WARN) {
    loadColorClass = "border-amber-500/40 bg-amber-500/10 text-amber-400";
    loadGlowClass = "shadow-[0_0_20px_rgba(245,158,11,0.08)]";
    badgeColor = "bg-amber-500/20 text-amber-400";
    lineColor = "bg-amber-500/40";
  }
  if (maxLoad > THRESHOLD_DANGER) {
    loadColorClass = "border-red-500/50 bg-red-500/10 text-red-400";
    loadGlowClass = "shadow-[0_0_25px_rgba(239,68,68,0.15)]";
    badgeColor = "bg-red-500/20 text-red-400";
    lineColor = "bg-red-500/50";
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col h-[600px] overflow-hidden relative">
      <div className="border-b border-zinc-800 px-4 py-3 flex justify-between items-center bg-zinc-900/80 shrink-0 relative z-20">
        <div className="flex items-center">
          <Activity className="w-4 h-4 text-zinc-500 mr-2" />
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Cluster Topology</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] text-zinc-500 uppercase">Live</span>
        </div>
      </div>
      
      <div className="flex-1 bg-[#09090b] p-6 flex flex-col items-center justify-start relative overflow-hidden">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
        
        {/* Load Balancer */}
        <div className="bg-zinc-800/80 border border-zinc-700/80 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center shadow-lg relative z-10 min-w-[220px]">
          <Globe className="w-6 h-6 text-blue-400 mr-4" />
          <div>
            <div className="text-sm font-semibold text-zinc-200">Load Balancer</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Ingress / 10.0.0.1</div>
          </div>
        </div>

        {/* Dynamic Connection Lines & Pods */}
        {status === 'healthy' ? (
          <>
            {/* Healthy / Stressed single line */}
            <div className={`w-[2px] h-16 ${lineColor} relative z-0 transition-colors duration-500`}></div>
            
            {/* Active Pod */}
            <div className={`w-full max-w-[260px] border backdrop-blur-sm rounded-xl p-5 transition-all duration-700 relative z-10 ${loadColorClass} ${loadGlowClass}`}>
              <div className="flex justify-between items-center mb-4 border-b border-current pb-3 opacity-80">
                <div className="flex items-center">
                  <Server className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-semibold text-sm">app-pod-{podCounter}</div>
                    <div className="text-[9px] opacity-70 uppercase tracking-widest mt-0.5">Active Replica</div>
                  </div>
                </div>
                <span className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded font-semibold ${badgeColor}`}>
                  Running
                </span>
              </div>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="opacity-70">CPU Load</span>
                  <span className="font-semibold">{currentMetrics.cpu_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-current opacity-80 transition-all duration-1000" style={{ width: `${Math.min(currentMetrics.cpu_usage, 100)}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="opacity-70">RAM Alloc</span>
                  <span className="font-semibold">{currentMetrics.memory_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-current opacity-80 transition-all duration-1000" style={{ width: `${Math.min(currentMetrics.memory_usage, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Forked lines for crash state */}
            <div className="w-[2px] h-6 bg-zinc-700 relative z-0"></div>
            <div className="w-[180px] h-[2px] bg-zinc-700 relative z-0 flex justify-between">
              <div className="w-[2px] h-10 bg-red-500/50 absolute left-0 top-0"></div>
              
              {/* Dashed animated line to new pod */}
              <div className="absolute right-0 top-0 h-10 overflow-hidden flex flex-col w-[2px]">
                 <div className="w-full h-[200%] bg-[linear-gradient(to_bottom,#3b82f6_50%,transparent_50%)] bg-[length:2px_8px] animate-[slide_1s_linear_infinite]"></div>
              </div>
            </div>

            <div className="flex gap-4 w-full px-4 mt-10 relative z-10">
              {/* Dead Pod */}
              <div className="flex-1 border border-red-500/30 bg-red-950/30 rounded-xl p-4 shadow-[0_0_15px_rgba(239,68,68,0.1)] opacity-60">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center text-red-500">
                    <Server className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-xs">app-pod-{podCounter}</span>
                  </div>
                </div>
                <div className="flex justify-center my-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/20">
                    OOMKilled
                  </span>
                </div>
              </div>

              {/* Pending Pod */}
              <div className="flex-1 border border-dashed border-blue-500/40 bg-blue-900/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center text-blue-400">
                    <Server className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-xs">app-pod-{podCounter + 1}</span>
                  </div>
                </div>
                <div className="flex justify-center my-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded bg-blue-500/10 text-blue-400 animate-pulse">
                    Pending...
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
