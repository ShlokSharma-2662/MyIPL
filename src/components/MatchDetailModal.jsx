import React from 'react';
import { X, Zap } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS } from '../data';

export default function MatchDetailModal({ match, onClose }) {
  if (!match) return null;
  const home = TEAMS.find(t => t.id === match.home);
  const away = TEAMS.find(t => t.id === match.away);
  const first = TEAMS.find(t => t.id === match.battingFirst);
  const second = TEAMS.find(t => t.id === match.battingSecond);
  const winner = TEAMS.find(t => t.id === match.winner);

  const Card = ({ team, inn }) => (
    <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3 sticky top-0 bg-black/40 backdrop-blur-sm -mx-4 px-4 -mt-4 pt-4 rounded-t-xl z-10">
        <TeamBadge teamId={team.id} size="sm" />
        <span className="font-bold text-zinc-100">{team.name}</span>
        <span className="ml-auto font-mono text-zinc-100 bg-zinc-900 px-2 py-1 rounded shadow-inner border border-zinc-800">
          {inn.totalRuns}/{inn.wickets} <span className="text-zinc-500 text-[10px]">({inn.oversDisplay})</span>
        </span>
      </div>
      <table className="w-full text-xs mb-4">
        <tbody>
          {inn.battersCard.map((b, i) => (
            <tr key={i} className="border-b border-zinc-900/50 hover:bg-white/5 transition-colors">
              <td className={`py-2 px-2 ${b.player.isUser ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                {b.player.name}{!b.out && <span className="text-zinc-500">*</span>}
                {b.player.isImpact && <span className="ml-1.5 text-[8px] tracking-wider bg-fuchsia-500/20 text-fuchsia-400 px-1 py-0.5 rounded border border-fuchsia-500/30">IMPACT</span>}
              </td>
              <td className="py-2 px-2 text-right font-mono text-zinc-200 font-medium">{b.runs}</td>
              <td className="py-2 px-2 text-right font-mono text-zinc-500">({b.balls})</td>
              <td className="py-2 px-2 text-right font-mono text-zinc-500">{b.fours}×4 {b.sixes}×6</td>
            </tr>
          ))}
          <tr className="bg-zinc-900/20"><td className="py-2 px-2 text-zinc-500 text-xs font-medium">Extras</td><td colSpan={3} className="py-2 px-2 text-right font-mono text-zinc-400">{inn.extras}</td></tr>
        </tbody>
      </table>
      <div className="text-[10px] tracking-[0.25em] text-zinc-500 mb-2 font-bold px-2">BOWLING</div>
      <table className="w-full text-xs">
        <tbody>
          {inn.bowlersCard.map((b, i) => (
            <tr key={i} className="border-b border-zinc-900/50 hover:bg-white/5 transition-colors">
              <td className={`py-2 px-2 ${b.player.isUser ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                {b.player.name}
                {b.player.isImpact && <span className="ml-1.5 text-[8px] tracking-wider bg-fuchsia-500/20 text-fuchsia-400 px-1 py-0.5 rounded border border-fuchsia-500/30">IMPACT</span>}
              </td>
              <td className="py-2 px-2 text-right font-mono text-zinc-500">{b.overs}</td>
              <td className="py-2 px-2 text-right font-mono text-zinc-200 font-medium">{b.wickets}/{b.runs}</td>
              <td className="py-2 px-2 text-right font-mono text-zinc-500">{b.econ}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto animate-fade-in" onClick={onClose}>
      <div className="glass-panel rounded-2xl max-w-3xl w-full my-8 animate-slide-up shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 inset-x-0 h-1 z-20" style={{ background: `linear-gradient(to right, ${home.primary}, ${away.primary})` }} />

        <div className="flex items-center justify-between p-6 border-b border-zinc-800/50 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-20">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-amber-400 mb-2 font-bold">{match.label.toUpperCase()}</div>
            <div className="flex items-center gap-4">
              <TeamBadge teamId={home.id} size="lg" />
              <div className="text-zinc-500 text-xs font-mono bg-zinc-900 px-2 py-1 rounded">VS</div>
              <TeamBadge teamId={away.id} size="lg" />
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {match.godMode && (
          <div className="px-6 py-3 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-fuchsia-500/10 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <div>
              <div className="text-[10px] tracking-[0.4em] text-amber-400 font-black">⚡ GOD MODE ACTIVE</div>
              <div className="text-[11px] text-zinc-300">Your stats were divine in this match — SR 350 · AVG 200 · BOWL SR 6 · ECON 2.5</div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-b border-zinc-800/50 text-xs text-zinc-400 bg-black/20 flex flex-wrap items-center gap-2">
          <span className="font-medium" style={{ color: TEAMS.find(t => t.id === match.tossWinner).primary }}>
            {match.tossWinner}
          </span> won the toss, chose to <strong className="text-zinc-200">{match.tossDecision}</strong>.
          <span className="mx-2 text-zinc-700">•</span>
          <span className="font-bold px-2 py-1 rounded bg-black/40 border border-white/5" style={{ color: winner.primary }}>{winner.short} won</span>
          <span className="text-zinc-400">
            {match.marginType === 'Super Over' ? (
              <span className="text-amber-400 font-bold tracking-wider px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10">SUPER OVER</span>
            ) : (
              <>by {match.margin} {match.marginType}</>
            )}
          </span>
          <div className="w-full mt-2 pt-2 border-t border-zinc-800/50 flex items-center gap-3 text-[10px] text-zinc-500 flex-wrap">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Strategic Timeouts: Overs 6-9 &amp; 13-16</span>
            {match.inn1.batImpactUsed && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full" /> {first.short} used Impact Player</span>}
            {match.inn2.batImpactUsed && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full" /> {second.short} used Impact Player</span>}
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6 bg-black/40">
          <Card team={first} inn={match.inn1} />
          <Card team={second} inn={match.inn2} />
        </div>
      </div>
    </div>
  );
}
