import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Camera,
  RefreshCw,
  QrCode,
  Search,
  History,
  Flashlight,
  FlashlightOff,
  LogOut,
  Undo2,
  X,
} from "lucide-react";
import API_URL from "../../../api/api";
import { cn } from "@/lib/utils";

const VIEWPORT_ID = "scanner-viewport";
const REQUEST_TIMEOUT_MS = 10000;
const HISTORY_LIMIT = 15;

const MODES = [
  { key: "FOOD", label: "Food" },
  { key: "MERCH", label: "Merch" },
  { key: "PHOTO", label: "Photo" },
];

// What the scanner is looking for in each mode, for "Scanning …" and the search
const MODE_NOUN = { FOOD: "Food Passes", MERCH: "Merch", PHOTO: "Photo Sessions" };

const TIMEOUT_MESSAGE =
  "No response from the server. The pass may already be claimed: scan it again to check (it will show Already Used if so).";

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(timestamp);
  }
};

const vibrate = (pattern) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Not supported (e.g. iOS Safari); the on-screen card is the feedback
  }
};

const PASS_TITLES = { FOOD: "Food Pass", MERCH: "Merch", PHOTO: "Photo Session" };
const passTitle = (category) => PASS_TITLES[category] ?? "Food Pass";

// Size and fit only mean something for merch; a photo session's variant is
// its number of prints ("3 prints"), kept in `size` too
const passDetail = (pass) => ({
  category: pass.category,
  size: pass.category === "MERCH" || pass.category === "PHOTO" ? pass.variant || "" : "",
  fit: pass.category === "MERCH" ? pass.fit || "" : "",
});

// One request to the staff API. Rejects with { timeout: true } when the server
// does not answer in time; otherwise resolves { status, data }.
export const staffRequest = async (path, { method = "GET", body, headers } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: { ...(body && { "Content-Type": "application/json" }), ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));

    return { status: response.status, data };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw { timeout: true };
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

// What the console calls to scan, search and revert. The festival staff use
// these (IRIS login); the photo booth's scanner passes its own (booth-scanner.jsx).
const STAFF_API = {
  scan: (token, category) => staffRequest("/passes/scan", { method: "POST", body: { token, category } }),
  search: (q, category) => staffRequest(`/passes/search?q=${encodeURIComponent(q)}&category=${category}`),
  revert: (id) => staffRequest("/passes/revert", { method: "POST", body: { id } }),
};

// Turns a scan response into the card to show
const toCard = (status, data) => {
  if (status === 401) {
    return { type: "ERROR", title: "Logged Out", message: "Your session has ended. Log in again.", loggedOut: true };
  }
  if (status === 403) {
    return { type: "ERROR", title: "Staff Not Authorized", message: data.message || "Active staff access is required." };
  }
  if (status === 400) {
    return { type: "ERROR", title: "Invalid QR Code", message: "This is not a Parva pass QR code." };
  }

  switch (data.result) {
    case "OK":
      return { type: "OK", pass: data.item };
    case "ALREADY_USED":
      return { type: "ALREADY_USED", pass: data };
    case "MISMATCH":
      return { type: "MISMATCH", message: data.message };
    case "VOID":
      return { type: "ERROR", title: "Pass Void", message: data.message || "This pass has been voided." };
    case "FORBIDDEN":
      return { type: "ERROR", title: "Staff Not Authorized", message: data.message || "Active staff access is required." };
    case "INVALID":
      return { type: "ERROR", title: "Invalid Pass", message: data.message || "Pass not found or QR code is invalid." };
    default:
      return {
        type: "ERROR",
        title: "Could Not Verify",
        message: data.message || "Unexpected response from the server. Try again.",
      };
  }
};

// ---------- small shared pieces ----------

