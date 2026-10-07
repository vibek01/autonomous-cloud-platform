import React from 'react';
import { Terminal } from 'lucide-react';
import { Panel } from './ui/Panel';
import { PanelHeader } from './ui/PanelHeader';

export function LogPanel({ logs }) {
  return (
    <Panel className="h-[600px]">
      <PanelHeader icon={Terminal} title="Server Logs" />
      {/* The flex-col-reverse trick natively anchors the scrollbar to the bottom without JS */}
      <div className="p-4 bg-bg font-mono text-[11px] leading-relaxed overflow-y-auto flex-1 flex flex-col-reverse break-words">
        {logs.length === 0 ? (
          <span className="text-text-muted m-auto">No logs generated yet.</span>
        ) : (
          <ul className="space-y-2 flex flex-col-reverse">
            {[...logs].reverse().map((log, i) => {
              let color = "text-text-muted";
              if (log.includes("WARNING")) color = "text-warning";
              if (log.includes("CRITICAL") || log.includes("FATAL") || log.includes("❌")) color = "text-danger";
              if (log.includes("SYSTEM BOOT")) color = "text-success";
              return (
                <li key={i} className={`${color} border-b border-border/30 pb-1 last:border-b-0`}>{log}</li>
              )
            })}
          </ul>
        )}
      </div>
    </Panel>
  );
}
