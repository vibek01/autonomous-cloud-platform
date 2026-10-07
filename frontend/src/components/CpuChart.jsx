import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu } from 'lucide-react';
import { CHART_COLORS } from '../lib/constants';

export function CpuChart({ metrics, currentMetrics }) {
  return (
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
                <stop offset="5%" stopColor={CHART_COLORS.cpu} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={CHART_COLORS.cpu} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis stroke="#52525b" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
            <Area type="stepAfter" dataKey="cpu_usage" stroke={CHART_COLORS.cpu} strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
