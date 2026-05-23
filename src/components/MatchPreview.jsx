import React, { useState, useMemo } from 'react';
import { Target, Shield, Award, Zap, Play, FastForward, Info, Users } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS, ROSTERS } from '../data';
import { USER_TEAM } from '../constants';

const starBowlers = {
  MI: 'Jasprit Bumrah',
  RCB: 'Mohammed Siraj',
  KKR: 'Varun Chakaravarthy',
  SRH: 'Pat Cummins',
  DC: 'Kuldeep Yadav',
  RR: 'Yuzvendra Chahal',
  PBKS: 'Arshdeep Singh',
  GT: 'Rashid Khan',
  LSG: 'Ravi Bishnoi',
  CSK: 'Matheesha Pathirana'
};

export default function MatchPreview({ homeId, awayId, userName, teamStats, playerStats, results = [], careerRivalries = {}, onSimulate, onWatch, onClose }) {
  const home = TEAMS.find(t => t.id === homeId);
  const away = TEAMS.find(t => t.id === awayId);
  const opponentId = homeId === USER_TEAM ? awayId : homeId;
  const opponent = TEAMS.find(t => t.id === opponentId);

  // States for Captain's Tactics
  const [intent, setIntent] = useState('balanced'); // conservative | balanced | aggressive
  const [bowlingFocus, setBowlingFocus] = useState('balanced'); // pace | balanced | spin
  const [selectedImpact, setSelectedImpact] = useState('Default');

  // Roster options for Impact Player
  const cskRoster = ROSTERS.CSK.map(r => r[0]);

  // Form guides (last 5 games)
  const getForm = (teamId) => {
    return results
      .filter(r => r.home === teamId || r.away === teamId)
      .slice(-5)
      .map(r => r.winner === teamId ? 'W' : 'L');
  };

  const homeForm = getForm(homeId);
  const awayForm = getForm(awayId);

  // Head-to-Head and Win Predictor Calculation
  const winPct = useMemo(() => {
    const hStats = teamStats[homeId] || { Pts: 0 };
    const aStats = teamStats[awayId] || { Pts: 0 };
    
    // Base 50/50, modified by standings
    let diff = hStats.Pts - aStats.Pts;
    let base = 50 + diff * 3.5;

    // Check H2H record
    const h2h = careerRivalries[opponentId];
    if (h2h) {
      const total = h2h.wins + h2h.losses;
      if (total > 0) {
        const cskWinRate = h2h.wins / total;
        // Shift up to 10% based on historical rivalry winrate
        const h2hShift = (cskWinRate - 0.5) * 20; 
        base += homeId === USER_TEAM ? h2hShift : -h2hShift;
      }
    }
    
    return Math.max(25, Math.min(75, Math.round(base)));
  }, [homeId, awayId, teamStats, careerRivalries, opponentId]);

  // Player Battle Setup
  const userKey = `USER:${userName}`;
  const me = playerStats[userKey] || { runs: 0, M: 0, outs: 0, HS: 0 };
  const userAvg = me.outs > 0 ? (me.runs / me.outs).toFixed(1) : me.runs.toFixed(1);
  const oppStarBowlerName = starBowlers[opponentId] || 'Star Bowler';

  const handleStart = (mode) => {
    const tactics = {
      intent,
      bowlingFocus,
      nominatedImpact: selectedImpact === 'Default' ? null : selectedImpact
    };
    if (mode === 'watch') {
      onWatch(tactics);
    } else {
      onSimulate(tactics);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-40 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="glass-panel rounded-2xl max-w-2xl w-full animate-slide-up shadow-2xl relative overflow-hidden my-8">
        <div className="absolute top-0 inset-x-0 h-1" style={{ background: `linear-gradient(to right, ${home.primary}, ${away.primary})` }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-amber-500 font-bold mb-1">UPCOMING FIXTURE</div>
            <h2 className="text-3xl font-black tracking-wider text-zinc-100 uppercase" style={{ fontFamily: 'Bebas Neue' }}>
              CSK Match Preview
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xs font-mono uppercase bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
            Cancel
          </button>
        </div>

        {/* Hype Panel: Matchup Win Probability */}
        <div className="p-6 bg-black/40 border-b border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TeamBadge teamId={homeId} size="lg" />
              <div className="text-left">
                <span className="text-zinc-400 text-xs block">HOME</span>
                <span className="font-bold text-sm text-zinc-100">{home.name}</span>
                <div className="flex gap-1 mt-1">
                  {homeForm.map((f, idx) => (
                    <span key={idx} className={`text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono ${f === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{f}</span>
                  ))}
                  {homeForm.length === 0 && <span className="text-zinc-600 text-[10px]">-</span>}
                </div>
              </div>
            </div>
            
            <div className="text-center font-mono">
              <div className="text-2xl font-black text-amber-500">{winPct}% vs {100 - winPct}%</div>
              <div className="text-[9px] text-zinc-500 tracking-wider uppercase font-bold">Win Probability</div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div className="text-right">
                <span className="text-zinc-400 text-xs block">AWAY</span>
                <span className="font-bold text-sm text-zinc-100">{away.name}</span>
                <div className="flex gap-1 mt-1 justify-end">
                  {awayForm.map((f, idx) => (
                    <span key={idx} className={`text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono ${f === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{f}</span>
                  ))}
                  {awayForm.length === 0 && <span className="text-zinc-600 text-[10px]">-</span>}
                </div>
              </div>
              <TeamBadge teamId={awayId} size="lg" />
            </div>
          </div>

          <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden flex shadow-inner">
            <div className="h-full transition-all duration-500" style={{ width: `${winPct}%`, backgroundColor: home.primary }} />
            <div className="h-full transition-all duration-500" style={{ width: `${100 - winPct}%`, backgroundColor: away.primary }} />
          </div>
        </div>

        {/* Player Battle Panel */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950/20 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-xl p-4 border border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 text-amber-400 font-bold">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[9px] tracking-widest text-amber-500 font-bold uppercase">CSK KEY BATTER</div>
              <div className="font-bold text-zinc-100">{userName}</div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">Career Avg: {userAvg} · HS: {me.HS || '-'}</div>
            </div>
          </div>

          <div className="bg-black/30 rounded-xl p-4 border border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/30 text-fuchsia-400 font-bold">
              {oppStarBowlerName.split(' ').map(n=>n[0]).join('')}
            </div>
            <div>
              <div className="text-[9px] tracking-widest text-fuchsia-400 font-bold uppercase">{opponent.short} KEY BOWLER</div>
              <div className="font-bold text-zinc-100">{oppStarBowlerName}</div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">Danger Rating: ★★★★★ (Elite)</div>
            </div>
          </div>
        </div>

        {/* Tactical Config Options */}
        <div className="p-6 space-y-6">
          <h3 className="text-xs tracking-[0.25em] text-zinc-500 font-black flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-500" /> CAPTAIN'S TACTICAL DIRECTIVE
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Intent Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block tracking-wide">BATTING INTENT</label>
              <select
                value={intent}
                onChange={e => setIntent(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-all font-mono"
              >
                <option value="conservative">Conservative (Avg+ / SR-)</option>
                <option value="balanced">Balanced (Default)</option>
                <option value="aggressive">Aggressive (Avg- / SR++)</option>
              </select>
            </div>

            {/* Bowling Focus Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block tracking-wide">BOWLING FOCUS</label>
              <select
                value={bowlingFocus}
                onChange={e => setBowlingFocus(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-all font-mono"
              >
                <option value="balanced">Balanced (Default)</option>
                <option value="pace">Pace Dominant</option>
                <option value="spin">Spin Dominant</option>
              </select>
            </div>

            {/* Nominated Impact Player Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block tracking-wide">NOMINATE IMPACT SUB</label>
              <select
                value={selectedImpact}
                onChange={e => setSelectedImpact(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-all font-mono"
              >
                <option value="Default">Default (Automated)</option>
                {cskRoster.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-amber-500/[0.04] rounded-lg border border-amber-500/25 p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-[10px] text-zinc-400 leading-relaxed font-mono">
              {intent === 'aggressive' && <span className="text-amber-400 font-bold">AGGRESSIVE BATTING:</span>}
              {intent === 'conservative' && <span className="text-amber-400 font-bold">CONSERVATIVE BATTING:</span>}
              {intent === 'balanced' && <span className="text-amber-400 font-bold">BALANCED BATTING:</span>}
              {intent === 'aggressive' && ' Batsmen will hit 25% faster boundaries but get out 22% more often.'}
              {intent === 'conservative' && ' Batsmen will defend more, boosting survival by 30% but dropping scoring speed.'}
              {intent === 'balanced' && ' Standard batting metrics calculated strictly off default stats and player form.'}

              {bowlingFocus === 'spin' && <span> Spinners get a <strong className="text-fuchsia-400 font-bold">12% efficiency boost</strong>; pacers lose 6% control.</span>}
              {bowlingFocus === 'pace' && <span> Pacers get a <strong className="text-fuchsia-400 font-bold">12% efficiency boost</strong>; spinners lose 6% control.</span>}
              {bowlingFocus === 'balanced' && ' Bowlers split duties evenly under standard economic calculations.'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-6 bg-zinc-950/80 border-t border-zinc-800 grid grid-cols-2 gap-4">
          <button
            onClick={() => handleStart('watch')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-4 rounded-xl tracking-wider text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/20"
          >
            <Play className="w-4 h-4 fill-black text-black" />
            WATCH MATCH LIVE
          </button>
          
          <button
            onClick={() => handleStart('sim')}
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-4 rounded-xl tracking-wider text-sm transition-all hover:-translate-y-0.5"
          >
            <FastForward className="w-4 h-4" />
            INSTANT SIMULATE
          </button>
        </div>
      </div>
    </div>
  );
}
