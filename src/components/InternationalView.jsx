import React, { useState, useMemo } from 'react';
import { Trophy, Globe, Calendar, Award, Play, Zap, BarChart3, ChevronRight, RefreshCw, Star } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { INTERNATIONAL_TEAMS } from '../internationalData';

export default function InternationalView({ state, actions }) {
  const {
    userName,
    userTeam,
    internationalSchedule = [],
    internationalResults = [],
    internationalPlayerStats = {}
  } = state;

  const {
    simNext,
    sim10,
    simAll,
    completeInternationalSeason,
    onOpenMatch
  } = actions;

  const [statsTab, setStatsTab] = useState('batting'); // batting | bowling

  const completedCount = internationalResults.length;
  const totalCount = internationalSchedule.length;
  const isFinished = completedCount >= totalCount;

  const nextMatch = isFinished ? null : internationalSchedule[completedCount];
  const nextOpponent = nextMatch ? INTERNATIONAL_TEAMS.find(t => t.id === nextMatch.away) : null;

  // Calculate Series Standings
  const standings = useMemo(() => {
    let t20AusWin = 0, t20AusLoss = 0, t20PakWin = 0, t20PakLoss = 0;
    let odiEngWin = 0, odiEngLoss = 0, odiNzWin = 0, odiNzLoss = 0;
    let testRsaWin = 0, testRsaLoss = 0, testAusWin = 0, testAusLoss = 0;
    let testRsaDraws = 0, testAusDraws = 0;

    internationalResults.forEach(m => {
      const isWin = m.winner === 'IND';
      const isDraw = m.marginType === 'Draw';
      if (m.label.includes('T20I')) {
        if (m.away === 'AUS') {
          if (isWin) t20AusWin++; else t20AusLoss++;
        } else if (m.away === 'PAK') {
          if (isWin) t20PakWin++; else t20PakLoss++;
        }
      } else if (m.label.includes('ODI')) {
        if (m.away === 'ENG') {
          if (isWin) odiEngWin++; else odiEngLoss++;
        } else if (m.away === 'NZ') {
          if (isWin) odiNzWin++; else odiNzLoss++;
        }
      } else if (m.label.includes('Test')) {
        if (m.away === 'RSA') {
          if (isDraw) testRsaDraws++; else if (isWin) testRsaWin++; else testRsaLoss++;
        } else if (m.away === 'AUS') {
          if (isDraw) testAusDraws++; else if (isWin) testAusWin++; else testAusLoss++;
        }
      }
    });

    return {
      t20Aus: { win: t20AusWin, loss: t20AusLoss, opponent: 'AUS', total: 3, label: '3-Match T20I Series vs Australia' },
      t20Pak: { win: t20PakWin, loss: t20PakLoss, opponent: 'PAK', total: 2, label: '2-Match T20I Series vs Pakistan' },
      odiEng: { win: odiEngWin, loss: odiEngLoss, opponent: 'ENG', total: 3, label: '3-Match ODI Series vs England' },
      odiNz: { win: odiNzWin, loss: odiNzLoss, opponent: 'NZ', total: 2, label: '2-Match ODI Series vs New Zealand' },
      testRsa: { win: testRsaWin, loss: testRsaLoss, draw: testRsaDraws, opponent: 'RSA', total: 2, label: '2-Match Test Series vs South Africa' },
      testAus: { win: testAusWin, loss: testAusLoss, draw: testAusDraws, opponent: 'AUS', total: 1, label: 'Bilateral Test vs Australia' }
    };
  }, [internationalResults]);

  // Player Stats Leaderboard
  const leaderboards = useMemo(() => {
    const list = Object.values(internationalPlayerStats || {});
    const batting = [...list]
      .filter(s => s.runs > 0)
      .sort((a, b) => b.runs - a.runs || b.runs / Math.max(1, b.balls) - a.runs / Math.max(1, a.balls));

    const bowling = [...list]
      .filter(s => s.ballsBowled > 0 || s.wkts > 0)
      .sort((a, b) => b.wkts - a.wkts || a.runsConceded / Math.max(1, a.ballsBowled / 6) - b.runsConceded / Math.max(1, b.ballsBowled / 6));

    return { batting, bowling };
  }, [internationalPlayerStats]);

  const getFormatBadge = (fmt) => {
    const styles = {
      T20: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      ODI: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      TEST: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[fmt] || styles.T20}`}>
        {fmt}
      </span>
    );
  };

  const getSeriesSummaryText = (series) => {
    const played = series.win + series.loss + (series.draw || 0);
    if (played === 0) return 'Not Started';
    const drawStr = series.draw ? `, ${series.draw} Drawn` : '';
    if (series.win > series.loss) return `IND leads ${series.win}-${series.loss}${drawStr}`;
    if (series.loss > series.win) return `IND trails ${series.loss}-${series.win}${drawStr}`;
    return `Series Tied ${series.win}-${series.loss}${drawStr}`;
  };

  return (
    <div className="max-w-7xl mx-auto py-2 animate-fade-in">
      {/* Title Hero */}
      <div className="relative overflow-hidden glass-panel border border-blue-500/30 rounded-2xl p-6 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-gradient-to-r from-blue-950/20 to-indigo-950/20">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
        <div className="absolute -right-16 -top-16 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] tracking-[0.35em] text-blue-400 font-extrabold mb-1">GLOBAL TOURS</div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.03em' }}>
              INTERNATIONAL SEASON (REST OF THE YEAR)
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Step away from the franchise IPL and represent **India (IND)** in multi-format bilateral series across the globe. Maintain your RPG upgrades and build your international stats.
            </p>
          </div>
          
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-center shrink-0">
            <div className="text-[9px] tracking-widest text-zinc-400 font-bold uppercase">Tour Progress</div>
            <div className="text-2xl font-black font-mono mt-0.5 text-blue-400">
              {completedCount} <span className="text-zinc-500">/</span> {totalCount}
            </div>
            <div className="w-24 bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden mx-auto">
              <div 
                className="bg-blue-500 h-full transition-all duration-500" 
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Next Match & Fixtures */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Next Match Panel */}
          <div className="glass-panel border border-zinc-800 rounded-xl p-5 relative overflow-hidden bg-black/30">
            {isFinished ? (
              <div className="text-center py-6">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-bounce" />
                <h3 className="text-xl font-bold text-zinc-100">International Season Completed!</h3>
                <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                  Congratulations on finishing the Rest of the Year tour representing India! You can now review your player stats and return to start the next franchise IPL season.
                </p>
                <button
                  onClick={completeInternationalSeason}
                  className="mt-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl tracking-wider text-xs transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20"
                >
                  🚀 RETURN TO IPL FRANCHISE
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold tracking-wider text-zinc-300">UPCOMING MATCH</span>
                  </div>
                  {getFormatBadge(nextMatch.format)}
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  {/* IND */}
                  <div className="flex flex-col items-center flex-1 text-center">
                    <TeamBadge teamId="IND" size="lg" />
                    <span className="text-sm font-bold mt-2 text-zinc-200">India</span>
                    <span className="text-[10px] text-blue-400 font-bold uppercase mt-0.5">Your Team</span>
                  </div>

                  {/* VS */}
                  <div className="text-center shrink-0 flex flex-col items-center">
                    <div className="bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-full text-xs font-mono font-bold text-zinc-400">
                      {nextMatch.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-wider">Toss Pending</div>
                  </div>

                  {/* Opponent */}
                  <div className="flex flex-col items-center flex-1 text-center">
                    <TeamBadge teamId={nextMatch.away} size="lg" />
                    <span className="text-sm font-bold mt-2 text-zinc-200">{nextOpponent?.name || nextMatch.away}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase">Opponent</span>
                  </div>
                </div>

                {/* RPG upgrades alert */}
                <div className="mt-4 flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 rounded-lg p-2.5 text-[11px] text-blue-300 font-medium">
                  <Star className="w-3.5 h-3.5 fill-blue-400/20 text-blue-400" />
                  Your Opener RPG traits and skills are active. Ready to bat!
                </div>

                {/* Simulation Control Buttons */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <button
                    onClick={simNext}
                    className="col-span-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-bold py-3 px-2 rounded-xl text-xs tracking-wider transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> PLAY / PREVIEW
                  </button>
                  <button
                    onClick={() => sim10()}
                    className="col-span-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-bold py-3 px-2 rounded-xl text-xs tracking-wider transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 text-zinc-400" /> SIM NEXT 10
                  </button>
                  <button
                    onClick={() => simAll()}
                    className="col-span-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3 px-2 rounded-xl text-xs tracking-wider transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15"
                  >
                    🚀 SIM TOUR REST
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fixture Calendar */}
          <div className="glass-panel border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-bold tracking-wider text-zinc-200 mb-4 uppercase">Season Fixture Calendar</h3>
            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
              {internationalSchedule.map((m, idx) => {
                const isCompleted = idx < completedCount;
                const isNext = idx === completedCount;
                const matchResult = isCompleted ? internationalResults[idx] : null;
                const opponent = INTERNATIONAL_TEAMS.find(t => t.id === m.away);

                return (
                  <div 
                    key={idx}
                    onClick={() => isCompleted && onOpenMatch && onOpenMatch(matchResult)}
                    className={`flex items-center justify-between gap-4 p-3 rounded-lg border text-xs transition-all
                      ${isNext ? 'border-blue-500/40 bg-blue-500/5 shadow-md shadow-blue-500/5' : 'border-zinc-800/80 bg-zinc-950/20 hover:border-zinc-700/50'}
                      ${isCompleted ? 'opacity-85 cursor-pointer hover:bg-zinc-900/50 hover:border-blue-500/30' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-[10px] text-zinc-400">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-200">{m.label}</span>
                          {getFormatBadge(m.format)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          vs {opponent?.name || m.away}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isCompleted ? (
                        <div className="text-right">
                          <span className={`font-black uppercase tracking-wider text-[10px] ${matchResult?.winner === 'IND' ? 'text-green-400' : 'text-red-400'}`}>
                            {matchResult?.winner === 'IND' ? 'WON' : matchResult?.winner ? 'LOST' : 'DRAWN'}
                          </span>
                          <div className="text-[9px] text-zinc-500 font-mono mt-0.5">
                            {matchResult?.winner ? `${matchResult.winner === 'IND' ? 'By' : 'To'} ${matchResult.margin} ${matchResult.marginType}` : 'Match Drawn'}
                          </div>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-bold tracking-wider ${isNext ? 'text-blue-400 animate-pulse' : 'text-zinc-500'}`}>
                          {isNext ? 'LIVE NEXT' : 'UPCOMING'}
                        </span>
                      )}
                      <TeamBadge teamId={m.away} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Standings & Player Leaderboards */}
        <div className="flex flex-col gap-6">
          
          {/* Series Standings Widget */}
          <div className="glass-panel border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-bold tracking-wider text-zinc-200 mb-4 uppercase">Bilateral Standings</h3>
            <div className="flex flex-col gap-4">
              {Object.values(standings).map((series, idx) => {
                const opponent = INTERNATIONAL_TEAMS.find(t => t.id === series.opponent);
                const progress = ((series.win + series.loss + (series.draw || 0)) / series.total) * 100;
                
                return (
                  <div key={idx} className="border-b border-zinc-900 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <TeamBadge teamId={series.opponent} size="sm" />
                        <span className="text-[11px] font-bold text-zinc-300 leading-none">{series.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mt-1">
                      <span>{getSeriesSummaryText(series)}</span>
                      <span className="text-zinc-500">{series.win + series.loss + (series.draw || 0)} / {series.total} Played</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-zinc-700 h-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Leaderboard Widget */}
          <div className="glass-panel border border-zinc-800 rounded-xl p-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold tracking-wider text-zinc-200 uppercase">Tour Stats</h3>
              </div>
              <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
                <button
                  onClick={() => setStatsTab('batting')}
                  className={`px-2 py-1 rounded-md font-bold uppercase transition-all
                    ${statsTab === 'batting' ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Batting
                </button>
                <button
                  onClick={() => setStatsTab('bowling')}
                  className={`px-2 py-1 rounded-md font-bold uppercase transition-all
                    ${statsTab === 'bowling' ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Bowling
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
              {statsTab === 'batting' ? (
                leaderboards.batting.length === 0 ? (
                  <div className="text-center py-6 text-[11px] text-zinc-500 italic">No batting stats recorded yet.</div>
                ) : (
                  leaderboards.batting.slice(0, 15).map((stat, idx) => {
                    const isUser = stat.player.isUser;
                    return (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded border text-xs
                          ${isUser ? 'border-blue-500/30 bg-blue-500/5' : 'border-zinc-900 bg-zinc-950/20'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-500 w-4">{idx + 1}</span>
                          <TeamBadge teamId={stat.player.team} size="sm" />
                          <span className={`font-bold ${isUser ? 'text-blue-400' : 'text-zinc-300'}`}>
                            {stat.player.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-right font-mono text-[11px]">
                          <div>
                            <span className="text-zinc-500 text-[9px] block">RUNS</span>
                            <span className="font-black text-zinc-200">{stat.runs}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] block">AVG</span>
                            <span className="text-zinc-300">{stat.outs > 0 ? (stat.runs / stat.outs).toFixed(1) : stat.runs}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] block">SR</span>
                            <span className="text-zinc-400">{stat.balls > 0 ? ((stat.runs / stat.balls) * 100).toFixed(1) : '-'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                leaderboards.bowling.length === 0 ? (
                  <div className="text-center py-6 text-[11px] text-zinc-500 italic">No bowling stats recorded yet.</div>
                ) : (
                  leaderboards.bowling.slice(0, 15).map((stat, idx) => {
                    const isUser = stat.player.isUser;
                    const oversNum = stat.ballsBowled / 6;
                    const econ = oversNum > 0 ? (stat.runsConceded / oversNum).toFixed(2) : '0.00';
                    return (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded border text-xs
                          ${isUser ? 'border-blue-500/30 bg-blue-500/5' : 'border-zinc-900 bg-zinc-950/20'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-500 w-4">{idx + 1}</span>
                          <TeamBadge teamId={stat.player.team} size="sm" />
                          <span className={`font-bold ${isUser ? 'text-blue-400' : 'text-zinc-300'}`}>
                            {stat.player.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-right font-mono text-[11px]">
                          <div>
                            <span className="text-zinc-500 text-[9px] block">WKTS</span>
                            <span className="font-black text-zinc-200">{stat.wkts}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] block">ECON</span>
                            <span className="text-zinc-300">{econ}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] block">OVERS</span>
                            <span className="text-zinc-400">{Math.floor(stat.ballsBowled / 6) + (stat.ballsBowled % 6 ? `.${stat.ballsBowled % 6}` : '')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
