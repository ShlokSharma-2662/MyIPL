import React from 'react';
import { Zap, Users, MessageSquare } from 'lucide-react';
import TeamBadge from './TeamBadge';
import StatCard from './StatCard';

function getMockTweets(userName, userTeam, lastMatch) {
  if (!lastMatch) {
    return [
      {
        handle: 'IPL_Insider',
        name: 'IPL Insider',
        avatar: '📢',
        content: `Fans are counting down the hours to the season opener! Hype levels are off the charts. #IPL2026`,
        time: '2h ago'
      },
      {
        handle: 'FranchiseArmy',
        name: 'CSK Fan Club',
        avatar: '🦁',
        content: `The squad is looking lethal this year. Can't wait to see our new opening partnership in action! 💛`,
        time: '5h ago'
      }
    ];
  }

  const opp = lastMatch.home === userTeam ? lastMatch.away : lastMatch.home;
  const won = lastMatch.winner === userTeam;
  
  let bat = null;
  let bowl = null;
  [...lastMatch.inn1.battersCard, ...lastMatch.inn2.battersCard].forEach(b => {
    if (b.player.isUser) bat = b;
  });
  [...lastMatch.inn1.bowlersCard, ...lastMatch.inn2.bowlersCard].forEach(b => {
    if (b.player.isUser) bowl = b;
  });

  const tweets = [];

  // Tweet 1: Match outcome
  if (won) {
    tweets.push({
      handle: 'CricketHype',
      name: 'Cricket Hype',
      avatar: '🏏',
      content: `What a massive victory for ${userTeam} over ${opp}! The dressing room must be buzzing. Absolutely clinical finish! 🚀 #IPL`,
      time: '1h ago'
    });
  } else {
    tweets.push({
      handle: 'T20Disaster',
      name: 'T20 Disappointed Fan',
      avatar: '💔',
      content: `Shattering defeat for ${userTeam} today. Bowling felt completely toothless in the death overs. We need to bounce back quickly! 😢`,
      time: '1h ago'
    });
  }

  // Tweet 2: Personal batting/bowling performance
  if (bat) {
    if (bat.runs >= 80) {
      tweets.push({
        handle: 'FantasyKing',
        name: 'Fantasy League Guru',
        avatar: '👑',
        content: `OMFG! @${userName} is literally playing cheat code cricket! ${bat.runs} off ${bat.balls} balls against ${opp} is pure violence! 🔥 #OrangeCap`,
        time: '45m ago'
      });
    } else if (bat.runs >= 50) {
      tweets.push({
        handle: 'InsideCricket',
        name: 'CricAnalyst',
        avatar: '📊',
        content: `Delightful, classy half-century from @${userName} today. Anchored the top order and set the tempo perfectly. Top tier knock! 👏`,
        time: '50m ago'
      });
    } else if (bat.runs === 0 && bat.out) {
      tweets.push({
        handle: 'TrollCricket',
        name: 'IPL Meme Lord',
        avatar: '🤡',
        content: `Opening slot pressure? @${userName} walking back on a golden duck. Opponent pacers absolutely set him up today. 🤫`,
        time: '30m ago'
      });
    } else {
      tweets.push({
        handle: 'CSK_Whistler',
        name: 'Whistle Army',
        avatar: '💛',
        content: `Decent start by @${userName} scoring ${bat.runs} runs. Needs to convert these starts into big scores though! Let's go!`,
        time: '55m ago'
      });
    }
  }

  // Tweet 3: Derby / General memes
  const isDerby = ['CSK', 'MI', 'RCB'].includes(opp) && ['CSK', 'MI', 'RCB'].includes(userTeam);
  if (isDerby) {
    tweets.push({
      handle: 'IPL_ElClasico',
      name: 'Derby Banter',
      avatar: '🔥',
      content: `${userTeam} vs ${opp} NEVER disappoints! Absolute blockbuster derby. Fans are going wild in the stadium! 🤩 #Rivalry`,
      time: '15m ago'
    });
  } else {
    tweets.push({
      handle: 'StatMaster',
      name: 'IPL Stats Hub',
      avatar: '📈',
      content: `Brand Value is surging up after today's match! Social mentions are trending worldwide. The stadium atmosphere was electric! ⚡`,
      time: '20m ago'
    });
  }

  return tweets;
}

