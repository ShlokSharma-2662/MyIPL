import React from 'react';
import TeamBadge from './TeamBadge';
import { TEAMS } from '../data';
import { USER_TEAM } from '../constants';
import { computeNRR } from '../stats';

export default function PointsTable({ teamStats }) {
  const rows = Object.entries(teamStats).map(([id, s]) => {
    const nrr = computeNRR(s);
    return { id, ...s, NRR: nrr };
  }).sort((a, b) => b.Pts - a.Pts || b.NRR - a.NRR);

  return (
    <div className="overflow-x-auto animate-fade-in glass-panel rounded-xl border border-zinc-800/50 p-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] tracking-widest text-zinc-500 border-b border-zinc-800/50 bg-black/20">
            <th className="text-left py-3 px-3 rounded-tl-lg">#</th>
            <th className="text-left py-3 px-3">TEAM</th>
            <th className="py-3 px-3">P</th>
            <th className="py-3 px-3">W</th>
            <th className="py-3 px-3">L</th>
            <th className="py-3 px-3">NR</th>
            <th className="py-3 px-3">NRR</th>
            <th className="py-3 px-3 rounded-tr-lg">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const team = TEAMS.find(t => t.id === r.id);
            const qualified = i < 4;
            const isUser = r.id === USER_TEAM;
            return (
              <tr key={r.id} className={`border-b border-zinc-900/50 transition-all hover:bg-white/5 hover:scale-[1.01] ${isUser ? 'bg-amber-500/5' : ''}`}>
                <td className="py-3 px-3 font-mono text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className={qualified ? 'text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''}>{i + 1}</span>
                    {qualified && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <TeamBadge teamId={r.id} size="sm" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">{team.name}</div>
                      {isUser && <div className="text-[9px] text-amber-400 tracking-widest font-bold">YOUR TEAM</div>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-center text-zinc-300 font-mono">{r.P}</td>
                <td className="py-3 px-3 text-center text-emerald-400 font-mono font-bold">{r.W}</td>
                <td className="py-3 px-3 text-center text-red-400 font-mono">{r.L}</td>
                <td className="py-3 px-3 text-center text-zinc-500 font-mono">{r.NR}</td>
                <td className={`py-3 px-3 text-center font-mono ${r.NRR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.NRR > 0 ? '+' : ''}{r.NRR.toFixed(3)}
                </td>
                <td className="py-3 px-3 text-center font-bold text-zinc-100 font-mono">{r.Pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-[10px] text-zinc-500 tracking-wider px-3 py-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" /> QUALIFIED FOR PLAYOFFS
      </div>
    </div>
  );
}
