import { useState } from 'react'
import { PageShell } from '@p26/chrome/page-shell'
import { FeastPoster } from '@p26/ui/stalls/feast-poster'
import { BookingCounter } from '@p26/ui/stalls/booking-counter'
import { MEAL, eventDay } from '@p26/content'
import { En, usePrefs } from '@p26/lib/prefs'
import { paper } from '@p26/styles/textures'

export default function FoodCoupons() {
  const [ticketGenerated, setTicketGenerated] = useState(false)

  return (
    <PageShell title="ಭೂರಿ ಭೋಜನ · Food Coupons" topBar={{ home: '/parva-26', ticket: false }}>
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-4 py-12 md:flex-row md:items-start md:gap-12 md:py-20">
        {!ticketGenerated ? (
           <>
             {/* The poster with the banana leaf animation */}
             <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
               <FeastPoster />
             </div>
             {/* The booking counter */}
             <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
               <BookingCounter onBook={() => setTicketGenerated(true)} />
             </div>
           </>
        ) : (
           <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 mt-10">
              <MealTicket />
           </div>
        )}
      </main>
    </PageShell>
  )
}

function MealTicket() {
  const { subtitles } = usePrefs()
  const day = eventDay(MEAL.day)
  
  return (
    <div 
      className="relative mx-auto w-full max-w-sm rounded-[4px] p-8 text-center shadow-2xl transition-all" 
      style={{ ...paper, backgroundColor: '#f3ead5' }}
    >
       {/* Leaf mark */}
       <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-[#3E7B2E] shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)] border-4 border-[#f3ead5]">
         <LeafMark className="size-10 text-white drop-shadow-md" />
       </div>
       
       <h2 className="mb-2 font-kn-display text-4xl font-extrabold text-kumkuma drop-shadow-sm">
         ಭೂರಿ ಭೋಜನ
       </h2>
       <En className="mb-8 block font-poster text-2xl tracking-[0.2em] text-[#4a2c14]">MEAL TICKET</En>
       
       <div className="mb-8 flex justify-center">
         {/* Fake QR Code */}
         <div className="rounded-lg bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-[#e5d4b5]">
           <svg className="size-40" viewBox="0 0 100 100">
             <rect width="100" height="100" fill="#fff" />
             <path d="M10 10h20v20h-20zM70 10h20v20h-20zM10 70h20v20h-20z" fill="#000" />
             <path d="M15 15h10v10h-10zM75 15h10v10h-10zM15 75h10v10h-10z" fill="#000" />
             <rect x="40" y="10" width="10" height="10" fill="#000" />
             <rect x="55" y="20" width="10" height="10" fill="#000" />
             <rect x="35" y="35" width="30" height="30" fill="#000" />
             <rect x="40" y="70" width="10" height="20" fill="#000" />
             <rect x="70" y="45" width="20" height="10" fill="#000" />
             <rect x="80" y="75" width="10" height="15" fill="#000" />
             <rect x="55" y="80" width="15" height="10" fill="#000" />
             <rect x="10" y="45" width="15" height="15" fill="#000" />
             <rect x="25" y="55" width="10" height="10" fill="#000" />
             <rect x="65" y="65" width="10" height="10" fill="#000" />
           </svg>
         </div>
       </div>

       <div className="border-t-[3px] border-dashed border-[#c2aa84] pt-6 font-kn-body text-[#4a2c14]">
         <p className="font-kn-display text-xl font-bold">{day.kn} · {MEAL.time.kn}</p>
         <En className="text-sm font-semibold opacity-80">{day.en}, {MEAL.time.en}</En>
         
         <p className="mt-3 font-kn-display text-lg font-bold">{MEAL.venue.kn}</p>
         <En className="text-sm font-semibold opacity-80">{MEAL.venue.en}</En>
         
         <div className="mt-6 inline-block bg-[#e5d4b5] px-4 py-2 rounded-[2px] border border-[#c2aa84]">
            <p className="font-mono text-sm font-bold tracking-widest text-[#6B3F22]">
              P26-MEAL-{Math.floor(1000 + Math.random() * 9000)}
            </p>
         </div>
       </div>
    </div>
  )
}

function LeafMark({ className }) {
  return (
    <svg viewBox="0 0 40 20" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 16 C10 2 30 0 38 4 C32 14 14 20 2 16 Z" fill="currentColor" fillOpacity=".25" />
      <path d="M2 16 C14 11 26 7 38 4" />
      {[10, 16, 22, 28].map((x) => (
        <path key={x} d={`M${x} ${13 - (x - 10) * 0.28} l3 -5 M${x} ${13 - (x - 10) * 0.28} l-1 5`} strokeWidth=".8" />
      ))}
    </svg>
  )
}
