import React from 'react';
import { Link } from 'react-router-dom';
import { Cricket, PhoneCall, ShieldCheck, YoutubeLogo } from '@phosphor-icons/react';
import { useTournament } from '../context/TournamentContext';

export const Footer: React.FC = () => {
  const { settings } = useTournament();

  return (
    <footer className="border-t-2 border-lime-400/30 bg-zinc-950 py-12 text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 text-zinc-100">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 via-lime-400 to-emerald-500 text-zinc-950">
                <Cricket size={20} weight="fill" />
              </span>
              <span className="font-black italic tracking-tight text-lg text-white">
                {settings.tournament_name}
              </span>
            </div>
            <p className="mt-3 text-sm font-bold text-yellow-300">
              Mansoor · Sultan Sports (Kadapa)
            </p>
            <p className="mt-1 text-sm font-bold text-lime-300">
              Sunil · NR Sports (Vempalli)
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-600/15 px-3 py-1 text-xs font-extrabold text-red-300">
              <YoutubeLogo size={16} weight="fill" className="text-red-500" />
              <span>All Matches Live on YouTube</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-yellow-300">
              Player &amp; Organizer Portal
            </h3>
            <ul className="mt-3 space-y-2 text-sm font-semibold">
              <li>
                <Link to="/register" className="hover:text-lime-300 transition">
                  Register Player (@ ₹399/-)
                </Link>
              </li>
              <li>
                <Link to="/check-status" className="hover:text-lime-300 transition">
                  Check Registration &amp; Payment Status
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="hover:text-amber-300 transition inline-flex items-center gap-1.5"
                >
                  <ShieldCheck size={16} weight="fill" className="text-amber-400" />
                  <span>Organizer Desk (Mansoor &amp; Sunil)</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-lime-300">
              Official Organizer Contact Numbers
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <a
                href="tel:9110744945"
                className="flex items-center gap-2 font-mono font-bold text-amber-300 hover:underline"
              >
                <PhoneCall size={17} weight="fill" />
                <span>Mansoor (Sultan Sports Kadapa): 9110744945</span>
              </a>
              <a
                href="tel:8919155512"
                className="flex items-center gap-2 font-mono font-bold text-lime-300 hover:underline"
              >
                <PhoneCall size={17} weight="fill" />
                <span>Sunil (NR Sports Vempalli): 8919155512</span>
              </a>
            </div>
            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              {settings.privacy_notice}
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>
            © {new Date().getFullYear()} {settings.tournament_name}. Organized by Mansoor (Sultan Sports) &amp; Sunil (NR Sports).
          </p>
          <p>New Kadapa District &amp; Old Kadapa District Players Only</p>
        </div>
      </div>
    </footer>
  );
};
