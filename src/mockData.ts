import { Application, ServiceCatalogItem, CredentialsRegistryItem, UsageSnapshot, AlertRule, RenewalAuditLog } from './types';

export const initialApplications: Application[] = [
  {
    id: 'app-01',
    name: 'AI Customer Assistant',
    description: 'Generative AI agent powering real-time customer support chat and ticketing.',
    ownerEmail: 'sarah.ops@company.io',
    createdAt: '2025-11-10T08:00:00Z',
  },
  {
    id: 'app-02',
    name: 'Core Data Pipeline',
    description: 'High-throughput event processing and multi-cloud database sync engine.',
    ownerEmail: 'alex.data@company.io',
    createdAt: '2025-09-01T10:30:00Z',
  },
  {
    id: 'app-03',
    name: 'Customer Portal & Dashboard',
    description: 'Primary customer web application hosted on Cloud Run with global CDN.',
    ownerEmail: 'devops-lead@company.io',
    createdAt: '2025-06-15T14:20:00Z',
  },
  {
    id: 'app-04',
    name: 'Transactional Relay Service',
    description: 'Twilio & SendGrid integration layer for OTPs, invoices, and system alerts.',
    ownerEmail: 'marcus.eng@company.io',
    createdAt: '2026-01-20T11:00:00Z',
  },
];

export const initialServiceCatalog: ServiceCatalogItem[] = [
  {
    id: 'srv-gemini-01',
    providerName: 'Gemini AI API',
    serviceName: 'Gemini 3.6 Flash & Live API',
    billingCategory: 'AI Model API',
    linkedAppId: 'app-01',
    billingModel: 'Pay-As-You-Go',
    renewalDate: '2026-09-01',
    autoRenewal: true,
    paymentMethodLast4: '4821',
    paymentCardExpiry: '2027-11',
    remainingBalance: 145.50, // prepaid balance depleted fast!
    dailyBurnRate: 68.40, // high burn rate due to DoW spike
    status: 'Critical',
    dependencyCriticality: 'High',
    updatedAt: '2026-08-07T03:30:00Z',
  },
  {
    id: 'srv-gcp-01',
    providerName: 'Google Cloud Platform',
    serviceName: 'GCP Cloud Run & Cloud SQL',
    billingCategory: 'Cloud Compute & DB',
    linkedAppId: 'app-03',
    billingModel: 'Monthly Recurring',
    renewalDate: '2026-08-31',
    autoRenewal: true,
    paymentMethodLast4: '4821',
    paymentCardExpiry: '2027-11',
    remainingBalance: 3200.00,
    dailyBurnRate: 112.50,
    status: 'Healthy',
    dependencyCriticality: 'High',
    updatedAt: '2026-08-07T02:15:00Z',
  },
  {
    id: 'srv-twilio-01',
    providerName: 'Twilio Inc.',
    serviceName: 'Programmable SMS & Voice Relay',
    billingCategory: 'Communication APIs',
    linkedAppId: 'app-04',
    billingModel: 'Pay-As-You-Go',
    renewalDate: null,
    autoRenewal: false,
    paymentMethodLast4: '9012',
    paymentCardExpiry: '2026-08', // Card expiring this month!
    remainingBalance: 18.20, // Very low balance!
    dailyBurnRate: 14.30,
    status: 'Warning',
    dependencyCriticality: 'High',
    updatedAt: '2026-08-07T01:00:00Z',
  },
  {
    id: 'srv-aws-01',
    providerName: 'Amazon Web Services',
    serviceName: 'AWS S3 Asset Storage & CloudFront',
    billingCategory: 'Object Storage & CDN',
    linkedAppId: 'app-02',
    billingModel: 'Pay-As-You-Go',
    renewalDate: '2026-08-31',
    autoRenewal: true,
    paymentMethodLast4: '4821',
    paymentCardExpiry: '2027-11',
    remainingBalance: 1850.00,
    dailyBurnRate: 28.10,
    status: 'Healthy',
    dependencyCriticality: 'Medium',
    updatedAt: '2026-08-06T18:00:00Z',
  },
  {
    id: 'srv-domain-01',
    providerName: 'Namecheap / Cloudflare',
    serviceName: 'Domain: opswatch-control.io & SSL',
    billingCategory: 'DNS & Domains',
    linkedAppId: 'app-03',
    billingModel: 'Annual Pre-paid',
    renewalDate: '2026-08-14', // Expiring in 7 days!
    autoRenewal: false,
    paymentMethodLast4: '3341',
    paymentCardExpiry: '2028-05',
    remainingBalance: 0.00,
    dailyBurnRate: 0.15,
    status: 'Warning',
    dependencyCriticality: 'High',
    updatedAt: '2026-08-07T00:00:00Z',
  },
  {
    id: 'srv-openai-01',
    providerName: 'OpenAI',
    serviceName: 'OpenAI GPT-4o Fallback Endpoint',
    billingCategory: 'AI Model API',
    linkedAppId: 'app-01',
    billingModel: 'Pay-As-You-Go',
    renewalDate: null,
    autoRenewal: true,
    paymentMethodLast4: '4821',
    paymentCardExpiry: '2027-11',
    remainingBalance: 450.00,
    dailyBurnRate: 8.50,
    status: 'Healthy',
    dependencyCriticality: 'Low',
    updatedAt: '2026-08-06T12:00:00Z',
  },
  {
    id: 'srv-sendgrid-01',
    providerName: 'SendGrid / Twilio',
    serviceName: 'Transactional Email Gateway',
    billingCategory: 'Communication APIs',
    linkedAppId: 'app-04',
    billingModel: 'Monthly Recurring',
    renewalDate: '2026-08-25',
    autoRenewal: true,
    paymentMethodLast4: '9012',
    paymentCardExpiry: '2026-08', // Card expiring this month
    remainingBalance: 120.00,
    dailyBurnRate: 4.20,
    status: 'Warning',
    dependencyCriticality: 'Medium',
    updatedAt: '2026-08-05T09:00:00Z',
  },
];

