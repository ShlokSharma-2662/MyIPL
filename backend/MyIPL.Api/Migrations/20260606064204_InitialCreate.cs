using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MyIPL.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Games",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Uid = table.Column<string>(type: "text", nullable: false),
                    Slot = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    StateJson = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Games", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SeasonResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Uid = table.Column<string>(type: "text", nullable: false),
                    UserName = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Team = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    Tourney = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Champion = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    Won = table.Column<bool>(type: "boolean", nullable: false),
                    Wins = table.Column<int>(type: "integer", nullable: false),
                    Losses = table.Column<int>(type: "integer", nullable: false),
                    Season = table.Column<int>(type: "integer", nullable: false),
                    OrangeCapPlayer = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    OrangeCapRuns = table.Column<int>(type: "integer", nullable: false),
                    PurpleCapPlayer = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    PurpleCapWickets = table.Column<int>(type: "integer", nullable: false),
                    UserRuns = table.Column<int>(type: "integer", nullable: false),
                    UserWickets = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeasonResults", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Games_Uid_Slot",
                table: "Games",
                columns: new[] { "Uid", "Slot" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SeasonResults_Champion",
                table: "SeasonResults",
                column: "Champion");

            migrationBuilder.CreateIndex(
                name: "IX_SeasonResults_Uid",
                table: "SeasonResults",
                column: "Uid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Games");

            migrationBuilder.DropTable(
                name: "SeasonResults");
        }
    }
}
