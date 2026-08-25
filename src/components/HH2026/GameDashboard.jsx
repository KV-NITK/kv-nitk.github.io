import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MetaData from "../MetaData/MetaData.jsx";
import { SiteHeader } from "./site-header";
import { Plaque, DiamondBand, Rivets } from "./ornaments";
import { CompassRose, Rope } from "./roaming-assets";
import API_URL from "../../api/api";
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
  User
} from "lucide-react";

const MOCK_LOCATIONS = [
  {
    id: "loc-1",
    name: "LHC (Lecture Hall Complex)",
    x_coord: 900,
    y_coord: 350,
    reveal_radius: 120,
    clue: "Find the place where the future engineers listen to daily lectures, near the green lawn.",
    qrCode: "qr-lhc"
  },
  {
    id: "loc-2",
    name: "Main Pavilion",
    x_coord: 1100,
    y_coord: 450,
    reveal_radius: 100,
    clue: "Where sports stars rest and crowds cheer, overlooking the running tracks.",
    qrCode: "qr-pavilion"
  },
  {
    id: "loc-3",
    name: "Srinivas Library",
    x_coord: 850,
    y_coord: 550,
    reveal_radius: 110,
    clue: "A treasury of knowledge, silences must be kept, books of past giants are piled high.",
    qrCode: "qr-library"
  },
  {
    id: "loc-4",
    name: "Mega Hostel Complex",
    x_coord: 1300,
    y_coord: 250,
    reveal_radius: 130,
    clue: "The towering blocks where nights are sleepless and friendships are forged over instant noodles.",
    qrCode: "qr-mega"
  },
  {
    id: "loc-5",
    name: "ATB (Applied Mechanics Block)",
    x_coord: 950,
    y_coord: 650,
    reveal_radius: 100,
    clue: "Where forces are analyzed and fluid dynamics are simulated, next to the heritage gate.",
    qrCode: "qr-atb"
  },
  {
    id: "loc-6",
    name: "Main Lawn",
    x_coord: 1050,
    y_coord: 550,
    reveal_radius: 110,
    clue: "The green heart of East Campus where students gather to bask in the sun and click pictures.",
    qrCode: "qr-lawn"
  },
  // Dummy locations
  {
    id: "dummy-1",
    name: "Mechanical Dept Seminar Hall",
    x_coord: 820,
    y_coord: 250,
    reveal_radius: 90,
    clue: "",
    qrCode: "qr-mech"
  },
  {
    id: "dummy-2",
    name: "Chemical Dept Block",
    x_coord: 1200,
    y_coord: 600,
    reveal_radius: 100,
    clue: "",
    qrCode: "qr-chem"
  },
  {
    id: "dummy-3",
    name: "NTB (New Technology Block)",
    x_coord: 1000,
    y_coord: 200,
    reveal_radius: 100,
    clue: "",
    qrCode: "qr-ntb"
  },
  {
    id: "dummy-4",
    name: "Silver Jubilee Auditorium",
    x_coord: 1250,
    y_coord: 400,
    reveal_radius: 120,
    clue: "",
    qrCode: "qr-sja"
  }
];

const PATH_STEPS = ["loc-1", "loc-2", "loc-3", "loc-4", "loc-5", "loc-6"];

