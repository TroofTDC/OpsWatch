import React, { useState } from 'react';
import { AlertRule, ServiceCatalogItem, UserRole, TriggerCondition, AlertChannel } from '../types';
import {
  BellRing,
  Plus,
  Zap,
  ShieldAlert,
  Terminal,
  CheckCircle2,
  Trash2,
  Edit2,
  Send,
  Webhook
} from 'lucide-react';

interface AlertRulesManagerProps {
  alertRules: AlertRule[];
  services: ServiceCatalogItem[];
  userRole: UserRole;
  onAddRule: (rule: Partial<AlertRule>) => void;
  onTestCircuitBreaker: (ruleId: string) => void;
}

export const AlertRulesManager: React.FC<AlertRulesManagerProps> = ({
  alertRules,
  services,
  userRole,
  onAddRule,
  onTestCircuitBreaker,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [conditionType, setConditionType] = useState<TriggerCondition>('DenialOfWalletSpike');
  const [thresholdValue, setThresholdValue] = useState(200);
  const [urgencyTier, setUrgencyTier] = useState<'P1-Critical' | 'P2-High' | 'P3-Medium' | 'P4-Low'>('P1-Critical');
  const [fallbackWebhookUrl, setFallbackWebhookUrl] = useState('/api/circuit-breaker/failover');
  const [fallbackPayload, setFallbackPayload] = useState(
    JSON.stringify({ action: 'SWITCH_MODEL_FALLBACK', fallbackProvider: 'OpenAI GPT-4o Mini', rateLimitRps: 10 }, null, 2)
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === selectedServiceId);
    onAddRule({
      serviceId: selectedServiceId,
      serviceName: service?.serviceName || 'Custom Service',
      conditionType,
      thresholdValue,
      urgencyTier,
      channels: ['Slack', 'Webhook', 'Email'],
      fallbackWebhookUrl,
      fallbackPayload,
      isActive: true,
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <BellRing className="h-6 w-6 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Alert Rules & Automated Circuit Breakers
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated incident containment rules triggering fallback webhooks, model failovers, and notification relays when critical limits are breached.
          </p>
        </div>

        {userRole === 'Super Admin / Ops Lead' && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>New Alert Rule</span>
          </button>
        )}
      </div>

      {/* Add New Rule Form */}
      {isAdding && (
        <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-amber-600/50 rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
            Configure New Circuit Breaker Alert Rule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.serviceName} ({s.providerName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Trigger Condition</label>
              <select
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value as TriggerCondition)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="DenialOfWalletSpike">DenialOfWalletSpike (+% Token Acceleration)</option>
                <option value="CreditBelowThreshold">CreditBelowThreshold (Remaining $ Balance)</option>
                <option value="DaysBeforeExpiry">DaysBeforeExpiry (Domain/Card Expiration)</option>
                <option value="CredentialAgeExceeded">CredentialAgeExceeded (Days since rotation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Threshold Value</label>
              <input
                type="number"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Urgency Tier</label>
              <select
                value={urgencyTier}
                onChange={(e) => setUrgencyTier(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="P1-Critical">P1-Critical</option>
                <option value="P2-High">P2-High</option>
                <option value="P3-Medium">P3-Medium</option>
                <option value="P4-Low">P4-Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Fallback Webhook Target URL</label>
              <input
                type="text"
                value={fallbackWebhookUrl}
                onChange={(e) => setFallbackWebhookUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Fallback JSON Switch Payload</label>
              <textarea
                value={fallbackPayload}
                onChange={(e) => setFallbackPayload(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs"
            >
              Save Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alertRules.map(rule => (
          <div
            key={rule.id}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  {rule.urgencyTier}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-2">{rule.serviceName}</h3>
              </div>

              <button
                onClick={() => onTestCircuitBreaker(rule.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-semibold transition-colors shrink-0"
              >
                <Zap className="h-3.5 w-3.5 text-rose-400" />
                <span>Test Webhook</span>
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Condition:</span>
                <span className="text-amber-400 font-semibold">{rule.conditionType}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Threshold:</span>
                <span className="text-slate-200">{rule.thresholdValue}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Channels:</span>
                <span className="text-slate-300">{rule.channels.join(', ')}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center space-x-1 text-slate-300 font-semibold">
                <Webhook className="h-3 w-3 text-cyan-400" />
                <span>Target: {rule.fallbackWebhookUrl}</span>
              </div>
              <pre className="text-slate-500 overflow-x-auto text-[10px]">
                {rule.fallbackPayload}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
