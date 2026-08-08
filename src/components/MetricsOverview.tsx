import React from 'react';
import { ServiceCatalogItem, CredentialsRegistryItem, AlertRule } from '../types';
import {
  Server,
  DollarSign,
  AlertTriangle,
  Flame,
  KeyRound,
  ShieldAlert,
  CreditCard,
  CalendarX,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';

interface MetricsOverviewProps {
  services: ServiceCatalogItem[];
  credentials: CredentialsRegistryItem[];
  alertRules: AlertRule[];
  onNavigateTab: (tab: string) => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  services,
  credentials,
  alertRules,
  onNavigateTab,
}) => {
  // Compute Key Metrics
  const totalServices = services.length;
  const criticalServices = services.filter(s => s.status === 'Critical' || s.status === 'Expired');
  const warningServices = services.filter(s => s.status === 'Warning');
  const healthyServices = services.filter(s => s.status === 'Healthy');

  const totalDailyBurn = services.reduce((acc, s) => acc + (s.dailyBurnRate || 0), 0);
  const totalPrepaidBalance = services.reduce((acc, s) => acc + (s.remainingBalance || 0), 0);

  // Critical Runway (<7 days remaining)
  const lowRunwayServices = services.filter(s => s.runwayDays !== null && s.runwayDays !== undefined && s.runwayDays <= 7 && s.dailyBurnRate > 0);

  // Overdue credentials
  const overdueCreds = credentials.filter(c => c.isOverdue);

  // Expiring cards (e.g. expiring in 2026-08 or earlier)
  const currentMonth = '2026-08';
  const expiringCards = services.filter(s => s.paymentCardExpiry && s.paymentCardExpiry <= currentMonth);

  // Active P1 alert rules
  const activeP1Rules = alertRules.filter(r => r.urgencyTier === 'P1-Critical' && r.isActive);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Critical Issues exist */}
      {criticalServices.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-900 border border-rose-600/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-rose-950/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-600/20 text-rose-400 rounded-lg border border-rose-500/30 animate-pulse">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-200 flex items-center gap-2">
                CRITICAL OPERATIONAL INCIDENT DETECTED
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-900/80 text-rose-300 border border-rose-700/50">
                  P1 HIGH SEVERITY
                </span>
              </h3>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Gemini 3.6 API prepaid balance is depleted ($145.50 remaining) with a +539% token acceleration spike. DoW risk flagged.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('dow-soc')}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-900/50 transition-all shrink-0"
          >
            <span>Launch AI SOC Diagnosis & Circuit Breaker</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Services & Health */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Catalog Health Index
            </span>
            <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700">
              <Server className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{totalServices}</span>
            <span className="text-xs text-slate-400">Total Services</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              {healthyServices.length} Healthy
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              {warningServices.length} Warn
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
              {criticalServices.length} Crit
            </span>
          </div>
        </div>

        {/* Card 2: 30-Day Daily Burn Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Combined Daily Burn ($DBR)
            </span>
            <div className="p-2 rounded-lg bg-slate-800/80 text-amber-400 border border-slate-700">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              ${totalDailyBurn.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">/ day</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-400 font-mono">
            <span className="text-amber-400 font-semibold mr-1">30d Avg:</span>
            <span>${(totalDailyBurn * 30).toFixed(0)} / month projected</span>
          </div>
        </div>

        {/* Card 3: Prepaid Credit Balance & Runway */}
        <div
          onClick={() => onNavigateTab('telemetry')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
              Prepaid Credit Runway ($R)
            </span>
            <div className="p-2 rounded-lg bg-slate-800/80 text-rose-400 border border-slate-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-rose-400">
              {lowRunwayServices.length} Services
            </span>
            <span className="text-xs text-rose-300/80">&lt; 7 Days Runway</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Prepaid Balance: ${totalPrepaidBalance.toFixed(2)}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400" />
          </div>
        </div>

        {/* Card 4: Credential Rotation & Card Expirations */}
        <div
          onClick={() => onNavigateTab('credentials')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
              Security & Renewals
            </span>
            <div className="p-2 rounded-lg bg-slate-800/80 text-indigo-400 border border-slate-700">
              <KeyRound className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {overdueCreds.length} Overdue
            </span>
            <span className="text-xs text-slate-400">Keys &gt; Interval</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-amber-300">{expiringCards.length} Card(s) Expiring Month</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Operational Highlights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DoW Token Acceleration Quick Snapshot */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-rose-500" />
              <h4 className="text-sm font-semibold text-slate-200">
                Denial-of-Wallet (DoW) AI SOC
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-950 text-rose-400 border border-rose-800">
              Spike Triggered
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Comparing current hourly token consumption (<span className="font-mono text-rose-400 font-semibold">3,900,000</span>) against 12-hour baseline (<span className="font-mono text-slate-300">610,000</span>).
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Acceleration Ratio (Th / MA_12h):</span>
              <span className="font-mono text-rose-400 font-bold">+539%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full w-[85%] animate-pulse"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Threshold: +200%</span>
              <span className="text-rose-400 font-semibold">LIMIT EXCEEDED</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('dow-soc')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>Open AI SOC Control Center</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Immediate Action Items */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <CalendarX className="h-4 w-4 text-amber-400" />
              Operational Compliance & Renewal Priorities
            </h4>
            <span className="text-xs text-slate-400 font-mono">Real-time Audits</span>
          </div>

          <div className="space-y-2.5">
            {/* Priority Item 1: Gemini Balance */}
            <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Gemini 3.6 API Balance Depleted ($145.50 remaining)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Estimated Runway: <span className="text-rose-400 font-semibold">2.1 Days</span> | DBR: $68.40/day
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('services')}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium shrink-0"
              >
                Top-Up / Sign off
              </button>
            </div>

            {/* Priority Item 2: Twilio Payment Card */}
            <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Twilio & SendGrid Card Expiring (Card ending 9012 - Exp: 2026-08)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Twilio Balance: <span className="text-amber-400 font-semibold">$18.20</span> (1.3 days runway)
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('services')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium shrink-0"
              >
                Update Card
              </button>
            </div>

            {/* Priority Item 3: Namecheap Domain */}
            <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CalendarX className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Domain Registration Expiration: opswatch-control.io
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Expires on <span className="text-amber-400 font-semibold">2026-08-14</span> (7 Days Remaining) | Auto-Renew: OFF
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('audit')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium shrink-0"
              >
                Renew Domain
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