export default function GameDashboard() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [gameState, setGameState] = useState(null);
  const [loadingState, setLoadingState] = useState(true);
  const [isLocalFallback, setIsLocalFallback] = useState(false);

  // Map Navigation state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStartDist, setTouchStartDist] = useState(null);
  const [touchStartZoom, setTouchStartZoom] = useState(1);
  const [touchStartPan, setTouchStartPan] = useState({ x: 0, y: 0 });
  const [touchFocalPoint, setTouchFocalPoint] = useState({ x: 0, y: 0 });

  // Dev Simulation panel state
  const [selectedScanQr, setSelectedScanQr] = useState("");
  const [scanResult, setScanResult] = useState(null); // { success: boolean, message: string }
  const [scanning, setScanning] = useState(false);

  const mapContainerRef = useRef(null);

  // ==========================================
  // Check Auth & Fetch Game State
  // ==========================================
  const fetchGameState = async () => {
    try {
      const response = await fetch(`${API_URL}/game/state`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        setUser(null);
        setGameState(null);
        return false;
      }

      const data = await response.json();
      if (data.success) {
        setGameState(data);
        return true;
      }
    } catch (err) {
      console.error("Failed to fetch game state:", err);
    }
    return false;
  };

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            const fetched = await fetchGameState();
            if (fetched) {
              setCheckingAuth(false);
              setLoadingState(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
      }

      // Fallback to local testing state
      console.log("Using client-side mock state for local testing");
      setIsLocalFallback(true);
      setUser({ name: "Mock Leader (Local)", email: "mock@nitk.edu.in" });
      setGameState({
        success: true,
        score: 100,
        currentStepNo: 1,
        totalSteps: PATH_STEPS.length,
        currentClueText: "Where sports stars rest and crowds cheer, overlooking the running tracks.",
        revealedLocations: [
          {
            id: "loc-1",
            name: "LHC (Lecture Hall Complex)",
            x_coord: 900,
            y_coord: 350,
            reveal_radius: 120
          }
        ],
        incorrectAttempts: [],
        completed: false,
        locationsList: MOCK_LOCATIONS.map(l => ({ id: l.id, name: l.name, qrCode: l.qrCode }))
      });
      setCheckingAuth(false);
      setLoadingState(false);
    };

    verifyUser();
  }, []);

  // Initialize Map Centering
  useEffect(() => {
    if (gameState) {
      resetMap();
    }
  }, [loadingState, !!gameState]);

  const resetMap = () => {
    const isMobile = window.innerWidth < 768;
    setZoom(isMobile ? 0.55 : 0.85);
    setPan(isMobile ? { x: -380, y: -65 } : { x: -425, y: -115 });
  };

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
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
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
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && touchStartDist !== null && mapContainerRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const factor = dist / touchStartDist;
      
      let newZoom = touchStartZoom * factor;
      newZoom = Math.min(Math.max(newZoom, 0.45), 2.5);

      const fx = touchFocalPoint.x;
      const fy = touchFocalPoint.y;
      
      const mx = (fx - touchStartPan.x) / touchStartZoom;
      const my = (fy - touchStartPan.y) / touchStartZoom;
      
      const newPan = {
        x: fx - mx * newZoom,
        y: fy - my * newZoom
      };

      setZoom(newZoom);
      setPan(newPan);
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

    const zoomFactor = 1.15;
    let newZoom = zoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(zoom * zoomFactor, 2.5);
    } else {
      newZoom = Math.max(zoom / zoomFactor, 0.45);
    }

    if (newZoom !== zoom) {
      const mx = (fx - pan.x) / zoom;
      const my = (fy - pan.y) / zoom;
      
      const newPan = {
        x: fx - mx * newZoom,
        y: fy - my * newZoom
      };

      setZoom(newZoom);
      setPan(newPan);
    }
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.25, 2.5));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.25, 0.45));
  };
  // ==========================================
  // Scan Simulation
  // ==========================================
  const handleSimulateScan = async () => {
    if (!selectedScanQr) return;
    setScanning(true);
    setScanResult(null);

    if (isLocalFallback) {
      // Local progression logic mock
      setTimeout(() => {
        const cleanQr = String(selectedScanQr).trim();
        
        if (gameState.completed) {
          setScanResult({
            success: false,
            message: "You have already completed the hunt!"
          });
          setScanning(false);
          return;
        }

        const nextLocIndex = gameState.currentStepNo;
        if (nextLocIndex >= PATH_STEPS.length) {
          setScanResult({
            success: false,
            message: "Invalid game state. Already at final step."
          });
          setScanning(false);
          return;
        }

        const expectedLocId = PATH_STEPS[nextLocIndex];
        const expectedLoc = MOCK_LOCATIONS.find(l => l.id === expectedLocId);

        let newState = { ...gameState };

        // 1. Correct Scan
        if (expectedLoc && cleanQr === expectedLoc.qrCode) {
          newState.currentStepNo += 1;
          
          if (!newState.revealedLocations.some(l => l.id === expectedLocId)) {
            newState.revealedLocations.push({
              id: expectedLoc.id,
              name: expectedLoc.name,
              x_coord: expectedLoc.x_coord,
              y_coord: expectedLoc.y_coord,
              reveal_radius: expectedLoc.reveal_radius
            });
          }
          newState.score += 20;

          if (newState.currentStepNo === PATH_STEPS.length) {
            newState.completed = true;
            newState.currentClueText = "Congratulations! You have completed the treasure hunt!";
          } else {
            const nextNextLocId = PATH_STEPS[newState.currentStepNo];
            const nextNextLoc = MOCK_LOCATIONS.find(l => l.id === nextNextLocId);
            newState.currentClueText = nextNextLoc ? nextNextLoc.clue : "";
          }

          setGameState(newState);
          setScanResult({
            success: true,
            message: `Excellent! You successfully found: ${expectedLoc.name}!`
          });
        } 
        // 2. Incorrect Scan
        else {
          const scannedLoc = MOCK_LOCATIONS.find(l => cleanQr === l.qrCode);
          if (scannedLoc) {
            newState.score = Math.max(0, newState.score - 10);
            newState.incorrectAttempts = [
              ...newState.incorrectAttempts,
              {
                x: scannedLoc.x_coord,
                y: scannedLoc.y_coord,
                name: scannedLoc.name,
                timestamp: new Date().toISOString()
              }
            ];
            setGameState(newState);
            setScanResult({
              success: false,
              message: `Incorrect location scanned: "${scannedLoc.name}". Penalty applied!`
            });
          } else {
            newState.score = Math.max(0, newState.score - 5);
            setGameState(newState);
            setScanResult({
              success: false,
              message: "Invalid QR code. This code is not part of the hunt. Penalty applied!"
            });
          }
        }
        setScanning(false);
        setTimeout(() => setScanResult(null), 5500);
      }, 500);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/game/scan`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrCode: selectedScanQr }),
      });

      const data = await response.json();
      setScanResult({
        success: data.success,
        message: data.message
      });

      if (data.success || data.gameState) {
        setGameState(data.gameState);
      }
    } catch (err) {
      console.error("Scan simulation failed:", err);
      setScanResult({
        success: false,
        message: "Failed to connect to the server."
      });
    } finally {
      setScanning(false);
      // Auto clear result toast after 5 seconds
      setTimeout(() => {
        setScanResult(null);
      }, 5500);
    }
  };

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

  return (
    <div className="hh2026-page min-h-screen bg-parchment text-foreground relative flex flex-col justify-between overflow-hidden">
      <MetaData title="Fog of War Map & Progress — Hudugata Hudakata 2026" />
      <SiteHeader />

      {/* Main Gameplay Screen */}
      <main className="relative z-10 flex-grow flex flex-col items-center p-4 max-w-7xl w-full mx-auto pb-8">
        
        {/* Plaque / Title header */}
        <div className="text-center w-full max-w-3xl mb-4">
          <Plaque
            eyebrow={`Team: ${gameState?.teamName || user.name}`}
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
                  {scanResult.success ? "Scan Success" : "Scan Rejected"}
                </h4>
                <p className="text-xs font-serif leading-relaxed mt-1">{scanResult.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Outer Dashboard layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-grow items-stretch">
          
          {/* LEFT 8 COLS: INTERACTIVE MAP CONTAINER */}
          <div className="lg:col-span-8 flex flex-col relative border-2 border-primary/50 bg-wood p-2 shadow-2xl rounded-sm min-h-[450px] md:min-h-[550px] select-none">
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
              className="relative w-full h-full overflow-hidden bg-[#18110b] rounded-sm cursor-grab active:cursor-grabbing border border-[#8b5a2b]/30 touch-none"
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
                      {gameState?.revealedLocations.map(loc => (
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

                {/* Layer 1: Base Map Image */}
                <image 
                  href="/hh2026/prop-map-scrap.png" 
                  width="1500" 
                  height="1000" 
                />

                {/* Layer 2: Fog Overlay (Masked) */}
                <rect 
                  x="0" 
                  y="0" 
                  width="1500" 
                  height="1000" 
                  fill="#1a1412" 
                  opacity="0.88" 
                  mask="url(#cloud-mask)" 
                />
                
                {/* Ambient Fog wisps on top of overlay for aesthetic */}
                <rect 
                  x="0" 
                  y="0" 
                  width="1500" 
                  height="1000" 
                  fill="#2c2421" 
                  opacity="0.22" 
                  mask="url(#cloud-mask)" 
                  className="animate-flicker"
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
                {gameState?.revealedLocations.map((loc, idx) => (
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
                  </g>
                ))}
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
                    <span>STEP {gameState?.currentStepNo} / {gameState?.totalSteps}</span>
                  </div>
                  <div className="w-full h-3.5 bg-[#2b1810]/20 rounded-full overflow-hidden p-0.5 border border-[#8b5a2b]/30">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-700 to-[#7a4823] rounded-full transition-all duration-500 shadow-inner"
                      style={{ width: `${(gameState?.currentStepNo / gameState?.totalSteps) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Score and status */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#2b1810]/5 border border-[#7a4823]/20 p-3 text-center rounded-sm">
                    <Trophy className="size-5 mx-auto mb-1 text-amber-600 animate-pulse" />
                    <span className="block text-[10px] font-serif tracking-wider text-ink-muted uppercase">Score</span>
                    <span className="font-serif text-lg font-bold text-[#4a2206]">{gameState?.score} pts</span>
                  </div>
                  <div className="bg-[#2b1810]/5 border border-[#7a4823]/20 p-3 text-center rounded-sm">
                    <Navigation className="size-5 mx-auto mb-1 text-emerald-600" />
                    <span className="block text-[10px] font-serif tracking-wider text-ink-muted uppercase">Revealed</span>
                    <span className="font-serif text-lg font-bold text-[#4a2206]">{gameState?.revealedLocations.length} areas</span>
                  </div>
                </div>

                {/* Clue card */}
                <div className="relative p-4 border border-[#c1ad87] bg-pamphlet bg-cover text-ink rounded-sm shadow-inner min-h-[160px] flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-xs font-bold tracking-widest text-[#4a2206] uppercase border-b border-[#7a4823]/20 pb-1 mb-2">
                      Current Clue
                    </h4>
                    <p className="font-serif italic text-xs leading-relaxed text-ink-muted font-medium text-pretty">
                      "{gameState?.currentClueText}"
                    </p>
                  </div>
                  
                  {gameState?.completed && (
                    <div className="mt-4 bg-emerald-100 border border-emerald-400 p-2 text-emerald-950 text-center text-xs font-serif font-bold rounded-sm uppercase">
                      🎉 Challenge Cleared!
                    </div>
                  )}
                </div>
              </div>

              {/* Developer / Scanner simulation panel */}
              <div className="mt-6 border-t border-[#7a4823]/30 pt-4 no-drag">
                <h4 className="font-serif text-xs font-bold tracking-wider text-[#4a2206] uppercase mb-2 flex items-center gap-1.5">
                  <QrCode className="size-4 text-[#7a4823]" /> QR Code Scanner Simulator
                </h4>
                <p className="text-[10px] text-ink-muted font-serif mb-3 leading-relaxed">
                  Select a location below to simulate scanning a physical QR code found at that spot.
                </p>
                <div className="flex gap-2">
                  <select
                    value={selectedScanQr}
                    onChange={(e) => setSelectedScanQr(e.target.value)}
                    className="flex-grow bg-[#2b1810]/5 border border-[#7a4823]/40 px-2 py-1.5 text-xs text-ink font-serif focus:ring-1 focus:ring-[#7a4823] focus:outline-none rounded-sm"
                  >
                    <option value="">-- Choose Location QR --</option>
                    {gameState?.locationsList?.map(l => (
                      <option key={l.id} value={l.qrCode}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSimulateScan}
                    disabled={scanning || !selectedScanQr}
                    className="bg-[#7a4823] hover:bg-[#5c3519] disabled:bg-[#7a4823]/40 text-[#f7eed6] px-3 py-1.5 text-xs font-serif font-bold uppercase transition-all shadow-md flex items-center gap-1 shrink-0 rounded-sm"
                  >
                    {scanning ? "..." : <Play className="size-3" />} Scan
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
