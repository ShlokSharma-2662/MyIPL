import React from 'react';
import { TEAMS } from '../data';

export default function AllTeamsView({ state }) {
  const { teamHistoricTitles, teamStats, userTeam, results = [], history = [], champion } = state;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="text-3xl">🏆</span> Franchise Hall of Fame
        </h2>
        <p className="mt-2 text-slate-400 max-w-xl text-sm leading-relaxed">
          Behold the historic championship cabinet and recent record history of all 10 elite T20 franchises. Track dynamic match form and simulated season accomplishments!
        </p>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEAMS.map((team) => {
          const stats = teamStats[team.id] || { Pld: 0, W: 0, L: 0, Pts: 0 };
          const isUser = team.id === userTeam;

          // Compute team's recent form (last 5 match results)
          const teamMatches = results.filter(m => m.home === team.id || m.away === team.id);
          const last5 = teamMatches.slice(-5);
          const form = last5.map(m => m.winner === team.id ? 'W' : 'L');

          // Filter simulated titles won by this team
          const simulatedWins = history.filter(h => h.champion === team.id).map(h => `Season ${h.season}`);

          // Only count dynamic simulated wins
          const titles = simulatedWins.length;

          return (
            <div 
              key={team.id}
              className={`relative overflow-hidden bg-slate-950/70 border rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-slate-700 flex flex-col justify-between ${
                isUser 
                  ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-slate-900/90' 
                  : 'border-slate-800/80'
              }`}
            >
              {/* Colored side indicator */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: team.primary }}
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 pl-2">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl tracking-wider text-slate-950 select-none shadow-md"
                    style={{ backgroundColor: team.primary, color: team.dark || '#000000' }}
                  >
                    {team.short}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      {team.name}
                      {isUser && (
                        <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full font-semibold border border-cyan-500/30">
                          My Franchise
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                      IPL FRANCHISE
                    </p>
                  </div>
                </div>

                {/* Trophy Shelf count */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                    <span className="text-amber-400 text-lg">🏆</span>
                    <span className="font-black text-amber-300 font-mono text-lg">
                      {titles}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-500/60 uppercase tracking-widest font-semibold mt-1">
                    Championships
                  </span>
                </div>
              </div>

              {/* Decorative Trophy Cabinets */}
              <div className="mt-4 flex flex-wrap gap-2 pl-2">
                {Array.from({ length: Math.min(titles, 12) }).map((_, i) => (
                  <span 
                    key={i} 
                    className="text-lg filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-125"
                    title="Championship Trophy"
                  >
                    🏆
                  </span>
                ))}
                {titles === 0 && (
                  <span className="text-xs text-slate-600 italic">No championships won yet</span>
                )}
              </div>

              {/* Recent Form and Dynamic Career Accomplishments */}
              <div className="mt-5 border-t border-slate-900 pt-4 space-y-3.5 pl-2">
                {/* Form Indicator Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">
                    Recent Form
                  </span>
                  <div className="flex gap-1">
                    {form.map((outcome, idx) => (
                      <span 
                        key={idx}
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] font-mono shadow-sm border transition-all ${
                          outcome === 'W'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.1)]'
                        }`}
                        title={outcome === 'W' ? 'Won' : 'Lost'}
                      >
                        {outcome}
                      </span>
                    ))}
                    {form.length === 0 && (
                      <span className="text-[10px] text-slate-600 italic">No matches played</span>
                    )}
                  </div>
                </div>

                {/* Simulated Titles Row */}
                {simulatedWins.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">
                      Dynamic Wins
                    </span>
                    <span className="text-cyan-400 font-extrabold bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded font-mono text-[9px] tracking-wide shadow-sm">
                      🏅 {simulatedWins.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Current Season stats mini-panel */}
              <div className="mt-5 border-t border-slate-900 pt-4 flex justify-between text-center pl-2">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Played</p>
                  <p className="font-bold text-slate-300 font-mono text-sm">{stats.Pld}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Won</p>
                  <p className="font-bold text-emerald-400 font-mono text-sm">{stats.W}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Lost</p>
                  <p className="font-bold text-rose-400 font-mono text-sm">{stats.L}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Points</p>
                  <p className="font-bold text-slate-200 font-mono text-sm">{stats.Pts}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
