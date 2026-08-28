import React, { useState, useEffect, useRef } from "react";
import MetaData from "../MetaData/MetaData";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, RotateCcw } from "lucide-react";
import { Rivets } from "./ornaments";
import { Rope } from "./roaming-assets";

export default function HH2026QrScanner() {
  const [scannedLink, setScannedLink] = useState(null);
  const scannerState = useRef({ isStarting: false, html5QrCode: null });

  useEffect(() => {
    // We only want to start the scanner if there is no scanned link
    if (scannedLink) {
       if (scannerState.current.html5QrCode && scannerState.current.html5QrCode.isScanning) {
          scannerState.current.html5QrCode.stop().catch(console.error);
       }
       return;
    }

    if (scannerState.current.isStarting || (scannerState.current.html5QrCode && scannerState.current.html5QrCode.isScanning)) {
      return;
    }

    const html5QrCode = new Html5Qrcode("reader");
    scannerState.current.html5QrCode = html5QrCode;
    scannerState.current.isStarting = true;

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: (width, height) => {
          const min = Math.min(width, height);
          return { width: min * 0.7, height: min * 0.7 };
        }
      },
      (decodedText) => {
        setScannedLink(decodedText);
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch(console.error);
        }
      },
      (errorMessage) => {
        // parse errors, ignore
      }
    ).then(() => {
      scannerState.current.isStarting = false;
    }).catch((err) => {
      scannerState.current.isStarting = false;
      console.error("Camera startup failed:", err);
    });

    return () => {
      if (scannerState.current.html5QrCode && scannerState.current.html5QrCode.isScanning) {
        scannerState.current.html5QrCode.stop().catch(console.error);
      }
    };
  }, [scannedLink]);

  const handleReset = () => {
    setScannedLink(null);
  };

  return (
    <div className="hh2026-page min-h-screen bg-parchment text-foreground antialiased relative flex flex-col">
      <MetaData title="QR Scanner — Hudugata Hudakata 2026" />
      <SiteHeader />
      <main className="relative z-10 flex-grow flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-lg">
          <div className="relative border-2 border-primary/50 bg-wood p-4 shadow-2xl rounded-sm text-center">
            <Rope className="absolute -top-6 right-8 left-8 h-9 animate-sway" />
            <Rivets count={8} className="px-2 pb-3 pt-1" />
            
            <div className="relative border-2 border-[#8b5a2b]/40 bg-[#f7eed6] p-6">
              <QrCode className="size-12 mx-auto mb-4 text-[#7a4823]" />
              <h2 className="font-serif text-2xl font-bold text-[#4a2206] mb-2 uppercase tracking-wider">
                Scanner
              </h2>
              <p className="text-sm font-serif mb-6 text-ink-muted leading-relaxed">
                Aim your device camera at the clue location's QR code.
              </p>
              
              {!scannedLink ? (
                <div id="reader" className="w-full rounded-sm overflow-hidden border border-primary/30 mx-auto bg-black" style={{ minHeight: '300px' }}></div>
              ) : (
                <div className="mt-4">
                  <p className="font-serif text-xs font-bold tracking-[0.2em] text-primary uppercase mb-2">Scanned Result</p>
                  <div className="p-4 border-2 border-dashed border-primary/40 bg-white/50 rounded break-all font-mono text-sm text-ink font-semibold">
                     {scannedLink}
                  </div>
                  <button 
                    onClick={handleReset}
                    className="mt-6 inline-flex items-center justify-center gap-2 border border-primary bg-primary px-6 py-2.5 font-serif text-sm font-bold tracking-wider text-background shadow-md transition-all hover:bg-primary/80 uppercase"
                  >
                    <RotateCcw className="size-4" /> Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

