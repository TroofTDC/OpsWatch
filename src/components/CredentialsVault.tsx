import React from 'react';
import { CredentialsRegistryItem, UserRole } from '../types';
import {
  KeyRound,
  ShieldCheck,
  RotateCw,
  Clock,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Database
} from 'lucide-react';

interface CredentialsVaultProps {
  credentials: CredentialsRegistryItem[];
  userRole: UserRole;
  onRotateKey: (id: string) => void;
}

export const CredentialsVault: React.FC<CredentialsVaultProps> = ({
  credentials,
  userRole,
  onRotateKey,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <KeyRound className="h-6 w-6 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Encrypted Credentials & Secrets Vault Registry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Secrets Provider Interface (Adapter Pattern) resolving credentials dynamically from GCP Secret Manager, AWS Secrets Manager, or local environment.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
          <Database className="h-4 w-4 text-emerald-400" />
          <span>Adapter Status: <strong className="text-emerald-400">GCP Secret Manager (Active)</strong></span>
        </div>
      </div>

      {/* Secrets Registry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {credentials.map(cred => {
          const isOverdue = cred.isOverdue;

          return (
            <div
              key={cred.id}
              className={`bg-slate-900/90 border rounded-xl p-5 space-y-4 transition-all ${
                isOverdue ? 'border-amber-700/80 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{cred.serviceName || 'Infrastructure Service'}</h3>
                  <div className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-indigo-400" />
                    <span>{cred.vaultSecretPath}</span>
                  </div>
                </div>

                {isOverdue ? (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="h-3 w-3" /> ROTATION OVERDUE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> VERIFIED
                  </span>
                )}
              </div>

              {/* Scopes & Age Metrics */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Access Scopes:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {cred.accessScopes.map((scope, idx) => (
                      <span key={idx} className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded text-[10px]">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Rotation Interval:</span>
                  <span className="text-slate-200">{cred.rotationIntervalDays} Days</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Credential Age:</span>
                  <span className={`font-bold ${isOverdue ? 'text-amber-400' : 'text-slate-200'}`}>
                    {cred.credentialAgeDays} Days
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Last Rotated:</span>
                  <span className="text-slate-400">{new Date(cred.lastRotated).toLocaleString()}</span>
                </div>
              </div>

              {/* Rotate Button */}
              {userRole === 'Super Admin / Ops Lead' && (
                <button
                  onClick={() => onRotateKey(cred.id)}
                  className="w-full py-2 bg-slate-800 hover:bg-indigo-950 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-600 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
                >
                  <RotateCw className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Rotate Vault Key & Verify Scope</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
