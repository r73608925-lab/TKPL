import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  UserPlus,
  MagnifyingGlass,
  Trophy,
  Fire,
  YoutubeLogo,
  PhoneCall,
  SpeakerHigh,
  SpeakerSlash,
  Crown,
  TShirt,
  Coins,
  UsersThree,
  MapPin,
  Translate,
} from '@phosphor-icons/react';
import { useTournament } from '../../core/context/TournamentContext';
import { formatInrFromPaise } from '../../core/lib/validation';

interface GuidelineItem {
  badge: string;
  enTitle: string;
  enDesc: string;
  teText: string;
  color: string;
}

const FRANCHISE_GUIDELINES: GuidelineItem[] = [
  {
    badge: '₹1.6L DEPOSIT · 3 YEARS',
    enTitle: 'Franchise Registration & 3-Year Agreement',
    enDesc: 'Pay ₹1,60,000 deposit to register your team franchise with a 3-year official tournament agreement. Conducted every year starting this season.',
    teText: 'టీం రిజిస్ట్రేషన్ తీసుకోవడానికి 1.6L డిపాజిట్ చేయాలి. 3 ఇయర్స్ టోర్నమెంట్ లో అగ్రిమెంట్ ఉంటుంది. ఈ సంవత్సరం నుండి ప్రతి సంవత్సరం టోర్నమెంట్ నిర్వహించడం జరుగుతుంది.',
    color: 'from-amber-500/25 to-yellow-500/10 border-amber-400/50',
  },
  {
    badge: '₹80K AUCTION PURSE',
    enTitle: '₹80,000 Player Bidding Purse & Refund Rule',
    enDesc: 'Out of your ₹1.6L deposit, ₹80,000 is your auction purse to buy players. Any unspent balance remaining from the ₹80K after completing your squad is refunded to you!',
    teText: 'మీరు డిపాజిట్ చేసిన 1.6L లో నుంచి 80K ప్లేయర్స్ సేల్ చేయవచ్చు. 80K లో ప్లేయర్స్ తీసుకున్నాక అమౌంట్ మిగిలితే ఆ అమౌంట్ రిటర్న్ ఇవ్వబడును.',
    color: 'from-lime-500/25 to-emerald-500/10 border-lime-400/50',
  },
  {
    badge: '10K + 10K + 60K SPLIT',
    enTitle: 'Iconic Player, Captain & Remaining Purse',
    enDesc: 'Each team can sign 1 Iconic Player (₹10,000) and 1 Captain (₹10,000), and use the remaining ₹60,000 purse to bid for the rest of the squad.',
    teText: 'ప్రతి టీంలో ఒక ఐకానిక్ ప్లేయర్ 10K మరియు కెప్టెన్ 10K తీసుకోవచ్చు. మరియు మిగిలిన 60K లో మిగిలిన ప్లేయర్స్ ని తీసుకోవలెను.',
    color: 'from-red-500/25 to-orange-500/10 border-red-400/50',
  },
  {
    badge: '15 PLAYERS · BASE PRICES',
    enTitle: '15-Member Squad & Player Base Prices',
    enDesc: 'Every team consists of 15 players. Auction Base Prices: Best Batsman ₹1,000/-, Best Bowler ₹1,000/-, and All-Rounder ₹2,000/-.',
    teText: 'ప్రతి టీం కి 15 మంది ప్లేయర్స్. బెస్ట్ బ్యాట్స్మన్ మరియు బెస్ట్ బౌలర్ కి 1000/- ఆల్ రౌండర్కి 2000/- బేస్ ప్రైస్.',
    color: 'from-cyan-500/25 to-blue-500/10 border-cyan-400/50',
  },
  {
    badge: 'FREE KITS & TEAM SPONSORS',
    enTitle: '1 Set Dress + 1 T-Shirt & 100% Sponsor Benefit',
    enDesc: 'Every player gets 1 full kit dress set + 1 additional T-shirt. If any sponsor backs your team, 100% of that sponsorship amount goes directly to you!',
    teText: 'ప్రతి ప్లేయర్ కి 1 సెట్ డ్రెస్ మరియు 1 టీషర్ట్ ఇవ్వబడును. ఎవరైనా మీ టీం కి స్పాన్సర్ ఇస్తే ఆ అమౌంట్ మీరే తీసుకోవచ్చు.',
    color: 'from-fuchsia-500/25 to-purple-500/10 border-fuchsia-400/50',
  },
  {
    badge: 'YOUTUBE LIVE · KADAPA',
    enTitle: 'All Matches in Kadapa & YouTube Live Telecast',
    enDesc: 'All league matches and the top-teams Grand Final will be played in Kadapa with full YouTube Live Streaming and Man of the Match in every game.',
    teText: 'ప్రతి మ్యాచ్ యూట్యూబ్ లైవ్ టెలికాస్ట్ చేయబడును. ఈ మ్యాచ్ లు అన్ని కడప లోనే నిర్వహించడం జరుగుతుంది. ప్రతి మ్యాచ్ కి మ్యాన్ ఆఫ్ ది మ్యాచ్ ఇవ్వబడును.',
    color: 'from-rose-500/25 to-red-500/10 border-rose-400/50',
  },
];

