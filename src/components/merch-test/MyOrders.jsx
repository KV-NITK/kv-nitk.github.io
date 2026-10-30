import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import { PageShell } from "@p26/chrome/page-shell";
import { En } from "@p26/lib/prefs";
import { cn } from "@/lib/utils";
import API_URL from "../../api/api";
import { getMyPasses, getMyPayments, getPayment } from "../../api/payments";
import { STATUS_STYLES, discountParts, itemLabel, rupees } from "./orderFormat";

// Unfinished orders are re-checked with Cashfree on load (the webhook may be late)
const MAX_AUTO_REFRESH = 5;

// Same brick wall as the merch shop
const BRICK = {
  backgroundColor: "#563520",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23452917' fill-opacity='0.8'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/svg%3E")`,
  backgroundSize: "84px 88px",
};

const FILTERS = [
  { id: "all", en: "All", kn: "ಎಲ್ಲಾ" },
  { id: "merch", en: "Merch", kn: "ಅಂಗಡಿ" },
  { id: "food", en: "Food coupons", kn: "ಊಟದ ಕೂಪನ್" },
  { id: "photo", en: "Photo booth", kn: "ಫೋಟೋ ಬೂತ್" },
];

// Food coupons and photo sessions are always ordered on their own, so one
// line says what an order is: "food", "photo" or "merch" (the FILTERS ids)
const orderKind = (order) =>
  order.items.some((it) => it.category === "FOOD") ? "food" : order.items.some((it) => it.category === "PHOTO") ? "photo" : "merch";

const KIND_HEADINGS = {
  food: { en: "Food coupons", kn: "ಭೂರಿ ಭೋಜನ" },
  photo: { en: "Photo booth", kn: "ಫೋಟೋ ಬೂತ್" },
  merch: { en: "Merch", kn: "ಪರ್ವ ಅಂಗಡಿ" },
};

const PASS_HINTS = {
  food: "One QR code per coupon. Tap one at the food counter to show it.",
  photo: "One QR code per session. Tap one at the photo booth to show it.",
  merch: "Tap a pass to show its QR code when you collect your merch.",
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || { label: status, className: "bg-neutral-200 text-neutral-700" };

  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.className}`}>{style.label}</span>;
};

const pill = "rounded-full bg-[#f3ead5] px-4 py-2 font-bold text-[#4a2a12] shadow-md transition-transform hover:-translate-y-0.5";

// Merch is named by what it is to the buyer (Oversized, L), not by the product row name
const merchLabel = (pass) => [pass.fit, pass.variant].filter(Boolean).join(", ") || pass.item_name;

const passName = (pass) =>
  pass.category === "FOOD"
    ? `Food coupon${pass.variant ? ` (${pass.variant})` : ""} #${pass.item_index}`
    : pass.category === "PHOTO"
      ? `Photo session${pass.variant ? ` (${pass.variant})` : ""} #${pass.item_index}`
      : `${merchLabel(pass)} #${pass.item_index}`;

// Placeholder for a locked coupon, seen when the leaf is stirred: a QR picture of
// fixed text, never the coupon's token (the server does not send it while locked)
const LOCKED_QR_TEXT = "PARVA-2026-QR-LOCKED";

const formatUnlockDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" });

const passState = (pass) =>
  pass.status === "CLAIMED"
    ? `Used${pass.claimed_at ? ` · ${formatDate(pass.claimed_at)}` : ""}`
    : pass.status === "VOID"
      ? "Void"
      : "Not used yet";

// One pass per food coupon or shirt, as a ticket. The QR code is only made
// when the ticket is opened, so the page never shows them all at once.
const PassTicket = ({ pass, onOpen }) => {
  const usable = pass.status === "ISSUED";

  return (
    <button
      type="button"
      onClick={() => onOpen(pass)}
      className={cn(
        "flex flex-col items-center gap-1 rounded-[6px] border-2 border-dashed bg-white px-2 py-3 text-center transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a5530]",
        usable ? "border-[#8a5530]" : "border-[#c2aa84] opacity-55"
      )}
    >
      <QrIcon className="size-10 text-[#4a2a12]" />
      <span className="text-xs font-bold">{passName(pass)}</span>
      <span className={cn("text-xs font-semibold", usable ? "text-emerald-800" : "text-red-700")}>{passState(pass)}</span>
      {usable && <span className="mt-1 rounded-full bg-[#8a5530] px-3 py-1 text-xs font-bold text-[#f3ead5]">Show QR</span>}
    </button>
  );
};

const QrIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h4v2h-4v-2zm-4 4h2v2h-2v-2zm4 0h4v4h-2v-2h-2v-2zm-2 2h2v2h-2v-2z" />
  </svg>
);

// The Bhoori Bhojana meal is on 31 Oct 2026 at 12:00 noon IST
const MEAL_START = new Date("2026-10-31T12:00:00+05:30");

const countdownParts = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));

  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

const CountdownUnit = ({ value, kn, en }) => (
  <div className="flex min-w-0 flex-1 flex-col items-center">
    <span className="w-full rounded-[4px] border border-[#c2aa84] bg-white py-2 font-mono text-3xl font-black tabular-nums leading-none text-[#4a2a12] shadow-[0_2px_0_#c2aa84] sm:text-4xl">
      {String(value).padStart(2, "0")}
    </span>
    <span lang="kn" className="mt-1.5 text-[11px] font-bold">{kn}</span>
    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#4a2a12]/70">{en}</span>
  </div>
);

// The ticking that plays while the countdown is on screen. The file is a looping clip
// in public/; while it is missing nothing plays and no sound button is shown.
const TICK_SRC = "/parva26/audio/doomsday-tick.mp3";
const MUTE_KEY = "parva_countdown_muted";

const readMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
};

// Plays TICK_SRC in a loop for as long as `active`. Opening a pass is a tap, so the
// browser allows it to start; if it is refused anyway, the page just stays quiet.
const useTickSound = (active, muted) => {
  const audioRef = useRef(null);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!active || typeof Audio === "undefined") return undefined;

    const audio = new Audio(TICK_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.addEventListener("canplaythrough", () => setAvailable(true), { once: true });
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
      setAvailable(false);
    };
  }, [active]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !available) return undefined;

    const sync = () => {
      if (muted || document.hidden) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
    };

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [available, muted]);

  return available;
};

// Countdown to the Bhoori Bhojana meal, in the colours of the page: parchment,
// brown ink, and the kumkum red and arishina yellow of the Kannada flag.
const MealCountdown = () => {
  const [left, setLeft] = useState(() => MEAL_START.getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setLeft(MEAL_START.getTime() - Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const started = left <= 0;
  const t = countdownParts(left);

  const [muted, setMuted] = useState(readMuted);
  const hasSound = useTickSound(!started, muted);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      // Private mode: the choice lasts until the pass is closed
    }
  };

  return (
    <div className="relative mt-4 overflow-hidden rounded-[6px] border-2 border-dashed border-[#8a5530] bg-[#e9dcb9] px-3 pb-3 pt-5 text-center">
      {/* Kannada flag stripe: yellow over red */}
      <div className="absolute inset-x-0 top-0 flex h-1.5 flex-col" aria-hidden>
        <span className="h-1/2 bg-[#f7b928]" />
        <span className="h-1/2 bg-[#a3231a]" />
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a3231a]">Bhoori Bhojana · 31 October · 12 noon</p>
      {/* The heading stays centred; the sound button sits at the right end of the same line */}
      <div className="relative mt-1">
        <p lang="kn" className="px-10 font-poster text-2xl leading-tight">
          {started ? "ಭೂರಿ ಭೋಜನ ಶುರುವಾಗಿದೆ!" : "ಭೂರಿ ಭೋಜನಕ್ಕೆ ಇನ್ನು"}
        </p>
        {hasSound && (
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Turn the countdown sound on" : "Turn the countdown sound off"}
            className="absolute right-0 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#4a2a12]/45 bg-[#4a2a12]/30 text-base shadow-sm hover:bg-[#4a2a12]/45"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        )}
      </div>
      {!started && <p className="mt-0.5 text-xs font-bold text-[#4a2a12]/80">Time remaining for Bhoori Bhojana</p>}

      {started ? (
        <p className="mt-2 text-sm font-semibold">The feast has begun. Enjoy!</p>
      ) : (
        <>
          <div className="mt-3 flex items-start gap-1" role="timer" aria-label={`${t.days} days ${t.hours} hours ${t.minutes} minutes to go`}>
            <CountdownUnit value={t.days} kn="ದಿನ" en="days" />
            <span className="pt-2 font-mono text-2xl font-black text-[#a3231a]">:</span>
            <CountdownUnit value={t.hours} kn="ಗಂಟೆ" en="hours" />
            <span className="pt-2 font-mono text-2xl font-black text-[#a3231a]">:</span>
            <CountdownUnit value={t.minutes} kn="ನಿಮಿಷ" en="mins" />
            <span className="pt-2 font-mono text-2xl font-black text-[#a3231a]">:</span>
            <CountdownUnit value={t.seconds} kn="ಸೆಕೆಂಡ್" en="secs" />
          </div>
          <p className="mt-2 font-poster text-xl leading-tight text-[#a3231a]">
            <span lang="kn">ಮಾತ್ರ!</span> <span className="text-base tracking-wide">· only!</span>
          </p>
        </>
      )}
    </div>
  );
};

