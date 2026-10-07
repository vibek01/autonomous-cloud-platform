import React from 'react';
import { Terminal } from 'lucide-react';

export function LogPanel({ logs }) {
  return (
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
  );
}
