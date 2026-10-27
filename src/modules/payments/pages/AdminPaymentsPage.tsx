import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CurrencyInr,
  ShieldWarning,
  MagnifyingGlass,
  CheckCircle,
  WarningCircle,
  LockKey,
  PencilSimple,
} from '@phosphor-icons/react';
import { useTournament } from '../../core/context/TournamentContext';
import {
  canRolePerform,
  formatInrFromPaise,
  maskPhoneForReadOnly,
} from '../../core/lib/validation';
import type { PaymentMethod, PaymentRecord, PaymentStatus } from '../../core/types/tkpl';
import { PaymentBadge } from '../../core/components/StatusBadge';

export const AdminPaymentsPage: React.FC = () => {
  const { payments, adminSession, updatePaymentVerification } = useTournament();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);

  const [editStatus, setEditStatus] = useState<PaymentStatus>('verified');
  const [editMethod, setEditMethod] = useState<PaymentMethod>('upi');
  const [editTxRef, setEditTxRef] = useState<string>('');
  const [editRefundRef, setEditRefundRef] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const canVerifyPayment = canRolePerform(adminSession?.role, 'verify_payment');

  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return payments.filter((py) => {
      if (statusFilter !== 'all' && py.status !== statusFilter) return false;
      if (!q) return true;
      return (
        py.registration_no.toLowerCase().includes(q) ||
        py.player_name.toLowerCase().includes(q) ||
        py.transaction_ref.toLowerCase().includes(q) ||
        py.player_phone.includes(q)
      );
    });
  }, [payments, searchQuery, statusFilter]);

  const openReconcileModal = (pay: PaymentRecord) => {
    setEditingPayment(pay);
    setEditStatus(pay.status === 'submitted' ? 'verified' : pay.status);
    setEditMethod(pay.method);
    setEditTxRef(pay.transaction_ref);
    setEditRefundRef(pay.refund_ref);
    setEditNotes(pay.notes);
    setFeedback(null);
  };

  const handleSaveReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    setFeedback(null);

    try {
      updatePaymentVerification({
        paymentId: editingPayment.id,
        status: editStatus,
        method: editMethod,
        transactionRef: editTxRef,
        refundRef: editRefundRef,
        notes: editNotes,
      });
      setFeedback({
        type: 'success',
        message: `Updated payment for ${editingPayment.player_name} (${editingPayment.registration_no}) to ${editStatus.toUpperCase()}.`,
      });
      setEditingPayment(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not update payment status.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-50">
            Payment Verification & Reconciliation Ledger
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Match submitted UPI UTRs, bank transfers and cash receipts against actual statements.
          </p>
        </div>
      </div>

      {/* Mandatory Reconciliation Policy Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/35 bg-amber-950/20 p-4 sm:p-5 text-xs sm:text-sm text-amber-200">
        <ShieldWarning size={24} className="mt-0.5 shrink-0 text-amber-400" />
        <div>
          <p className="font-bold text-amber-100">
            Strict Reconciliation Rule: Never treat a screenshot alone as proof of transfer.
          </p>
          <p className="mt-1 text-zinc-300 leading-relaxed">
            Verify every 12-digit UPI UTR or bank reference against the official tournament bank/UPI account statement before marking a payment as <strong className="text-emerald-300">Verified</strong>. For offline cash collections, issue a numbered physical receipt and record the receipt number and collector name.
          </p>
        </div>
      </div>

      {!canVerifyPayment && (
        <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs text-zinc-300">
          <LockKey size={18} className="text-amber-400 shrink-0" />
          <span>
            Your current role (<strong className="text-zinc-100">{adminSession?.role}</strong>) has view-only access to the payment ledger. Switch to <strong className="text-emerald-300">Payment Verifier</strong> or <strong className="text-emerald-300">Super Admin</strong> to reconcile payments.
          </span>
        </div>
      )}

      {feedback && !editingPayment && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl p-4 text-xs sm:text-sm font-medium ${
            feedback.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle size={18} weight="fill" />
          ) : (
            <WarningCircle size={18} weight="fill" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search & Status Filter */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Registration ID, Player Name, UPI UTR or Phone..."
            aria-label="Search payments"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <select
          aria-label="Filter payments by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs sm:text-sm text-zinc-200"
        >
          <option value="all">All Payment Statuses ({payments.length})</option>
          <option value="submitted">
            Submitted · Needs Verification ({payments.filter((p) => p.status === 'submitted').length})
          </option>
          <option value="pending">
            Pending · No Ref Yet ({payments.filter((p) => p.status === 'pending').length})
          </option>
          <option value="verified">
            Verified ({payments.filter((p) => p.status === 'verified').length})
          </option>
          <option value="failed">
            Failed / Unmatched ({payments.filter((p) => p.status === 'failed').length})
          </option>
          <option value="refunded">
            Refunded ({payments.filter((p) => p.status === 'refunded').length})
          </option>
        </select>
      </div>

      {/* Inline Reconciliation Panel when a row is selected */}
      {editingPayment && canVerifyPayment && (
        <form
          onSubmit={handleSaveReconciliation}
          className="rounded-2xl border border-emerald-500/40 bg-zinc-900 p-6 shadow-2xl space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-4">
            <div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                Reconciling {editingPayment.registration_no}
              </span>
              <h2 className="text-lg font-bold text-zinc-50">
                {editingPayment.player_name} · {formatInrFromPaise(editingPayment.amount_paise)}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEditingPayment(null)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>

          {feedback && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs font-medium text-rose-200"
            >
              <WarningCircle size={18} className="text-rose-400 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reconcile_status" className="text-xs font-semibold text-zinc-300">
                Verification Decision
              </label>
              <select
                id="reconcile_status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as PaymentStatus)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100"
              >
                <option value="verified">Verified (Matched in Statement)</option>
                <option value="submitted">Submitted (Unverified)</option>
                <option value="pending">Pending (No Ref)</option>
                <option value="failed">Failed / Could Not Match UTR</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reconcile_method" className="text-xs font-semibold text-zinc-300">
                Payment Method
              </label>
              <select
                id="reconcile_method"
                value={editMethod}
                onChange={(e) => setEditMethod(e.target.value as PaymentMethod)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100"
              >
                <option value="upi">UPI Transfer</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash_organizer">Cash to Organizer</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reconcile_tx_ref" className="text-xs font-semibold text-zinc-300">
                Transaction Ref / Cash Receipt No. <span className="text-rose-400">*</span>
              </label>
              <input
                id="reconcile_tx_ref"
                type="text"
                value={editTxRef}
                onChange={(e) => setEditTxRef(e.target.value)}
                placeholder="12-digit UTR or CASH-RCPT-#"
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm font-mono text-zinc-100"
              />
            </div>
          </div>

          {editStatus === 'refunded' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reconcile_refund_ref" className="text-xs font-semibold text-amber-300">
                Refund Reference Number <span className="text-rose-400">*</span>
              </label>
              <input
                id="reconcile_refund_ref"
                type="text"
                value={editRefundRef}
                onChange={(e) => setEditRefundRef(e.target.value)}
                placeholder="Enter UPI refund UTR or cash voucher reference"
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm font-mono text-zinc-100"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="reconcile_notes" className="text-xs font-semibold text-zinc-300">
              Reconciliation Notes
            </label>
            <input
              id="reconcile_notes"
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="e.g. Matched against HDFC statement 27 Oct or Cash collected at Sultan Sports counter"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-emerald-400 active:scale-[0.98]"
            >
              <CheckCircle size={18} weight="bold" />
              <span>Confirm Payment Status</span>
            </button>
          </div>
        </form>
      )}

      {/* Payments Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 pl-5 pr-3">Registration & Player</th>
                <th className="py-3.5 px-3">Amount & Method</th>
                <th className="py-3.5 px-3">Transaction / Receipt Ref</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Verification Details</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-zinc-800/35 transition">
                  <td className="py-4 pl-5 pr-3">
                    <Link
                      to={`/admin/players/${pay.player_id}`}
                      className="font-mono text-xs font-bold text-emerald-400 hover:underline"
                    >
                      {pay.registration_no}
                    </Link>
                    <p className="font-bold text-zinc-100">{pay.player_name}</p>
                    <p className="font-mono text-xs text-zinc-400">
                      {maskPhoneForReadOnly(pay.player_phone, adminSession?.role)}
                    </p>
                  </td>

                  <td className="py-4 px-3">
                    <span className="inline-flex items-center font-bold text-zinc-100">
                      <CurrencyInr size={14} className="text-emerald-400" />
                      {Math.round(pay.amount_paise / 100)}
                    </span>
                    <span className="block text-xs uppercase text-zinc-400">
                      {pay.method.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-4 px-3">
                    {pay.transaction_ref ? (
                      <span className="rounded bg-zinc-950 border border-zinc-800 px-2 py-1 font-mono text-xs font-semibold text-amber-300">
                        {pay.transaction_ref}
                      </span>
                    ) : (
                      <span className="text-xs italic text-zinc-500">Not submitted</span>
                    )}
                    {pay.refund_ref && (
                      <span className="block mt-1 font-mono text-[11px] text-purple-300">
                        Refund Ref: {pay.refund_ref}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-3">
                    <PaymentBadge status={pay.status} />
                  </td>

                  <td className="py-4 px-3 max-w-xs">
                    {pay.verified_at ? (
                      <p className="text-xs text-emerald-300">
                        Verified by {pay.verifier_name}
                      </p>
                    ) : null}
                    <p className="text-xs text-zinc-400 truncate" title={pay.notes}>
                      {pay.notes || 'No remarks'}
                    </p>
                  </td>

                  <td className="py-4 pl-3 pr-5 text-right">
                    {canVerifyPayment ? (
                      <button
                        type="button"
                        onClick={() => openReconcileModal(pay)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:border-emerald-500/50 hover:text-emerald-300"
                      >
                        <PencilSimple size={14} />
                        <span>Reconcile</span>
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
