import React from 'react';
import { Play, Target, Trophy, Zap } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS } from '../data';
import { computeNRR } from '../stats';
import { HOME_VENUES } from '../venues';

export default function HomeView({
  userName,
  userTeam,
  phase,
  schedule = [],
  results = [],
  teamStats = {},
  playoff,
  playoffStep = 0,
  champion,
  godModeMatches = [],
  onPlayMyMatch,
  onSimNext,
  onOpenPlayoffs,
  setTab,
}) {
  const played = results.length;
  const nextLeague = phase === 'league' ? schedule[played] : null;
  const isUserNext = nextLeague && (nextLeague.home === userTeam || nextLeague.away === userTeam);
  const nextGod = nextLeague && godModeMatches.includes(played);

  const playoffLabels = ['Qualifier 1', 'Eliminator', 'Qualifier 2', 'Final'];
  const nextPlayoffKey = ['q1', 'elim', 'q2', 'final'][playoffStep];
  const nextPlayoffDone = playoff?.[nextPlayoffKey];

  const standings = Object.entries(teamStats)
    .map(([id, s]) => ({ id, ...s, NRR: computeNRR(s) }))
    .sort((a, b) => b.Pts - a.Pts || b.NRR - a.NRR);

  const userRank = standings.findIndex((r) => r.id === userTeam) + 1;
  const miniRows = standings.slice(0, 4);
  if (userRank > 4) {
    const you = standings[userRank - 1];
    if (you) miniRows.push(you);
  }

  const venue = nextLeague ? HOME_VENUES[nextLeague.home] : null;
  const team = TEAMS.find((t) => t.id === userTeam);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Next match hero */}
      <section className="surface-1 border border-[var(--stroke)] rounded-xl overflow-hidden">
        <div className="h-1" style={{ background: 'var(--accent)' }} />
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">
                {phase === 'done' ? 'Season complete' : phase === 'playoffs' ? 'Playoffs' : 'Up next'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black leading-none" style={{ fontFamily: 'Bebas Neue' }}>
                {phase === 'done'
                  ? (TEAMS.find((t) => t.id === champion)?.name || champion || 'Champions').toUpperCase()
                  : phase === 'playoffs'
                    ? playoffLabels[playoffStep]
                    : isUserNext
                      ? 'YOUR MATCH'
                      : 'NEXT FIXTURE'}
              </h2>
            </div>
            {nextGod && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold accent-text accent-soft px-2 py-1 rounded-md border border-[color:color-mix(in_srgb,var(--accent)_40%,transparent)]">
                <Zap className="w-3 h-3" /> GOD MODE
              </span>
            )}
          </div>

          {phase === 'league' && nextLeague && (
            <>
              <div className="flex items-center justify-center gap-4 sm:gap-8 py-4">
                <div className="flex flex-col items-center gap-2">
                  <TeamBadge teamId={nextLeague.home} size="lg" />
                  <span className="text-xs font-bold text-zinc-300">{nextLeague.home}</span>
                </div>
                <span className="text-zinc-600 font-mono text-sm">vs</span>
                <div className="flex flex-col items-center gap-2">
                  <TeamBadge teamId={nextLeague.away} size="lg" />
                  <span className="text-xs font-bold text-zinc-300">{nextLeague.away}</span>
                </div>
              </div>
              {venue && (
                <p className="text-center text-[11px] text-zinc-500 mb-4">
                  {venue.name}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                {isUserNext ? (
                  <button
                    type="button"
                    onClick={onPlayMyMatch}
                    className="btn-accent text-xs px-5 py-2.5 flex items-center gap-2 tracking-wide"
                  >
                    <Target className="w-3.5 h-3.5" /> PLAY MY MATCH
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSimNext}
                    className="btn-accent text-xs px-5 py-2.5 flex items-center gap-2 tracking-wide"
                  >
                    <Play className="w-3.5 h-3.5" /> SIMULATE NEXT
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setTab('results')}
                  className="text-xs font-bold px-4 py-2.5 rounded-lg border border-[var(--stroke)] text-zinc-300 hover:bg-white/5 tracking-wide"
                >
                  RESULTS
                </button>
              </div>
            </>
          )}

          {phase === 'playoffs' && !nextPlayoffDone && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={onOpenPlayoffs}
                className="btn-accent text-xs px-5 py-2.5 flex items-center gap-2 tracking-wide"
              >
                <Trophy className="w-3.5 h-3.5" /> OPEN {playoffLabels[playoffStep].toUpperCase()}
              </button>
              <button
                type="button"
                onClick={() => setTab('playoffs')}
                className="text-xs font-bold px-4 py-2.5 rounded-lg border border-[var(--stroke)] text-zinc-300 hover:bg-white/5 tracking-wide"
              >
                BRACKET
              </button>
            </div>
          )}

          {phase === 'done' && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTab('playoffs')}
                className="btn-accent text-xs px-5 py-2.5 flex items-center gap-2 tracking-wide"
              >
                <Trophy className="w-3.5 h-3.5" /> SEASON SUMMARY
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Identity + mini table */}
      <div className="grid sm:grid-cols-2 gap-4">
        <section className="surface-1 border border-[var(--stroke)] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">Playing as</div>
          <div className="flex items-center gap-3">
            <TeamBadge teamId={userTeam} size="lg" />
            <div>
              <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{userName}</div>
              <div className="text-sm text-zinc-400">{team?.name || userTeam} · Opener</div>
              {userRank > 0 && (
                <div className="text-[11px] font-mono text-zinc-500 mt-1">
                  #{userRank} · {teamStats[userTeam]?.Pts ?? 0} pts
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="surface-1 border border-[var(--stroke)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Standings</div>
            <button
              type="button"
              onClick={() => setTab('table')}
              className="text-[10px] font-bold accent-text hover:opacity-80"
            >
              FULL TABLE
            </button>
          </div>
          {miniRows.length === 0 ? (
            <p className="text-xs text-zinc-500">Simulate matches to fill the table.</p>
          ) : (
            <ul className="space-y-1.5">
              {miniRows.map((r) => {
                const rank = standings.findIndex((s) => s.id === r.id) + 1;
                const isYou = r.id === userTeam;
                return (
                  <li
                    key={r.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${isYou ? 'accent-soft' : ''}`}
                  >
                    <span className={`font-mono w-4 ${rank <= 4 ? 'accent-text font-bold' : 'text-zinc-500'}`}>
                      {rank}
                    </span>
                    <TeamBadge teamId={r.id} size="sm" />
                    <span className={`flex-1 font-semibold ${isYou ? 'accent-text' : 'text-zinc-200'}`}>
                      {r.id}
                    </span>
                    <span className="font-mono text-zinc-400">{r.Pts}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