export default function MyProfile({ userName, userTeam = 'CSK', results, playerStats, fanPopularity = 80 }) {
  const key = `USER:${userName}`;
  const me = playerStats[key];

  const myMatches = [];
  results.forEach((m, idx) => {
    let bat = null, bowl = null;
    [...m.inn1.battersCard, ...m.inn2.battersCard].forEach(b => {
      if (b.player.isUser) bat = b;
    });
    [...m.inn1.bowlersCard, ...m.inn2.bowlersCard].forEach(b => {
      if (b.player.isUser) bowl = b;
    });
    if (bat || bowl) {
      const opp = m.home === userTeam ? m.away : m.home;
      myMatches.push({ idx: idx + 1, label: m.label, opp, bat, bowl, m, won: m.winner === userTeam, godMode: !!m.godMode });
    }
  });

  if (!me) {
    return <div className="text-zinc-500 text-sm py-8 text-center">Play some matches to see your stats.</div>;
  }

  const avgSR = me.balls > 0 ? ((me.runs / me.balls) * 100).toFixed(1) : '-';
  const econ = me.ballsBowled > 0 ? (me.runsConceded / (me.ballsBowled / 6)).toFixed(2) : '-';
  const batAvg = me.outs > 0 ? (me.runs / me.outs).toFixed(1) : (me.runs > 0 ? me.runs.toFixed(1) : '-');
  const bowlAvg = me.wkts > 0 ? (me.runsConceded / me.wkts).toFixed(1) : '-';

  // Find last played user match for social ticker
  const lastUserMatch = myMatches.length > 0 ? myMatches[myMatches.length - 1].m : null;
  const tweets = getMockTweets(userName, userTeam, lastUserMatch);

  return (
    <div className="space-y-8">
      
      {/* Dynamic Career Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="MATCHES" value={me.M} sub="Played" accent="zinc" />
        <StatCard label="RUNS" value={me.runs} sub="Total" accent="amber" />
        <StatCard label="BAT AVG" value={batAvg} sub="Average" accent="amber" />
        <StatCard label="STRIKE RATE" value={avgSR} sub="Batting" accent="amber" />
        <StatCard label="HIGHEST" value={me.HS} sub="Score" accent="amber" />

        <StatCard label="WICKETS" value={me.wkts} sub={`${me.ballsBowled} balls`} accent="fuchsia" />
        <StatCard label="BOWL AVG" value={bowlAvg} sub="Average" accent="fuchsia" />
        <StatCard label="ECONOMY" value={econ} sub="Bowling" accent="fuchsia" />
        <StatCard label="100s" value={me.hundreds} sub="Centuries" accent="amber" />
        <StatCard label="50s" value={me.fifties} sub="Fifties" accent="amber" />
      </div>

      {/* Franchise Hype Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 bg-gradient-to-br from-amber-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
            <Users className="w-8 h-8 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-100" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>
              Franchise Popularity Meter
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-0.5 leading-relaxed">
              Your personal opening scorelines and derby wins dynamically drive your team's overall brand base and fan hype rating!
            </p>
          </div>
        </div>

        <div className="w-full md:w-fit text-right min-w-[200px]">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[10px] tracking-wider text-zinc-500 uppercase font-bold">Brand Value</span>
            <span className="text-2xl font-black font-mono text-amber-400">{fanPopularity}%</span>
          </div>
          <div className="w-full bg-zinc-900 border border-zinc-850 h-3 rounded-full overflow-hidden flex relative shadow-inner">
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-1000 ease-out" style={{ width: `${fanPopularity}%` }} />
          </div>
          <div className="text-[9px] text-zinc-500 mt-2 font-mono">
            {fanPopularity >= 85 ? '👑 Fan Obsession Level' : fanPopularity >= 65 ? '📈 Strong Market Influence' : '📉 rebuilding fan base'}
          </div>
        </div>
      </div>

      {/* Main Layout split into Social Feed and Match Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Match by Match Scoreboard */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs tracking-[0.3em] text-zinc-400 mb-3 font-bold">MATCH BY MATCH RECORD</h3>
          <div className="overflow-x-auto glass-panel border border-zinc-800/80 rounded-xl p-2 bg-black/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] tracking-widest text-zinc-500 border-b border-zinc-800 bg-black/20">
                  <th className="text-left py-3 px-3">#</th>
                  <th className="text-left py-3 px-3">VS</th>
                  <th className="py-3 px-3">BAT</th>
                  <th className="py-3 px-3">SR</th>
                  <th className="py-3 px-3">4s/6s</th>
                  <th className="py-3 px-3">BOWL</th>
                  <th className="py-3 px-3">ECON</th>
                  <th className="py-3 px-3">RES</th>
                </tr>
              </thead>
              <tbody>
                {myMatches.map(mm => (
                  <tr key={mm.idx} className={`border-b border-zinc-900/50 hover:bg-white/[0.02] ${mm.godMode ? 'bg-amber-500/[0.07]' : ''}`}>
                    <td className="py-3 px-3 font-mono text-zinc-500 text-xs">
                      <span className="inline-flex items-center gap-1">
                        {mm.godMode && <Zap className="w-3 h-3 text-amber-400 animate-pulse" />}
                        {mm.label === 'League' ? `M${mm.idx}` : mm.label.slice(0, 3).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3"><TeamBadge teamId={mm.opp} size="sm" /></td>
                    <td className="py-3 px-3 text-center font-mono text-zinc-100 font-bold">
                      {mm.bat ? `${mm.bat.runs}${mm.bat.out ? '' : '*'} (${mm.bat.balls})` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-zinc-400 text-xs">{mm.bat ? mm.bat.sr : '-'}</td>
                    <td className="py-3 px-3 text-center font-mono text-zinc-400 text-xs">
                      {mm.bat ? `${mm.bat.fours}/${mm.bat.sixes}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-fuchsia-400 font-bold">
                      {mm.bowl ? `${mm.bowl.wickets}/${mm.bowl.runs}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-zinc-400 text-xs">
                      {mm.bowl ? mm.bowl.econ : '-'}
                    </td>
                    <td className={`py-3 px-3 text-center font-mono text-xs font-bold ${mm.won ? 'text-emerald-400' : 'text-red-400'}`}>
                      {mm.won ? 'W' : 'L'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Social Feed (Mock X/Twitter Ticker) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs tracking-[0.3em] text-zinc-400 mb-3 font-bold flex items-center gap-1">
            <MessageSquare className="w-4 h-4 text-amber-500 animate-pulse" /> Community Hype Feed
          </h3>
          
          <div className="glass-panel border border-zinc-800/85 rounded-xl p-5 space-y-4 bg-zinc-950/60 shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[10px] text-zinc-500 font-mono">Trending Hashtags</span>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">#{userTeam}Nation</span>
            </div>

            <div className="space-y-4">
              {tweets.map((t, idx) => (
                <div key={idx} className="flex gap-3 border-b border-zinc-900 pb-4 last:border-b-0 last:pb-0 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-sm shrink-0">
                    {t.avatar}
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-zinc-100">{t.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">@{t.handle}</span>
                      <span className="text-[9px] text-zinc-600 font-mono">• {t.time}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                      {t.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
