import React, { useRef, useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Share2, RotateCcw, Star, Flame, Zap, Download } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS } from '../data';
import { submitSeason } from '../api';
import { downloadSeasonCardPng } from '../utils/seasonCardPng';

const SUBMITTED_KEY = 'myipl_submitted_seasons';

const AwardCard = ({ title, icon: Icon, colorClass, borderClass, playerStat, primaryStat, secondaryStat }) => {
  if (!playerStat) return null;
  return (
    <div className={`bg-black/40 border ${borderClass} rounded-xl p-4 transition-transform hover:-translate-y-1`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <div className={`text-[10px] tracking-[0.3em] ${colorClass} font-bold uppercase`}>{title}</div>
      </div>
      <div className="flex items-center gap-3">
        <TeamBadge teamId={playerStat.player.team} size="sm" />
        <div>
          <div className={`font-bold text-sm ${playerStat.player.isUser ? 'text-amber-400' : 'text-zinc-100'}`}>
            {playerStat.player.name}
          </div>
          <div className="text-xs text-zinc-500 font-mono">{primaryStat} • {secondaryStat}</div>
        </div>
      </div>
    </div>
  );
};

export default function SeasonSummary({ champion, allPlayerStats, userName, tourney, onReset, playoff, userTeam, startChampionsLeague, clt20Active = false, startInternationalSeason, teamRecord, season = 0 }) {
  const cardRef = useRef(null);
  const [leaderboardStatus, setLeaderboardStatus] = useState('idle'); // idle | submitting | done | error
  const [pngStatus, setPngStatus] = useState('idle'); // idle | saving | done | error

  useEffect(() => {
    if (!champion) return;

    const signature = `${userName}|${userTeam}|S${season}|${champion}`;
    let submitted = [];
    try { submitted = JSON.parse(localStorage.getItem(SUBMITTED_KEY) || '[]'); } catch { submitted = []; }
    if (submitted.includes(signature)) { setLeaderboardStatus('done'); return; }

    const players = Object.values(allPlayerStats || {});
    const oc = players.filter(s => s.runs > 0).sort((a, b) => b.runs - a.runs)[0];
    const pc = players.filter(s => s.wkts > 0).sort((a, b) => b.wkts - a.wkts)[0];
    const meStat = allPlayerStats?.[`USER:${userName}`];

    let cancelled = false;
    setLeaderboardStatus('submitting');
    submitSeason({
      userName,
      team: userTeam,
      champion,
      won: champion === userTeam,
      wins: teamRecord?.W ?? 0,
      losses: teamRecord?.L ?? 0,
      season,
      orangeCapPlayer: oc?.player?.name ?? null,
      orangeCapRuns: oc?.runs ?? 0,
      purpleCapPlayer: pc?.player?.name ?? null,
      purpleCapWickets: pc?.wkts ?? 0,
      userRuns: meStat?.runs ?? 0,
      userWickets: meStat?.wkts ?? 0,
    })
      .then(() => {
        if (cancelled) return;
        try { localStorage.setItem(SUBMITTED_KEY, JSON.stringify([...submitted, signature])); } catch { /* quota */ }
        setLeaderboardStatus('done');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Leaderboard submit failed:', err);
        setLeaderboardStatus('error');
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [champion, userName, userTeam, season]);

  if (!champion) return null;

  const qualifiedForCLT20 = !clt20Active && playoff && playoff.final && (playoff.final.home === userTeam || playoff.final.away === userTeam);

  const championTeam = TEAMS.find(t => t.id === champion);
  const me = allPlayerStats[`USER:${userName}`];

  const allPlayers = Object.values(allPlayerStats);

  const orangeCap = allPlayers.filter(s => s.runs > 0).sort((a, b) => b.runs - a.runs)[0];
  const purpleCap = allPlayers.filter(s => s.wkts > 0).sort((a, b) => b.wkts - a.wkts)[0];
  const maxSixes = allPlayers.filter(s => s.sixes > 0).sort((a, b) => b.sixes - a.sixes)[0];
  const mvp = allPlayers.sort((a, b) => (b.runs + b.wkts * 25) - (a.runs + a.wkts * 25))[0];
  const superStriker = allPlayers
    .filter(s => s.runs >= 100)
    .sort((a, b) => (b.runs / b.balls) - (a.runs / a.balls))[0];

  const userWon = champion === userTeam;
  const meSR = me && me.balls > 0 ? ((me.runs / me.balls) * 100).toFixed(1) : '-';
  const meEcon = me && me.ballsBowled > 0 ? (me.runsConceded / (me.ballsBowled / 6)).toFixed(2) : '-';
  const recordLine = teamRecord
    ? `${teamRecord.W ?? 0}W – ${teamRecord.L ?? 0}L`
    : '';

  const shareText = `🏆 ${tourney} — ${championTeam?.name || champion} are CHAMPIONS!
${userWon ? `🎉 WE DID IT! ${userTeam} lifted the trophy!` : ''}
🧡 Orange Cap: ${orangeCap?.player.name} (${orangeCap?.runs} runs)
💜 Purple Cap: ${purpleCap?.player.name} (${purpleCap?.wkts} wickets)
⭐ MVP: ${mvp?.player.name}
${me ? `\n👤 ${userName} (${userTeam}): ${me.runs} runs @ SR ${meSR} | ${me.wkts} wickets @ econ ${meEcon}` : ''}`;

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: tourney, text: shareText });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert('Season summary copied to clipboard!');
      }
    } catch {
      /* user cancelled */
    }
  };

  const onDownloadPng = async () => {
    setPngStatus('saving');
    try {
      await downloadSeasonCardPng({
        tourney,
        championName: championTeam?.name,
        championId: champion,
        championColor: championTeam?.primary || '#F59E0B',
        userName,
        userTeam,
        userWon,
        runs: me?.runs ?? 0,
        sr: meSR,
        wickets: me?.wkts ?? 0,
        econ: meEcon,
        orangeCap: orangeCap ? `${orangeCap.player.name} (${orangeCap.runs})` : null,
        purpleCap: purpleCap ? `${purpleCap.player.name} (${purpleCap.wkts})` : null,
        recordLine,
      }, `myipl-${userTeam}-s${season || 1}.png`);
      setPngStatus('done');
      setTimeout(() => setPngStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setPngStatus('error');
      setTimeout(() => setPngStatus('idle'), 2500);
    }
  };

  return (
    <div ref={cardRef} className="mb-8 animate-slide-up">
      <div className="glass-panel rounded-2xl p-8 relative overflow-hidden border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 text-center mb-8">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          <div className="text-[10px] tracking-[0.4em] text-amber-400 mb-1 font-bold">SEASON SUMMARY</div>
          <h2 className="text-4xl font-black mb-1" style={{ fontFamily: 'Bebas Neue' }}>{tourney.toUpperCase()}</h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <TeamBadge teamId={champion} size="lg" />
            <div className="text-left">
              <div className="text-[10px] tracking-[0.3em] text-amber-400 font-bold">CHAMPIONS</div>
              <div className="text-2xl font-black" style={{ fontFamily: 'Bebas Neue', color: championTeam?.primary }}>
                {championTeam?.name || champion}
              </div>
            </div>
          </div>
          {userWon && (
            <div className="mt-4 inline-block bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-widest px-4 py-2 rounded-full">
              YOU DID IT, {userName.toUpperCase()} — {userTeam}
            </div>
          )}
        </div>

        <div className="relative z-10 mb-8">
          <div className="text-xs tracking-[0.3em] text-zinc-500 font-bold mb-4 text-center">SEASON AWARDS</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AwardCard
              title="Orange Cap" icon={Crown} colorClass="text-orange-400" borderClass="border-orange-500/30"
              playerStat={orangeCap} primaryStat={`${orangeCap?.runs} runs`} secondaryStat={`${orangeCap?.M} matches`}
            />
            <AwardCard
              title="Purple Cap" icon={Medal} colorClass="text-fuchsia-400" borderClass="border-fuchsia-500/30"
              playerStat={purpleCap} primaryStat={`${purpleCap?.wkts} wickets`} secondaryStat={`${purpleCap?.M} matches`}
            />
            <AwardCard
              title="Most Valuable" icon={Star} colorClass="text-yellow-400" borderClass="border-yellow-500/30"
              playerStat={mvp} primaryStat={`${mvp?.runs}R, ${mvp?.wkts}W`} secondaryStat={`${mvp?.M} matches`}
            />
            <AwardCard
              title="Maximum Sixes" icon={Flame} colorClass="text-red-400" borderClass="border-red-500/30"
              playerStat={maxSixes} primaryStat={`${maxSixes?.sixes} sixes`} secondaryStat={`${maxSixes?.M} matches`}
            />
            <AwardCard
              title="Super Striker" icon={Zap} colorClass="text-cyan-400" borderClass="border-cyan-500/30"
              playerStat={superStriker}
              primaryStat={`SR ${superStriker ? ((superStriker.runs / superStriker.balls) * 100).toFixed(1) : 0}`}
              secondaryStat={`${superStriker?.runs} runs`}
            />
          </div>
        </div>

        {me && (
          <div className="bg-black/40 border border-zinc-800 rounded-xl p-4 relative z-10 mb-6">
            <div className="text-[10px] tracking-[0.3em] text-zinc-400 font-bold mb-3">YOUR SEASON — {userName.toUpperCase()} · {userTeam}</div>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-2xl font-black text-amber-400" style={{ fontFamily: 'Bebas Neue' }}>{me.runs}</div>
                <div className="text-[10px] text-zinc-500 tracking-wider">RUNS</div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-400" style={{ fontFamily: 'Bebas Neue' }}>{meSR}</div>
                <div className="text-[10px] text-zinc-500 tracking-wider">SR</div>
              </div>
              <div>
                <div className="text-2xl font-black text-fuchsia-400" style={{ fontFamily: 'Bebas Neue' }}>{me.wkts}</div>
                <div className="text-[10px] text-zinc-500 tracking-wider">WICKETS</div>
              </div>
              <div>
                <div className="text-2xl font-black text-fuchsia-400" style={{ fontFamily: 'Bebas Neue' }}>{meEcon}</div>
                <div className="text-[10px] text-zinc-500 tracking-wider">ECON</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 relative z-10 justify-center">
          <button
            onClick={onShare}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold px-5 py-2.5 rounded-lg tracking-wider text-xs flex items-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <Share2 className="w-3.5 h-3.5" /> SHARE TEXT
          </button>
          <button
            onClick={onDownloadPng}
            disabled={pngStatus === 'saving'}
            className="bg-zinc-800 hover:bg-zinc-700 border border-amber-500/40 text-amber-300 font-bold px-5 py-2.5 rounded-lg tracking-wider text-xs flex items-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            {pngStatus === 'saving' ? 'RENDERING…' : pngStatus === 'done' ? 'PNG SAVED' : pngStatus === 'error' ? 'PNG FAILED' : 'SAVE PNG'}
          </button>
          <button
            onClick={onReset}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-5 py-2.5 rounded-lg tracking-wider text-xs flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" /> NEW SEASON
          </button>
          {startInternationalSeason && (
            <button
              onClick={startInternationalSeason}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-lg tracking-wider text-xs flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/20 border border-blue-400/20"
            >
              START INTERNATIONAL SEASON
            </button>
          )}
          {qualifiedForCLT20 && (
            <button
              onClick={startChampionsLeague}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-black px-5 py-2.5 rounded-lg tracking-wider text-xs flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-cyan-500/35 border border-cyan-400/25 animate-pulse"
            >
              ENTER CHAMPIONS LEAGUE
            </button>
          )}
        </div>

        {leaderboardStatus !== 'idle' && (
          <div className="text-center mt-5 relative z-10">
            {leaderboardStatus === 'submitting' && (
              <span className="text-[10px] tracking-[0.3em] text-zinc-500">SAVING TO GLOBAL LEADERBOARD…</span>
            )}
            {leaderboardStatus === 'done' && (
              <span className="text-[10px] tracking-[0.3em] text-emerald-400">✓ SAVED TO GLOBAL LEADERBOARD</span>
            )}
            {leaderboardStatus === 'error' && (
              <span className="text-[10px] tracking-[0.3em] text-zinc-600">COULDN'T REACH LEADERBOARD SERVER</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
