import React, { useState, useEffect } from 'react';
import {
  ServiceCatalogItem,
  Application,
  CredentialsRegistryItem,
  UsageSnapshot,
  AlertRule,
  RenewalAuditLog,
  DoWAnomalyResult,
  UserRole
} from './types';
import {
  fetchServices,
  fetchApplications,
  fetchCredentials,
  fetchTelemetry,
  fetchDoWAnalysis,
  fetchAlerts,
  fetchAuditLogs,
  createService,
  updateService,
  deleteService,
  rotateCredential,
  createApplication,
  createAlertRule,
  triggerCircuitBreakerTest,
  submitRenewalSignoff
} from './services/api';

import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { ServiceCatalogTable } from './components/ServiceCatalogTable';
import { DenialOfWalletSOC } from './components/DenialOfWalletSOC';
import { TelemetryAnalytics } from './components/TelemetryAnalytics';
import { CredentialsVault } from './components/CredentialsVault';
import { AlertRulesManager } from './components/AlertRulesManager';
import { ApplicationsView } from './components/ApplicationsView';
import { RenewalComplianceModal } from './components/RenewalComplianceModal';
import { AddServiceModal } from './components/AddServiceModal';

import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [userRole, setUserRole] = useState<UserRole>('Super Admin / Ops Lead');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data Stores
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [credentials, setCredentials] = useState<CredentialsRegistryItem[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<RenewalAuditLog[]>([]);
  const [snapshots, setSnapshots] = useState<UsageSnapshot[]>([]);
  const [hourlyTokenData, setHourlyTokenData] = useState<{ hour: string; tokenCount: number; ma12h: number }[]>([]);
  const [dowResult, setDowResult] = useState<DoWAnomalyResult | null>(null);

  // Modals
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);
  const [renewalModalService, setRenewalModalService] = useState<ServiceCatalogItem | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Data Load
  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [
        srvs,
        apps,
        creds,
        alrts,
        audits,
        telem,
        dow
      ] = await Promise.all([
        fetchServices(),
        fetchApplications(),
        fetchCredentials(),
        fetchAlerts(),
        fetchAuditLogs(),
        fetchTelemetry(),
        fetchDoWAnalysis()
      ]);

      setServices(srvs);
      setApplications(apps);
      setCredentials(creds);
      setAlertRules(alrts);
      setAuditLogs(audits);
      setSnapshots(telem.snapshots || []);
      setHourlyTokenData(telem.hourlyGeminiTokenData || []);
      setDowResult(dow);
    } catch (e) {
      console.error('Data sync error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleSaveService = async (data: Partial<ServiceCatalogItem>) => {
    if (data.id) {
      const updated = await updateService(data.id, data);
      setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast(`Service "${updated.serviceName}" updated successfully.`);
    } else {
      const created = await createService(data);
      setServices(prev => [created, ...prev]);
      showToast(`Service "${created.serviceName}" created.`);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Are you sure you want to remove this service from the catalog?')) {
      await deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      showToast('Service removed from catalog.');
    }
  };

  const handleRotateKey = async (id: string) => {
    const updated = await rotateCredential(id);
    setCredentials(prev => prev.map(c => c.id === updated.id ? updated : c));
    showToast(`Vault key for ${updated.vaultSecretPath} rotated and verified.`);
  };

  const handleAddApplication = async (appData: Partial<Application>) => {
    const created = await createApplication(appData);
    setApplications(prev => [created, ...prev]);
    showToast(`Application "${created.name}" registered.`);
  };

  const handleAddAlertRule = async (ruleData: Partial<AlertRule>) => {
    const created = await createAlertRule(ruleData);
    setAlertRules(prev => [created, ...prev]);
    showToast(`Alert rule created for ${created.serviceName}.`);
  };

  const handleTriggerCircuitBreaker = async (ruleIdOrServiceId: string) => {
    // Find matching rule
    const rule = alertRules.find(r => r.id === ruleIdOrServiceId || r.serviceId === ruleIdOrServiceId);
    const ruleIdToTrigger = rule ? rule.id : 'rule-dow-01';
    const res = await triggerCircuitBreakerTest(ruleIdToTrigger);
    showToast(`Circuit Breaker Dispatched: ${res.message}`);
    setActiveTab('dow-soc');
  };

  const handleSubmitRenewalSignoff = async (data: {
    serviceId: string;
    operatorName: string;
    transactionAmount: number;
    receiptUrl: string;
    newExpiry: string;
    complianceNotes: string;
  }) => {
    const newLog = await submitRenewalSignoff(data);
    setAuditLogs(prev => [newLog, ...prev]);
    // Refresh services to update renewal date and balance
    const updatedServices = await fetchServices();
    setServices(updatedServices);
    showToast(`Renewal sign-off recorded for transaction $${data.transactionAmount}.`);
  };

  const criticalAlertCount = services.filter(s => s.status === 'Critical').length + (dowResult?.isDoWSpike ? 1 : 0);

  const geminiService = services.find(s => s.id === 'srv-gemini-01');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onRefresh={loadAllData}
        isRefreshing={isRefreshing}
        criticalAlertCount={criticalAlertCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 font-mono text-xs animate-bounce">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <MetricsOverview
            services={services}
            credentials={credentials}
            alertRules={alertRules}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 2: Service Catalog */}
        {activeTab === 'services' && (
          <ServiceCatalogTable
            services={services}
            applications={applications}
            userRole={userRole}
            onOpenAddModal={() => { setEditingService(null); setIsAddServiceOpen(true); }}
            onOpenEditModal={(srv) => { setEditingService(srv); setIsAddServiceOpen(true); }}
            onOpenRenewalModal={(srv) => setRenewalModalService(srv)}
            onDeleteService={handleDeleteService}
            onTriggerTestCircuitBreaker={handleTriggerCircuitBreaker}
          />
        )}

        {/* Tab 3: DoW & AI SOC Control Tower */}
        {activeTab === 'dow-soc' && (
          <DenialOfWalletSOC
            dowResult={dowResult}
            hourlyData={hourlyTokenData}
            geminiService={geminiService}
          />
        )}

        {/* Tab 4: Telemetry & Runway */}
        {activeTab === 'telemetry' && (
          <TelemetryAnalytics
            snapshots={snapshots}
            services={services}
          />
        )}

        {/* Tab 5: Credentials Vault */}
        {activeTab === 'credentials' && (
          <CredentialsVault
            credentials={credentials}
            userRole={userRole}
            onRotateKey={handleRotateKey}
          />
        )}

        {/* Tab 6: Alert Rules & Circuit Breakers */}
        {activeTab === 'alerts' && (
          <AlertRulesManager
            alertRules={alertRules}
            services={services}
            userRole={userRole}
            onAddRule={handleAddAlertRule}
            onTestCircuitBreaker={handleTriggerCircuitBreaker}
          />
        )}

        {/* Tab 7: Applications Registry */}
        {activeTab === 'applications' && (
          <ApplicationsView
            applications={applications}
            services={services}
            userRole={userRole}
            onAddApplication={handleAddApplication}
          />
        )}

        {/* Tab 8: Compliance Audit Trail */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-lg font-bold text-slate-100">
                Renewal Compliance Audit Trail Logs
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Immutable operational sign-off history tracking card updates, invoice receipt uploads, and domain extension transactions.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Sign-Off Date</th>
                    <th className="py-3 px-4">Operator Name</th>
                    <th className="py-3 px-4">Target Service</th>
                    <th className="py-3 px-4 text-right">Amount ($)</th>
                    <th className="py-3 px-4">New Expiry</th>
                    <th className="py-3 px-4">Receipt / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {new Date(log.signoffTimestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {log.operatorName}
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-400">
                        {log.serviceName}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        ${log.transactionAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {log.newExpiry}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <div className="text-slate-300">{log.complianceNotes}</div>
                        <a
                          href={log.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-cyan-400 underline hover:text-cyan-300"
                        >
                          View Invoice Receipt
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Service Modal */}
      <AddServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        onSave={handleSaveService}
        applications={applications}
        editingService={editingService}
      />

      {/* Renewal Sign-Off Modal */}
      <RenewalComplianceModal
        service={renewalModalService}
        isOpen={!!renewalModalService}
        onClose={() => setRenewalModalService(null)}
        onSubmitSignoff={handleSubmitRenewalSignoff}
        auditLogs={auditLogs}
      />
    </div>
  );
}
