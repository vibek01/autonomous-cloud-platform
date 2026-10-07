import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, HardDrive, Terminal, Globe, Server, Activity } from 'lucide-react';

export default function App() {
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('healthy');
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Pod Lifecycle state for the topology map
  const [podCounter, setPodCounter] = useState(1);
  const [wasError, setWasError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, logsRes, previewRes] = await Promise.all([
          axios.get('http://localhost:8000/metrics', { timeout: 2000 }),
          axios.get('http://localhost:8000/logs', { timeout: 2000 }),
          axios.get('http://localhost:8000/', { timeout: 2000 })
        ]);
        
        setStatus('healthy');
        setPreview(previewRes.data);
        setLogs(logsRes.data.logs); // Simple update
        
        setMetrics(prev => {
          const newMetrics = [...prev, { time: new Date().toLocaleTimeString(), ...metricsRes.data }];
          if (newMetrics.length > 30) return newMetrics.slice(newMetrics.length - 30);
          return newMetrics;
        });
      } catch (err) {
        setStatus('error');
        setPreview({ error: "CONNECTION REFUSED" });
        setLogs(prev => {
          const msg = "FATAL: Lost connection to API. Kubernetes replacing Pod...";
          if (prev.length > 0 && prev[prev.length - 1].includes(msg)) return prev;
          return [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
        });
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Manage pod counter logic based on status crashes
  useEffect(() => {
    if (status === 'error') {
       setWasError(true);
    } else if (status === 'healthy' && wasError) {
       setWasError(false);
       setPodCounter(prev => prev + 1);
    }
  }, [status, wasError]);

  const injectChaos = async (type) => {
    setLoadingAction(true);
    try {
      await axios.post(`http://localhost:8000/chaos/${type}`);
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  const recover = async () => {
    setLoadingAction(true);
    try {
      await axios.post('http://localhost:8000/chaos/recover');
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  const currentMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : { cpu_usage: 0, memory_usage: 0, memory_mb: 0 };
  
  // Calculate dynamic pod colors
  const maxLoad = Math.max(currentMetrics.cpu_usage, currentMetrics.memory_usage);
  let loadColorClass = "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  let loadGlowClass = "shadow-[0_0_20px_rgba(16,185,129,0.05)]";
  let badgeColor = "bg-emerald-500/20 text-emerald-400";
  let lineColor = "bg-emerald-500/40";
  
  if (maxLoad > 40) {
    loadColorClass = "border-amber-500/40 bg-amber-500/10 text-amber-400";
    loadGlowClass = "shadow-[0_0_20px_rgba(245,158,11,0.08)]";
    badgeColor = "bg-amber-500/20 text-amber-400";
    lineColor = "bg-amber-500/40";
  }
  if (maxLoad > 75) {
    loadColorClass = "border-red-500/50 bg-red-500/10 text-red-400";
    loadGlowClass = "shadow-[0_0_25px_rgba(239,68,68,0.15)]";
    badgeColor = "bg-red-500/20 text-red-400";
    lineColor = "bg-red-500/50";
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6 font-sans selection:bg-zinc-800">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Autonomous Cloud Platform
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Live Telemetry & Chaos Control</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => injectChaos('cpu')} 
              disabled={loadingAction || status === 'error'}
              className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-medium rounded transition-all disabled:opacity-50"
            >
              Spike CPU
            </button>
            <button 
              onClick={() => injectChaos('memory_continuous')} 
              disabled={loadingAction || status === 'error'}
              className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-medium rounded transition-all disabled:opacity-50"
            >
              Leak Memory
            </button>
            <button 
              onClick={recover} 
              disabled={loadingAction || status === 'error'}
              className="px-4 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 text-xs font-medium rounded transition-colors disabled:opacity-50 ml-4"
            >
              Recover
            </button>
          </div>
        </header>

        {/* Dashboard Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Metrics */}
          <div className="flex flex-col gap-6 h-[600px]">
            {/* CPU Chart */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[240px]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2 text-zinc-400">
                  <Cpu className="w-4 h-4" />
                  <h2 className="text-xs font-medium uppercase tracking-wider">CPU Usage</h2>
                </div>
                <span className="text-lg font-medium tracking-tight text-blue-400">{currentMetrics.cpu_usage.toFixed(1)}%</span>
              </div>
              <div className="flex-1 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#52525b" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                    <Area type="stepAfter" dataKey="cpu_usage" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Memory Chart */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[240px]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2 text-zinc-400">
                  <HardDrive className="w-4 h-4" />
                  <h2 className="text-xs font-medium uppercase tracking-wider">Memory Alloc</h2>
                </div>
                <div className="text-right">
                  <span className="text-lg font-medium tracking-tight text-indigo-400 block">{currentMetrics.memory_usage.toFixed(1)}%</span>
                  <span className="text-[10px] text-zinc-500 block">{currentMetrics.memory_mb.toFixed(1)} / {currentMetrics.limit_mb} MB</span>
                </div>
              </div>
              <div className="flex-1 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics}>
                    <defs>
                      <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#52525b" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="memory_usage" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Live Preview */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[96px] flex flex-col shrink-0 mt-auto">
              <div className="border-b border-zinc-800 px-3 py-2 flex items-center bg-zinc-900/80">
                <Globe className="w-3 h-3 text-zinc-500 mr-2" />
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">API Response</span>
              </div>
              <div className="p-3 bg-[#09090b] font-mono text-[10px] flex-1 overflow-hidden flex items-center">
                {preview ? (
                  <pre className={`${preview.error ? 'text-red-400' : 'text-zinc-400'}`}>
                    {JSON.stringify(preview, null, 2)}
                  </pre>
                ) : (
                  <span className="text-zinc-600">Loading...</span>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Logs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col h-[600px]">
            <div className="border-b border-zinc-800 px-4 py-3 flex items-center bg-zinc-900/80 shrink-0">
              <Terminal className="w-4 h-4 text-zinc-500 mr-2" />
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Server Logs</span>
            </div>
            {/* The flex-col-reverse trick natively anchors the scrollbar to the bottom without JS */}
            <div className="p-4 bg-[#09090b] font-mono text-[11px] leading-relaxed overflow-y-auto flex-1 flex flex-col-reverse break-words rounded-b-xl">
              {logs.length === 0 ? (
                <span className="text-zinc-600 m-auto">No logs generated yet.</span>
              ) : (
                <ul className="space-y-2 flex flex-col-reverse">
                  {[...logs].reverse().map((log, i) => {
                    let color = "text-zinc-400";
                    if (log.includes("WARNING")) color = "text-amber-400/90";
                    if (log.includes("CRITICAL") || log.includes("FATAL") || log.includes("❌")) color = "text-red-400";
                    if (log.includes("SYSTEM BOOT")) color = "text-emerald-400/90";
                    return (
                      <li key={i} className={`${color} border-b border-zinc-800/30 pb-1 last:border-b-0`}>{log}</li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Column 3: Kubernetes Topology */}
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
