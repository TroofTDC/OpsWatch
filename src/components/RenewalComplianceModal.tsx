import React, { useState } from 'react';
import { ServiceCatalogItem, RenewalAuditLog } from '../types';
import { FileCheck2, X, Upload, DollarSign, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

interface RenewalComplianceModalProps {
  service: ServiceCatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSignoff: (data: {
    serviceId: string;
    operatorName: string;
    transactionAmount: number;
    receiptUrl: string;
    newExpiry: string;
    complianceNotes: string;
  }) => void;
  auditLogs: RenewalAuditLog[];
}

export const RenewalComplianceModal: React.FC<RenewalComplianceModalProps> = ({
  service,
  isOpen,
  onClose,
  onSubmitSignoff,
  auditLogs,
}) => {
  if (!isOpen) return null;

  const [operatorName, setOperatorName] = useState('Alex Rivers (Ops Lead)');
  const [transactionAmount, setTransactionAmount] = useState(service ? service.dailyBurnRate * 30 : 500);
  const [receiptUrl, setReceiptUrl] = useState('https://storage.googleapis.com/opswatch-receipts/2026-08-invoice.pdf');
  const [newExpiry, setNewExpiry] = useState('2026-09-30');
  const [complianceNotes, setComplianceNotes] = useState('Manual verification of credit card renewal and invoice receipt upload completed.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;
    onSubmitSignoff({
      serviceId: service.id,
      operatorName,
      transactionAmount: Number(transactionAmount),
      receiptUrl,
      newExpiry,
      complianceNotes,
    });
    onClose();
  };

  const serviceLogs = auditLogs.filter(l => l.serviceId === service?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              Renewal Compliance & Audit Sign-off Workflow
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex justify-between">
            <span className="text-slate-400">Target Service:</span>
            <span className="text-cyan-400 font-bold">{service?.serviceName} ({service?.providerName})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Operator Name</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Transaction Amount ($)</label>
              <input
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">New Renewal / Expiry Date</label>
              <input
                type="date"
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Receipt Invoice URL</label>
              <input
                type="text"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Compliance Notes & Verification</label>
            <textarea
              value={complianceNotes}
              onChange={(e) => setComplianceNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
            />
          </div>

          {/* Previous Audit Logs */}
          {serviceLogs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400 font-semibold">Previous Sign-off Trail:</div>
              {serviceLogs.map(l => (
                <div key={l.id} className="bg-slate-950 p-2 rounded text-[11px] font-mono text-slate-300 flex justify-between">
                  <span>{new Date(l.signoffTimestamp).toLocaleDateString()} - {l.operatorName}</span>
                  <span className="text-emerald-400 font-bold">${l.transactionAmount}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-950"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Record Sign-Off</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
