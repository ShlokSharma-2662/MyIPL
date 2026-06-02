import React, { useState, useMemo } from 'react';
import { Crown, Medal, Flame, Star, Building2, Target, BarChart3 } from 'lucide-react';
import { IPL_RECORDS } from '../data/iplRecords';
import { IPL_AGGREGATES } from '../data/iplAggregates';
import { HOME_VENUES } from '../venues';

const TEAM_ABBR = {
  'Chennai Super Kings': 'CSK', 'Mumbai Indians': 'MI',
  'Royal Challengers Bangalore': 'RCB', 'Royal Challengers Bengaluru': 'RCB',
  'Kolkata Knight Riders': 'KKR', 'Sunrisers Hyderabad': 'SRH', 'Deccan Chargers': 'DC*',
  'Delhi Daredevils': 'DC', 'Delhi Capitals': 'DC', 'Rajasthan Royals': 'RR',
  'Kings XI Punjab': 'PBKS', 'Punjab Kings': 'PBKS', 'Gujarat Titans': 'GT',
  'Gujarat Lions': 'GL', 'Lucknow Super Giants': 'LSG', 'Rising Pune Supergiant': 'RPS',
  'Rising Pune Supergiants': 'RPS', 'Pune Warriors': 'PW', 'Kochi Tuskers Kerala': 'KTK',
};
const abbr = (t) => TEAM_ABBR[t] || t;

const SECTIONS = [
  { id: 'batting', label: 'Batting', icon: Crown },
  { id: 'bowling', label: 'Bowling', icon: Medal },
  { id: 'milestones', label: 'Milestones', icon: Star },
  { id: 'venues', label: 'Venues & Facts', icon: Building2 },
];

function SectionTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider flex items-center gap-2 transition-all border
        ${active ? 'bg-amber-500/15 text-amber-400 border-amber-500/40' : 'text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label.toUpperCase()}
    </button>
  );
}

// Aggregate the user's IPL career (legacy seasons + live season) for the chase panel.
function useCareer(history, userCareerLive) {
  return useMemo(() => {
    let runs = 0, wkts = 0, sixes = 0;
    for (const s of history || []) {
      const ipl = s.formatStats?.IPL || s.playerStats || {};
      runs += ipl.runs || 0;
      wkts += (ipl.wickets ?? ipl.wkts) || 0;
    }
    if (userCareerLive) {
      runs += userCareerLive.runs || 0;
      wkts += userCareerLive.wkts || 0;
      sixes += userCareerLive.sixes || 0;
    }
    return { runs, wkts, sixes };
  }, [history, userCareerLive]);
}

