using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyIPL.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Railway (and most PaaS) inject the port to listen on via $PORT. Bind Kestrel
// to it when present; locally we fall back to launchSettings/ASPNETCORE_URLS.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ---------------------------------------------------------------------------
// Database (EF Core).
//   • Production (Railway/Heroku/Neon): they inject DATABASE_URL as a
//     `postgresql://…` URL — auto-detected and used for Postgres.
//   • Local dev: store DATABASE_URL in User Secrets, or set
//     Database:Provider=Postgres with ConnectionStrings:Default.
//   • Fallback: SQLite (`myipl.db`) so a fresh clone runs with zero config.
// ---------------------------------------------------------------------------
var configuredProvider = builder.Configuration["Database:Provider"];
var rawConn = builder.Configuration["DATABASE_URL"]
    ?? builder.Configuration.GetConnectionString("Default")
    ?? "Data Source=myipl.db";

var usePostgres = DbConnectionString.IsPostgresUrl(rawConn)
    || string.Equals(configuredProvider, "Postgres", StringComparison.OrdinalIgnoreCase);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (usePostgres)
    {
        var conn = DbConnectionString.IsPostgresUrl(rawConn)
            ? DbConnectionString.FromUrl(rawConn)
            : rawConn;
        options.UseNpgsql(conn);
    }
    else
    {
        options.UseSqlite(rawConn);
    }
});

// ---------------------------------------------------------------------------
// Firebase auth. Firebase ID tokens are standard JWTs signed by Google; the
// JWT Bearer middleware fetches Google's public keys from the Authority and
// validates the signature/issuer/audience. No service-account file needed.
// ---------------------------------------------------------------------------
var firebaseProjectId = builder.Configuration["Firebase:ProjectId"]
    ?? throw new InvalidOperationException("Firebase:ProjectId is not configured.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true,
        };
    });

builder.Services.AddAuthorization();

// ---------------------------------------------------------------------------
// CORS: the Vite dev origin from config, plus a comma-separated CORS_ORIGINS
// env var (easy to set in Railway for the deployed frontend URL).
// ---------------------------------------------------------------------------
var allowedOrigins = (builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? new[] { "http://localhost:5173" })
    .ToList();

var extraOrigins = builder.Configuration["CORS_ORIGINS"];
if (!string.IsNullOrWhiteSpace(extraOrigins))
    allowedOrigins.AddRange(extraOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Apply migrations / create the database on startup so first run just works.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // Railway terminates TLS at its edge and forwards plain HTTP to the
    // container, so HTTPS redirection only makes sense for local dev.
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
