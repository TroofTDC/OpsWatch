export type BillingType = 'Monthly Recurring' | 'Pay-As-You-Go' | 'Annual Pre-paid' | 'Free Tier';
export type ServiceStatus = 'Healthy' | 'Warning' | 'Critical' | 'Expired';
export type DependencyCriticality = 'High' | 'Medium' | 'Low';
export type AlertChannel = 'Slack' | 'Email' | 'SMS' | 'PagerDuty' | 'Webhook';
export type TriggerCondition = 'DaysBeforeExpiry' | 'CreditBelowThreshold' | 'DailySpikePercentage' | 'CredentialAgeExceeded' | 'DenialOfWalletSpike';
export type UserRole = 'Super Admin / Ops Lead' | 'Developer / Engineer' | 'Finance / Accounts';

export interface Application {
  id: string;
  name: string;
  description: string;
  ownerEmail: string;
  createdAt: string;
}

export interface ServiceCatalogItem {
  id: string;
  providerName: string;
  serviceName: string;
  billingCategory: string;
  linkedAppId: string | null;
  billingModel: BillingType;
  renewalDate: string | null; // YYYY-MM-DD
  autoRenewal: boolean;
  paymentMethodLast4: string;
  paymentCardExpiry: string; // YYYY-MM
  remainingBalance: number;
  dailyBurnRate: number;
  status: ServiceStatus;
  dependencyCriticality: DependencyCriticality;
  updatedAt: string;
  // Dynamic calculated fields
  runwayDays?: number | null;
}

export interface CredentialsRegistryItem {
  id: string;
  serviceId: string;
  serviceName?: string;
  vaultSecretPath: string;
  accessScopes: string[];
  rotationIntervalDays: number;
  lastRotated: string;
  lastVerified: string;
  credentialAgeDays?: number;
  isOverdue?: boolean;
}

export interface UsageSnapshot {
  id: string;
  serviceId: string;
  serviceName?: string;
  snapshotDate: string; // YYYY-MM-DD
  costAmount: number;
  tokenCount: number;
  requestCount: number;
  creditBalance: number | null;
  hourlyTokenData?: { hour: string; tokenCount: number; ma12h: number }[];
}

export interface AlertRule {
  id: string;
  serviceId: string;
  serviceName?: string;
  conditionType: TriggerCondition;
  thresholdValue: number;
  urgencyTier: 'P1-Critical' | 'P2-High' | 'P3-Medium' | 'P4-Low';
  channels: AlertChannel[];
  fallbackWebhookUrl: string;
  fallbackPayload: string;
  isActive: boolean;
  lastTriggered?: string | null;
}

export interface RenewalAuditLog {
  id: string;
  serviceId: string;
  serviceName?: string;
  signoffTimestamp: string;
  operatorName: string;
  transactionAmount: number;
  receiptUrl: string;
  previousExpiry: string;
  newExpiry: string;
  complianceNotes: string;
}

export interface DoWAnomalyResult {
  serviceId: string;
  serviceName: string;
  currentHourlyTokens: number;
  ma12h: number;
  spikePercentage: number;
  isDoWSpike: boolean;
  thresholdPct: number;
  anomalyDetails: string;
}

export interface AISOCAnalysisRequest {
  serviceName: string;
  status: ServiceStatus;
  remainingBalance: number;
  dailyBurnRate: number;
  runwayDays: number | null;
  tokenSpikePct?: number;
  alertCondition?: string;
  recentCostTrend?: number[];
}

export interface AISOCAnalysisResponse {
  summary: string;
  rootCauseDiagnosis: string;
  incidentSeverity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  immediatePlaybookActions: string[];
  suggestedCircuitBreakerConfig: {
    targetFallbackModel?: string;
    rateLimitRps?: number;
    pauseService?: boolean;
    notifySlackChannel?: string;
  };
}
