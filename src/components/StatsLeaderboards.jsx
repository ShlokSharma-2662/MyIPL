import React, { useState, useMemo } from 'react';
import { Crown, Medal, ArrowUp, ArrowDown } from 'lucide-react';
import TeamBadge from './TeamBadge';

function SortHeader({ label, col, sort, setSort, align = 'center' }) {
  const active = sort.col === col;
  const onClick = () => {
    if (active) setSort({ col, dir: sort.dir === 'desc' ? 'asc' : 'desc' });
    else setSort({ col, dir: 'desc' });
  };
  return (
    <th
      onClick={onClick}
      className={`py-2 px-2 cursor-pointer select-none hover:text-amber-400 transition-colors ${align === 'left' ? 'text-left' : ''} ${active ? 'text-amber-400' : ''}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (sort.dir === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
      </span>
    </th>
  );
}

function srOf(s) { return s.balls > 0 ? (s.runs / s.balls) * 100 : 0; }
function avgOf(s) { return s.outs > 0 ? s.runs / s.outs : s.runs; }
function econOf(s) { return s.ballsBowled > 0 ? s.runsConceded / (s.ballsBowled / 6) : 0; }
function bowlAvgOf(s) { return s.wkts > 0 ? s.runsConceded / s.wkts : 999; }

export default function StatsLeaderboards({ playerStats }) {
  const [batSort, setBatSort] = useState({ col: 'runs', dir: 'desc' });
  const [bowlSort, setBowlSort] = useState({ col: 'wkts', dir: 'desc' });

  const bat = useMemo(() => {
    const arr = Object.values(playerStats).filter(s => s.runs > 0 || s.balls > 0);
    const cmp = (a, b) => {
      let av, bv;
      switch (batSort.col) {
        case 'M': av = a.M; bv = b.M; break;
        case 'SR': av = srOf(a); bv = srOf(b); break;
        case 'HS': av = a.HS; bv = b.HS; break;
        case 'fifties': av = a.fifties * 1 + a.hundreds * 2; bv = b.fifties * 1 + b.hundreds * 2; break;
        case 'avg': av = avgOf(a); bv = avgOf(b); break;
        default: av = a.runs; bv = b.runs;
      }
      return batSort.dir === 'desc' ? bv - av : av - bv;
    };
    return arr.sort(cmp).slice(0, 15);
  }, [playerStats, batSort]);

  const bowl = useMemo(() => {
    const arr = Object.values(playerStats).filter(s => s.wkts > 0 || s.ballsBowled > 0);
    const cmp = (a, b) => {
      let av, bv;
      switch (bowlSort.col) {
        case 'M': av = a.M; bv = b.M; break;
        case 'econ': av = econOf(a) || 999; bv = econOf(b) || 999; break;
        case 'avg': av = bowlAvgOf(a); bv = bowlAvgOf(b); break;
        default: av = a.wkts; bv = b.wkts;
      }
      // For econ/avg, ascending is "better"
      if (bowlSort.col === 'econ' || bowlSort.col === 'avg') {
        return bowlSort.dir === 'desc' ? av - bv : bv - av;
      }
      return bowlSort.dir === 'desc' ? bv - av : av - bv;
    };
    return arr.sort(cmp).slice(0, 15);
  }, [playerStats, bowlSort]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-orange-400" />
          <h3 className="text-sm tracking-[0.3em] text-orange-400 font-bold">ORANGE CAP</h3>
          <span className="text-[10px] text-zinc-500">MOST RUNS</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] tracking-widest text-zinc-500 border-b border-zinc-800">
              <th className="text-left py-2 px-2">#</th>
              <th className="text-left py-2 px-2">PLAYER</th>
              <SortHeader label="M" col="M" sort={batSort} setSort={setBatSort} />
              <SortHeader label="R" col="runs" sort={batSort} setSort={setBatSort} />
              <SortHeader label="SR" col="SR" sort={batSort} setSort={setBatSort} />
              <SortHeader label="HS" col="HS" sort={batSort} setSort={setBatSort} />
              <SortHeader label="50/100" col="fifties" sort={batSort} setSort={setBatSort} />
            </tr>
          </thead>
          <tbody>
            {bat.map((s, i) => {
              const sr = s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : '-';
              return (
                <tr key={s.key} className={`border-b border-zinc-900 ${s.player.isUser ? 'bg-amber-500/10' : ''}`}>
                  <td className="py-2 px-2 font-mono text-zinc-500">{i + 1}</td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <TeamBadge teamId={s.player.team} size="sm" />
                      <span className={`${s.player.isUser ? 'text-amber-400 font-bold' : 'text-zinc-200'}`}>
                        {s.player.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center text-zinc-400 font-mono text-xs">{s.M}</td>
                  <td className="py-2 px-2 text-center font-bold text-zinc-100 font-mono">{s.runs}</td>
                  <td className="py-2 px-2 text-center text-zinc-300 font-mono text-xs">{sr}</td>
                  <td className="py-2 px-2 text-center text-zinc-300 font-mono text-xs">{s.HS}</td>
                  <td className="py-2 px-2 text-center text-zinc-400 font-mono text-xs">{s.fifties}/{s.hundreds}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-fuchsia-400" />
          <h3 className="text-sm tracking-[0.3em] text-fuchsia-400 font-bold">PURPLE CAP</h3>
          <span className="text-[10px] text-zinc-500">MOST WICKETS</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] tracking-widest text-zinc-500 border-b border-zinc-800">
              <th className="text-left py-2 px-2">#</th>
              <th className="text-left py-2 px-2">PLAYER</th>
              <SortHeader label="M" col="M" sort={bowlSort} setSort={setBowlSort} />
              <SortHeader label="W" col="wkts" sort={bowlSort} setSort={setBowlSort} />
              <SortHeader label="ECON" col="econ" sort={bowlSort} setSort={setBowlSort} />
              <th className="py-2 px-2">BEST</th>
            </tr>
          </thead>
          <tbody>
            {bowl.map((s, i) => {
              const econ = s.ballsBowled > 0 ? ((s.runsConceded / (s.ballsBowled / 6))).toFixed(2) : '-';
              return (
                <tr key={s.key} className={`border-b border-zinc-900 ${s.player.isUser ? 'bg-amber-500/10' : ''}`}>
                  <td className="py-2 px-2 font-mono text-zinc-500">{i + 1}</td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <TeamBadge teamId={s.player.team} size="sm" />
                      <span className={`${s.player.isUser ? 'text-amber-400 font-bold' : 'text-zinc-200'}`}>
                        {s.player.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center text-zinc-400 font-mono text-xs">{s.M}</td>
                  <td className="py-2 px-2 text-center font-bold text-zinc-100 font-mono">{s.wkts}</td>
                  <td className="py-2 px-2 text-center text-zinc-300 font-mono text-xs">{econ}</td>
                  <td className="py-2 px-2 text-center text-zinc-300 font-mono text-xs">
                    {s.bestW > 0 ? `${s.bestW}/${s.bestR}` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
