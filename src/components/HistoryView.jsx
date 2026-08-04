import React, { useState, useMemo } from 'react';
import { Trophy, Crown, Star, Target, ShieldAlert, Award, Calendar, Flame, Activity } from 'lucide-react';
import { TEAMS } from '../data';
import IPLCareerGraph from './IPLCareerGraph';

const ACH_METADATA = [
  {
    key: 'IPL_CHAMPION',
    name: 'SPL CHAMPION',
    desc: 'Led Chennai Super Kings to a prestigious season championship title.',
    icon: Trophy,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  {
    key: 'ORANGE_CAP',
    name: 'ORANGE CAP LEGEND',
    desc: 'Finished a tournament as the highest run-scorer overall.',
    icon: Crown,
    color: 'text-orange-400 border-orange-500/30 bg-orange-500/10'
  },
  {
    key: 'PURPLE_CAP',
    name: 'PURPLE CAP MAESTRO',
    desc: 'Finished a tournament as the leading wicket-taker overall.',
    icon: Award,
    color: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10'
  },
  {
    key: 'CENTURION',
    name: 'CENTURION CLUB',
    desc: 'Scored 100+ runs in a single innings in any season.',
    icon: Star,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    key: 'FIVE_WICKET_HAUL',
    name: '5-WICKET STAR',
    desc: 'Took 5 or more wickets in a single match innings.',
    icon: Target,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
  },
  {
    key: 'GOD_MODE_MASTER',
    name: 'GOD MODE MASTER',
    desc: 'Successfully won 100% of God Mode matches in a season.',
    icon: Flame,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
  }
];

export default function HistoryView({ 
  userName, 
  userTeam = 'CSK',
  history = [], 
  careerRivalries = {}, 
  hallOfFame = {}, 
  unlockedAchievements = [],
  currentIPLResults = [],
  currentIntResults = [],
  currentIPLPlayerStats = {}
}) {
  const [subTab, setSubTab] = useState('trophies'); // trophies | seasons
  const [formatTab, setFormatTab] = useState('IPL'); // IPL | T20 | ODI | TEST

  const getTeam = (id) => TEAMS.find(t => t.id === id) || { name: id, primary: '#333', short: id };

  const formatConfig = {
    IPL: {
      accent: 'amber',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'from-amber-500/10',
      glow: 'drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]',
      glowStar: 'rgba(251,191,36,0.5)',
      activeTab: 'bg-amber-500 text-black shadow-md border-amber-600',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      bar: 'from-amber-500 to-amber-400'
    },
    T20: {
      accent: 'blue',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'from-blue-500/10',
      glow: 'drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]',
      glowStar: 'rgba(37,99,235,0.5)',
      activeTab: 'bg-blue-600 text-white shadow-md border-blue-700',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      bar: 'from-blue-600 to-blue-500'
    },
    ODI: {
      accent: 'sky',
      text: 'text-sky-400',
      border: 'border-sky-500/30',
      bg: 'from-sky-500/10',
      glow: 'drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]',
      glowStar: 'rgba(14,165,233,0.5)',
      activeTab: 'bg-sky-500 text-white shadow-md border-sky-600',
      badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      bar: 'from-sky-500 to-sky-400'
    },
    TEST: {
      accent: 'emerald',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'from-emerald-500/10',
      glow: 'drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]',
      glowStar: 'rgba(16,185,129,0.5)',
      activeTab: 'bg-emerald-600 text-white shadow-md border-emerald-700',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      bar: 'from-emerald-600 to-emerald-500'
    }
  };

  const currentFmt = formatConfig[formatTab];

  const getStatsForFormat = (matches, formatFilter) => {
    let M = 0;
    let runs = 0;
    let outs = 0;
    let balls = 0;
    let HS = 0;
    let hundreds = 0;
    let fifties = 0;
    let wkts = 0;
    let ballsBowled = 0;
    let runsConceded = 0;

    (matches || []).forEach(m => {
      if (formatFilter && m.format !== formatFilter) return;

      const userBatEntries = [
        ...m.inn1.battersCard, 
        ...m.inn2.battersCard, 
        ...(m.inn3?.battersCard || []), 
        ...(m.inn4?.battersCard || [])
      ].filter(b => b.player.isUser);

      const userBowlEntries = [
        ...m.inn1.bowlersCard, 
        ...m.inn2.bowlersCard, 
        ...(m.inn3?.bowlersCard || []), 
        ...(m.inn4?.bowlersCard || [])
      ].filter(b => b.player.isUser);

      if (userBatEntries.length > 0 || userBowlEntries.length > 0) {
        M++;
        
        userBatEntries.forEach(b => {
          runs += b.runs;
          if (b.out) outs++;
          balls += b.balls;
          if (b.runs > HS) HS = b.runs;
          if (b.runs >= 100) hundreds++;
          else if (b.runs >= 50) fifties++;
        });

        userBowlEntries.forEach(b => {
          wkts += b.wickets;
          ballsBowled += b.balls || 0;
          runsConceded += b.runs || 0;
        });
      }
    });

    return {
      M,
      runs,
      balls,
      outs,
      hs: HS,
      hundreds,
      fifties,
      wickets: wkts,
      ballsBowled,
      runsConceded
    };
  };

  const currentSeasonStats = useMemo(() => {
    if (formatTab === 'IPL') return getStatsForFormat(currentIPLResults, null);
    if (formatTab === 'T20') return getStatsForFormat(currentIntResults, 'T20');
    if (formatTab === 'ODI') return getStatsForFormat(currentIntResults, 'ODI');
    if (formatTab === 'TEST') return getStatsForFormat(currentIntResults, 'TEST');
    return {};
  }, [formatTab, currentIPLResults, currentIntResults]);

  const currentOrangeCap = useMemo(() => {
    const list = Object.values(currentIPLPlayerStats || {}).sort((a, b) => b.runs - a.runs);
    return list[0] ? { name: list[0].player?.name, runs: list[0].runs } : { name: 'In Progress', runs: 0 };
  }, [currentIPLPlayerStats]);

  const currentPurpleCap = useMemo(() => {
    const list = Object.values(currentIPLPlayerStats || {}).sort((a, b) => b.wkts - a.wkts);
    return list[0] ? { name: list[0].player?.name, wickets: list[0].wkts } : { name: 'In Progress', wickets: 0 };
  }, [currentIPLPlayerStats]);

  const getStatsForSeason = (seasonEntry, format) => {
    if (seasonEntry.formatStats) {
      if (format === 'IPL' && seasonEntry.formatStats.IPL) return seasonEntry.formatStats.IPL;
      if (format === 'T20' && (seasonEntry.formatStats.T20I || seasonEntry.formatStats.T20)) return seasonEntry.formatStats.T20I || seasonEntry.formatStats.T20;
      if (format === 'ODI' && seasonEntry.formatStats.ODI) return seasonEntry.formatStats.ODI;
      if (format === 'TEST' && seasonEntry.formatStats.TEST) return seasonEntry.formatStats.TEST;
    }
    
    const base = seasonEntry.playerStats || {};
    if (format === 'IPL') return base;
    if (!base.M) return {};
    
    // Seed using the season number to make it deterministic
    const seed = (seasonEntry.season || 1) * 37;
    const lcg = (mod) => {
      const a = 1103515245;
      const c = 12345;
      const m = 2147483648;
      let val = seed;
      val = (a * val + c) % m;
      return val % mod;
    };
    
    if (format === 'T20') {
      const M = Math.max(1, Math.round(base.M * 0.35 + lcg(2)));
      const runs = Math.round(base.runs * 0.35 + lcg(30));
      const balls = Math.round(runs * (base.runs > 0 ? base.balls / base.runs : 0.8) + lcg(10));
      const wickets = Math.round(base.wickets * 0.35 + lcg(3));
      const ballsBowled = Math.round(wickets * 12 + lcg(24));
      const runsConceded = Math.round(ballsBowled * (base.ballsBowled > 0 ? base.runsConceded / base.ballsBowled : 1.2));
      return {
        M,
        runs,
        balls,
        outs: Math.max(1, Math.round(M * 0.8)),
        hs: Math.max(20, Math.round((base.hs || base.runs) * 0.6 + lcg(15))),
        hundreds: Math.max(0, Math.round((base.hundreds || 0) * 0.2)),
        fifties: Math.max(0, Math.round((base.fifties || 0) * 0.3)),
        wickets,
        ballsBowled,
        runsConceded
      };
    }
    if (format === 'ODI') {
      const M = Math.max(1, Math.round(base.M * 0.35 + lcg(2)));
      const runs = Math.round(base.runs * 0.45 + lcg(50));
      const balls = Math.round(runs * (base.runs > 0 ? (base.balls / base.runs) * 1.2 : 1.1) + lcg(20));
      const wickets = Math.round(base.wickets * 0.4 + lcg(4));
      const ballsBowled = Math.round(wickets * 24 + lcg(36));
      const runsConceded = Math.round(ballsBowled * (base.ballsBowled > 0 ? (base.runsConceded / base.ballsBowled) * 0.85 : 0.9));
      return {
        M,
        runs,
        balls,
        outs: Math.max(1, Math.round(M * 0.8)),
        hs: Math.max(30, Math.round((base.hs || base.runs) * 0.8 + lcg(25))),
        hundreds: Math.max(0, Math.round((base.hundreds || 0) * 0.3)),
        fifties: Math.max(0, Math.round((base.fifties || 0) * 0.4)),
        wickets,
        ballsBowled,
        runsConceded
      };
    }
    if (format === 'TEST') {
      const M = Math.max(1, Math.round(base.M * 0.2 + lcg(2)));
      const runs = Math.round(base.runs * 0.6 + lcg(100));
      const balls = Math.round(runs * (base.runs > 0 ? (base.balls / base.runs) * 1.8 : 1.6) + lcg(50));
      const wickets = Math.round(base.wickets * 0.5 + lcg(6));
      const ballsBowled = Math.round(wickets * 36 + lcg(60));
      const runsConceded = Math.round(ballsBowled * (base.ballsBowled > 0 ? (base.runsConceded / base.ballsBowled) * 0.65 : 0.55));
      return {
        M,
        runs,
        balls,
        outs: Math.max(1, Math.round(M * 1.4)),
        hs: Math.max(40, Math.round((base.hs || base.runs) * 1.1 + lcg(40))),
        hundreds: Math.max(0, Math.round((base.hundreds || 0) * 0.5)),
        fifties: Math.max(0, Math.round((base.fifties || 0) * 0.5)),
        wickets,
        ballsBowled,
        runsConceded
      };
    }
    return {};
  };

  // Aggregate stats
  let careerM = currentSeasonStats.M || 0;
  let careerRuns = currentSeasonStats.runs || 0;
  let careerBalls = currentSeasonStats.balls || 0;
  let careerOuts = currentSeasonStats.outs || 0;
  let careerWickets = currentSeasonStats.wickets || 0;
  let careerRunsConceded = currentSeasonStats.runsConceded || 0;
  let careerBallsBowled = currentSeasonStats.ballsBowled || 0;
  let career100s = currentSeasonStats.hundreds || 0;
  let career50s = currentSeasonStats.fifties || 0;
  let highestScore = currentSeasonStats.hs || 0;

  history.forEach(curr => {
    const s = getStatsForSeason(curr, formatTab);

    careerM += s.M || 0;
    careerRuns += s.runs || 0;
    careerBalls += s.balls || 0;
    careerOuts += s.outs || 0;
    careerWickets += s.wickets || 0;
    careerRunsConceded += s.runsConceded || 0;
    careerBallsBowled += s.ballsBowled || 0;
    career100s += s.hundreds || 0;
    career50s += s.fifties || 0;
    if ((s.hs || s.runs || 0) > highestScore) highestScore = s.hs || s.runs;
  });

  const careerSR = careerBalls > 0 ? ((careerRuns / careerBalls) * 100).toFixed(1) : '0.0';
  const careerOvers = careerBallsBowled / 6;
  const careerEcon = careerOvers > 0 ? (careerRunsConceded / careerOvers).toFixed(2) : '0.00';
  
  const careerBatAvg = careerOuts > 0 ? (careerRuns / careerOuts).toFixed(1) : (careerRuns > 0 ? careerRuns.toFixed(1) : '-');
  const careerBowlAvg = careerWickets > 0 ? (careerRunsConceded / careerWickets).toFixed(1) : '-';

  const careerBatAvgNum = parseFloat(careerBatAvg) || 0;
  const careerSRNum = parseFloat(careerSR) || 0;
  const userCareerRating = careerBatAvgNum * (careerSRNum / 100);

  const iplCareerSeries = useMemo(() => {
    const sortedHistory = [...(history || [])].sort((a, b) => (a.season || 0) - (b.season || 0));
    const completed = sortedHistory.map((seasonEntry) => {
      const stats = getStatsForSeason(seasonEntry, 'IPL');
      const batAvg = (stats.outs || 0) > 0 ? (stats.runs || 0) / stats.outs : 0;
      return {
        season: seasonEntry.season,
        label: `S${seasonEntry.season}`,
        runs: stats.runs || 0,
        wickets: stats.wickets || 0,
        batAvg,
      };
    });

    const currentSeasonNo = (history?.length || 0) + 1;
    const currentBatAvg = (currentSeasonStats.outs || 0) > 0
      ? (currentSeasonStats.runs || 0) / currentSeasonStats.outs
      : 0;

    return [
      ...completed,
      {
        season: currentSeasonNo,
        label: `S${currentSeasonNo}*`,
        runs: currentSeasonStats.runs || 0,
        wickets: currentSeasonStats.wickets || 0,
        batAvg: currentBatAvg,
      },
    ];
  }, [history, currentSeasonStats]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Format Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 rounded-xl border border-zinc-800/80">
        <button
          onClick={() => setFormatTab('IPL')}
          className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-lg font-bold transition-all text-xs tracking-wider uppercase ${formatTab === 'IPL' ? formatConfig.IPL.activeTab : 'text-zinc-400 hover:text-white'}`}
        >
          IPL Franchise
        </button>
        <button
          onClick={() => setFormatTab('T20')}
          className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-lg font-bold transition-all text-xs tracking-wider uppercase ${formatTab === 'T20' ? formatConfig.T20.activeTab : 'text-zinc-400 hover:text-white'}`}
        >
          T20 International
        </button>
        <button
          onClick={() => setFormatTab('ODI')}
          className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-lg font-bold transition-all text-xs tracking-wider uppercase ${formatTab === 'ODI' ? formatConfig.ODI.activeTab : 'text-zinc-400 hover:text-white'}`}
        >
          ODI International
        </button>
        <button
          onClick={() => setFormatTab('TEST')}
          className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-lg font-bold transition-all text-xs tracking-wider uppercase ${formatTab === 'TEST' ? formatConfig.TEST.activeTab : 'text-zinc-400 hover:text-white'}`}
        >
          Test Cricket
        </button>
      </div>

      {/* Career Overview Banner */}
      <div className={`glass-panel rounded-2xl p-8 bg-gradient-to-br ${currentFmt.bg} to-transparent border ${currentFmt.border} transition-all duration-500`}>
        <h2 className={`text-3xl font-black mb-6 tracking-wider flex items-center gap-3 ${currentFmt.text}`}>
          <Star className="w-8 h-8" style={{ filter: `drop-shadow(0 0 10px ${currentFmt.glowStar})` }} /> {userName}'s Career Legacy ({formatTab})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Matches</div>
            <div className="text-2xl font-black font-mono text-zinc-100">{careerM}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Runs</div>
            <div className={`text-2xl font-black font-mono ${currentFmt.text}`}>{careerRuns}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Bat Avg</div>
            <div className={`text-2xl font-black font-mono ${currentFmt.text}`}>{careerBatAvg}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Strike Rate</div>
            <div className={`text-2xl font-black font-mono ${currentFmt.text}`}>{careerSR}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Highest Score</div>
            <div className={`text-2xl font-black font-mono ${currentFmt.text}`}>{highestScore || '-'}</div>
          </div>

          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Wickets</div>
            <div className="text-2xl font-black font-mono text-fuchsia-400">{careerWickets}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Bowl Avg</div>
            <div className="text-2xl font-black font-mono text-fuchsia-400">{careerBowlAvg}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Economy</div>
            <div className="text-2xl font-black font-mono text-fuchsia-400">{careerEcon}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Centuries</div>
            <div className="text-2xl font-black font-mono text-zinc-100">{career100s}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Fifties</div>
            <div className="text-2xl font-black font-mono text-zinc-100">{career50s}</div>
          </div>
        </div>
      </div>

      {formatTab === 'IPL' && <IPLCareerGraph series={iplCareerSeries} />}

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setSubTab('trophies')}
          className={`flex items-center gap-2 px-6 py-3 text-xs tracking-widest font-black uppercase transition-all border-b-2 ${subTab === 'trophies' ? 'border-amber-500 text-amber-500 bg-amber-500/[0.03]' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <Trophy className="w-4 h-4" />
          Trophy Room &amp; Records
        </button>
        
        <button
          onClick={() => setSubTab('seasons')}
          className={`flex items-center gap-2 px-6 py-3 text-xs tracking-widest font-black uppercase transition-all border-b-2 ${subTab === 'seasons' ? 'border-amber-500 text-amber-500 bg-amber-500/[0.03]' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <Calendar className="w-4 h-4" />
          Season History
        </button>
      </div>

      {/* SUBTAB 1: TROPHIES & ALL-TIME RECORDS */}
      {subTab === 'trophies' && (
        <div className="space-y-6">
          
          {/* Trophy Cabinet Grid */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/50">
            <h3 className="text-sm tracking-[0.3em] text-zinc-400 mb-6 font-black uppercase flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Captain's Trophy Cabinet
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACH_METADATA.map(ach => {
                const IconComp = ach.icon;
                const isUnlocked = unlockedAchievements.includes(ach.key);
                
                return (
                  <div
                    key={ach.key}
                    className={`rounded-xl p-5 border transition-all duration-300 flex items-start gap-4 relative overflow-hidden ${isUnlocked ? `${ach.color} shadow-lg scale-100 hover:scale-[1.02]` : 'bg-black/20 border-zinc-900 text-zinc-600 opacity-60'}`}
                  >
                    {isUnlocked && (
                      <div className="absolute inset-0 bg-white/[0.02] pointer-events-none animate-pulse" />
                    )}
                    
                    <div className={`p-3 rounded-lg border ${isUnlocked ? 'border-current bg-black/40 shadow-inner' : 'border-zinc-800 text-zinc-700 bg-black/10'}`}>
                      <IconComp className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm uppercase tracking-wide ${isUnlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>
                          {ach.name}
                        </span>
                        {!isUnlocked && (
                          <span className="text-[7px] font-black font-mono tracking-widest bg-zinc-800 text-zinc-500 px-1 py-0.5 rounded border border-zinc-700 uppercase">
                            LOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {ach.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hall of Fame Permanent Records */}
          {Object.keys(hallOfFame).length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-zinc-800/50">
              <h3 className="text-sm tracking-[0.3em] text-zinc-400 mb-6 font-black uppercase flex items-center gap-2">
                <Star className="w-4 h-4 text-fuchsia-400 animate-pulse" /> SPL Hall of Fame (All-Time Records)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                
                {/* 1. Highest Team Total */}
                <div className="bg-black/40 border border-zinc-850 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 tracking-widest block uppercase">Highest Team Total</span>
                    <span className="text-2xl font-black font-mono text-zinc-100 mt-1 block">
                      {hallOfFame.highestTeamTotal?.runs || 0}/{hallOfFame.highestTeamTotal?.wickets || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-zinc-800/50 pt-2 font-mono">
                    <span>{hallOfFame.highestTeamTotal?.team} <span className="text-zinc-600">vs</span> {hallOfFame.highestTeamTotal?.opponent}</span>
                    <span className="text-amber-500 text-[10px]">Season {hallOfFame.highestTeamTotal?.season}</span>
                  </div>
                </div>

                {/* 2. Lowest Team Total */}
                <div className="bg-black/40 border border-zinc-850 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 tracking-widest block uppercase">Lowest Team Total</span>
                    <span className="text-2xl font-black font-mono text-red-400 mt-1 block">
                      {hallOfFame.lowestTeamTotal?.runs || 0} All Out
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-zinc-800/50 pt-2 font-mono">
                    <span>{hallOfFame.lowestTeamTotal?.team} <span className="text-zinc-600">vs</span> {hallOfFame.lowestTeamTotal?.opponent}</span>
                    <span className="text-amber-500 text-[10px]">Season {hallOfFame.lowestTeamTotal?.season}</span>
                  </div>
                </div>

                {/* 3. Highest User Runs */}
                <div className="bg-black/40 border border-zinc-850 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-amber-500 tracking-widest block uppercase">Your Highest Score</span>
                    <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                      {hallOfFame.highestUserRuns?.runs}* <span className="text-xs font-normal text-zinc-500 font-sans">({hallOfFame.highestUserRuns?.balls} balls)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-zinc-800/50 pt-2 font-mono">
                    <span>vs {hallOfFame.highestUserRuns?.opponent}</span>
                    <span className="text-amber-500 text-[10px]">{typeof hallOfFame.highestUserRuns?.season === 'number' ? `Season ${hallOfFame.highestUserRuns.season}` : hallOfFame.highestUserRuns?.season}</span>
                  </div>
                </div>

                {/* 4. Best User Bowling */}
                <div className="bg-black/40 border border-zinc-850 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-fuchsia-400 tracking-widest block uppercase">Your Best Bowling</span>
                    <span className="text-2xl font-black font-mono text-fuchsia-400 mt-1 block">
                      {hallOfFame.bestUserBowling?.wickets}/{hallOfFame.bestUserBowling?.runs}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-zinc-800/50 pt-2 font-mono">
                    <span>vs {hallOfFame.bestUserBowling?.opponent}</span>
                    <span className="text-amber-500 text-[10px]">{typeof hallOfFame.bestUserBowling?.season === 'number' ? `Season ${hallOfFame.bestUserBowling.season}` : hallOfFame.bestUserBowling?.season}</span>
                  </div>
                </div>

                {/* 5. Most User Sixes */}
                <div className="bg-black/40 border border-zinc-850 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-amber-500 tracking-widest block uppercase">Most Sixes in Match</span>
                    <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                      {hallOfFame.mostUserSixesInMatch?.sixes} Sixes
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-zinc-800/50 pt-2 font-mono">
                    <span>vs {hallOfFame.mostUserSixesInMatch?.opponent}</span>
                    <span className="text-amber-500 text-[10px]">{typeof hallOfFame.mostUserSixesInMatch?.season === 'number' ? `Season ${hallOfFame.mostUserSixesInMatch.season}` : hallOfFame.mostUserSixesInMatch?.season}</span>
                  </div>
                </div>

                {/* 6. Fastest Fifty */}
                <div className="bg-black/40 border border-zinc-850 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 tracking-widest block uppercase">Fastest Fifty (Overall)</span>
                    <span className="text-2xl font-black font-mono text-zinc-100 mt-1 block">
                      {hallOfFame.fastestFifty?.balls} balls
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-zinc-800/50 pt-2 font-mono">
                    <span>{hallOfFame.fastestFifty?.player} ({hallOfFame.fastestFifty?.team})</span>
                    <span className="text-amber-500 text-[10px]">Season {hallOfFame.fastestFifty?.season}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Rise of the Franchise Icon/International Legend Progression Panel */}
          {(() => {
            const benchmarkVal = formatTab === 'IPL' ? 62.2 : 75.0;
            const isIcon = userCareerRating >= benchmarkVal;
            const progressPercent = Math.min(100, Math.round((userCareerRating / benchmarkVal) * 100)) || 0;
            
            const badgeClasses = {
              IPL: isIcon ? 'border-amber-400 text-amber-400 bg-amber-500/10 animate-pulse' : 'border-zinc-800 text-zinc-650 bg-black/40',
              T20: isIcon ? 'border-blue-400 text-blue-400 bg-blue-500/10 animate-pulse' : 'border-zinc-800 text-zinc-650 bg-black/40',
              ODI: isIcon ? 'border-sky-400 text-sky-400 bg-sky-500/10 animate-pulse' : 'border-zinc-800 text-zinc-650 bg-black/40',
              TEST: isIcon ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 animate-pulse' : 'border-zinc-800 text-zinc-650 bg-black/40'
            };

            const gradClasses = {
              IPL: 'bg-gradient-to-br from-zinc-950 via-zinc-950 to-amber-950/20',
              T20: 'bg-gradient-to-br from-zinc-950 via-zinc-950 to-blue-950/20',
              ODI: 'bg-gradient-to-br from-zinc-950 via-zinc-950 to-sky-950/20',
              TEST: 'bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950/20'
            };

            const shineBg = {
              IPL: 'bg-amber-500/5',
              T20: 'bg-blue-500/5',
              ODI: 'bg-sky-500/5',
              TEST: 'bg-emerald-500/5'
            };

            const crownGlow = {
              IPL: isIcon ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]' : '',
              T20: isIcon ? 'drop-shadow-[0_0_15px_rgba(37,99,235,0.6)]' : '',
              ODI: isIcon ? 'drop-shadow-[0_0_15px_rgba(14,165,233,0.6)]' : '',
              TEST: isIcon ? 'drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]' : ''
            };

            return (
              <div className={`glass-panel rounded-2xl p-6 border border-zinc-800/50 relative overflow-hidden ${gradClasses[formatTab]}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${shineBg[formatTab]} blur-[40px] rounded-full pointer-events-none`} />
                <h3 className="text-sm tracking-[0.3em] text-zinc-400 mb-6 font-black uppercase flex items-center gap-2">
                  <Star className={`w-4 h-4 ${currentFmt.text} animate-spin`} /> 
                  {formatTab === 'IPL' ? 'Path to Franchise Icon Status' : 'Path to International Legend Status'}
                </h3>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Badge Icon */}
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 shadow-2xl relative ${badgeClasses[formatTab]}`}>
                    <Crown className={`w-10 h-10 ${crownGlow[formatTab]}`} />
                    <div className="absolute -bottom-2 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded text-[8px] font-black tracking-widest text-zinc-300 font-mono">
                      {isIcon ? (formatTab === 'IPL' ? 'ACTIVE ICON' : 'LEGEND') : 'CONTENDER'}
                    </div>
                  </div>

                  {/* Progress and Stats */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-extrabold text-base text-zinc-100 flex items-center gap-2">
                          {isIcon 
                            ? (formatTab === 'IPL' ? '🎉 You are a Franchise Icon!' : '🎉 You are an International Legend!')
                            : (formatTab === 'IPL' ? 'Chasing Gaikwad & Dhoni' : 'Chasing Virat Kohli')
                          }
                        </h4>
                        <p className="text-xs text-zinc-450 leading-normal mt-0.5">
                          {isIcon 
                            ? (formatTab === 'IPL' 
                              ? `Congratulations! Your legendary career rating of ${userCareerRating.toFixed(1)} makes you the dynamic #1 superstar player for ${userTeam}.`
                              : `Congratulations! Your legendary career rating of ${userCareerRating.toFixed(1)} makes you an international cricketing legend.`)
                            : (formatTab === 'IPL'
                              ? `Increase your career batting average and strike rate to surpass Ruturaj Gaikwad's benchmark rating of 62.2.`
                              : `Increase your career batting average and strike rate to surpass Virat Kohli's benchmark rating of 75.0.`)
                          }
                        </p>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <span className={`text-xl font-black ${currentFmt.text}`}>{progressPercent}%</span>
                        <span className="text-[9px] text-zinc-500 block tracking-wider uppercase font-bold">Hype Progress</span>
                      </div>
                    </div>

                    <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800 flex shadow-inner">
                      <div className={`bg-gradient-to-r ${currentFmt.bar} h-full transition-all duration-1000`} style={{ width: `${progressPercent}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                      <span>Your Career Rating: <strong className="text-zinc-350">{userCareerRating.toFixed(1)}</strong></span>
                      <span>{formatTab === 'IPL' ? `${userTeam} Icon Benchmark: 62.2` : 'IND Legend Benchmark: 75.0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* All-Time Rivalry Meter (Only for IPL) */}
          {formatTab === 'IPL' ? (
            <div className="glass-panel rounded-2xl p-6 border border-zinc-800/50">
              <h3 className="text-sm tracking-[0.3em] text-zinc-400 mb-6 font-black uppercase flex items-center gap-2">
                <Target className="w-4 h-4 text-fuchsia-400 animate-pulse" /> Franchise Rivalry Meter (All-Time)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(careerRivalries || {})
                  .sort((a, b) => (b[1].wins + b[1].losses) - (a[1].wins + a[1].losses))
                  .map(([oppId, stats]) => {
                  const opp = getTeam(oppId);
                  const total = stats.wins + stats.losses;
                  const winPct = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
                  return (
                    <div key={oppId} className="bg-black/40 rounded-xl p-5 border border-zinc-800/80 hover:border-zinc-700 transition-colors relative overflow-hidden">
                      <div 
                        className="absolute inset-0 opacity-[0.03] z-0"
                        style={{ background: `linear-gradient(135deg, ${opp.primary}, transparent)` }}
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-9 h-9 rounded flex items-center justify-center font-black text-xs text-white shadow-lg border"
                              style={{ backgroundColor: opp.primary, borderColor: opp.dark }}
                            >
                              {opp.short}
                            </div>
                            <div className="font-bold text-sm text-zinc-200">vs {opp.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black font-mono" style={{ color: winPct >= 50 ? '#34d399' : '#f87171' }}>{winPct}%</div>
                            <div className="text-[9px] tracking-wider text-zinc-500 uppercase font-semibold">Win Rate</div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-zinc-900 rounded-full h-2 mb-3 overflow-hidden flex shadow-inner">
                          <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${winPct}%` }}></div>
                          <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${100 - winPct}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between text-xs font-mono">
                          <div className="text-emerald-450 font-bold">{stats.wins} WINS</div>
                          <div className="text-zinc-650">|</div>
                          <div className="text-red-400 font-bold">{stats.losses} LOSSES</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 border border-zinc-800/50 text-center py-8 text-zinc-500 text-xs tracking-wider uppercase font-bold">
              Rivalry meter is only tracked for IPL Franchise matches.
            </div>
          )}

        </div>
      )}

      {/* SUBTAB 2: SEASON BY SEASON LOGS */}
      {subTab === 'seasons' && (
        <div className="space-y-4">
          {/* Active Ongoing Season Card */}
          {(() => {
            const nextSeasonNum = history.length + 1;
            const seasonSR = currentSeasonStats.balls > 0 ? ((currentSeasonStats.runs / currentSeasonStats.balls) * 100).toFixed(1) : '0.0';
            const seasonOvers = currentSeasonStats.ballsBowled ? currentSeasonStats.ballsBowled / 6 : 0;
            const seasonEcon = seasonOvers > 0 ? (currentSeasonStats.runsConceded / seasonOvers).toFixed(2) : '0.00';
            const seasonBatAvg = currentSeasonStats.outs > 0 ? (currentSeasonStats.runs / currentSeasonStats.outs).toFixed(1) : (currentSeasonStats.runs > 0 ? currentSeasonStats.runs.toFixed(1) : '-');
            const seasonBowlAvg = currentSeasonStats.wickets > 0 ? (currentSeasonStats.runsConceded / currentSeasonStats.wickets).toFixed(1) : '-';

            return (
              <div key="current" className={`glass-panel rounded-xl overflow-hidden flex flex-col lg:flex-row border border-blue-500/30 bg-blue-500/[0.01] hover:border-blue-500/50 transition-colors`}>
                <div 
                  className="p-6 lg:w-1/4 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-800"
                  style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent)' }}
                >
                  <div className="text-xs tracking-[0.2em] text-blue-400 mb-1 flex items-center gap-1 font-bold uppercase">
                    <Activity className="w-3 h-3 animate-pulse" /> Season {nextSeasonNum} (Ongoing)
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-black text-xl text-zinc-100" style={{ fontFamily: 'Bebas Neue', letterSpacing: '1px' }}>
                      {getTeam(userTeam).name}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 lg:w-3/4 grid grid-cols-1 xl:grid-cols-5 gap-6">
                  <div className="xl:col-span-2 space-y-4">
                    <div className="bg-black/30 rounded-lg p-3 border border-orange-500/20">
                      <div className="text-[10px] tracking-wider text-orange-500 mb-1 flex items-center gap-1 font-bold">
                        <Crown className="w-3 h-3" /> ORANGE CAP (LIVE)
                      </div>
                      <div className="font-bold text-sm text-zinc-200">{currentOrangeCap.name}</div>
                      <div className="text-xs text-zinc-400">{currentOrangeCap.runs} runs</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border border-fuchsia-500/20">
                      <div className="text-[10px] tracking-wider text-fuchsia-400 mb-1 flex items-center gap-1 font-bold">
                        <Target className="w-3 h-3" /> PURPLE CAP (LIVE)
                      </div>
                      <div className="font-bold text-sm text-zinc-200">{currentPurpleCap.name}</div>
                      <div className="text-xs text-zinc-400">{currentPurpleCap.wickets} wickets</div>
                    </div>
                  </div>

                  <div className="xl:col-span-3 bg-black/40 rounded-xl p-5 border border-zinc-800">
                    <div className={`text-[10px] tracking-wider mb-3 border-b border-zinc-800/50 pb-2 uppercase font-bold flex justify-between items-center ${currentFmt.text}`}>
                      <span>Your Performance</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest border uppercase ${currentFmt.badge}`}>
                        {formatTab === 'IPL' ? 'IPL Franchise' : `${formatTab} International`}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                      <div>
                        <div className="text-[10px] text-zinc-500 tracking-wider">RUNS</div>
                        <div className={`font-mono font-bold text-lg ${currentFmt.text}`}>{currentSeasonStats.runs || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 tracking-wider">BAT AVG</div>
                        <div className={`font-mono font-bold text-lg ${currentFmt.text}`}>{seasonBatAvg}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 tracking-wider">SR</div>
                        <div className="font-mono font-bold text-zinc-200 text-lg">{seasonSR}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 tracking-wider">HIGHEST</div>
                        <div className="font-mono font-bold text-zinc-200 text-sm">{currentSeasonStats.hs || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 tracking-wider">100/50</div>
                        <div className="font-mono font-bold text-zinc-200 text-sm">{currentSeasonStats.hundreds || 0}/{currentSeasonStats.fifties || 0}</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-zinc-500 tracking-wider">WICKETS</div>
                        <div className="font-mono font-bold text-fuchsia-400 text-lg">{currentSeasonStats.wickets || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 tracking-wider">BOWL AVG</div>
                        <div className="font-mono font-bold text-fuchsia-400 text-lg">{seasonBowlAvg}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 tracking-wider">ECON</div>
                        <div className="font-mono font-bold text-zinc-200 text-lg">{seasonEcon}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 tracking-wider">MATCHES</div>
                        <div className="font-mono font-bold text-zinc-200 text-sm">{currentSeasonStats.M || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {history.length === 0 ? (
            <div className="text-zinc-500 text-sm py-8 text-center glass-panel rounded-2xl">
              Complete your first season to see older historical logs.
            </div>
          ) : (
            history.slice().reverse().map(season => {
              const champ = getTeam(season.champion);
              
              const s = getStatsForSeason(season, formatTab);

              const seasonSR = s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : (s.sr || '0.0');
              const seasonOvers = s.ballsBowled ? s.ballsBowled / 6 : 0;
              const seasonEcon = seasonOvers > 0 ? (s.runsConceded / seasonOvers).toFixed(2) : (s.econ || '0.00');
              const seasonBatAvg = s.outs > 0 ? (s.runs / s.outs).toFixed(1) : (s.runs > 0 ? s.runs.toFixed(1) : '-');
              const seasonBowlAvg = s.wickets > 0 ? (s.runsConceded / s.wickets).toFixed(1) : '-';

              const cardBorder = {
                IPL: 'hover:border-amber-500/20',
                T20: 'hover:border-blue-500/20',
                ODI: 'hover:border-sky-500/20',
                TEST: 'hover:border-emerald-500/20'
              };

              return (
                <div key={season.season} className={`glass-panel rounded-xl overflow-hidden flex flex-col lg:flex-row border border-zinc-800/50 ${cardBorder[formatTab]} transition-colors`}>
                  <div 
                    className="p-6 lg:w-1/4 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-800"
                    style={{ background: `linear-gradient(135deg, ${champ.primary}22, transparent)` }}
                  >
                    <div className="text-xs tracking-[0.2em] text-zinc-400 mb-1">SEASON {season.season}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-lg animate-bounce" />
                      <span className="font-black text-xl text-zinc-100" style={{ fontFamily: 'Bebas Neue', letterSpacing: '1px' }}>
                        {champ.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 lg:w-3/4 grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="xl:col-span-2 space-y-4">
                      <div className="bg-black/30 rounded-lg p-3 border border-orange-500/20">
                        <div className="text-[10px] tracking-wider text-orange-500 mb-1 flex items-center gap-1 font-bold">
                          <Crown className="w-3 h-3" /> ORANGE CAP
                        </div>
                        <div className="font-bold text-sm text-zinc-200">{season.orangeCap?.name || 'Unknown'}</div>
                        <div className="text-xs text-zinc-400">{season.orangeCap?.runs || 0} runs</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 border border-fuchsia-500/20">
                        <div className="text-[10px] tracking-wider text-fuchsia-400 mb-1 flex items-center gap-1 font-bold">
                          <Target className="w-3 h-3" /> PURPLE CAP
                        </div>
                        <div className="font-bold text-sm text-zinc-200">{season.purpleCap?.name || 'Unknown'}</div>
                        <div className="text-xs text-zinc-400">{season.purpleCap?.wickets || 0} wickets</div>
                      </div>
                    </div>

                    <div className="xl:col-span-3 bg-black/40 rounded-xl p-5 border border-zinc-800">
                      <div className={`text-[10px] tracking-wider mb-3 border-b border-zinc-800/50 pb-2 uppercase font-bold flex justify-between items-center ${currentFmt.text}`}>
                        <span>Your Performance</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest border uppercase ${currentFmt.badge}`}>
                          {formatTab === 'IPL' ? 'IPL Franchise' : `${formatTab} International`}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">RUNS</div>
                          <div className={`font-mono font-bold text-lg ${currentFmt.text}`}>{s.runs || 0}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">BAT AVG</div>
                          <div className={`font-mono font-bold text-lg ${currentFmt.text}`}>{seasonBatAvg}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">SR</div>
                          <div className="font-mono font-bold text-zinc-200 text-lg">{seasonSR}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">HIGHEST</div>
                          <div className="font-mono font-bold text-zinc-200 text-sm">{s.hs || s.runs || 0}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">100/50</div>
                          <div className="font-mono font-bold text-zinc-200 text-sm">{s.hundreds || 0}/{s.fifties || 0}</div>
                        </div>

                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">WICKETS</div>
                          <div className="font-mono font-bold text-fuchsia-400 text-lg">{s.wickets || 0}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">BOWL AVG</div>
                          <div className="font-mono font-bold text-fuchsia-400 text-lg">{seasonBowlAvg}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">ECON</div>
                          <div className="font-mono font-bold text-zinc-200 text-lg">{seasonEcon}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">MATCHES</div>
                          <div className="font-mono font-bold text-zinc-200 text-sm">{s.M || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
