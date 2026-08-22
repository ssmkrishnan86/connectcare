using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Features.Authentication.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Application.Common.Security;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Domain.Entities;

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

        var reqUser = request.Username.Trim().ToLower();
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Doctor)
            .Include(u => u.Nurse)
            .FirstOrDefaultAsync(u => (u.Username.ToLower() == reqUser || u.Email.ToLower() == reqUser || (u.FullName != null && u.FullName.ToLower() == reqUser)) && u.IsActive);

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

        // Auto-link or auto-create Doctor or Nurse profile if not linked
        var doctor = user.Doctor;
        if (doctor == null && (primaryRole.Equals("Doctor", StringComparison.OrdinalIgnoreCase) || assignedRoles.Contains("Doctor")))
        {
            doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == user.Id || d.Email.ToLower() == user.Email.ToLower() || d.Name.ToLower() == user.FullName.ToLower() || d.Name.ToLower() == user.Username.ToLower());
            if (doctor == null)
            {
                doctor = new Doctor
                {
                    UserId = user.Id,
                    DoctorIdCode = $"DOC-{Random.Shared.Next(1000, 9999)}",
                    Name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username,
                    Email = user.Email,
                    Phone = !string.IsNullOrWhiteSpace(user.Phone) ? user.Phone : "(512) 555-0100",
                    Avatar = !string.IsNullOrWhiteSpace(user.Avatar) ? user.Avatar : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
                    Specialty = "General Medicine",
                    Department = "Internal Medicine",
                    Location = "Main Campus",
                    Status = DoctorStatus.Active,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };
                _context.Doctors.Add(doctor);
                await _context.SaveChangesAsync();
            }
            else if (doctor.UserId != user.Id)
            {
                doctor.UserId = user.Id;
                await _context.SaveChangesAsync();
            }
        }

        var nurse = user.Nurse;
        if (nurse == null && (primaryRole.Equals("Nurse", StringComparison.OrdinalIgnoreCase) || assignedRoles.Contains("Nurse")))
        {
            nurse = await _context.Nurses.FirstOrDefaultAsync(n => n.UserId == user.Id || n.Email.ToLower() == user.Email.ToLower() || n.Name.ToLower() == user.FullName.ToLower() || n.Name.ToLower() == user.Username.ToLower());
            if (nurse == null)
            {
                nurse = new Nurse
                {
                    UserId = user.Id,
                    NurseIdCode = $"NRS-{Random.Shared.Next(1000, 9999)}",
                    Name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username,
                    Email = user.Email,
                    Phone = !string.IsNullOrWhiteSpace(user.Phone) ? user.Phone : "(512) 555-0100",
                    Avatar = !string.IsNullOrWhiteSpace(user.Avatar) ? user.Avatar : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
                    Department = "General Ward",
                    SubUnit = "Floor 2",
                    Location = "Main Campus",
                    Shift = "Day Shift (08:00 AM - 04:00 PM)",
                    Status = DoctorStatus.Active,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };
                _context.Nurses.Add(nurse);
                await _context.SaveChangesAsync();
            }
            else if (nurse.UserId != user.Id)
            {
                nurse.UserId = user.Id;
                await _context.SaveChangesAsync();
            }
        }

        // Generate JWT Token
        var jwtSecret = _configuration["Jwt:SecretKey"] ?? "SuperSecretKeyForConnectedCareAdminPortalHospitalSystem2026";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "ConnectedCare";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "ConnectedCare.Web";

        var token = JwtTokenService.GenerateToken(user, jwtSecret, jwtIssuer, jwtAudience, primaryRole, doctor?.Id, nurse?.Id);

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
                doctorId = doctor?.Id,
                nurseId = nurse?.Id,
                doctor = doctor,
                nurse = nurse
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

        var reqUser = username.Trim().ToLower();
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Doctor)
            .Include(u => u.Nurse)
            .FirstOrDefaultAsync(u => (u.Username.ToLower() == reqUser || u.Email.ToLower() == reqUser || (u.FullName != null && u.FullName.ToLower() == reqUser)) && u.IsActive);

        if (user == null)
        {
            return NotFound(new { success = false, message = "User record not found" });
        }

        var roles = user.UserRoles?.Select(ur => ur.Role?.RoleName).Where(r => !string.IsNullOrEmpty(r)).ToList() ?? new List<string?>();
        if (!roles.Any() && !string.IsNullOrEmpty(user.Role))
        {
            roles.Add(user.Role);
        }

        var primaryRole = roles.FirstOrDefault(r => !string.IsNullOrEmpty(r)) ?? user.Role;

        var doctor = user.Doctor;
        if (doctor == null && (primaryRole.Equals("Doctor", StringComparison.OrdinalIgnoreCase) || roles.Contains("Doctor")))
        {
            doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == user.Id || d.Email.ToLower() == user.Email.ToLower() || d.Name.ToLower() == user.FullName.ToLower() || d.Name.ToLower() == user.Username.ToLower());
            if (doctor == null)
            {
                doctor = new Doctor
                {
                    UserId = user.Id,
                    DoctorIdCode = $"DOC-{Random.Shared.Next(1000, 9999)}",
                    Name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username,
                    Email = user.Email,
                    Phone = !string.IsNullOrWhiteSpace(user.Phone) ? user.Phone : "(512) 555-0100",
                    Avatar = !string.IsNullOrWhiteSpace(user.Avatar) ? user.Avatar : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
                    Specialty = "General Medicine",
                    Department = "Internal Medicine",
                    Location = "Main Campus",
                    Status = DoctorStatus.Active,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };
                _context.Doctors.Add(doctor);
                await _context.SaveChangesAsync();
            }
            else if (doctor.UserId != user.Id)
            {
                doctor.UserId = user.Id;
                await _context.SaveChangesAsync();
            }
        }

        var nurse = user.Nurse;
        if (nurse == null && (primaryRole.Equals("Nurse", StringComparison.OrdinalIgnoreCase) || roles.Contains("Nurse")))
        {
            nurse = await _context.Nurses.FirstOrDefaultAsync(n => n.UserId == user.Id || n.Email.ToLower() == user.Email.ToLower() || n.Name.ToLower() == user.FullName.ToLower() || n.Name.ToLower() == user.Username.ToLower());
            if (nurse == null)
            {
                nurse = new Nurse
                {
                    UserId = user.Id,
                    NurseIdCode = $"NRS-{Random.Shared.Next(1000, 9999)}",
                    Name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username,
                    Email = user.Email,
                    Phone = !string.IsNullOrWhiteSpace(user.Phone) ? user.Phone : "(512) 555-0100",
                    Avatar = !string.IsNullOrWhiteSpace(user.Avatar) ? user.Avatar : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
                    Department = "General Ward",
                    SubUnit = "Floor 2",
                    Location = "Main Campus",
                    Shift = "Day Shift (08:00 AM - 04:00 PM)",
                    Status = DoctorStatus.Active,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };
                _context.Nurses.Add(nurse);
                await _context.SaveChangesAsync();
            }
            else if (nurse.UserId != user.Id)
            {
                nurse.UserId = user.Id;
                await _context.SaveChangesAsync();
            }
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
                role = primaryRole,
                roles,
                permissions,
                doctorId = doctor?.Id,
                nurseId = nurse?.Id
            }
        });
    }
}

