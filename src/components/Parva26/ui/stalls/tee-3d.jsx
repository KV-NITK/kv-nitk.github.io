import { useEffect, useRef, useState } from 'react'
import { TEE } from '@p26/content'
import { gsap } from '@p26/lib/gsap'
import { cn } from '@/lib/utils'

// The tee on its hanger, drawn in SVG, turning in 3D. It sways gently on
// its own; a drag turns it by hand and it settles facing front or back.
// Real photos (variant.photos) replace the drawing when they arrive.
export function Tee3D({ variant, back, onTurn, forward }) {
  const turnRef = useRef(null)
  const drag = useRef(null)
  const [held, setHeld] = useState(false)

  // Turn to the requested side the short way round.
  useEffect(() => {
    const el = turnRef.current
    const now = Number(gsap.getProperty(el, 'rotateY')) || 0
    let target = Math.round(now / 180) * 180
    if (Math.abs(Math.round(target / 180)) % 2 !== (back ? 1 : 0)) target += now >= target ? 180 : -180
    gsap.to(el, { rotateY: target, duration: 0.8, ease: 'power3.out' })
  }, [back])

  const onDown = (e) => {
    drag.current = { x: e.clientX, from: Number(gsap.getProperty(turnRef.current, 'rotateY')) || 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
    gsap.killTweensOf(turnRef.current)
    setHeld(true)
  }
  const onMove = (e) => {
    if (!drag.current) return
    gsap.set(turnRef.current, { rotateY: drag.current.from + (e.clientX - drag.current.x) * 0.7 })
  }
  const onUp = () => {
    if (!drag.current) return
    drag.current = null
    setHeld(false)
    const now = Number(gsap.getProperty(turnRef.current, 'rotateY')) || 0
    const target = Math.round(now / 180) * 180
    gsap.to(turnRef.current, { rotateY: target, duration: 0.6, ease: 'power3.out' })
    onTurn(Math.abs(target / 180) % 2 === 1)
  }

  const label = `${TEE.name.en}, ${variant.en}, ${back ? 'back' : 'front'}. Drag to turn it.`
  return (
    <div
      role="img"
      aria-label={label}
      data-en="Drag to turn the tee"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className={cn(
        'absolute left-1/2 top-[3%] w-[64%] -translate-x-1/2 cursor-grab touch-pan-y select-none transition-[scale] duration-500 ease-out [perspective:900px]',
        forward && 'scale-[1.07]',
        held && 'cursor-grabbing'
      )}
    >
      <div ref={turnRef} className="relative transform-3d">
        <div className={cn('relative transform-3d origin-top motion-safe:animate-tee-sway', held && '[animation-play-state:paused]')}>
          <div className="backface-hidden">
            <TeeFace variant={variant} side="front" />
          </div>
          <div className="absolute inset-0 rotate-y-180 backface-hidden">
            <TeeFace variant={variant} side="back" />
          </div>
        </div>
      </div>
    </div>
  )
}

const TEE_FRONT = 'M68 32 C80 50 120 50 132 32 L166 42 L198 80 L174 104 L160 92 L162 228 Q100 234 38 228 L40 92 L26 104 L2 80 L34 42 Z'

const TEE_BACK = 'M68 32 C82 40 118 40 132 32 L166 42 L198 80 L174 104 L160 92 L162 228 Q100 234 38 228 L40 92 L26 104 L2 80 L34 42 Z'

function TeeFace({ variant, side }) {
  const id = `p26-tee-${variant.id}-${side}`
  const photo = variant.photos?.[side]
  if (photo) return <img src={photo} alt="" className="block w-full" draggable={false} />
  const front = side === 'front'
  const shape = front ? TEE_FRONT : TEE_BACK
  const kn = "'Baloo Tamma 2 Variable', sans-serif"
  return (
    <svg viewBox="0 0 200 236" className="block w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}-shade`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".38" />
          <stop offset=".22" stopColor="#000" stopOpacity="0" />
          <stop offset=".48" stopColor="#fff" stopOpacity=".08" />
          <stop offset=".78" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id={`${id}-fall`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".06" />
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
      </defs>
      {/* Hanger */}
      <path d="M100 2 C92 2 90 12 97 13 L100 20" fill="none" stroke="#b8862b" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M48 44 Q100 16 152 44" fill="none" stroke="#7a4a24" strokeWidth="6" strokeLinecap="round" />
      {/* Cloth */}
      <path d={shape} transform="translate(4 6)" fill="#000" opacity=".35" />
      <path d={shape} fill={variant.body} />
      <path d={shape} fill={`url(#${id}-shade)`} />
      <path d={shape} fill={`url(#${id}-fall)`} />
      <g fill="none" strokeLinecap="round">
        <path d="M44 96 C50 140 46 180 50 226" stroke="#000" strokeOpacity=".16" strokeWidth="4" />
        <path d="M156 96 C150 140 154 180 150 226" stroke="#000" strokeOpacity=".16" strokeWidth="4" />
        <path d="M86 150 C90 180 86 204 90 228" stroke="#000" strokeOpacity=".1" strokeWidth="3" />
        <path d="M118 140 C114 170 120 196 116 228" stroke="#fff" strokeOpacity=".06" strokeWidth="3" />
        <path d="M8 86 L28 106 M192 86 L172 106" stroke="#000" strokeOpacity=".3" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M40 222 Q100 228 160 222" stroke="#000" strokeOpacity=".3" strokeWidth="1" strokeDasharray="2 2" />
        <path d={front ? 'M68 32 C80 50 120 50 132 32' : 'M68 32 C82 40 118 40 132 32'} stroke="#000" strokeOpacity=".3" strokeWidth="6" />
        <path d={front ? 'M68 32 C80 50 120 50 132 32' : 'M68 32 C82 40 118 40 132 32'} stroke={variant.body} strokeWidth="3" />
      </g>
      {/* Print */}
      {front ? (
        <g textAnchor="middle" fontFamily={kn} fontWeight="800">
          <text x="100" y="128" fontSize="46" fill={variant.print} stroke={variant.ink} strokeWidth="1.4" paintOrder="stroke">
            ಪರ್ವ
          </text>
          <rect x="62" y="140" width="76" height="11" fill={variant.ink} />
          {[66, 76, 86, 96, 106, 116, 126].map((x) => (
            <rect key={x} x={x} y="142.5" width="5" height="2" fill={variant.body} />
          ))}
          {[66, 76, 86, 96, 106, 116, 126].map((x) => (
            <rect key={`b${x}`} x={x} y="146.5" width="5" height="2" fill={variant.body} />
          ))}
          <text x="100" y="170" fontSize="13" letterSpacing="4" fill={variant.print}>
            ೨೦೨೬
          </text>
          <text x="100" y="186" fontSize="7.5" fontWeight="600" fill={variant.print} opacity=".9">
            ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ
          </text>
        </g>
      ) : (
        <g textAnchor="middle" fontFamily={kn} fontWeight="800" fill={variant.print}>
          <text x="100" y="72" fontSize="15">
            ಪರ್ವ ೨೦೨೬
          </text>
          <text x="100" y="118" fontSize="23" stroke={variant.ink} strokeWidth="1" paintOrder="stroke">
            ಕನ್ನಡ ವೇದಿಕೆ
          </text>
          <text x="100" y="134" fontSize="8.5" letterSpacing="2.5" fontFamily="'Bebas Neue', sans-serif" fontWeight="400">
            NITK SURATHKAL
          </text>
        </g>
      )}
    </svg>
  )
}
