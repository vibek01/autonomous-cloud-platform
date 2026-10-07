import React, { useState } from 'react';
import client from '../api/client';

export function Header({ status }) {
  const [loadingAction, setLoadingAction] = useState(false);

  const injectChaos = async (type) => {
    setLoadingAction(true);
    try {
      await client.post(`/chaos/${type}`);
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  const recover = async () => {
    setLoadingAction(true);
    try {
      await client.post('/chaos/recover');
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  return (
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
  );
}
