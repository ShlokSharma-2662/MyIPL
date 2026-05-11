# MyIPL

A fantasy T20 cricket simulator where **you** open the innings for CSK. Run a full 10-team IPL-style season, win the toss yourself, ride the random "God Mode" matches where you're untouchable, and chase the title through the playoffs bracket.

Built with **React 19 + Vite 8 + Tailwind v4**.

![MyIPL screenshot placeholder](public/favicon.svg)

---

## Features

### Core gameplay
- **10 teams · 70 league matches · 14 per side** — full round-robin schedule with rematches
- **You play as CSK's opener** with elite stats (SR 200, AVG 85, bowl SR 9, ECON 5.5)
- **Top 4 → Playoffs bracket**: Qualifier 1, Eliminator, Qualifier 2, Final
- **Toss interactivity** — when CSK wins the toss, *you* decide bat or bowl (batch sims auto-decide so they aren't interrupted)
- **Impact Player rule** — both batting and bowling subs trigger based on match state
- **Powerplay logic** — strike rate boosted, batting average dipped for the first 6 overs

### God Mode ⚡
- Randomly activated in **6–7 of your 14 CSK league matches** (chosen at season start)
- During god-mode matches: **SR 350 · AVG 200 · BOWL SR 6 · ECON 2.5**
- Full-screen alert pops up after each god-mode match (batched for SIM 10 / SIM ALL)
- Visual badges in Results list, My Profile, and the match detail modal
- Header HUD shows remaining god-mode triggers

### Variance
- **Per-match form cycles** — every non-user player gets a form factor (0.88×–1.12×) that adjusts their stats for that match only
- Replay the same season and you'll get a different story

### Stats & tracking
- **Points Table** with W/L/NRR, top-4 qualification glow
- **Sortable Orange / Purple Cap** leaderboards (runs, SR, HS, 50/100, wickets, econ)
- **My Profile** — match-by-match scorecards with W/L outcome and god-mode highlight
- **Season Summary** — champion, cap winners, your stats, native share / clipboard copy

### Persistence
- All state auto-saves to `localStorage` — refresh without losing progress
- "Reset" wipes everything

---

## Project structure

```
src/
├── constants.js          Magic numbers (powerplay balls, form ranges, god mode stats…)
├── data.js               TEAMS, ROSTERS, lineup helpers
├── simulation.js         Ball-by-ball innings sim, schedule generator, god mode pick
├── stats.js              Team & player stat aggregation, NRR
├── App.jsx               Top-level state machine (setup → league → playoffs → done)
├── main.jsx
├── index.css             Tailwind, fonts, animations, glass-panel
└── components/
    ├── TeamBadge.jsx
    ├── PhasePill.jsx
    ├── StatCard.jsx
    ├── SetupScreen.jsx
    ├── ControlBar.jsx
    ├── TabNav.jsx
    ├── PointsTable.jsx
    ├── ResultsList.jsx
    ├── StatsLeaderboards.jsx
    ├── MyProfile.jsx
    ├── PlayoffsView.jsx
    ├── MatchDetailModal.jsx
    ├── TossModal.jsx
    ├── GodModeAlert.jsx
    └── SeasonSummary.jsx
```

---

## Getting started

```bash
# install
npm install

# dev server (http://localhost:5173)
npm run dev

# production build
npm run build

# preview the build
npm run preview

# lint
npm run lint
```

---

## How a match is simulated

1. **Toss** — random winner. If CSK wins → modal asks you bat/bowl. Otherwise auto-decided (62% choose to bowl).
2. **Form factors** generated per player for the match (user always at 1.0).
3. **Innings 1 (120 balls / 10 wickets)** — ball-by-ball loop:
   - Powerplay (first 36 balls): SR ×1.15, AVG ×0.95
   - Per-ball out probability derived from `(batAvg × 100) / batSR`
   - Run distribution weighted by SR (6/4/2/1/0)
   - Impact Player swap triggers when batting team loses ≥3 wickets and the bench batter is better than the worst remaining
3. **Innings 2** — same loop, capped at chase target.
4. **Extras** randomly added (2–12).
5. **Bowler ledger** — balls distributed (max 24 per bowler), runs weighted by economy, wickets weighted by strike rate.
6. **Result** — wickets/runs/Super Over margin computed.

If the match was flagged as **god mode** at season start, your player's stats are swapped to god values for the duration of the sim, then restored.

---

## Stack

| Concern | Tech |
|---|---|
| UI | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 + custom glass-panel CSS |
| Icons | lucide-react |
| Fonts | Bebas Neue (display), IBM Plex Sans (body), IBM Plex Mono (numbers) |
| State | React `useState` + `useMemo` (no external state lib) |
| Persistence | `localStorage` (`ipl_sim_state_v1`) |

---

## Roadmap / ideas

- [ ] Manual team selection (play as anyone, not just CSK)
- [ ] Custom player creation / editing
- [ ] Multi-season career mode with stat history
- [ ] Live ball-by-ball animation (currently instant)
- [ ] Audio cues for sixes / wickets
- [ ] Export season summary as a shareable PNG card

---

## License

MIT — do whatever you want with it.
