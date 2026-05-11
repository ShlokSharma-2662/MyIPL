import React from 'react';
import { Zap } from 'lucide-react';
import TeamBadge from './TeamBadge';
import StatCard from './StatCard';
import { USER_TEAM } from '../constants';

export default function MyProfile({ userName, results, playerStats }) {
  const key = `USER:${userName}`;
  const me = playerStats[key];

  const myMatches = [];
  results.forEach((m, idx) => {
    let bat = null, bowl = null;
    [...m.inn1.battersCard, ...m.inn2.battersCard].forEach(b => {
      if (b.player.isUser) bat = b;
    });
    [...m.inn1.bowlersCard, ...m.inn2.bowlersCard].forEach(b => {
      if (b.player.isUser) bowl = b;
    });
    if (bat || bowl) {
      const opp = m.home === USER_TEAM ? m.away : m.home;
      myMatches.push({ idx: idx + 1, label: m.label, opp, bat, bowl, m, won: m.winner === USER_TEAM, godMode: !!m.godMode });
    }
  });

  if (!me) {
    return <div className="text-zinc-500 text-sm py-8 text-center">Play some matches to see your stats.</div>;
  }

  const avgSR = me.balls > 0 ? ((me.runs / me.balls) * 100).toFixed(1) : '-';
  const econ = me.ballsBowled > 0 ? (me.runsConceded / (me.ballsBowled / 6)).toFixed(2) : '-';
  const batAvg = me.outs > 0 ? (me.runs / me.outs).toFixed(1) : (me.runs > 0 ? me.runs.toFixed(1) : '-');
  const bowlAvg = me.wkts > 0 ? (me.runsConceded / me.wkts).toFixed(1) : '-';

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <StatCard label="MATCHES" value={me.M} sub="Played" accent="zinc" />
        <StatCard label="RUNS" value={me.runs} sub="Total" accent="amber" />
        <StatCard label="BAT AVG" value={batAvg} sub="Average" accent="amber" />
        <StatCard label="STRIKE RATE" value={avgSR} sub="Batting" accent="amber" />
        <StatCard label="HIGHEST" value={me.HS} sub="Score" accent="amber" />

        <StatCard label="WICKETS" value={me.wkts} sub={`${me.ballsBowled} balls`} accent="fuchsia" />
        <StatCard label="BOWL AVG" value={bowlAvg} sub="Average" accent="fuchsia" />
        <StatCard label="ECONOMY" value={econ} sub="Bowling" accent="fuchsia" />
        <StatCard label="100s" value={me.hundreds} sub="Centuries" accent="amber" />
        <StatCard label="50s" value={me.fifties} sub="Fifties" accent="amber" />
      </div>

      <h3 className="text-xs tracking-[0.3em] text-zinc-400 mb-3 font-bold">MATCH BY MATCH</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] tracking-widest text-zinc-500 border-b border-zinc-800">
              <th className="text-left py-2 px-2">#</th>
              <th className="text-left py-2 px-2">VS</th>
              <th className="py-2 px-2">BAT</th>
              <th className="py-2 px-2">SR</th>
              <th className="py-2 px-2">4s/6s</th>
              <th className="py-2 px-2">BOWL</th>
              <th className="py-2 px-2">ECON</th>
              <th className="py-2 px-2">RES</th>
            </tr>
          </thead>
          <tbody>
            {myMatches.map(mm => (
              <tr key={mm.idx} className={`border-b border-zinc-900 ${mm.godMode ? 'bg-amber-500/[0.07]' : ''}`}>
                <td className="py-2 px-2 font-mono text-zinc-500 text-xs">
                  <span className="inline-flex items-center gap-1">
                    {mm.godMode && <Zap className="w-3 h-3 text-amber-400" />}
                    {mm.label === 'League' ? `M${mm.idx}` : mm.label.slice(0, 3).toUpperCase()}
                  </span>
                </td>
                <td className="py-2 px-2"><TeamBadge teamId={mm.opp} size="sm" /></td>
                <td className="py-2 px-2 text-center font-mono text-zinc-100 font-bold">
                  {mm.bat ? `${mm.bat.runs}${mm.bat.out ? '' : '*'} (${mm.bat.balls})` : '-'}
                </td>
                <td className="py-2 px-2 text-center font-mono text-zinc-400 text-xs">{mm.bat ? mm.bat.sr : '-'}</td>
                <td className="py-2 px-2 text-center font-mono text-zinc-400 text-xs">
                  {mm.bat ? `${mm.bat.fours}/${mm.bat.sixes}` : '-'}
                </td>
                <td className="py-2 px-2 text-center font-mono text-fuchsia-400 font-bold">
                  {mm.bowl ? `${mm.bowl.wickets}/${mm.bowl.runs}` : '-'}
                </td>
                <td className="py-2 px-2 text-center font-mono text-zinc-400 text-xs">
                  {mm.bowl ? mm.bowl.econ : '-'}
                </td>
                <td className={`py-2 px-2 text-center font-mono text-xs font-bold ${mm.won ? 'text-emerald-400' : 'text-red-400'}`}>
                  {mm.won ? 'W' : 'L'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
