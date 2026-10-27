import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MagnifyingGlass,
  ShieldCheck,
  WarningCircle,
  CheckCircle,
  CurrencyInr,
  Sparkle,
} from '@phosphor-icons/react';
import { useTournament } from '../../core/context/TournamentContext';
import { formatInrFromPaise } from '../../core/lib/validation';
import type { PaymentMethod, SafeStatusLookupResult } from '../../core/types/tkpl';
import {
  AuctionBadge,
  PaymentBadge,
  RegistrationBadge,
  RoleLabel,
} from '../../core/components/StatusBadge';

interface PrefillLocationState {
  prefillRegNo?: string;
  prefillPhone?: string;
  prefillDob?: string;
}

export const CheckStatusPage: React.FC = () => {
  const location = useLocation();
  const prefill = (location.state as PrefillLocationState | null) ?? null;
  const { settings, lookupStatus, submitApplicantPaymentProof } = useTournament();

  const [registrationNo, setRegistrationNo] = useState(prefill?.prefillRegNo ?? '');
  const [phone, setPhone] = useState(prefill?.prefillPhone ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(prefill?.prefillDob ?? '');

  const [lookupResult, setLookupResult] = useState<SafeStatusLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Payment proof submission state for pending/failed payments
  const [payMethod, setPayMethod] = useState<PaymentMethod>('upi');
  const [txRef, setTxRef] = useState<string>('');
  const [payFeedback, setPayFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setPayFeedback(null);
    setHasSearched(true);

    if (!registrationNo.trim() || !phone.trim() || !dateOfBirth.trim()) {
      setLookupResult(null);
      setLookupError(
        'Please enter all three verification details: Registration Number, Mobile Number and Date of Birth.'
      );
      return;
    }

    const res = await lookupStatus(registrationNo, phone, dateOfBirth);
    if (!res) {
      setLookupResult(null);
      // Anti-enumeration message: never reveal whether the phone number alone exists
      setLookupError(
        'No matching registration found for the provided combination of Registration Number, Mobile Number and Date of Birth.'
      );
      return;
    }

    setLookupResult(res);
    setTxRef(res.transaction_ref || '');
  };

  const handlePaymentProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayFeedback(null);
    try {
      const updated = await submitApplicantPaymentProof({
        registrationNo,
        phone,
        dateOfBirth,
        method: payMethod,
        transactionRef: txRef,
      });
      setLookupResult(updated);
      setPayFeedback({
        type: 'success',
        message:
          'Transaction reference recorded as Submitted. An authorized payment admin will verify it against the bank/UPI statement.',
      });
    } catch (err) {
      setPayFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not submit payment reference.',
      });
    }
  };

  const fillDemoPlayer = (reg: string, ph: string, dob: string) => {
    setRegistrationNo(reg);
    setPhone(ph);
    setDateOfBirth(dob);
    setLookupError('');
    setPayFeedback(null);
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-zinc-950 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <ShieldCheck size={24} weight="duotone" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Privacy-Protected Lookup
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-50">
            Check Registration & Payment Status
          </h1>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            To protect player privacy, status checks require your Registration Number, Mobile Number and Date of Birth together.
          </p>

          {/* Quick Demo Fill Bar for Testing */}
          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/90 p-3.5 text-xs text-zinc-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                <Sparkle size={14} weight="fill" />
                <span>Quick Test Profiles:</span>
              </span>
              <button
                type="button"
                onClick={() => fillDemoPlayer('TKPL-2026-0101', '9848011223', '1999-04-14')}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-zinc-200 hover:border-emerald-500/50 hover:text-emerald-300 transition"
              >
                Syed Irfan (Approved & Auction Eligible)
              </button>
              <button
                type="button"
                onClick={() => fillDemoPlayer('TKPL-2026-0105', '7989234561', '1998-07-30')}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-zinc-200 hover:border-amber-500/50 hover:text-amber-300 transition"
              >
                P. Harish Kumar (Payment Pending)
              </button>
              <button
                type="button"
                onClick={() => fillDemoPlayer('TKPL-2026-0104', '8897633445', '2000-01-19')}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-zinc-200 hover:border-orange-500/50 hover:text-orange-300 transition"
              >
                G. Sai Charan (Needs Photo Correction)
              </button>
            </div>
          </div>

          <form onSubmit={handleLookup} noValidate className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="lookup_reg_no" className="text-sm font-semibold text-zinc-200">
                  Registration Number <span className="text-rose-400">*</span>
                </label>
                <input
                  id="lookup_reg_no"
                  type="text"
                  required
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  placeholder="TKPL-2026-0101"
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="lookup_phone" className="text-sm font-semibold text-zinc-200">
                  Mobile Number <span className="text-rose-400">*</span>
                </label>
                <input
                  id="lookup_phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="lookup_dob" className="text-sm font-semibold text-zinc-200">
                  Date of Birth <span className="text-rose-400">*</span>
                </label>
                <input
                  id="lookup_dob"
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              <MagnifyingGlass size={18} weight="bold" />
              <span>Check My Status</span>
            </button>
          </form>
        </div>

        {/* Lookup Error */}
        {hasSearched && lookupError && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/40 p-5 text-rose-200"
          >
            <WarningCircle size={22} className="mt-0.5 shrink-0 text-rose-400" />
            <p className="text-sm">{lookupError}</p>
          </div>
        )}

        {/* Lookup Result Card */}
        {lookupResult && (
          <div className="mt-6 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {lookupResult.registration_no}
                </span>
                <h2 className="mt-1 text-2xl font-bold text-zinc-50">
                  {lookupResult.full_name}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {lookupResult.locality} · <RoleLabel role={lookupResult.role} />
                </p>
              </div>
              <div className="text-right text-xs text-zinc-400">
                <span>Submitted on</span>
                <p className="font-medium text-zinc-200">
                  {new Date(lookupResult.submitted_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata',
                  })}
                </p>
              </div>
            </div>

            {/* Three Separate Status Pillars */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <span className="block text-xs font-medium text-zinc-400 mb-2">
                  1. Profile Review Status
                </span>
                <RegistrationBadge status={lookupResult.registration_status} />
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <span className="block text-xs font-medium text-zinc-400 mb-2">
                  2. Fee Verification Status
                </span>
                <PaymentBadge status={lookupResult.payment_status} />
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <span className="block text-xs font-medium text-zinc-400 mb-2">
                  3. Auction Pool Status
                </span>
                <AuctionBadge status={lookupResult.auction_status} />
              </div>
            </div>

            {/* Organizer Review Notes if any */}
            {lookupResult.review_notes && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Organizer Review Note
                </span>
                <p className="mt-1 text-sm text-zinc-200">{lookupResult.review_notes}</p>
              </div>
            )}

            {/* Submit or Update Payment Reference if not yet Verified */}
            {lookupResult.payment_status !== 'verified' && lookupResult.payment_status !== 'refunded' && (
              <form
                onSubmit={handlePaymentProofSubmit}
                className="rounded-xl border border-amber-500/30 bg-zinc-950 p-5 space-y-4"
              >
                <div className="flex items-center gap-2 text-amber-300">
                  <CurrencyInr size={20} weight="bold" />
                  <h3 className="text-base font-bold text-zinc-100">
                    Submit or Update Fee Payment Reference ({formatInrFromPaise(settings.fee_paise)})
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Official UPI ID: <strong className="font-mono text-zinc-200">{settings.upi_id}</strong>. Submitting a reference sets your payment status to Submitted until reconciled by the payment admin.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="applicant_pay_method" className="text-xs font-semibold text-zinc-300">
                      Payment Method
                    </label>
                    <select
                      id="applicant_pay_method"
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                      className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
                    >
                      <option value="upi">UPI Transfer</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash_organizer">Cash to Organizer</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="applicant_tx_ref" className="text-xs font-semibold text-zinc-300">
                      UPI UTR / Receipt Reference <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="applicant_tx_ref"
                      type="text"
                      required
                      value={txRef}
                      onChange={(e) => setTxRef(e.target.value)}
                      placeholder="12-digit UTR or Receipt No."
                      className="rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-500"
                    />
                  </div>
                </div>

                {payFeedback && (
                  <div
                    role="alert"
                    className={`flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${
                      payFeedback.type === 'success'
                        ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                    }`}
                  >
                    {payFeedback.type === 'success' ? (
                      <CheckCircle size={16} weight="fill" />
                    ) : (
                      <WarningCircle size={16} weight="fill" />
                    )}
                    <span>{payFeedback.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-300 active:scale-[0.98]"
                >
                  <span>Save Payment Reference</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
