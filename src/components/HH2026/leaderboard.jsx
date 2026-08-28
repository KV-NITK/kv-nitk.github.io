import MetaData from '../MetaData/MetaData'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { TornEdgeDefs } from './roaming-assets'
import './hh2026.css'

import { useState, useEffect } from 'react'
import config from '../../config'

export default function HH2026Leaderboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const fetchLeaderboard = async (currentPasscode) => {
    try {
      const res = await fetch(`${config.API_URL}/api/teams/leaderboard`, {
        headers: {
          "x-passcode": currentPasscode,
        },
      });
      const data = await res.json();
      
      if (data.success) {
        setTeams(data.teams);
        setIsAuthenticated(true);
        setError("");
      } else {
        if (res.status === 401) {
          setIsAuthenticated(false);
        }
        setError(data.message || "Failed to load leaderboard");
      }
    } catch (err) {
      setError("An error occurred while fetching leaderboard.");
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetchLeaderboard(passcode);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchLeaderboard(passcode);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, passcode]);

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
          
          <div className="bg-pamphlet-alt p-8 sm:p-12 md:px-20 md:py-16 shadow-2xl relative mx-auto min-h-[400px]">
            {!isAuthenticated ? (
              <div className="max-w-md mx-auto text-center py-10">
                <h2 className="font-serif text-2xl font-black uppercase text-[#2b1810] mb-6">
                  Restricted Access
                </h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <input
                    type="password"
                    placeholder="Enter Event Passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="border-2 border-[#7a4823]/30 bg-[#fffdf9] px-4 py-3 font-mono text-center text-lg shadow-inner focus:border-[#8b261b] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="border-2 border-[#8b261b] bg-[#8b261b] px-6 py-3 font-serif text-sm font-bold tracking-[0.16em] text-[#f7eed6] uppercase transition-all hover:bg-[#6e1e15] disabled:opacity-50"
                  >
                    {loading ? "Authenticating..." : "Unlock Leaderboard"}
                  </button>
                  {error && <p className="text-red-700 text-sm font-bold mt-2">{error}</p>}
                </form>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {error && <p className="text-red-700 text-sm font-bold mb-4 text-center">{error}</p>}
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
                    {teams.map((team, idx) => (
                      <tr key={team.id} className="border-b border-primary/10 hover:bg-black/5 transition-colors">
                        <td className="py-5 px-4 font-extrabold text-4xl text-ink-accent">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                        </td>
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
                          {team.timestamp ? new Date(team.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                        </td>
                      </tr>
                    ))}
                    {teams.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-10 text-center text-muted-foreground font-serif">
                          No teams found or game hasn't started yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
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

