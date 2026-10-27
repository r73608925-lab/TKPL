import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { TournamentProvider, useTournament } from '../context/TournamentContext';
import {
  buildSafePlayerRosterCsv,
  canRolePerform,
  isValidIndianMobile,
  maskPhoneForReadOnly,
  validatePhotoFile,
  validateRegistrationForm,
} from '../lib/validation';
import { INITIAL_TOURNAMENT_SETTINGS } from '../lib/seedData';
import type { RegistrationFormInput } from '../types/tkpl';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TournamentProvider>{children}</TournamentProvider>
);

const validSampleInput: RegistrationFormInput = {
  full_name: 'N. Kiran Kumar Reddy',
  phone: '9885012345',
  date_of_birth: '2001-05-12',
  locality: 'Kadapa RIMS Road',
  role: 'all_rounder',
  batting_hand: 'right_hand',
  bowling_style: 'right_arm_pace',
  experience: 'Played 3 seasons in Kadapa district hard-tennis tournaments.',
  emergency_contact: '9885099999',
  photo_data_url: 'data:image/jpeg;base64,validphoto',
  photo_file_name: 'kiran_profile.jpg',
  rules_acknowledged: true,
  marketing_consent: true,
  payment_method: 'upi',
  transaction_ref: '430998877665',
};

