import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, YoutubeLogo } from '@phosphor-icons/react';
import { useTournament } from '../context/TournamentContext';
import { formatInrFromPaise } from '../lib/validation';
import { BrandMark } from './BrandLogo';
import { OrganizerStrip } from './OrganizerStrip';

export const Footer: React.FC = () => {
  const { settings } = useTournament();
  const location = useLocation();
  const feeFormatted = formatInrFromPaise(settings.fee_paise);
  const compact = location.pathname.startsWith('/admin');

  if (compact) {
    return (
      <footer className="border-t border-brand-line/80 bg-brand-ink px-4 py-6 text-brand-muted sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs sm:flex-row">
          <div className="flex items-center gap-2">
            <BrandMark size={24} />
            <span className="font-semibold text-zinc-300">{settings.tournament_name}</span>
          </div>
          <p>© {new Date().getFullYear()} · New Kadapa District &amp; Old Kadapa District players only</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-brand-line/80 bg-brand-ink px-4 py-12 text-brand-muted sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_1.4fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark size={36} />
              <span className="font-display text-sm leading-tight font-black tracking-tight text-white">
                {settings.tournament_name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-xs leading-relaxed">{settings.privacy_notice}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-brand-line px-3 py-1 text-[11px] font-semibold text-zinc-300">
              <YoutubeLogo size={15} weight="fill" className="text-brand-red" />
              <span>All matches live on YouTube</span>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold tracking-[0.22em] text-zinc-400 uppercase">
              Quick links
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/register" className="transition hover:text-brand-lime">
                  Register ({feeFormatted}/-)
                </Link>
              </li>
              <li>
                <Link to="/check-status" className="transition hover:text-brand-lime">
                  Check status
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 transition hover:text-brand-yellow"
                >
                  <ShieldCheck size={14} weight="fill" />
                  <span>Organizer desk</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold tracking-[0.22em] text-zinc-400 uppercase">
              Organizers
            </h3>
            <div className="mt-3">
              <OrganizerStrip compact />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-brand-line/70 pt-6 text-[11px] sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.tournament_name}. Organized by Mansoor (Sultan
            Sports) &amp; Sunil (NR Sports).
          </p>
          <p>New Kadapa District &amp; Old Kadapa District players only</p>
        </div>
      </div>
    </footer>
  );
};
