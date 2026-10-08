import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Activity, BrainCircuit } from 'lucide-react';
import { Panel } from './ui/Panel';
import { PanelHeader } from './ui/PanelHeader';
import { Tabs } from './ui/Tabs';
import client from '../api/client';

export function LogPanel({ logs, clusterState }) {
  const [activeTab, setActiveTab] = useState('logs');
  const [events, setEvents] = useState([]);
  const [explanations, setExplanations] = useState({});

  useEffect(() => {
    let interval;
    if (activeTab === 'events') {
      const fetchEvents = async () => {
        try {
          const res = await client.get('/api/events');
          setEvents(res.data.events);
        } catch (e) {
          console.error(e);
        }
      };
      fetchEvents();
      interval = setInterval(fetchEvents, 2000);
    } else if (activeTab === 'ai') {
      const fetchExplain = async () => {
        try {
          const newExplanations = {};
          if (clusterState?.pods) {
            for (const pod of clusterState.pods) {
              try {
                const res = await client.get(`/api/explain/${pod.name}`);
                newExplanations[pod.name] = res.data.explanation;
              } catch (err) {
                newExplanations[pod.name] = `Waiting for AI analysis (gathering data points)...`;
              }
            }
          }
          setExplanations(newExplanations);
        } catch (e) {
          console.error(e);
        }
      };
      fetchExplain();
      interval = setInterval(fetchExplain, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab, clusterState]);

  return (
    <Panel className="h-[600px]">
      <PanelHeader 
        icon={Terminal} 
        title="Intelligence & Logs" 
      />
      
      <Tabs 
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        className="bg-surface-raised"
        tabs={[
          { id: 'logs', label: 'App Logs', icon: Terminal },
          { id: 'events', label: 'Controller Events', icon: Activity },
          { id: 'ai', label: 'AI Reasoning', icon: BrainCircuit }
        ]}
      />

      <div className="p-4 bg-bg font-mono text-[11px] leading-relaxed overflow-y-auto flex-1 flex flex-col-reverse break-words">
        {activeTab === 'logs' && (
          logs.length === 0 ? (
            <span className="text-text-muted m-auto">No app logs generated yet.</span>
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
          )
        )}

        {activeTab === 'events' && (
          events.length === 0 ? (
            <span className="text-text-muted m-auto">No events generated yet.</span>
          ) : (
            <ul className="space-y-2 flex flex-col-reverse">
              {[...events].reverse().map((event, i) => {
                let color = "text-text-muted";
                if (event.level === "WARNING") color = "text-warning";
                if (event.level === "ERROR") color = "text-danger";
                
                const time = new Date(event.timestamp).toLocaleTimeString();
                return (
                  <li key={i} className={`${color} border-b border-border/30 pb-2 last:border-b-0`}>
                    <div className="flex justify-between text-[9px] mb-1 opacity-70">
                      <span>[{time}]</span>
                      <span>{event.level}</span>
                    </div>
                    <div>{event.message}</div>
                    {Object.keys(event.details).length > 0 && (
                      <pre className="mt-1 text-[9px] opacity-70 bg-surface p-1 rounded">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    )}
                  </li>
                )
              })}
            </ul>
          )
        )}

        {activeTab === 'ai' && (
          Object.keys(explanations).length === 0 ? (
            <span className="text-text-muted m-auto">Waiting for AI analysis...</span>
          ) : (
            <div className="space-y-4 flex flex-col-reverse">
              {Object.entries(explanations).map(([pod, expl], i) => (
                <div key={pod} className="border border-border rounded-lg p-3 bg-surface-raised">
                  <div className="text-[10px] text-accent mb-2 font-semibold">Target: {pod}</div>
                  <pre className="text-text whitespace-pre-wrap">{expl}</pre>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Panel>
  );
}
