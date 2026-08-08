import React from 'react';
import { UserRole } from '../types';
import {
  ShieldAlert,
  Activity,
  Server,
  KeyRound,
  BellRing,
  Layers,
  FileCheck2,
  Cpu,
  RefreshCw,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  criticalAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onRefresh,
  isRefreshing,
  criticalAlertCount,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'services', label: 'Service Catalog', icon: Server },
    { id: 'dow-soc', label: 'DoW & AI SOC', icon: ShieldAlert, badge: criticalAlertCount > 0 ? criticalAlertCount : null },
    { id: 'telemetry', label: 'Telemetry & Runway', icon: Cpu },
    { id: 'credentials', label: 'Credentials Vault', icon: KeyRound },
    { id: 'alerts', label: 'Alert Rules & Circuit Breaker', icon: BellRing },
    { id: 'applications', label: 'Applications', icon: Layers },
    { id: 'audit', label: 'Compliance Audit', icon: FileCheck2 },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-600 via-emerald-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-900/30">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  OpsWatch
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 uppercase tracking-wider">
                  Live Control Tower
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Multi-Cloud Operations, API Runway & Denial-of-Wallet Shield
              </p>
            </div>
          </div>

          {/* Controls: Role Selector & Refresh */}
          <div className="flex items-center space-x-3">
            {/* Live Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
              title="Refresh telemetry and service catalog"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline font-mono">Sync</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800 rounded-lg p-1">
              <UserCheck className="h-4 w-4 text-cyan-400 ml-1.5 hidden sm:block" />
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-xs text-slate-200 font-medium pr-2 py-1 border-none focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value="Super Admin / Ops Lead" className="bg-slate-900 text-slate-200">
                  Role: Super Admin / Ops Lead
                </option>
                <option value="Developer / Engineer" className="bg-slate-900 text-slate-200">
                  Role: Developer / Engineer
                </option>
                <option value="Finance / Accounts" className="bg-slate-900 text-slate-200">
                  Role: Finance / Accounts
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
