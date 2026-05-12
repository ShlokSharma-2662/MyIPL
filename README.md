# MyIPL: Fantasy T20 Career Simulator

A deep, persistent fantasy T20 cricket simulator where **you** open the innings for CSK. Run full 10-team IPL-style seasons, track your multi-season legacy, unleash random "God Mode" performances, and build your career's Rivalry Meter as you chase the ultimate title.

Built with **React 19 + Vite 8 + Tailwind v4**.

---

## Features

### Advanced Career Engine
- **Cloud Persistence & Authentication:** Secure Google Login via Firebase ensures your game state and career history are saved to the cloud and synced across devices.
- **Persistent Legacy Tracking:** Every season you complete is permanently saved to your career history.
- **10-Card Master Dashboards:** View your active season and all-time career metrics including Batting Average, Bowling Average, Strike Rate, Economy, Highest Score, Centuries, and Fifties.
- **All-Time Rivalry Meter:** The engine permanently tracks every win and loss your team has against every other franchise, displaying an immersive Head-to-Head win-rate progress bar.

### Core Gameplay
- **True IPL Scheduling:** 10 teams divided into two groups, mathematically generating a flawless 70-match league schedule where every team plays exactly 14 matches.
- **You play as CSK's opener** with elite stats (SR 200, AVG 85, bowl SR 9, ECON 5.5).
- **Top 4 → Playoffs bracket**: Qualifier 1, Eliminator, Qualifier 2, Final.
- **Toss Interactivity:** When CSK wins the toss, *you* decide whether to bat or bowl.
- **Impact Player Rule:** Both batting and bowling subs dynamically trigger based on match state (e.g. collapse or death overs).
- **Powerplay Logic:** Strike rates boosted, batting averages dipped for the first 6 overs.

### God Mode ⚡
- **League God Mode:** Randomly activated in **6–7 of your 14 CSK league matches**. During god-mode matches, your stats explode: **SR 350 · AVG 200 · BOWL SR 6 · ECON 2.5**.
- **Playoff God Mode:** You are granted a secret, bonus God Mode charge in the playoffs. It has a 50% chance to trigger in any playoff game, but is **100% guaranteed** to activate if you reach the Grand Final without using it!
- Visual badges in the Results list, My Profile, and match detail modal highlight these legendary performances.

### Variance & Simulation
- **Per-Match Form Cycles:** Every non-user player gets a unique form factor (0.88×–1.12×) that adjusts their baseline stats for that match only.
- **Dynamic User Form:** Your bowling gets slightly boosted if your batting fails in the 1st innings (and vice versa).

### Stats & Tracking
- **Points Table** with W/L/NRR, top-4 qualification glow.
- **Sortable Orange / Purple Cap** leaderboards tracking the entire league's performers.
- **Season Summary** native share / clipboard copy for showing off your championships.

---

## Project Structure

```
src/
├── constants.js          Magic numbers (powerplay balls, form ranges, god mode stats…)
├── data.js               TEAMS, ROSTERS, lineup helpers
├── firebase.js           Firebase configuration, Authentication, and Cloud Firestore helpers
├── simulation.js         Ball-by-ball innings sim, schedule generator, god mode pick
├── stats.js              Team & player stat aggregation, NRR
├── historyData.js        Seed data for legacy seasons and rivalries
├── hooks/
│   └── useTournament.js  Top-level state machine & localStorage persistence
├── App.jsx               Top-level routing and UI Shell
├── index.css             Tailwind, fonts, animations, glass-panel
└── components/
    ├── HistoryView.jsx   Career dashboard and Rivalry Meter
    ├── MyProfile.jsx     Active season 10-card dashboard
    ├── SetupScreen.jsx
    ├── ControlBar.jsx
    ├── TabNav.jsx
    ├── PointsTable.jsx
    ├── ResultsList.jsx
    ├── StatsLeaderboards.jsx
    ├── PlayoffsView.jsx
    ├── MatchDetailModal.jsx
    ├── TossModal.jsx
    ├── GodModeAlert.jsx
    └── SeasonSummary.jsx
```

---

## Getting Started

```bash
# install
npm install

# dev server (http://localhost:5173)
npm run dev

# production build
npm run build

# preview the build
npm run preview
```

---

## How a Match is Simulated

1. **Toss** — random winner. If CSK wins → modal asks you bat/bowl. Otherwise auto-decided.
2. **Form factors** generated per player for the match.
3. **Innings 1 (120 balls / 10 wickets)** — ball-by-ball loop:
   - Powerplay (first 36 balls): SR ×1.15, AVG ×0.95
   - Per-ball out probability derived from `(batAvg × 100) / batSR`
   - Run distribution weighted by SR (6/4/2/1/0)
   - Impact Player swaps dynamically executed based on match state.
4. **Innings 2** — same loop, capped at chase target.
5. **Bowler Ledger** — balls distributed evenly, runs weighted by economy, wickets by strike rate.
6. **Result** — computed including Super Over ties.

---

## Stack

| Concern | Tech |
|---|---|
| UI | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 + custom glass-panel CSS |
| Icons | lucide-react |
| Fonts | Bebas Neue (display), IBM Plex Sans (body), IBM Plex Mono (numbers) |
| State | Custom React Hooks (`useTournament.js`) |
| Persistence | Firebase Authentication & Cloud Firestore (previously `localStorage`) |

---

## Roadmap / Ideas

- [ ] Manual team selection (play as anyone, not just CSK)
- [ ] Custom player creation / editing
- [ ] Live ball-by-ball animation (currently instant)
- [ ] Audio cues for sixes / wickets
- [ ] Export season summary as a shareable PNG card

---

## License

MIT — do whatever you want with it.
