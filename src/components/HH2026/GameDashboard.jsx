import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MetaData from "../MetaData/MetaData.jsx";
import { SiteHeader } from "./site-header";
import { Plaque, DiamondBand, Rivets } from "./ornaments";
import { CompassRose, Rope } from "./roaming-assets";
import API_URL from "../../api/api";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Trophy, 
  MapPin, 
  Compass, 
  Navigation, 
  RotateCcw, 
  HelpCircle, 
  QrCode, 
  Play, 
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Camera
} from "lucide-react";

const MAP_WIDTH = 1500;
const MAP_HEIGHT = 1000;
const GTA_ZOOM_MULTIPLIER = 1.55; // default zoom-in beyond "fit", for a focused, GTA-minimap feel
const MAX_ZOOM = 2.8;

// The zoom level at which the map image exactly covers the frame with no empty edges.
const getFitZoom = (rect) => Math.max(rect.width / MAP_WIDTH, rect.height / MAP_HEIGHT);

// Keeps the map image's edges from ever pulling in past the frame's edges.
const clampPan = (pan, zoom, rect) => {
  const scaledW = MAP_WIDTH * zoom;
  const scaledH = MAP_HEIGHT * zoom;
  const minX = Math.min(0, rect.width - scaledW);
  const minY = Math.min(0, rect.height - scaledH);
  return {
    x: Math.min(0, Math.max(minX, pan.x)),
    y: Math.min(0, Math.max(minY, pan.y)),
  };
};

