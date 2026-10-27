import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  AdminRole,
  AdminSession,
  AuctionStatus,
  AuditLogEntry,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  PlayerRecord,
  RegistrationFormInput,
  RegistrationStatus,
  SafeStatusLookupResult,
  TournamentSettings,
} from '../types/tkpl';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_PAYMENTS,
  INITIAL_PLAYERS,
  INITIAL_TOURNAMENT_SETTINGS,
} from '../lib/seedData';
import {
  canRolePerform,
  normalizeIndianPhone,
  validateRegistrationForm,
} from '../lib/validation';
import { isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEYS = {
  SETTINGS: 'tkpl_v2_settings',
  PLAYERS: 'tkpl_v2_players',
  PAYMENTS: 'tkpl_v2_payments',
  AUDIT: 'tkpl_v2_audit_logs',
  SEQ: 'tkpl_v2_reg_seq',
  ADMIN: 'tkpl_v2_admin_session',
  IDEMPOTENCY: 'tkpl_v2_idempotency_keys',
};

const ROLE_DEFAULT_PROFILES: Record<AdminRole, Omit<AdminSession, 'role'>> = {
  super_admin: {
    user_id: 'adm-super',
    email: 'mansoor@sultansports.in',
    full_name: 'Mansoor · Sultan Sports Kadapa (Super Admin)',
  },
  registration_reviewer: {
    user_id: 'adm-reviewer',
    email: 'sunil@nrsports.in',
    full_name: 'Sunil · NR Sports Vempalli (Reviewer)',
  },
  payment_verifier: {
    user_id: 'adm-payment',
    email: 'accounts@sultansports.in',
    full_name: 'Sultan Sports & NR Sports Desk (Payment Verifier)',
  },
  read_only_helper: {
    user_id: 'adm-helper',
    email: 'volunteer@tkpl-kadapa.in',
    full_name: 'T-KPL Match Desk Helper (Read-Only)',
  },
};

export interface RegistrationSubmitResponse {
  player_id: string;
  registration_no: string;
  full_name: string;
  payment_status: PaymentStatus;
  created_at: string;
}

interface TournamentContextValue {
  settings: TournamentSettings;
  players: PlayerRecord[];
  payments: PaymentRecord[];
  auditLogs: AuditLogEntry[];
  adminSession: AdminSession | null;
  isCloudConnected: boolean;
  loginAdmin: (role: AdminRole, customName?: string) => void;
  logoutAdmin: () => void;
  submitRegistration: (
    input: RegistrationFormInput,
    idempotencyKey: string
  ) => Promise<RegistrationSubmitResponse>;
  lookupStatus: (
    registrationNo: string,
    phone: string,
    dateOfBirth: string
  ) => Promise<SafeStatusLookupResult | null>;
  submitApplicantPaymentProof: (params: {
    registrationNo: string;
    phone: string;
    dateOfBirth: string;
    method: PaymentMethod;
    transactionRef: string;
    receiptFileName?: string;
  }) => Promise<SafeStatusLookupResult>;
  updatePlayerReview: (params: {
    playerId: string;
    registrationStatus: RegistrationStatus;
    auctionStatus: AuctionStatus;
    reviewNotes: string;
  }) => void;
  updatePaymentVerification: (params: {
    paymentId: string;
    status: PaymentStatus;
    method?: PaymentMethod;
    transactionRef: string;
    refundRef?: string;
    notes: string;
  }) => void;
  updateTournamentSettings: (updates: Partial<TournamentSettings>) => void;
  recordCsvExportAudit: (exportKind: 'all_players' | 'auction_eligible', count: number) => void;
  resetDemoDatabase: () => void;
}

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<TournamentSettings>(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_TOURNAMENT_SETTINGS)
  );
  const [players, setPlayers] = useState<PlayerRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.PLAYERS, INITIAL_PLAYERS)
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    loadFromStorage(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS)
  );
  const [seqCounter, setSeqCounter] = useState<number>(() =>
    loadFromStorage(STORAGE_KEYS.SEQ, 106)
  );
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() =>
    loadFromStorage<AdminSession | null>(STORAGE_KEYS.ADMIN, null)
  );
  const [processedKeys, setProcessedKeys] = useState<Record<string, RegistrationSubmitResponse>>(
    () => loadFromStorage(STORAGE_KEYS.IDEMPOTENCY, {})
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    } catch {
      // Ignore
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    } catch {
      // Ignore
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
    } catch {
      // Ignore
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SEQ, JSON.stringify(seqCounter));
    } catch {
      // Ignore
    }
  }, [seqCounter]);

  useEffect(() => {
    try {
      if (adminSession) {
        localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(adminSession));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ADMIN);
      }
    } catch {
      // Ignore
    }
  }, [adminSession]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IDEMPOTENCY, JSON.stringify(processedKeys));
    } catch {
      // Ignore
    }
  }, [processedKeys]);

  const appendAudit = useCallback(
    (entry: Omit<AuditLogEntry, 'id' | 'created_at'>) => {
      const fullEntry: AuditLogEntry = {
        ...entry,
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        created_at: new Date().toISOString(),
      };
      setAuditLogs((prev) => [fullEntry, ...prev]);
    },
    []
  );

  const loginAdmin = useCallback((role: AdminRole, customName?: string) => {
    const base = ROLE_DEFAULT_PROFILES[role];
    setAdminSession({
      ...base,
      full_name: customName?.trim() ? customName.trim() : base.full_name,
      role,
    });
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdminSession(null);
  }, []);

  const submitRegistration = useCallback(
    async (
      input: RegistrationFormInput,
      idempotencyKey: string
    ): Promise<RegistrationSubmitResponse> => {
      // 1. Check idempotency key to prevent accidental double-click duplicates
      if (idempotencyKey && processedKeys[idempotencyKey]) {
        return processedKeys[idempotencyKey];
      }

      // 2. Enforce server-side form & deadline validation
      const validationErrors = validateRegistrationForm(input, settings);
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        throw new Error(firstError);
      }

      const normalizedPhone = normalizeIndianPhone(input.phone);

      // 3. Enforce unique mobile number constraint without leaking existing player details
      const existingDuplicate = players.find(
        (p) => normalizeIndianPhone(p.phone) === normalizedPhone
      );
      if (existingDuplicate) {
        throw new Error(
          'A registration already exists with this mobile number. Use the Check Status page with your Registration ID and Date of Birth.'
        );
      }

      const nowIso = new Date().toISOString();
      const nextNum = seqCounter;
      setSeqCounter((n) => n + 1);

      const registrationNo = `TKPL-2026-${String(nextNum).padStart(4, '0')}`;
      const playerId = `plr-${Date.now()}`;
      const cleanTxRef = input.transaction_ref.trim();
      const initialPaymentStatus: PaymentStatus = cleanTxRef ? 'submitted' : 'pending';

      const newPlayer: PlayerRecord = {
        id: playerId,
        registration_no: registrationNo,
        full_name: input.full_name.trim(),
        phone: normalizedPhone,
        date_of_birth: input.date_of_birth,
        locality: input.locality.trim(),
        role: input.role,
        batting_hand: input.batting_hand,
        bowling_style: input.bowling_style,
        experience: input.experience.trim(),
        emergency_contact: input.emergency_contact
          ? normalizeIndianPhone(input.emergency_contact)
          : '',
        photo_url: input.photo_data_url,
        photo_file_name: input.photo_file_name,
        registration_status: 'submitted',
        auction_status: 'not_reviewed',
        review_notes: '',
        rules_acknowledged: input.rules_acknowledged,
        marketing_consent: input.marketing_consent,
        consent_at: nowIso,
        created_at: nowIso,
        updated_at: nowIso,
      };

      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        player_id: playerId,
        registration_no: registrationNo,
        player_name: newPlayer.full_name,
        player_phone: normalizedPhone,
        amount_paise: settings.fee_paise,
        currency: settings.currency,
        method: input.payment_method,
        transaction_ref: cleanTxRef,
        receipt_file_name: '',
        status: initialPaymentStatus,
        verified_by: null,
        verifier_name: '',
        verified_at: null,
        refund_ref: '',
        notes: cleanTxRef
          ? 'Transaction reference submitted during registration; awaiting bank reconciliation.'
          : 'Awaiting transaction reference submission.',
        created_at: nowIso,
        updated_at: nowIso,
      };

      setPlayers((prev) => [newPlayer, ...prev]);
      setPayments((prev) => [newPayment, ...prev]);

      appendAudit({
        actor_user_id: 'public-applicant',
        actor_name: newPlayer.full_name,
        actor_role: 'applicant',
        action: 'REGISTRATION_SUBMITTED',
        entity_type: 'player',
        entity_id: registrationNo,
        summary: `New registration ${registrationNo} submitted (${newPlayer.locality}, ${newPlayer.role}). Payment status: ${initialPaymentStatus}.`,
        new_values: {
          registration_no: registrationNo,
          registration_status: 'submitted',
          payment_status: initialPaymentStatus,
        },
      });

      const result: RegistrationSubmitResponse = {
        player_id: playerId,
        registration_no: registrationNo,
        full_name: newPlayer.full_name,
        payment_status: initialPaymentStatus,
        created_at: nowIso,
      };

      if (idempotencyKey) {
        setProcessedKeys((prev) => ({ ...prev, [idempotencyKey]: result }));
      }

      return result;
    },
    [appendAudit, players, processedKeys, seqCounter, settings]
  );

  const lookupStatus = useCallback(
    async (
      registrationNo: string,
      phone: string,
      dateOfBirth: string
    ): Promise<SafeStatusLookupResult | null> => {
      const cleanReg = registrationNo.trim().toUpperCase();
      const cleanPhone = normalizeIndianPhone(phone);
      const cleanDob = dateOfBirth.trim();

      if (!cleanReg || !cleanPhone || !cleanDob) {
        return null;
      }

      const matchedPlayer = players.find(
        (p) =>
          p.registration_no.toUpperCase() === cleanReg &&
          normalizeIndianPhone(p.phone) === cleanPhone &&
          p.date_of_birth === cleanDob
      );

      if (!matchedPlayer) {
        return null;
      }

      const matchedPayment = payments.find((pay) => pay.player_id === matchedPlayer.id);

      return {
        registration_no: matchedPlayer.registration_no,
        full_name: matchedPlayer.full_name,
        locality: matchedPlayer.locality,
        role: matchedPlayer.role,
        registration_status: matchedPlayer.registration_status,
        auction_status: matchedPlayer.auction_status,
        review_notes: matchedPlayer.review_notes,
        payment_status: matchedPayment?.status ?? 'pending',
        transaction_ref: matchedPayment?.transaction_ref ?? '',
        submitted_at: matchedPlayer.created_at,
      };
    },
    [payments, players]
  );

  const submitApplicantPaymentProof = useCallback(
    async (params: {
      registrationNo: string;
      phone: string;
      dateOfBirth: string;
      method: PaymentMethod;
      transactionRef: string;
      receiptFileName?: string;
    }): Promise<SafeStatusLookupResult> => {
      const cleanTx = params.transactionRef.trim();
      if (cleanTx.length < 4) {
        throw new Error('Please enter a valid UPI UTR or bank transaction reference number (at least 4 characters).');
      }

      const cleanReg = params.registrationNo.trim().toUpperCase();
      const cleanPhone = normalizeIndianPhone(params.phone);
      const cleanDob = params.dateOfBirth.trim();

      const matchedPlayer = players.find(
        (p) =>
          p.registration_no.toUpperCase() === cleanReg &&
          normalizeIndianPhone(p.phone) === cleanPhone &&
          p.date_of_birth === cleanDob
      );

      if (!matchedPlayer) {
        throw new Error('Could not verify applicant credentials. Check your Registration Number, Mobile Number and Date of Birth.');
      }

      const existingPayment = payments.find((pay) => pay.player_id === matchedPlayer.id);
      if (existingPayment && existingPayment.status === 'verified') {
        throw new Error('Your payment has already been verified by the organizers and cannot be overwritten.');
      }

      const nowIso = new Date().toISOString();

      setPayments((prev) =>
        prev.map((pay) =>
          pay.player_id === matchedPlayer.id
            ? {
                ...pay,
                method: params.method,
                transaction_ref: cleanTx,
                receipt_file_name: params.receiptFileName ?? pay.receipt_file_name,
                status: 'submitted',
                notes: 'Transaction reference submitted by applicant; awaiting admin reconciliation.',
                updated_at: nowIso,
              }
            : pay
        )
      );

      appendAudit({
        actor_user_id: 'public-applicant',
        actor_name: matchedPlayer.full_name,
        actor_role: 'applicant',
        action: 'PAYMENT_REF_SUBMITTED',
        entity_type: 'payment',
        entity_id: matchedPlayer.registration_no,
        summary: `Applicant submitted ${params.method.toUpperCase()} reference (${cleanTx}) for ${matchedPlayer.registration_no}. Status set to submitted (unverified).`,
        new_values: { status: 'submitted', transaction_ref: cleanTx, method: params.method },
      });

      return {
        registration_no: matchedPlayer.registration_no,
        full_name: matchedPlayer.full_name,
        locality: matchedPlayer.locality,
        role: matchedPlayer.role,
        registration_status: matchedPlayer.registration_status,
        auction_status: matchedPlayer.auction_status,
        review_notes: matchedPlayer.review_notes,
        payment_status: 'submitted',
        transaction_ref: cleanTx,
        submitted_at: matchedPlayer.created_at,
      };
    },
    [appendAudit, payments, players]
  );

  const updatePlayerReview = useCallback(
    (params: {
      playerId: string;
      registrationStatus: RegistrationStatus;
      auctionStatus: AuctionStatus;
      reviewNotes: string;
    }) => {
      if (!adminSession || !canRolePerform(adminSession.role, 'review_player')) {
        throw new Error('Access denied: Only Super Admins and Registration Reviewers can update player approval or auction status.');
      }

      const targetPlayer = players.find((p) => p.id === params.playerId);
      if (!targetPlayer) {
        throw new Error('Player record not found.');
      }

      const targetPayment = payments.find((pay) => pay.player_id === params.playerId);

      // Enforce tournament integrity: cannot mark auction eligible unless approved AND payment verified
      if (params.auctionStatus === 'eligible' || params.auctionStatus === 'drafted') {
        if (params.registrationStatus !== 'approved') {
          throw new Error('A player must have Registration Status set to Approved before becoming Auction Eligible.');
        }
        if (targetPayment?.status !== 'verified') {
          throw new Error('A player cannot be marked Auction Eligible until their registration fee payment is Verified against the bank/UPI statement.');
        }
      }

      const nowIso = new Date().toISOString();

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === params.playerId
            ? {
                ...p,
                registration_status: params.registrationStatus,
                auction_status: params.auctionStatus,
                review_notes: params.reviewNotes.trim(),
                updated_at: nowIso,
              }
            : p
        )
      );

      appendAudit({
        actor_user_id: adminSession.user_id,
        actor_name: adminSession.full_name,
        actor_role: adminSession.role,
        action: 'PLAYER_REVIEW_UPDATED',
        entity_type: 'player',
        entity_id: targetPlayer.registration_no,
        summary: `Updated ${targetPlayer.full_name} (${targetPlayer.registration_no}): registration=${params.registrationStatus}, auction=${params.auctionStatus}.`,
        old_values: {
          registration_status: targetPlayer.registration_status,
          auction_status: targetPlayer.auction_status,
        },
        new_values: {
          registration_status: params.registrationStatus,
          auction_status: params.auctionStatus,
          review_notes: params.reviewNotes.trim(),
        },
      });
    },
    [adminSession, appendAudit, payments, players]
  );

  const updatePaymentVerification = useCallback(
    (params: {
      paymentId: string;
      status: PaymentStatus;
      method?: PaymentMethod;
      transactionRef: string;
      refundRef?: string;
      notes: string;
    }) => {
      if (!adminSession || !canRolePerform(adminSession.role, 'verify_payment')) {
        throw new Error('Access denied: Only Super Admins and authorized Payment Verifiers can change payment status.');
      }

      const targetPayment = payments.find((pay) => pay.id === params.paymentId);
      if (!targetPayment) {
        throw new Error('Payment record not found.');
      }

      const cleanTx = params.transactionRef.trim();
      if (params.status === 'verified' && cleanTx.length < 3) {
        throw new Error('Cannot verify payment without recording a valid UPI UTR, bank reference or cash receipt number.');
      }

      const cleanRefund = (params.refundRef ?? '').trim();
      if (params.status === 'refunded' && cleanRefund.length < 3) {
        throw new Error('Please provide a refund reference number when marking a payment as refunded.');
      }

      const nowIso = new Date().toISOString();

      setPayments((prev) =>
        prev.map((pay) =>
          pay.id === params.paymentId
            ? {
                ...pay,
                status: params.status,
                method: params.method ?? pay.method,
                transaction_ref: cleanTx,
                refund_ref: cleanRefund,
                notes: params.notes.trim(),
                verified_by:
                  params.status === 'verified' ? adminSession.user_id : pay.verified_by,
                verifier_name:
                  params.status === 'verified' ? adminSession.full_name : pay.verifier_name,
                verified_at: params.status === 'verified' ? nowIso : pay.verified_at,
                updated_at: nowIso,
              }
            : pay
        )
      );

      // If payment is no longer verified, automatically downgrade auction_status if it was 'eligible'
      if (params.status !== 'verified') {
        setPlayers((prev) =>
          prev.map((pl) =>
            pl.id === targetPayment.player_id && pl.auction_status === 'eligible'
              ? { ...pl, auction_status: 'not_reviewed', updated_at: nowIso }
              : pl
          )
        );
      }

      appendAudit({
        actor_user_id: adminSession.user_id,
        actor_name: adminSession.full_name,
        actor_role: adminSession.role,
        action: `PAYMENT_${params.status.toUpperCase()}`,
        entity_type: 'payment',
        entity_id: targetPayment.registration_no,
        summary: `Payment for ${targetPayment.player_name} (${targetPayment.registration_no}) marked ${params.status} (Ref: ${cleanTx || 'N/A'}).`,
        old_values: {
          status: targetPayment.status,
          transaction_ref: targetPayment.transaction_ref,
        },
        new_values: {
          status: params.status,
          transaction_ref: cleanTx,
          refund_ref: cleanRefund,
          notes: params.notes.trim(),
        },
      });
    },
    [adminSession, appendAudit, payments]
  );

  const updateTournamentSettings = useCallback(
    (updates: Partial<TournamentSettings>) => {
      if (!adminSession || !canRolePerform(adminSession.role, 'manage_settings')) {
        throw new Error('Access denied: Only Super Admins can modify tournament settings.');
      }

      const nowIso = new Date().toISOString();
      setSettings((prev) => {
        const next: TournamentSettings = {
          ...prev,
          ...updates,
          updated_by: adminSession.full_name,
          updated_at: nowIso,
        };
        return next;
      });

      appendAudit({
        actor_user_id: adminSession.user_id,
        actor_name: adminSession.full_name,
        actor_role: adminSession.role,
        action: 'SETTINGS_UPDATED',
        entity_type: 'settings',
        entity_id: 'tournament_settings_1',
        summary: `Updated tournament configuration (Registration open: ${updates.registration_open ?? settings.registration_open}, Fee paise: ${updates.fee_paise ?? settings.fee_paise}).`,
        old_values: {
          fee_paise: settings.fee_paise,
          registration_open: settings.registration_open,
          deadline: settings.deadline,
        },
        new_values: updates as Record<string, unknown>,
      });
    },
    [adminSession, appendAudit, settings]
  );

  const recordCsvExportAudit = useCallback(
    (exportKind: 'all_players' | 'auction_eligible', count: number) => {
      if (!adminSession || !canRolePerform(adminSession.role, 'export_csv')) {
        throw new Error('Access denied: Your admin role is not permitted to export player data.');
      }
      appendAudit({
        actor_user_id: adminSession.user_id,
        actor_name: adminSession.full_name,
        actor_role: adminSession.role,
        action: 'ROSTER_CSV_EXPORTED',
        entity_type: 'export',
        entity_id: exportKind,
        summary: `Exported ${count} records (${exportKind === 'auction_eligible' ? 'Auction-Eligible Pool Only' : 'Full Roster CSV'}).`,
        new_values: { exportKind, count },
      });
    },
    [adminSession, appendAudit]
  );

  const resetDemoDatabase = useCallback(() => {
    setSettings(INITIAL_TOURNAMENT_SETTINGS);
    setPlayers(INITIAL_PLAYERS);
    setPayments(INITIAL_PAYMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSeqCounter(106);
    setProcessedKeys({});
  }, []);

  return (
    <TournamentContext.Provider
      value={{
        settings,
        players,
        payments,
        auditLogs,
        adminSession,
        isCloudConnected: isSupabaseConfigured,
        loginAdmin,
        logoutAdmin,
        submitRegistration,
        lookupStatus,
        submitApplicantPaymentProof,
        updatePlayerReview,
        updatePaymentVerification,
        updateTournamentSettings,
        recordCsvExportAudit,
        resetDemoDatabase,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export function useTournament(): TournamentContextValue {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error('useTournament must be used inside a TournamentProvider');
  }
  return ctx;
}
