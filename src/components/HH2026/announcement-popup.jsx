import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function AnnouncementPopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Show popup after a short delay to ensure preloader is mostly done or page is visible
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-pamphlet p-12 drop-shadow-2xl animate-in fade-in zoom-in duration-300">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-6 top-6 rounded-full p-2 bg-accent text-accent-foreground hover:bg-accent/80 transition-colors shadow-lg"
          aria-label="Close popup"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <img 
            src="/hh2026/treasure-chest.png" 
            alt="Treasure Chest" 
            className="h-32 w-32 object-contain drop-shadow-lg mb-2"
          />
          
          <h2 className="font-serif text-3xl font-bold text-ink-accent tracking-wide">
            Prize Update!
          </h2>
          
          <p className="text-ink font-medium text-lg leading-relaxed">
            Due to a massive surge in participants, the event's prize pool has been increased!
          </p>
          
          <div className="text-ink-accent text-2xl font-bold font-serif pt-2 flex items-center gap-3">
            <span className="line-through text-ink/70 text-xl">10,000</span>
            <span className="text-4xl text-carved">15,000</span>
          </div>
          
          <p className="text-ink font-semibold tracking-wider uppercase text-sm mt-4">
            Worth of Prizes
          </p>
        </div>
      </div>
    </div>
  )
}

