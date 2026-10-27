import React, { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import {
  CheckCircle,
  Copy,
  Check,
  MagnifyingGlass,
  CurrencyInr,
  ArrowRight,
} from '@phosphor-icons/react';
import { useTournament, type RegistrationSubmitResponse } from '../../core/context/TournamentContext';
import { formatInrFromPaise } from '../../core/lib/validation';
import { PaymentBadge } from '../../core/components/StatusBadge';

interface LocationState {
  registration?: RegistrationSubmitResponse;
  phone?: string;
  date_of_birth?: string;
}

export const RegistrationSuccessPage: React.FC = () => {
  const location = useLocation();
  const { settings } = useTournament();
  const state = (location.state as LocationState | null) ?? null;
  const [copied, setCopied] = useState(false);

  if (!state?.registration) {
    return <Navigate to="/register" replace />;
  }

  const { registration, phone, date_of_birth } = state;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(registration.registration_no);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-zinc-950 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-emerald-500/30 bg-zinc-900/90 p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle size={32} weight="fill" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Registration Recorded
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-50">
                Welcome to TKPL, {registration.full_name}
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
            Save your official Registration Number below. You will need it along with your mobile number and date of birth to check your approval status or submit payment proof.
          </p>

          {/* Registration ID Display Box */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-zinc-700 bg-zinc-950 p-5">
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-400">
                Official Registration Number
              </span>
              <p className="mt-1 font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-400">
                {registration.registration_no}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check size={15} className="text-emerald-400" />
                  <span>Copied ID</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Copy Registration ID</span>
                </>
              )}
            </button>
          </div>

          {/* Current Payment Status & Instructions */}
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Fee Payment Status
              </span>
              <PaymentBadge status={registration.payment_status} />
            </div>

            <div className="border-t border-zinc-800/80 pt-3 text-sm text-zinc-300 space-y-2">
              <p className="flex items-center gap-1.5 font-semibold text-amber-300">
                <CurrencyInr size={16} />
                <span>
                  Registration Fee: {formatInrFromPaise(settings.fee_paise)} · Official UPI: {settings.upi_id}
                </span>
              </p>
              {registration.payment_status === 'pending' ? (
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Your profile is saved, but you have not submitted a payment reference yet. Please pay the registration fee to the official UPI ID and submit your 12-digit UTR number on the Check Status page.
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Your payment transaction reference has been recorded as Submitted. An authorized payment verifier will match it against the official bank statement and update your status to Verified.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/check-status"
              state={{
                prefillRegNo: registration.registration_no,
                prefillPhone: phone ?? '',
                prefillDob: date_of_birth ?? '',
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              <MagnifyingGlass size={18} weight="bold" />
              <span>
                {registration.payment_status === 'pending'
                  ? 'Submit Payment Ref & Check Status'
                  : 'View Live Application Status'}
              </span>
              <ArrowRight size={16} weight="bold" />
            </Link>

            <Link
              to="/"
              className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition"
            >
              Return to TKPL Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
