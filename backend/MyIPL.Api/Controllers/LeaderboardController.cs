using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyIPL.Api.Data;
using MyIPL.Api.Models;

namespace MyIPL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _db;
    public LeaderboardController(AppDbContext db) => _db = db;

    /// <summary>
    /// Submit a completed season. Requires a valid Firebase ID token.
    /// The UID is taken from the token, never trusted from the body.
    /// </summary>
    [HttpPost("season")]
    [Authorize]
    public async Task<ActionResult<SeasonResult>> SubmitSeason([FromBody] SubmitSeasonRequest req)
    {
        var uid = User.GetFirebaseUid();
        if (uid is null) return Unauthorized();

        var entity = new SeasonResult
        {
            Uid = uid,
            UserName = req.UserName,
            Team = req.Team,
            Tourney = req.Tourney,
            Champion = req.Champion,
            Won = req.Won,
            Wins = req.Wins,
            Losses = req.Losses,
            Season = req.Season,
            OrangeCapPlayer = req.OrangeCapPlayer,
            OrangeCapRuns = req.OrangeCapRuns,
            PurpleCapPlayer = req.PurpleCapPlayer,
            PurpleCapWickets = req.PurpleCapWickets,
            UserRuns = req.UserRuns,
            UserWickets = req.UserWickets,
        };

        _db.SeasonResults.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTop), new { }, entity);
    }

    /// <summary>
    /// Global leaderboard: one row per user, ranked by titles then win-rate.
    /// Public (no auth) so anyone can view standings.
    /// </summary>
    [HttpGet("top")]
    public async Task<ActionResult<IEnumerable<LeaderboardEntry>>> GetTop([FromQuery] int limit = 50)
    {
        limit = Math.Clamp(limit, 1, 200);

        // Pull the raw seasons, then aggregate in memory. Volume per user is tiny
        // (a handful of seasons), so this stays cheap and keeps the query portable
        // across SQLite/Postgres without provider-specific GROUP BY translation.
        var rows = await _db.SeasonResults.AsNoTracking().ToListAsync();

        var board = rows
            .GroupBy(s => s.Uid)
            .Select(g =>
            {
                var latest = g.OrderByDescending(s => s.CreatedAt).First();
                int wins = g.Sum(s => s.Wins);
                int games = g.Sum(s => s.Wins + s.Losses);
                return new LeaderboardEntry(
                    Uid: g.Key,
                    UserName: latest.UserName,
                    Team: latest.Team,
                    Titles: g.Count(s => s.Won),
                    SeasonsPlayed: g.Count(),
                    TotalWins: wins,
                    WinRate: games == 0 ? 0 : Math.Round((double)wins / games, 3)
                );
            })
            .OrderByDescending(e => e.Titles)
            .ThenByDescending(e => e.WinRate)
            .ThenByDescending(e => e.TotalWins)
            .Take(limit)
            .ToList();

        return Ok(board);
    }
}
