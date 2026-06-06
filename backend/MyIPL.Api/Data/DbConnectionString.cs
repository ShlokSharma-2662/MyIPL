using Npgsql;

namespace MyIPL.Api.Data;

public static class DbConnectionString
{
    public static bool IsPostgresUrl(string? value) =>
        value is not null &&
        (value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
         value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Convert a `postgres://user:pass@host:port/db` URL (the format Railway,
    /// Heroku, Neon, etc. expose) into an Npgsql key-value connection string,
    /// with SSL required for the public proxy connection.
    /// </summary>
    public static string FromUrl(string url)
    {
        var uri = new Uri(url);
        var userInfo = uri.UserInfo.Split(':', 2);

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
            Database = uri.AbsolutePath.TrimStart('/'),
            // Npgsql 8+: Require encrypts the connection without validating the
            // server's CA chain — the right mode for Railway's managed proxy.
            SslMode = SslMode.Require,
        };

        return builder.ConnectionString;
    }
}
