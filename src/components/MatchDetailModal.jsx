import React, { useState } from 'react';
import { X, Zap, Award, BookOpen } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS } from '../data';

export default function MatchDetailModal({ match, onClose }) {
  if (!match) return null;

  const [activeTab, setActiveTab] = useState('scorecard'); // scorecard | commentary
  const [commentaryInn, setCommentaryInn] = useState(1); // 1 | 2

  const home = TEAMS.find(t => t.id === match.home);
  const away = TEAMS.find(t => t.id === match.away);
  const first = TEAMS.find(t => t.id === match.battingFirst);
  const second = TEAMS.find(t => t.id === match.battingSecond);
  const winner = TEAMS.find(t => t.id === match.winner);

  const ScorecardPanel = ({ team, inn }) => (
    <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3 sticky top-0 bg-black/40 backdrop-blur-sm -mx-4 px-4 -mt-4 pt-4 rounded-t-xl z-10">
        <TeamBadge teamId={team.id} size="sm" />
        <span className="font-bold text-zinc-100">{team.name}</span>
        <span className="ml-auto font-mono text-zinc-100 bg-zinc-900 px-2 py-1 rounded shadow-inner border border-zinc-800">
          {inn.totalRuns}/{inn.wickets} <span className="text-zinc-500 text-[10px]">({inn.oversDisplay})</span>
        </span>
      </div>
      <table className="w-full text-xs mb-4">
        <tbody>
          {inn.battersCard.map((b, i) => (
            <tr key={i} className="border-b border-zinc-900/50 hover:bg-white/5 transition-colors">
              <td className={`py-2 px-2 ${b.player.isUser ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                {b.player.name}{!b.out && <span className="text-zinc-500">*</span>}
                {b.player.isImpact && <span className="ml-1.5 text-[8px] tracking-wider bg-fuchsia-500/20 text-fuchsia-400 px-1 py-0.5 rounded border border-fuchsia-500/30">IMPACT</span>}
              </td>
              <td className="py-2 px-2 text-right font-mono text-zinc-200 font-medium">{b.runs}</td>
              <td className="py-2 px-2 text-right font-mono text-zinc-500 font-mono">({b.balls})</td>
              <td className="py-2 px-2 text-right font-mono text-zinc-500 font-mono">{b.fours}×4 {b.sixes}×6</td>
            </tr>
          ))}
          <tr className="bg-zinc-900/20"><td className="py-2 px-2 text-zinc-500 text-xs font-medium">Extras</td><td colSpan={3} className="py-2 px-2 text-right font-mono text-zinc-400">{inn.extras}</td></tr>
        </tbody>
      </table>
      <div className="text-[10px] tracking-[0.25em] text-zinc-500 mb-2 font-bold px-2">BOWLING</div>
      <table className="w-full text-xs">
        <tbody>
          {inn.bowlersCard.map((b, i) => (
            <tr key={i} className="border-b border-zinc-900/50 hover:bg-white/5 transition-colors">
              <td className={`py-2 px-2 ${b.player.isUser ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                {b.player.name}
                {b.player.isImpact && <span className="ml-1.5 text-[8px] tracking-wider bg-fuchsia-500/20 text-fuchsia-400 px-1 py-0.5 rounded border border-fuchsia-500/30">IMPACT</span>}
              </td>
              <td className="py-2 px-2 text-right font-mono text-zinc-500">{b.overs}</td>
              <td className="py-2 px-2 text-right font-mono text-zinc-200 font-medium">{b.wickets}/{b.runs}</td>
              <td className="py-2 px-2 text-right font-mono text-zinc-500">{b.econ}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const CommentaryPanel = ({ innEvents = [] }) => (
    <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
      {innEvents.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 text-xs">No commentary available for this innings.</div>
      ) : (
        innEvents.map((e, idx) => {
          const isSix = e.runs === 6;
          const isFour = e.runs === 4;
          const isWkt = e.isWicket;
          
          return (
            <div key={idx} className="text-xs border-b border-zinc-900 pb-3 flex flex-col gap-1 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="font-mono text-zinc-500 bg-zinc-900/60 px-1.5 py-0.5 rounded text-[10px]">{e.overNum}</span>
                {isWkt && <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase">WICKET</span>}
                {isSix && <span className="bg-amber-400/20 text-amber-400 border border-amber-500/30 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase font-bold">SIX</span>}
                {isFour && <span className="bg-emerald-400/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase">FOUR</span>}
                {e.isExtra && <span className="bg-zinc-800 text-zinc-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">WIDE</span>}
                <span className="text-[10px] font-mono text-zinc-400 font-bold ml-auto">{e.scoreAtBall}</span>
              </div>
              <p className={`leading-relaxed ${isWkt ? 'text-red-400 font-semibold' : isSix ? 'text-amber-400 font-semibold' : isFour ? 'text-emerald-400 font-medium' : 'text-zinc-300'}`}>
                {e.commentary}
              </p>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto animate-fade-in" onClick={onClose}>
      <div className="glass-panel rounded-2xl max-w-3xl w-full my-8 animate-slide-up shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 inset-x-0 h-1 z-20" style={{ background: `linear-gradient(to right, ${home.primary}, ${away.primary})` }} />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/50 bg-zinc-950/85 backdrop-blur-md z-20">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-amber-400 mb-2 font-bold">{match.label.toUpperCase()} DETAILS</div>
            <div className="flex items-center gap-4">
              <TeamBadge teamId={home.id} size="lg" />
              <div className="text-zinc-500 text-xs font-mono bg-zinc-900 px-2 py-1 rounded">VS</div>
              <TeamBadge teamId={away.id} size="lg" />
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* God Mode Alert */}
        {match.godMode && (
          <div className="px-6 py-3 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-fuchsia-500/10 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <div>
              <div className="text-[10px] tracking-[0.4em] text-amber-400 font-black">⚡ GOD MODE ACTIVE</div>
              <div className="text-[11px] text-zinc-300">Your stats were divine in this match — SR 350 · AVG 200 · BOWL SR 6 · ECON 2.5</div>
            </div>
          </div>
        )}

        {/* Match outcome banner */}
        <div className="px-6 py-4 border-b border-zinc-800/50 text-xs text-zinc-400 bg-black/20 flex flex-wrap items-center gap-2">
          <span className="font-medium font-semibold" style={{ color: TEAMS.find(t => t.id === match.tossWinner).primary }}>
            {match.tossWinner}
          </span> won the toss, chose to <strong className="text-zinc-200">{match.tossDecision}</strong>.
          <span className="mx-2 text-zinc-700">•</span>
          <span className="font-bold px-2 py-1 rounded bg-black/40 border border-white/5" style={{ color: winner.primary }}>
            {winner.short} won
          </span>
          <span className="text-zinc-300 font-semibold">
            {match.marginType === 'Super Over' ? (
              <span className="text-amber-400 font-bold tracking-wider px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10">SUPER OVER</span>
            ) : (
              <>by {match.margin} {match.marginType}</>
            )}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-900 bg-zinc-950/20 px-6">
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`flex items-center gap-1.5 px-5 py-3 text-xs tracking-widest font-black uppercase transition-all border-b-2 ${activeTab === 'scorecard' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-350'}`}
          >
            <Award className="w-4 h-4" />
            Scorecard
          </button>
          
          <button
            onClick={() => setActiveTab('commentary')}
            className={`flex items-center gap-1.5 px-5 py-3 text-xs tracking-widest font-black uppercase transition-all border-b-2 ${activeTab === 'commentary' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-350'}`}
          >
            <BookOpen className="w-4 h-4" />
            Match Commentary
          </button>
        </div>

        {/* MAIN PANEL CONTENT */}
        <div className="p-6 bg-black/40">
          
          {/* TAB 1: SCORECARD PANEL */}
          {activeTab === 'scorecard' && (
            <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
              <ScorecardPanel team={first} inn={match.inn1} />
              <ScorecardPanel team={second} inn={match.inn2} />
            </div>
          )}

          {/* TAB 2: COMMENTARY PANEL */}
          {activeTab === 'commentary' && (
            <div className="space-y-4 animate-fade-in">
              {/* Commentary Innings Switcher */}
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setCommentaryInn(1)}
                  className={`text-[10px] font-bold px-4 py-1.5 rounded-lg transition-all ${commentaryInn === 1 ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
                >
                  INNINGS 1 ({first.short})
                </button>
                <button
                  onClick={() => setCommentaryInn(2)}
                  className={`text-[10px] font-bold px-4 py-1.5 rounded-lg transition-all ${commentaryInn === 2 ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
                >
                  INNINGS 2 ({second.short})
                </button>
              </div>

              {/* Ticker List */}
              <CommentaryPanel innEvents={commentaryInn === 1 ? match.inn1.events : match.inn2.events} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
