using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Common.Models;

namespace ConnectedCare.Api.Controllers;

public record LoginRequestDto(string Username, string Password);
public record AuthResponseDto(string Token, string Username, string Role);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequestDto request)
    {
        // Prototype authentication handler
        if (request.Username == "john.admin" || request.Username == "admin")
        {
            var response = new AuthResponseDto(
                Token: "mock-jwt-token-connected-care-admin",
                Username: "John Admin",
                Role: "System Administrator"
            );
            return Ok(ApiResponse<AuthResponseDto>.Ok(response, "Login successful"));
        }

        return Unauthorized(ApiResponse<string>.Fail("Invalid credentials", "AUTH_FAILED"));
    }
}
