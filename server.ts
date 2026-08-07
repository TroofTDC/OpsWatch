import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  initialApplications,
  initialServiceCatalog,
  initialCredentials,
  initialAlertRules,
  initialRenewalAuditLogs,
  generateUsageSnapshots,
  hourlyGeminiTokenData
} from './src/mockData.js';
import { ServiceCatalogItem, AlertRule, RenewalAuditLog, CredentialsRegistryItem, Application } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// In-memory data persistence store
let applicationsStore: Application[] = [...initialApplications];
let serviceCatalogStore: ServiceCatalogItem[] = [...initialServiceCatalog];
let credentialsStore: CredentialsRegistryItem[] = [...initialCredentials];
let alertRulesStore: AlertRule[] = [...initialAlertRules];
let auditLogsStore: RenewalAuditLog[] = [...initialRenewalAuditLogs];
const usageSnapshotsStore = generateUsageSnapshots();

// Helper: calculate Runway days
function computeServiceMetrics(service: ServiceCatalogItem): ServiceCatalogItem {
  let runwayDays: number | null = null;
  if (service.dailyBurnRate > 0 && service.remainingBalance !== null && service.remainingBalance !== undefined) {
    runwayDays = Math.max(0, Number((service.remainingBalance / service.dailyBurnRate).toFixed(1)));
  }
  return {
    ...service,
    runwayDays,
  };
}

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e) {
      console.warn('Gemini client initialization warning:', e);
    }
  }
  return aiClient;
}

// ==================== API ENDPOINTS ====================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    serviceCount: serviceCatalogStore.length,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Service Catalog
app.get('/api/services', (req, res) => {
  const computed = serviceCatalogStore.map(computeServiceMetrics);
  res.json(computed);
});

app.post('/api/services', (req, res) => {
  const newItem: ServiceCatalogItem = {
    id: `srv-${Date.now()}`,
    providerName: req.body.providerName || 'Custom Provider',
    serviceName: req.body.serviceName || 'New Service',
    billingCategory: req.body.billingCategory || 'Cloud Service',
    linkedAppId: req.body.linkedAppId || null,
    billingModel: req.body.billingModel || 'Pay-As-You-Go',
    renewalDate: req.body.renewalDate || null,
    autoRenewal: req.body.autoRenewal ?? true,
    paymentMethodLast4: req.body.paymentMethodLast4 || '0000',
    paymentCardExpiry: req.body.paymentCardExpiry || '2027-12',
    remainingBalance: Number(req.body.remainingBalance) || 0,
    dailyBurnRate: Number(req.body.dailyBurnRate) || 0,
    status: req.body.status || 'Healthy',
    dependencyCriticality: req.body.dependencyCriticality || 'Medium',
    updatedAt: new Date().toISOString(),
  };
  serviceCatalogStore.unshift(newItem);
  res.status(201).json(computeServiceMetrics(newItem));
});

app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const index = serviceCatalogStore.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }

  serviceCatalogStore[index] = {
    ...serviceCatalogStore[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json(computeServiceMetrics(serviceCatalogStore[index]));
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  serviceCatalogStore = serviceCatalogStore.filter(s => s.id !== id);
  res.json({ success: true, id });
});

// 3. Applications
app.get('/api/applications', (req, res) => {
  res.json(applicationsStore);
});

app.post('/api/applications', (req, res) => {
  const newApp: Application = {
    id: `app-${Date.now()}`,
    name: req.body.name,
    description: req.body.description || '',
    ownerEmail: req.body.ownerEmail || 'ops@company.io',
    createdAt: new Date().toISOString(),
  };
  applicationsStore.unshift(newApp);
  res.status(201).json(newApp);
});

// 4. Credentials Registry
app.get('/api/credentials', (req, res) => {
  const now = new Date().getTime();
  const enhanced = credentialsStore.map(cred => {
    const rotatedTime = new Date(cred.lastRotated).getTime();
    const ageDays = Math.floor((now - rotatedTime) / (1000 * 60 * 60 * 24));
    return {
      ...cred,
      credentialAgeDays: ageDays,
      isOverdue: ageDays > cred.rotationIntervalDays,
    };
  });
  res.json(enhanced);
});