function ConfirmDialog({ confirm, busy, onCancel }) {
  if (!confirm) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-[#4d2d1b] bg-[#1a0f0a] p-5 text-[#f5ebd9] shadow-2xl">
        <p className="text-base font-semibold leading-snug">{confirm.message}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-md border border-[#4d2d1b] py-3 text-sm font-semibold text-[#c7aa88] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm.onConfirm}
            disabled={busy}
            className={cn(
              "flex-1 rounded-md py-3 text-sm font-bold text-black disabled:opacity-50",
              confirm.danger ? "bg-amber-400" : "bg-[#f7b928]"
            )}
          >
            {busy ? "Please wait…" : confirm.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Size and fit, large, for the merch handout
function MerchSpec({ size, fit, tone }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      <div className={cn("rounded-lg px-3 py-2 text-center", tone)}>
        <div className="text-[11px] font-bold uppercase tracking-widest opacity-70">Size</div>
        <div className="text-4xl font-black leading-tight text-white">{size || "—"}</div>
      </div>
      <div className={cn("rounded-lg px-3 py-2 text-center", tone)}>
        <div className="text-[11px] font-bold uppercase tracking-widest opacity-70">Fit</div>
        <div className="text-2xl font-black leading-[2.4rem] text-white">{fit || "—"}</div>
      </div>
    </div>
  );
}

// How many copies the booth hands over, from the pass's variant ("3 prints")
function PrintsSpec({ prints, tone }) {
  return (
    <div className={cn("mt-3 rounded-lg px-3 py-2 text-center", tone)}>
      <div className="text-[11px] font-bold uppercase tracking-widest opacity-70">Prints to hand over</div>
      <div className="text-4xl font-black leading-tight text-white">{parseInt(prints, 10) || "—"}</div>
    </div>
  );
}

function StudentLine({ name, regNo }) {
  return (
    <p className="mt-3 text-sm">
      <span className="font-bold text-white">{name || "Name not recorded"}</span>
      {regNo ? <span className="opacity-80"> · {regNo}</span> : null}
    </p>
  );
}

// ---------- staff access gate ----------

function AccessScreen({ state, user, onRetry }) {
  const loginUrl = `${API_URL}/auth/iris?redirect=${encodeURIComponent("/parva-26/scan")}`;
  // Back to the host the page is on: the session cookie belongs to that host
  const devLoginUrl = `${API_URL}/auth/dev-login?redirect=${encodeURIComponent(`${window.location.origin}/parva-26/scan`)}`;
  const loginFailed = new URLSearchParams(window.location.search).has("login_error");
  const irisNeedsDevHost = import.meta.env.DEV && window.location.hostname !== "kannadavedike.dev.local";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0705] px-6 text-center font-sans text-[#f5ebd9]">
      <QrCode className="mb-4 size-12 text-[#f7b928]" />
      <h1 className="text-xl font-bold text-[#f7b928]">ಪರ್ವ ಸ್ಕ್ಯಾನರ್ · Parva Scanner</h1>

      {state === "loading" && (
        <div className="mt-6 flex items-center gap-2 text-sm text-[#c7aa88]">
          <RefreshCw className="size-4 animate-spin" /> Checking staff access…
        </div>
      )}

      {state === "loggedOut" && (
        <>
          <p className="mt-2 max-w-xs text-sm text-[#c7aa88]">Festival staff only. Log in to start scanning passes.</p>
          {loginFailed && (
            <p className="mt-3 max-w-xs rounded-md border border-red-600/50 bg-red-900/30 px-3 py-2 text-xs font-semibold text-red-200">
              IRIS login did not complete. Please try again.
            </p>
          )}
          {irisNeedsDevHost && (
            <p className="mt-3 max-w-xs rounded-md border border-amber-600/50 bg-amber-900/30 px-3 py-2 text-xs text-amber-200">
              Local dev: IRIS login only works at http://kannadavedike.dev.local:5173. On {window.location.host} use Dev Login.
            </p>
          )}
          <a
            href={loginUrl}
            className="mt-6 w-full max-w-xs rounded-md bg-[#f7b928] px-4 py-3 text-sm font-bold text-black"
          >
            Login with IRIS (Staff Only)
          </a>
          {import.meta.env.DEV && (
            <a
              href={devLoginUrl}
              className="mt-3 w-full max-w-xs rounded-md border border-[#4d2d1b] px-4 py-3 text-sm font-semibold text-[#c7aa88]"
            >
              Dev Login (local only)
            </a>
          )}
        </>
      )}

      {state === "denied" && (
        <>
          <ShieldAlert className="mt-6 size-10 text-red-400" />
          <p className="mt-2 max-w-xs text-sm text-red-200">
            Access Denied: Your IRIS ID ({user?.irisId || "unknown"}) is not registered as active festival staff.
          </p>
          <a
            href={loginUrl}
            className="mt-6 w-full max-w-xs rounded-md border border-[#4d2d1b] px-4 py-3 text-sm font-semibold text-[#c7aa88]"
          >
            Log in with a different account
          </a>
        </>
      )}

      {state === "error" && (
        <>
          <p className="mt-4 max-w-xs text-sm text-red-200">Could not check your access. Check the connection and try again.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 flex items-center gap-2 rounded-md bg-[#f7b928] px-4 py-3 text-sm font-bold text-black"
          >
            <RefreshCw className="size-4" /> Retry
          </button>
        </>
      )}
    </div>
  );
}

// ---------- camera ----------

// html5-qrcode instances share one element. React StrictMode mounts, unmounts
// and mounts again, so starts and stops are queued: each waits for the one
// before it to finish.
let cameraQueue = Promise.resolve();

// ---------- the scanner itself ----------

// `modes` are the tabs the scanner can switch between; with one, there are no tabs.
export function ScannerConsole({ staff, onLoggedOut, onLogout, api = STAFF_API, modes = MODES }) {
  const [mode, setMode] = useState(modes[0].key);
  const [card, setCard] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraNonce, setCameraNonce] = useState(0);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const [tally, setTally] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchNotice, setSearchNotice] = useState(null);

  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const scannerRef = useRef(null);
  const isLockedRef = useRef(false);
  const modeRef = useRef(mode);
  const claimedThisShiftRef = useRef(new Set());
  const unlockTimerRef = useRef(null);

  modeRef.current = mode;

  const pauseCamera = useCallback(() => {
    try {
      scannerRef.current?.pause(true);
    } catch {
      // Not scanning (yet); nothing to pause
    }
  }, []);

  const resumeCamera = useCallback(() => {
    try {
      scannerRef.current?.resume();
    } catch {
      // Not paused; nothing to resume
    }
  }, []);

  const addHistory = useCallback((entry) => {
    setHistory((prev) => [{ ...entry, key: `${entry.id}-${Date.now()}`, time: new Date().toISOString() }, ...prev].slice(0, HISTORY_LIMIT));
  }, []);

  const recordClaim = useCallback(
    (pass) => {
      claimedThisShiftRef.current.add(pass.id);
      setTally((n) => n + 1);
      addHistory({
        id: pass.id,
        action: "CLAIMED",
        ...passDetail(pass),
        studentName: pass.user_name,
        regNo: pass.user_iris_id,
      });
    },
    [addHistory]
  );

  const recordRevert = useCallback(
    (pass) => {
      if (claimedThisShiftRef.current.delete(pass.id)) {
        setTally((n) => Math.max(0, n - 1));
      }
      // The claim in the list can no longer be reverted
      setHistory((prev) => prev.map((h) => (h.id === pass.id && h.action === "CLAIMED" ? { ...h, action: "CLAIMED_REVERTED" } : h)));
      addHistory({
        id: pass.id,
        action: "REVERTED",
        ...passDetail(pass),
        studentName: pass.user_name,
        regNo: pass.user_iris_id,
      });
    },
    [addHistory]
  );

  // ----- camera lifecycle -----

  useEffect(() => {
    let cancelled = false;
    const html5QrCode = new Html5Qrcode(VIEWPORT_ID);
    scannerRef.current = html5QrCode;

    const started = cameraQueue
      .then(async () => {
        if (cancelled) return false;

        await html5QrCode.start(
          // html5-qrcode rejects { ideal: ... }. A plain string is only a preference, so
          // the back camera is used when there is one and any camera otherwise.
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (width, height) => {
              const box = Math.max(200, Math.floor(Math.min(width, height) * 0.72));
              return { width: box, height: box };
            },
          },
          (decodedText) => {
            if (!isLockedRef.current) {
              void verifyToken(decodedText);
            }
          },
          () => {
            // A frame with no readable code; stay quiet
          }
        );

        if (!cancelled) {
          setCameraActive(true);
          setCameraError("");

          const track = document.querySelector(`#${VIEWPORT_ID} video`)?.srcObject?.getVideoTracks?.()[0];
          setTorchSupported(Boolean(track?.getCapabilities?.().torch));
        }
        return true;
      })
      .catch((err) => {
        console.error("Camera startup failed:", err);
        if (!cancelled) {
          setCameraActive(false);
          setCameraError("Unable to access the camera. Allow camera permission in the browser, then retry.");
        }
        return false;
      });

    cameraQueue = started;

    return () => {
      cancelled = true;
      setCameraActive(false);
      setTorchSupported(false);
      setTorchOn(false);

      cameraQueue = started.then(async (didStart) => {
        if (didStart) {
          try {
            await html5QrCode.stop();
          } catch {
            // Already stopped
          }
        }
        try {
          html5QrCode.clear();
        } catch {
          // Nothing rendered to clear
        }
      });
    };
    // verifyToken only reads refs and stable setters; the camera must not restart with it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraNonce]);

  const toggleTorch = async () => {
    const track = document.querySelector(`#${VIEWPORT_ID} video`)?.srcObject?.getVideoTracks?.()[0];
    if (!track) return;

    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch (error) {
      console.error("Torch toggle failed:", error);
      setTorchSupported(false);
    }
  };

  // ----- scanning -----

  const showCard = useCallback(
    (next) => {
      setCard(next);

      if (next.loggedOut) {
        onLoggedOut();
      }

      if (next.type === "OK") {
        vibrate([150]);
      } else {
        vibrate([100, 60, 100]);
      }
    },
    [onLoggedOut]
  );

  const verifyToken = useCallback(
    async (rawToken) => {
      const token = String(rawToken || "").trim();
      if (!token || isLockedRef.current) return;

      // Stays locked, camera paused, until the volunteer taps Scan Next
      isLockedRef.current = true;
      pauseCamera();
      setIsVerifying(true);

      try {
        const { status, data } = await api.scan(token, modeRef.current);

        const next = toCard(status, data);
        if (next.type === "OK") {
          recordClaim(next.pass);
        }
        showCard(next);
      } catch (error) {
        console.error("Scan request failed:", error);
        showCard({
          type: "ERROR",
          title: error?.timeout ? "No Response" : "Network Error",
          message: error?.timeout ? TIMEOUT_MESSAGE : "Could not reach the server. Check the connection and scan again.",
        });
      } finally {
        setIsVerifying(false);
      }
    },
    [api, pauseCamera, recordClaim, showCard]
  );

  // Not an auto-dismiss: the volunteer already tapped. The short wait only stops
  // the QR code still in front of the camera from being read a second time.
  const unlockSoon = useCallback(() => {
    clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = setTimeout(() => {
      isLockedRef.current = false;
    }, 400);
  }, []);

  useEffect(() => () => clearTimeout(unlockTimerRef.current), []);

  const scanNext = () => {
    setCard(null);
    resumeCamera();
    unlockSoon();
  };

  // ----- search / revert -----

  const openSearch = () => {
    isLockedRef.current = true;
    pauseCamera();
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchNotice(null);
    setConfirm(null);

    if (!card) {
      resumeCamera();
      unlockSoon();
    }
  };

  const changeMode = (key) => {
    if (key === mode) return;
    setMode(key);
    setSearchResults(null);
    setSearchNotice(null);
  };

  const runSearch = async (event) => {
    event?.preventDefault();
    const q = searchQuery.trim();
    if (q.length < 3) return;

    setSearchBusy(true);
    setSearchNotice(null);

    try {
      const { status, data } = await api.search(q, mode);

      if (status === 401) {
        onLoggedOut();
        return;
      }
      if (status !== 200 || !data.success) {
        setSearchResults(null);
        setSearchNotice({ tone: "error", text: data.message || "Search failed. Try again." });
        return;
      }
      setSearchResults(data.passes);
    } catch (error) {
      setSearchResults(null);
      setSearchNotice({ tone: "error", text: error?.timeout ? "The search timed out. Try again." : "Could not reach the server." });
    } finally {
      setSearchBusy(false);
    }
  };

  const claimFromSearch = (pass) => {
    setConfirm({
      message: `Confirm claiming ${passSummary(pass)} for ${pass.user_name || pass.user_iris_id}?`,
      confirmLabel: "Claim Pass",
      onConfirm: async () => {
        setConfirmBusy(true);
        try {
          const { status, data } = await api.scan(pass.token, mode);
          const result = toCard(status, data);

          if (result.loggedOut) {
            onLoggedOut();
            return;
          }
          if (result.type === "OK") {
            recordClaim(result.pass);
            vibrate([150]);
            setSearchNotice({ tone: "ok", text: `Claimed ${passSummary(pass)} for ${pass.user_name || pass.user_iris_id}.` });
          } else if (result.type === "ALREADY_USED") {
            vibrate([100, 60, 100]);
            setSearchNotice({ tone: "warn", text: `Already claimed${result.pass.claimed_by_name ? ` by ${result.pass.claimed_by_name}` : ""}.` });
          } else {
            vibrate([100, 60, 100]);
            setSearchNotice({ tone: "error", text: result.message || "Could not claim this pass." });
          }
        } catch (error) {
          setSearchNotice({ tone: "error", text: error?.timeout ? TIMEOUT_MESSAGE : "Could not reach the server." });
        } finally {
          setConfirmBusy(false);
          setConfirm(null);
          await runSearch();
        }
      },
    });
  };

  // `pass` needs id, category, variant/fit and the student's name / reg no
  const askRevert = (pass, { fromCard = false } = {}) => {
    // The server enforces this too; checking here saves a pointless confirm dialog
    if (staff.role !== "ADMIN") {
      vibrate([100, 60, 100]);
      const text = "Volunteers cannot revert a claim. Ask an admin to revert it.";

      if (fromCard) {
        setCard({ type: "ERROR", title: "Revert Not Allowed", message: text });
      } else {
        setSearchNotice({ tone: "error", text });
      }
      return;
    }

    setConfirm({
      message: "Revert pass status back to ISSUED?",
      confirmLabel: "Revert Claim",
      danger: true,
      onConfirm: async () => {
        setConfirmBusy(true);
        let notice = null;

        try {
          const { status, data } = await api.revert(pass.id);

          if (status === 401) {
            onLoggedOut();
            return;
          }
          if (data.result === "REVERTED") {
            recordRevert(pass);
            vibrate([150]);
            notice = { tone: "ok", text: "Pass reverted to ISSUED. The student can collect it later." };
          } else {
            vibrate([100, 60, 100]);
            notice = { tone: "error", text: data.message || "Could not revert this pass." };
          }
        } catch (error) {
          notice = { tone: "error", text: error?.timeout ? "No response. Check the pass before trying again." : "Could not reach the server." };
        } finally {
          setConfirmBusy(false);
          setConfirm(null);
          if (notice && fromCard) {
            setCard(
              notice.tone === "ok"
                ? { type: "REVERTED", message: notice.text }
                : { type: "ERROR", title: "Revert Failed", message: notice.text }
            );
          } else if (notice) {
            setSearchNotice(notice);
          }
        }

        if (searchOpen) await runSearch();
      },
    });
  };

  // ----- render -----

  const hasOverlay = Boolean(card) || searchOpen;

  return (
    <div className="relative flex h-dvh flex-col bg-[#0b0705] font-sans text-[#f5ebd9] selection:bg-[#f7b928] selection:text-black">
      {/* Staff bar */}
      <header className="z-20 border-b border-[#362217] bg-[#140b08]/90 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#f7b928]">
              {staff.name || "Staff"} <span className="font-normal text-[#c7aa88]">({staff.irisId})</span>
            </p>
            <span className="mt-0.5 inline-block rounded bg-[#f7b928]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ffea85]">
              {staff.role}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-full border border-[#f7b928]/30 bg-[#25150e] px-3 py-1 text-xs font-semibold text-[#ffea85]">
              Scanned This Shift: {tally}
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1 rounded-md border border-[#4d2d1b] px-2 py-1.5 text-xs font-semibold text-[#c7aa88]"
              aria-label="Logout"
            >
              <LogOut className="size-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Mode */}
        {modes.length > 1 && (
          <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-lg bg-[#21120b] p-1" role="tablist" aria-label="Scan mode">
            {modes.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={mode === m.key}
                onClick={() => changeMode(m.key)}
                disabled={Boolean(card) || isVerifying}
                className={cn(
                  "rounded-md py-2 text-sm font-bold transition-colors disabled:opacity-60",
                  mode === m.key ? "bg-[#f7b928] text-black" : "text-[#c7aa88]"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Camera */}
      <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-black">
        <div
          id={VIEWPORT_ID}
          className="h-full w-full max-w-md overflow-hidden bg-black [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        />

        {cameraActive && !hasOverlay && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative size-64 sm:size-72">
              <span className="absolute left-0 top-0 size-7 rounded-tl-sm border-l-4 border-t-4 border-[#f7b928]" />
              <span className="absolute right-0 top-0 size-7 rounded-tr-sm border-r-4 border-t-4 border-[#f7b928]" />
              <span className="absolute bottom-0 left-0 size-7 rounded-bl-sm border-b-4 border-l-4 border-[#f7b928]" />
              <span className="absolute bottom-0 right-0 size-7 rounded-br-sm border-b-4 border-r-4 border-[#f7b928]" />
            </div>
            <p className="absolute bottom-6 text-center text-sm font-medium tracking-wide text-[#f5ebd9]/80 drop-shadow-md">
              Scanning {MODE_NOUN[mode]}
            </p>
          </div>
        )}

        {torchSupported && !card && !searchOpen && (
          <button
            type="button"
            onClick={toggleTorch}
            className={cn(
              "absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full border",
              torchOn ? "border-[#f7b928] bg-[#f7b928] text-black" : "border-white/30 bg-black/50 text-white"
            )}
            aria-label={torchOn ? "Turn torch off" : "Turn torch on"}
          >
            {torchOn ? <Flashlight className="size-5" /> : <FlashlightOff className="size-5" />}
          </button>
        )}

        {cameraError && (
          <div className="absolute inset-4 z-10 flex max-w-sm flex-col items-center justify-center self-center rounded-lg border border-red-900/60 bg-[#1a0a08]/95 p-6 text-center text-[#ffc5c2] shadow-2xl">
            <Camera className="mb-3 size-10 text-red-400" />
            <h3 className="mb-1 text-lg font-bold text-white">Camera Access Needed</h3>
            <p className="mb-4 text-xs opacity-90">{cameraError}</p>
            <button
              type="button"
              onClick={() => setCameraNonce((n) => n + 1)}
              className="flex items-center gap-2 rounded-md bg-[#f7b928] px-4 py-2 font-semibold text-black active:scale-95"
            >
              <RefreshCw className="size-4" />
              Retry Camera
            </button>
          </div>
        )}

        {isVerifying && (
          <div className="absolute z-20 flex items-center gap-3 rounded-full border border-[#f7b928]/40 bg-[#160c08]/90 px-5 py-2.5 shadow-2xl">
            <RefreshCw className="size-5 animate-spin text-[#f7b928]" />
            <span className="text-sm font-semibold tracking-wide text-[#ffea85]">Verifying pass…</span>
          </div>
        )}

        {/* Result card: stays until Scan Next */}
        {card && !isVerifying && (
          <>
            {/* Blurs and dims the scanner behind the card so the result stands out */}
            <div aria-hidden="true" className="absolute inset-0 z-[25] bg-black/45 backdrop-blur-md" />
            <div className="absolute inset-x-4 top-4 z-30 mx-auto max-h-[calc(100%-2rem)] max-w-md overflow-y-auto">
              <ResultCard card={card} onNext={scanNext} onRevert={(pass) => askRevert(pass, { fromCard: true })} />
            </div>
          </>
        )}

        <ConfirmDialog confirm={!searchOpen && !historyOpen ? confirm : null} busy={confirmBusy} onCancel={() => setConfirm(null)} />
      </main>

      {/* Bottom bar */}
      <footer className="z-20 grid grid-cols-2 gap-2 border-t border-[#362217] bg-[#140b08]/95 px-4 py-3">
        <button
          type="button"
          onClick={openSearch}
          disabled={Boolean(card) || isVerifying}
          className="flex items-center justify-center gap-2 rounded-md border border-[#4d2d1b] py-2.5 text-sm font-semibold text-[#f7b928] disabled:opacity-40"
        >
          <Search className="size-4" />
          Search by Name / Reg No
        </button>
        <button
          type="button"
          onClick={() => setHistoryOpen((open) => !open)}
          className="flex items-center justify-center gap-2 rounded-md border border-[#4d2d1b] py-2.5 text-sm font-semibold text-[#f7b928]"
        >
          <History className="size-4" />
          Recent ({history.length})
        </button>
      </footer>

      {/* Recent activity */}
      {historyOpen && (
        <Sheet
          title="Recent Activity"
          tally={tally}
          onClose={() => {
            setHistoryOpen(false);
            setSearchNotice(null);
            setConfirm(null);
          }}
        >
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#a3876e]">Nothing yet on this device.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.key} className="rounded-lg border border-[#362217] bg-[#1a0f0a] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">
                        {passTitle(h.category)}
                        {h.category !== "FOOD" && (h.size || h.fit) ? ` · ${[h.size, h.fit].filter(Boolean).join(" / ")}` : ""}
                      </p>
                      <p className="truncate text-xs text-[#c7aa88]">
                        {h.studentName || "Name not recorded"}
                        {h.regNo ? ` · ${h.regNo}` : ""}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#a3876e]">{formatTime(h.time)}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        h.action === "CLAIMED" && "bg-emerald-500/20 text-emerald-300",
                        h.action === "CLAIMED_REVERTED" && "bg-[#362217] text-[#a3876e]",
                        h.action === "REVERTED" && "bg-amber-500/20 text-amber-300"
                      )}
                    >
                      {h.action === "CLAIMED" ? "Claimed" : h.action === "CLAIMED_REVERTED" ? "Claimed (reverted)" : "Reverted"}
                    </span>
                  </div>
                  {h.action === "CLAIMED" && (
                    <button
                      type="button"
                      onClick={() => askRevert({ id: h.id, category: h.category, variant: h.size, fit: h.fit, user_name: h.studentName, user_iris_id: h.regNo })}
                      className="mt-2 flex items-center gap-1.5 rounded border border-amber-500/40 px-2.5 py-1.5 text-xs font-bold text-amber-300"
                    >
                      <Undo2 className="size-3.5" />
                      Revert Claim
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <ConfirmDialog confirm={confirm} busy={confirmBusy} onCancel={() => setConfirm(null)} />
          {searchNotice && !searchOpen && <Notice notice={searchNotice} />}
        </Sheet>
      )}

      {/* Search by reg / roll number */}
      {searchOpen && (
        <Sheet title={`Search ${MODE_NOUN[mode]}`} tally={tally} onClose={closeSearch}>
          <form onSubmit={runSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or Reg / Roll number"
              autoCapitalize="none"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-md border border-[#4d2d1b] bg-[#21120b] px-3 py-2.5 text-sm text-[#f5ebd9] placeholder-[#806653] outline-none focus:border-[#f7b928]"
            />
            <button
              type="submit"
              disabled={searchBusy || searchQuery.trim().length < 3}
              className="rounded-md bg-[#f7b928] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
            >
              {searchBusy ? "…" : "Search"}
            </button>
          </form>

          {searchNotice && <Notice notice={searchNotice} />}

          {searchResults && searchResults.length === 0 && (
            <p className="py-8 text-center text-sm text-[#a3876e]">
              No {MODE_NOUN[mode].toLowerCase()} found for that name or number. Check the spelling, and that the scanner is in the right mode.
            </p>
          )}

          {searchResults && searchResults.length > 0 && (
            <ul className="mt-3 space-y-2">
              {searchResults.map((p) => (
                <li key={p.id} className="rounded-lg border border-[#362217] bg-[#1a0f0a] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-white">{passSummary(p)}</p>
                      <p className="text-xs text-[#c7aa88]">
                        {p.user_name || "Name not recorded"} · {p.user_iris_id}
                      </p>
                      {p.status === "CLAIMED" && (
                        <p className="mt-0.5 text-[11px] text-amber-300/90">
                          Claimed {formatTime(p.claimed_at)}
                          {p.claimed_by_name ? ` by ${p.claimed_by_name}` : ""}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        p.status === "ISSUED" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      )}
                    >
                      {p.status}
                    </span>
                  </div>

                  {p.status === "ISSUED" && (
                    <button
                      type="button"
                      onClick={() => claimFromSearch(p)}
                      className="mt-2 w-full rounded-md bg-[#f7b928] py-2.5 text-sm font-bold text-black active:scale-[0.98]"
                    >
                      Claim Pass
                    </button>
                  )}
                  {p.status === "CLAIMED" && (
                    <button
                      type="button"
                      onClick={() => askRevert({ ...p, user_iris_id: p.user_iris_id })}
                      className="mt-2 flex items-center gap-1.5 rounded border border-amber-500/40 px-2.5 py-1.5 text-xs font-bold text-amber-300"
                    >
                      <Undo2 className="size-3.5" />
                      Revert Claim
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <ConfirmDialog confirm={confirm} busy={confirmBusy} onCancel={() => setConfirm(null)} />
        </Sheet>
      )}
    </div>
  );
}

// "Food Pass", "Photo Session · 3 prints", or "Merch · M / Oversized"
function passSummary(pass) {
  if (pass.category === "PHOTO") return pass.variant ? `Photo Session · ${pass.variant}` : "Photo Session";
  if (pass.category !== "MERCH") return passTitle(pass.category);
  const parts = [pass.variant, pass.fit].filter(Boolean);
  return parts.length ? `Merch · ${parts.join(" / ")}` : "Merch";
}

function Notice({ notice }) {
  return (
    <p
      className={cn(
        "mt-3 rounded-md border px-3 py-2 text-xs font-semibold",
        notice.tone === "ok" && "border-emerald-600/50 bg-emerald-900/30 text-emerald-200",
        notice.tone === "warn" && "border-amber-600/50 bg-amber-900/30 text-amber-200",
        notice.tone === "error" && "border-red-600/50 bg-red-900/30 text-red-200"
      )}
    >
      {notice.text}
    </p>
  );
}

function Sheet({ title, tally, onClose, children }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#0b0705]">
      <div className="flex items-center justify-between border-b border-[#362217] px-4 py-3">
        <div>
          <h2 className="text-base font-bold text-[#f7b928]">{title}</h2>
          <p className="text-[11px] text-[#c7aa88]">Scanned This Shift: {tally}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[#c7aa88] hover:bg-[#24130d]" aria-label="Close">
          <X className="size-5" />
        </button>
      </div>
      <div className="relative flex-1 overflow-y-auto px-4 py-3">{children}</div>
    </div>
  );
}

// ---------- result cards ----------

function ResultCard({ card, onNext, onRevert }) {
  if (card.type === "OK") {
    const pass = card.pass;
    const isMerch = pass.category === "MERCH";

    return (
      <div className="overflow-hidden rounded-xl border-2 border-emerald-500 bg-[#06241a] p-5 text-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-9 shrink-0 text-emerald-400" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Verified & Claimed</span>
            <h3 className="text-2xl font-extrabold text-white">{passTitle(pass.category)}</h3>
          </div>
        </div>
        {isMerch && <MerchSpec size={pass.variant} fit={pass.fit} tone="bg-emerald-900/60" />}
        {pass.category === "PHOTO" && <PrintsSpec prints={pass.variant} tone="bg-emerald-900/60" />}
        <StudentLine name={pass.user_name} regNo={pass.user_iris_id} />
        <button type="button" onClick={onNext} className="mt-5 w-full rounded-md bg-emerald-500 py-3.5 text-base font-extrabold text-black active:scale-[0.98]">
          Scan Next Pass
        </button>
        {isMerch && (
          <button
            type="button"
            onClick={() => onRevert(pass)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-emerald-700/60 py-2 text-xs font-bold text-emerald-300"
          >
            <Undo2 className="size-3.5" />
            Not available? Revert Claim
          </button>
        )}
      </div>
    );
  }

  if (card.type === "ALREADY_USED") {
    const pass = card.pass;
    const isMerch = pass.category === "MERCH";

    return (
      <div className="overflow-hidden rounded-xl border-2 border-amber-500 bg-[#291705] p-5 text-amber-100 shadow-[0_0_40px_rgba(245,158,11,0.35)]">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-9 shrink-0 text-amber-400" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Already Claimed · ಬಳಸಲಾಗಿದೆ</span>
            <h3 className="text-2xl font-extrabold text-white">{passTitle(pass.category)}</h3>
          </div>
        </div>
        {isMerch && <MerchSpec size={pass.variant} fit={pass.fit} tone="bg-amber-900/50" />}
        {pass.category === "PHOTO" && <PrintsSpec prints={pass.variant} tone="bg-amber-900/50" />}
        <StudentLine name={pass.user_name} regNo={pass.user_iris_id} />
        <p className="mt-3 text-sm font-semibold text-amber-200">
          Claimed {formatTime(pass.claimed_at) || "earlier"}
          {pass.claimed_by_name ? ` by ${pass.claimed_by_name}` : ""}
        </p>
        <button type="button" onClick={onNext} className="mt-5 w-full rounded-md bg-amber-400 py-3.5 text-base font-extrabold text-black active:scale-[0.98]">
          Scan Next Pass
        </button>
      </div>
    );
  }

  if (card.type === "MISMATCH") {
    return (
      <div className="overflow-hidden rounded-xl border-2 border-amber-500 bg-[#291705] p-5 text-amber-100 shadow-[0_0_40px_rgba(245,158,11,0.35)]">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-9 shrink-0 text-amber-400" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Not Claimed</span>
            <h3 className="text-2xl font-extrabold text-white">Wrong Scan Mode</h3>
          </div>
        </div>
        <p className="mt-3 text-base text-amber-100">{card.message}</p>
        <button type="button" onClick={onNext} className="mt-5 w-full rounded-md bg-amber-400 py-3.5 text-base font-extrabold text-black active:scale-[0.98]">
          Dismiss / Scan Next
        </button>
      </div>
    );
  }

  if (card.type === "REVERTED") {
    return (
      <div className="overflow-hidden rounded-xl border-2 border-amber-500 bg-[#291705] p-5 text-amber-100 shadow-[0_0_40px_rgba(245,158,11,0.35)]">
        <div className="flex items-center gap-3">
          <Undo2 className="size-9 shrink-0 text-amber-400" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Claim Reverted</span>
            <h3 className="text-2xl font-extrabold text-white">Back to Issued</h3>
          </div>
        </div>
        <p className="mt-3 text-base text-amber-100">{card.message}</p>
        <button type="button" onClick={onNext} className="mt-5 w-full rounded-md bg-amber-400 py-3.5 text-base font-extrabold text-black active:scale-[0.98]">
          Scan Next Pass
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border-2 border-red-600 bg-[#300a0a] p-5 text-red-100 shadow-[0_0_40px_rgba(220,38,38,0.4)]">
      <div className="flex items-center gap-3">
        {card.title === "Staff Not Authorized" ? <ShieldAlert className="size-9 shrink-0 text-red-400" /> : <XCircle className="size-9 shrink-0 text-red-400" />}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-300">Not Claimed</span>
          <h3 className="text-2xl font-extrabold text-white">{card.title}</h3>
        </div>
      </div>
      <p className="mt-3 text-base text-red-100">{card.message}</p>
      <button type="button" onClick={onNext} className="mt-5 w-full rounded-md bg-red-500 py-3.5 text-base font-extrabold text-white active:scale-[0.98]">
        Try Again
      </button>
    </div>
  );
}

// ---------- page: staff gate around the scanner ----------

export default function ParvaScanner() {
  const [access, setAccess] = useState("loading"); // loading | loggedOut | denied | ready | error
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);

  const checkAccess = useCallback(async () => {
    setAccess("loading");

    try {
      const me = await staffRequest("/auth/me");

      if (me.status === 401) {
        setAccess("loggedOut");
        return;
      }
      if (me.status !== 200 || !me.data.user) {
        setAccess("error");
        return;
      }
      setUser(me.data.user);

      const staffCheck = await staffRequest("/passes/staff/me");

      if (staffCheck.status === 401) {
        setAccess("loggedOut");
      } else if (staffCheck.status === 403) {
        setAccess("denied");
      } else if (staffCheck.status === 200 && staffCheck.data.staff) {
        setStaff(staffCheck.data.staff);
        setAccess("ready");
      } else {
        setAccess("error");
      }
    } catch (error) {
      console.error("Staff access check failed:", error);
      setAccess("error");
    }
  }, []);

  useEffect(() => {
    void checkAccess();
  }, [checkAccess]);

  const logout = async () => {
    try {
      await staffRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setStaff(null);
    setUser(null);
    setAccess("loggedOut");
  };

  if (access !== "ready") {
    return <AccessScreen state={access} user={user} onRetry={checkAccess} />;
  }

  return <ScannerConsole staff={staff} onLoggedOut={() => setAccess("loggedOut")} onLogout={logout} />;
}
