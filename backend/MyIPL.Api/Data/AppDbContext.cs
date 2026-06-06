using Microsoft.EntityFrameworkCore;
using MyIPL.Api.Models;

namespace MyIPL.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<SeasonResult> SeasonResults => Set<SeasonResult>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SeasonResult>(e =>
        {
            // Leaderboard queries filter/group by user; index keeps them fast.
            e.HasIndex(s => s.Uid);
            e.HasIndex(s => s.Champion);
        });
    }
}