app.post('/api/credentials/rotate', (req, res) => {
  const { id } = req.body;
  const index = credentialsStore.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Credential not found' });
  }
  const updated = {
    ...credentialsStore[index],
    lastRotated: new Date().toISOString(),
    lastVerified: new Date().toISOString(),
  };
  credentialsStore[index] = updated;
  res.json(updated);
});

// 5. Telemetry & Snapshots
app.get('/api/telemetry', (req, res) => {
  res.json({
    snapshots: usageSnapshotsStore,
    hourlyGeminiTokenData: hourlyGeminiTokenData,
  });
});

// 6. Denial-of-Wallet (DoW) Anomaly Engine
app.get('/api/dow-analysis', (req, res) => {
  // Compute token acceleration comparison: current 18:00 token count (3,900,000) vs 12h moving average (610,000)
  const currentHourlyTokens = 3900000;
  const ma12h = 610000;
  const thresholdPct = 2.0; // 200% spike threshold
  const spikeRatio = (currentHourlyTokens - ma12h) / ma12h;
  const spikePercentage = Math.round(spikeRatio * 100);
  const isDoWSpike = currentHourlyTokens > ma12h * (1 + thresholdPct);

  res.json({
    serviceId: 'srv-gemini-01',
    serviceName: 'Gemini 3.6 Flash & Live API',
    currentHourlyTokens,
    ma12h,
    spikePercentage, // +539%
    isDoWSpike,
    thresholdPct: thresholdPct * 100,
    anomalyDetails: isDoWSpike
      ? `CRITICAL DoW ALERT: Hourly token consumption (${currentHourlyTokens.toLocaleString()}) exceeded 12-hour baseline (${ma12h.toLocaleString()}) by +${spikePercentage}%. Possible automated loop or Denial-of-Wallet attack.`
      : 'Token consumption within normal moving average envelope.',
  });
});

// 7. Alert Rules & Circuit Breaker Execution
app.get('/api/alerts', (req, res) => {
  res.json(alertRulesStore);
});

app.post('/api/alerts', (req, res) => {
  const newRule: AlertRule = {
    id: `rule-${Date.now()}`,
    serviceId: req.body.serviceId,
    serviceName: req.body.serviceName,
    conditionType: req.body.conditionType,
    thresholdValue: Number(req.body.thresholdValue),
    urgencyTier: req.body.urgencyTier || 'P2-High',
    channels: req.body.channels || ['Slack', 'Email'],
    fallbackWebhookUrl: req.body.fallbackWebhookUrl || '/api/circuit-breaker/failover',
    fallbackPayload: req.body.fallbackPayload || '{}',
    isActive: req.body.isActive ?? true,
    lastTriggered: null,
  };
  alertRulesStore.unshift(newRule);
  res.status(201).json(newRule);
});

app.post('/api/circuit-breaker/test', (req, res) => {
  const { ruleId } = req.body;
  const rule = alertRulesStore.find(r => r.id === ruleId);
  if (rule) {
    rule.lastTriggered = new Date().toISOString();
  }

  // Simulate execution of containment webhook
  res.json({
    success: true,
    executedAt: new Date().toISOString(),
    ruleId,
    targetWebhook: rule?.fallbackWebhookUrl || '/api/circuit-breaker/failover',
    status: 'CIRCUIT_BREAKER_TRIGGERED',
    message: 'Failover payload dispatched successfully. Model fallback routing activated, traffic throttled to 10 RPS.',
    payloadReceived: rule ? JSON.parse(rule.fallbackPayload || '{}') : {},
  });
});

// 8. Renewal Audit Sign-off
app.get('/api/audit', (req, res) => {
  res.json(auditLogsStore);
});

