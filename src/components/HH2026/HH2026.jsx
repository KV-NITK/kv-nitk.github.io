import MetaData from '../MetaData/MetaData'
import { HH2026Preloader } from './preloader'
import { TornEdgeDefs } from './roaming-assets'
import { SiteHeader } from './site-header'
import { Hero } from './hero'
import { LegendSection } from './legend-section'
import { TeamSection } from './team-section'
import { RegisterSection } from './register-section'
import { SiteFooter } from './site-footer'
import { AnnouncementPopup } from './announcement-popup'

export default function HH2026() {
  return (
    <div className="hh2026-page min-h-screen bg-background text-foreground antialiased relative">
      <HH2026Preloader />
      <AnnouncementPopup />
      <MetaData title="Hudugata Hudakata — Treasure Hunt by Kannada Vedike, NITK" />
      <TornEdgeDefs />
      <SiteHeader />
      <main>
        <Hero />
        <LegendSection />
        <TeamSection />
        <RegisterSection />
      </main>
      <SiteFooter />
    </div>
  )
}
