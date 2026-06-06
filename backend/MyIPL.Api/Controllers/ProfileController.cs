using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyIPL.Api.Data;
using MyIPL.Api.Models;

namespace MyIPL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProfileController(AppDbContext db) => _db = db;

    /// <summary>The signed-in user's own career history.</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ProfileResponse>> Me()
    {
        var uid = User.GetFirebaseUid();
        if (uid is null) return Unauthorized();
        return await BuildProfile(uid);
    }

    /// <summary>Any user's public career history by UID.</summary>
    [HttpGet("{uid}")]
    public async Task<ActionResult<ProfileResponse>> ByUid(string uid)
        => await BuildProfile(uid);

    private async Task<ActionResult<ProfileResponse>> BuildProfile(string uid)
    {
        var seasons = await _db.SeasonResults
            .AsNoTracking()
            .Where(s => s.Uid == uid)
            .OrderByDescending(s => s.Season)
            .ToListAsync();

        if (seasons.Count == 0) return NotFound();

        var latest = seasons.First();
        int wins = seasons.Sum(s => s.Wins);
        int losses = seasons.Sum(s => s.Losses);
        int games = wins + losses;

        return new ProfileResponse(
            Uid: uid,
            UserName: latest.UserName,
            Team: latest.Team,
            Titles: seasons.Count(s => s.Won),
            SeasonsPlayed: seasons.Count,
            TotalWins: wins,
            TotalLosses: losses,
            WinRate: games == 0 ? 0 : Math.Round((double)wins / games, 3),
            Seasons: seasons
        );
    }
}
