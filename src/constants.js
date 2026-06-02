import { IPL_AGGREGATES } from './data/iplAggregates';

export const MAX_BALLS = 120;
// Toss: real IPL captains field first ~66% of the time after winning the toss.
export const TOSS_FIELD_FIRST_PROB = IPL_AGGREGATES.toss.fieldFirstProb;
export const MAX_BALLS_PER_BOWLER = 24;
export const MAX_ACTIVE_BOWLERS = 6;
export const USER_TEAM = 'CSK';
export const USER_BAT_SR = 200;
export const USER_BAT_AVG = 85;
export const USER_BOWL_SR = 9;
export const USER_BOWL_ECON = 5.5;
export const FORM_MIN = 0.88;
export const FORM_MAX = 1.12;
export const POWERPLAY_BALLS = 36;
export const IMPACT_WICKET_THRESHOLD = 3;
export const LEAGUE_MATCHES_PER_TEAM = 14;

// God mode — randomly activates in 6-7 CSK league matches per season
export const GOD_MODE_MIN = 6;
export const GOD_MODE_MAX = 7;
export const GOD_BAT_SR = 350;
export const GOD_BAT_AVG = 200;
export const GOD_BOWL_SR = 6;
export const GOD_BOWL_ECON = 2.5;

// ============================================================
// REAL-DATA CALIBRATION (derived from 283k IPL deliveries)
// ============================================================
// League-average runs/ball — the anchor the run model normalizes skill against.
// At an average matchup the per-ball boundary odds equal the real phase rates;
// God Mode / star traits scale this multiplicatively, so they still pop off.
export const LEAGUE_RPB = IPL_AGGREGATES.leagueRPO / 6;            // ≈ 1.40
// Per-phase scoring + dismissal-risk factors vs league average.
export const PHASE_FACTORS = IPL_AGGREGATES.phaseFactors;          // {powerplay,middle,death}
// Per-phase off-bat run distribution {0,1,2,3,4,6} — drives realistic boundary mix.
export const PHASE_RUN_DIST = IPL_AGGREGATES.runDist;
// Combined wide+no-ball rate per legal ball (replaces the old flat 0.04).
export const EXTRA_BALL_PROB = Math.round((IPL_AGGREGATES.extras.wideRate + IPL_AGGREGATES.extras.noballRate) * 1000) / 1000;
// Real dismissal-type weights (caught 63%, bowled 17%, lbw 6%, …) for wicket flavour.
export const DISMISSAL_MIX = IPL_AGGREGATES.dismissalMix;
