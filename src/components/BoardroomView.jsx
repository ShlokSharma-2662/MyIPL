import React from 'react';

const SPONSORS = [
  {
    id: 'apex',
    name: 'Apex Digital',
    tier: 'Bronze',
    unlockHype: 0,
    desc: 'Enter the cyberpunk tech ecosystem. Apex wants you to power their stats analytics.',
    challenge: 'Score 150 total batting runs as USER in this season.',
    rewardXP: 250,
    rewardHype: 5,
    tagline: 'APEX DIGITAL // NEXT-GEN INSIGHTS',
    logoColor: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/10'
  },
  {
    id: 'aura',
    name: 'Aura Fuels',
    tier: 'Silver',
    unlockHype: 70,
    desc: 'Power clean synthetic fusion engine technology. Aura requires maximum dynamic energy.',
    challenge: 'Claim 10 total bowling wickets as USER in this season.',
    rewardXP: 500,
    rewardHype: 10,
    tagline: 'AURA FUSION FUELS // IGNITE ENERGY',
    logoColor: 'from-amber-500 to-rose-600',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/10'
  },
  {
    id: 'neon',
    name: 'Neon Pay',
    tier: 'Gold',
    unlockHype: 85,
    desc: 'Integrate ultrafast, decentralized blockchain transactions. Neon rewards flawless victories.',
    challenge: 'Simulate or win 8 total match victories in this league season.',
    rewardXP: 800,
    rewardHype: 15,
    tagline: 'NEON PAY // VELOCITY PROTOCOL',
    logoColor: 'from-cyan-400 to-purple-600',
    borderColor: 'border-cyan-400/35',
    glowColor: 'shadow-cyan-400/15'
  }
];

