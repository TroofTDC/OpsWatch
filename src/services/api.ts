import {
  ServiceCatalogItem,
  Application,
  CredentialsRegistryItem,
  UsageSnapshot,
  AlertRule,
  RenewalAuditLog,
  DoWAnomalyResult,
  AISOCAnalysisRequest,
  AISOCAnalysisResponse
} from '../types';

export async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchServices(): Promise<ServiceCatalogItem[]> {
  const res = await fetch('/api/services');
  return res.json();
}

export async function createService(serviceData: Partial<ServiceCatalogItem>): Promise<ServiceCatalogItem> {
  const res = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData),
  });
  return res.json();
}

export async function updateService(id: string, updates: Partial<ServiceCatalogItem>): Promise<ServiceCatalogItem> {
  const res = await fetch(`/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteService(id: string): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchApplications(): Promise<Application[]> {
  const res = await fetch('/api/applications');
  return res.json();
}

export async function createApplication(appData: Partial<Application>): Promise<Application> {
  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appData),
  });
  return res.json();
}

export async function fetchCredentials(): Promise<CredentialsRegistryItem[]> {
  const res = await fetch('/api/credentials');
  return res.json();
}

export async function rotateCredential(id: string): Promise<CredentialsRegistryItem> {
  const res = await fetch('/api/credentials/rotate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

export async function fetchTelemetry(): Promise<{
  snapshots: UsageSnapshot[];
  hourlyGeminiTokenData: { hour: string; tokenCount: number; ma12h: number }[];
}> {
  const res = await fetch('/api/telemetry');
  return res.json();
}

export async function fetchDoWAnalysis(): Promise<DoWAnomalyResult> {
  const res = await fetch('/api/dow-analysis');
  return res.json();
}

export async function fetchAlerts(): Promise<AlertRule[]> {
  const res = await fetch('/api/alerts');
  return res.json();
}

export async function createAlertRule(ruleData: Partial<AlertRule>): Promise<AlertRule> {
  const res = await fetch('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ruleData),
  });
  return res.json();
}

export async function triggerCircuitBreakerTest(ruleId: string) {
  const res = await fetch('/api/circuit-breaker/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ruleId }),
  });
  return res.json();
}

export async function fetchAuditLogs(): Promise<RenewalAuditLog[]> {
  const res = await fetch('/api/audit');
  return res.json();
}

export async function submitRenewalSignoff(data: {
  serviceId: string;
  operatorName: string;
  transactionAmount: number;
  receiptUrl: string;
  newExpiry: string;
  complianceNotes: string;
}): Promise<RenewalAuditLog> {
  const res = await fetch('/api/audit/signoff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function analyzeWithAISOC(reqData: AISOCAnalysisRequest): Promise<AISOCAnalysisResponse> {
  const res = await fetch('/api/ai-soc/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqData),
  });
  return res.json();
}
