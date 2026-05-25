export const FORMATS = {
  T20: {
    name: 'T20 International',
    format: 'T20',
    ballsPerInnings: 120,
    ballsPerBowler: 24,
    powerplayBalls: 36,
    inningsPerSide: 1,
    allowDraw: false,
    srMultiplier: 1.0,
    avgMultiplier: 1.0,
  },
  ODI: {
    name: 'One Day International',
    format: 'ODI',
    ballsPerInnings: 300,
    ballsPerBowler: 60,
    powerplayBalls: 60,
    inningsPerSide: 1,
    allowDraw: false,
    srMultiplier: 0.85,
    avgMultiplier: 1.1,
  },
  TEST: {
    name: 'Test Match',
    format: 'TEST',
    ballsPerInnings: 720, // Max balls per innings (120 overs)
    ballsPerBowler: 9999, // No individual bowler limit in Tests
    powerplayBalls: 0,
    inningsPerSide: 2,
    allowDraw: true,
    srMultiplier: 0.55,  // Test strike rates are much lower
    avgMultiplier: 1.25, // Test averages are higher due to defensive patience
    matchBallLimit: 2700, // 5 days * 90 overs = 450 overs = 2700 balls max
  }
};
