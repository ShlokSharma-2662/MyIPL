using System.Security.Claims;

namespace MyIPL.Api.Auth;

public static class ClaimsExtensions
{
    /// <summary>
    /// Firebase ID tokens carry the UID in the "user_id" claim, with "sub" as a
    /// standard fallback. Returns null when neither is present.
    /// </summary>
    public static string? GetFirebaseUid(this ClaimsPrincipal user)
        => user.FindFirst("user_id")?.Value
           ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
           ?? user.FindFirst("sub")?.Value;
}
