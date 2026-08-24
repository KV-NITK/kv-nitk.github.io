import { GallerySection } from '@/components/gallery-section'
import { Hero } from '@/components/hero'
import { LegendSection } from '@/components/legend-section'
import { RegisterSection } from '@/components/register-section'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { TeamSection } from '@/components/team-section'

export default function Home() {
  return (
    <div className="min-h-screen">
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
