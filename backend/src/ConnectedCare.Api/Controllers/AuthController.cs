using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Application.Common.Security;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(ConnectedCareDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public record LoginRequest(string Username, string Password, string Role);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                success = false,
                message = "Username and password are required.",
                data = (object?)null
            });
        }

        // Validate Role - Dropdown contains ONLY 3 Options: Doctor, Nurse, Admin
        var validRoles = new[] { "Doctor", "Nurse", "Admin" };
        var selectedRole = request.Role?.Trim();

        if (string.IsNullOrWhiteSpace(selectedRole) || !validRoles.Any(r => r.Equals(selectedRole, StringComparison.OrdinalIgnoreCase)))
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid role selected. Allowed roles are Doctor, Nurse, Admin.",
                data = (object?)null
            });
        }

        // Find user by username
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.Trim().ToLower() && u.IsActive);

        if (user == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid username or password.",
                data = (object?)null
            });
        }

        // Verify cryptographic password hash
        bool isPasswordValid = PasswordHasher.VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt);
        if (!isPasswordValid)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid username or password.",
                data = (object?)null
            });
        }

        // Verify that the assigned role in DB matches the selected role
        bool roleMatches = string.Equals(user.Role, selectedRole, StringComparison.OrdinalIgnoreCase) ||
                           (selectedRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) && user.Role.Contains("Admin", StringComparison.OrdinalIgnoreCase));

        if (!roleMatches)
        {
            return BadRequest(new
            {
                success = false,
                message = $"Role mismatch. Account '{user.Username}' is assigned role '{user.Role}', but '{selectedRole}' was selected.",
                data = (object?)null
            });
        }

        // Generate JWT Token
        var jwtSecret = _configuration["Jwt:SecretKey"] ?? "SuperSecretKeyForConnectedCareAdminPortalHospitalSystem2026";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "ConnectedCare";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "ConnectedCare.Web";

        var token = JwtTokenService.GenerateToken(user, jwtSecret, jwtIssuer, jwtAudience);

        return Ok(new
        {
            success = true,
            message = "Login successful",
            data = new
            {
                token,
                userId = user.Id,
                username = user.Username,
                email = user.Email,
                role = selectedRole,
                assignedRole = user.Role
            }
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new
        {
            success = true,
            message = "Logged out successfully"
        });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrEmpty(username))
        {
            return Unauthorized(new { success = false, message = "Not authenticated" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
        if (user == null)
        {
            return NotFound(new { success = false, message = "User record not found" });
        }

        return Ok(new
        {
            success = true,
            data = new
            {
                userId = user.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role
            }
        });
    }
}
