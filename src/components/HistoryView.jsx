import React from 'react';
import { Trophy, Crown, Star, Target } from 'lucide-react';
import { TEAMS } from '../data';

export default function HistoryView({ userName, history = [], careerRivalries = {} }) {
  const getTeam = (id) => TEAMS.find(t => t.id === id) || { name: id, primary: '#333' };

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
    if ((s.hs || 0) > highestScore) highestScore = s.hs;
  });

  const careerSR = careerBalls > 0 ? ((careerRuns / careerBalls) * 100).toFixed(1) : '0.0';
  const careerOvers = careerBallsBowled / 6;
  const careerEcon = careerOvers > 0 ? (careerRunsConceded / careerOvers).toFixed(2) : '0.00';
  
  const careerBatAvg = careerOuts > 0 ? (careerRuns / careerOuts).toFixed(1) : (careerRuns > 0 ? careerRuns.toFixed(1) : '-');
  const careerBowlAvg = careerWickets > 0 ? (careerRunsConceded / careerWickets).toFixed(1) : '-';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-panel rounded-2xl p-8 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30">
        <h2 className="text-3xl font-black mb-6 tracking-wider flex items-center gap-3 text-amber-400">
          <Star className="w-8 h-8 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" /> {userName}'s Career Legacy
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase">Matches</div>
            <div className="text-2xl font-black font-mono text-zinc-100">{careerM}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase">Runs</div>
            <div className="text-2xl font-black font-mono text-amber-400">{careerRuns}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase">Bat Avg</div>
            <div className="text-2xl font-black font-mono text-amber-400">{careerBatAvg}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase">Strike Rate</div>
            <div className="text-2xl font-black font-mono text-amber-400">{careerSR}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase">Highest Score</div>
            <div className="text-2xl font-black font-mono text-amber-400">{highestScore}</div>
          </div>

          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase">Wickets</div>
            <div className="text-2xl font-black font-mono text-fuchsia-400">{careerWickets}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase">Bowl Avg</div>
            <div className="text-2xl font-black font-mono text-fuchsia-400">{careerBowlAvg}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase">Economy</div>
            <div className="text-2xl font-black font-mono text-fuchsia-400">{careerEcon}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase">Centuries</div>
            <div className="text-2xl font-black font-mono text-zinc-100">{career100s}</div>
          </div>
          <div className="bg-black/50 rounded-xl px-5 py-4 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1 tracking-wider uppercase">Fifties</div>
            <div className="text-2xl font-black font-mono text-zinc-100">{career50s}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-8 border border-zinc-800/50">
        <h3 className="text-xl font-black tracking-wider mb-6 text-zinc-300 px-2 flex items-center gap-3">
          <Target className="w-6 h-6 text-fuchsia-400" /> RIVALRY METER (ALL-TIME)
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
                        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-lg"
                        style={{ backgroundColor: opp.primary }}
                      >
                        {opp.name}
                      </div>
                      <div className="font-bold text-lg text-zinc-200">vs {opp.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black font-mono" style={{ color: winPct >= 50 ? '#34d399' : '#f87171' }}>{winPct}%</div>
                      <div className="text-[10px] tracking-widest text-zinc-500 uppercase">Win Rate</div>
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

      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-wider mb-2 text-zinc-300 px-2">LEAGUE HISTORY</h3>
        {history.slice().reverse().map(season => {
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
                  <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-lg" />
                  <span className="font-black text-2xl text-zinc-100" style={{ fontFamily: 'Bebas Neue', letterSpacing: '1px' }}>{champ.name}</span>
                </div>
              </div>
              
              <div className="p-6 lg:w-3/4 grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-2 space-y-4">
                  <div className="bg-black/30 rounded-lg p-3 border border-orange-500/20">
                    <div className="text-[10px] tracking-wider text-orange-500 mb-1 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> ORANGE CAP
                    </div>
                    <div className="font-bold text-sm text-zinc-200">{season.orangeCap.name}</div>
                    <div className="text-xs text-zinc-400">{season.orangeCap.runs} runs</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-fuchsia-500/20">
                    <div className="text-[10px] tracking-wider text-fuchsia-400 mb-1 flex items-center gap-1">
                      <Target className="w-3 h-3" /> PURPLE CAP
                    </div>
                    <div className="font-bold text-sm text-zinc-200">{season.purpleCap.name}</div>
                    <div className="text-xs text-zinc-400">{season.purpleCap.wickets} wickets</div>
                  </div>
                </div>

                <div className="xl:col-span-3 bg-black/40 rounded-xl p-5 border border-zinc-800">
                  <div className="text-[10px] tracking-wider text-amber-500/70 mb-3 border-b border-zinc-800/50 pb-2 uppercase">Your Performance</div>
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
                      <div className="font-mono font-bold text-zinc-200 text-sm">{s.hs || 0}</div>
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
        })}
      </div>
    </div>
  );
}
