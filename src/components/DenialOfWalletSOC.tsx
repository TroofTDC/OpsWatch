import React, { useState } from 'react';
import { DoWAnomalyResult, AISOCAnalysisResponse, ServiceCatalogItem } from '../types';
import { analyzeWithAISOC, triggerCircuitBreakerTest } from '../services/api';
import {
  ShieldAlert,
  Flame,
  Cpu,
  Brain,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

interface DenialOfWalletSOCProps {
  dowResult: DoWAnomalyResult | null;
  hourlyData: { hour: string; tokenCount: number; ma12h: number }[];
  geminiService: ServiceCatalogItem | undefined;
}

export const DenialOfWalletSOC: React.FC<DenialOfWalletSOCProps> = ({
  dowResult,
  hourlyData,
  geminiService,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AISOCAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [circuitBreakerLog, setCircuitBreakerLog] = useState<any | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  // Run Gemini AI SOC Diagnosis
  const handleRunAiSocAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeWithAISOC({
        serviceName: geminiService?.serviceName || 'Gemini 3.6 Flash & Live API',
        status: geminiService?.status || 'Critical',
        remainingBalance: geminiService?.remainingBalance || 145.50,
        dailyBurnRate: geminiService?.dailyBurnRate || 68.40,
        runwayDays: geminiService?.runwayDays || 2.1,
        tokenSpikePct: dowResult?.spikePercentage || 539,
        alertCondition: 'DenialOfWalletSpike (>200% over 12h moving average)',
      });
      setAiAnalysis(res);
    } catch (e) {
      console.error('AI SOC Analysis failed:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute Circuit Breaker Failover Test
  const handleExecuteCircuitBreaker = async () => {
    setIsTriggering(true);
    try {
      const res = await triggerCircuitBreakerTest('rule-dow-01');
      setCircuitBreakerLog(res);
    } catch (e) {
      console.error('Circuit breaker trigger failed:', e);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: AI SOC Active Protection Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-950/80 text-rose-400 rounded-xl border border-rose-700/50 shadow-inner">
              <ShieldAlert className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-100">
                  Denial-of-Wallet (DoW) AI SOC Shield
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-900/80 text-rose-300 border border-rose-700/60">
                  ACTIVE ANOMALY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Mathematical token acceleration monitoring (Th &gt; MA_12h &times; (1 + ThresholdPct)) protecting AI model budgets against query flooding &amp; infinite loops.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleRunAiSocAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-950 transition-all"
            >
              <Brain className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Running AI SOC Agent...' : 'Diagnose with Gemini AI SOC'}</span>
            </button>

            <button
              onClick={handleExecuteCircuitBreaker}
              disabled={isTriggering}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-rose-950 transition-all"
            >
              <Zap className={`h-4 w-4 ${isTriggering ? 'animate-bounce' : ''}`} />
              <span>Trigger Circuit Breaker</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Graph & Anomaly Equation Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Acceleration Chart (24h) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                Hourly Token Consumption (Th) vs 12-Hour Moving Average (MA_12h)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Gemini 3.6 API Token Acceleration Window (Past 24 Hours)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
              Spike Peak: 3,900,000 Tokens/hr
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorToken" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(value: any) => [Number(value).toLocaleString(), 'Tokens']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Area
                  type="monotone"
                  dataKey="tokenCount"
                  name="Hourly Tokens (Th)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorToken)"
                />
                <Area
                  type="monotone"
                  dataKey="ma12h"
                  name="12h Moving Avg (MA12h)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorMa)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Algorithm Equation Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
            DoW Acceleration Parameters
          </h3>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
            <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1">
              Trigger Formula:
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Th &gt; MA_12h &times; (1 + ThresholdPct)
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 bg-slate-950/60 rounded border border-slate-800/80">
              <span className="text-slate-400">Current Hourly Token (Th):</span>
              <span className="text-rose-400 font-bold">3,900,000</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950/60 rounded border border-slate-800/80">
              <span className="text-slate-400">12h Moving Avg (MA_12h):</span>
              <span className="text-cyan-400 font-bold">610,000</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950/60 rounded border border-slate-800/80">
              <span className="text-slate-400">Spike Ratio:</span>
              <span className="text-rose-400 font-bold">+539%</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950/60 rounded border border-slate-800/80">
              <span className="text-slate-400">Threshold Pct:</span>
              <span className="text-slate-200">200% (+2.0x)</span>
            </div>
            <div className="flex justify-between p-2 bg-rose-950/40 rounded border border-rose-800/80">
              <span className="text-rose-300 font-semibold">DoW Anomaly Status:</span>
              <span className="text-rose-400 font-bold">EXCEEDED (TRUE)</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI SOC Incident Diagnosis Results (if generated) */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-indigo-500/40 rounded-xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">
                Gemini AI SOC Incident Root-Cause & Playbook Analysis
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-700">
              SEVERITY: {aiAnalysis.incidentSeverity}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Summary & Diagnosis */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
                  Executive Summary
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {aiAnalysis.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider font-mono">
                  Technical Root-Cause Diagnosis
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-1 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  {aiAnalysis.rootCauseDiagnosis}
                </p>
              </div>
            </div>

            {/* Right: Playbook Actions & Recommended Fallback */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                Immediate Containment Playbook
              </h4>
              <ul className="space-y-2">
                {aiAnalysis.immediatePlaybookActions.map((action, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="p-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px] font-bold shrink-0">
                      Step {idx + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>

              {aiAnalysis.suggestedCircuitBreakerConfig && (
                <div className="bg-slate-950 p-3 rounded-lg border border-indigo-900/60 font-mono text-xs text-slate-300 space-y-1">
                  <div className="text-indigo-400 font-bold">Suggested Circuit Breaker Policy:</div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Target Fallback:</span>
                    <span className="text-slate-200">{aiAnalysis.suggestedCircuitBreakerConfig.targetFallbackModel || 'OpenAI GPT-4o Mini'}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Rate Limit:</span>
                    <span className="text-slate-200">{aiAnalysis.suggestedCircuitBreakerConfig.rateLimitRps ?? 10} RPS</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Slack Notification:</span>
                    <span className="text-slate-200">{aiAnalysis.suggestedCircuitBreakerConfig.notifySlackChannel || '#ops-alerts-critical'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Circuit Breaker Execution Output Terminal Log */}
      {circuitBreakerLog && (
        <div className="bg-slate-950 border border-rose-800/60 rounded-xl p-4 font-mono text-xs space-y-3 shadow-2xl">
          <div className="flex items-center justify-between text-rose-400 border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span className="font-bold">Automated Circuit Breaker Failover Output Log</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Executed: {circuitBreakerLog.executedAt}
            </span>
          </div>

          <div className="text-emerald-400 text-xs">
            [STATUS]: {circuitBreakerLog.status} - {circuitBreakerLog.message}
          </div>

          <div className="bg-slate-900 p-3 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
            <pre className="text-slate-400">
              {JSON.stringify(circuitBreakerLog.payloadReceived, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
