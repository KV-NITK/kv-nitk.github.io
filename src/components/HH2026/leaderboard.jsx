import MetaData from '../MetaData/MetaData'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { TornEdgeDefs } from './roaming-assets'
import './hh2026.css'

const hardcodedTeams = [
  { teamName: "The Trailblazers", leaderName: "Rahul Sharma", locationsVisited: 6, points: 60, timestamp: "2026-08-26T11:20:00", status: "Active" },
  { teamName: "Seekers of Nitk", leaderName: "Anjali Gowda", locationsVisited: 5, points: 50, timestamp: "2026-08-26T10:45:00", status: "Completed" },
  { teamName: "Coastal Pirates", leaderName: "Vikram Singh", locationsVisited: 5, points: 50, timestamp: "2026-08-26T10:30:00", status: "Active" },
  { teamName: "Neon Ninjas", leaderName: "Priya Rao", locationsVisited: 4, points: 40, timestamp: "2026-08-26T09:15:00", status: "Active" },
  { teamName: "Lantern Bearers", leaderName: "Karthik N", locationsVisited: 2, points: 20, timestamp: "2026-08-26T08:00:00", status: "Disqualified" }
];

// Sort logic: points descending, then timestamp ascending
const sortedTeams = [...hardcodedTeams].sort((a, b) => {
  if (b.points !== a.points) {
    return b.points - a.points;
  }
  return new Date(a.timestamp) - new Date(b.timestamp);
});

export default function HH2026Leaderboard() {
  return (
    <div className="hh2026-page min-h-screen bg-background text-foreground antialiased relative">
      <MetaData title="Leaderboard - Hudugata Hudakata" />
      <TornEdgeDefs />
      <SiteHeader />
      
      <main className="relative min-h-screen bg-parchment py-24 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-5xl px-5">
          <div className="mb-12 text-center">
            <h1 className="text-carved text-5xl sm:text-7xl font-bold mb-4 uppercase">Leaderboard</h1>
            <p className="text-muted-foreground font-serif tracking-[0.2em] uppercase text-sm">
              Current ranks of the treasure hunters
            </p>
          </div>
          
          <div className="bg-pamphlet-alt p-12 sm:p-20 md:px-32 md:py-28 shadow-2xl relative mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-serif text-ink border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-primary/30">
                    <th className="py-4 px-4 font-extrabold text-ink-accent tracking-wider uppercase text-xl">Rank</th>
                    <th className="py-4 px-4 font-extrabold text-ink-accent tracking-wider uppercase text-xl">Team Name</th>
                    <th className="py-4 px-4 font-extrabold text-ink-accent tracking-wider uppercase text-xl">Leader</th>
                    <th className="py-4 px-4 font-extrabold text-ink-accent tracking-wider uppercase text-xl text-center">Locations</th>
                    <th className="py-4 px-4 font-extrabold text-ink-accent tracking-wider uppercase text-xl text-center">Points</th>
                    <th className="py-4 px-4 font-extrabold text-ink-accent tracking-wider uppercase text-xl text-center">Status</th>
                    <th className="py-4 px-4 font-extrabold text-ink-accent tracking-wider uppercase text-xl text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map((team, idx) => (
                    <tr key={team.teamName} className="border-b border-primary/10 hover:bg-black/5 transition-colors">
                      <td className="py-5 px-4 font-extrabold text-4xl text-ink-accent">{idx + 1}</td>
                      <td className="py-5 px-4 font-bold text-lg">{team.teamName}</td>
                      <td className="py-5 px-4">{team.leaderName}</td>
                      <td className="py-5 px-4 text-center text-lg">{team.locationsVisited}</td>
                      <td className="py-5 px-4 text-center font-bold text-xl text-ink-accent">{team.points}</td>
                      <td className="py-5 px-4 text-center">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                          team.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          team.status === 'Completed' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {team.status}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-right text-sm text-ink-muted">
                        {new Date(team.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <img 
          src="/hh2026/prop-coin.png" 
          alt="" 
          className="absolute bottom-10 right-10 w-32 opacity-80 animate-float pointer-events-none"
          style={{ "--roam-rotate": "15deg" }}
        />
        <img 
          src="/hh2026/prop-compass.png" 
          alt="" 
          className="absolute top-32 left-10 w-40 opacity-70 animate-sway pointer-events-none hidden md:block"
          style={{ "--roam-rotate": "-10deg" }}
        />
      </main>
      
      <SiteFooter />
    </div>
  )
}

