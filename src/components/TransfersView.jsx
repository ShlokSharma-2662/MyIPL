import React, { useState } from 'react';
import { ROSTERS, TEAMS } from '../data';

// Custom formula for player rating
export function getPlayerRating(p) {
  if (!p) return 0;
  const role = p[1];
  const batSR = p[2] || 0;
  const batAvg = p[3] || 0;
  const bowlSR = p[4] || 0;
  const bowlEcon = p[5] || 0;

  if (role === 'BAT' || role === 'WK') {
    return Math.round(batSR * 0.35 + batAvg * 1.15);
  } else if (role === 'BOWL') {
    const srContrib = Math.max(0, (30 - bowlSR) * 1.4);
    const econContrib = Math.max(0, (12 - bowlEcon) * 4.5);
    return Math.round(45 + srContrib + econContrib);
  } else { // AR
    const batPart = (batSR * 0.35 + batAvg * 1.15);
    const bowlPart = (Math.max(0, (30 - bowlSR) * 1.4) + Math.max(0, (12 - bowlEcon) * 4.5));
    return Math.round((batPart + bowlPart) / 2 + 8);
  }
}

// Popularity requirements for marquee players
const STAR_POP_REQ = {
  'Virat Kohli': 90,
  'Rohit Sharma': 88,
  'Jasprit Bumrah': 88,
  'Suryakumar Yadav': 86,
  'Sunil Narine': 85,
  'Heinrich Klaasen': 84,
  'Travis Head': 84,
  'Rashid Khan': 85,
  'Andre Russell': 85,
  'Shubman Gill': 83,
  'KL Rahul': 81,
  'Pat Cummins': 82,
  'Sanju Samson': 80,
  'Kuldeep Yadav': 80,
  'Rishabh Pant': 82,
  'David Warner': 80,
  'Yuzvendra Chahal': 78,
  'Mitchell Starc': 82
};

