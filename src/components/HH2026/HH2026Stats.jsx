import MetaData from '../MetaData/MetaData'
import { TornEdgeDefs } from './roaming-assets'
import { SiteHeader } from './site-header'
import { StatsHero } from './stats-hero'
import { TeamStatsSection } from './team-stats-section'
import { SiteFooter } from './site-footer'

export default function HH2026Stats() {
  return (
    <div className="hh2026-page min-h-screen bg-background text-foreground antialiased relative">
      <MetaData title="Team Stats — Hudugata Hudakata 2026" />
      <TornEdgeDefs />
      <SiteHeader />
      <main>
        <StatsHero />
        <TeamStatsSection />
      </main>
      <SiteFooter />
    </div>
  )
}

