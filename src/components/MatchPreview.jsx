import React, { useState, useMemo } from 'react';
import { Target, Shield, Award, Zap, Play, FastForward, Info, Users } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS, buildAllPlayers } from '../data';
import { USER_TEAM } from '../constants';
import { getStarPlayerForTeam, calculatePlayerRating } from '../simulation';
import { INTERNATIONAL_TEAMS, INTERNATIONAL_ROSTERS } from '../internationalData';
import { HOME_VENUES, venueScoringEffect } from '../venues';

function getStarPlayerTrait(player) {
  if (!player) return { name: 'None', description: '' };
  if (player.role === 'BOWL') {
    return {
      id: 'deathlock',
      name: 'Deathlock Bowler',
      description: 'Reduces opponent batting boundary rate by 30% in death overs (overs 16–20).'
    };
  } else if (player.role === 'AR') {
    return {
      id: 'clutch',
      name: 'Clutch Player',
      description: 'Gains +15% batting boundaries and -15% bowling economy rate in high-pressure situations.'
    };
  } else {
    return {
      id: 'chase',
      name: 'Chase Master',
      description: 'Grants +20% batting average and -30% dismissal risk when chasing a target.'
    };
  }
}

export default function MatchPreview({ homeId, awayId, userName, teamStats, playerStats, results = [], careerRivalries = {}, onSimulate, onWatch, onClose }) {
  const isInternational = useMemo(() => {
    return INTERNATIONAL_TEAMS.some(t => t.id === homeId || t.id === awayId);
  }, [homeId, awayId]);

  const effectiveUserTeam = isInternational ? 'IND' : USER_TEAM;

  const home = TEAMS.find(t => t.id === homeId) || INTERNATIONAL_TEAMS.find(t => t.id === homeId);
  const away = TEAMS.find(t => t.id === awayId) || INTERNATIONAL_TEAMS.find(t => t.id === awayId);
  const opponentId = homeId === effectiveUserTeam ? awayId : homeId;
  const opponent = TEAMS.find(t => t.id === opponentId) || INTERNATIONAL_TEAMS.find(t => t.id === opponentId);

  // States for Captain's Tactics
  const [intent, setIntent] = useState('balanced'); // conservative | balanced | aggressive
  const [bowlingFocus, setBowlingFocus] = useState('balanced'); // pace | balanced | spin
  const [selectedImpact, setSelectedImpact] = useState('Default');

  // Dynamic Star Players evaluation using local playersMap
  const playersMap = useMemo(() => {
    const baseMap = buildAllPlayers(userName, effectiveUserTeam);
    if (isInternational) {
      for (const teamId of Object.keys(INTERNATIONAL_ROSTERS)) {
        INTERNATIONAL_ROSTERS[teamId].forEach(tup => {
          const [name, role, batSR, batAvg, bowlSR, bowlEcon] = tup;
          baseMap[`${teamId}:${name}`] = {
            name, role, team: teamId,
            batSR, batAvg,
            bowls: bowlSR !== null,
            bowlSR: bowlSR || 0,
            bowlEcon: bowlEcon || 0,
          };
        });
      }
    }
    return baseMap;
  }, [userName, effectiveUserTeam, isInternational]);

  const rostersSource = isInternational ? INTERNATIONAL_ROSTERS : null;
  const homeStar = useMemo(() => getStarPlayerForTeam(homeId, userName, effectiveUserTeam, playersMap, rostersSource), [homeId, userName, effectiveUserTeam, playersMap, rostersSource]);
  const awayStar = useMemo(() => getStarPlayerForTeam(awayId, userName, effectiveUserTeam, playersMap, rostersSource), [awayId, userName, effectiveUserTeam, playersMap, rostersSource]);

  const cskStar = homeId === effectiveUserTeam ? homeStar : awayStar;
  const oppStar = homeId === effectiveUserTeam ? awayStar : homeStar;

  // Strategic Toggles
  const [playDefensivelyAgainstStar, setPlayDefensivelyAgainstStar] = useState(false);
  const [targetOpponentStar, setTargetOpponentStar] = useState(false);

  // Roster options for CSK/IND Impact Player
  const cskRoster = useMemo(() => {
    return Object.values(playersMap)
      .filter(p => p.team === effectiveUserTeam && !p.isUser)
      .map(p => p.name);
  }, [playersMap, effectiveUserTeam]);

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
        base += homeId === effectiveUserTeam ? h2hShift : -h2hShift;
      }
    }
    
    return Math.max(25, Math.min(75, Math.round(base)));
  }, [homeId, awayId, teamStats, careerRivalries, opponentId, effectiveUserTeam]);

  const handleStart = (mode) => {
    const tactics = {
      intent,
      bowlingFocus,
      nominatedImpact: selectedImpact === 'Default' ? null : selectedImpact,
      playDefensivelyAgainstStar,
      targetOpponentStar
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
        <div className="absolute top-0 inset-x-0 h-1" style={{ background: `linear-gradient(to right, ${home?.primary || '#3b82f6'}, ${away?.primary || '#1e3a8a'})` }} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] ${isInternational ? 'bg-blue-500/5' : 'bg-amber-500/5'} blur-[100px] rounded-full pointer-events-none`} />

        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className={`text-[10px] tracking-[0.3em] ${isInternational ? 'text-blue-400' : 'text-amber-500'} font-bold mb-1`}>UPCOMING FIXTURE</div>
            <h2 className="text-3xl font-black tracking-wider text-zinc-100 uppercase" style={{ fontFamily: 'Bebas Neue' }}>
              {isInternational ? 'IND Match Preview' : 'CSK Match Preview'}
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
                <span className="font-bold text-sm text-zinc-100">{home?.name || homeId}</span>
                <div className="flex gap-1 mt-1">
                  {homeForm.map((f, idx) => (
                    <span key={idx} className={`text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono ${f === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{f}</span>
                  ))}
                  {homeForm.length === 0 && <span className="text-zinc-600 text-[10px]">-</span>}
                </div>
              </div>
            </div>
            
            <div className="text-center font-mono">
              <div className={`text-2xl font-black ${isInternational ? 'text-blue-400' : 'text-amber-500'}`}>{winPct}% vs {100 - winPct}%</div>
              <div className="text-[9px] text-zinc-500 tracking-wider uppercase font-bold">Win Probability</div>
              {!isInternational && HOME_VENUES[homeId] && (
                <div className="mt-1.5 text-[9px] text-zinc-500 tracking-wide normal-case font-sans">
                  📍 {HOME_VENUES[homeId].name.split(',')[0]}
                  {(() => {
                    const eff = venueScoringEffect(HOME_VENUES[homeId].factor);
                    const pct = Math.round((eff - 1) * 100);
                    if (pct === 0) return null;
                    return <span className={pct > 0 ? 'text-orange-400/80' : 'text-sky-400/80'}> · {pct > 0 ? `+${pct}% batting` : `${pct}% scoring`}</span>;
                  })()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-right">
              <div className="text-right">
                <span className="text-zinc-400 text-xs block">AWAY</span>
                <span className="font-bold text-sm text-zinc-100">{away?.name || awayId}</span>
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
            <div className="h-full transition-all duration-300 ease-out" style={{ width: `${winPct}%`, backgroundColor: home?.primary || '#3b82f6' }} />
            <div className="h-full transition-all duration-300 ease-out" style={{ width: `${100 - winPct}%`, backgroundColor: away?.primary || '#1e3a8a' }} />
          </div>
        </div>

        {/* Dynamic Star Spotlight Duel Panel */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950/20">
          <div className={`text-[10px] tracking-[0.35em] ${isInternational ? 'text-blue-400' : 'text-amber-500'} font-black mb-4 flex items-center gap-1.5 justify-center`}>
            <Zap className={`w-4 h-4 ${isInternational ? 'text-blue-400' : 'text-amber-400'} animate-pulse`} /> DYNAMIC STAR SPOTLIGHT DUEL
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CSK Star Card */}
            {cskStar && (
              <div className={`glass-panel rounded-xl p-4 border border-zinc-800/80 relative overflow-hidden group hover:border-${isInternational ? 'blue' : 'amber'}-500/50 transition-all duration-300`}>
                <div className={`absolute top-0 inset-x-0 h-0.5 ${isInternational ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'}`} />
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[8px] font-black tracking-widest ${isInternational ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'} px-2 py-0.5 rounded border uppercase`}>
                      {isInternational ? 'IND' : 'CSK'} {cskStar.role} ICON
                    </span>
                    <h4 className="font-extrabold text-sm text-zinc-100 mt-1">{cskStar.name}</h4>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1">
                      Rating: <strong className={isInternational ? 'text-blue-400' : 'text-amber-400'}>{calculatePlayerRating(cskStar).toFixed(0)}</strong> · Avg: {cskStar.batAvg} · SR: {cskStar.batSR}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Ability: <strong className="text-zinc-300">{getStarPlayerTrait(cskStar).name}</strong>
                      <p className="text-[9px] text-zinc-400 font-sans italic mt-1 leading-normal">
                        "{getStarPlayerTrait(cskStar).description}"
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-10 shrink-0 rounded-full ${isInternational ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'} flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform duration-300`}>
                    {cskStar.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                </div>
              </div>
            )}

            {/* Opponent Star Card */}
            {oppStar && (
              <div className="glass-panel rounded-xl p-4 border border-zinc-800/80 relative overflow-hidden group hover:border-fuchsia-500/50 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-fuchsia-500 shadow-[0_0_10px_#d946ef]" />
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[8px] font-black tracking-widest text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded border border-fuchsia-500/20 uppercase">
                      {opponent?.short || opponentId} {oppStar.role} ICON
                    </span>
                    <h4 className="font-extrabold text-sm text-zinc-100 mt-1">{oppStar.name}</h4>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1">
                      Rating: <strong className="text-fuchsia-400">{calculatePlayerRating(oppStar).toFixed(0)}</strong> · Avg: {oppStar.batAvg} · SR: {oppStar.batSR}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Ability: <strong className="text-zinc-300">{getStarPlayerTrait(oppStar).name}</strong>
                      <p className="text-[9px] text-zinc-400 font-sans italic mt-1 leading-normal">
                        "{getStarPlayerTrait(oppStar).description}"
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 shrink-0 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center font-bold text-fuchsia-400 text-xs shadow-[0_0_15px_rgba(217,70,239,0.15)] group-hover:scale-105 transition-transform duration-300">
                    {oppStar.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Strategic Focusing Toggles */}
          {oppStar && (
            <div className="mt-4 bg-black/40 border border-zinc-800/80 rounded-xl p-4 space-y-3">
              <div className="text-[10px] font-black text-zinc-450 uppercase tracking-widest">
                🎯 CRITICAL MATCH STRATEGY
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Toggle 1: Play Defensively against Opponent Star Bowler */}
                {oppStar.role === 'BOWL' && (
                  <label className="flex items-center gap-2.5 cursor-pointer bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800/80 rounded-lg p-2.5 flex-1 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={playDefensivelyAgainstStar}
                      onChange={e => setPlayDefensivelyAgainstStar(e.target.checked)}
                      className={`${isInternational ? 'accent-blue-500' : 'accent-amber-500'} w-4 h-4 cursor-pointer`}
                    />
                    <div className="text-[11px] text-zinc-300">
                      <span className={`font-bold ${isInternational ? 'text-blue-400' : 'text-amber-400'}`}>Play Defensively</span> against {oppStar.name}
                      <div className="text-[9px] text-zinc-500 font-mono leading-tight mt-0.5">
                        (-40% Wicket risk / -30% Strike Rate)
                      </div>
                    </div>
                  </label>
                )}

                {/* Toggle 2: Target Opponent Star Batter */}
                {(oppStar.role === 'BAT' || oppStar.role === 'WK' || oppStar.role === 'AR') && (
                  <label className="flex items-center gap-2.5 cursor-pointer bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800/80 rounded-lg p-2.5 flex-1 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={targetOpponentStar}
                      onChange={e => setTargetOpponentStar(e.target.checked)}
                      className="accent-fuchsia-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-[11px] text-zinc-300">
                      <span className="font-bold text-fuchsia-400">Target aggressively</span> {oppStar.name}
                      <div className="text-[9px] text-zinc-500 font-mono leading-tight mt-0.5">
                        (+25% Wicket probability / +15% Runs allowed)
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tactical Config Options */}
        <div className="p-6 space-y-6">
          <h3 className="text-xs tracking-[0.25em] text-zinc-550 font-black flex items-center gap-1.5">
            <Shield className={`w-4 h-4 ${isInternational ? 'text-blue-400' : 'text-amber-500'}`} /> CAPTAIN'S TACTICAL DIRECTIVE
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Intent Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-450 block tracking-wide">BATTING INTENT</label>
              <select
                value={intent}
                onChange={e => setIntent(e.target.value)}
                className={`w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${isInternational ? 'focus:border-blue-500' : 'focus:border-amber-500'} transition-all font-mono`}
              >
                <option value="conservative">Conservative (Avg+ / SR-)</option>
                <option value="balanced">Balanced (Default)</option>
                <option value="aggressive">Aggressive (Avg- / SR++)</option>
              </select>
            </div>

            {/* Bowling Focus Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-450 block tracking-wide">BOWLING FOCUS</label>
              <select
                value={bowlingFocus}
                onChange={e => setBowlingFocus(e.target.value)}
                className={`w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${isInternational ? 'focus:border-blue-500' : 'focus:border-amber-500'} transition-all font-mono`}
              >
                <option value="balanced">Balanced (Default)</option>
                <option value="pace">Pace Dominant</option>
                <option value="spin">Spin Dominant</option>
              </select>
            </div>

            {/* Nominated Impact Player Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-450 block tracking-wide">NOMINATE IMPACT SUB</label>
              <select
                disabled={isInternational}
                value={selectedImpact}
                onChange={e => setSelectedImpact(e.target.value)}
                className={`w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${isInternational ? 'focus:border-blue-500' : 'focus:border-amber-500'} transition-all font-mono disabled:opacity-50`}
              >
                {isInternational ? (
                  <option value="Default">Not Applicable (International Rules)</option>
                ) : (
                  <>
                    <option value="Default">Default (Automated)</option>
                    {cskRoster.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          <div className={`${isInternational ? 'bg-blue-500/[0.04] border-blue-500/25' : 'bg-amber-500/[0.04] border-amber-500/25'} rounded-lg border p-3 flex items-start gap-2.5`}>
            <Info className={`w-4 h-4 ${isInternational ? 'text-blue-400' : 'text-amber-500'} shrink-0 mt-0.5 animate-pulse`} />
            <div className="text-[10px] text-zinc-400 leading-relaxed font-mono">
              {intent === 'aggressive' && <span className={`${isInternational ? 'text-blue-400' : 'text-amber-400'} font-bold`}>AGGRESSIVE BATTING:</span>}
              {intent === 'conservative' && <span className={`${isInternational ? 'text-blue-400' : 'text-amber-400'} font-bold`}>CONSERVATIVE BATTING:</span>}
              {intent === 'balanced' && <span className={`${isInternational ? 'text-blue-400' : 'text-amber-450'} font-bold`}>BALANCED BATTING:</span>}
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
            className={`flex items-center justify-center gap-2 bg-gradient-to-r ${isInternational ? 'from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-blue-500/20' : 'from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20'} font-bold py-4 rounded-xl tracking-wider text-sm transition-all hover:-translate-y-0.5 shadow-lg`}
          >
            <Play className={`w-4 h-4 fill-current ${isInternational ? 'text-white' : 'text-black'}`} />
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
