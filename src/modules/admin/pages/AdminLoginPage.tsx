import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserGear,
  CurrencyInr,
  IdentificationBadge,
  Eye,
  LockKey,
} from '@phosphor-icons/react';
import { useTournament } from '../../core/context/TournamentContext';
import type { AdminRole } from '../../core/types/tkpl';

const ROLE_OPTIONS: Array<{
  role: AdminRole;
  title: string;
  subtitle: string;
  badge: string;
}> = [
  {
    role: 'super_admin',
    title: 'Super Admin / Tournament Lead',
    subtitle: 'Full access to settings, player approvals, payment verification, CSV exports and audit logs.',
    badge: 'All Permissions',
  },
  {
    role: 'registration_reviewer',
    title: 'Registration Reviewer',
    subtitle: 'Review player photos and details, approve/reject/request corrections, and export roster CSV. Cannot verify payments.',
    badge: 'Profile Review Only',
  },
  {
    role: 'payment_verifier',
    title: 'Payment Verifier (Sultan Sports / Partner Desk)',
    subtitle: 'Reconcile UPI/bank/cash references against statements and mark Verified/Failed/Refunded. Cannot edit player profiles.',
    badge: 'Finance & UPI Only',
  },
  {
    role: 'read_only_helper',
    title: 'Read-Only Helper',
    subtitle: 'View limited roster counts and masked phone numbers. Cannot export CSV or modify any status.',
    badge: 'Read-Only View',
  },
];

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminSession, loginAdmin } = useTournament();
  const [selectedRole, setSelectedRole] = useState<AdminRole>('super_admin');
  const [organizerName, setOrganizerName] = useState<string>('');

  if (adminSession) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin(selectedRole, organizerName);
    navigate('/admin');
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-zinc-950 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2.5 text-amber-400">
            <ShieldCheck size={26} weight="duotone" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Role-Based Organizer Access
            </span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-50">
            TKPL Organizer & Payment Desk Sign-In
          </h1>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            Select an organizer role below to enter the dashboard and verify least-privilege access controls across player approvals, payment reconciliation and settings.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-6">
            <div className="space-y-3">
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Choose Active Organizer Role
              </span>

              <div className="grid grid-cols-1 gap-3">
                {ROLE_OPTIONS.map((item) => {
                  const isSelected = selectedRole === item.role;
                  return (
                    <label
                      key={item.role}
                      className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/25'
                          : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="admin_role"
                          value={item.role}
                          checked={isSelected}
                          onChange={() => setSelectedRole(item.role)}
                          className="mt-1 h-4 w-4 border-zinc-600 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-zinc-100">
                              {item.title}
                            </span>
                            <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                              {item.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-zinc-400">
                        {item.role === 'super_admin' && <UserGear size={20} className="text-emerald-400" />}
                        {item.role === 'registration_reviewer' && <IdentificationBadge size={20} className="text-sky-400" />}
                        {item.role === 'payment_verifier' && <CurrencyInr size={20} className="text-amber-400" />}
                        {item.role === 'read_only_helper' && <Eye size={20} className="text-zinc-400" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="organizer_name" className="text-sm font-semibold text-zinc-200">
                Organizer Display Name for Audit Logs <span className="text-xs font-normal text-zinc-400">(Optional)</span>
              </label>
              <input
                id="organizer_name"
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="Leave blank to use default role title"
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-bold text-zinc-950 shadow-lg transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              <LockKey size={20} weight="bold" />
              <span>Sign In to Organizer Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
