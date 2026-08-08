import React, { useState } from 'react';
import { Application, ServiceCatalogItem, UserRole } from '../types';
import { Layers, Plus, Mail, Server, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface ApplicationsViewProps {
  applications: Application[];
  services: ServiceCatalogItem[];
  userRole: UserRole;
  onAddApplication: (app: Partial<Application>) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  services,
  userRole,
  onAddApplication,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddApplication({ name, description, ownerEmail });
    setName('');
    setDescription('');
    setOwnerEmail('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="h-6 w-6 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Applications Registry & Service Dependency Catalog
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Map digital product portfolios to multi-cloud infrastructure, service account credentials, and team ownership.
          </p>
        </div>

        {userRole === 'Super Admin / Ops Lead' && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Register Application</span>
          </button>
        )}
      </div>

      {/* Register App Modal / Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-cyan-600/50 rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
            Register New Digital Application
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Application Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AI Customer Assistant"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Owner Email</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="e.g. ops-lead@company.io"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Real-time chat support agent powered by Gemini 3.6 API."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
            />
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
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs"
            >
              Register App
            </button>
          </div>
        </form>
      )}

      {/* Applications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {applications.map(app => {
          const linkedServices = services.filter(s => s.linkedAppId === app.id);

          return (
            <div
              key={app.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{app.name}</h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1 font-mono">
                    <Mail className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{app.ownerEmail}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {linkedServices.length} Linked Services
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {app.description}
              </p>

              {/* Linked Infrastructure List */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <Server className="h-3.5 w-3.5 text-cyan-400" />
                  Linked Infrastructure Services:
                </div>

                {linkedServices.length === 0 ? (
                  <div className="text-xs text-slate-500 font-mono italic">
                    No services explicitly linked yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {linkedServices.map(srv => (
                      <div
                        key={srv.id}
                        className="bg-slate-950/80 p-2 rounded border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="font-semibold text-slate-200 font-mono">
                          {srv.serviceName}
                          <span className="text-slate-500 font-normal ml-2">({srv.providerName})</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-400">
                          ${srv.dailyBurnRate}/day
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
