import MetaData from '../MetaData/MetaData'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { TornEdgeDefs } from './roaming-assets'
import './hh2026.css'

import { useState, useEffect } from 'react'
import API_URL from '../../api/api'

export default function HH2026Leaderboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const fetchLeaderboard = async (currentPasscode) => {
    try {
      const res = await fetch(`${API_URL}/teams/leaderboard`, {
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
      
      <main className="relative min-h-screen py-24 overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-[95%] xl:max-w-7xl px-2 sm:px-5">
          <div className="mb-12 text-center">
            <h1 className="text-white text-5xl sm:text-7xl font-bold mb-4 uppercase">Leaderboard</h1>
            <p className="text-white/80 font-serif tracking-[0.2em] uppercase text-sm">
              Current ranks of the treasure hunters
            </p>
          </div>
          
          <div className="p-4 sm:p-8 md:px-12 md:py-12 relative mx-auto min-h-[400px]">
            {!isAuthenticated ? (
              <div className="max-w-md mx-auto text-center py-10">
                <h2 className="font-serif text-2xl font-black uppercase text-white mb-6">
                  Restricted Access
                </h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <input
                    type="password"
                    placeholder="Enter Event Passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="border-2 border-white/30 bg-transparent px-4 py-3 font-mono text-center text-lg text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="border-2 border-white bg-white px-6 py-3 font-serif text-sm font-bold tracking-[0.16em] text-black uppercase transition-all hover:bg-white/90 disabled:opacity-50"
                  >
                    {loading ? "Authenticating..." : "Unlock Leaderboard"}
                  </button>
                  {error && <p className="text-red-400 text-sm font-bold mt-2">{error}</p>}
                </form>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {error && <p className="text-red-400 text-sm font-bold mb-4 text-center">{error}</p>}
                <table className="w-full text-left font-serif text-white border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b-2 border-white/30">
                      <th className="py-4 px-4 font-extrabold text-white tracking-wider uppercase text-xl">Rank</th>
                      <th className="py-4 px-4 font-extrabold text-white tracking-wider uppercase text-xl">Team Name</th>
                      <th className="py-4 px-4 font-extrabold text-white tracking-wider uppercase text-xl">Leader</th>
                      <th className="py-4 px-4 font-extrabold text-white tracking-wider uppercase text-xl text-center">Locations</th>
                      <th className="py-4 px-4 font-extrabold text-white tracking-wider uppercase text-xl text-center">Points</th>
                      <th className="py-4 px-4 font-extrabold text-white tracking-wider uppercase text-xl text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.slice(0, 20).map((team, idx) => (
                      <tr key={team.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                        <td className="py-5 px-4 font-extrabold text-4xl text-white">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                        </td>
                        <td className="py-5 px-4 font-bold text-lg">{team.teamName}</td>
                        <td className="py-5 px-4">{team.leaderName}</td>
                        <td className="py-5 px-4 text-center text-lg">{team.locationsVisited}</td>
                        <td className="py-5 px-4 text-center font-bold text-xl text-white">{team.points}</td>
                        <td className="py-5 px-4 text-right text-sm text-white/70">
                          {team.timestamp ? new Date(team.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                        </td>
                      </tr>
                    ))}
                    {teams.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-10 text-center text-white/70 font-serif">
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

