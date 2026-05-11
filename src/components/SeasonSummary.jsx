import React, { useRef } from 'react';
import { Trophy, Crown, Medal, Share2, RotateCcw } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS } from '../data';
import { USER_TEAM } from '../constants';

export default function SeasonSummary({ champion, allPlayerStats, userName, tourney, onReset }) {
  const cardRef = useRef(null);
  if (!champion) return null;

  const championTeam = TEAMS.find(t => t.id === champion);
  const me = allPlayerStats[`USER:${userName}`];

  const orangeCap = Object.values(allPlayerStats)
    .filter(s => s.runs > 0)
    .sort((a, b) => b.runs - a.runs)[0];

  const purpleCap = Object.values(allPlayerStats)
    .filter(s => s.wkts > 0)
    .sort((a, b) => b.wkts - a.wkts)[0];

  const cskWon = champion === USER_TEAM;
  const meSR = me && me.balls > 0 ? ((me.runs / me.balls) * 100).toFixed(1) : '-';
  const meEcon = me && me.ballsBowled > 0 ? (me.runsConceded / (me.ballsBowled / 6)).toFixed(2) : '-';

  const shareText = `🏆 ${tourney} — ${championTeam.name} are CHAMPIONS!
${cskWon ? '🎉 WE DID IT! CSK lifted the trophy!' : ''}
🧡 Orange Cap: ${orangeCap?.player.name} (${orangeCap?.runs} runs)
💜 Purple Cap: ${purpleCap?.player.name} (${purpleCap?.wkts} wickets)
${me ? `\n👤 ${userName}: ${me.runs} runs @ SR ${meSR} | ${me.wkts} wickets @ econ ${meEcon}` : ''}`;

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

  return (
    <div ref={cardRef} className="mb-8 animate-slide-up">
      <div className="glass-panel rounded-2xl p-8 relative overflow-hidden border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 text-center mb-6">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          <div className="text-[10px] tracking-[0.4em] text-amber-400 mb-1 font-bold">SEASON SUMMARY</div>
          <h2 className="text-4xl font-black mb-1" style={{ fontFamily: 'Bebas Neue' }}>{tourney.toUpperCase()}</h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <TeamBadge teamId={champion} size="lg" />
            <div className="text-left">
              <div className="text-[10px] tracking-[0.3em] text-amber-400 font-bold">CHAMPIONS</div>
              <div className="text-2xl font-black" style={{ fontFamily: 'Bebas Neue', color: championTeam.primary }}>
                {championTeam.name}
              </div>
            </div>
          </div>
          {cskWon && (
            <div className="mt-4 inline-block bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-widest px-4 py-2 rounded-full">
              🎉 YOU DID IT, {userName.toUpperCase()}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 relative z-10 mb-6">
          {orangeCap && (
            <div className="bg-black/40 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-orange-400" />
                <div className="text-[10px] tracking-[0.3em] text-orange-400 font-bold">ORANGE CAP</div>
              </div>
              <div className="flex items-center gap-3">
                <TeamBadge teamId={orangeCap.player.team} size="sm" />
                <div>
                  <div className={`font-bold text-sm ${orangeCap.player.isUser ? 'text-amber-400' : 'text-zinc-100'}`}>{orangeCap.player.name}</div>
                  <div className="text-xs text-zinc-500 font-mono">{orangeCap.runs} runs • {orangeCap.M} matches</div>
                </div>
              </div>
            </div>
          )}
          {purpleCap && (
            <div className="bg-black/40 border border-fuchsia-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Medal className="w-4 h-4 text-fuchsia-400" />
                <div className="text-[10px] tracking-[0.3em] text-fuchsia-400 font-bold">PURPLE CAP</div>
              </div>
              <div className="flex items-center gap-3">
                <TeamBadge teamId={purpleCap.player.team} size="sm" />
                <div>
                  <div className={`font-bold text-sm ${purpleCap.player.isUser ? 'text-amber-400' : 'text-zinc-100'}`}>{purpleCap.player.name}</div>
                  <div className="text-xs text-zinc-500 font-mono">{purpleCap.wkts} wickets • {purpleCap.M} matches</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {me && (
          <div className="bg-black/40 border border-zinc-800 rounded-xl p-4 relative z-10 mb-6">
            <div className="text-[10px] tracking-[0.3em] text-zinc-400 font-bold mb-3">YOUR SEASON — {userName.toUpperCase()}</div>
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

        <div className="flex gap-3 relative z-10 justify-center">
          <button
            onClick={onShare}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold px-5 py-2.5 rounded-lg tracking-wider text-xs flex items-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <Share2 className="w-3.5 h-3.5" /> SHARE
          </button>
          <button
            onClick={onReset}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-5 py-2.5 rounded-lg tracking-wider text-xs flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" /> NEW SEASON
          </button>
        </div>
      </div>
    </div>
  );
}