app.post('/api/audit/signoff', (req, res) => {
  const { serviceId, operatorName, transactionAmount, receiptUrl, newExpiry, complianceNotes } = req.body;

  const service = serviceCatalogStore.find(s => s.id === serviceId);
  const previousExpiry = service?.renewalDate || 'N/A';

  if (service) {
    service.renewalDate = newExpiry;
    service.status = 'Healthy';
    if (transactionAmount > 0 && service.remainingBalance !== null) {
      service.remainingBalance += Number(transactionAmount);
    }
    service.updatedAt = new Date().toISOString();
  }

  const newLog: RenewalAuditLog = {
    id: `log-${Date.now()}`,
    serviceId,
    serviceName: service?.serviceName || 'Unknown Service',
    signoffTimestamp: new Date().toISOString(),
    operatorName: operatorName || 'Ops Manager',
    transactionAmount: Number(transactionAmount) || 0,
    receiptUrl: receiptUrl || 'https://storage.googleapis.com/opswatch-receipts/receipt.pdf',
    previousExpiry,
    newExpiry,
    complianceNotes: complianceNotes || 'Manual renewal sign-off verified.',
  };

  auditLogsStore.unshift(newLog);
  res.status(201).json(newLog);
});

// 9. Gemini AI SOC Analysis Endpoint
app.post('/api/ai-soc/analyze', async (req, res) => {
  try {
    const { serviceName, status, remainingBalance, dailyBurnRate, runwayDays, tokenSpikePct, alertCondition } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        summary: `OpsWatch AI SOC automated evaluation for ${serviceName || 'Infrastructure Service'}.`,
        rootCauseDiagnosis: `High burn rate ($${dailyBurnRate}/day) has reduced prepaid Runway to ${runwayDays ?? 'N/A'} days. ${tokenSpikePct ? `Spike of +${tokenSpikePct}% detected.` : ''}`,
        incidentSeverity: status === 'Critical' ? 'CRITICAL' : 'HIGH',
        immediatePlaybookActions: [
          'Inspect application log gateway for unthrottled loop calls',
          'Verify current API key permissions and enforce rate limiting (10 RPS)',
          'Trigger circuit breaker failover to standby secondary provider'
        ],
        suggestedCircuitBreakerConfig: {
          targetFallbackModel: 'OpenAI GPT-4o Mini',
          rateLimitRps: 10,
          pauseService: false,
          notifySlackChannel: '#ops-alerts-critical'
        }
      });
    }

    const prompt = `You are OpsWatch AI SOC (Security & Operations Control Tower).
Analyze this multi-cloud infrastructure & API service telemetry:
- Service Name: ${serviceName}
- Status: ${status}
- Remaining Balance: $${remainingBalance}
- Daily Burn Rate: $${dailyBurnRate}/day
- Estimated Runway: ${runwayDays} days
- Token Consumption Spike: ${tokenSpikePct ? `+${tokenSpikePct}%` : 'Normal'}
- Active Trigger Condition: ${alertCondition || 'High Burn / Depleted Balance'}

Please provide a structured JSON response with:
1. "summary": Concise operational summary (2 sentences)
2. "rootCauseDiagnosis": Deep technical root-cause analysis (e.g. unhandled retry loop, Denial-of-Wallet prompt flood, expired card on file)
3. "incidentSeverity": "CRITICAL" | "HIGH" | "WARNING" | "INFO"
4. "immediatePlaybookActions": Array of 3 step-by-step mitigation actions
5. "suggestedCircuitBreakerConfig": Object containing targetFallbackModel, rateLimitRps, pauseService (boolean), and notifySlackChannel.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    return res.json(parsed);
  } catch (err: any) {
    console.error('AI SOC analysis error:', err);
    return res.json({
      summary: 'OpsWatch AI SOC Automated Incident Assessment',
      rootCauseDiagnosis: 'Automated telemetry rule flagged abnormal spend acceleration and potential credential depletion.',
      incidentSeverity: 'HIGH',
      immediatePlaybookActions: [
        'Enforce strict token rate limits via Envoy/Express gateway',
        'Top up prepaid credit balance via Finance portal',
        'Verify credential age and rotate access secrets'
      ],
      suggestedCircuitBreakerConfig: {
        targetFallbackModel: 'Standby Gateway Model',
        rateLimitRps: 15,
        pauseService: false,
        notifySlackChannel: '#ops-alerts'
      }
    });
  }
});

// Vite Middleware for development / Static file serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OpsWatch Control Tower server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
