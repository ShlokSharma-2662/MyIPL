namespace MyIPL.Api.Models;

/// <summary>Payload the React client posts when a season finishes.</summary>
public record SubmitSeasonRequest(
    string UserName,
    string Team,
    string Champion,
    bool Won,
    int Wins,
    int Losses,
    int Season,
    string? OrangeCapPlayer,
    int OrangeCapRuns,
    string? PurpleCapPlayer,
    int PurpleCapWickets,
    int UserRuns,
    int UserWickets,
    string Tourney = "Indian Premier League"
);

/// <summary>One aggregated row in the global leaderboard.</summary>
public record LeaderboardEntry(
    string Uid,
    string UserName,
    string Team,
    int Titles,
    int SeasonsPlayed,
    int TotalWins,
    double WinRate
);

/// <summary>A user's career profile assembled from their submitted seasons.</summary>
public record ProfileResponse(
    string Uid,
    string UserName,
    string Team,
    int Titles,
    int SeasonsPlayed,
    int TotalWins,
    int TotalLosses,
    double WinRate,
    IEnumerable<SeasonResult> Seasons
);
