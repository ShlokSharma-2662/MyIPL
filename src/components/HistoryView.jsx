import React, { useState } from 'react';
import { Trophy, Crown, Star, Target, ShieldAlert, Award, Calendar, Flame } from 'lucide-react';
import { TEAMS } from '../data';

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

export default function HistoryView({ userName, history = [], careerRivalries = {}, hallOfFame = {}, unlockedAchievements = [] }) {
  const [subTab, setSubTab] = useState('trophies'); // trophies | seasons

  const getTeam = (id) => TEAMS.find(t => t.id === id) || { name: id, primary: '#333', short: id };

  // Aggregate stats
  let careerM = 0;
  let careerRuns = 0;
  let careerBalls = 0;
  let careerOuts = 0;
  let careerWickets = 0;
  let careerRunsConceded = 0;
  let careerBallsBowled = 0;
  let career100s = 0;
  let career50s = 0;
  let highestScore = 0;

  history.forEach(curr => {
    const s = curr.playerStats || {};
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Career Overview Banner */}
      <div className="glass-panel rounded-2xl p-8 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30">
        <h2 className="text-3xl font-black mb-6 tracking-wider flex items-center gap-3 text-amber-400">
          <Star className="w-8 h-8 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" /> {userName}'s Career Legacy
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Matches</div>
            <div className="text-2xl font-black font-mono text-zinc-100">{careerM}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Runs</div>
            <div className="text-2xl font-black font-mono text-amber-400">{careerRuns}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Bat Avg</div>
            <div className="text-2xl font-black font-mono text-amber-400">{careerBatAvg}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Strike Rate</div>
            <div className="text-2xl font-black font-mono text-amber-400">{careerSR}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase font-bold">Highest Score</div>
            <div className="text-2xl font-black font-mono text-amber-400">{highestScore || '-'}</div>
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

          {/* All-Time Rivalry Meter */}
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
                        <div className="text-emerald-400 font-bold">{stats.wins} WINS</div>
                        <div className="text-zinc-600">|</div>
                        <div className="text-red-400 font-bold">{stats.losses} LOSSES</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: SEASON BY SEASON LOGS */}
      {subTab === 'seasons' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-zinc-500 text-sm py-8 text-center glass-panel rounded-2xl">
              Complete your first season to see historical logs.
            </div>
          ) : (
            history.slice().reverse().map(season => {
              const champ = getTeam(season.champion);
              const s = season.playerStats || {};
              const seasonSR = s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : (s.sr || '0.0');
              const seasonOvers = s.ballsBowled ? s.ballsBowled / 6 : 0;
              const seasonEcon = seasonOvers > 0 ? (s.runsConceded / seasonOvers).toFixed(2) : (s.econ || '0.00');
              const seasonBatAvg = s.outs > 0 ? (s.runs / s.outs).toFixed(1) : (s.runs > 0 ? s.runs.toFixed(1) : '-');
              const seasonBowlAvg = s.wickets > 0 ? (s.runsConceded / s.wickets).toFixed(1) : '-';

              return (
                <div key={season.season} className="glass-panel rounded-xl overflow-hidden flex flex-col lg:flex-row border border-zinc-800/50 hover:border-amber-500/20 transition-colors">
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
                      <div className="text-[10px] tracking-wider text-amber-500/70 mb-3 border-b border-zinc-800/50 pb-2 uppercase font-bold">
                        Your Performance
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">RUNS</div>
                          <div className="font-mono font-bold text-amber-400 text-lg">{s.runs || 0}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 tracking-wider">BAT AVG</div>
                          <div className="font-mono font-bold text-amber-400 text-lg">{seasonBatAvg}</div>
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
