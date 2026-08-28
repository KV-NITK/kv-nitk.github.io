import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MetaData from "../MetaData/MetaData.jsx";
import { SiteHeader } from "./site-header";
import { Plaque, Rivets } from "./ornaments";
import API_URL from "../../api/api";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Trophy, 
  MapPin, 
  Compass, 
  Navigation, 
  Play, 
  CheckCircle,
  XCircle,
  Camera,
  QrCode
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
  const [pendingApproval, setPendingApproval] = useState(null); // { scanId, locationName }
  const [advancing, setAdvancing] = useState(false);

  // Real QR camera scanner state
  const [scannerOpen, setScannerOpen] = useState(false);
  const html5QrCodeRef = useRef(null);

  const mapContainerRef = useRef(null);
  const fitZoomRef = useRef(1);
  const eaglePathRef = useRef(null);
  const team = gameState?.team;
  const currentStep = gameState?.currentStep;
  const currentClue = currentStep?.clue;
  const currentStepNumber = team?.currentStep ?? currentStep?.stepNo ?? 0;
  const revealedLocations = Array.isArray(gameState?.revealedLocations)
    ? gameState.revealedLocations
    : [];
  const isCompleted = gameState?.completed || team?.status === "completed";

  const TOTAL_LOCATIONS = 8;
  const solvedCount = isCompleted 
    ? TOTAL_LOCATIONS 
    : (gameState?.solvedSteps?.length ?? Math.max(0, (currentStepNumber || 1) - 1));

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

      if (data.team || data.success) {
        setGameState(data);
        setUser({
          name: data.team?.teamName || data.team?.name || "Team",
        });
        return true;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch game state");
      }

      setGameState(data);
      setUser({ name: "Team" });
      return true;
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

  const handleCoordinatorAdvance = async () => {
    if (!pendingApproval || advancing) return;
    setAdvancing(true);

    try {
      const response = await fetch(`${API_URL}/scan/advance`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanAttemptId: pendingApproval.scanId })
      });

      if (response.status === 401) {
        setScanResult({
          success: false,
          message: "Your team session has expired. Please log in again.",
        });
        setUser(null);
        setGameState(null);
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setScanResult({
          success: true,
          message: data.message || `Team successfully advanced to Step ${currentStepNumber + 1}!`
        });
        setPendingApproval(null);
        await fetchGameState();
      } else {
        setScanResult({
          success: false,
          message: data.message || "Failed to advance team step."
        });
      }
    } catch (err) {
      console.error("Advance step error:", err);
      setScanResult({
        success: false,
        message: "Failed to process request. Please try again."
      });
    } finally {
      setAdvancing(false);
      setTimeout(() => setScanResult(null), 5000);
    }
  };

  // Submit the physical QR text to the backend. It verifies and records the attempt.
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

      if (response.ok && data.success) {
        if (data.scan && data.scan.isCorrect) {
          setPendingApproval({
            scanId: data.scan.id,
            locationName: data.scan.expectedLocation?.name || `Location ${currentStepNumber}`
          });
          setScanResult({
            success: true,
            message: "Location QR Verified! Coordinator, please click 'Approve & Advance'."
          });
        } else {
          setScanResult({
            success: false,
            message: "Incorrect QR code scanned for this step. Please scan the QR code at the correct location."
          });
        }
      } else {
        setScanResult({
          success: false,
          message: data.message || "Failed to process QR scan.",
        });
      }
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

  const progressRatio = Math.min(100, Math.round((solvedCount / TOTAL_LOCATIONS) * 100));
  const samudraOpacity = Math.min(0.95, Math.max(0, (currentStepNumber - 1) / TOTAL_LOCATIONS));
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

        {/* Outer Dashboard layout container */}
        <div className="max-w-4xl mx-auto flex flex-col gap-6 w-full flex-grow items-stretch">
          
          {/* TODO: Uncomment Map Container once location coordinates (x_coord, y_coord) and reveal radius are finalized */}
          {/* 
          <div className="lg:col-span-8 flex flex-col relative self-start border-2 border-primary/50 bg-wood p-2 shadow-2xl rounded-sm select-none">
            ... Interactive MAP SVG ...
          </div>
          */}

          {/* CLUE, SCORE, PROGRESS, & QR SCANNER PANEL */}
          <div className="w-full flex flex-col justify-between gap-6">
            
            {/* LATEST ACTIVE CLUE (TOP) */}
            <div className="relative border-2 border-[#8b5a2b]/40 bg-[#f7eed6] p-5 shadow-lg text-ink flex-grow flex flex-col justify-between">
              
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4a2206] uppercase tracking-wide border-b border-[#7a4823]/30 pb-2 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Compass className="size-5 animate-spin-slow text-[#7a4823]" /> Active Hunt Progress
                  </span>
                  <span className="text-xs bg-[#7a4823] text-[#fffdf9] px-2.5 py-1 rounded-sm font-bold">
                    SOLVED: {solvedCount} / {TOTAL_LOCATIONS}
                  </span>
                </h3>

                {/* Coordinator Approval & Advance Confirmation Card */}
                {pendingApproval && (
                  <div className="border-2 border-emerald-700 bg-emerald-950/10 p-4 rounded-sm shadow-xl border-dashed mb-6 animate-fadeIn">
                    <div className="flex items-center gap-2 text-emerald-900 border-b border-emerald-800/30 pb-2 mb-2">
                      <CheckCircle className="size-5 text-emerald-700 shrink-0" />
                      <h4 className="font-serif font-bold text-sm uppercase tracking-wide">
                        Coordinator Approval Required
                      </h4>
                    </div>
                    
                    <p className="font-serif text-xs text-[#2b1810] mb-3 leading-relaxed">
                      Location QR Code for <strong className="text-emerald-950 font-bold">{pendingApproval.locationName}</strong> verified! 
                      Coordinator, please confirm to advance team.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleCoordinatorAdvance}
                        disabled={advancing}
                        className="flex-grow bg-emerald-800 hover:bg-emerald-900 text-[#f7eed6] py-3.5 px-4 font-serif text-xs font-bold uppercase tracking-wider shadow-md rounded-sm cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Play className="size-4 fill-current" />
                        {advancing ? "Advancing Team..." : `Approve & Advance to Step ${currentStepNumber + 1}`}
                      </button>

                      <button
                        onClick={() => setPendingApproval(null)}
                        className="bg-stone-300 hover:bg-stone-400 text-stone-900 py-3 px-4 font-serif text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Step progress bar */}
                <div className="mb-6 bg-wood/10 p-3 border border-[#7a4823]/15 rounded-sm">
                  <div className="flex justify-between items-center text-xs font-serif font-bold text-[#4a2206] tracking-wider mb-2">
                    <span>PROGRESS</span>
                    <span>{solvedCount} / {TOTAL_LOCATIONS} LOCATIONS SOLVED</span>
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
                    <span className="block text-[10px] font-serif tracking-wider text-ink-muted uppercase">Solved Locations</span>
                    <span className="font-serif text-lg font-bold text-[#4a2206]">{solvedCount} / {TOTAL_LOCATIONS}</span>
                  </div>
                </div>

                {/* Latest Clue Card */}
                <div className="relative p-4 border-2 border-[#8b5a2b]/40 bg-[#fefbf3] text-ink rounded-sm shadow-md flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold tracking-widest text-[#8b261b] uppercase border-b border-[#7a4823]/20 pb-1.5 mb-3 flex justify-between items-center">
                      <span>LATEST CLUE — STEP {currentStepNumber}</span>
                    </h4>
                    
                    <div className="font-serif text-xs leading-relaxed text-ink-muted font-medium mb-1">
                      {currentClue?.imageUrl ? (
                        <div className="relative rounded-sm overflow-hidden p-0.5">
                          <img
                            src={currentClue.imageUrl}
                            alt={`Current Clue Step ${currentStepNumber}`}
                            className="w-full max-h-80 object-contain rounded-sm shadow-sm"
                          />
                        </div>
                      ) : (
                        <p className="italic text-center py-6 text-amber-900/70 border border-dashed border-amber-900/30 rounded-sm">
                          "Clue image for Step {currentStepNumber} is being prepared..."
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {isCompleted ? (
                    <div className="mt-4 bg-emerald-100 border border-emerald-400 p-3 text-emerald-950 text-center text-xs font-serif font-bold rounded-sm uppercase tracking-wider shadow-sm flex items-center justify-center gap-2">
                      <CheckCircle className="size-4 text-emerald-800" /> Challenge Cleared! All Clues Decoded!
                    </div>
                  ) : (
                    <button
                      onClick={() => setScannerOpen(true)}
                      className="mt-4 w-full bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] py-3.5 px-4 font-serif text-xs font-bold uppercase tracking-[0.2em] shadow-md flex items-center justify-center gap-2 rounded-sm cursor-pointer transition-all active:scale-[0.98] no-drag"
                    >
                      <Camera className="size-4" /> Scan Location QR Code
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* SOLVED CLUES & TIMELINE (BOTTOM) */}
            {gameState?.solvedSteps && gameState.solvedSteps.length > 0 && (
              <div className="border-2 border-[#8b5a2b]/40 bg-[#f7eed6] p-5 shadow-lg text-ink">
                <h3 className="font-serif text-base font-bold text-[#4a2206] uppercase tracking-wide border-b border-[#7a4823]/30 pb-2 mb-6 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="size-5 text-amber-600" /> Solved Clues & History
                  </span>
                  <span className="text-xs bg-emerald-800 text-[#f7eed6] px-2.5 py-1 rounded-sm font-bold">
                    {gameState.solvedSteps.length} / {TOTAL_LOCATIONS} SOLVED
                  </span>
                </h3>

                <div className="flex flex-col gap-6">
                  {[...gameState.solvedSteps].reverse().map((solved) => (
                    <div 
                      key={solved.stepNo}
                      className="border border-emerald-800/40 bg-[#f7eed6] rounded-sm overflow-hidden shadow-md hover:shadow-lg transition-all"
                    >
                      {/* Big Full-Width Clue Image */}
                      {solved.imageUrl ? (
                        <div className="w-full relative bg-stone-950 overflow-hidden">
                          <img 
                            src={solved.imageUrl} 
                            alt={`Solved Step ${solved.stepNo}`} 
                            className="w-full max-h-[400px] object-contain mx-auto bg-black/40"
                          />
                          <div className="absolute top-3 left-3 bg-emerald-800 text-[#f7eed6] text-xs font-bold font-serif px-3 py-1 rounded-sm uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-emerald-600">
                            <CheckCircle className="size-3.5 text-emerald-200" /> Step {solved.stepNo} — Solved
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-emerald-950/10 border-b border-emerald-800/20 flex items-center justify-center text-emerald-900 font-bold font-serif text-sm">
                          Step {solved.stepNo} Image
                        </div>
                      )}

                      {/* Content details below image */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f7eed6]">
                        <div>
                          <h5 className="font-serif font-bold text-base text-[#2b1810] flex items-center gap-2">
                            <MapPin className="size-4 text-emerald-800 shrink-0" />
                            {solved.locationName || `Location ${solved.stepNo}`}
                          </h5>
                          {solved.scannedAt && (
                            <p className="text-xs font-serif text-emerald-950/80 font-medium mt-1 flex items-center gap-1">
                              <span className="opacity-75">Scanned at:</span> {new Date(solved.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          <span className="text-xs font-serif font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-sm border border-emerald-300 inline-flex items-center gap-1.5 shadow-sm">
                            <CheckCircle className="size-3.5 text-emerald-700" /> Solved ({solved.stepNo} / {TOTAL_LOCATIONS})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
