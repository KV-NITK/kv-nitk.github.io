import { useEffect, useState } from 'react'

const CRITICAL_ASSETS = [
  '/hh2026/prop-compass-loader.png',
  '/hh2026/hero-img.png',
  '/hh2026/parchment-texture.png',
  '/hh2026/prop-map-scrap.png',
  '/hh2026/prop-coin.png',
  '/hh2026/prop-revolver.png',
  '/hh2026/treasure-chest.png',
  '/hh2026/kannada-vedike-logo.png',
]

export function HH2026Preloader() {
  const [progress, setProgress] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let loadedCount = 0
    const totalAssets = CRITICAL_ASSETS.length
    let isCancelled = false

    const handleSingleAssetLoaded = () => {
      if (isCancelled) return
      loadedCount += 1
      const currentPct = Math.round((loadedCount / totalAssets) * 100)
      setProgress(currentPct)

      if (loadedCount >= totalAssets) {
        finishLoading()
      }
    }

    const finishLoading = () => {
      if (isCancelled) return
      setProgress(100)
      setTimeout(() => {
        setIsFading(true)
        setTimeout(() => {
          setIsComplete(true)
        }, 700) // Wait for opacity transition
      }, 300)
    }

    // Preload images in parallel
    CRITICAL_ASSETS.forEach((src) => {
      const img = new Image()
      img.onload = handleSingleAssetLoaded
      img.onerror = handleSingleAssetLoaded // Continue gracefully on error
      img.src = src
    })

    // Fallback safety timeout (max 3.5 seconds)
    const fallbackTimer = setTimeout(() => {
      finishLoading()
    }, 3500)

    return () => {
      isCancelled = true
      clearTimeout(fallbackTimer)
    }
  }, [])

  if (isComplete) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#120a06] text-[#f7eed6] transition-opacity duration-700 ease-in-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial parchment aura */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(139,90,43,0.15)_0%,transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Spinning Compass Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute size-28 sm:size-36 rounded-full bg-[#d4a017]/10 blur-xl animate-pulse" />
          <img
            src="/hh2026/prop-compass-loader.png"
            alt="Loading Compass"
            className="size-24 sm:size-32 animate-spin-compass drop-shadow-[0_10px_25px_rgba(212,160,23,0.35)] select-none"
          />
        </div>

        {/* Pirate Title & Subtitle */}
        <div className="flex flex-col gap-1.5 mt-2">
          <h3 className="font-serif text-lg sm:text-2xl font-black uppercase tracking-[0.25em] text-[#f7eed6]">
            Hudugata Hudakata
          </h3>
          <p className="font-serif text-xs sm:text-sm tracking-[0.2em] text-[#d4a017] uppercase">
            {progress < 100 ? 'NAVIGATING THE HIGH SEAS...' : 'LAND HO! SQUAD READY.'}
          </p>
        </div>

        {/* Golden Progress Bar */}
        <div className="w-56 sm:w-72 flex flex-col items-center gap-2 mt-1">
          <div className="w-full h-2.5 rounded-full border border-[#8b5a2b]/60 bg-[#1e110a] p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8b261b] via-[#d4a017] to-[#f7eed6] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(212,160,23,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold tracking-widest text-[#d4a017]">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  )
}