// ---------- the banana leaf that holds a food coupon's QR ----------

// Each half is drawn with its midrib on the inner edge. The left half is drawn
// mirrored point by point (not flipped with a transform: a flipped element breaks
// the lighting filters in Chromium), so both halves share one light.
const mirrorX = (flip) => (x) => (flip ? 100 - x : x);

// A frayed outer edge, the same every render
const frayedEdge = (m) => {
  let d = `M${m(0)} 0 L${m(95)} 0`;
  for (let y = 5; y <= 200; y += 5) {
    d += ` L${m(96.4 + Math.sin(y * 1.7) * 1.5 + Math.sin(y * 0.31) * 0.9)} ${y}`;
  }
  return `${d} L${m(0)} 200 Z`;
};

// The leaf's ribbing: banana leaves are pleated along their veins, which run out
// from the midrib and droop towards the edge. Every fifth ridge is higher.
const PLEATS = Array.from({ length: 100 }, (_, i) => i * 2.3 - 34);
const CREASES = [
  [4, 38, 30, 52, 58, 30, 96, 58],
  [6, 104, 34, 96, 62, 128, 96, 118],
  [10, 160, 40, 150, 64, 178, 96, 170],
];
const TEARS = [24, 66, 109, 151, 184];

const pleatPath = (m, y) => `M${m(0)} ${y} Q${m(50)} ${y + 9} ${m(100)} ${y + 31}`;
const creasePath = (m, [x1, y1, c1x, c1y, c2x, c2y, x2, y2]) => `M${m(x1)} ${y1} C${m(c1x)} ${c1y} ${m(c2x)} ${c2y} ${m(x2)} ${y2}`;

// The height map the lighting reads: ridges along the veins, a few cross creases.
// Only its alpha matters, so the colour is irrelevant.
const LeafHeights = ({ m }) => (
  <>
    {PLEATS.map((y, i) => (
      <path
        key={y}
        d={pleatPath(m, y)}
        fill="none"
        stroke="#fff"
        strokeWidth={i % 5 === 0 ? 1.3 : 0.6}
        strokeOpacity={i % 5 === 0 ? 0.9 : 0.35 + ((i * 37) % 10) / 40}
      />
    ))}
    {CREASES.map((c) => (
      <path key={c.join()} d={creasePath(m, c)} fill="none" stroke="#fff" strokeWidth="3" strokeOpacity="0.55" strokeLinecap="round" />
    ))}
  </>
);

// Turns LeafHeights into a surface: blurred ridges plus low, stretched noise for the
// wrinkles, as one height field
const HeightChain = ({ seed }) => (
  <>
    <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="veins" />
    <feTurbulence type="fractalNoise" baseFrequency="0.009 0.028" numOctaves="3" seed={seed} result="noise" />
    <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.8 0 0 0 -0.4" result="wrinkles" />
    <feComposite in="veins" in2="wrinkles" operator="arithmetic" k1="0" k2="0.42" k3="0.85" k4="0" result="height" />
  </>
);

