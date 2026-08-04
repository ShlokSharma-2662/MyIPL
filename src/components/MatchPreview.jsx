import React, { useState, useMemo } from 'react';
import { Target, Shield, Award, Zap, Play, FastForward, Info, Users } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS, buildAllPlayers } from '../data';
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

export default function MatchPreview({ homeId, awayId, userName, userTeam, teamStats, playerStats, results = [], careerRivalries = {}, onSimulate, onWatch, onClose }) {
  const isInternational = useMemo(() => {
    return INTERNATIONAL_TEAMS.some(t => t.id === homeId || t.id === awayId);
  }, [homeId, awayId]);

  const effectiveUserTeam = isInternational ? 'IND' : userTeam;

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
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto animate-fade-in"
      style={{
        background: 'rgba(5, 8, 7, 0.92)',
        paddingTop: 'max(4.5rem, calc(env(safe-area-inset-top, 0px) + 3.5rem))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      <div
        className="rounded-2xl max-w-2xl w-full animate-slide-up relative overflow-hidden mb-8 border border-[var(--stroke)]"
        style={{ background: 'var(--surface-1)', boxShadow: '0 24px 80px rgba(0,0,0,0.65)' }}
      >
        <div className="absolute top-0 inset-x-0 h-1" style={{ background: `linear-gradient(to right, ${home?.primary || '#3b82f6'}, ${away?.primary || '#1e3a8a'})` }} />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--stroke)] flex items-center justify-between gap-3 relative z-10" style={{ background: 'var(--surface-1)' }}>
          <div className="min-w-0">
            <div className="text-[10px] tracking-[0.3em] accent-text font-bold mb-1">UPCOMING FIXTURE</div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-zinc-100 uppercase truncate" style={{ fontFamily: 'Bebas Neue' }}>
              {isInternational ? 'IND Match Preview' : `${effectiveUserTeam} Match Preview`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-zinc-300 hover:text-white text-xs font-mono uppercase bg-[var(--surface-2)] px-3 py-1.5 rounded-lg border border-[var(--stroke)]"
          >
            Cancel
          </button>
        </div>

        {/* Hype Panel: Matchup Win Probability */}
        <div className="p-5 sm:p-6 border-b border-[var(--stroke)] relative z-10" style={{ background: 'var(--surface-2)' }}>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <TeamBadge teamId={homeId} size="lg" />
              <div className="text-left min-w-0">
                <span className="text-zinc-400 text-xs block">HOME</span>
                <span className="font-bold text-sm text-zinc-100 block truncate">{home?.name || homeId}</span>
                <div className="flex gap-1 mt-1">
                  {homeForm.map((f, idx) => (
                    <span key={idx} className={`text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono ${f === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{f}</span>
                  ))}
                  {homeForm.length === 0 && <span className="text-zinc-600 text-[10px]">-</span>}
                </div>
              </div>
            </div>
            
            <div className="text-center font-mono shrink-0 px-1">
              <div className="text-xl sm:text-2xl font-black accent-text">{winPct}% vs {100 - winPct}%</div>
              <div className="text-[9px] text-zinc-400 tracking-wider uppercase font-bold">Win Probability</div>
              {!isInternational && HOME_VENUES[homeId] && (
                <div className="mt-1.5 text-[9px] text-zinc-400 tracking-wide normal-case font-sans max-w-[11rem] mx-auto leading-snug">
                  {HOME_VENUES[homeId].name.split(',')[0]}
                  {(() => {
                    const eff = venueScoringEffect(HOME_VENUES[homeId].factor);
                    const pct = Math.round((eff - 1) * 100);
                    if (pct === 0) return null;
                    return <span className={pct > 0 ? 'text-orange-400' : 'text-sky-400'}> · {pct > 0 ? `+${pct}% batting` : `${pct}% scoring`}</span>;
                  })()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-right min-w-0">
              <div className="text-right min-w-0">
                <span className="text-zinc-400 text-xs block">AWAY</span>
                <span className="font-bold text-sm text-zinc-100 block truncate">{away?.name || awayId}</span>
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

          <div className="w-full bg-black/50 h-2.5 rounded-full overflow-hidden flex">
            <div className="h-full transition-all duration-300 ease-out" style={{ width: `${winPct}%`, backgroundColor: home?.primary || '#3b82f6' }} />
            <div className="h-full transition-all duration-300 ease-out" style={{ width: `${100 - winPct}%`, backgroundColor: away?.primary || '#1e3a8a' }} />
          </div>
        </div>

        {/* Dynamic Star Spotlight Duel Panel */}
        <div className="p-5 sm:p-6 border-b border-[var(--stroke)] relative z-10" style={{ background: 'var(--surface-1)' }}>
          <div className="text-[10px] tracking-[0.35em] accent-text font-black mb-4 flex items-center gap-1.5 justify-center">
            <Zap className="w-4 h-4 accent-text" /> DYNAMIC STAR SPOTLIGHT DUEL
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User team star */}
            {cskStar && (
              <div className="rounded-xl p-4 border border-[var(--stroke)] relative overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <div className="absolute top-0 inset-x-0 h-0.5" style={{ background: 'var(--accent)' }} />
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[8px] font-black tracking-widest accent-text accent-soft px-2 py-0.5 rounded border border-[color:color-mix(in_srgb,var(--accent)_30%,transparent)] uppercase">
                      {effectiveUserTeam} {cskStar.role} ICON
                    </span>
                    <h4 className="font-extrabold text-sm text-zinc-100 mt-1">{cskStar.name}</h4>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1">
                      Rating: <strong className="accent-text">{calculatePlayerRating(cskStar).toFixed(0)}</strong> · Avg: {cskStar.batAvg} · SR: {cskStar.batSR}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Ability: <strong className="text-zinc-300">{getStarPlayerTrait(cskStar).name}</strong>
                      <p className="text-[9px] text-zinc-400 font-sans italic mt-1 leading-normal">
                        "{getStarPlayerTrait(cskStar).description}"
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 shrink-0 rounded-full accent-soft border border-[color:color-mix(in_srgb,var(--accent)_35%,transparent)] accent-text flex items-center justify-center font-bold text-xs">
                    {cskStar.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                </div>
              </div>
            )}

            {/* Opponent Star Card */}
            {oppStar && (
              <div className="rounded-xl p-4 border border-zinc-700/80 relative overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <div className="absolute top-0 inset-x-0 h-0.5 bg-fuchsia-500" />
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[8px] font-black tracking-widest text-fuchsia-300 bg-fuchsia-500/15 px-2 py-0.5 rounded border border-fuchsia-500/30 uppercase">
                      {opponent?.short || opponentId} {oppStar.role} ICON
                    </span>
                    <h4 className="font-extrabold text-sm text-zinc-100 mt-1">{oppStar.name}</h4>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1">
                      Rating: <strong className="text-fuchsia-300">{calculatePlayerRating(oppStar).toFixed(0)}</strong> · Avg: {oppStar.batAvg} · SR: {oppStar.batSR}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Ability: <strong className="text-zinc-300">{getStarPlayerTrait(oppStar).name}</strong>
                      <p className="text-[9px] text-zinc-400 font-sans italic mt-1 leading-normal">
                        "{getStarPlayerTrait(oppStar).description}"
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 shrink-0 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/40 flex items-center justify-center font-bold text-fuchsia-300 text-xs">
                    {oppStar.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Strategic Focusing Toggles */}
          {oppStar && (
            <div className="mt-4 rounded-xl p-4 space-y-3 border border-[var(--stroke)]" style={{ background: 'var(--surface-2)' }}>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                CRITICAL MATCH STRATEGY
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {oppStar.role === 'BOWL' && (
                  <label className="flex items-center gap-2.5 cursor-pointer hover:brightness-110 border border-[var(--stroke)] rounded-lg p-2.5 flex-1 transition-all select-none" style={{ background: 'var(--surface-1)' }}>
                    <input
                      type="checkbox"
                      checked={playDefensivelyAgainstStar}
                      onChange={e => setPlayDefensivelyAgainstStar(e.target.checked)}
                      className="accent-[var(--accent)] w-4 h-4 cursor-pointer"
                    />
                    <div className="text-[11px] text-zinc-200">
                      <span className="font-bold accent-text">Play Defensively</span> against {oppStar.name}
                      <div className="text-[9px] text-zinc-500 font-mono leading-tight mt-0.5">
                        (-40% Wicket risk / -30% Strike Rate)
                      </div>
                    </div>
                  </label>
                )}

                {(oppStar.role === 'BAT' || oppStar.role === 'WK' || oppStar.role === 'AR') && (
                  <label className="flex items-center gap-2.5 cursor-pointer hover:brightness-110 border border-[var(--stroke)] rounded-lg p-2.5 flex-1 transition-all select-none" style={{ background: 'var(--surface-1)' }}>
                    <input
                      type="checkbox"
                      checked={targetOpponentStar}
                      onChange={e => setTargetOpponentStar(e.target.checked)}
                      className="accent-fuchsia-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-[11px] text-zinc-200">
                      <span className="font-bold text-fuchsia-300">Target aggressively</span> {oppStar.name}
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
        <div className="p-5 sm:p-6 space-y-6 relative z-10" style={{ background: 'var(--surface-1)' }}>
          <h3 className="text-xs tracking-[0.25em] text-zinc-400 font-black flex items-center gap-1.5">
            <Shield className="w-4 h-4 accent-text" /> CAPTAIN'S TACTICAL DIRECTIVE
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block tracking-wide">BATTING INTENT</label>
              <select
                value={intent}
                onChange={e => setIntent(e.target.value)}
                className="w-full border border-[var(--stroke)] text-zinc-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[var(--accent)] transition-all font-mono"
                style={{ background: 'var(--surface-2)' }}
              >
                <option value="conservative">Conservative (Avg+ / SR-)</option>
                <option value="balanced">Balanced (Default)</option>
                <option value="aggressive">Aggressive (Avg- / SR++)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block tracking-wide">BOWLING FOCUS</label>
              <select
                value={bowlingFocus}
                onChange={e => setBowlingFocus(e.target.value)}
                className="w-full border border-[var(--stroke)] text-zinc-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[var(--accent)] transition-all font-mono"
                style={{ background: 'var(--surface-2)' }}
              >
                <option value="balanced">Balanced (Default)</option>
                <option value="pace">Pace Dominant</option>
                <option value="spin">Spin Dominant</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block tracking-wide">NOMINATE IMPACT SUB</label>
              <select
                disabled={isInternational}
                value={selectedImpact}
                onChange={e => setSelectedImpact(e.target.value)}
                className="w-full border border-[var(--stroke)] text-zinc-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[var(--accent)] transition-all font-mono disabled:opacity-50"
                style={{ background: 'var(--surface-2)' }}
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

          <div className="rounded-lg border border-[color:color-mix(in_srgb,var(--accent)_35%,transparent)] accent-soft p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 accent-text shrink-0 mt-0.5" />
            <div className="text-[10px] text-zinc-300 leading-relaxed font-mono">
              {intent === 'aggressive' && <span className="accent-text font-bold">AGGRESSIVE BATTING:</span>}
              {intent === 'conservative' && <span className="accent-text font-bold">CONSERVATIVE BATTING:</span>}
              {intent === 'balanced' && <span className="accent-text font-bold">BALANCED BATTING:</span>}
              {intent === 'aggressive' && ' Batsmen will hit 25% faster boundaries but get out 22% more often.'}
              {intent === 'conservative' && ' Batsmen will defend more, boosting survival by 30% but dropping scoring speed.'}
              {intent === 'balanced' && ' Standard batting metrics calculated strictly off default stats and player form.'}

              {bowlingFocus === 'spin' && <span> Spinners get a <strong className="text-fuchsia-300 font-bold">12% efficiency boost</strong>; pacers lose 6% control.</span>}
              {bowlingFocus === 'pace' && <span> Pacers get a <strong className="text-fuchsia-300 font-bold">12% efficiency boost</strong>; spinners lose 6% control.</span>}
              {bowlingFocus === 'balanced' && ' Bowlers split duties evenly under standard economic calculations.'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-5 sm:p-6 border-t border-[var(--stroke)] grid grid-cols-2 gap-3 relative z-10" style={{ background: 'var(--surface-2)' }}>
          <button
            type="button"
            onClick={() => handleStart('watch')}
            className="btn-accent flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl tracking-wider text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            WATCH LIVE
          </button>
          
          <button
            type="button"
            onClick={() => handleStart('sim')}
            className="flex items-center justify-center gap-2 border border-[var(--stroke)] text-white font-bold py-3.5 rounded-xl tracking-wider text-sm hover:bg-white/5"
            style={{ background: 'var(--surface-1)' }}
          >
            <FastForward className="w-4 h-4" />
            INSTANT SIMULATE
          </button>
        </div>
      </div>
    </div>
  );
}
