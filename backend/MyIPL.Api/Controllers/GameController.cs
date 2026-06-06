using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyIPL.Api.Data;
using MyIPL.Api.Models;

namespace MyIPL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GameController : ControllerBase
{
    private const string DefaultSlot = "default";
    private readonly AppDbContext _db;
    public GameController(AppDbContext db) => _db = db;

    /// <summary>Load the signed-in user's saved game, or 404 if none exists.</summary>
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var uid = User.GetFirebaseUid();
        if (uid is null) return Unauthorized();

        var game = await _db.Games.AsNoTracking()
            .FirstOrDefaultAsync(g => g.Uid == uid && g.Slot == DefaultSlot);
        if (game is null) return NotFound();

        // StateJson is already JSON — write it straight through, no re-serialization.
        return Content(game.StateJson, "application/json");
    }

    /// <summary>Create or replace the signed-in user's saved game.</summary>
    [HttpPut]
    public async Task<IActionResult> Put([FromBody] JsonElement state)
    {
        var uid = User.GetFirebaseUid();
        if (uid is null) return Unauthorized();

        var json = state.GetRawText();
        var game = await _db.Games.FirstOrDefaultAsync(g => g.Uid == uid && g.Slot == DefaultSlot);
        if (game is null)
        {
            _db.Games.Add(new Game { Uid = uid, Slot = DefaultSlot, StateJson = json, UpdatedAt = DateTime.UtcNow });
        }
        else
        {
            game.StateJson = json;
            game.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Delete the signed-in user's saved game (used on reset).</summary>
    [HttpDelete]
    public async Task<IActionResult> Delete()
    {
        var uid = User.GetFirebaseUid();
        if (uid is null) return Unauthorized();

        var game = await _db.Games.FirstOrDefaultAsync(g => g.Uid == uid && g.Slot == DefaultSlot);
        if (game is not null)
        {
            _db.Games.Remove(game);
            await _db.SaveChangesAsync();
        }
        return NoContent();
    }
}
