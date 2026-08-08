import React, { useState } from 'react';
import { ServiceCatalogItem, UserRole, Application } from '../types';
import {
  Server,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  MoreVertical,
  ExternalLink,
  ShieldAlert,
  Download,
  Trash2,
  Edit
} from 'lucide-react';

interface ServiceCatalogTableProps {
  services: ServiceCatalogItem[];
  applications: Application[];
  userRole: UserRole;
  onOpenAddModal: () => void;
  onOpenEditModal: (service: ServiceCatalogItem) => void;
  onOpenRenewalModal: (service: ServiceCatalogItem) => void;
  onDeleteService: (id: string) => void;
  onTriggerTestCircuitBreaker: (serviceId: string) => void;
}

export const ServiceCatalogTable: React.FC<ServiceCatalogTableProps> = ({
  services,
  applications,
  userRole,
  onOpenAddModal,
  onOpenEditModal,
  onOpenRenewalModal,
  onDeleteService,
  onTriggerTestCircuitBreaker,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBillingModel, setSelectedBillingModel] = useState<string>('ALL');

  // Filter options
  const providers = Array.from(new Set(services.map(s => s.providerName)));

  const filteredServices = services.filter(service => {
    const matchesSearch =
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.billingCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvider = selectedProvider === 'ALL' || service.providerName === selectedProvider;
    const matchesStatus = selectedStatus === 'ALL' || service.status === selectedStatus;
    const matchesBilling = selectedBillingModel === 'ALL' || service.billingModel === selectedBillingModel;

    return matchesSearch && matchesProvider && matchesStatus && matchesBilling;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
            <CheckCircle2 className="h-3 w-3" /> Healthy
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-700/50">
            <AlertTriangle className="h-3 w-3" /> Warning
          </span>
        );
      case 'Critical':
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-700/50 animate-pulse">
            <XCircle className="h-3 w-3" /> {status}
          </span>
        );
      default:
        return null;
    }
  };

  const getCriticalityBadge = (criticality: string) => {
    switch (criticality) {
      case 'High':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800">HIGH</span>;
      case 'Medium':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800">MED</span>;
      case 'Low':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">LOW</span>;
      default:
        return null;
    }
  };

  const exportCSV = () => {
    const headers = ['Provider', 'Service Name', 'Billing Model', 'Remaining Balance ($)', 'Daily Burn ($/day)', 'Runway (Days)', 'Status', 'Renewal Date', 'Payment Card Expiry'];
    const rows = filteredServices.map(s => [
      s.providerName,
      s.serviceName,
      s.billingModel,
      s.remainingBalance,
      s.dailyBurnRate,
      s.runwayDays ?? 'N/A',
      s.status,
      s.renewalDate ?? 'N/A',
      s.paymentCardExpiry ?? 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `opswatch_service_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search multi-cloud services, providers, or billing categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-slate-900">All Providers</option>
              {providers.map(p => (
                <option key={p} value={p} className="bg-slate-900">{p}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Statuses</option>
            <option value="Healthy" className="bg-slate-900">Healthy</option>
            <option value="Warning" className="bg-slate-900">Warning</option>
            <option value="Critical" className="bg-slate-900">Critical</option>
          </select>

          {/* Billing Model Filter */}
          <select
            value={selectedBillingModel}
            onChange={(e) => setSelectedBillingModel(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Billing Models</option>
            <option value="Pay-As-You-Go" className="bg-slate-900">Pay-As-You-Go</option>
            <option value="Monthly Recurring" className="bg-slate-900">Monthly Recurring</option>
            <option value="Annual Pre-paid" className="bg-slate-900">Annual Pre-paid</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            title="Export filtered catalog to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Add Service Button (Super Admin) */}
          {userRole === 'Super Admin / Ops Lead' && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-950 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Service</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Service Catalog Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Service & Provider</th>
                <th className="py-3 px-4">Billing Category</th>
                <th className="py-3 px-4">Model & Card</th>
                <th className="py-3 px-4 text-right">Prepaid Balance ($)</th>
                <th className="py-3 px-4 text-right">Daily Burn ($/day)</th>
                <th className="py-3 px-4">Runway ($R)</th>
                <th className="py-3 px-4">Status & Renewal</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                    No services found matching current search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredServices.map(service => {
                  const linkedApp = applications.find(a => a.id === service.linkedAppId);
                  const isLowRunway = service.runwayDays !== null && service.runwayDays !== undefined && service.runwayDays <= 7 && service.dailyBurnRate > 0;
                  const isCardExpiring = service.paymentCardExpiry && service.paymentCardExpiry <= '2026-08';

                  return (
                    <tr
                      key={service.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        service.status === 'Critical' ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Service & Provider */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          {service.serviceName}
                          {getCriticalityBadge(service.dependencyCriticality)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                          <span>{service.providerName}</span>
                          {linkedApp && (
                            <span className="text-cyan-400/80 bg-cyan-950/50 px-1.5 py-0.2 rounded border border-cyan-800/40">
                              App: {linkedApp.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {service.billingCategory}
                      </td>

                      {/* Model & Payment Card */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-200">{service.billingModel}</div>
                        <div className="text-[11px] font-mono flex items-center gap-1 mt-0.5">
                          <CreditCard className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-400">•••• {service.paymentMethodLast4}</span>
                          {isCardExpiring ? (
                            <span className="text-amber-400 font-bold bg-amber-950/80 px-1 py-0.2 rounded text-[10px] border border-amber-700/50">
                              Exp: {service.paymentCardExpiry}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">({service.paymentCardExpiry})</span>
                          )}
                        </div>
                      </td>

                      {/* Remaining Balance */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                        ${service.remainingBalance.toFixed(2)}
                      </td>

                      {/* Daily Burn Rate */}
                      <td className="py-3.5 px-4 text-right font-mono text-amber-400 font-semibold">
                        ${service.dailyBurnRate.toFixed(2)}
                      </td>

                      {/* Runway Days */}
                      <td className="py-3.5 px-4">
                        {service.runwayDays !== null && service.runwayDays !== undefined ? (
                          <div className="font-mono">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-xs ${
                                service.runwayDays <= 3
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                                  : service.runwayDays <= 7
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {service.runwayDays} Days
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-slate-500">Continuous</span>
                        )}
                      </td>

                      {/* Status & Renewal */}
                      <td className="py-3.5 px-4">
                        <div>{getStatusBadge(service.status)}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>Renewal: {service.renewalDate || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Sign Off Renewal (Admin / Finance) */}
                          {(userRole === 'Super Admin / Ops Lead' || userRole === 'Finance / Accounts') && (
                            <button
                              onClick={() => onOpenRenewalModal(service)}
                              className="p-1.5 bg-slate-800 hover:bg-emerald-950 text-emerald-400 border border-slate-700 hover:border-emerald-600 rounded text-xs transition-colors"
                              title="Record Renewal Sign-Off / Top-Up"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Circuit Breaker Test Trigger */}
                          <button
                            onClick={() => onTriggerTestCircuitBreaker(service.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 border border-slate-700 hover:border-rose-600 rounded text-xs transition-colors"
                            title="Test Circuit Breaker Webhook Failover"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit / Delete (Super Admin) */}
                          {userRole === 'Super Admin / Ops Lead' && (
                            <>
                              <button
                                onClick={() => onOpenEditModal(service)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded text-xs transition-colors"
                                title="Edit Service Details"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => onDeleteService(service.id)}
                                className="p-1.5 bg-slate-800 hover:bg-rose-900 text-rose-400 border border-slate-700 rounded text-xs transition-colors"
                                title="Remove Service from Catalog"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
