import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Camera,
  Keyboard,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  QrCode,
  ArrowLeft,
  X
} from "lucide-react";
import API_URL from "../../../api/api";
import { cn } from "@/lib/utils";

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(timestamp);
  }
};

export default function ParvaScanner() {
  const [modalState, setModalState] = useState(null); // { type: 'OK' | 'ALREADY_USED' | 'INVALID' | 'FORBIDDEN', data }
  const [sessionCount, setSessionCount] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const scannerRef = useRef(null);
  const isLockedRef = useRef(false);
  const dismissTimerRef = useRef(null);

  const dismissModal = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    setModalState(null);

    // Resume scanner
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (err) {
        // Can throw if not in paused state; safe to ignore
      }
    }

    // Unlock after small delay to avoid instant re-triggering from same QR code
    setTimeout(() => {
      isLockedRef.current = false;
    }, 400);
  }, []);

  const handleScanFeedback = useCallback((type, data) => {
    setModalState({ type, data });

    // Haptics rule: Only ALREADY_USED vibrates (double buzz). Strictly NO sound.
    if (type === "ALREADY_USED") {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([250, 100, 250]);
      }
    }

    if (type === "OK") {
      setSessionCount((prev) => prev + 1);
      // Auto-dismiss after 2.5 seconds
      dismissTimerRef.current = setTimeout(() => {
        dismissModal();
      }, 2500);
    } else if (type === "ALREADY_USED") {
      // Auto-resume after 3.0 seconds (or manual dismiss)
      dismissTimerRef.current = setTimeout(() => {
        dismissModal();
      }, 3000);
    } else if (type === "INVALID") {
      dismissTimerRef.current = setTimeout(() => {
        dismissModal();
      }, 3000);
    } else if (type === "FORBIDDEN") {
      dismissTimerRef.current = setTimeout(() => {
        dismissModal();
      }, 3500);
    }
  }, [dismissModal]);

  const verifyToken = useCallback(async (rawToken) => {
    const token = String(rawToken || "").trim();
    if (!token) return;

    if (isLockedRef.current) return;
    isLockedRef.current = true;

    // Pause camera stream immediately
    if (scannerRef.current) {
      try {
        scannerRef.current.pause(true);
      } catch (err) {
        // ignore
      }
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`${API_URL}/passes/scan`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        handleScanFeedback("FORBIDDEN", {
          message: "Please log in with an authorized staff account.",
        });
        return;
      }

      if (response.status === 403) {
        handleScanFeedback("FORBIDDEN", {
          message: data.message || "Staff not authorized for pass validation.",
        });
        return;
      }

      if (response.status === 400) {
        handleScanFeedback("INVALID", {
          message: data.message || "Invalid pass token format (must be UUID).",
        });
        return;
      }

      const resultType = data.result || (data.success ? "OK" : "INVALID");
      handleScanFeedback(resultType, data);
    } catch (error) {
      console.error("Scan API request failed:", error);
      handleScanFeedback("INVALID", {
        message: "Network error occurred. Check connection.",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [handleScanFeedback]);

  const startScanner = useCallback(() => {
    setCameraError("");

    if (scannerRef.current) {
      try {
        scannerRef.current.stop().catch(() => {});
      } catch (e) {}
    }

    const html5QrCode = new Html5Qrcode("scanner-viewport");
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const box = Math.max(200, Math.floor(minEdge * 0.72));
            return { width: box, height: box };
          },
        },
        (decodedText) => {
          if (!isLockedRef.current) {
            void verifyToken(decodedText);
          }
        },
        () => {
          // Frame decode misses, silent
        }
      )
      .then(() => {
        setCameraActive(true);
      })
      .catch((err) => {
        console.error("Camera startup failed:", err);
        setCameraActive(false);
        setCameraError(
          "Unable to access camera. Please allow camera permissions or enter token manually."
        );
      });
  }, [verifyToken]);

  useEffect(() => {
    startScanner();

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch (e) {}
      }
    };
  }, [startScanner]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const token = manualToken.trim();
    if (!token) return;
    void verifyToken(token);
    setManualToken("");
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0b0705] text-[#f5ebd9] selection:bg-[#f7b928] selection:text-black font-sans">
      {/* Top Navigation & Status Bar */}
      <header className="z-20 flex items-center justify-between border-b border-[#362217] bg-[#140b08]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            to="/parva-26"
            className="flex size-9 items-center justify-center rounded-full bg-[#24130d] text-[#f7b928] transition-colors hover:bg-[#3d1f14]"
            aria-label="Back to Parva"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2 font-bold text-base tracking-wide text-[#f7b928]">
              <QrCode className="size-4" />
              <span>ಪರ್ವ ಸ್ಕ್ಯಾನರ್</span>
              <span className="text-xs font-normal text-[#c7aa88]">· Parva Scanner</span>
            </h1>
            <p className="text-xs text-[#a3876e]">Volunteer Gate & Stall Validator</p>
          </div>
        </div>

        {/* Session Scan Counter */}
        <div className="flex items-center gap-1.5 rounded-full border border-[#f7b928]/30 bg-[#25150e] px-3 py-1 text-xs font-semibold text-[#ffea85]">
          <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Scanned: {sessionCount}</span>
        </div>
      </header>

      {/* Main Scanner Viewport Area */}
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-black">
        {/* Camera Feed Target Container */}
        <div
          id="scanner-viewport"
          className="h-full w-full max-w-md overflow-hidden bg-black [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        />

        {/* Viewport Overlay & Crosshairs Guide */}
        {cameraActive && !modalState && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative size-64 sm:size-72">
              {/* Corner crosshairs */}
              <span className="absolute top-0 left-0 size-7 border-t-4 border-l-4 border-[#f7b928] rounded-tl-sm shadow-[0_0_8px_rgba(247,185,40,0.6)]" />
              <span className="absolute top-0 right-0 size-7 border-t-4 border-r-4 border-[#f7b928] rounded-tr-sm shadow-[0_0_8px_rgba(247,185,40,0.6)]" />
              <span className="absolute bottom-0 left-0 size-7 border-b-4 border-l-4 border-[#f7b928] rounded-bl-sm shadow-[0_0_8px_rgba(247,185,40,0.6)]" />
              <span className="absolute bottom-0 right-0 size-7 border-b-4 border-r-4 border-[#f7b928] rounded-br-sm shadow-[0_0_8px_rgba(247,185,40,0.6)]" />

              {/* Scanning Guide line */}
              <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#f7b928] to-transparent shadow-[0_0_12px_rgba(247,185,40,0.9)] opacity-80" />
            </div>

            {/* Instruction tooltip */}
            <p className="pointer-events-none absolute bottom-24 text-center text-sm font-medium tracking-wide text-[#f5ebd9]/80 drop-shadow-md">
              Point camera at visitor QR pass
            </p>
          </div>
        )}

        {/* Camera Permission / Error Fallback */}
        {cameraError && (
          <div className="absolute inset-4 z-10 flex max-w-sm flex-col items-center justify-center self-center rounded-lg border border-red-900/60 bg-[#1a0a08]/95 p-6 text-center text-[#ffc5c2] shadow-2xl backdrop-blur-md">
            <Camera className="mb-3 size-10 text-red-400" />
            <h3 className="mb-1 text-lg font-bold text-white">Camera Access Needed</h3>
            <p className="mb-4 text-xs opacity-90">{cameraError}</p>
            <button
              type="button"
              onClick={startScanner}
              className="flex items-center gap-2 rounded-md bg-[#f7b928] px-4 py-2 font-semibold text-black transition-transform active:scale-95"
            >
              <RefreshCw className="size-4" />
              <span>Retry Camera</span>
            </button>
          </div>
        )}

        {/* Verifying Indicator */}
        {isVerifying && !modalState && (
          <div className="absolute z-20 flex items-center gap-3 rounded-full border border-[#f7b928]/40 bg-[#160c08]/90 px-5 py-2.5 shadow-2xl backdrop-blur-md">
            <RefreshCw className="size-5 animate-spin text-[#f7b928]" />
            <span className="text-sm font-semibold tracking-wide text-[#ffea85]">
              Verifying pass…
            </span>
          </div>
        )}

        {/* Visual Result Banner / Modal */}
        {modalState && (
          <div className="absolute inset-x-4 top-6 z-30 mx-auto max-w-md animate-in fade-in zoom-in-95 duration-200">
            {/* OK STATE */}
            {modalState.type === "OK" && (
              <div className="relative overflow-hidden rounded-xl border-2 border-emerald-500 bg-[#06241a]/95 p-6 text-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.35)] backdrop-blur-lg">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-400/50">
                    <CheckCircle2 className="size-7" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block rounded bg-emerald-400/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Verified & Claimed
                    </span>
                    <h3 className="mt-1 text-xl font-extrabold text-white">
                      {modalState.data?.item?.item_name ||
                        modalState.data?.item?.itemName ||
                        modalState.data?.itemName ||
                        "Event Pass"}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-emerald-200">
                      {(modalState.data?.item?.variant || modalState.data?.variant) && (
                        <span className="rounded bg-emerald-900/60 px-2 py-0.5 font-semibold text-emerald-200">
                          Size/Variant: {modalState.data?.item?.variant || modalState.data?.variant}
                        </span>
                      )}
                      <span className="font-semibold text-emerald-300">
                        Pass #{modalState.data?.item?.item_index || modalState.data?.itemIndex || 1}
                      </span>
                      {modalState.data?.item?.category && (
                        <span className="text-xs uppercase tracking-wider opacity-75">
                          ({modalState.data.item.category})
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={dismissModal}
                    className="rounded-full p-1 text-emerald-300 hover:bg-emerald-900/40"
                    aria-label="Dismiss"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-emerald-800/40 pt-3 text-xs text-emerald-300/80">
                  <span>Valid for entry/collection</span>
                  <span>Auto-closing in 2.5s</span>
                </div>
              </div>
            )}

            {/* ALREADY_USED STATE */}
            {modalState.type === "ALREADY_USED" && (
              <div className="relative overflow-hidden rounded-xl border-2 border-amber-500 bg-[#291705]/95 p-6 text-amber-100 shadow-[0_0_40px_rgba(245,158,11,0.35)] backdrop-blur-lg">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 ring-2 ring-amber-400/50">
                    <AlertTriangle className="size-7" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                      Duplicate Scan
                    </span>
                    <h3 className="mt-1 text-xl font-extrabold text-white">
                      Already Claimed / ಬಳಸಲಾಗಿದೆ
                    </h3>
                    <p className="mt-1 text-sm text-amber-200">
                      {modalState.data?.item_name || modalState.data?.itemName || "This pass"} has already been redeemed.
                    </p>

                    {(modalState.data?.claimed_at || modalState.data?.claimedAt) && (
                      <p className="mt-2 text-xs font-semibold text-amber-300/90">
                        Claimed at: {formatTime(modalState.data?.claimed_at || modalState.data?.claimedAt)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={dismissModal}
                    className="rounded-full p-1 text-amber-300 hover:bg-amber-900/40"
                    aria-label="Dismiss"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-amber-800/40 pt-3">
                  <button
                    type="button"
                    onClick={dismissModal}
                    className="rounded bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-200 hover:bg-amber-500/30 active:scale-95"
                  >
                    Tap to continue
                  </button>
                  <span className="text-xs text-amber-300/70">Auto-resuming in 3s</span>
                </div>
              </div>
            )}

            {/* INVALID STATE */}
            {modalState.type === "INVALID" && (
              <div className="relative overflow-hidden rounded-xl border-2 border-rose-500 bg-[#29080b]/95 p-6 text-rose-100 shadow-[0_0_40px_rgba(244,63,94,0.35)] backdrop-blur-lg">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 ring-2 ring-rose-400/50">
                    <XCircle className="size-7" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block rounded bg-rose-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-300">
                      Error
                    </span>
                    <h3 className="mt-1 text-xl font-extrabold text-white">
                      Invalid Pass Token
                    </h3>
                    <p className="mt-1 text-sm text-rose-200">
                      {modalState.data?.message || "Pass not found or QR token is invalid."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={dismissModal}
                    className="rounded-full p-1 text-rose-300 hover:bg-rose-900/40"
                    aria-label="Dismiss"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-rose-800/40 pt-3">
                  <button
                    type="button"
                    onClick={dismissModal}
                    className="rounded bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-200 hover:bg-rose-500/30 active:scale-95"
                  >
                    Dismiss
                  </button>
                  <span className="text-xs text-rose-300/70">Auto-resuming in 3s</span>
                </div>
              </div>
            )}

            {/* FORBIDDEN STATE */}
            {modalState.type === "FORBIDDEN" && (
              <div className="relative overflow-hidden rounded-xl border-2 border-red-600 bg-[#300a0a]/95 p-6 text-red-100 shadow-[0_0_40px_rgba(220,38,38,0.4)] backdrop-blur-lg">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-400 ring-2 ring-red-500/50">
                    <ShieldAlert className="size-7" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block rounded bg-red-600/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-red-300">
                      Unauthorized
                    </span>
                    <h3 className="mt-1 text-xl font-extrabold text-white">
                      Staff Not Authorized
                    </h3>
                    <p className="mt-1 text-sm text-red-200">
                      {modalState.data?.message || "Active volunteer or admin privileges are required."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={dismissModal}
                    className="rounded-full p-1 text-red-300 hover:bg-red-900/40"
                    aria-label="Dismiss"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-red-800/40 pt-3">
                  <button
                    type="button"
                    onClick={dismissModal}
                    className="rounded bg-red-600/20 px-3 py-1 text-xs font-bold text-red-200 hover:bg-red-600/30 active:scale-95"
                  >
                    Dismiss
                  </button>
                  <span className="text-xs text-red-300/70">Auto-resuming in 3.5s</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Collapsible Manual Entry Panel */}
      <footer className="z-20 border-t border-[#362217] bg-[#140b08]/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setManualOpen((prev) => !prev)}
          className="flex w-full items-center justify-between py-1 text-sm font-semibold text-[#f7b928] hover:text-[#ffea85]"
        >
          <div className="flex items-center gap-2">
            <Keyboard className="size-4" />
            <span>Manual Token Entry · ಕೈಯಾರೆ ನಮೂದಿಸಿ</span>
          </div>
          {manualOpen ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </button>

        {manualOpen && (
          <form onSubmit={handleManualSubmit} className="mt-3 flex flex-col gap-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste or type UUID token..."
                disabled={isVerifying}
                className="flex-1 rounded-md border border-[#4d2d1b] bg-[#21120b] px-3 py-2 font-mono text-xs text-[#f5ebd9] placeholder-[#806653] outline-none focus:border-[#f7b928] focus:ring-1 focus:ring-[#f7b928]"
              />
              <button
                type="submit"
                disabled={isVerifying || !manualToken.trim()}
                className="rounded-md bg-[#f7b928] px-4 py-2 text-xs font-bold text-black transition-transform hover:bg-[#ffea85] active:scale-95 disabled:opacity-50"
              >
                {isVerifying ? "Verifying…" : "Verify"}
              </button>
            </div>
            <p className="text-[11px] text-[#a3876e]">
              Enter the full 36-character token from the user pass if QR is damaged or unscannable.
            </p>
          </form>
        )}
      </footer>
    </div>
  );
}
