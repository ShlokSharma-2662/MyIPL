import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, FastForward, Trophy, Zap, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS } from '../data';

const SPEEDS = [
  { label: 'SLOW', ms: 1600 },
  { label: 'NORMAL', ms: 750 },
  { label: 'FAST', ms: 250 },
  { label: 'BLITZ', ms: 40 }
];

export default function LiveMatchViewer({ match, userTeam = 'CSK', onComplete }) {
  if (!match) return null;

  const home = TEAMS.find(t => t.id === match.home);
  const away = TEAMS.find(t => t.id === match.away);
  
  // Combine all events sequentially: inn1 events + inn2 events
  const allEvents = useMemo(() => {
    const inn1WithInnings = match.inn1.events.map(e => ({ ...e, innings: 1 }));
    const inn2WithInnings = match.inn2.events.map(e => ({ ...e, innings: 2 }));
    return [...inn1WithInnings, ...inn2WithInnings];
  }, [match]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(1); // Default NORMAL (750ms)

  const comEndRef = useRef(null);
  const timerRef = useRef(null);

  // Speed value in milliseconds
  const currentSpeed = SPEEDS[speedIdx].ms;

  // Auto-scroll commentary list to the bottom
  useEffect(() => {
    if (comEndRef.current) {
      comEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentIdx]);

  // Main playback timer loop
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (isPlaying && currentIdx < allEvents.length - 1) {
      timerRef.current = setInterval(() => {
        setCurrentIdx(prev => {
          if (prev >= allEvents.length - 1) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, currentSpeed);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIdx, currentSpeed, allEvents]);

  // Compute live match state dynamically by accumulating events up to currentIdx
  const liveStats = useMemo(() => {
    let inn1Score = { runs: 0, wickets: 0, overs: '0.0', balls: 0, extras: 0 };
    let inn2Score = { runs: 0, wickets: 0, overs: '0.0', balls: 0, extras: 0 };
    
    const batters = {}; // name -> { runs, balls, fours, sixes, out }
    const bowlers = {}; // name -> { runs, balls, wickets }
    
    let activeStriker = '';
    let activeNonStriker = '';
    let activeBowler = '';
    let activeInnings = 1;
    let partnershipRuns = 0;
    let partnershipBalls = 0;

    // Crowd Support State: Starts at 75% for Home, 25% for Away
    let crowdSupport = match.home === userTeam ? 75 : 25;

    for (let i = 0; i <= currentIdx; i++) {
      const e = allEvents[i];
      if (!e) continue;

      activeInnings = e.innings;
      activeStriker = e.striker;
      activeNonStriker = e.nonStriker;
      activeBowler = e.bowler;

      // Initialize batsman
      if (!batters[e.striker]) {
        batters[e.striker] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
      }
      if (!batters[e.nonStriker]) {
        batters[e.nonStriker] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
      }
      // Initialize bowler
      if (!bowlers[e.bowler]) {
        bowlers[e.bowler] = { runs: 0, balls: 0, wickets: 0 };
      }

      // Track active batting team
      const isUserBatting = (e.innings === 1 && match.battingFirst === userTeam) || 
                            (e.innings === 2 && match.battingFirst !== userTeam);

      if (e.innings === 1) {
        if (e.isExtra) {
          inn1Score.runs += e.runs;
          inn1Score.extras += e.runs;
          bowlers[e.bowler].runs += e.runs;
          partnershipRuns += e.runs;

          // Extra shift
          if (isUserBatting) crowdSupport = Math.min(95, crowdSupport + 1);
          else crowdSupport = Math.max(5, crowdSupport - 1);
        } else {
          inn1Score.runs += e.runs;
          inn1Score.balls++;
          batters[e.striker].runs += e.runs;
          batters[e.striker].balls++;
          if (e.runs === 6) batters[e.striker].sixes++;
          if (e.runs === 4) batters[e.striker].fours++;
          
          bowlers[e.bowler].runs += e.runs;
          bowlers[e.bowler].balls++;
          
          partnershipRuns += e.runs;
          partnershipBalls++;

          if (e.isWicket) {
            inn1Score.wickets++;
            batters[e.striker].out = true;
            bowlers[e.bowler].wickets++;
            partnershipRuns = 0;
            partnershipBalls = 0;

            // Wicket shift (heavy loss of support for batting side)
            if (isUserBatting) crowdSupport = Math.max(5, crowdSupport - 8);
            else crowdSupport = Math.min(95, crowdSupport + 8);
          } else {
            // Boundary shifts
            if (e.runs === 6) {
              if (isUserBatting) crowdSupport = Math.min(95, crowdSupport + 4);
              else crowdSupport = Math.max(5, crowdSupport - 4);
            } else if (e.runs === 4) {
              if (isUserBatting) crowdSupport = Math.min(95, crowdSupport + 2.5);
              else crowdSupport = Math.max(5, crowdSupport - 2.5);
            } else if (e.runs === 0) {
              // Dot is good for bowling side
              if (!isUserBatting) crowdSupport = Math.min(95, crowdSupport + 1);
              else crowdSupport = Math.max(5, crowdSupport - 1);
            }
          }
        }
        inn1Score.overs = `${Math.floor(inn1Score.balls / 6)}.${inn1Score.balls % 6}`;
      } else {
        if (e.isExtra) {
          inn2Score.runs += e.runs;
          inn2Score.extras += e.runs;
          bowlers[e.bowler].runs += e.runs;
          partnershipRuns += e.runs;

          if (isUserBatting) crowdSupport = Math.min(95, crowdSupport + 1);
          else crowdSupport = Math.max(5, crowdSupport - 1);
        } else {
          inn2Score.runs += e.runs;
          inn2Score.balls++;
          batters[e.striker].runs += e.runs;
          batters[e.striker].balls++;
          if (e.runs === 6) batters[e.striker].sixes++;
          if (e.runs === 4) batters[e.striker].fours++;
          
          bowlers[e.bowler].runs += e.runs;
          bowlers[e.bowler].balls++;

          partnershipRuns += e.runs;
          partnershipBalls++;

          if (e.isWicket) {
            inn2Score.wickets++;
            batters[e.striker].out = true;
            bowlers[e.bowler].wickets++;
            partnershipRuns = 0;
            partnershipBalls = 0;

            if (isUserBatting) crowdSupport = Math.max(5, crowdSupport - 8);
            else crowdSupport = Math.min(95, crowdSupport + 8);
          } else {
            if (e.runs === 6) {
              if (isUserBatting) crowdSupport = Math.min(95, crowdSupport + 4);
              else crowdSupport = Math.max(5, crowdSupport - 4);
            } else if (e.runs === 4) {
              if (isUserBatting) crowdSupport = Math.min(95, crowdSupport + 2.5);
              else crowdSupport = Math.max(5, crowdSupport - 2.5);
            } else if (e.runs === 0) {
              if (!isUserBatting) crowdSupport = Math.min(95, crowdSupport + 1);
              else crowdSupport = Math.max(5, crowdSupport - 1);
            }
          }
        }
        inn2Score.overs = `${Math.floor(inn2Score.balls / 6)}.${inn2Score.balls % 6}`;
      }
    }

    return {
      inn1Score,
      inn2Score,
      batters,
      bowlers,
      activeStriker,
      activeNonStriker,
      activeBowler,
      activeInnings,
      partnershipRuns,
      partnershipBalls,
      crowdSupport: Math.round(crowdSupport)
    };
  }, [allEvents, currentIdx, userTeam, match]);

  const handleSkip = () => {
    setIsPlaying(false);
    setCurrentIdx(allEvents.length - 1);
  };

  const handleFinish = () => {
    onComplete(match);
  };

  const currentEvent = allEvents[currentIdx];
  const isFinished = currentIdx >= allEvents.length - 1;

  // Star involvement metadata from the current simulated ball
  const isStrikerStar = currentEvent?.isStrikerStar;
  const isBowlerStar = currentEvent?.isBowlerStar;
  const isStarActive = isStrikerStar || isBowlerStar;

  // Innings-specific metadata
  const targetRuns = liveStats.inn1Score.runs + 1;
  const battingFirstTeam = match.battingFirst === match.home ? home : away;
  const battingSecondTeam = match.battingFirst === match.home ? away : home;

  const currentInningsTeam = liveStats.activeInnings === 1 ? battingFirstTeam : battingSecondTeam;
  const bowlingTeam = liveStats.activeInnings === 1 ? battingSecondTeam : battingFirstTeam;

  // Chase calculations
  const runsNeeded = targetRuns - liveStats.inn2Score.runs;
  const ballsRemaining = 120 - liveStats.inn2Score.balls;
  const reqRunRate = ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : '0.00';

  // Home and Away Crowd percentages
  const homeSupport = match.home === userTeam ? liveStats.crowdSupport : 100 - liveStats.crowdSupport;
  const awaySupport = match.away === userTeam ? liveStats.crowdSupport : 100 - liveStats.crowdSupport;

  // Check if a dynamic star has *just* started their spell or innings on this ball
  const strikerBalls = liveStats.batters[liveStats.activeStriker]?.balls || 0;
  const bowlerBalls = liveStats.bowlers[liveStats.activeBowler]?.balls || 0;
  const showStrikerStarAlert = isStrikerStar && strikerBalls === 1;
  const showBowlerStarAlert = isBowlerStar && bowlerBalls === 1;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex flex-col font-sans text-zinc-100 animate-fade-in relative">
      
      {/* Dynamic Star Entrance Alert Overlay (Cinematic Flash Overlay) */}
      {(showStrikerStarAlert || showBowlerStarAlert) && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in pointer-events-none">
          <div className="bg-gradient-to-br from-amber-500/20 via-zinc-950/95 to-fuchsia-500/20 border-2 border-amber-500/50 rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] max-w-sm animate-scale-up pointer-events-auto relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-fuchsia-500 shadow-[0_0_15px_#f59e0b]" />
            <Zap className="w-12 h-12 text-amber-400 mx-auto mb-3 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-bounce" />
            <span className="text-[10px] tracking-[0.4em] text-amber-400 font-black block uppercase">🌟 STAR PLAYER ACTIVE 🌟</span>
            <h2 className="text-2xl font-black tracking-tight text-white mt-1 uppercase" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>
              {showStrikerStarAlert ? liveStats.activeStriker : liveStats.activeBowler}
            </h2>
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">Signature Ability</span>
              <span className="text-xs font-bold text-zinc-200 mt-0.5 block">
                {showStrikerStarAlert ? 'Chase Master / Clutch Batter' : 'Deathlock Bowler / Clutch Bowler'}
              </span>
              <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-sans italic">
                {showStrikerStarAlert 
                  ? 'Gains massive scoring and survival boosts under game-changing pressure!'
                  : 'Fires high-accuracy death deliveries that lock down boundary rates!'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar / Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
          <div>
            <div className="text-[10px] tracking-[0.25em] text-amber-400 font-bold uppercase">{match.label} LIVE</div>
            <h1 className="text-lg font-black tracking-tight" style={{ fontFamily: 'Bebas Neue' }}>
              {home.name} vs {away.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 font-mono text-xs font-semibold">
          <div className="flex items-center gap-1">
            <span style={{ color: battingFirstTeam.primary }}>{battingFirstTeam.short}</span>
            <span className="text-zinc-200">{liveStats.inn1Score.runs}/{liveStats.inn1Score.wickets}</span>
            <span className="text-zinc-500 text-[10px]">({liveStats.inn1Score.overs})</span>
          </div>
          {liveStats.activeInnings === 2 && (
            <>
              <div className="text-zinc-700">|</div>
              <div className="flex items-center gap-1 animate-fade-in">
                <span style={{ color: battingSecondTeam.primary }}>{battingSecondTeam.short}</span>
                <span className="text-emerald-400 font-bold">{liveStats.inn2Score.runs}/{liveStats.inn2Score.wickets}</span>
                <span className="text-zinc-500 text-[10px]">({liveStats.inn2Score.overs})</span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Simulation Panel */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Scorecard & Live Matchup Details */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Main Giant Score Display */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[160px] text-center border-zinc-800/80">
            <div className="absolute top-0 inset-x-0 h-1 animate-pulse" style={{ backgroundColor: currentInningsTeam.primary }} />
            
            <div className="text-xs font-mono font-bold tracking-widest uppercase mb-1" style={{ color: currentInningsTeam.primary }}>
              INNINGS {liveStats.activeInnings} • {currentInningsTeam.name}
            </div>

            <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-6xl font-black tracking-tighter text-zinc-100 font-mono">
                {liveStats.activeInnings === 1 ? liveStats.inn1Score.runs : liveStats.inn2Score.runs}
              </span>
              <span className="text-3xl text-zinc-500 font-black">/</span>
              <span className="text-4xl font-bold text-zinc-400 font-mono">
                {liveStats.activeInnings === 1 ? liveStats.inn1Score.wickets : liveStats.inn2Score.wickets}
              </span>
            </div>

            <div className="text-sm font-mono text-zinc-400 mt-2 font-semibold">
              Overs: {liveStats.activeInnings === 1 ? liveStats.inn1Score.overs : liveStats.inn2Score.overs} / 20.0
            </div>

            {/* Stadium Noise / Fan Meter Gauge */}
            <div className="w-full mt-5 bg-zinc-900/50 border border-zinc-850 rounded-xl p-4 animate-fade-in relative z-10 max-w-xl">
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="font-bold flex items-center gap-1.5 animate-fade-in" style={{ color: home.primary }}>
                  {home.short} Fans ({homeSupport}%)
                </span>
                
                {/* Dynamic Star Hype Badge / Crowd Volume */}
                {isStarActive ? (
                  <span className="text-[9px] bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 text-amber-300 font-black border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    ⚡ SUPERSTAR HYPE
                  </span>
                ) : liveStats.crowdSupport > 75 ? (
                  <span className="text-[9px] bg-amber-400/20 text-amber-400 font-black border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-amber-400 text-amber-400" /> STADIUM ROAR
                  </span>
                ) : liveStats.crowdSupport < 35 ? (
                  <span className="text-[9px] bg-red-500/20 text-red-400 font-black border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" /> CROWD PRESSURE
                  </span>
                ) : (
                  <span className="text-[9px] text-zinc-500 tracking-wider font-bold">ATMOSPHERE: INTENSE</span>
                )}

                <span className="font-bold flex items-center gap-1.5 animate-fade-in" style={{ color: away.primary }}>
                  {away.short} Fans ({awaySupport}%)
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden flex border border-zinc-800 relative shadow-inner">
                <div className="h-full transition-all duration-300 ease-out" style={{ width: `${homeSupport}%`, backgroundColor: home.primary }} />
                <div className="h-full transition-all duration-300 ease-out" style={{ width: `${awaySupport}%`, backgroundColor: away.primary }} />
              </div>
            </div>

            {/* Chase Target Helper Panel */}
            {liveStats.activeInnings === 2 && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/25 px-5 py-2.5 rounded-xl text-center w-full animate-pulse max-w-md relative z-10 shadow-inner">
                <span className="text-xs tracking-wider text-amber-400 font-bold uppercase font-mono block">
                  {battingSecondTeam.short} needs {runsNeeded} runs off {ballsRemaining} balls
                </span>
                <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                  Required Run Rate: {reqRunRate} RPO
                </span>
              </div>
            )}
          </div>

          {/* Batsmen & Bowlers Active Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Batter's Panel */}
            <div className="bg-black/35 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="text-[10px] tracking-widest text-zinc-500 font-bold uppercase border-b border-zinc-800 pb-2 flex items-center justify-between">
                <span>Active Batsmen</span>
                <span style={{ color: currentInningsTeam.primary }}>Striking</span>
              </div>

              {/* Striker */}
              {liveStats.activeStriker && (
                <div className={`flex justify-between items-center bg-white/[0.02] border px-3 py-2.5 rounded-lg relative overflow-hidden transition-all duration-300 ${isStrikerStar ? 'border-amber-500/60 bg-amber-500/[0.02] shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-white/5'}`}>
                  <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: currentInningsTeam.primary }} />
                  <div className="pl-1">
                    <div className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                      {liveStats.activeStriker}
                      {isStrikerStar ? (
                        <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 shadow-sm animate-pulse">
                          ★ STAR
                        </span>
                      ) : (
                        <span className="text-[9px] bg-zinc-850 text-zinc-400 px-1 py-0.5 rounded font-black">STRIKE</span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">Fours: {liveStats.batters[liveStats.activeStriker]?.fours || 0} · Sixes: {liveStats.batters[liveStats.activeStriker]?.sixes || 0}</div>
                  </div>
                  <div className="text-right font-mono font-black text-sm text-zinc-100">
                    {liveStats.batters[liveStats.activeStriker]?.runs || 0}
                    <span className="text-zinc-500 font-normal text-xs ml-1">({liveStats.batters[liveStats.activeStriker]?.balls || 0})</span>
                  </div>
                </div>
              )}

              {/* Non-Striker */}
              {liveStats.activeNonStriker && (
                <div className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-white/[0.01]">
                  <div>
                    <div className="font-semibold text-sm text-zinc-300">{liveStats.activeNonStriker}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Fours: {liveStats.batters[liveStats.activeNonStriker]?.fours || 0} · Sixes: {liveStats.batters[liveStats.activeNonStriker]?.sixes || 0}</div>
                  </div>
                  <div className="text-right font-mono text-sm text-zinc-400">
                    {liveStats.batters[liveStats.activeNonStriker]?.runs || 0}
                    <span className="text-zinc-600 text-xs ml-1">({liveStats.batters[liveStats.activeNonStriker]?.balls || 0})</span>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-2 border-t border-zinc-800/50 flex justify-between items-center text-xs font-mono text-zinc-500">
                <span>Partnership</span>
                <span className="font-bold text-zinc-300">{liveStats.partnershipRuns} runs <span className="text-zinc-500 font-normal">({liveStats.partnershipBalls} balls)</span></span>
              </div>
            </div>

            {/* Bowler's Panel */}
            <div className="bg-black/35 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="text-[10px] tracking-widest text-zinc-500 font-bold uppercase border-b border-zinc-800 pb-2" style={{ color: bowlingTeam.primary }}>
                Active Bowler
              </div>

              {liveStats.activeBowler && (
                <div className={`flex justify-between items-center bg-white/[0.02] border px-3 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${isBowlerStar ? 'border-fuchsia-500/60 bg-fuchsia-500/[0.02] shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'border-white/5'}`}>
                  <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: bowlingTeam.primary }} />
                  <div className="pl-1">
                    <div className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                      {liveStats.activeBowler}
                      {isBowlerStar && (
                        <span className="text-[9px] bg-fuchsia-500 text-white px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 animate-pulse shadow-sm">
                          ★ STAR
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Econ: {
                      (liveStats.bowlers[liveStats.activeBowler]?.balls > 0 
                        ? (liveStats.bowlers[liveStats.activeBowler].runs / (liveStats.bowlers[liveStats.activeBowler].balls / 6)).toFixed(2) 
                        : '0.00'
                      )
                    }</span>
                  </div>
                  
                  <div className="text-right font-mono">
                    <span className="text-fuchsia-400 font-black text-sm">{liveStats.bowlers[liveStats.activeBowler]?.wickets || 0}</span>
                    <span className="text-zinc-500 font-normal text-xs mx-1">/</span>
                    <span className="text-zinc-200 font-bold text-sm">{liveStats.bowlers[liveStats.activeBowler]?.runs || 0}</span>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Overs: {Math.floor((liveStats.bowlers[liveStats.activeBowler]?.balls || 0) / 6)}.{ (liveStats.bowlers[liveStats.activeBowler]?.balls || 0) % 6 }
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-2 border-t border-zinc-800/50 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                <span>Bowler Economy Target</span>
                <span>Max 4 overs per bowler</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Ball Ticker & Live Commentary */}
        <div className="lg:col-span-1 flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-inner max-h-[500px] lg:max-h-none">
          <div className="px-5 py-4 border-b border-zinc-800/50 bg-black/40 flex items-center justify-between">
            <span className="text-xs font-black tracking-widest text-zinc-400 uppercase">Live Commentary</span>
            <span className="text-[10px] font-mono text-zinc-500">{currentIdx + 1} / {allEvents.length} deliveries</span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
            {allEvents.slice(0, currentIdx + 1).map((e, idx) => {
              const isSix = e.runs === 6;
              const isFour = e.runs === 4;
              const isWkt = e.isWicket;
              const isBallStar = e.isStrikerStar || e.isBowlerStar;
              
              return (
                <div key={idx} className={`text-xs border-b border-zinc-900 pb-3 flex flex-col gap-1.5 animate-fade-in relative overflow-hidden rounded-lg p-2 transition-all duration-300 ${isBallStar ? 'bg-amber-500/[0.02] border-l-2 border-amber-500/40 pl-2' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-500 font-semibold bg-zinc-900/60 px-1.5 py-0.5 rounded text-[10px]">{e.overNum}</span>
                    {isWkt && <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase">WICKET</span>}
                    {isSix && <span className="bg-amber-400/20 text-amber-400 border border-amber-500/30 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase font-bold">SIX!</span>}
                    {isFour && <span className="bg-emerald-400/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase">FOUR</span>}
                    {e.isExtra && <span className="bg-zinc-800 text-zinc-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">WIDE</span>}
                    {isBallStar && (
                      <span className="text-[8px] bg-amber-400/10 text-amber-450 font-black border border-amber-500/20 px-1 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wide">
                        ★ {e.isStrikerStar ? 'Star Batter' : 'Star Bowler'}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-zinc-400 font-bold ml-auto">{e.scoreAtBall}</span>
                  </div>
                  
                  <p className={`leading-relaxed ${isWkt ? 'text-red-400 font-bold' : isSix ? 'text-amber-400 font-bold' : isFour ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    {e.commentary}
                  </p>
                </div>
              );
            })}
            <div ref={comEndRef} />
          </div>
        </div>

      </div>

      {/* Playback Control Bar */}
      <footer className="border-t border-zinc-800 bg-zinc-950/90 px-6 py-5 flex flex-wrap items-center justify-between gap-4 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        {/* Speed Slider control */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800/80 px-4 py-1.5 rounded-xl">
          <span className="text-[9px] tracking-wider font-black text-zinc-500 uppercase font-mono">Speed:</span>
          {SPEEDS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setSpeedIdx(idx)}
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded transition-all ${speedIdx === idx ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Core Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isFinished}
            className="w-12 h-12 bg-white hover:bg-zinc-200 text-black flex items-center justify-center rounded-full shadow-lg disabled:opacity-50 transition-all hover:scale-105 active:scale-95 animate-pulse"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
          </button>

          <button
            onClick={handleSkip}
            disabled={isFinished}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold px-5 py-2.5 rounded-xl border border-zinc-700 tracking-wider text-xs transition-all disabled:opacity-50"
          >
            <FastForward className="w-4 h-4" />
            SKIP TO END
          </button>
        </div>

        {/* Complete Season / Continue button */}
        <div className="min-w-[120px] text-right">
          {isFinished ? (
            <button
              onClick={handleFinish}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold px-6 py-3 rounded-xl tracking-wider text-xs shadow-lg shadow-emerald-500/20 animate-bounce transition-all hover:-translate-y-0.5"
            >
              CONTINUE →
            </button>
          ) : (
            <span className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase font-bold animate-pulse">
              Simulating In Progress...
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