export default function BoardroomView({ state, setters }) {
  const { activeSponsor, fanPopularity, allPlayerStats, results, userName } = state;
  const { setActiveSponsor } = setters;

  const handleSelectSponsor = (sponsor) => {
    // Determine progress base when selected
    let initialProgress = 0;
    const userKey = `USER:${userName}`;
    const userStats = allPlayerStats[userKey] || { runs: 0, wkts: 0 };

    if (sponsor.id === 'apex') {
      initialProgress = userStats.runs || 0;
    } else if (sponsor.id === 'aura') {
      initialProgress = userStats.wkts || 0;
    } else if (sponsor.id === 'neon') {
      initialProgress = results.length;
    }

    setActiveSponsor({
      id: sponsor.id,
      name: sponsor.name,
      tier: sponsor.tier,
      challenge: sponsor.challenge,
      progress: initialProgress,
      claimed: false
    });
  };

  const getSponsorProgressText = (sp) => {
    if (!sp) return '';
    if (sp.id === 'apex') {
      return `${sp.progress || 0} / 150 Runs`;
    } else if (sp.id === 'aura') {
      return `${sp.progress || 0} / 10 Wickets`;
    } else if (sp.id === 'neon') {
      return `${sp.progress || 0} / 8 Wins`;
    }
    return '';
  };

  const getSponsorPercent = (sp) => {
    if (!sp) return 0;
    if (sp.id === 'apex') {
      return Math.min(100, Math.round(((sp.progress || 0) / 150) * 100));
    } else if (sp.id === 'aura') {
      return Math.min(100, Math.round(((sp.progress || 0) / 10) * 100));
    } else if (sp.id === 'neon') {
      return Math.min(100, Math.round(((sp.progress || 0) / 8) * 100));
    }
    return 0;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="text-3xl">👔</span> Corporate Boardroom
        </h2>
        <p className="mt-2 text-slate-400 max-w-xl text-sm leading-relaxed">
          Negotiate multi-million coins brand partnerships. Unlocking higher tiers requires premium <strong className="text-cyan-400">Fan Popularity (Hype)</strong>. Accomplish season sponsor objectives to claim massive XP payouts.
        </p>
        <div className="mt-4 flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 w-fit px-4 py-2 rounded-xl">
          <span className="text-slate-400 text-xs">Franchise Fan Hype:</span>
          <span className="font-black text-cyan-400 text-sm font-mono">{fanPopularity}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Deal Status Card */}
        <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-3">
              🎯 Active Corporate Contract
            </h3>

            {activeSponsor ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl relative overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {activeSponsor.tier} Partner
                  </span>
                  <h4 className="font-black text-white text-lg mt-0.5 tracking-tight">{activeSponsor.name}</h4>
                  <p className="text-xs text-cyan-400 mt-2 font-medium leading-relaxed">{activeSponsor.challenge}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 uppercase tracking-widest text-[10px]">Objective Progress</span>
                    <span className="text-cyan-400 font-mono">{getSponsorProgressText(activeSponsor)}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800/40">
                    <div 
                      className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${getSponsorPercent(activeSponsor)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{getSponsorPercent(activeSponsor)}% Completed</span>
                    {activeSponsor.claimed && (
                      <span className="text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        COMPLETED & CLAIMED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center border border-dashed border-slate-800/60 rounded-xl text-xs text-slate-600 italic px-4 text-center">
                No active sponsor contract. Choose a partner deal from the corporate roster to unlock challenges and custom branding placements.
              </div>
            )}
          </div>

          {activeSponsor && (
            <button
              onClick={() => setActiveSponsor(null)}
              className="w-full py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300"
            >
              Terminate Contract
            </button>
          )}
        </div>

        {/* Sponsor Contract Roster (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-5">
          <h3 className="text-base font-bold text-white border-b border-slate-900 pb-3">
            🤝 Available Partnership Tiers
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {SPONSORS.map((sp) => {
              const isUnlocked = fanPopularity >= sp.unlockHype;
              const isActive = activeSponsor && activeSponsor.id === sp.id;

              return (
                <div 
                  key={sp.id}
                  className={`relative overflow-hidden bg-slate-900/25 border rounded-xl p-4 transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                    isActive 
                      ? 'border-cyan-500/50 bg-slate-900/60 shadow-[0_0_12px_rgba(6,182,212,0.1)]' 
                      : isUnlocked 
                      ? 'border-slate-800/80 hover:border-slate-700/80' 
                      : 'border-slate-900 opacity-50 bg-slate-950/20'
                  }`}
                >
                  <div className="space-y-2 max-w-lg">
                    <div className="flex items-center gap-2">
                      {/* Logo mockup icon */}
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sp.logoColor} flex items-center justify-center font-black text-xs text-white shadow-md font-mono select-none`}>
                        {sp.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          {sp.name}
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            sp.tier === 'Bronze' 
                              ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30' 
                              : sp.tier === 'Silver' 
                              ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' 
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {sp.tier} Tier
                          </span>
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed">{sp.desc}</p>
                    <div className="text-xs bg-slate-950/50 p-2.5 rounded-lg border border-slate-900 flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">SEASON TASK:</span>
                      <span className="text-slate-300 font-medium">{sp.challenge}</span>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="shrink-0 flex flex-col sm:items-end justify-between gap-3 text-right">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-slate-500 font-bold font-mono">REWARDS</p>
                      <p className="text-xs font-bold text-cyan-400 font-mono">+{sp.rewardXP} XP</p>
                      <p className="text-xs font-bold text-emerald-400 font-mono">+{sp.rewardHype} Hype</p>
                    </div>

                    {!isUnlocked ? (
                      <div className="text-[10px] text-rose-400 uppercase font-black tracking-widest bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20">
                        🔒 Unlocks at {sp.unlockHype}% Hype
                      </div>
                    ) : isActive ? (
                      <div className="text-xs text-cyan-400 uppercase font-bold tracking-widest bg-cyan-500/15 border border-cyan-500/20 px-3 py-2 rounded-xl">
                        Active Deal
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectSponsor(sp)}
                        disabled={activeSponsor !== null}
                        className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 ${
                          activeSponsor !== null
                            ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-900'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer hover:scale-[1.02]'
                        }`}
                      >
                        Sign Contract
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Corporate Sponsor Banner Placement Mockup */}
          {activeSponsor && (
            <div className="mt-6 space-y-2 border-t border-slate-900 pt-5">
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">
                Visual Sponsor Ad Placement Mockup
              </span>
              {SPONSORS.map((sp) => {
                if (sp.id !== activeSponsor.id) return null;
                return (
                  <div 
                    key={sp.id}
                    className={`w-full py-4 px-6 bg-gradient-to-r ${sp.logoColor} rounded-xl border border-white/10 shadow-lg text-center flex flex-col items-center justify-center gap-1.5 relative overflow-hidden`}
                  >
                    {/* Glowing effect */}
                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/5 animate-pulse" />
                    <span className="text-[10px] tracking-widest font-bold font-mono text-white/70 uppercase">
                      OFFICIAL TEAM SPONSOR
                    </span>
                    <h5 className="text-lg font-black tracking-widest text-white drop-shadow">
                      {sp.tagline}
                    </h5>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