export const HomePage: React.FC = () => {
  const { settings, players, payments } = useTournament();
  const [isMuted, setIsMuted] = useState(true);
  const [langMode, setLangMode] = useState<'both' | 'te' | 'en'>('both');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const feeFormatted = formatInrFromPaise(settings.fee_paise);

  const auctionEligibleCount = players.filter((p) => {
    const pay = payments.find((py) => py.player_id === p.id);
    return (
      p.registration_status === 'approved' &&
      p.auction_status === 'eligible' &&
      pay?.status === 'verified'
    );
  }).length;

  const toggleSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* SECTION 1: PUNCHY FLOODLIT HERO (Matches Grand Launch Poster & Video) */}
      <section className="relative min-h-[calc(100dvh-7.5rem)] pt-6 pb-14 lg:py-12 flex items-center border-b-2 border-lime-400/30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-950/60 via-zinc-950 to-zinc-950">
        {/* Stadium Floodlight Glow Accents */}
        <div className="pointer-events-none absolute -top-20 left-0 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-red-600/15 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left Column: High-Impact Tournament Pitch */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-7 space-y-5"
            >
              {/* 1. Eyebrow Ribbon */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-600/30">
                  <Fire size={15} weight="fill" className="text-yellow-300" />
                  Gully Cricket to Big Stage
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/50 bg-lime-400/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-lime-300">
                  Guru Laser Ball League
                </span>
              </div>

              {/* 2. Headline */}
              <div>
                <div className="inline-flex items-center gap-2 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-widest mb-1">
                  <Crown size={18} weight="fill" />
                  <span>Tennis Ball Kadapa District Premier League</span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black italic tracking-tighter leading-[0.98]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-400 drop-shadow">
                    T-KPL
                  </span>{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-400 to-yellow-300">
                    KADAPA
                  </span>
                </h1>
              </div>

              {/* 3. Subtext (Eligibility + Auction Note) */}
              <p className="text-sm sm:text-base font-medium text-zinc-200 leading-relaxed max-w-[56ch] rounded-xl border border-yellow-400/30 bg-zinc-900/80 p-3.5">
                <strong className="text-yellow-300">New Kadapa District &amp; Old Kadapa District players allowed only!</strong>{' '}
                Players picked by live Auction Process. Limited Franchises Invited.
              </p>

              {/* 4. Punchy CTAs + Hurry Up ₹399 Badge */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-lime-400 to-emerald-400 px-6 py-4 text-sm sm:text-base font-black uppercase tracking-tight text-zinc-950 shadow-xl shadow-lime-500/25 transition hover:brightness-110 active:scale-[0.98]"
                >
                  <UserPlus size={20} weight="bold" />
                  <span>Register Now @ {feeFormatted}/-</span>
                </Link>

                <Link
                  to="/check-status"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-yellow-400/60 bg-zinc-900/90 px-5 py-4 text-sm sm:text-base font-extrabold text-yellow-300 transition hover:bg-zinc-800 active:scale-[0.98]"
                >
                  <MagnifyingGlass size={18} weight="bold" />
                  <span>Check Status</span>
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Official Grand Launch Video Reel + Quick Highlights */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="lg:col-span-5"
            >
              <div className="overflow-hidden rounded-3xl border-2 border-yellow-400/50 bg-zinc-900 shadow-2xl shadow-lime-500/10">
                <div className="relative mx-auto max-h-[420px] w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                  <video
                    ref={videoRef}
                    src="/assets/grand-launch.mp4"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="h-[380px] sm:h-[420px] w-full object-contain bg-zinc-950"
                  />
                  <button
                    type="button"
                    onClick={toggleSound}
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-yellow-400/60 bg-zinc-950/90 px-3.5 py-2 text-xs font-extrabold text-yellow-300 shadow-lg backdrop-blur hover:bg-zinc-900 active:scale-95"
                  >
                    {isMuted ? (
                      <>
                        <SpeakerSlash size={16} weight="fill" className="text-red-400" />
                        <span>Tap for Anthem Audio</span>
                      </>
                    ) : (
                      <>
                        <SpeakerHigh size={16} weight="fill" className="text-lime-400" />
                        <span>Audio Playing</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live Counters Bar Under Video */}
                <div className="grid grid-cols-3 divide-x divide-zinc-800 border-t border-yellow-400/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-3.5 text-center">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-zinc-400">Player Entry</span>
                    <span className="mt-0.5 block text-lg font-black text-yellow-300">{feeFormatted}/-</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-zinc-400">1st Prize</span>
                    <span className="mt-0.5 block text-lg font-black text-lime-400">₹2,00,000</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-zinc-400">Auction Pool</span>
                    <span className="mt-0.5 block text-sm font-black text-emerald-400 mt-1">
                      {auctionEligibleCount} Verified
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MEGA PRIZE POOL & YOUTUBE LIVE BANNER */}
      <section className="py-12 sm:py-16 border-b border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900/80 to-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-white">
                Mega Championship <span className="text-yellow-400">Prize Pool</span>
              </h2>
              <p className="mt-1 text-sm text-zinc-300">
                स्పాన్సర్ వస్తే ప్రైజ్ మని పెంచబడును · Prize money increases even further as additional sponsors join!
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-600/15 px-4 py-2 text-xs sm:text-sm font-extrabold text-red-300">
              <YoutubeLogo size={22} weight="fill" className="text-red-500" />
              <span>ALL MATCHES ARE YOUTUBE LIVE STREAMING</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* 1st Prize */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-yellow-400/60 bg-gradient-to-br from-yellow-500/20 via-amber-950/40 to-zinc-900 p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-yellow-400 px-3 py-1 text-xs font-black uppercase text-zinc-950">
                  1st Prize · Champions
                </span>
                <Trophy size={32} weight="fill" className="text-yellow-400" />
              </div>
              <p className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-yellow-300">
                ₹2,00,000/-
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                + Grand Winner Trophy (ఫస్ట్ ప్రైజ్ 2,00,000/- ట్రోఫీ)
              </p>
            </div>

            {/* 2nd Prize */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-lime-400/50 bg-gradient-to-br from-lime-500/20 via-emerald-950/40 to-zinc-900 p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-lime-400 px-3 py-1 text-xs font-black uppercase text-zinc-950">
                  2nd Prize · Runners-Up
                </span>
                <Trophy size={32} weight="duotone" className="text-lime-300" />
              </div>
              <p className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-lime-300">
                ₹1,50,000/-
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                + Runners-Up Trophy (సెకండ్ ప్రైజ్ 1,50,000/- ట్రోఫీ)
              </p>
            </div>

            {/* Man of the Series & Match Awards */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/50 bg-gradient-to-br from-red-500/20 via-orange-950/40 to-zinc-900 p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-red-500 px-3 py-1 text-xs font-black uppercase text-white">
                  Special Match Awards
                </span>
                <Fire size={32} weight="fill" className="text-orange-400" />
              </div>
              <p className="mt-5 text-3xl sm:text-4xl font-black tracking-tight text-orange-300">
                ₹5,000/- <span className="text-base font-bold text-zinc-200">MOS</span>
              </p>
              <p className="mt-2 text-xs sm:text-sm font-bold text-white leading-relaxed">
                Man of the Series ₹5,000/- + <span className="text-yellow-300">Man of the Match</span> awarded in every single match!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FRANCHISE OWNERS & AUCTION GUIDELINES (Bilingual English + తెలుగు) */}
      <section className="py-14 sm:py-20 border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/15 border border-amber-400/40 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
                Limited Franchises Invited
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white">
                Franchise Owners &amp; Player Auction Rules
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Official guidelines for Team Owners, Iconic Players, Captains and Auction Base Prices.
              </p>
            </div>

            {/* Language Switcher for Brother & Local Players */}
            <div className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900 p-1 self-start">
              <span className="px-2 text-xs font-bold text-zinc-400 inline-flex items-center gap-1">
                <Translate size={15} className="text-lime-400" />
                Language:
              </span>
              <button
                type="button"
                onClick={() => setLangMode('both')}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  langMode === 'both'
                    ? 'bg-lime-400 text-zinc-950'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                English + తెలుగు
              </button>
              <button
                type="button"
                onClick={() => setLangMode('te')}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  langMode === 'te'
                    ? 'bg-yellow-400 text-zinc-950'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
              <button
                type="button"
                onClick={() => setLangMode('en')}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  langMode === 'en'
                    ? 'bg-emerald-400 text-zinc-950'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* 4 Quick Auction Numbers Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-amber-400/40 bg-zinc-900/90 p-4">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <Coins size={18} weight="duotone" />
                <span>Franchise Deposit</span>
              </div>
              <p className="mt-1 text-2xl font-black text-white">₹1.60 Lakh</p>
              <p className="text-[11px] text-zinc-400">3-Year Tournament Agreement</p>
            </div>

            <div className="rounded-2xl border border-lime-400/40 bg-zinc-900/90 p-4">
              <div className="flex items-center gap-2 text-lime-300 text-xs font-bold">
                <UsersThree size={18} weight="duotone" />
                <span>Player Purse</span>
              </div>
              <p className="mt-1 text-2xl font-black text-lime-300">₹80,000</p>
              <p className="text-[11px] text-zinc-400">10K Iconic + 10K Capt + 60K Squad</p>
            </div>

            <div className="rounded-2xl border border-cyan-400/40 bg-zinc-900/90 p-4">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                <TShirt size={18} weight="duotone" />
                <span>15 Players / Team</span>
              </div>
              <p className="mt-1 text-2xl font-black text-white">₹1K / ₹2K</p>
              <p className="text-[11px] text-zinc-400">Base Price + Free Dress &amp; Tee</p>
            </div>

            <div className="rounded-2xl border border-red-400/40 bg-zinc-900/90 p-4">
              <div className="flex items-center gap-2 text-red-300 text-xs font-bold">
                <MapPin size={18} weight="duotone" />
                <span>Host Venue</span>
              </div>
              <p className="mt-1 text-2xl font-black text-yellow-300">Kadapa</p>
              <p className="text-[11px] text-zinc-400">New &amp; Old Kadapa District Only</p>
            </div>
          </div>

          {/* Detailed Guidelines Grid + Original Telugu Poster Side-by-Side */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FRANCHISE_GUIDELINES.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border bg-gradient-to-br ${item.color} p-5 space-y-2.5`}
                >
                  <span className="inline-block rounded-md bg-zinc-950/90 px-2.5 py-1 font-mono text-[11px] font-black text-yellow-300">
                    {item.badge}
                  </span>
                  {langMode !== 'te' && (
                    <>
                      <h3 className="text-base font-extrabold text-white leading-snug">
                        {item.enTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                        {item.enDesc}
                      </p>
                    </>
                  )}
                  {langMode !== 'en' && (
                    <p className="rounded-xl bg-zinc-950/75 p-3 text-xs sm:text-sm font-semibold text-lime-200 leading-relaxed border border-white/10">
                      {item.teText}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Official Telugu Poster Preview Card */}
            <div className="lg:col-span-4 rounded-3xl border-2 border-amber-400/40 bg-zinc-900 p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Official Telugu Guidelines Sheet
                </span>
              </div>
              <img
                src="/assets/franchise-guidelines-telugu.jpg"
                alt="T-KPL Guru Laser Ball Kadapa Premier League Franchise Owners Guidelines in Telugu"
                className="w-full rounded-2xl border border-zinc-800 object-cover"
              />
              <div className="rounded-xl bg-zinc-950 p-3 text-xs text-zinc-300 space-y-1">
                <p className="font-bold text-white">Franchise &amp; Player Enquiries:</p>
                <p className="text-amber-300 font-mono font-bold">
                  Sultan Sports Kadapa: 9110744945
                </p>
                <p className="text-lime-300 font-mono font-bold">
                  NR Sports Vempalli: 8919155512
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: BOTTOM DUAL ORGANIZER CALLOUT & QUICK REGISTER CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-red-950/40 via-zinc-900 to-lime-950/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black uppercase italic text-white">
            Ready to Take Your Game From <span className="text-yellow-400">Gully Cricket</span> to the <span className="text-lime-400">Big Stage</span>?
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto">
            Register your official player profile now for just <strong className="text-yellow-300">{feeFormatted}/-</strong> and enter the verified T-KPL Auction Pool.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 via-lime-400 to-emerald-400 px-8 py-4 text-base font-black uppercase text-zinc-950 shadow-xl hover:brightness-110 active:scale-95"
            >
              <UserPlus size={22} weight="bold" />
              <span>Register Player ({feeFormatted}/-)</span>
            </Link>
            <a
              href="tel:9110744945"
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/50 bg-zinc-950 px-5 py-4 text-sm font-bold text-amber-300 hover:bg-zinc-900"
            >
              <PhoneCall size={18} weight="fill" />
              <span>Call Sultan Sports: 9110744945</span>
            </a>
            <a
              href="tel:8919155512"
              className="inline-flex items-center gap-2 rounded-2xl border border-lime-400/50 bg-zinc-950 px-5 py-4 text-sm font-bold text-lime-300 hover:bg-zinc-900"
            >
              <PhoneCall size={18} weight="fill" />
              <span>Call NR Sports: 8919155512</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