// Builds a smooth closed loop that traces the outer edge of every revealed fog-clear
// circle combined, so the eagle patrols the boundary of explored territory instead of
// parking on one spot.
const buildEaglePatrolPath = (locations) => {
  if (!locations || locations.length === 0) return null;

  const PAD = 1.2; // fly just outside each circle's rim, not along it exactly

  if (locations.length === 1) {
    const loc = locations[0];
    const r = (loc.reveal_radius || 100) * 1.3;
    return `M ${loc.x_coord - r} ${loc.y_coord} ` +
      `A ${r} ${r} 0 1 0 ${loc.x_coord + r} ${loc.y_coord} ` +
      `A ${r} ${r} 0 1 0 ${loc.x_coord - r} ${loc.y_coord} Z`;
  }

  const cx = locations.reduce((s, l) => s + l.x_coord, 0) / locations.length;
  const cy = locations.reduce((s, l) => s + l.y_coord, 0) / locations.length;

  // Push each location's point outward from the centroid, past its own circle's rim.
  const points = locations.map((loc) => {
    const dx = loc.x_coord - cx;
    const dy = loc.y_coord - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const r = (loc.reveal_radius || 100) * PAD;
    const scale = (dist + r) / dist;
    return { x: cx + dx * scale, y: cy + dy * scale };
  });

  // With only 2 locations, the pushed-out points sit on a single line through the
  // centroid — add two perpendicular waypoints so the loop has real width instead
  // of collapsing into a line the eagle would just fly back and forth on.
  if (locations.length === 2) {
    const [a, b] = locations;
    const mx = (a.x_coord + b.x_coord) / 2;
    const my = (a.y_coord + b.y_coord) / 2;
    const dx = b.x_coord - a.x_coord;
    const dy = b.y_coord - a.y_coord;
    const len = Math.hypot(dx, dy) || 1;
    const avgR = ((a.reveal_radius || 100) + (b.reveal_radius || 100)) / 2 * PAD;
    points.push({ x: mx - (dy / len) * avgR, y: my + (dx / len) * avgR });
    points.push({ x: mx + (dy / len) * avgR, y: my - (dx / len) * avgR });
  }

  // Order the waypoints around the centroid so the loop doesn't self-intersect.
  points.sort((p1, p2) => Math.atan2(p1.y - cy, p1.x - cx) - Math.atan2(p2.y - cy, p2.x - cx));

  // Smooth closed Catmull-Rom spline (as cubic Beziers) through the ordered waypoints.
  const n = points.length;
  let d = `M ${points[0].x} ${points[0].y} `;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y} `;
  }
  return d + "Z";
};

export default function GameDashboard() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [gameState, setGameState] = useState(null);
  const [loadingState, setLoadingState] = useState(true);

  // Map Navigation state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStartDist, setTouchStartDist] = useState(null);
  const [touchStartZoom, setTouchStartZoom] = useState(1);
  const [touchStartPan, setTouchStartPan] = useState({ x: 0, y: 0 });
  const [touchFocalPoint, setTouchFocalPoint] = useState({ x: 0, y: 0 });

  // Eagle (Garuda Messenger) state
  const [eaglePos, setEaglePos] = useState({ x: 150, y: 150 });
  const [eagleFacingRight, setEagleFacingRight] = useState(true);
  const [eagleFlapFrame, setEagleFlapFrame] = useState(0); // 0 = downstroke, 1 = upstroke

  const [scanResult, setScanResult] = useState(null); // { success: boolean, message: string }
  const [scanning, setScanning] = useState(false);

  // Real QR camera scanner state
  const [scannerOpen, setScannerOpen] = useState(false);
  const html5QrCodeRef = useRef(null);

  // Mythology Easter-egg reveal toast
  const [eggToast, setEggToast] = useState(null); // { emoji, title, message }
  const announcedEggsRef = useRef(new Set());

  const mapContainerRef = useRef(null);
  const fitZoomRef = useRef(1);
  const eaglePathRef = useRef(null);
  const team = gameState?.team;
  const currentStep = gameState?.currentStep;
  const currentClue = currentStep?.clue;
  const currentLocation = currentStep?.location;
  const currentStepNumber = team?.currentStep ?? currentStep?.stepNo ?? 0;
  const revealedLocations = Array.isArray(gameState?.revealedLocations)
    ? gameState.revealedLocations
    : [];
  const isCompleted = gameState?.completed || team?.status === "completed";

  // The backend is the source of truth for team identity, clue assignment,
  // score, and progression.
  const fetchGameState = async () => {
    try {
      const response = await fetch(`${API_URL}/teams/game-state`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (response.status === 401) {
        setUser(null);
        setGameState(null);
        return false;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch game state");
      }

      if (data.success || data.gameStarted === false) {
        setGameState(data);
        setUser({
          name: data.team?.teamName || data.team?.name || "Team",
        });
        return true;
      }

      throw new Error(data.message || "Invalid game state");
    } catch (error) {
      console.error("Failed to fetch game state:", error);
      return false;
    }
  };

  useEffect(() => {
    const initializeGame = async () => {
      setCheckingAuth(true);
      setLoadingState(true);

      try {
        const success = await fetchGameState();
        if (!success) {
          setUser(null);
          setGameState(null);
        }
      } finally {
        setCheckingAuth(false);
        setLoadingState(false);
      }
    };

    initializeGame();
  }, []);

  // Coordinator approval changes progression on the backend. Poll for the
  // authoritative state rather than changing it in the browser.
  useEffect(() => {
    const intervalId = setInterval(fetchGameState, 8000);
    return () => clearInterval(intervalId);
  }, []);

  // Initialize Map Centering
  useEffect(() => {
    if (gameState) {
      resetMap();
    }
  }, [loadingState, !!gameState]);

  const resetMap = () => {
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return;

    const fitZoom = getFitZoom(rect);
    fitZoomRef.current = fitZoom;
    const newZoom = Math.min(fitZoom * GTA_ZOOM_MULTIPLIER, MAX_ZOOM);

    // Center on the frontier of exploration: the last spot the team uncovered.
    const revealed = revealedLocations;
    const focus = revealed && revealed.length > 0
      ? revealed[revealed.length - 1]
      : { x_coord: MAP_WIDTH / 2, y_coord: MAP_HEIGHT / 2 };

    const rawPan = {
      x: rect.width / 2 - focus.x_coord * newZoom,
      y: rect.height / 2 - focus.y_coord * newZoom,
    };

    setZoom(newZoom);
    setPan(clampPan(rawPan, newZoom, rect));
  };

  // Keep the frame gap-free and correctly centered if the viewport is resized.
  const resetMapRef = useRef(resetMap);
  resetMapRef.current = resetMap;
  useEffect(() => {
    const onResize = () => resetMapRef.current();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Alternate wing poses for a simple 2-frame flap cycle, independent of patrol/idle state.
  useEffect(() => {
    const flapInterval = setInterval(() => {
      setEagleFlapFrame((f) => (f === 0 ? 1 : 0));
    }, 220);
    return () => clearInterval(flapInterval);
  }, []);

  // Patrol the boundary of every revealed location combined, instead of parking on one spot.
  const eaglePatrolPathD = buildEaglePatrolPath(revealedLocations);
  const PATROL_LOOP_MS = 16000;

  useEffect(() => {
    if (!eaglePatrolPathD) return undefined;

    let rafId;
    let lastX = null;
    const startTime = performance.now();

    const tick = (now) => {
      const pathEl = eaglePathRef.current;
      if (pathEl) {
        const totalLength = pathEl.getTotalLength();
        if (totalLength > 0) {
          const elapsed = (now - startTime) % PATROL_LOOP_MS;
          const point = pathEl.getPointAtLength((elapsed / PATROL_LOOP_MS) * totalLength);
          setEaglePos({ x: point.x, y: point.y });
          if (lastX !== null && Math.abs(point.x - lastX) > 0.05) {
            setEagleFacingRight(point.x > lastX);
          }
          lastX = point.x;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [eaglePatrolPathD]);

  // Announce each mythology Easter egg the first time its reveal threshold is crossed.
  useEffect(() => {
    if (!gameState) return;
    const step = currentStepNumber;
    const reveals = [
      { id: "samudra", threshold: 1, emoji: "🌊", title: "Samudra Manthana", message: "The ocean stirs — ancient waters begin to churn." },
      { id: "parijata", threshold: 3, emoji: "🌸", title: "Parijata Flower", message: "A celestial bloom is sighted deep in the forest." },
      { id: "yakshagana", threshold: 5, emoji: "🎭", title: "Yakshagana Mask", message: "A silent guardian watches from the city's heart." },
    ];
    reveals.forEach(({ id, threshold, emoji, title, message }) => {
      if (step >= threshold && !announcedEggsRef.current.has(id)) {
        announcedEggsRef.current.add(id);
        setEggToast({ emoji, title, message });
        setTimeout(() => setEggToast(null), 5500);
      }
    });
  }, [currentStepNumber]);

  // ==========================================
  // Map Panning and Zooming Events
  // ==========================================
  const handleMouseDown = (e) => {
    if (e.target.closest(".no-drag")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = mapContainerRef.current?.getBoundingClientRect();
    const rawPan = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
    setPan(rect ? clampPan(rawPan, zoom, rect) : rawPan);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest(".no-drag")) return;
    
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      setTouchStartDist(null);
    } else if (e.touches.length === 2 && mapContainerRef.current) {
      setIsDragging(false);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      setTouchStartDist(dist);
      setTouchStartZoom(zoom);
      setTouchStartPan(pan);

      const rect = mapContainerRef.current.getBoundingClientRect();
      const fx = (touch1.clientX + touch2.clientX) / 2 - rect.left;
      const fy = (touch1.clientY + touch2.clientY) / 2 - rect.top;
      setTouchFocalPoint({ x: fx, y: fy });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const rect = mapContainerRef.current?.getBoundingClientRect();
      const rawPan = { x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y };
      setPan(rect ? clampPan(rawPan, zoom, rect) : rawPan);
    } else if (e.touches.length === 2 && touchStartDist !== null && mapContainerRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const factor = dist / touchStartDist;
      const rect = mapContainerRef.current.getBoundingClientRect();
      const floor = fitZoomRef.current || 0.45;

      let newZoom = touchStartZoom * factor;
      newZoom = Math.min(Math.max(newZoom, floor), MAX_ZOOM);

      const fx = touchFocalPoint.x;
      const fy = touchFocalPoint.y;

      const mx = (fx - touchStartPan.x) / touchStartZoom;
      const my = (fy - touchStartPan.y) / touchStartZoom;

      const rawPan = {
        x: fx - mx * newZoom,
        y: fy - my * newZoom
      };

      setZoom(newZoom);
      setPan(clampPan(rawPan, newZoom, rect));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStartDist(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (!mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const fx = e.clientX - rect.left;
    const fy = e.clientY - rect.top;

    const floor = fitZoomRef.current || 0.45;
    const zoomFactor = 1.15;
    let newZoom = zoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(zoom * zoomFactor, MAX_ZOOM);
    } else {
      newZoom = Math.max(zoom / zoomFactor, floor);
    }

    if (newZoom !== zoom) {
      const mx = (fx - pan.x) / zoom;
      const my = (fy - pan.y) / zoom;

      const rawPan = {
        x: fx - mx * newZoom,
        y: fy - my * newZoom
      };

      setZoom(newZoom);
      setPan(clampPan(rawPan, newZoom, rect));
    }
  };

  // Zooms in/out around the frame's visual center, clamped so no gap ever opens up.
  const zoomAroundCenter = (factor) => {
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const floor = fitZoomRef.current || 0.45;

    setZoom(prevZoom => {
      const newZoom = Math.min(Math.max(prevZoom * factor, floor), MAX_ZOOM);
      setPan(prevPan => {
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const mx = (cx - prevPan.x) / prevZoom;
        const my = (cy - prevPan.y) / prevZoom;
        const rawPan = { x: cx - mx * newZoom, y: cy - my * newZoom };
        return clampPan(rawPan, newZoom, rect);
      });
      return newZoom;
    });
  };

  const zoomIn = () => zoomAroundCenter(1.25);
  const zoomOut = () => zoomAroundCenter(1 / 1.25);
  // Submit the physical QR text to the backend. It verifies and records the
  // attempt; score and progression change only after coordinator review.
  const processScanResult = async (scannedText) => {
    const cleanQr = String(scannedText || "").trim();
    if (!cleanQr || scanning) return;

    setScanning(true);
    setScanResult(null);

    try {
      const response = await fetch(`${API_URL}/scan`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrCode: cleanQr }),
      });
      const data = await response.json();

      if (response.status === 401) {
        setScanResult({
          success: false,
          message: "Your team session has expired. Please log in again.",
        });
        setUser(null);
        setGameState(null);
        return;
      }

      if (!response.ok) {
        setScanResult({
          success: false,
          message: data.message || "Failed to process QR scan.",
        });
        return;
      }

      setScanResult({
        success: true,
        message: "Your scan has been submitted. Waiting for coordinator confirmation.",
      });
    } catch (error) {
      console.error("QR scan request failed:", error);
      setScanResult({
        success: false,
        message: "Unable to submit the scan. Please try again.",
      });
    } finally {
      setScanning(false);
      setTimeout(() => setScanResult(null), 5500);
    }
  };

  // Start/Stop QR camera scanner when modal opens/closes
  useEffect(() => {
    if (scannerOpen) {
      const html5QrCode = new Html5Qrcode("qr-reader-el");
      html5QrCodeRef.current = html5QrCode;

      const startScanner = async () => {
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const min = Math.min(width, height);
                return { width: min * 0.7, height: min * 0.7 };
              }
            },
            (decodedText) => {
              processScanResult(decodedText);
              setScannerOpen(false);
            },
            () => {
              // Ignore failure details during active video scanning
            }
          );
        } catch (err) {
          console.error("Camera startup failed:", err);
          alert("Could not start camera scanner. Make sure camera permissions are enabled.");
          setScannerOpen(false);
        }
      };

      const timeoutId = setTimeout(startScanner, 250);
      return () => {
        clearTimeout(timeoutId);
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(err => console.error("Error stopping scanner:", err));
        }
      };
    }
  }, [scannerOpen]);

  // ==========================================
  // Render Helpers
  // ==========================================
  if (checkingAuth || loadingState) {
    return (
      <div className="hh2026-page flex min-h-screen flex-col items-center justify-center gap-4 bg-parchment text-foreground">
        <span className="size-10 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
        <p className="font-serif text-sm font-bold tracking-[0.24em] text-primary uppercase">
          Mapping Coordinates...
        </p>
      </div>
    );
  }

  // Not Logged In View
  if (!user) {
    return (
      <div className="hh2026-page min-h-screen bg-parchment text-foreground relative overflow-hidden flex flex-col justify-between">
        <SiteHeader />
        <main className="relative z-10 mx-auto w-full max-w-lg px-4 py-20 flex-grow flex items-center justify-center">
          <div className="relative border-2 border-primary/50 bg-wood p-4 shadow-2xl rounded-sm">
            <Rope className="absolute -top-6 right-8 left-8 h-9 animate-sway" />
            <Rivets count={8} className="px-2 pb-3 pt-1" />
            <div className="relative border-2 border-[#8b5a2b]/40 bg-[#f7eed6] p-8 text-center text-[#2b1810]">
              <Compass className="size-16 mx-auto mb-4 text-[#7a4823] animate-spin-compass" />
              <h2 className="font-serif text-2xl font-bold text-[#4a2206] mb-3">
                Squad Identity Required
              </h2>
              <p className="text-sm font-serif mb-6 text-ink-muted leading-relaxed">
                Only registered squads participating in the Hudugata Hudakata 2026 hunt may view this tracking device. Log in to claim your compass.
              </p>
              <Link
                to="/team-registration"
                className="inline-flex items-center gap-2 border border-[#7a4823]/60 bg-[#7a4823] px-6 py-2.5 font-serif text-sm font-bold tracking-wider text-[#f7eed6] shadow-md transition-all hover:bg-[#5c3519] uppercase"
              >
                <QrCode className="size-4" /> Go to Registration
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Mythology Easter-egg reveal pacing, spread evenly across the full hunt arc.
  const totalSteps = Number.isFinite(gameState?.totalSteps) ? gameState.totalSteps : null;
  const progressRatio = totalSteps ? Math.min(100, (currentStepNumber / totalSteps) * 100) : 0;
  const samudraOpacity = totalSteps ? Math.min(0.95, Math.max(0, (currentStepNumber - 1) / totalSteps)) : 0;
  const parijataOpacity = gameState && currentStepNumber >= 3 ? 0.9 : 0;
  const yakshaganaOpacity = gameState && currentStepNumber >= 5 ? 0.9 : 0;

  return (
    <div className="hh2026-page min-h-screen bg-parchment text-foreground relative flex flex-col justify-between overflow-hidden">
      <MetaData title="Fog of War Map & Progress — Hudugata Hudakata 2026" />
      <SiteHeader />
      <style>{`
        @keyframes eagle-hover {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-eagle-hover {
          animation: eagle-hover 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Main Gameplay Screen */}
      <main className="relative z-10 flex-grow flex flex-col items-center p-4 max-w-7xl w-full mx-auto pb-8">
        
        {/* Plaque / Title header */}
        <div className="text-center w-full max-w-3xl mb-4">
          <Plaque
            eyebrow={`Team: ${team?.teamName || user?.name || "Team"}`}
            title="CAMPUS FOG OF WAR"
            className="items-center text-center scale-90"
          />
        </div>

        {/* Scan Result Toast Alert */}
        {scanResult && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-float no-drag">
            <div className={`p-4 border-2 shadow-[0_15px_30px_rgba(0,0,0,0.65)] rounded-sm flex items-start gap-3 bg-[#f7eed6] ${
              scanResult.success 
                ? "border-green-700 text-green-950" 
                : "border-red-700 text-red-950"
            }`}>
              {scanResult.success ? (
                <CheckCircle className="size-5 text-green-700 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="size-5 text-red-700 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-serif font-bold text-sm uppercase">
{scanResult.success ? "Scan Recorded" : "Scan Not Recorded"}
                </h4>
                <p className="text-xs font-serif leading-relaxed mt-1">{scanResult.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mythology Easter-egg Reveal Toast */}
        {eggToast && (
          <div className="absolute top-40 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-float no-drag">
            <div className="p-4 border-2 border-amber-700 shadow-[0_15px_30px_rgba(0,0,0,0.65)] rounded-sm flex items-start gap-3 bg-[#f7eed6] text-[#4a2206]">
              <span className="text-xl leading-none">{eggToast.emoji}</span>
              <div>
                <h4 className="font-serif font-bold text-sm uppercase">{eggToast.title}</h4>
                <p className="text-xs font-serif leading-relaxed mt-1">{eggToast.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Outer Dashboard layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-grow items-stretch">
          
          {/* LEFT 8 COLS: INTERACTIVE MAP CONTAINER */}
          <div className="lg:col-span-8 flex flex-col relative self-start border-2 border-primary/50 bg-wood p-2 shadow-2xl rounded-sm select-none">
            <div className="absolute top-4 left-4 z-20 flex gap-2 no-drag">
              <button 
                onClick={zoomIn} 
                className="bg-[#2b1810]/95 hover:bg-[#4a2206] text-primary border border-primary/30 size-9 flex items-center justify-center rounded-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                title="Zoom In"
              >
                +
              </button>
              <button 
                onClick={zoomOut} 
                className="bg-[#2b1810]/95 hover:bg-[#4a2206] text-primary border border-primary/30 size-9 flex items-center justify-center rounded-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                title="Zoom Out"
              >
                -
              </button>
              <button 
                onClick={resetMap} 
                className="bg-[#2b1810]/95 hover:bg-[#4a2206] text-primary border border-primary/30 size-9 flex items-center justify-center rounded-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                title="Reset View"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>

            {/* Instruction tooltip */}
            <div className="absolute bottom-4 left-4 z-20 bg-[#2b1810]/85 border border-primary/30 px-3 py-1.5 rounded-sm text-[10px] text-muted-foreground font-serif tracking-wider uppercase pointer-events-none">
              Drag to Pan / Scroll to Zoom
            </div>

            {/* Interactive MAP Display */}
            <div 
              ref={mapContainerRef}
              className="relative w-full h-[450px] sm:h-[520px] md:h-[600px] lg:h-[680px] overflow-hidden bg-[#18110b] rounded-sm cursor-grab active:cursor-grabbing border border-[#8b5a2b]/30 touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <svg 
                width="1500"
                height="1000"
                className="pointer-events-none"
                viewBox="0 0 1500 1000"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "0 0",
                  transition: (isDragging || touchStartDist !== null) ? "none" : "transform 0.15s ease-out"
                }}
              >
                {/* SVG Definitions for Fog Masks */}
                <defs>
                  <filter id="soft-blur">
                    <feGaussianBlur stdDeviation="22" />
                  </filter>
                  <mask id="cloud-mask">
                    {/* Entire canvas is white (cloudy) */}
                    <rect x="0" y="0" width="1500" height="1000" fill="white" />
                    
                    {/* Punch transparent circles for correctly scanned locations */}
                    <g filter="url(#soft-blur)">
                      {revealedLocations.map(loc => (
                        <circle 
                          key={loc.id}
                          cx={loc.x_coord}
                          cy={loc.y_coord}
                          r={loc.reveal_radius}
                          fill="black" 
                        />
                      ))}
                    </g>
                  </mask>
                </defs>

                {/* Invisible geometry the eagle patrols along — not rendered, only sampled */}
                {eaglePatrolPathD && (
                  <path ref={eaglePathRef} d={eaglePatrolPathD} fill="none" stroke="none" />
                )}

                {/* Layer 1: Base Map Image */}
                <image 
                  href="/hh2026/prop-map-scrap.png" 
                  width="1500" 
                  height="1000" 
                />

                {/* Layer 2: Fog Overlay (Masked Image) */}
                <image 
                  href="/hh2026/fog-overlay.png" 
                  width="1500" 
                  height="1000" 
                  opacity="0.60" 
                  mask="url(#cloud-mask)" 
                />
                
                {/* Ambient Fog wisps on top of overlay for dynamic breathing effect */}
                <rect 
                  x="0" 
                  y="0" 
                  width="1500" 
                  height="1000" 
                  fill="#1a1412" 
                  opacity="0.10" 
                  mask="url(#cloud-mask)" 
                  className="animate-flicker"
                />

                {/* Layer 2.1: Samudra Manthana (Ocean Easter Egg) */}
                <ellipse
                  cx="325" cy="745" rx="200" ry="150"
                  fill="#0d9488"
                  filter="url(#soft-blur)"
                  style={{ opacity: samudraOpacity * 0.6, transition: "opacity 1.5s ease-in-out" }}
                />
                <image
                  href="/samudramanthana.png"
                  x="150"
                  y="620"
                  width="350"
                  height="250"
                  style={{
                    opacity: samudraOpacity,
                    transition: "opacity 1.5s ease-in-out",
                    pointerEvents: "none"
                  }}
                />

                {/* Layer 2.2: Parijata Flower (Forest Clue) */}
                <ellipse
                  cx="545" cy="285" rx="90" ry="90"
                  fill="#f97316"
                  filter="url(#soft-blur)"
                  style={{ opacity: parijataOpacity * 0.6, transition: "opacity 1.5s ease-in-out" }}
                />
                <image
                  href="/parijata.png"
                  x="480"
                  y="220"
                  width="130"
                  height="130"
                  style={{
                    opacity: parijataOpacity,
                    transition: "opacity 1.5s ease-in-out",
                    pointerEvents: "none"
                  }}
                />

                {/* Layer 2.3: Yakshagana Theatre Mask (City Mystery) */}
                <ellipse
                  cx="735" cy="515" rx="85" ry="85"
                  fill="#dc2626"
                  filter="url(#soft-blur)"
                  style={{ opacity: yakshaganaOpacity * 0.6, transition: "opacity 1.5s ease-in-out" }}
                />
                <image
                  href="/yakshagana.png"
                  x="680"
                  y="450"
                  width="110"
                  height="130"
                  style={{
                    opacity: yakshaganaOpacity,
                    transition: "opacity 1.5s ease-in-out",
                    pointerEvents: "none"
                  }}
                />

                {/* Layer 3: Failed (Red) Attempt Smudges */}
                <g filter="url(#soft-blur)">
                  {gameState?.incorrectAttempts.map((attempt, index) => (
                    <circle 
                      key={index}
                      cx={attempt.x}
                      cy={attempt.y}
                      r="40"
                      fill="red"
                      opacity="0.38"
                    />
                  ))}
                </g>
                
                {/* Red X marks on failed points */}
                {gameState?.incorrectAttempts.map((attempt, index) => (
                  <g key={`cross-${index}`} className="opacity-75">
                    <line x1={attempt.x - 12} y1={attempt.y - 12} x2={attempt.x + 12} y2={attempt.y + 12} stroke="#ff3b30" strokeWidth="4" />
                    <line x1={attempt.x + 12} y1={attempt.y - 12} x2={attempt.x - 12} y2={attempt.y + 12} stroke="#ff3b30" strokeWidth="4" />
                  </g>
                ))}

                {/* Layer 4: Correct Green Pins & Labels */}
                {revealedLocations.map((loc, idx) => (
                  <g key={`pin-${loc.id}`}>
                    {/* Glowing pulse effect under the pin */}
                    <circle 
                      cx={loc.x_coord}
                      cy={loc.y_coord}
                      r="20"
                      fill="#7a4823"
                      opacity="0.35"
                      className="animate-ping"
                      style={{ animationDuration: "3s" }}
                    />
                    
                    {/* Green Map Pin */}
                    <circle 
                      cx={loc.x_coord} 
                      cy={loc.y_coord} 
                      r="9" 
                      fill="#10b981" 
                      stroke="#ffffff" 
                      strokeWidth="2.5"
                    />
                    
                    {/* Handwritten cursive style label next to pin */}
                    <text
                      x={loc.x_coord + 14}
                      y={loc.y_coord + 6}
                      fill="#f7eed6"
                      stroke="#1e0f06"
                      strokeWidth="2"
                      paintOrder="stroke"
                      className="font-serif text-[18px] font-bold tracking-wide italic"
                    >
                      {loc.name}
                    </text>

                    {/* Reward coin flourish */}
                    <image
                      href="/hh2026/prop-coin.png"
                      x={loc.x_coord + 20}
                      y={loc.y_coord - 34}
                      width="24"
                      height="24"
                      className="animate-spin-slow"
                      style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    />
                  </g>
                ))}

                {/* Layer 5: Flying Eagle (Garuda Messenger) — patrols the revealed boundary */}
                <g style={{ transform: `translate(${eaglePos.x}px, ${eaglePos.y}px)`, pointerEvents: "none" }}>
                  <g style={{ transform: `scaleX(${eagleFacingRight ? 1 : -1})`, transition: "transform 0.4s ease-out" }}>
                    {eagleFlapFrame === 0 ? (
                      <image
                        href="/hh2026/eagle.png"
                        x="-65"
                        y="-45"
                        width="130"
                        height="90"
                        className="animate-eagle-hover"
                      />
                    ) : (
                      // eagle-2.png frames its bird with more canvas padding than eagle.png,
                      // so it's rendered slightly larger to keep the wingspan visually matched.
                      <image
                        href="/eagle-2.png"
                        x="-73"
                        y="-50"
                        width="146"
                        height="100"
                        className="animate-eagle-hover"
                      />
                    )}
                  </g>
                </g>
              </svg>
            </div>
          </div>

          {/* RIGHT 4 COLS: CLUE, SCORE, PROGRESS, & SIMULATION PANEL */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            
            {/* Game Stats & Current Clue */}
            <div className="relative border-2 border-[#8b5a2b]/40 bg-[#f7eed6] p-5 shadow-lg text-ink flex-grow flex flex-col justify-between">
              
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4a2206] uppercase tracking-wide border-b border-[#7a4823]/30 pb-2 mb-4 flex items-center gap-2">
                  <Compass className="size-5 animate-spin-slow text-[#7a4823]" /> Game Progress
                </h3>

                {/* Step progressions */}
                <div className="mb-6 bg-wood/10 p-3 border border-[#7a4823]/15 rounded-sm">
                  <div className="flex justify-between items-center text-xs font-serif font-bold text-[#4a2206] tracking-wider mb-2">
                    <span>PROGRESS</span>
                    <span>{totalSteps ? `STEP ${currentStepNumber} / ${totalSteps}` : `STEP ${currentStepNumber}`}</span>
                  </div>
                  <div className="w-full h-3.5 bg-[#2b1810]/20 rounded-full overflow-hidden p-0.5 border border-[#8b5a2b]/30">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-700 to-[#7a4823] rounded-full transition-all duration-500 shadow-inner"
                      style={{ width: `${progressRatio}%` }}
                    />
                  </div>
                </div>

                {/* Score and status */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#2b1810]/5 border border-[#7a4823]/20 p-3 text-center rounded-sm">
                    <Trophy className="size-5 mx-auto mb-1 text-amber-600 animate-pulse" />
                    <span className="block text-[10px] font-serif tracking-wider text-ink-muted uppercase">Score</span>
                    <span className="font-serif text-lg font-bold text-[#4a2206]">{team?.score ?? 0} pts</span>
                  </div>
                  <div className="bg-[#2b1810]/5 border border-[#7a4823]/20 p-3 text-center rounded-sm">
                    <Navigation className="size-5 mx-auto mb-1 text-emerald-600" />
                    <span className="block text-[10px] font-serif tracking-wider text-ink-muted uppercase">Revealed</span>
                    <span className="font-serif text-lg font-bold text-[#4a2206]">{revealedLocations.length} areas</span>
                  </div>
                </div>

                {/* Clue card */}
                <div className="relative p-4 border border-[#c1ad87] bg-pamphlet bg-cover text-ink rounded-sm shadow-inner min-h-[160px] flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-xs font-bold tracking-widest text-[#4a2206] uppercase border-b border-[#7a4823]/20 pb-1 mb-2 flex justify-between items-center">
                      <span>Current Clue</span>
  {currentClue?.variant && (
                        <span className="text-[9px] bg-[#8b261b] text-[#f7eed6] px-1.5 py-0.5 rounded-sm font-sans tracking-normal font-bold">
                          Variant {currentClue.variant}
                        </span>
                      )}
                    </h4>
                    <div className="font-serif text-xs leading-relaxed text-ink-muted font-medium">
                      {currentClue?.imageUrl ? (
                        <img
                          src={currentClue.imageUrl}
                          alt="Clue"
                          className="w-full max-h-48 object-contain rounded-sm border border-[#c1ad87] shadow-sm my-1"
                        />
                      ) : (
                        <p className="italic text-pretty">"Clue image unavailable."</p>
                      )}
                    </div>
                    <div className="mt-3">
                      <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-ink-muted">
                        Destination
                      </span>
                      <p className="font-serif font-bold text-sm text-[#4a2206]">
                        {currentLocation?.name || "Unknown location"}
                      </p>
                    </div>
                  </div>
                  
                  {isCompleted ? (
                    <div className="mt-4 bg-emerald-100 border border-emerald-400 p-2 text-emerald-950 text-center text-xs font-serif font-bold rounded-sm uppercase">
                      🎉 Challenge Cleared!
                    </div>
                  ) : (
                    <button
                      onClick={() => setScannerOpen(true)}
                      className="mt-4 w-full bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] py-3.5 px-4 font-serif text-[11px] font-bold uppercase tracking-[0.2em] shadow-md flex items-center justify-center gap-2 rounded-sm cursor-pointer transition-all active:scale-[0.98] no-drag"
                    >
                      <Camera className="size-3.5" /> Scan QR Code
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Camera QR Scanner Modal */}
        {scannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 no-drag animate-fadeIn">
            <style>{`
              @keyframes scan-laser {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
            `}</style>
            <div className="relative w-full max-w-md border-2 border-primary/50 bg-wood p-3 sm:p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] rounded-sm">
              <div className="relative border-2 border-[#8b5a2b]/40 bg-[#f7eed6] p-5 shadow-inner text-[#2b1810]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#7a4823]/30 pb-2 mb-4">
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#4a2206] flex items-center gap-1.5">
                    <Camera className="size-4 text-[#8b261b]" /> Point at Location QR
                  </h4>
                  <button
                    onClick={() => setScannerOpen(false)}
                    className="text-[#8b261b] hover:text-black font-bold text-2xl px-1.5 cursor-pointer leading-none"
                  >
                    &times;
                  </button>
                </div>

                {/* Viewport container */}
                <div className="relative w-full aspect-square bg-black border-2 border-[#7a4823]/40 rounded-sm overflow-hidden mb-4 shadow-inner">
                  <div id="qr-reader-el" className="w-full h-full"></div>
                  
                  {/* Glowing camera frame effect overlay */}
                  <div className="absolute inset-0 pointer-events-none border-[30px] border-black/45 flex items-center justify-center">
                    <div className="w-[75%] h-[75%] border-2 border-dashed border-[#8b261b] relative">
                      {/* Laser scanning line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" style={{
                        animation: "scan-laser 2s linear infinite",
                      }} />
                      {/* Corner marks */}
                      <div className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 border-t-4 border-l-4 border-amber-600"></div>
                      <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 border-t-4 border-r-4 border-amber-600"></div>
                      <div className="absolute -bottom-1.5 -left-1.5 w-4.5 h-4.5 border-b-4 border-l-4 border-amber-600"></div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-4.5 h-4.5 border-b-4 border-r-4 border-amber-600"></div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-center text-ink-muted font-serif leading-relaxed px-2">
                  Position the check-point QR code inside the targeting square to scan automatically.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
