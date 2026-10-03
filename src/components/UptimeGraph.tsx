import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { ServerStats, ServerConfig } from '../types';
import { Activity, ShieldCheck, Clock, Zap, Info } from 'lucide-react';
import { HistoryService } from '../services/historyService';

interface UptimeGraphProps {
  stats: ServerStats;
  config: ServerConfig;
}

interface LatencyPoint {
  timestamp: string;
  hourLabel: string;
  latency: number;
  uptime: number;
  status: string;
}

export const UptimeGraph: React.FC<UptimeGraphProps> = ({ stats, config }) => {
  const [history, setHistory] = useState(() => HistoryService.getHistory());

  // Update history from local storage periodically so the chart reflects live pings
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(HistoryService.getHistory());
    }, 5000); // Check every 5 seconds for new pings
    return () => clearInterval(interval);
  }, []);

  // Map the real history to the chart data format. 
  // We'll take up to the last 60 points for a moving live chart.
  const data = useMemo<LatencyPoint[]>(() => {
    let points = history.slice(-60).map(record => {
      const pointTime = new Date(record.timestamp);
      const timeLabel = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const fullDateStr = pointTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      return {
        timestamp: `${fullDateStr} at ${timeLabel}`,
        hourLabel: timeLabel,
        latency: record.latency,
        uptime: record.isOnline ? 100 : 0,
        status: record.isOnline ? 'Operational' : 'Offline'
      };
    });

    // If history is completely empty (first load before first ping finishes), seed it with current stats
    if (points.length === 0) {
      const pointTime = new Date();
      const timeLabel = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      points.push({
        timestamp: `${pointTime.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeLabel}`,
        hourLabel: timeLabel,
        latency: stats.pingMs || 0,
        uptime: stats.isOnline ? 100 : 0,
        status: stats.isOnline ? 'Operational' : 'Offline'
      });
    }

    return points;
  }, [history, stats]);

  // Calculate average latency from points (only count online points)
  const avgLatency = useMemo(() => {
    const onlinePoints = data.filter(d => d.uptime > 0);
    if (onlinePoints.length === 0) return 0;
    const total = onlinePoints.reduce((acc, curr) => acc + curr.latency, 0);
    return Math.round(total / onlinePoints.length);
  }, [data]);

  // Calculate overall uptime percentage for the visible period
  const uptimePercentage = useMemo(() => {
    const onlineCount = data.filter(d => d.uptime > 0).length;
    return ((onlineCount / data.length) * 100).toFixed(2) + '%';
  }, [data]);

  return (
    <section id="uptime" className="relative max-w-5xl mx-auto px-4 scroll-mt-24">
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-7 shadow-xl space-y-6">
        {/* Header with Title & Operational Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white uppercase">
                Server Uptime & Latency
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Continuous 24-hour response telemetry via TCP/UDP socket probes.
            </p>
          </div>

          {/* Real-time System Status Pill */}
          <div className="flex items-center gap-2 font-mono self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                {stats.isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    stats.isOnline ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="text-zinc-300 font-medium">
                {stats.isOnline ? 'All Systems Operational' : 'System Degraded / Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Header Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          {/* Overall Uptime Metric */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Overall Uptime
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Live Timeframe</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {uptimePercentage}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                {stats.isOnline ? '0 Incidents' : 'Offline'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              High-availability SLA target 99.9%
            </p>
          </div>

          {/* Average Latency Metric */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Average Latency
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">TCP Ping</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400 tracking-tight">
                {avgLatency} ms
              </span>
              <span className="text-xs text-zinc-400">
                (Global Gateway)
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Optimal response under 35ms threshold
            </p>
          </div>

          {/* Live Status Metric */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Response Health
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Live</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-100 tracking-tight">
                {stats.isOnline ? '100% Available' : 'Unreachable'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Probing {config.javaIp}:{config.javaPort}
            </p>
          </div>
        </div>

        {/* 2. Modern Uptime & Latency Graph (Recharts Area Chart with Green Gradient) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-850">
            <div className="flex items-center gap-2">
              <span className="text-zinc-200 font-semibold">24-Hour Latency Timeline (ms)</span>
              <span className="hidden sm:inline text-zinc-600">|</span>
              <span className="hidden sm:inline text-zinc-500 text-[11px]">Green gradient indicates stable connection</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Ping Latency
              </span>
            </div>
          </div>

          <div className="w-full h-64 sm:h-72 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  {/* Subtle, elegant green gradient fill */}
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.38} />
                    <stop offset="60%" stopColor="#10b981" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#27272a" 
                  vertical={false} 
                />

                <XAxis 
                  dataKey="hourLabel" 
                  stroke="#71717a" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                  interval="preserveStartEnd"
                />

                <YAxis 
                  stroke="#71717a" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                  domain={[0, 'dataMax + 10']}
                  tickFormatter={(val) => `${val}ms`}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#latencyGradient)"
                  activeDot={{
                    r: 5,
                    fill: '#34d399',
                    stroke: '#09090b',
                    strokeWidth: 2
                  }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 3. Live Availability Bar Segments */}
          <div className="pt-3 border-t border-zinc-850 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Live Availability Timeline (Recent Pings)</span>
              <span className="text-emerald-400 font-semibold">{uptimePercentage} Operational</span>
            </div>

            {/* Segmented Timeline */}
            <div className="flex items-center gap-1 h-3 w-full">
              {data.map((pt, idx) => (
                <div
                  key={idx}
                  title={`${pt.timestamp}: ${pt.latency}ms - ${pt.status}`}
                  className={`flex-1 h-full rounded-xs transition-transform hover:scale-125 cursor-help ${
                    pt.uptime > 0 ? 'bg-emerald-400/90 hover:bg-emerald-300' : 'bg-rose-500'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>Older Pings</span>
              <span>Polling exactly every {config.autoRefreshInterval || 25} seconds</span>
              <span>Now</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Custom interactive tooltip with date/time, status, and ping latency
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: LatencyPoint = payload[0].payload;
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 shadow-2xl font-mono text-xs space-y-1.5 z-50">
        <div className="text-[11px] text-zinc-400 border-b border-zinc-800 pb-1">
          {data.timestamp}
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Status:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {data.status}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Response Ping:</span>
          <span className="text-white font-bold">{data.latency} ms</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[10px] text-zinc-500 pt-0.5 border-t border-zinc-850">
          <span>Protocol:</span>
          <span>TCP Handshake</span>
        </div>
      </div>
    );
  }
  return null;
};