// One half of the leaf. The surface is lit: diffuse light gives the ribbing and
// wrinkles their relief, a specular pass the waxy shine. `flap` adds the curve of a
// folded-over half.
const LeafHalf = ({ id, seed, flip, flap }) => {
  const m = mirrorX(flip);
  const region = { filterUnits: "userSpaceOnUse", x: 0, y: 0, width: 100, height: 200, colorInterpolationFilters: "sRGB" };
  // Gradients run from the midrib outwards
  const across = flip ? { x1: "1", x2: "0" } : { x1: "0", x2: "1" };

  return (
    <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="size-full" aria-hidden>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={frayedEdge(m)} />
        </clipPath>
        <linearGradient id={`${id}-body`} {...across} y1="0" y2="0.15">
          <stop offset="0" stopColor="#3a8c3a" />
          <stop offset="0.3" stopColor="#56ad49" />
          <stop offset="0.72" stopColor="#47a042" />
          <stop offset="1" stopColor="#2f7d35" />
        </linearGradient>
        <linearGradient id={`${id}-rib`} {...across} y1="0" y2="0">
          <stop offset="0" stopColor="#9fb15a" />
          <stop offset="0.35" stopColor="#f1f5bf" />
          <stop offset="0.7" stopColor="#b9c86c" />
          <stop offset="1" stopColor="#6e8a3c" />
        </linearGradient>
        <linearGradient id={`${id}-ribshade`} {...across} y1="0" y2="0">
          <stop offset="0" stopColor="#0d3314" stopOpacity="0.45" />
          <stop offset="1" stopColor="#0d3314" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-curve`} {...across} y1="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#06210b" stopOpacity="0.42" />
        </linearGradient>
        <filter id={`${id}-relief`} {...region}>
          <HeightChain seed={seed} />
          <feDiffuseLighting in="height" surfaceScale="4" diffuseConstant="0.7" lightingColor="#ffffff">
            <feDistantLight azimuth="230" elevation="52" />
          </feDiffuseLighting>
        </filter>
        <filter id={`${id}-gloss`} {...region}>
          <HeightChain seed={seed} />
          <feSpecularLighting in="height" surfaceScale="4" specularConstant="0.75" specularExponent="18" lightingColor="#f4ffe0">
            <feDistantLight azimuth="230" elevation="36" />
          </feSpecularLighting>
        </filter>
        <filter id={`${id}-mottle`} {...region}>
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.018" numOctaves="2" seed={seed + 11} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.78  0 0 0 0 0.82  0 0 0 0 0.24  1 0 0 0 -0.42" />
        </filter>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        <rect width="100" height="200" fill={`url(#${id}-body)`} />
        {/* Patches of yellower green, as on a real leaf */}
        <rect width="100" height="200" filter={`url(#${id}-mottle)`} opacity="0.45" />
        {/* Relief and shine */}
        <g filter={`url(#${id}-relief)`} style={{ mixBlendMode: "overlay" }}>
          <LeafHeights m={m} />
        </g>
        <g filter={`url(#${id}-gloss)`} opacity="0.55" style={{ mixBlendMode: "screen" }}>
          <LeafHeights m={m} />
        </g>
        {/* The finest veins, catching the light */}
        {PLEATS.filter((_, i) => i % 3 === 0).map((y) => (
          <path key={`v${y}`} d={pleatPath(m, y)} fill="none" stroke="#e4f7c4" strokeOpacity="0.16" strokeWidth="0.35" />
        ))}
        {/* Splits along the veins, from the edge in */}
        {TEARS.map((y) => (
          <g key={`t${y}`}>
            <path d={`M${m(100)} ${y + 30} Q${m(80)} ${y + 21} ${m(64)} ${y + 14}`} fill="none" stroke="#0a2a10" strokeOpacity="0.6" strokeWidth="0.75" strokeLinecap="round" />
            <path d={`M${m(100)} ${y + 31.2} Q${m(80)} ${y + 22.2} ${m(65)} ${y + 15.4}`} fill="none" stroke="#c8ec9c" strokeOpacity="0.35" strokeWidth="0.4" strokeLinecap="round" />
          </g>
        ))}
        {flap && <rect width="100" height="200" fill={`url(#${id}-curve)`} />}
        {/* Dried, yellowed edge */}
        <path d={frayedEdge(m)} fill="none" stroke="#a89a45" strokeOpacity="0.6" strokeWidth="1.8" />
        {/* Midrib: a rounded tube, and its shadow on the blade */}
        <rect x={flip ? 87.4 : 3.6} width="9" height="200" fill={`url(#${id}-ribshade)`} />
        <rect x={flip ? 96.2 : 0} width="3.8" height="200" fill={`url(#${id}-rib)`} />
      </g>
    </svg>
  );
};

const flapStyle = (side, open) => ({
  transformOrigin: side === "left" ? "0% 50%" : "100% 50%",
  transform: `rotateY(${open ? (side === "left" ? -135 : 135) : 0}deg)`,
  transition: "transform 1500ms cubic-bezier(0.22, 0.8, 0.24, 1)",
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
});

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// The coupon's QR lies on a banana leaf under two folded flaps. Locked, the flaps stay
// shut under a brass seal and tapping lifts them for a peek at a placeholder QR.
// Unlocked, they swing open once and the QR is served on the leaf.
const LeafReveal = ({ locked, label, children }) => {
  const [open, setOpen] = useState(false);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const sealRef = useRef(null);

  useEffect(() => {
    if (locked) return undefined;
    if (prefersReducedMotion()) {
      setOpen(true);
      return undefined;
    }
    const timer = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(timer);
  }, [locked]);

  // The seal breathes while the coupon is locked
  useEffect(() => {
    if (!locked || prefersReducedMotion() || !sealRef.current?.animate) return undefined;
    const breathing = sealRef.current.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.07)" }],
      { duration: 1600, direction: "alternate", iterations: Infinity, easing: "ease-in-out" }
    );
    return () => breathing.cancel();
  }, [locked]);

  const stir = useCallback(() => {
    if (!locked || prefersReducedMotion()) return;
    for (const [ref, deg] of [[leftRef, -40], [rightRef, 40]]) {
      ref.current?.animate?.(
        [{ transform: "rotateY(0deg)" }, { transform: `rotateY(${deg}deg)`, offset: 0.35 }, { transform: `rotateY(${deg}deg)`, offset: 0.6 }, { transform: "rotateY(0deg)" }],
        { duration: 1400, easing: "ease-in-out" }
      );
    }
  }, [locked]);

  // Opening the pass plays the peek once by itself; a tap plays it again
  useEffect(() => {
    if (!locked) return undefined;
    const timer = setTimeout(stir, 500);
    return () => clearTimeout(timer);
  }, [locked, stir]);

  return (
    <div
      className="relative mx-auto mt-4 aspect-square w-full max-w-[18rem] select-none [filter:drop-shadow(0_10px_14px_rgba(20,50,20,0.45))]"
      style={{ perspective: "1000px" }}
      onClick={stir}
      role="img"
      aria-label={label}
    >
      {/* The leaf the QR is served on, with sprinkled water */}
      <div className="absolute inset-0 overflow-hidden rounded-[10px]">
        <div className="absolute inset-0 flex">
          <div className="h-full w-1/2"><LeafHalf id="bed-l" seed={3} flip /></div>
          <div className="h-full w-1/2"><LeafHalf id="bed-r" seed={8} /></div>
        </div>
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <radialGradient id="drop" cx="0.45" cy="0.4" r="0.6">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="0.7" stopColor="#d8f5c8" stopOpacity="0.18" />
              <stop offset="1" stopColor="#0d3a14" stopOpacity="0.5" />
            </radialGradient>
          </defs>
          {[[12, 14, 2.2], [86, 20, 1.8], [18, 84, 2], [90, 80, 2.4], [7, 50, 1.4], [94, 52, 1.5], [50, 5, 1.5], [46, 95.5, 1.7], [30, 4, 1]].map(([cx, cy, r]) => (
            <g key={`${cx}-${cy}`}>
              <ellipse cx={cx + r * 0.35} cy={cy + r * 0.45} rx={r} ry={r * 0.85} fill="#062a0c" fillOpacity="0.28" />
              <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.9} fill="url(#drop)" />
              <ellipse cx={cx - r * 0.35} cy={cy - r * 0.35} rx={r * 0.32} ry={r * 0.22} fill="#ffffff" fillOpacity="0.9" />
            </g>
          ))}
        </svg>
      </div>

      {/* The QR, on a white cloth */}
      <div className="absolute inset-[12%] rounded-[6px] bg-white p-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.35)]">{children}</div>

      {/* The two folded flaps */}
      <div ref={leftRef} className="absolute inset-y-0 left-0 w-1/2 overflow-hidden rounded-l-[10px]" style={flapStyle("left", open)}>
        <LeafHalf id="flap-l" seed={5} flip flap />
      </div>
      <div ref={rightRef} className="absolute inset-y-0 right-0 w-1/2 overflow-hidden rounded-r-[10px]" style={flapStyle("right", open)}>
        <LeafHalf id="flap-r" seed={13} flap />
      </div>

      {/* Brass seal, while locked */}
      <div
        ref={sealRef}
        className={cn(
          "absolute inset-0 m-auto flex size-[4.2rem] items-center justify-center rounded-full border-2 border-[#7a4f12] shadow-[0_3px_8px_rgba(0,0,0,0.55),inset_0_2px_3px_rgba(255,240,180,0.8)] transition-opacity duration-700",
          locked ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{ backgroundImage: "radial-gradient(circle at 32% 28%, #ffe58a, #f7b928 45%, #a8700f)" }}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="size-8 text-[#4a2a12]" fill="currentColor">
          <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3H9zm3 4a2 2 0 0 1 1 3.7V19h-2v-1.3A2 2 0 0 1 12 14z" />
        </svg>
      </div>
    </div>
  );
};

