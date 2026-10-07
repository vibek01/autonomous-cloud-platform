import React from 'react';
import { Globe } from 'lucide-react';
import { Panel } from './ui/Panel';
import { PanelHeader } from './ui/PanelHeader';

export function LivePreview({ preview }) {
  return (
    <Panel className="h-[96px] mt-auto">
      <PanelHeader icon={Globe} title="API Response" />
      <div className="p-3 bg-bg font-mono text-[10px] flex-1 overflow-hidden flex items-center text-text-muted">
        {preview ? (
          <pre className={`${preview.error ? 'text-danger' : 'text-text-muted'} w-full overflow-hidden text-ellipsis whitespace-nowrap`}>
            {JSON.stringify(preview)}
          </pre>
        ) : (
          <span>Loading...</span>
        )}
      </div>
    </Panel>
  );
}