export const initialCredentials: CredentialsRegistryItem[] = [
  {
    id: 'cred-01',
    serviceId: 'srv-gemini-01',
    serviceName: 'Gemini 3.6 Flash & Live API',
    vaultSecretPath: '/secrets/opswatch/gemini_api_key',
    accessScopes: ['generative-ai.predict', 'live-stream.connect'],
    rotationIntervalDays: 60,
    lastRotated: '2026-05-10T10:00:00Z', // 89 days ago -> OVERDUE
    lastVerified: '2026-08-07T04:00:00Z',
  },
  {
    id: 'cred-02',
    serviceId: 'srv-gcp-01',
    serviceName: 'GCP Cloud Run & Cloud SQL',
    vaultSecretPath: '/secrets/opswatch/gcp_sa_key.json',
    accessScopes: ['roles/viewer', 'roles/billing.viewer'],
    rotationIntervalDays: 90,
    lastRotated: '2026-06-01T12:00:00Z',
    lastVerified: '2026-08-07T03:00:00Z',
  },
  {
    id: 'cred-03',
    serviceId: 'srv-twilio-01',
    serviceName: 'Programmable SMS & Voice Relay',
    vaultSecretPath: '/secrets/opswatch/twilio_auth_token',
    accessScopes: ['sms.send', 'voice.originate'],
    rotationIntervalDays: 90,
    lastRotated: '2026-04-15T09:30:00Z', // 114 days ago -> OVERDUE
    lastVerified: '2026-08-06T19:00:00Z',
  },
  {
    id: 'cred-04',
    serviceId: 'srv-aws-01',
    serviceName: 'AWS S3 Asset Storage & CloudFront',
    vaultSecretPath: '/secrets/opswatch/aws_iam_access_key',
    accessScopes: ['s3:GetObject', 'cloudfront:GetDistribution'],
    rotationIntervalDays: 180,
    lastRotated: '2026-03-01T15:00:00Z',
    lastVerified: '2026-08-07T00:00:00Z',
  },
];

