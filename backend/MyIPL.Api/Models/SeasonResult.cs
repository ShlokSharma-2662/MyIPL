using System.ComponentModel.DataAnnotations;

namespace MyIPL.Api.Models;

/// <summary>
/// A completed season submitted by a user. One row per finished tournament.
/// Persisted via EF Core; aggregated into leaderboard standings.
/// </summary>
public class SeasonResult
{
    public int Id { get; set; }

    /// <summary>Firebase UID of the submitting user (from the verified JWT).</summary>
    [Required]
    public string Uid { get; set; } = string.Empty;

    /// <summary>In-game player name chosen at setup (not the Google account name).</summary>
    [Required, MaxLength(60)]
    public string UserName { get; set; } = string.Empty;

    /// <summary>User's franchise, e.g. "CSK".</summary>
    [Required, MaxLength(8)]
    public string Team { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Tourney { get; set; } = "Indian Premier League";

    /// <summary>Team id that won the title this season.</summary>
    [Required, MaxLength(8)]
    public string Champion { get; set; } = string.Empty;

    /// <summary>True when the user's team lifted the trophy.</summary>
    public bool Won { get; set; }

    public int Wins { get; set; }
    public int Losses { get; set; }

    /// <summary>Season number within the user's career.</summary>
    public int Season { get; set; }

    // --- Headline awards (optional, for richer leaderboard cards) ---
    [MaxLength(60)] public string? OrangeCapPlayer { get; set; }
    public int OrangeCapRuns { get; set; }
    [MaxLength(60)] public string? PurpleCapPlayer { get; set; }
    public int PurpleCapWickets { get; set; }

    // --- The user's own line for the season ---
    public int UserRuns { get; set; }
    public int UserWickets { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