export default function TransfersView({ state, actions }) {
  const { userTeam, fanPopularity } = state;
  const { executeTrade } = actions;

  const [selectedTeamId, setSelectedTeamId] = useState(
    TEAMS.find(t => t.id !== userTeam)?.id || 'MI'
  );
  
  const [targetPlayerName, setTargetPlayerName] = useState('');
  const [userPlayerName, setUserPlayerName] = useState('');
  const [tradeMessage, setTradeMessage] = useState(null);

  // Teams that are NOT the user's team
  const otherTeams = TEAMS.filter(t => t.id !== userTeam);

  const targetRoster = ROSTERS[selectedTeamId] || [];
  const userRoster = ROSTERS[userTeam] || [];

  // Currently selected target player tuple [name, role, batSR, batAvg, bowlSR, bowlEcon]
  const targetPlayer = targetRoster.find(p => p[0] === targetPlayerName);
  // User player options with the SAME role
  const userPlayerOptions = targetPlayer 
    ? userRoster.filter(p => p[1] === targetPlayer[1]) 
    : [];

  const userPlayer = userPlayerOptions.find(p => p[0] === userPlayerName);

  const targetRating = getPlayerRating(targetPlayer);
  const userRating = getPlayerRating(userPlayer);

  const popRequirement = targetPlayer ? (STAR_POP_REQ[targetPlayer[0]] || 70) : 70;
  const isPopSatisfied = fanPopularity >= popRequirement;
  const isRatingSatisfied = targetPlayer && userPlayer 
    ? (userRating >= targetRating || (targetRating - userRating) <= 10) 
    : false;

  const isTradeValid = targetPlayer && userPlayer && isPopSatisfied && isRatingSatisfied;

  const handleTrade = () => {
    if (!isTradeValid) return;

    const success = executeTrade(selectedTeamId, targetPlayer[0], userPlayer[0]);
    if (success) {
      setTradeMessage({
        type: 'success',
        text: `🔥 Mega Trade Finalized! Swapped ${userPlayer[0]} for ${targetPlayer[0]} successfully!`
      });
      // Clear selections
      setTargetPlayerName('');
      setUserPlayerName('');
    } else {
      setTradeMessage({
        type: 'error',
        text: '❌ Trade execution failed. Please verify selections and retry.'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="text-3xl">🔄</span> Franchise Transfer Hub
        </h2>
        <p className="mt-2 text-slate-400 max-w-xl text-sm leading-relaxed">
          Sign world-class superstars by swapping them for players of the <strong className="text-cyan-400">exact same role</strong>. Deals require high <strong className="text-cyan-400">Fan Popularity</strong> and balanced ratings (within <strong className="text-cyan-400">10 points</strong>).
        </p>
        <div className="mt-4 flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 w-fit px-4 py-2 rounded-xl">
          <span className="text-slate-400 text-xs">My Franchise Fan Popularity:</span>
          <span className="font-black text-cyan-400 text-sm font-mono">{fanPopularity}%</span>
        </div>
      </div>

      {tradeMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between animate-fadeIn ${
          tradeMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <span className="font-semibold text-sm">{tradeMessage.text}</span>
          <button 
            onClick={() => setTradeMessage(null)}
            className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100 bg-slate-900/40 px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Selector Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Choose Target Player */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-cyan-400">01.</span> Select Target Superstar
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Select Franchise</label>
              <select 
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  setTargetPlayerName('');
                  setUserPlayerName('');
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
              >
                {otherTeams.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.short})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Select Player</label>
              <select 
                value={targetPlayerName}
                onChange={(e) => {
                  setTargetPlayerName(e.target.value);
                  setUserPlayerName('');
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
              >
                <option value="">-- Choose player to acquire --</option>
                {targetRoster.map(p => (
                  <option key={p[0]} value={p[0]}>
                    {p[0]} ({p[1]} | OVR {getPlayerRating(p)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Choose Traded Player */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-cyan-400">02.</span> Select Player to Swap ({userTeam})
          </h3>
          <div className="space-y-3">
            {!targetPlayer ? (
              <div className="h-28 flex items-center justify-center border border-dashed border-slate-800/50 rounded-xl text-xs text-slate-600 italic">
                Choose a target superstar first to load eligible {userTeam} players of matching role
              </div>
            ) : (
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                  {userTeam} Player ({targetPlayer[1]} Options)
                </label>
                <select 
                  value={userPlayerName}
                  onChange={(e) => setUserPlayerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="">-- Select player to trade away --</option>
                  {userPlayerOptions.map(p => (
                    <option key={p[0]} value={p[0]}>
                      {p[0]} (OVR {getPlayerRating(p)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Widget */}
      {targetPlayer && (
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-slate-900 pb-3 flex items-center gap-2">
            📊 Player Card Comparison
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Target Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-44 shadow-lg">
              <div className="absolute top-0 right-0 bg-cyan-500/20 text-cyan-400 font-mono text-[10px] px-2 py-0.5 rounded-bl font-semibold">
                TARGET SIGNING
              </div>
              <div>
                <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-400 font-bold rounded-full font-mono">
                  {targetPlayer[1]}
                </span>
                <h4 className="font-extrabold text-white text-xl mt-2 tracking-tight">{targetPlayer[0]}</h4>
                <p className="text-xs text-slate-500">{selectedTeamId} franchise</p>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-slate-500 font-bold font-mono">POPULARITY REQ</p>
                  <p className={`text-xs font-semibold ${isPopSatisfied ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {popRequirement}% Hype {isPopSatisfied ? '✓' : '(Lacking)'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-slate-500 font-bold font-mono">OVERALL</p>
                  <p className="text-3xl font-black text-cyan-400 font-mono">{targetRating}</p>
                </div>
              </div>
            </div>

            {/* User Card */}
            {userPlayer ? (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-44 shadow-lg">
                <div className="absolute top-0 right-0 bg-purple-500/20 text-purple-400 font-mono text-[10px] px-2 py-0.5 rounded-bl font-semibold">
                  TRADING OUT
                </div>
                <div>
                  <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-400 font-bold rounded-full font-mono">
                    {userPlayer[1]}
                  </span>
                  <h4 className="font-extrabold text-white text-xl mt-2 tracking-tight">{userPlayer[0]}</h4>
                  <p className="text-xs text-slate-500">{userTeam} franchise</p>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-slate-500 font-bold font-mono">RATING DIFF</p>
                    <p className={`text-xs font-semibold ${isRatingSatisfied ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {userRating - targetRating > 0 ? '+' : ''}{userRating - targetRating} OVR {isRatingSatisfied ? '✓' : '(> -10 OVR Limit)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-500 font-bold font-mono">OVERALL</p>
                    <p className="text-3xl font-black text-purple-400 font-mono">{userRating}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-800/60 rounded-2xl p-5 h-44 flex flex-col items-center justify-center text-slate-500 italic text-sm">
                <span>Select a {userTeam} player above to compare</span>
              </div>
            )}
          </div>

          {/* Trade constraints checklist */}
          <div className="bg-slate-950 border border-slate-900/80 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className={isPopSatisfied ? 'text-emerald-400' : 'text-rose-400'}>
                {isPopSatisfied ? '●' : '○'}
              </span>
              <span className="text-slate-300">
                Franchise Hype requirement met ({fanPopularity}% / {popRequirement}% needed for {targetPlayer[0]})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={isRatingSatisfied ? 'text-emerald-400' : 'text-rose-400'}>
                {isRatingSatisfied ? '●' : '○'}
              </span>
              <span className="text-slate-300">
                Swap rating is within legal ±10 threshold ({userPlayer ? `${userRating} vs ${targetRating}` : 'N/A'})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={targetPlayer && userPlayer ? 'text-emerald-400' : 'text-rose-400'}>
                {targetPlayer && userPlayer ? '●' : '○'}
              </span>
              <span className="text-slate-300">
                Roles perfectly match ({targetPlayer[1]})
              </span>
            </div>
          </div>

          {/* Trade execution button */}
          <button 
            disabled={!isTradeValid}
            onClick={handleTrade}
            className={`w-full py-4 px-6 rounded-2xl font-bold tracking-wider text-sm flex items-center justify-center gap-2 uppercase transition-all duration-300 ${
              isTradeValid 
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer' 
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <span>⚡</span> Execute Superstar Trade
          </button>
        </div>
      )}
    </div>
  );
}