export const initialAlertRules: AlertRule[] = [
  {
    id: 'rule-dow-01',
    serviceId: 'srv-gemini-01',
    serviceName: 'Gemini 3.6 Flash & Live API',
    conditionType: 'DenialOfWalletSpike',
    thresholdValue: 200, // 200% spike over 12h moving average
    urgencyTier: 'P1-Critical',
    channels: ['Slack', 'PagerDuty', 'Webhook'],
    fallbackWebhookUrl: '/api/circuit-breaker/failover',
    fallbackPayload: JSON.stringify({
      action: 'SWITCH_MODEL_FALLBACK',
      primaryProvider: 'Gemini 3.6 Flash',
      fallbackProvider: 'OpenAI GPT-4o Mini',
      enforceRateLimitRps: 10,
      reason: 'Denial-of-Wallet token acceleration detected (>200% baseline)'
    }, null, 2),
    isActive: true,
    lastTriggered: '2026-08-07T03:15:00Z',
  },
  {
    id: 'rule-balance-01',
    serviceId: 'srv-gemini-01',
    serviceName: 'Gemini 3.6 Flash & Live API',
    conditionType: 'CreditBelowThreshold',
    thresholdValue: 200.00, // $200 threshold
    urgencyTier: 'P1-Critical',
    channels: ['Slack', 'Email'],
    fallbackWebhookUrl: '/api/circuit-breaker/topup-request',
    fallbackPayload: JSON.stringify({
      action: 'REQUEST_FINANCE_TOPUP',
      targetAmount: 1000.00,
      urgency: 'HIGH'
    }, null, 2),
    isActive: true,
    lastTriggered: '2026-08-06T18:00:00Z',
  },
  {
    id: 'rule-twilio-01',
    serviceId: 'srv-twilio-01',
    serviceName: 'Programmable SMS & Voice Relay',
    conditionType: 'CreditBelowThreshold',
    thresholdValue: 50.00,
    urgencyTier: 'P2-High',
    channels: ['Slack', 'SMS'],
    fallbackWebhookUrl: '/api/circuit-breaker/sms-fallback',
    fallbackPayload: JSON.stringify({
      action: 'ROUTE_TO_BACKUP_SMS',
      primary: 'Twilio',
      secondary: 'AWS SNS',
    }, null, 2),
    isActive: true,
    lastTriggered: '2026-08-07T01:00:00Z',
  },
  {
    id: 'rule-expiry-01',
    serviceId: 'srv-domain-01',
    serviceName: 'Domain: opswatch-control.io & SSL',
    conditionType: 'DaysBeforeExpiry',
    thresholdValue: 14, // 14 days before expiry
    urgencyTier: 'P2-High',
    channels: ['Email', 'Slack'],
    fallbackWebhookUrl: '/api/circuit-breaker/auto-renew-trigger',
    fallbackPayload: JSON.stringify({
      action: 'RENEW_DOMAIN_REGISTRATION',
      domain: 'opswatch-control.io',
      termYears: 1
    }, null, 2),
    isActive: true,
    lastTriggered: '2026-08-01T00:00:00Z',
  },
  {
    id: 'rule-rotation-01',
    serviceId: 'srv-gemini-01',
    serviceName: 'Gemini 3.6 Flash & Live API',
    conditionType: 'CredentialAgeExceeded',
    thresholdValue: 60, // 60 days max age
    urgencyTier: 'P3-Medium',
    channels: ['Slack'],
    fallbackWebhookUrl: '/api/circuit-breaker/rotate-vault-key',
    fallbackPayload: JSON.stringify({
      action: 'SCHEDULE_KEY_ROTATION',
      secretPath: '/secrets/opswatch/gemini_api_key'
    }, null, 2),
    isActive: true,
    lastTriggered: '2026-07-10T10:00:00Z',
  }
];

export const initialRenewalAuditLogs: RenewalAuditLog[] = [
  {
    id: 'log-01',
    serviceId: 'srv-gcp-01',
    serviceName: 'GCP Cloud Run & Cloud SQL',
    signoffTimestamp: '2026-07-31T16:45:00Z',
    operatorName: 'Alex Rivers (Ops Lead)',
    transactionAmount: 3450.00,
    receiptUrl: 'https://storage.googleapis.com/opswatch-receipts/2026-07-gcp-invoice.pdf',
    previousExpiry: '2026-07-31',
    newExpiry: '2026-08-31',
    complianceNotes: 'Monthly Cloud Run & PostgreSQL committed use discount verification completed.',
  },
  {
    id: 'log-02',
    serviceId: 'srv-openai-01',
    serviceName: 'OpenAI GPT-4o Fallback Endpoint',
    signoffTimestamp: '2026-07-15T10:20:00Z',
    operatorName: 'Sarah Jenkins (Finance)',
    transactionAmount: 500.00,
    receiptUrl: 'https://storage.googleapis.com/opswatch-receipts/2026-07-openai-topup.pdf',
    previousExpiry: '2026-07-15',
    newExpiry: '2026-09-15',
    complianceNotes: 'Prepaid API balance top-up approved by Finance Dept.',
  },
];

