import { IPL_AGGREGATES } from './data/iplAggregates';

// ============================================================
// Real IPL venues — franchise home grounds + scoring characteristics.
// Factors are derived from actual ball-by-ball runs-per-over at each ground,
// relative to the league average (>1 = batting paradise, <1 = bowler-friendly).
// ============================================================

// Aggregate all real name-variants of one ground (balls-weighted) into a
// single representative scoring factor.
function resolveVenue(displayName, kw) {
  const matches = IPL_AGGREGATES.venues.filter(v => kw.test(v.name));
  if (!matches.length) return { name: displayName, factor: 1, rpo: IPL_AGGREGATES.leagueRPO };
  let balls = 0, wFactor = 0, wRpo = 0;
  for (const v of matches) { balls += v.balls; wFactor += v.factor * v.balls; wRpo += v.rpo * v.balls; }
  return {
    name: displayName,
    factor: Math.round((wFactor / balls) * 1000) / 1000,
    rpo: Math.round((wRpo / balls) * 100) / 100,
  };
}

export const HOME_VENUES = {
  CSK:  resolveVenue('MA Chidambaram Stadium, Chennai', /Chidambaram|Chepauk/i),
  MI:   resolveVenue('Wankhede Stadium, Mumbai', /Wankhede/i),
  RCB:  resolveVenue('M Chinnaswamy Stadium, Bengaluru', /Chinnaswamy/i),
  KKR:  resolveVenue('Eden Gardens, Kolkata', /Eden Gardens/i),
  SRH:  resolveVenue('Rajiv Gandhi Intl. Stadium, Hyderabad', /Rajiv Gandhi|Uppal/i),
  DC:   resolveVenue('Arun Jaitley Stadium, Delhi', /Arun Jaitley|Feroz Shah Kotla/i),
  RR:   resolveVenue('Sawai Mansingh Stadium, Jaipur', /Sawai Mansingh/i),
  PBKS: resolveVenue('IS Bindra Stadium, Mohali', /Bindra|Mohali|Mullanpur|Yadavindra/i),
  GT:   resolveVenue('Narendra Modi Stadium, Ahmedabad', /Narendra Modi|Motera|Sardar Patel/i),
  LSG:  resolveVenue('Ekana Cricket Stadium, Lucknow', /Ekana/i),
};

// Damp the raw factor so venue swing is felt but never dominates match balance.
export function venueScoringEffect(factor) {
  const damped = 1 + (factor - 1) * 0.7;
  return Math.max(0.9, Math.min(1.12, Math.round(damped * 1000) / 1000));
}
