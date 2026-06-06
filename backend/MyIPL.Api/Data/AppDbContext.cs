using Microsoft.EntityFrameworkCore;
using MyIPL.Api.Models;

namespace MyIPL.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<SeasonResult> SeasonResults => Set<SeasonResult>();
    public DbSet<Game> Games => Set<Game>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SeasonResult>(e =>
        {
            // Leaderboard queries filter/group by user; index keeps them fast.
            e.HasIndex(s => s.Uid);
            e.HasIndex(s => s.Champion);
        });

        modelBuilder.Entity<Game>(e =>
        {
            // One save per (user, slot); also the lookup key for load/save.
            e.HasIndex(g => new { g.Uid, g.Slot }).IsUnique();
        });
    }
}