// Helper to generate 30 days of telemetry
export function generateUsageSnapshots(): UsageSnapshot[] {
  const snapshots: UsageSnapshot[] = [];
  const today = new Date('2026-08-07');

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Gemini API - Shows a sudden spike in recent 3 days due to DoW simulation
    const isSpikeDay = i <= 2; // last 3 days
    const geminiTokens = isSpikeDay ? Math.floor(18500000 + Math.random() * 5000000) : Math.floor(4200000 + Math.random() * 1200000);
    const geminiCost = isSpikeDay ? Number((68.40 + Math.random() * 15).toFixed(2)) : Number((16.20 + Math.random() * 4).toFixed(2));
    const geminiBalance = Number((145.50 + i * 12.5).toFixed(2));

    snapshots.push({
      id: `snap-gemini-${dateStr}`,
      serviceId: 'srv-gemini-01',
      serviceName: 'Gemini 3.6 Flash & Live API',
      snapshotDate: dateStr,
      costAmount: geminiCost,
      tokenCount: geminiTokens,
      requestCount: Math.floor(geminiTokens / 450),
      creditBalance: geminiBalance,
    });

    // GCP
    snapshots.push({
      id: `snap-gcp-${dateStr}`,
      serviceId: 'srv-gcp-01',
      serviceName: 'Google Cloud Platform',
      snapshotDate: dateStr,
      costAmount: Number((112.50 + Math.random() * 10 - 5).toFixed(2)),
      tokenCount: 0,
      requestCount: Math.floor(140000 + Math.random() * 20000),
      creditBalance: 3200.00,
    });

    // AWS
    snapshots.push({
      id: `snap-aws-${dateStr}`,
      serviceId: 'srv-aws-01',
      serviceName: 'Amazon Web Services',
      snapshotDate: dateStr,
      costAmount: Number((28.10 + Math.random() * 4 - 2).toFixed(2)),
      tokenCount: 0,
      requestCount: Math.floor(85000 + Math.random() * 10000),
      creditBalance: 1850.00,
    });

    // Twilio
    snapshots.push({
      id: `snap-twilio-${dateStr}`,
      serviceId: 'srv-twilio-01',
      serviceName: 'Twilio Inc.',
      snapshotDate: dateStr,
      costAmount: Number((14.30 + Math.random() * 3).toFixed(2)),
      tokenCount: 0,
      requestCount: Math.floor(2800 + Math.random() * 600),
      creditBalance: Number((18.20 + i * 2.1).toFixed(2)),
    });
  }

  return snapshots;
}

// 24-hour token acceleration sample for Gemini (showing hourly spike)
export const hourlyGeminiTokenData = [
  { hour: '00:00', tokenCount: 180000, ma12h: 210000 },
  { hour: '02:00', tokenCount: 195000, ma12h: 205000 },
  { hour: '04:00', tokenCount: 160000, ma12h: 200000 },
  { hour: '06:00', tokenCount: 220000, ma12h: 200000 },
  { hour: '08:00', tokenCount: 450000, ma12h: 210000 },
  { hour: '10:00', tokenCount: 680000, ma12h: 230000 },
  { hour: '12:00', tokenCount: 920000, ma12h: 260000 },
  { hour: '14:00', tokenCount: 1450000, ma12h: 310000 }, // Spike starting
  { hour: '16:00', tokenCount: 2800000, ma12h: 420000 }, // Massive spike!
  { hour: '18:00', tokenCount: 3900000, ma12h: 610000 }, // 539% spike over 12h MA! (DoW Attack)
  { hour: '20:00', tokenCount: 3600000, ma12h: 880000 },
  { hour: '22:00', tokenCount: 2900000, ma12h: 1120000 },
];
