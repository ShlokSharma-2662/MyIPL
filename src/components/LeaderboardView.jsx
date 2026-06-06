import React, { useEffect, useState } from 'react';
import { Trophy, RefreshCw, Crown, WifiOff } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { getLeaderboard } from '../api';
import { getDeviceId } from '../firebase';

export default function LeaderboardView() {
  const [entries, setEntries] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const myUid = getDeviceId();

  const load = () => {
    setStatus('loading');
    getLeaderboard(50)
      .then((data) => {
        setEntries(data || []);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Leaderboard fetch failed:', err);
        setStatus('error');
      });
  };

  useEffect(() => {
    load();
  }, []);

  if (status === 'loading') {
    return (
      <div className="glass-panel rounded-xl border border-zinc-800/50 p-12 text-center animate-fade-in">
        <div className="text-amber-500 text-xs font-bold tracking-[0.3em] animate-pulse">
          LOADING GLOBAL LEADERBOARD…
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="glass-panel rounded-xl border border-zinc-800/50 p-12 text-center animate-fade-in">
        <WifiOff className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
        <div className="text-zinc-300 font-bold text-sm mb-1">Leaderboard server unreachable</div>
        <div className="text-zinc-500 text-xs mb-5 max-w-sm mx-auto">
          Start the .NET backend (<span className="font-mono text-zinc-400">dotnet run</span> in
          <span className="font-mono text-zinc-400"> backend/MyIPL.Api</span>) and try again.
        </div>
        <button
          onClick={load}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold px-4 py-2 rounded-lg tracking-wider text-xs inline-flex items-center gap-2 transition-all hover:-translate-y-0.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> RETRY
        </button>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="glass-panel rounded-xl border border-zinc-800/50 p-12 text-center animate-fade-in">
        <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
        <div className="text-zinc-300 font-bold text-sm mb-1">No champions yet</div>
        <div className="text-zinc-500 text-xs">Finish a season to claim your spot on the global leaderboard.</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto animate-fade-in glass-panel rounded-xl border border-zinc-800/50 p-2">
      <div className="flex items-center justify-between px-3 pt-2 pb-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs tracking-[0.3em] font-bold text-amber-400">GLOBAL LEADERBOARD</span>
        </div>
        <button
          onClick={load}
          title="Refresh"
          className="text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] tracking-widest text-zinc-500 border-b border-zinc-800/50 bg-black/20">
            <th className="text-left py-3 px-3 rounded-tl-lg">#</th>
            <th className="text-left py-3 px-3">MANAGER</th>
            <th className="py-3 px-3">TITLES</th>
            <th className="py-3 px-3">SEASONS</th>
            <th className="py-3 px-3">WINS</th>
            <th className="py-3 px-3 rounded-tr-lg">WIN%</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const isMe = e.uid === myUid;
            const medal = i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-orange-600' : '';
            return (
              <tr
                key={e.uid}
                className={`border-b border-zinc-900/50 transition-all hover:bg-white/5 ${isMe ? 'bg-amber-500/5' : ''}`}
              >
                <td className="py-3 px-3 font-mono text-xs">
                  <span className={`font-bold ${medal || 'text-zinc-400'}`}>{i + 1}</span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <TeamBadge teamId={e.team} size="sm" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">{e.userName}</div>
                      {isMe && <div className="text-[9px] text-amber-400 tracking-widest font-bold">YOU</div>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">{e.titles}</td>
                <td className="py-3 px-3 text-center font-mono text-zinc-300">{e.seasonsPlayed}</td>
                <td className="py-3 px-3 text-center font-mono text-emerald-400">{e.totalWins}</td>
                <td className="py-3 px-3 text-center font-mono text-zinc-300">{Math.round(e.winRate * 100)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
