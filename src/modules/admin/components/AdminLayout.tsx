import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  ChartBar,
  Users,
  CurrencyInr,
  GearSix,
  ShieldCheck,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { useTournament } from '../../core/context/TournamentContext';
import type { AdminRole } from '../../core/types/tkpl';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { adminSession, loginAdmin, resetDemoDatabase } = useTournament();

  if (!adminSession) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { path: '/admin', label: 'Overview & Audit', icon: ChartBar, exact: true },
    { path: '/admin/players', label: 'Players & Roster', icon: Users, exact: false },
    { path: '/admin/payments', label: 'Payment Ledger', icon: CurrencyInr, exact: false },
    { path: '/admin/settings', label: 'Tournament Settings', icon: GearSix, exact: false },
  ];

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-zinc-950 text-zinc-100">
      {/* Top Admin Context Bar with Role Switcher */}
      <div className="border-b border-zinc-800 bg-zinc-900/90">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} weight="duotone" className="text-amber-400" />
            <span className="text-xs sm:text-sm font-semibold text-zinc-200">
              Signed in as: <strong className="text-emerald-400">{adminSession.full_name}</strong>
            </span>
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase text-amber-300">
              {adminSession.role.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label htmlFor="quick_role_switch" className="text-zinc-400 font-medium">
              Test Role Permissions:
            </label>
            <select
              id="quick_role_switch"
              value={adminSession.role}
              onChange={(e) => loginAdmin(e.target.value as AdminRole)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="super_admin">Super Admin (All Access)</option>
              <option value="registration_reviewer">Registration Reviewer (Profiles Only)</option>
              <option value="payment_verifier">Payment Verifier (Payments Only)</option>
              <option value="read_only_helper">Read-Only Helper (Masked View)</option>
            </select>

            <button
              type="button"
              onClick={resetDemoDatabase}
              title="Reset sample data to initial state"
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            >
              <ArrowCounterClockwise size={14} />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* Admin Sub-Navigation Tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                  active
                    ? 'border-emerald-400 text-emerald-300 bg-zinc-800/40'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <Icon size={17} weight={active ? 'duotone' : 'regular'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Outlet */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
};
