import React from 'react';
import { Globe } from 'lucide-react';

export function LivePreview({ preview }) {
  return (
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
  );
}