function ChaseBar({ label, value, target, holder, color }) {
  const pct = Math.max(0, Math.min(100, (value / target) * 100));
  const done = value >= target;
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[10px] tracking-[0.25em] text-zinc-500 font-bold">{label}</span>
        <span className={`text-xs font-mono font-bold ${done ? 'text-emerald-400' : 'text-zinc-300'}`}>
          {value.toLocaleString()} <span className="text-zinc-600">/ {target.toLocaleString()}</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[10px] text-zinc-600">All-time: <span className="text-zinc-400 font-semibold">{holder}</span></span>
        <span className={`text-[10px] font-bold ${done ? 'text-emerald-400' : 'text-amber-500'}`}>
          {done ? '★ RECORD BEATEN' : `${pct.toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
}

export default function RecordsView({ history = [], userName = 'You', userCareerLive = null }) {
  const [section, setSection] = useState('batting');
  const career = useCareer(history, userCareerLive);
  const A = IPL_AGGREGATES;
  const topRun = IPL_RECORDS.topRunScorers[0];
  const topWkt = IPL_RECORDS.topWicketTakers[0];
  const topSix = IPL_RECORDS.mostSixes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.04em' }}>
            IPL ALL-TIME RECORDS
          </h2>
        </div>
        <p className="text-xs text-zinc-500">
          Real records from {A ? '1,193' : ''} matches of Indian Premier League ball-by-ball history (2008–2026).
        </p>
      </div>

      {/* Chase the Legends */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] to-fuchsia-500/[0.04] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm tracking-[0.25em] text-amber-400 font-bold">CHASE THE LEGENDS</h3>
          <span className="text-[10px] text-zinc-500">{userName}'s career vs the all-time greats</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <ChaseBar label="CAREER RUNS" value={career.runs} target={topRun.runs} holder={`${topRun.name} (${topRun.runs.toLocaleString()})`} color="from-orange-500 to-amber-400" />
          <ChaseBar label="CAREER WICKETS" value={career.wkts} target={topWkt.wkts} holder={`${topWkt.name} (${topWkt.wkts})`} color="from-fuchsia-500 to-purple-400" />
          <ChaseBar label="CAREER SIXES" value={career.sixes} target={topSix.v} holder={`${topSix.name} (${topSix.v})`} color="from-emerald-500 to-teal-400" />
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(s => (
          <SectionTab key={s.id} active={section === s.id} onClick={() => setSection(s.id)} icon={s.icon} label={s.label} />
        ))}
      </div>

      {/* BATTING */}
      {section === 'batting' && (
        <div className="glass-panel rounded-xl p-4 overflow-x-auto">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs tracking-[0.3em] text-orange-400 font-bold">MOST RUNS — ALL TIME</h3>
          </div>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-[10px] tracking-widest text-zinc-500 border-b border-zinc-800">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">PLAYER</th>
                <th className="py-2 px-2">RUNS</th><th className="py-2 px-2">INNS</th>
                <th className="py-2 px-2">SR</th><th className="py-2 px-2">AVG</th>
                <th className="py-2 px-2">HS</th><th className="py-2 px-2">100/50</th>
                <th className="py-2 px-2">4s</th><th className="py-2 px-2">6s</th>
              </tr>
            </thead>
            <tbody>
              {IPL_RECORDS.topRunScorers.map((p, i) => (
                <tr key={p.name} className="border-b border-zinc-900 hover:bg-zinc-800/30">
                  <td className="py-2 px-2 font-mono text-zinc-500">{i + 1}</td>
                  <td className="py-2 px-2 font-semibold text-zinc-100">{p.name}</td>
                  <td className="py-2 px-2 text-center font-bold text-orange-300 font-mono">{p.runs.toLocaleString()}</td>
                  <td className="py-2 px-2 text-center text-zinc-400 font-mono text-xs">{p.inns}</td>
                  <td className="py-2 px-2 text-center text-zinc-300 font-mono text-xs">{p.sr}</td>
                  <td className="py-2 px-2 text-center text-zinc-300 font-mono text-xs">{p.avg}</td>
                  <td className="py-2 px-2 text-center text-zinc-300 font-mono text-xs">{p.hs}</td>
                  <td className="py-2 px-2 text-center text-zinc-400 font-mono text-xs">{p.hundreds}/{p.fifties}</td>
                  <td className="py-2 px-2 text-center text-zinc-400 font-mono text-xs">{p.fours}</td>
                  <td className="py-2 px-2 text-center text-amber-400/90 font-mono text-xs font-bold">{p.sixes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BOWLING */}
      {section === 'bowling' && (
        <div className="glass-panel rounded-xl p-4 overflow-x-auto">
          <div className="flex items-center gap-2 mb-3">
            <Medal className="w-4 h-4 text-fuchsia-400" />
            <h3 className="text-xs tracking-[0.3em] text-fuchsia-400 font-bold">MOST WICKETS — ALL TIME</h3>
          </div>
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-[10px] tracking-widest text-zinc-500 border-b border-zinc-800">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">PLAYER</th>
                <th className="py-2 px-2">WKTS</th><th className="py-2 px-2">ECON</th>
                <th className="py-2 px-2">SR</th><th className="py-2 px-2">AVG</th>
                <th className="py-2 px-2">BALLS</th>
              </tr>
            </thead>
            <tbody>
              {IPL_RECORDS.topWicketTakers.map((p, i) => (
                <tr key={p.name} className="border-b border-zinc-900 hover:bg-zinc-800/30">
                  <td className="py-2 px-2 font-mono text-zinc-500">{i + 1}</td>
                  <td className="py-2 px-2 font-semibold text-zinc-100">{p.name}</td>
                  <td className="py-2 px-2 text-center font-bold text-fuchsia-300 font-mono">{p.wkts}</td>
                  <td className="py-2 px-2 text-center text-zinc-300 font-mono text-xs">{p.econ}</td>
                  <td className="py-2 px-2 text-center text-zinc-300 font-mono text-xs">{p.sr}</td>
                  <td className="py-2 px-2 text-center text-zinc-300 font-mono text-xs">{p.avg}</td>
                  <td className="py-2 px-2 text-center text-zinc-500 font-mono text-xs">{p.balls.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MILESTONES */}
      {section === 'milestones' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs tracking-[0.3em] text-amber-400 font-bold">MOST SIXES</h3>
            </div>
            <ol className="space-y-1.5">
              {IPL_RECORDS.mostSixes.slice(0, 10).map((p, i) => (
                <li key={p.name} className="flex items-center justify-between text-sm border-b border-zinc-900 pb-1.5">
                  <span className="flex items-center gap-2"><span className="font-mono text-zinc-600 w-5">{i + 1}</span><span className="text-zinc-200">{p.name}</span></span>
                  <span className="font-mono font-bold text-amber-400">{p.v}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs tracking-[0.3em] text-sky-400 font-bold">MOST PLAYER-OF-MATCH</h3>
            </div>
            <ol className="space-y-1.5">
              {IPL_RECORDS.mostPOTM.slice(0, 10).map((p, i) => (
                <li key={p.name} className="flex items-center justify-between text-sm border-b border-zinc-900 pb-1.5">
                  <span className="flex items-center gap-2"><span className="font-mono text-zinc-600 w-5">{i + 1}</span><span className="text-zinc-200">{p.name}</span></span>
                  <span className="font-mono font-bold text-sky-400">{p.v}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="glass-panel rounded-xl p-4 lg:col-span-2 overflow-x-auto">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs tracking-[0.3em] text-emerald-400 font-bold">HIGHEST TEAM TOTALS</h3>
            </div>
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-[10px] tracking-widest text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-2 px-2">#</th><th className="text-left py-2 px-2">TEAM</th>
                  <th className="py-2 px-2">SCORE</th><th className="text-left py-2 px-2">VS</th>
                  <th className="text-left py-2 px-2">VENUE</th><th className="py-2 px-2">SEASON</th>
                </tr>
              </thead>
              <tbody>
                {IPL_RECORDS.highestTotals.slice(0, 10).map((t, i) => (
                  <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-800/30">
                    <td className="py-2 px-2 font-mono text-zinc-500">{i + 1}</td>
                    <td className="py-2 px-2 font-semibold text-zinc-100">{abbr(t.team)}</td>
                    <td className="py-2 px-2 text-center font-bold text-emerald-300 font-mono">{t.runs}</td>
                    <td className="py-2 px-2 text-zinc-400">{abbr(t.opp)}</td>
                    <td className="py-2 px-2 text-zinc-500 text-xs truncate max-w-[220px]">{t.venue}</td>
                    <td className="py-2 px-2 text-center text-zinc-400 font-mono text-xs">{t.season}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VENUES & FACTS */}
      {section === 'venues' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'AVG 1ST-INNINGS TOTAL', value: A.avgInningsTotal, sub: 'runs' },
              { label: 'LEAGUE RUN RATE', value: A.leagueRPO, sub: 'per over' },
              { label: 'TOSS → FIELD FIRST', value: `${Math.round(A.toss.fieldFirstProb * 100)}%`, sub: 'of captains' },
              { label: 'TOSS-WIN → MATCH-WIN', value: `${Math.round(A.toss.tossWinnerWinRate * 100)}%`, sub: 'near coin-flip' },
            ].map(s => (
              <div key={s.label} className="glass-panel rounded-xl p-4 text-center">
                <div className="text-2xl font-black font-mono text-amber-400">{s.value}</div>
                <div className="text-[9px] tracking-[0.2em] text-zinc-500 mt-1 font-bold">{s.label}</div>
                <div className="text-[10px] text-zinc-600">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-xs tracking-[0.3em] text-amber-400 font-bold mb-3">PHASE SCORING (real)</h3>
              <div className="space-y-3">
                {[['Powerplay (ov 1–6)', A.phases.powerplay], ['Middle (ov 7–15)', A.phases.middle], ['Death (ov 16–20)', A.phases.death]].map(([label, p]) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">{label}</span>
                      <span className="font-mono text-zinc-200 font-bold">{p.rpo} RPO</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400" style={{ width: `${(p.rpo / 11) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-xs tracking-[0.3em] text-sky-400 font-bold mb-3">HOME GROUNDS — SCORING FACTOR</h3>
              <div className="space-y-1.5 text-sm">
                {Object.entries(HOME_VENUES)
                  .sort((a, b) => b[1].factor - a[1].factor)
                  .map(([team, v]) => (
                    <div key={team} className="flex items-center justify-between border-b border-zinc-900 pb-1">
                      <span className="text-zinc-300"><span className="font-bold text-zinc-200">{team}</span> <span className="text-zinc-600 text-xs">· {v.name.split(',')[0]}</span></span>
                      <span className={`font-mono text-xs font-bold ${v.factor >= 1.05 ? 'text-orange-400' : v.factor <= 0.96 ? 'text-sky-400' : 'text-zinc-400'}`}>
                        {v.factor >= 1 ? '+' : ''}{Math.round((v.factor - 1) * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
              <p className="text-[10px] text-zinc-600 mt-3">Orange = batting paradise · Blue = bowler-friendly. Applied to live match scoring.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
