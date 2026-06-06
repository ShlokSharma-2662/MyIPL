using Microsoft.AspNetCore.Mvc;

namespace MyIPL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>Liveness probe — no auth, used by hosting platforms.</summary>
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok", time = DateTime.UtcNow });
}