// The QR code of one pass, made when it is opened, with the rules beside it.
const PassQr = ({ pass, onClose }) => {
  const [src, setSrc] = useState("");
  const usable = pass.status === "ISSUED";
  const locked = usable && Boolean(pass.locked);

  useEffect(() => {
    if (!usable) return;
    QRCode.toDataURL(locked ? LOCKED_QR_TEXT : pass.token, { width: 640, margin: 2, errorCorrectionLevel: "M" }).then(setSrc).catch(() => setSrc(""));
  }, [pass.token, usable, locked]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={passName(pass)}
        className="relative w-full max-w-sm rounded-[8px] bg-[#f3ead5] p-5 text-center font-kn-body text-[#4a2a12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/10 font-bold hover:bg-black/20"
        >
          ✕
        </button>
        <h3 className="font-poster text-2xl leading-none">{passName(pass)}</h3>
        <p className={cn("mt-1 text-sm font-bold", usable ? "text-emerald-800" : "text-red-700")}>{passState(pass)}</p>

        {locked ? (
          <>
            <LeafReveal locked label="Food coupon QR, locked">
              {src && <img src={src} alt="" aria-hidden className="size-full [image-rendering:pixelated]" />}
            </LeafReveal>
            <MealCountdown />
            <div role="note" className="mt-4 rounded border-2 border-[#c2aa84] bg-white/60 p-3 text-left text-sm">
              <p className="text-base font-bold leading-snug">Your food coupon QR unlocks on {formatUnlockDate(pass.qr_unlock_at)}.</p>
              <p className="mt-1">Your coupon is booked. Come back to this page on the day to show its QR code at the counter.</p>
              <p lang="kn" className="mt-2 font-semibold">
                ನಿಮ್ಮ ಊಟದ ಕೂಪನ್ ಬುಕ್ ಆಗಿದೆ. QR ಕೋಡ್ {formatUnlockDate(pass.qr_unlock_at)} ರಿಂದ ಲಭ್ಯವಾಗುತ್ತದೆ.
              </p>
            </div>
          </>
        ) : usable ? (
          <>
            {pass.category === "FOOD" ? (
              <LeafReveal locked={false} label={`QR code for ${passName(pass)}`}>
                {src && <img src={src} alt={`QR code for ${passName(pass)}`} className="size-full [image-rendering:pixelated]" />}
              </LeafReveal>
            ) : (
              <div className="mx-auto mt-4 aspect-square w-full max-w-[18rem] rounded-[6px] bg-white p-2">
                {src && <img src={src} alt={`QR code for ${passName(pass)}`} className="size-full [image-rendering:pixelated]" />}
              </div>
            )}
            <div role="note" className="mt-4 rounded border-2 border-red-300 bg-red-50 p-3 text-left text-sm text-red-900">
              <p className="font-bold">Do not share this QR code with anyone.</p>
              <p className="mt-1">It can be scanned only once. Whoever shows it first gets the {pass.category === "FOOD" ? "meal" : pass.category === "PHOTO" ? "photo session" : "item"}, so show it only at the {pass.category === "PHOTO" ? "booth" : "counter"}.</p>
              <p lang="kn" className="mt-2 font-semibold">
                ಈ QR ಕೋಡ್ ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ಇದನ್ನು ಒಮ್ಮೆ ಮಾತ್ರ ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತದೆ.
              </p>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm">This pass has already been {pass.status === "VOID" ? "cancelled" : "used"}, so it has no QR code.</p>
        )}
      </div>
    </div>
  );
};

const MyOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const loginFailed = searchParams.has("login_error");
  const filter = FILTERS.some((f) => f.id === searchParams.get("show")) ? searchParams.get("show") : "all";
  const [user, setUser] = useState(undefined); // undefined = checking, null = logged out
  const [orders, setOrders] = useState(null);
  const [passes, setPasses] = useState([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(() => new Set());
  const [openPass, setOpenPass] = useState(null);
  const closePass = useCallback(() => setOpenPass(null), []);

  const setFilter = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === "all") next.delete("show");
    else next.set("show", id);
    setSearchParams(next, { replace: true });
  };

  const refreshOrder = useCallback(async (paymentId) => {
    setRefreshing((prev) => new Set(prev).add(paymentId));

    try {
      const updated = await getPayment(paymentId);
      setOrders((prev) => prev?.map((o) => (o.paymentId === paymentId ? updated : o)));
      // A check that finds it paid issues its passes
      if (updated.status === "SUCCESS") setPasses(await getMyPasses());
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing((prev) => {
        const next = new Set(prev);
        next.delete(paymentId);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
        const data = res.ok ? await res.json() : null;

        if (cancelled) return;

        if (!data?.success || !data.user) {
          setUser(null);
          return;
        }

        setUser(data.user);

        const list = await getMyPayments();
        if (cancelled) return;

        setOrders(list);
        getMyPasses()
          .then((p) => !cancelled && setPasses(p))
          .catch(() => {});

        list
          .filter((o) => o.status === "PENDING")
          .slice(0, MAX_AUTO_REFRESH)
          .forEach((o) => refreshOrder(o.paymentId));
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshOrder]);

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/iris?redirect=/my-orders`;
  };

  const counts = { all: orders?.length ?? 0 };
  for (const o of orders ?? []) counts[orderKind(o)] = (counts[orderKind(o)] ?? 0) + 1;
  const shown = orders?.filter((o) => filter === "all" || filter === orderKind(o));

  return (
    <PageShell title="ನನ್ನ ಆರ್ಡರ್‌ಗಳು · My Orders" topBar={{ home: "/parva-26#parva-sante", ticket: false }}>
      <main className="flex min-h-screen justify-center p-4 pb-20 pt-24" style={BRICK}>
        <div className="w-full max-w-2xl">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link to="/parva-26/merch" className={pill}>
              Merch
            </Link>
            <Link to="/parva-26/coupon" className={pill}>
              Food coupons
            </Link>
            <Link to="/parva-26/photobooth" className={pill}>
              Photo booth
            </Link>
          </div>

          <h1 className="mx-auto mt-6 w-fit rounded-[6px] bg-kumkuma px-8 pb-2 pt-1.5 text-center text-[#fff4dc] shadow-[inset_0_-3px_0_rgba(0,0,0,.2),0_0.5rem_1rem_rgba(0,0,0,.4)]">
            <span className="block font-poster text-3xl leading-none tracking-[0.2em]">My Orders</span>
            <span lang="kn" className="block font-kn-display text-base font-extrabold leading-tight text-arishina">
              ನನ್ನ ಆರ್ಡರ್‌ಗಳು
            </span>
          </h1>

          {user === undefined && !error && (
            <p role="status" className="mt-8 text-center font-poster text-xl text-[#f3ead5]">
              Loading…
            </p>
          )}

          {user === null && (
            <div className="mx-auto mt-8 max-w-md rounded-[8px] bg-[#f3ead5] p-5 text-center text-[#4a2a12] shadow-2xl">
              {loginFailed && <p className="mb-3 font-bold text-red-700">Login failed. Please try again.</p>}
              <p className="mb-4">Log in with IRIS to see your orders. You will come back to this page after logging in.</p>
              <button type="button" onClick={handleLogin} className="rounded bg-[#8a5530] px-5 py-2 font-bold text-[#f3ead5] transition-colors hover:bg-[#6b4020]">
                Login with IRIS
              </button>
            </div>
          )}

          {error && <p className="mt-6 rounded border border-red-300 bg-red-100 p-3 text-sm font-bold text-red-800">{error}</p>}

          {orders && (
            <div role="tablist" aria-label="Show orders" className="mt-8 flex flex-wrap justify-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 font-bold shadow-md ring-1 ring-[#c9a052]/50 transition-colors",
                    filter === f.id ? "bg-arishina text-theatre" : "bg-black/30 text-[#f3ead5] hover:bg-black/45"
                  )}
                >
                  <span className="leading-tight">
                    <En className="block">{f.en}</En>
                    <span lang="kn" className="block text-xs">
                      {f.kn}
                    </span>
                  </span>
                  <span className={cn("rounded-full px-2 text-xs tabular-nums", filter === f.id ? "bg-theatre/15" : "bg-[#f3ead5]/15")}>{counts[f.id] ?? 0}</span>
                </button>
              ))}
            </div>
          )}

          {shown && shown.length === 0 && (
            <p className="mt-8 text-center font-poster text-xl text-[#f3ead5]">
              {filter === "all" ? "You have no orders yet." : `No ${KIND_HEADINGS[filter].en.toLowerCase()} orders yet.`}
            </p>
          )}

          <div className="mt-6 space-y-5">
            {shown?.map((order) => {
              const isRefreshing = refreshing.has(order.paymentId);
              const kind = orderKind(order);
              const orderPasses = passes.filter((p) => p.payment_id === order.paymentId).sort((a, b) => a.item_index - b.item_index);

              return (
                <article key={order.paymentId} className="rounded-[8px] bg-[#f3ead5] p-5 font-kn-body text-[#4a2a12] shadow-2xl">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-poster text-2xl leading-none">{KIND_HEADINGS[kind].en}</h2>
                      <span lang="kn" className="text-sm font-bold">
                        {KIND_HEADINGS[kind].kn}
                      </span>
                      <span className="block text-xs opacity-70">{formatDate(order.createdAt)}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <ul className="space-y-2 border-b border-[#c2aa84] pb-3">
                    {order.items.length === 0 && <li className="opacity-70">Order details unavailable</li>}
                    {order.items.map((it) => (
                      <li key={it.productId} className="flex items-baseline justify-between gap-3 rounded bg-[#e5d4b5] px-3 py-2">
                        <span className="font-bold">{itemLabel(it)}</span>
                        <span className="font-bold">
                          {it.listPrice > it.unitPrice && <s className="mr-1 text-xs font-normal text-red-700">{rupees(it.listPrice * it.quantity)}</s>}
                          {rupees(it.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-1 pt-3">
                    {discountParts(order).map((part) => (
                      <div key={part.label} className="flex justify-between text-sm font-semibold text-green-700">
                        <span>{part.label}</span>
                        <span>−{rupees(part.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{rupees(order.amount)}</span>
                    </div>
                  </div>

                  {order.status === "SUCCESS" && order.paidAt && <p className="mt-1 text-xs opacity-70">Paid on {formatDate(order.paidAt)}</p>}

                  {(order.status === "FAILED" || order.status === "CANCELLED") && order.failureReason && (
                    <p className="mt-2 text-xs opacity-70">{order.failureReason}</p>
                  )}

                  {order.status === "SUCCESS" && orderPasses.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-bold">
                        <En>
                          {PASS_HINTS[kind]} Each works once; do not share them. ·{" "}
                        </En>
                        <span lang="kn" className="font-semibold">
                          ಪ್ರತಿ QR ಒಮ್ಮೆ ಮಾತ್ರ; ಹಂಚಿಕೊಳ್ಳಬೇಡಿ
                        </span>
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {orderPasses.map((p) => (
                          <PassTicket key={p.id} pass={p} onOpen={setOpenPass} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs opacity-60">
                    <span className="truncate">Order {order.orderId}</span>

                    {order.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => refreshOrder(order.paymentId)}
                        disabled={isRefreshing}
                        className="ml-3 shrink-0 rounded border border-[#8a5530] px-2 py-1 font-bold text-[#4a2a12] hover:bg-[#e5d4b5] disabled:opacity-50"
                      >
                        {isRefreshing ? "Checking…" : "Check status"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
      {openPass && <PassQr pass={openPass} onClose={closePass} />}
    </PageShell>
  );
};

export default MyOrders;
