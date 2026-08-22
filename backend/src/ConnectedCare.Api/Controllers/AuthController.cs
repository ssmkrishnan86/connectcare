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

    public record LoginRequest(string Username, string Password, string? Role = null);

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

        // Find user by username with roles and linked doctor/nurse profile
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Doctor)
            .Include(u => u.Nurse)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.Trim().ToLower() && u.IsActive);

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

        // Retrieve the user's assigned role(s) directly from the users -> user_role -> roles relationship
        var assignedRoles = user.UserRoles?.Select(ur => ur.Role?.RoleName).Where(r => !string.IsNullOrEmpty(r)).ToList() ?? new List<string?>();
        if (!assignedRoles.Any() && !string.IsNullOrEmpty(user.Role))
        {
            assignedRoles.Add(user.Role);
        }

        var primaryRole = assignedRoles.FirstOrDefault(r => !string.IsNullOrEmpty(r)) ?? "Admin";

        // Generate JWT Token
        var jwtSecret = _configuration["Jwt:SecretKey"] ?? "SuperSecretKeyForConnectedCareAdminPortalHospitalSystem2026";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "ConnectedCare";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "ConnectedCare.Web";

        var token = JwtTokenService.GenerateToken(user, jwtSecret, jwtIssuer, jwtAudience);

        // Resolve all role permissions from role_permission table
        var roleIds = user.UserRoles?.Select(ur => ur.RoleId).ToList() ?? new List<Guid>();
        var permissions = await _context.RolePermissions
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Select(rp => rp.PermissionKey)
            .Distinct()
            .ToListAsync();

        if (primaryRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) || assignedRoles.Any(r => r != null && r.Contains("Admin", StringComparison.OrdinalIgnoreCase)))
        {
            if (!permissions.Any())
            {
                permissions = await _context.AppPermissions.Select(p => p.PermissionKey).ToListAsync();
            }
        }

        return Ok(new
        {
            success = true,
            message = "Login successful",
            data = new
            {
                token,
                userId = user.Id,
                username = user.Username,
                fullName = user.FullName,
                email = user.Email,
                role = primaryRole,
                assignedRoles = assignedRoles,
                permissions = permissions,
                doctorId = user.Doctor?.Id,
                nurseId = user.Nurse?.Id,
                doctor = user.Doctor,
                nurse = user.Nurse
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
        string? username = User.Identity?.Name;
        if (string.IsNullOrEmpty(username))
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var jwt = authHeader["Bearer ".Length..].Trim();
                    var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                    if (handler.CanReadToken(jwt))
                    {
                        var jwtToken = handler.ReadJwtToken(jwt);
                        username = jwtToken.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Name || c.Type == "unique_name" || c.Type == "name" || c.Type == "sub")?.Value;
                    }
                }
                catch { }
            }
        }

        if (string.IsNullOrEmpty(username))
        {
            return Unauthorized(new { success = false, message = "Not authenticated" });
        }

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Doctor)
            .Include(u => u.Nurse)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());

        if (user == null)
        {
            return NotFound(new { success = false, message = "User record not found" });
        }

        var roles = user.UserRoles?.Select(ur => ur.Role?.RoleName).Where(r => !string.IsNullOrEmpty(r)).ToList() ?? new List<string?>();
        if (!roles.Any() && !string.IsNullOrEmpty(user.Role))
        {
            roles.Add(user.Role);
        }

        var roleIds = user.UserRoles?.Select(ur => ur.RoleId).ToList() ?? new List<Guid>();
        var permissions = await _context.RolePermissions
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Select(rp => rp.PermissionKey)
            .Distinct()
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                userId = user.Id,
                username = user.Username,
                fullName = user.FullName,
                email = user.Email,
                role = roles.FirstOrDefault() ?? user.Role,
                roles,
                permissions,
                doctorId = user.Doctor?.Id,
                nurseId = user.Nurse?.Id
            }
        });
    }
}
