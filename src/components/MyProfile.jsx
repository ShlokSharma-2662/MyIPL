import React, { useState, useMemo } from 'react';
import { Zap, Users, MessageSquare } from 'lucide-react';
import TeamBadge from './TeamBadge';
import StatCard from './StatCard';

function getMockTweets(userName, userTeam, lastMatch) {
  if (!lastMatch) {
    return [
      {
        handle: 'CricketInsider',
        name: 'Cricket News Hub',
        avatar: '📢',
        content: `Fans are counting down the hours to the next match! Hype levels are off the charts.`,
        time: '2h ago'
      },
      {
        handle: 'FanClub',
        name: 'Squad Supporter',
        avatar: '🏏',
        content: `The team is looking lethal. Can't wait to see our opening batsman @${userName} in action!`,
        time: '5h ago'
      }
    ];
  }

  const opp = lastMatch.home === userTeam ? lastMatch.away : lastMatch.home;
  const won = lastMatch.winner === userTeam;
  
  let batEntries = [];
  let bowlEntries = [];
  [
    ...lastMatch.inn1.battersCard, 
    ...lastMatch.inn2.battersCard, 
    ...(lastMatch.inn3?.battersCard || []), 
    ...(lastMatch.inn4?.battersCard || [])
  ].forEach(b => {
    if (b.player.isUser) batEntries.push(b);
  });
  [
    ...lastMatch.inn1.bowlersCard, 
    ...lastMatch.inn2.bowlersCard, 
    ...(lastMatch.inn3?.bowlersCard || []), 
    ...(lastMatch.inn4?.bowlersCard || [])
  ].forEach(b => {
    if (b.player.isUser) bowlEntries.push(b);
  });

  const tweets = [];

  // Tweet 1: Match outcome
  if (won) {
    tweets.push({
      handle: 'CricketHype',
      name: 'Cricket Hype',
      avatar: '🚀',
      content: `What a massive victory for ${userTeam} over ${opp}! The dressing room must be buzzing. Absolutely clinical finish! #Cricket`,
      time: '1h ago'
    });
  } else if (lastMatch.winner) {
    tweets.push({
      handle: 'CricketFans',
      name: 'Cricket Talk',
      avatar: '💔',
      content: `Shattering defeat for ${userTeam} today. Bowling felt completely toothless. We need to bounce back quickly! 😢`,
      time: '1h ago'
    });
  } else {
    tweets.push({
      handle: 'DrawsDaily',
      name: 'Test Cricket Insider',
      avatar: '🤝',
      content: `A hard-fought draw between ${userTeam} and ${opp}! Classic test match resilience shown.`,
      time: '1h ago'
    });
  }

  // Tweet 2: Personal batting/bowling performance
  if (batEntries.length > 0) {
    const totalRuns = batEntries.reduce((sum, b) => sum + b.runs, 0);
    if (totalRuns >= 100) {
      tweets.push({
        handle: 'FantasyKing',
        name: 'Fantasy Guru',
        avatar: '👑',
        content: `OMFG! @${userName} is literally playing cheat code cricket! A magnificent contribution of ${totalRuns} runs against ${opp}! 🔥 #Clutch`,
        time: '45m ago'
      });
    } else if (totalRuns >= 50) {
      tweets.push({
        handle: 'InsideCricket',
        name: 'CricAnalyst',
        avatar: '📊',
        content: `Delightful, classy knock from @${userName} today. Anchored the top order and set the tempo perfectly. Top tier knock! 👏`,
        time: '50m ago'
      });
    } else {
      tweets.push({
        handle: 'WhistleArmy',
        name: 'Squad Supporter',
        avatar: '🏏',
        content: `Decent effort by @${userName} scoring ${totalRuns} runs. Let's go!`,
        time: '55m ago'
      });
    }
  }

  tweets.push({
    handle: 'StatMaster',
    name: 'Stats Hub',
    avatar: '📈',
    content: `Brand Value is surging up after today's match! Social mentions are trending worldwide. The stadium atmosphere was electric! ⚡`,
    time: '20m ago'
  });

  return tweets;
}

