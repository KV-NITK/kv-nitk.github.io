import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP)

// Web fonts change text heights after the first layout, so re-measure scroll
// trigger points once they have loaded.
document.fonts?.ready.then(() => ScrollTrigger.refresh())

export { gsap, ScrollTrigger, useGSAP }
