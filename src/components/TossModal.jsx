import React, { useState, useEffect } from 'react';
import { Coins, Swords, CheckCircle2 } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { USER_TEAM } from '../constants';

export default function TossModal({ toss, onChoose }) {
  if (!toss) return null;

  const opponent = toss.home === USER_TEAM ? toss.away : toss.home;
  const isUserWinner = toss.tossWinner === USER_TEAM;

  // Toss steps: 'guess' | 'flipping' | 'result'
  const [step, setStep] = useState('guess');
  const [userGuess, setUserGuess] = useState(null);
  const [animationClass, setAnimationClass] = useState('');
  const [coinResult, setCoinResult] = useState(null);

  // Reset modal state when a new toss is received
  useEffect(() => {
    setStep('guess');
    setUserGuess(null);
    setAnimationClass('');
    setCoinResult(null);
  }, [toss]);

  const handleGuess = (guess) => {
    setUserGuess(guess);
    setStep('flipping');
    
    // Predetermined outcome matching parent state
    // If user is designated winner, land on their guess. If they lost, land on the opposite.
    const result = isUserWinner ? guess : (guess === 'Heads' ? 'Tails' : 'Heads');
    setCoinResult(result);

    // Apply animation class after a micro-delay
    setTimeout(() => {
      setAnimationClass(result === 'Heads' ? 'animate-flip-heads' : 'animate-flip-tails');
    }, 50);

    // Complete flip after 2 seconds
    setTimeout(() => {
      setStep('result');
    }, 2050);
  };

  const handleCloseLoss = () => {
    // If opponent won, proceed directly with their pre-determined decision
    onChoose(toss.tossDecision);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel rounded-2xl max-w-sm w-full p-8 text-center animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500/5 blur-[90px] rounded-full pointer-events-none" />

        <div className="text-[10px] tracking-[0.3em] text-amber-400 mb-1 font-bold relative z-10">
          TOSS — {toss.label.toUpperCase()}
        </div>

        <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
          <TeamBadge teamId={USER_TEAM} size="sm" />
          <span className="text-zinc-500 text-xs font-mono">vs</span>
          <TeamBadge teamId={opponent} size="sm" />
        </div>

        {/* 1. GUESS STEP */}
        {step === 'guess' && (
          <div className="relative z-10 animate-fade-in">
            <Coins className="w-12 h-12 text-amber-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
            <h2 className="text-3xl font-black mb-3 text-zinc-100" style={{ fontFamily: 'Bebas Neue' }}>
              CALL THE TOSS
            </h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Choose Heads or Tails to spin the coin, Captain!
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleGuess('Heads')}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold py-4 rounded-lg tracking-wider text-sm transition-all hover:-translate-y-0.5"
              >
                HEADS
              </button>
              <button
                onClick={() => handleGuess('Tails')}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold py-4 rounded-lg tracking-wider text-sm transition-all hover:-translate-y-0.5"
              >
                TAILS
              </button>
            </div>
          </div>
        )}

        {/* 2. FLIPPING STEP */}
        {step === 'flipping' && (
          <div className="relative z-10 py-6 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className={`coin flex items-center justify-center text-black font-black text-xl select-none ${animationClass}`}>
                <div className="absolute backface-hidden font-bold">HEADS</div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-zinc-200 tracking-wider animate-pulse">
              SPINNING THE COIN...
            </h3>
            <p className="text-zinc-500 text-xs mt-2">Best of luck!</p>
          </div>
        )}

        {/* 3. RESULT STEP */}
        {step === 'result' && (
          <div className="relative z-10 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-400 font-mono font-black text-xs uppercase tracking-widest">
                {coinResult}
              </span>
            </div>

            {isUserWinner ? (
              <>
                <h2 className="text-3xl font-black text-emerald-400 mb-2" style={{ fontFamily: 'Bebas Neue' }}>
                  YOU WON THE TOSS!
                </h2>
                <p className="text-zinc-400 text-sm mb-6">
                  Select your preference to begin match.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onChoose('bat')}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold py-4 rounded-lg tracking-wider text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20"
                  >
                    BAT FIRST
                  </button>
                  <button
                    onClick={() => onChoose('bowl')}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-4 rounded-lg tracking-wider text-sm transition-all hover:-translate-y-0.5"
                  >
                    BOWL FIRST
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-black text-red-400 mb-2" style={{ fontFamily: 'Bebas Neue' }}>
                  TOSS LOST
                </h2>
                <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                  The opposing captain won the toss and decided to <strong className="text-amber-400 uppercase">{toss.tossDecision === 'bat' ? 'Bat' : 'Bowl'}</strong> first.
                </p>
                <button
                  onClick={handleCloseLoss}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-4 rounded-lg tracking-wider text-sm transition-all shadow-lg hover:-translate-y-0.5"
                >
                  PROCEED TO MATCH
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