describe('TKPL Validation, Security & Operational Workflow Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Validates Indian mobile numbers and photo file constraints accurately', () => {
    expect(isValidIndianMobile('9848011223')).toBe(true);
    expect(isValidIndianMobile('+91 98480 11223')).toBe(true);
    expect(isValidIndianMobile('1234567890')).toBe(false);

    // Rejects invalid MIME types
    const pdfCheck = validatePhotoFile({
      name: 'id.pdf',
      type: 'application/pdf',
      size: 102400,
    });
    expect(pdfCheck.valid).toBe(false);

    // Rejects oversized photos (> 5MB)
    const oversizedCheck = validatePhotoFile({
      name: 'huge.jpg',
      type: 'image/jpeg',
      size: 6 * 1024 * 1024,
    });
    expect(oversizedCheck.valid).toBe(false);

    // Accepts valid JPEG under 5MB
    const validCheck = validatePhotoFile({
      name: 'player.jpg',
      type: 'image/jpeg',
      size: 400 * 1024,
    });
    expect(validCheck.valid).toBe(true);
  });

  it('2. Submits valid registration and prevents duplicate records via idempotency and phone check', async () => {
    const { result } = renderHook(() => useTournament(), { wrapper });

    let firstRes: Awaited<ReturnType<typeof result.current.submitRegistration>> | undefined;
    await act(async () => {
      firstRes = await result.current.submitRegistration(validSampleInput, 'idem-key-001');
    });

    expect(firstRes?.registration_no).toBe('TKPL-2026-0106');
    expect(firstRes?.payment_status).toBe('submitted');
    expect(result.current.players.length).toBe(6);

    // Retrying with the exact same idempotency key returns the same record without creating a duplicate
    let retryRes: Awaited<ReturnType<typeof result.current.submitRegistration>> | undefined;
    await act(async () => {
      retryRes = await result.current.submitRegistration(validSampleInput, 'idem-key-001');
    });
    expect(retryRes?.registration_no).toBe('TKPL-2026-0106');
    expect(result.current.players.length).toBe(6);

    // Submitting with a new idempotency key but the same mobile number is rejected
    await expect(
      act(async () => {
        await result.current.submitRegistration(validSampleInput, 'idem-key-002');
      })
    ).rejects.toThrow(/already exists with this mobile number/i);
  });

  it('3. Blocks new registrations server-side when deadline has passed or registration is closed', () => {
    const closedSettings = { ...INITIAL_TOURNAMENT_SETTINGS, registration_open: false };
    const closedErrors = validateRegistrationForm(validSampleInput, closedSettings);
    expect(closedErrors.form).toMatch(/currently closed/i);

    const expiredSettings = {
      ...INITIAL_TOURNAMENT_SETTINGS,
      deadline: '2020-01-01T00:00:00.000Z',
    };
    const expiredErrors = validateRegistrationForm(
      validSampleInput,
      expiredSettings,
      new Date('2026-10-27T00:00:00.000Z')
    );
    expect(expiredErrors.form).toMatch(/deadline.*has passed/i);
  });

  it('4. Protects status lookup against phone enumeration by requiring Registration No + Phone + DOB', async () => {
    const { result } = renderHook(() => useTournament(), { wrapper });

    // Correct phone but wrong Registration No -> returns null
    const wrongReg = await result.current.lookupStatus(
      'TKPL-2026-9999',
      '9848011223',
      '1999-04-14'
    );
    expect(wrongReg).toBeNull();

    // Correct Registration No and Phone, but wrong DOB -> returns null
    const wrongDob = await result.current.lookupStatus(
      'TKPL-2026-0101',
      '9848011223',
      '2000-01-01'
    );
    expect(wrongDob).toBeNull();

    // Exact match -> returns safe status lookup summary
    const validLookup = await result.current.lookupStatus(
      'TKPL-2026-0101',
      '9848011223',
      '1999-04-14'
    );
    expect(validLookup).not.toBeNull();
    expect(validLookup?.full_name).toBe('Syed Irfan Basha');
    expect(validLookup?.auction_status).toBe('eligible');
  });

  it('5. Enforces strict Role-Based Access Control (RBAC) across reviewers, payment verifiers and helpers', () => {
    // Registration reviewer can review players, but CANNOT verify payments or change settings
    expect(canRolePerform('registration_reviewer', 'review_player')).toBe(true);
    expect(canRolePerform('registration_reviewer', 'verify_payment')).toBe(false);
    expect(canRolePerform('registration_reviewer', 'manage_settings')).toBe(false);

    // Payment verifier can verify payments, but CANNOT review players or export CSV
    expect(canRolePerform('payment_verifier', 'verify_payment')).toBe(true);
    expect(canRolePerform('payment_verifier', 'review_player')).toBe(false);
    expect(canRolePerform('payment_verifier', 'export_csv')).toBe(false);

    // Read-only helper gets masked phone numbers and cannot mutate anything
    expect(maskPhoneForReadOnly('9848011223', 'read_only_helper')).toBe('98******23');
    expect(maskPhoneForReadOnly('9848011223', 'super_admin')).toBe('9848011223');
  });

  it('6. Prevents marking a player Auction Eligible until their payment is Verified and profile is Approved', () => {
    const { result } = renderHook(() => useTournament(), { wrapper });

    act(() => {
      result.current.loginAdmin('registration_reviewer');
    });

    // Player plr-103 (Mohammed Toufeeq) has payment status 'submitted' (not yet verified)
    expect(() => {
      act(() => {
        result.current.updatePlayerReview({
          playerId: 'plr-103',
          registrationStatus: 'approved',
          auctionStatus: 'eligible',
          reviewNotes: 'Trying to mark eligible before payment verified',
        });
      });
    }).toThrow(/until their registration fee payment is Verified/i);

    // Now switch to payment_verifier, verify payment pay-203, then switch back to reviewer and mark eligible
    act(() => {
      result.current.loginAdmin('payment_verifier');
    });

    act(() => {
      result.current.updatePaymentVerification({
        paymentId: 'pay-203',
        status: 'verified',
        transactionRef: '430188472910',
        notes: 'Matched against bank statement',
      });
    });

    act(() => {
      result.current.loginAdmin('registration_reviewer');
    });

    act(() => {
      result.current.updatePlayerReview({
        playerId: 'plr-103',
        registrationStatus: 'approved',
        auctionStatus: 'eligible',
        reviewNotes: 'Approved after payment verification',
      });
    });

    const updatedToufeeq = result.current.players.find((p) => p.id === 'plr-103');
    expect(updatedToufeeq?.auction_status).toBe('eligible');
  });

  it('7. Exports only approved + verified + auction-eligible players when exporting the Auction Pool CSV', () => {
    const { result } = renderHook(() => useTournament(), { wrapper });

    const auctionCsv = buildSafePlayerRosterCsv(
      result.current.players,
      result.current.payments,
      { onlyAuctionEligible: true }
    );
    const lines = auctionCsv.trim().split('\n');
    // Header + 2 initially eligible players (plr-101 and plr-102)
    expect(lines.length).toBe(3);
    expect(auctionCsv).toContain('Syed Irfan Basha');
    expect(auctionCsv).toContain('K. Venkata Ramana Reddy');
    expect(auctionCsv).not.toContain('P. Harish Kumar');
  });
});
