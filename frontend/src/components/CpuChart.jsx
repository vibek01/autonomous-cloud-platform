import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Cpu } from 'lucide-react';
import { Panel } from './ui/Panel';
import { PanelHeader } from './ui/PanelHeader';
import { Stat } from './ui/Stat';

export function CpuChart({ metrics, currentMetrics }) {
  // We can access CSS variables in React styles, but Recharts needs hex or var() strings.
  const strokeColor = "var(--color-cpu)";

  return (
    <Panel className="h-[240px]">
      <PanelHeader 
        icon={Cpu} 
        title="CPU Usage" 
        rightContent={
          <Stat 
            value={`${currentMetrics.cpu_usage.toFixed(1)}%`} 
            valueColorClass="text-[var(--color-cpu)]" 
          />
        }
      />
      <div className="flex-1 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={metrics}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.08}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-strong)" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis stroke="var(--color-text-muted)" domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'var(--color-text)', fontSize: '11px', fontFamily: 'var(--font-mono)' }} 
              itemStyle={{ color: 'var(--color-text)' }}
            />
            <Area type="stepAfter" dataKey="cpu_usage" stroke={strokeColor} strokeWidth={1.5} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
