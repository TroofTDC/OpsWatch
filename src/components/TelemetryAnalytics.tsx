import React from 'react';
import { UsageSnapshot, ServiceCatalogItem } from '../types';
import { Cpu, DollarSign, TrendingUp, PieChart as PieIcon, Flame, AlertCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface TelemetryAnalyticsProps {
  snapshots: UsageSnapshot[];
  services: ServiceCatalogItem[];
}

export const TelemetryAnalytics: React.FC<TelemetryAnalyticsProps> = ({
  snapshots,
  services,
}) => {
  // Aggregate snapshots by date for cost trend chart
  const dateMap: { [date: string]: { date: string; Gemini: number; GCP: number; AWS: number; Twilio: number; total: number } } = {};

  snapshots.forEach(s => {
    if (!dateMap[s.snapshotDate]) {
      dateMap[s.snapshotDate] = { date: s.snapshotDate, Gemini: 0, GCP: 0, AWS: 0, Twilio: 0, total: 0 };
    }
    if (s.serviceId === 'srv-gemini-01') dateMap[s.snapshotDate].Gemini = s.costAmount;
    else if (s.serviceId === 'srv-gcp-01') dateMap[s.snapshotDate].GCP = s.costAmount;
    else if (s.serviceId === 'srv-aws-01') dateMap[s.snapshotDate].AWS = s.costAmount;
    else if (s.serviceId === 'srv-twilio-01') dateMap[s.snapshotDate].Twilio = s.costAmount;

    dateMap[s.snapshotDate].total += s.costAmount;
  });

  const dailyTrendData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  // Provider Cost Distribution Pie Data
  const providerTotals: { [provider: string]: number } = {};
  services.forEach(s => {
    providerTotals[s.providerName] = (providerTotals[s.providerName] || 0) + (s.dailyBurnRate * 30);
  });

  const pieColors = ['#f43f5e', '#38bdf8', '#818cf8', '#f59e0b', '#10b981', '#a855f7'];
  const pieData = Object.keys(providerTotals).map((provider, i) => ({
    name: provider,
    value: Number(providerTotals[provider].toFixed(2)),
    color: pieColors[i % pieColors.length],
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-cyan-400" />
            Multi-Cloud Telemetry & Runway Forecasts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            30-day historical usage snapshots, credit depletion curves, and 3-sigma spend spike anomaly detection.
          </p>
        </div>
        <div className="text-right font-mono text-xs hidden sm:block">
          <span className="text-slate-400">Total Monthly Burn Projection:</span>
          <div className="text-lg font-bold text-cyan-400">
            ${services.reduce((acc, s) => acc + s.dailyBurnRate * 30, 0).toFixed(2)} / mo
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Multi-Cloud Cost Trends */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                30-Day Daily Spend Trend ($/day)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Multi-Cloud Provider Breakdown (GCP, Gemini API, AWS, Twilio)
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Spend']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="Gemini" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="GCP" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="AWS" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Twilio" stroke="#10b981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Distribution Pie */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-cyan-400" />
              Monthly Spend Allocation
            </h3>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)} / mo`, 'Projected']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Legend */}
          <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span>{p.name}</span>
                </div>
                <span className="font-bold">${p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
