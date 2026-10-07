import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { HardDrive } from 'lucide-react';
import { Panel } from './ui/Panel';
import { PanelHeader } from './ui/PanelHeader';
import { Stat } from './ui/Stat';
import { THRESHOLD_DANGER } from '../lib/constants';

export function MemoryChart({ metrics, currentMetrics }) {
  const strokeColor = "var(--color-memory)";
  const dangerColor = "var(--color-danger)";

  return (
    <Panel className="h-[240px]">
      <PanelHeader 
        icon={HardDrive} 
        title="Memory Alloc" 
        rightContent={
          <div className="text-right">
            <span className="text-lg font-medium tracking-tight text-[var(--color-memory)] block tabular-nums leading-none">
              {currentMetrics.memory_usage.toFixed(1)}%
            </span>
            <span className="text-[10px] text-text-muted block tabular-nums leading-none mt-1">
              {currentMetrics.memory_mb.toFixed(1)} / {currentMetrics.limit_mb} MB
            </span>
          </div>
        }
      />
      <div className="flex-1 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={metrics}>
            <defs>
              <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
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
            <ReferenceLine y={100} stroke="var(--color-danger)" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={THRESHOLD_DANGER} stroke="var(--color-warning)" strokeDasharray="3 3" opacity={0.5} />
            <Area type="monotone" dataKey="memory_usage" stroke={strokeColor} strokeWidth={1.5} fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
