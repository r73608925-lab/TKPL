import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Cricket,
  UserPlus,
  MagnifyingGlass,
  ShieldCheck,
  SignOut,
  PhoneCall,
  Camera,
} from '@phosphor-icons/react';
import { useTournament } from '../context/TournamentContext';

const DEFAULT_MANSOOR_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#dc2626"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#g1)"/>
      <circle cx="60" cy="42" r="22" fill="#fde68a"/>
      <path d="M22 108c4-24 22-36 38-36s34 12 38 36" fill="#18181b"/>
      <text x="60" y="102" text-anchor="middle" fill="#facc15" font-family="sans-serif" font-size="14" font-weight="900">MANSOOR</text>
    </svg>
  `);

const DEFAULT_SUNIL_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#84cc16"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#g2)"/>
      <circle cx="60" cy="42" r="22" fill="#ecfccb"/>
      <path d="M22 108c4-24 22-36 38-36s34 12 38 36" fill="#18181b"/>
      <text x="60" y="102" text-anchor="middle" fill="#a3e635" font-family="sans-serif" font-size="14" font-weight="900">SUNIL</text>
    </svg>
  `);

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { adminSession, logoutAdmin } = useTournament();

  const [mansoorPhoto, setMansoorPhoto] = useState<string>(() => {
    try {
      return localStorage.getItem('tkpl_mansoor_photo') || DEFAULT_MANSOOR_AVATAR;
    } catch {
      return DEFAULT_MANSOOR_AVATAR;
    }
  });

  const [sunilPhoto, setSunilPhoto] = useState<string>(() => {
    try {
      return localStorage.getItem('tkpl_sunil_photo') || DEFAULT_SUNIL_AVATAR;
    } catch {
      return DEFAULT_SUNIL_AVATAR;
    }
  });

  const mansoorInputRef = useRef<HTMLInputElement | null>(null);
  const sunilInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'mansoor' | 'sunil'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (side === 'mansoor') {
          setMansoorPhoto(reader.result);
          try {
            localStorage.setItem('tkpl_mansoor_photo', reader.result);
          } catch {
            // Ignore quota errors
          }
        } else {
          setSunilPhoto(reader.result);
          try {
            localStorage.setItem('tkpl_sunil_photo', reader.result);
          } catch {
            // Ignore quota errors
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 shadow-xl bg-zinc-950">
      <input
        ref={mansoorInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoUpload(e, 'mansoor')}
      />
      <input
        ref={sunilInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoUpload(e, 'sunil')}
      />

      {/* TOP DUAL-ORGANIZER BRAND BAR (50/50 Symmetrical Grid on Mobile & Desktop) */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-lime-400 p-1.5 border-b-2 border-red-600">
        <div className="mx-auto max-w-7xl grid grid-cols-2 gap-1.5 sm:gap-3">
          {/* LEFT SIDE ORGANIZER: MANSOOR · SULTAN SPORTS KADAPA */}
          <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-zinc-950/95 p-2 border border-amber-400/60 shadow-md min-w-0">
            <button
              type="button"
              onClick={() => mansoorInputRef.current?.click()}
              title="Tap to upload Mansoor's photo"
              className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-full border-2 border-amber-400 bg-zinc-900 overflow-hidden shadow focus:outline-none"
            >
              <img
                src={mansoorPhoto}
                alt="Mansoor - Sultan Sports Kadapa"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 flex items-center justify-center bg-amber-400/90 py-0.5 text-[8px] font-black text-zinc-950">
                <Camera size={9} weight="fill" />
              </span>
            </button>

            <div className="min-w-0 flex-1 leading-tight">
              <span className="block text-xs sm:text-sm font-black uppercase tracking-tight text-yellow-300 truncate">
                MANSOOR
              </span>
              <span className="block text-[10px] sm:text-xs font-extrabold text-white truncate">
                SULTAN SPORTS
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-amber-300/90 truncate">
                Kadapa
              </span>
              <a
                href="tel:9110744945"
                className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] sm:text-xs font-black text-lime-300 hover:underline"
              >
                <PhoneCall size={11} weight="fill" />
                <span>9110744945</span>
              </a>
            </div>
          </div>

          {/* RIGHT SIDE ORGANIZER: SUNIL · NR SPORTS VEMPALLI */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 rounded-xl bg-zinc-950/95 p-2 border border-lime-400/60 shadow-md min-w-0">
            <div className="min-w-0 flex-1 text-right leading-tight">
              <span className="block text-xs sm:text-sm font-black uppercase tracking-tight text-lime-300 truncate">
                SUNIL
              </span>
              <span className="block text-[10px] sm:text-xs font-extrabold text-white truncate">
                NR SPORTS
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-lime-300/90 truncate">
                Vempalli
              </span>
              <a
                href="tel:8919155512"
                className="mt-0.5 inline-flex items-center justify-end gap-1 font-mono text-[10px] sm:text-xs font-black text-amber-300 hover:underline"
              >
                <PhoneCall size={11} weight="fill" />
                <span>8919155512</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => sunilInputRef.current?.click()}
              title="Tap to upload Sunil's photo"
              className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-full border-2 border-lime-400 bg-zinc-900 overflow-hidden shadow focus:outline-none"
            >
              <img
                src={sunilPhoto}
                alt="Sunil - NR Sports Vempalli"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 flex items-center justify-center bg-lime-400/90 py-0.5 text-[8px] font-black text-zinc-950">
                <Camera size={9} weight="fill" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <div className="h-14 border-b border-lime-500/30 bg-zinc-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-zinc-100 transition hover:opacity-90 focus:outline-none"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 via-lime-400 to-emerald-500 text-zinc-950 shadow-md shadow-lime-500/20">
              <Cricket size={21} weight="fill" />
            </span>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-lime-300 to-emerald-400 leading-none">
                T-KPL
              </span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400 leading-none">
                Guru Laser Ball
              </span>
            </div>
          </Link>

          <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className={`px-2.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition ${
                isActive('/')
                  ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Home
            </Link>

            <Link
              to="/check-status"
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition ${
                isActive('/check-status')
                  ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <MagnifyingGlass size={15} weight="bold" className="hidden sm:inline text-yellow-400" />
              <span>Status</span>
            </Link>

            <Link
              to={adminSession ? '/admin' : '/admin/login'}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition ${
                isActive('/admin')
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ShieldCheck size={15} weight="fill" className="text-amber-400" />
              <span>{adminSession ? 'Desk' : 'Admin'}</span>
            </Link>

            {adminSession ? (
              <button
                type="button"
                onClick={logoutAdmin}
                title="Sign out of Admin Session"
                className="ml-1 flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 active:scale-[0.98]"
              >
                <SignOut size={14} />
                <span className="hidden md:inline">Exit</span>
              </button>
            ) : (
              <Link
                to="/register"
                className="ml-1 flex items-center gap-1 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 px-3 py-1.5 text-xs sm:text-sm font-black uppercase tracking-tight text-zinc-950 shadow-md shadow-red-600/30 transition hover:brightness-110 active:scale-[0.98]"
              >
                <UserPlus size={15} weight="bold" />
                <span>₹399 Register</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