export default function MyProfile({
  userName,
  userTeam = 'CSK',
  iplResults = [],
  iplPlayerStats = {},
  internationalResults = [],
  internationalPlayerStats = {},
  fanPopularity = 80,
  internationalActive = false,
  onOpenMatch
}) {
  const [profileTab, setProfileTab] = useState(internationalActive ? 'T20' : 'IPL'); // IPL | T20 | ODI | TEST

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

    matches.forEach(m => {
      if (formatFilter && m.format !== formatFilter) return;

      // Accumulate batting stats for all innings of this match
      const userBatEntries = [
        ...m.inn1.battersCard, 
        ...m.inn2.battersCard, 
        ...(m.inn3?.battersCard || []), 
        ...(m.inn4?.battersCard || [])
      ].filter(b => b.player.isUser);

      // Accumulate bowling stats for all innings of this match
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
          
          if (b.runs > HS) {
            HS = b.runs;
          }
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

    const avgSR = balls > 0 ? ((runs / balls) * 100).toFixed(1) : '-';
    const econ = ballsBowled > 0 ? (runsConceded / (ballsBowled / 6)).toFixed(2) : '-';
    const batAvg = outs > 0 ? (runs / outs).toFixed(1) : (runs > 0 ? runs.toFixed(1) : '-');
    const bowlAvg = wkts > 0 ? (runsConceded / wkts).toFixed(1) : '-';

    return {
      M,
      runs,
      batAvg,
      avgSR,
      HS,
      wkts,
      bowlAvg,
      econ,
      hundreds,
      fifties,
      ballsBowled
    };
  };

  const iplStats = useMemo(() => getStatsForFormat(iplResults, null), [iplResults]);
  const t20iStats = useMemo(() => getStatsForFormat(internationalResults, 'T20'), [internationalResults]);
  const odiStats = useMemo(() => getStatsForFormat(internationalResults, 'ODI'), [internationalResults]);
  const testStats = useMemo(() => getStatsForFormat(internationalResults, 'TEST'), [internationalResults]);

  const allMyMatches = useMemo(() => {
    const list = [];
    
    // Add IPL matches
    iplResults.forEach((m, idx) => {
      const userBats = [...m.inn1.battersCard, ...m.inn2.battersCard].filter(b => b.player.isUser);
      const userBowls = [...m.inn1.bowlersCard, ...m.inn2.bowlersCard].filter(b => b.player.isUser);

      if (userBats.length > 0 || userBowls.length > 0) {
        const opp = m.home === userTeam ? m.away : m.home;
        list.push({ 
          type: 'IPL', 
          idx: idx + 1, 
          label: m.label, 
          opp, 
          userBats,
          userBowls,
          m, 
          won: m.winner === userTeam, 
          godMode: !!m.godMode 
        });
      }
    });

    // Add International matches
    internationalResults.forEach((m, idx) => {
      const userBats = [
        ...m.inn1.battersCard, 
        ...m.inn2.battersCard, 
        ...(m.inn3?.battersCard || []), 
        ...(m.inn4?.battersCard || [])
      ].filter(b => b.player.isUser);

      const userBowls = [
        ...m.inn1.bowlersCard, 
        ...m.inn2.bowlersCard, 
        ...(m.inn3?.bowlersCard || []), 
        ...(m.inn4?.bowlersCard || [])
      ].filter(b => b.player.isUser);

      if (userBats.length > 0 || userBowls.length > 0) {
        const opp = m.home === 'IND' ? m.away : m.home;
        list.push({ 
          type: m.format, 
          idx: idx + 1, 
          label: m.label, 
          opp, 
          userBats,
          userBowls,
          m, 
          won: m.winner === 'IND', 
          godMode: false 
        });
      }
    });

    return list;
  }, [iplResults, internationalResults, userTeam]);

  const activeStats = useMemo(() => {
    return profileTab === 'IPL' ? iplStats :
           profileTab === 'T20' ? t20iStats :
           profileTab === 'ODI' ? odiStats :
           testStats;
  }, [profileTab, iplStats, t20iStats, odiStats, testStats]);

  const filteredMatches = useMemo(() => {
    if (profileTab === 'IPL') return allMyMatches.filter(mm => mm.type === 'IPL');
    return allMyMatches.filter(mm => mm.type === profileTab);
  }, [profileTab, allMyMatches]);

  const lastUserMatch = filteredMatches.length > 0 ? filteredMatches[filteredMatches.length - 1].m : null;
  const tweets = getMockTweets(userName, profileTab === 'IPL' ? userTeam : 'IND', lastUserMatch);

  // Tab colors mapping
  const activeColorClasses = {
    IPL: 'bg-amber-500 text-black shadow-md border-amber-600',
    T20: 'bg-blue-600 text-white shadow-md border-blue-700',
    ODI: 'bg-sky-500 text-white shadow-md border-sky-600',
    TEST: 'bg-emerald-600 text-white shadow-md border-emerald-700'
  };

  const getFormatBadge = (fmt) => {
    const styles = {
      IPL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      T20: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      ODI: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      TEST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border font-mono ${styles[fmt] || styles.T20}`}>
        {fmt}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Category Tabs Switcher */}
      <div className="flex flex-wrap bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full sm:w-fit font-mono text-[10px] sm:text-xs">
        <button
          onClick={() => setProfileTab('IPL')}
          className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-lg font-bold transition-all ${profileTab === 'IPL' ? activeColorClasses.IPL : 'text-zinc-400 hover:text-white'}`}
        >
          IPL FRANCHISE
        </button>
        <button
          onClick={() => setProfileTab('T20')}
          className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-lg font-bold transition-all ${profileTab === 'T20' ? activeColorClasses.T20 : 'text-zinc-400 hover:text-white'}`}
        >
          T20I NATIONAL
        </button>
        <button
          onClick={() => setProfileTab('ODI')}
          className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-lg font-bold transition-all ${profileTab === 'ODI' ? activeColorClasses.ODI : 'text-zinc-400 hover:text-white'}`}
        >
          ODI NATIONAL
        </button>
        <button
          onClick={() => setProfileTab('TEST')}
          className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-lg font-bold transition-all ${profileTab === 'TEST' ? activeColorClasses.TEST : 'text-zinc-400 hover:text-white'}`}
        >
          TEST CRICKET
        </button>
      </div>

      {/* Dynamic Career Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="MATCHES" value={activeStats.M} sub="Played" accent="zinc" />
        <StatCard label="RUNS" value={activeStats.runs} sub="Total" accent={profileTab === 'IPL' ? 'amber' : 'blue'} />
        <StatCard label="BAT AVG" value={activeStats.batAvg} sub="Average" accent={profileTab === 'IPL' ? 'amber' : 'blue'} />
        <StatCard label="STRIKE RATE" value={activeStats.avgSR} sub="Batting" accent={profileTab === 'IPL' ? 'amber' : 'blue'} />
        <StatCard label="HIGHEST" value={activeStats.HS} sub="Score" accent={profileTab === 'IPL' ? 'amber' : 'blue'} />

        <StatCard label="WICKETS" value={activeStats.wkts} sub={`${activeStats.ballsBowled} balls`} accent="fuchsia" />
        <StatCard label="BOWL AVG" value={activeStats.bowlAvg} sub="Average" accent="fuchsia" />
        <StatCard label="ECONOMY" value={activeStats.econ} sub="Bowling" accent="fuchsia" />
        <StatCard label="100s" value={activeStats.hundreds} sub="Centuries" accent={profileTab === 'IPL' ? 'amber' : 'blue'} />
        <StatCard label="50s" value={activeStats.fifties} sub="Fifties" accent={profileTab === 'IPL' ? 'amber' : 'blue'} />
      </div>

      {/* Hype Panel (Adapts to Active Tab) */}
      <div className={`glass-panel rounded-2xl p-6 border ${profileTab === 'IPL' ? 'border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent' : 'border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent'} flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center gap-4 text-left">
          <div className={`p-3 rounded-xl border ${profileTab === 'IPL' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
            <Users className={`w-8 h-8 ${profileTab === 'IPL' ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]'} animate-pulse`} />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-100" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>
              {profileTab === 'IPL' ? 'Franchise Popularity Meter' : 'International Hype & Reputation'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-0.5 leading-relaxed">
              {profileTab === 'IPL'
                ? "Your opening scorelines and derby wins dynamically drive your team's overall brand base and fan hype rating!"
                : "Representing India! Build your global reputation across different formats to unlock new boardroom sponsorship deals."
              }
            </p>
          </div>
        </div>

        <div className="w-full md:w-fit text-right min-w-[200px]">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[10px] tracking-wider text-zinc-500 uppercase font-bold">Reputation Hype</span>
            <span className={`text-2xl font-black font-mono ${profileTab === 'IPL' ? 'text-amber-400' : 'text-blue-400'}`}>{fanPopularity}%</span>
          </div>
          <div className="w-full bg-zinc-900 border border-zinc-850 h-3 rounded-full overflow-hidden flex relative shadow-inner">
            <div className={`h-full transition-all duration-1000 ease-out ${profileTab === 'IPL' ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`} style={{ width: `${fanPopularity}%` }} />
          </div>
          <div className="text-[9px] text-zinc-500 mt-2 font-mono">
            {fanPopularity >= 85 ? '👑 Legend Status Achieved' : fanPopularity >= 65 ? '📈 Strong Market Influence' : '📉 Building Fan Interest'}
          </div>
        </div>
      </div>

      {/* Main Layout split into Social Feed and Match Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Match by Match Scoreboard */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs tracking-[0.3em] text-zinc-400 mb-3 font-bold">MATCH RECORD ({profileTab})</h3>
          <div className="overflow-x-auto glass-panel border border-zinc-800/80 rounded-xl p-2 bg-black/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] tracking-widest text-zinc-500 border-b border-zinc-800 bg-black/20 font-mono text-center">
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
                {filteredMatches.map(mm => {
                  const batDisplay = mm.userBats.length > 0 
                    ? mm.userBats.map(b => `${b.runs}${b.out ? '' : '*'}(${b.balls})`).join(' & ') 
                    : '-';
                  const srDisplay = mm.userBats.length > 0 
                    ? mm.userBats.map(b => b.sr).join(' / ') 
                    : '-';
                  const boundariesDisplay = mm.userBats.length > 0 
                    ? mm.userBats.map(b => `${b.fours}/${b.sixes}`).join(' & ') 
                    : '-';
                  
                  const bowlDisplay = mm.userBowls.length > 0 
                    ? mm.userBowls.map(b => `${b.wickets}/${b.runs}`).join(' & ') 
                    : '-';
                  const econDisplay = mm.userBowls.length > 0 
                    ? mm.userBowls.map(b => b.econ).join(' / ') 
                    : '-';

                  return (
                    <tr 
                      key={mm.idx} 
                      onClick={() => onOpenMatch && onOpenMatch(mm.m)}
                      className={`border-b border-zinc-900/50 hover:bg-white/[0.04] transition-all cursor-pointer ${mm.godMode ? 'bg-amber-500/[0.07]' : ''}`}
                    >
                      <td className="py-3 px-3 font-mono text-zinc-500 text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          {mm.godMode && <Zap className="w-3 h-3 text-amber-400 animate-pulse" />}
                          {mm.type === 'IPL' ? `M${mm.idx}` : getFormatBadge(mm.type)}
                        </span>
                      </td>
                      <td className="py-3 px-3"><TeamBadge teamId={mm.opp} size="sm" /></td>
                      <td className="py-3 px-3 text-center font-mono text-zinc-100 font-bold whitespace-nowrap">
                        {batDisplay}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-zinc-400 text-xs whitespace-nowrap">
                        {srDisplay}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-zinc-400 text-xs whitespace-nowrap">
                        {boundariesDisplay}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-fuchsia-400 font-bold whitespace-nowrap">
                        {bowlDisplay}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-zinc-400 text-xs whitespace-nowrap">
                        {econDisplay}
                      </td>
                      <td className={`py-3 px-3 text-center font-mono text-xs font-bold ${mm.won ? 'text-emerald-400' : 'text-red-400'}`}>
                        {mm.won ? 'W' : 'L'}
                      </td>
                    </tr>
                  );
                })}
                {filteredMatches.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 text-xs font-mono italic">
                      No matches played in this format yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Social Feed (Mock X/Twitter Ticker) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs tracking-[0.3em] text-zinc-400 mb-3 font-bold flex items-center gap-1">
            <MessageSquare className={`w-4 h-4 ${profileTab === 'IPL' ? 'text-amber-500' : 'text-blue-500'} animate-pulse`} /> Community Hype Feed
          </h3>
          
          <div className="glass-panel border border-zinc-800/85 rounded-xl p-5 space-y-4 bg-zinc-950/60 shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[10px] text-zinc-500 font-mono">Trending Hashtags</span>
              <span className={`text-[9px] ${profileTab === 'IPL' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'} px-2 py-0.5 rounded-full font-bold`}>
                #{profileTab === 'IPL' ? userTeam : 'IND'}Nation
              </span>
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
