/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Mic, 
  MicOff, 
  PhoneCall, 
  Calendar, 
  User, 
  Clock, 
  Activity, 
  Globe, 
  ShieldCheck,
  Stethoscope,
  Terminal,
  RefreshCcw,
  MessageSquare
} from 'lucide-react';

interface Metrics {
  stt_ms: string;
  lang_detect_ms: string;
  agent_ms: string;
  tool_ms: string;
  tts_ms: string;
  total_ms: string;
}

interface LogEntry {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
  metrics?: Metrics;
}

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<Metrics | null>(null);
  const [wsReady, setWsReady] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>([
    `[${new Date().toISOString().split('T')[1].slice(0, 8)}] INFO: WebSocket connection established`,
    `[${new Date().toISOString().split('T')[1].slice(0, 8)}] DEBUG: pipeline_warmup sequence initiated`,
    `[${new Date().toISOString().split('T')[1].slice(0, 8)}] READY: all services operational`
  ]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    
    socket.onopen = () => {
      setWsReady(true);
      addSystemLog('INFO: WebSocket pipeline active');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'voice_response') {
        handleAddLog('agent', data.text, data.metrics);
        setCurrentMetrics(data.metrics);
        setIsListening(false);
        addSystemLog(`SUCCESS: Agent response received. Latency: ${data.metrics.total_ms}ms`);
      }
    };

    socketRef.current = socket;
    return () => socket.close();
  }, []);

  const addSystemLog = (msg: string) => {
    setSystemLogs(prev => [...prev.slice(-10), `[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${msg}`]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleAddLog = (role: 'user' | 'agent', text: string, metrics?: Metrics) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      role,
      text,
      timestamp: new Date().toLocaleTimeString(),
      metrics
    };
    setLogs(prev => [...prev, entry]);
    if (role === 'user') addSystemLog(`INPUT: Voice fragment detected [${text.length} chars]`);
  };

  const handleSendInput = (text: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    handleAddLog('user', text);
    socketRef.current.send(JSON.stringify({ type: 'voice_input', text }));
    setIsListening(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-dash-bg text-white p-4 font-mono">
      {/* Design Header */}
      <header className="flex justify-between items-center border-b border-dash-border pb-3 mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full animate-pulse ${wsReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <h1 className="text-xl font-bold tracking-tighter">CLINICFLOW_ARCHITECT_V2.4</h1>
          <span className="px-2 py-0.5 bg-dash-surface text-[10px] text-gray-400 border border-dash-border">STABLE_PRODUCTION</span>
        </div>
        <div className="hidden lg:flex gap-6 text-[11px] text-gray-400">
          <div>NODE: <span className="text-white">vxa-7782-90-kl</span></div>
          <div>REGION: <span className="text-white">asia-southeast-1</span></div>
          <div>UPTIME: <span className="text-white">142:12:09</span></div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Column: Persistent Memory & Persistence State (col-span-3) */}
        <section className="col-span-3 flex flex-col gap-4">
          <div className="bg-dash-surface border border-dash-border p-3 h-1/2 flex flex-col">
            <div className="text-[10px] text-gray-500 uppercase mb-3 px-1">Real-time Telemetry</div>
            <div className="flex items-end gap-1 h-24 mb-4 mt-auto">
              {[20, 45, 80, 35, 60, 95, 40, 20, 70, 50, 85, 30].map((h, i) => (
                <div key={i} className="flex-1 bg-cyan-400/80" style={{ height: isListening ? `${Math.random()*100}%` : `${h}%` }}></div>
              ))}
            </div>
            <div className="space-y-1 text-[11px] mt-auto">
              <div className="flex justify-between"><span>Codec</span><span className="text-cyan-400">Opus/48k</span></div>
              <div className="flex justify-between"><span>VAD</span><span className={isListening ? "text-green-500" : "text-gray-600"}>{isListening ? "SPEAKING" : "IDLE"}</span></div>
              <div className="flex justify-between"><span>Jitter</span><span className="text-cyan-400">12ms</span></div>
            </div>
          </div>

          <div className="bg-dash-surface border border-dash-border p-3 flex-1 flex flex-col overflow-hidden">
            <div className="text-[10px] text-gray-500 uppercase mb-3">Persistence Layer</div>
            <div className="space-y-4 overflow-y-auto pr-1">
              <ProfileItem icon={<User className="w-3 h-3"/>} label="Last Patient" value="Sahil Pandey" />
              <ProfileItem icon={<Globe className="w-3 h-3"/>} label="Language" value="Hindi / English" />
              <div className="pt-2 border-t border-dash-border">
                <div className="flex justify-between text-[11px] mb-1"><span>SQLite (Arch)</span><span className="text-green-400">Sync OK</span></div>
                <div className="h-1 bg-gray-900"><div className="h-full bg-cyan-500" style={{ width: '65%' }}></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* Middle Column: Core Interaction & Logs (col-span-6) */}
        <section className="col-span-6 bg-dash-surface border border-dash-border p-4 relative flex flex-col min-h-0">
          <div className="text-[10px] text-gray-500 uppercase mb-4">Core Pipeline Orchestration</div>
          
          {/* Transcript / Chat integrated as a live console */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 border border-dashed border-white/10 rounded-lg">
                <Terminal className="w-12 h-12 mb-2" />
                <p className="text-[11px] uppercase tracking-widest">Awaiting pipeline trigger...</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="text-[12px] leading-relaxed">
                  <span className={log.role === 'user' ? "text-cyan-400" : "text-amber-500"}>
                    {log.role === 'user' ? "PATIENT_INTAKE >> " : "AGENT_OUTPUT >> "}
                  </span>
                  <span className="text-white/90">{log.text}</span>
                  {log.metrics && (
                    <div className="text-[10px] text-gray-600 mt-1 pl-4">
                      {`LATENCY: ${log.metrics.total_ms}ms | STT: ${log.metrics.stt_ms}ms | AGNT: ${log.metrics.agent_ms}ms`}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Voice Controls / Waveform Simulation */}
          <div className="bg-black/40 border border-dash-border p-3 rounded-lg">
            <div className="flex flex-wrap gap-2 mb-4">
              <QuickAction label="BOOK_SLOT" onClick={() => handleSendInput("I want to book an appointment for today.")} />
              <QuickAction label="CHECK_DR_ST" onClick={() => handleSendInput("Is Dr. Smith available at 10 AM?")} />
              <QuickAction label="CANCEL_LAST" onClick={() => handleSendInput("Cancel my last appointment.")} />
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsListening(!isListening)}
                className={`w-12 h-12 rounded bg-black border ${isListening ? 'border-orange-500 text-orange-500' : 'border-dash-border text-gray-600'} flex items-center justify-center transition-all`}
              >
                {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
              </button>
              <div className="flex-1 text-[11px]">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">PIPELINE_STATUS:</span>
                  <span className={isListening ? "text-cyan-400" : "text-gray-600"}>{isListening ? "STREAMING_ACTIVE" : "STANDBY"}</span>
                </div>
                <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                  <motion.div animate={{ width: isListening ? '100%' : '0%' }} className="h-full bg-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Latency & Scheduling (col-span-3) */}
        <section className="col-span-3 flex flex-col gap-4">
          <div className="bg-dash-surface border border-dash-border p-3 flex flex-col h-full overflow-hidden">
            <div className="text-[10px] text-gray-500 uppercase mb-3">Latency Telemetry (ms)</div>
            <div className="space-y-3">
              <LatencyRow label="STT_PROC" value={currentMetrics?.stt_ms || '---'} />
              <LatencyRow label="LANG_DET" value={currentMetrics?.lang_detect_ms || '---'} />
              <LatencyRow label="AGENT_RSN" value={currentMetrics?.agent_ms || '---'} />
              <LatencyRow label="TOOL_EXEC" value={currentMetrics?.tool_ms || '---'} />
              <LatencyRow label="TTS_GEN" value={currentMetrics?.tts_ms || '---'} />
              <div className="mt-4 pt-4 border-t border-dash-border flex justify-between items-center font-bold text-green-400">
                <span className="text-[11px]">TOTAL_E2E</span>
                <span className="text-lg">{currentMetrics ? `${currentMetrics.total_ms}ms` : '---'}</span>
              </div>
              <div className="text-[9px] text-green-700 mt-1 uppercase italic">
                -21ms below 450ms threshold
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-dash-border">
              <div className="text-[10px] text-gray-500 uppercase mb-3 px-1">Active Slots</div>
              <div className="space-y-2 overflow-y-auto max-h-[180px]">
                <ScheduleSlot dr="Dr. Smith" time="09:00" status="available" />
                <ScheduleSlot dr="Dr. Smith" time="10:00" status="booked" />
                <ScheduleSlot dr="Dr. Sharma" time="14:00" status="available" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Design Footer: System Logs Console */}
      <footer className="h-32 bg-black border border-dash-border mt-4 p-2 text-[10px] text-gray-500 overflow-hidden font-mono flex flex-col">
        <div className="mb-1 text-gray-400 font-bold uppercase flex items-center gap-2">
          <Terminal className="w-3 h-3" /> System_Orchestrator_Logs
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {systemLogs.map((log, i) => (
            <div key={i} className="mb-0.5">{log}</div>
          ))}
          {isListening && <div className="text-cyan-700 animate-pulse">{">>>"} [DEBUG] stt_fragment_received length=4096 bytes</div>}
        </div>
      </footer>
      {/* Systems Summary Rail */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-t border-dash-border flex justify-between items-center opacity-40 text-[10px]">
        <div className="flex gap-6">
          <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> HIPAA_v2_ENCRYPTED</div>
          <div className="flex items-center gap-1"><Activity className="w-3 h-3" /> PIPELINE_HEALTH: 100%</div>
        </div>
        <div>&copy; 2026 CLINICFLOW LABS :: v2.4.0-STABLE</div>
      </div>
    </div>
  );
}

function LatencyRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <span className="text-gray-400 uppercase tracking-tighter">{label}</span>
      <span className="text-white font-bold">{value}{value !== '---' ? 'ms' : ''}</span>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-dash-border last:border-0">
      <div className="text-gray-600 p-1 bg-white/5">{icon}</div>
      <div className="flex-1">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">{label}</p>
        <p className="text-[11px] font-medium text-white/90">{value}</p>
      </div>
    </div>
  );
}

function ScheduleSlot({ dr, time, status }: { dr: string, time: string, status: 'available' | 'booked' }) {
  return (
    <div className="flex items-center justify-between p-1.5 border border-dash-border text-[10px] bg-black/20">
      <div className="flex flex-col">
        <span className="font-bold text-white tracking-tighter">{time}</span>
        <span className="text-gray-500 text-[9px]">{dr}</span>
      </div>
      <span className={`px-1 rounded-sm border ${status === 'available' ? 'border-green-800 text-green-500 bg-green-950/20' : 'border-gray-800 text-gray-600 bg-gray-900/40'}`}>
        {status.toUpperCase()}
      </span>
    </div>
  );
}

function QuickAction({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-2 py-1 text-[10px] border border-dash-border text-gray-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all cursor-pointer font-bold"
    >
      {label}
    </button>
  );
}

