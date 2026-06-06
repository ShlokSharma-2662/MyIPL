using System.ComponentModel.DataAnnotations;

namespace MyIPL.Api.Models;

/// <summary>
/// A user's saved game. The entire client state is stored opaquely as a JSON
/// document (portable across SQLite/Postgres). One row per (Uid, Slot).
/// </summary>
public class Game
{
    public int Id { get; set; }

    /// <summary>Firebase UID of the owner (from the verified JWT).</summary>
    [Required]
    public string Uid { get; set; } = string.Empty;

    /// <summary>Save slot — fixed to "default" for now; reserved for multi-save.</summary>
    [Required, MaxLength(40)]
    public string Slot { get; set; } = "default";

    /// <summary>The full client save, as raw JSON text.</summary>
    [Required]
    public string StateJson { get; set; } = "{}";

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
