import React, { useState } from 'react';

// Attribute names, keys, and descriptions
const ATTRIBUTES = [
  { key: 'power', name: 'Power Hitting', desc: 'Increases batting Strike Rate (+8 SR per level)' },
  { key: 'timing', name: 'Placement / Timing', desc: 'Increases batting Average (+5 Avg per level)' },
  { key: 'spinDef', name: 'Spin Defense', desc: 'Slightly increases batting Average against spin (+1.5 Avg)' },
  { key: 'paceDef', name: 'Pace Defense', desc: 'Slightly increases batting Average against pace (+1.5 Avg)' },
  { key: 'deathBowl', name: 'Death Bowling', desc: 'Lowers bowling Strike Rate (fewer balls per wicket)' },
  { key: 'economy', name: 'Bowling Economy', desc: 'Lowers average runs conceded per over' }
];

export default function TrainingView({ state, setters }) {
  const { playerXP, userPlayerAttributes, userName } = state;
  const { setPlayerXP, setUserPlayerAttributes } = setters;

  // Mini-game states
  const [netsActive, setNetsActive] = useState(false);
  const [currentBall, setCurrentBall] = useState(1);
  const [netsBowler, setNetsBowler] = useState('');
  const [netsBowlerType, setNetsBowlerType] = useState('Pacer');
  const [miniGameLog, setMiniGameLog] = useState([]);
  const [accumulatedXP, setAccumulatedXP] = useState(0);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  // Constants
  const BOWLERS = [
    { name: 'Jasprit Bumrah', type: 'Pacer' },
    { name: 'Mitchell Starc', type: 'Pacer' },
    { name: 'Rashid Khan', type: 'Spinner' },
    { name: 'Yuzvendra Chahal', type: 'Spinner' },
    { name: 'Pat Cummins', type: 'Pacer' }
  ];

  // Calculate upgrade cost
  const getUpgradeCost = (currentLevel) => {
    return currentLevel * 120;
  };

  const handleUpgrade = (key) => {
    const currentVal = userPlayerAttributes[key] || 1;
    if (currentVal >= 10) return; // Cap at level 10

    const cost = getUpgradeCost(currentVal);
    if (playerXP >= cost) {
      setPlayerXP(xp => xp - cost);
      setUserPlayerAttributes(prev => ({
        ...prev,
        [key]: currentVal + 1
      }));
    }
  };

  const handleMaxAll = () => {
    setUserPlayerAttributes({
      power: 10, timing: 10, spinDef: 10, paceDef: 10, deathBowl: 10, economy: 10
    });
  };

  const isAlreadyMaxed = ATTRIBUTES.every(a => (userPlayerAttributes[a.key] || 1) >= 10);

  const startNetsPractice = () => {
    const bowler = BOWLERS[Math.floor(Math.random() * BOWLERS.length)];
    setNetsBowler(bowler.name);
    setNetsBowlerType(bowler.type);
    setNetsActive(true);
    setCurrentBall(1);
    setMiniGameLog([]);
    setAccumulatedXP(0);
    setPracticeCompleted(false);
  };

  const playDelivery = (shotType) => {
    let outcome = '';
    let xpEarned = 0;
    let comment = '';

    const random = Math.random();

    if (shotType === 'lofted') {
      if (random < 0.35) {
        outcome = 'Wicket! ❌';
        xpEarned = 10;
        comment = `${netsBowler} bowls a deceptive delivery. USER swings big but mistimes it completely, holing out to deep mid-wicket!`;
      } else if (random < 0.75) {
        outcome = 'SIX! 💥';
        xpEarned = 80;
        comment = `${netsBowler} drops it short. USER triggers an explosive Lofted Shot, dispatching the ball high over cow corner for a massive maximum!`;
      } else {
        outcome = 'FOUR! 🏏';
        xpEarned = 50;
        comment = `${netsBowler} overpitches. USER clears the front leg and lofts it clean over the bowler's head for a boundary!`;
      }
    } else if (shotType === 'drive') {
      if (random < 0.12) {
        outcome = 'Dot Ball 🛑';
        xpEarned = 15;
        comment = `${netsBowler} fires a beautiful outswinger. USER attempts a stylish cover drive but is beaten by the lateral movement.`;
      } else if (random < 0.6) {
        outcome = 'FOUR! 🏏';
        xpEarned = 45;
        comment = `${netsBowler} offers some width. USER steps into it and plays an elegant Cover Drive, bisecting the gap perfectly for four!`;
      } else {
        outcome = 'Double 🏃';
        xpEarned = 25;
        comment = `${netsBowler} bowls full on off. USER times the drive sweetly to deep extra cover, running hard for a brace.`;
      }
    } else { // defensive block
      outcome = 'Single 🏃';
      xpEarned = 20;
      comment = `${netsBowler} delivers a threatening yorker. USER plays with soft hands, executing a flawless Defensive Block and nudging it to point for a quick run.`;
    }

    const logEntry = {
      ball: currentBall,
      shot: shotType === 'lofted' ? 'Lofted Blast' : shotType === 'drive' ? 'Cover Drive' : 'Defensive Block',
      outcome,
      xpEarned,
      comment
    };

    setMiniGameLog(prev => [...prev, logEntry]);
    setAccumulatedXP(x => x + xpEarned);

    if (currentBall < 3) {
      setCurrentBall(c => c + 1);
    } else {
      setPracticeCompleted(true);
      // Give the XP to the player permanently
      setPlayerXP(x => x + accumulatedXP + xpEarned);
    }
  };

  // Generate attribute web center points for visual representation
  const hexRadius = 90;
  const hexCenter = 120;
  const getHexPoint = (angleDegrees, value) => {
    const angleRad = (angleDegrees - 90) * Math.PI / 180;
    const distance = (value / 10) * hexRadius;
    const x = hexCenter + distance * Math.cos(angleRad);
    const y = hexCenter + distance * Math.sin(angleRad);
    return `${x},${y}`;
  };

  const powerVal = userPlayerAttributes.power || 1;
  const timingVal = userPlayerAttributes.timing || 1;
  const spinDefVal = userPlayerAttributes.spinDef || 1;
  const paceDefVal = userPlayerAttributes.paceDef || 1;
  const deathBowlVal = userPlayerAttributes.deathBowl || 1;
  const econVal = userPlayerAttributes.economy || 1;

  const hexPointsString = [
    getHexPoint(0, powerVal),
    getHexPoint(60, timingVal),
    getHexPoint(120, spinDefVal),
    getHexPoint(180, paceDefVal),
    getHexPoint(240, deathBowlVal),
    getHexPoint(300, econVal)
  ].join(' ');

  const gridPoints = (val) => [
    getHexPoint(0, val),
    getHexPoint(60, val),
    getHexPoint(120, val),
    getHexPoint(180, val),
    getHexPoint(240, val),
    getHexPoint(300, val)
  ].join(' ');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="text-3xl">🧬</span> Nets Practice & RPG Training
        </h2>
        <p className="mt-2 text-slate-400 max-w-xl text-sm leading-relaxed">
          Level up your personal player traits to dominate simulations. Spend earned <strong className="text-cyan-400">Skill Points (XP)</strong> to upgrade your attribute web, or enter the practice net to face 3 deliveries for bonus XP.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 px-4 py-2 rounded-xl">
            <span className="text-slate-400 text-xs">Accumulated Skill XP:</span>
            <span className="font-black text-cyan-400 text-sm font-mono">{playerXP} XP</span>
          </div>
          <button
            onClick={handleMaxAll}
            disabled={isAlreadyMaxed}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              isAlreadyMaxed
                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-105'
            }`}
          >
            <span>⚡</span>
            {isAlreadyMaxed ? 'ALL MAXED OUT' : 'Max All Attributes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attribute upgrading & hex web (8 cols) */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Hexagonal Skill Web Render */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 shadow-inner">
                <svg width="240" height="240" className="overflow-visible select-none">
                  {/* Hexagon grid backdrops */}
                  {[2, 4, 6, 8, 10].map((val) => (
                    <polygon
                      key={val}
                      points={gridPoints(val)}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray="2"
                    />
                  ))}
                  {/* Spider web axis lines */}
                  {Array.from({ length: 6 }).map((_, i) => {
                    const angleRad = (i * 60 - 90) * Math.PI / 180;
                    return (
                      <line
                        key={i}
                        x1={hexCenter}
                        y1={hexCenter}
                        x2={hexCenter + hexRadius * Math.cos(angleRad)}
                        y2={hexCenter + hexRadius * Math.sin(angleRad)}
                        stroke="#1e293b"
                        strokeWidth="1"
                      />
                    );
                  })}
                  {/* Filled Attribute Hexagon */}
                  <polygon
                    points={hexPointsString}
                    fill="rgba(6, 182, 212, 0.2)"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    className="transition-all duration-300"
                  />
                  {/* Hex points decorators */}
                  {ATTRIBUTES.map((attr, i) => {
                    const currentVal = userPlayerAttributes[attr.key] || 1;
                    const point = getHexPoint(i * 60, currentVal).split(',');
                    return (
                      <circle
                        key={attr.key}
                        cx={point[0]}
                        cy={point[1]}
                        r="4"
                        fill="#06b6d4"
                        className="transition-all duration-300 shadow"
                      />
                    );
                  })}
                  {/* Labels */}
                  <text x={hexCenter} y={15} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">POW</text>
                  <text x={hexCenter + hexRadius + 15} y={hexCenter + 4} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="start">TIM</text>
                  <text x={hexCenter + hexRadius - 10} y={hexCenter + hexRadius - 10} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="start">SPN</text>
                  <text x={hexCenter} y={hexCenter + hexRadius + 20} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">PAC</text>
                  <text x={hexCenter - hexRadius - 10} y={hexCenter + hexRadius - 10} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">DTH</text>
                  <text x={hexCenter - hexRadius - 15} y={hexCenter + 4} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">ECO</text>
                </svg>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-bold mt-2 tracking-widest">
                Attribute Web
              </span>
            </div>

            {/* General player summary card */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 w-full space-y-3">
              <h4 className="font-bold text-white text-sm">USER: {userName || 'Active Player'}</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/40">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Batting SR</p>
                  <p className="font-black text-cyan-400 font-mono text-lg mt-0.5">{148 + (powerVal - 1) * 8}</p>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/40">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Batting AVG</p>
                  <p className="font-black text-cyan-400 font-mono text-lg mt-0.5">
                    {Math.round((35 + (timingVal - 1) * 5 + (spinDefVal - 1) * 1.5 + (paceDefVal - 1) * 1.5) * 10) / 10}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/40">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Bowl SR</p>
                  <p className="font-black text-purple-400 font-mono text-lg mt-0.5">{Math.max(10, 18 - (deathBowlVal - 1) * 1.5)}</p>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/40">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Bowl ECON</p>
                  <p className="font-black text-purple-400 font-mono text-lg mt-0.5">{Math.round((Math.max(5.0, 8.2 - (econVal - 1) * 0.45)) * 100) / 100}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrades panel */}
          <div className="space-y-3.5 border-t border-slate-900 pt-5">
            <h3 className="text-base font-bold text-white">🏋️ Practice & Skills Upgrade</h3>
            <div className="grid grid-cols-1 gap-3">
              {ATTRIBUTES.map((attr) => {
                const level = userPlayerAttributes[attr.key] || 1;
                const cost = getUpgradeCost(level);
                const canAfford = playerXP >= cost;
                const isCapped = level >= 10;

                return (
                  <div 
                    key={attr.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-900/35 border border-slate-800/60 rounded-xl gap-3 transition-colors hover:bg-slate-900/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{attr.name}</span>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold font-mono">
                          LVL {level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-normal leading-relaxed">{attr.desc}</p>
                    </div>

                    <button
                      disabled={!canAfford || isCapped}
                      onClick={() => handleUpgrade(attr.key)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shrink-0 transition-all duration-300 ${
                        isCapped 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                          : canAfford
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.35)] cursor-pointer'
                          : 'bg-slate-900/80 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      {isCapped ? 'CAPPED MAX' : `Upgrade: ${cost} XP`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Nets practice batting mini-game (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between min-h-[500px]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-3">
              <span>🏟️</span> Pre-Match Nets practice
            </h3>

            {!netsActive ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-3xl">
                  🏏
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Ready to Face Deliveries?</h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Practice your shots against elite pacers and spinners. Score boundaries and stack up XP for upgrades!
                  </p>
                </div>
                <button
                  onClick={startNetsPractice}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300"
                >
                  Enter Practice Nets
                </button>
              </div>
            ) : (
              <div className="space-y-5 mt-4">
                {/* Active mini-game status */}
                <div className="flex justify-between items-center bg-slate-900/50 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500">Bowler:</span>{' '}
                    <strong className="text-white font-semibold">{netsBowler}</strong>{' '}
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase font-bold ml-1">
                      {netsBowlerType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Ball:</span>{' '}
                    <strong className="text-cyan-400 font-black font-mono">{currentBall} of 3</strong>
                  </div>
                </div>

                {/* Delivery Logs */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {miniGameLog.map((log) => (
                    <div 
                      key={log.ball}
                      className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-3 space-y-2 animate-fadeIn"
                    >
                      <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-1.5">
                        <span className="text-slate-500 font-medium">Ball {log.ball}: {log.shot}</span>
                        <span className={`font-black font-mono text-[10px] uppercase px-2 py-0.5 rounded ${
                          log.outcome.includes('Wicket') 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : log.outcome.includes('SIX') || log.outcome.includes('FOUR')
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700/50'
                        }`}>
                          {log.outcome}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed italic">"{log.comment}"</p>
                      <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                        +{log.xpEarned} Skill XP
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mini-game action selector panel */}
          {netsActive && (
            <div className="border-t border-slate-900 pt-5 mt-5">
              {!practiceCompleted ? (
                <div className="space-y-3">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold text-center">
                    Select Defensive or Aggressive Tactic
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => playDelivery('lofted')}
                      className="py-3 px-2 bg-gradient-to-t from-cyan-900/40 to-cyan-950/10 hover:from-cyan-900/60 border border-cyan-800/80 hover:border-cyan-500 text-cyan-300 text-xs font-black uppercase rounded-xl tracking-wider transition-all duration-300 flex flex-col items-center gap-1.5"
                    >
                      <span className="text-lg">💥</span>
                      <span>Lofted Loft</span>
                      <span className="text-[9px] text-cyan-500 font-normal normal-case">High Risk / High XP</span>
                    </button>

                    <button
                      onClick={() => playDelivery('drive')}
                      className="py-3 px-2 bg-gradient-to-t from-purple-900/40 to-purple-950/10 hover:from-purple-900/60 border border-purple-800/80 hover:border-purple-500 text-purple-300 text-xs font-black uppercase rounded-xl tracking-wider transition-all duration-300 flex flex-col items-center gap-1.5"
                    >
                      <span className="text-lg">🏏</span>
                      <span>Cover Drive</span>
                      <span className="text-[9px] text-purple-500 font-normal normal-case">Med Risk / Med XP</span>
                    </button>

                    <button
                      onClick={() => playDelivery('defensive')}
                      className="py-3 px-2 bg-gradient-to-t from-slate-800/40 to-slate-950/10 hover:from-slate-800/60 border border-slate-800 hover:border-slate-600 text-slate-300 text-xs font-black uppercase rounded-xl tracking-wider transition-all duration-300 flex flex-col items-center gap-1.5"
                    >
                      <span className="text-lg">🛡️</span>
                      <span>Block</span>
                      <span className="text-[9px] text-slate-500 font-normal normal-case">Low Risk / Small XP</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 bg-slate-900/40 border border-slate-900 p-4 rounded-xl text-center">
                  <div className="text-2xl">🎉</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">Practice Complete!</h4>
                    <p className="text-xs text-slate-400">
                      You faced 3 premium deliveries and piled up{' '}
                      <strong className="text-cyan-400 font-extrabold">{accumulatedXP} Skill XP</strong>!
                    </p>
                  </div>
                  <button
                    onClick={() => setNetsActive(false)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Back to Gym
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
