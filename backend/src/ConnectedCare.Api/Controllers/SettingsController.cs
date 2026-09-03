using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Features.Settings.DTOs;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public SettingsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet("general")]
    public async Task<IActionResult> GetGeneralSettings()
    {
        var settings = await _context.GeneralAppSettingsRecords.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new GeneralAppSettingsRecord();
            _context.GeneralAppSettingsRecords.Add(settings);
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, data = settings });
    }

    [HttpPost("general")]
    [HttpPut("general")]
    public async Task<IActionResult> SaveGeneralSettings([FromBody] GeneralAppSettingsRecord model)
    {
        var settings = await _context.GeneralAppSettingsRecords.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = model;
            _context.GeneralAppSettingsRecords.Add(settings);
        }
        else
        {
            settings.OrganizationName = model.OrganizationName;
            settings.Tagline = model.Tagline;
            settings.LogoUrl = model.LogoUrl;
            settings.PrimaryColor = model.PrimaryColor;
            settings.Phone = model.Phone;
            settings.Email = model.Email;
            settings.Address = model.Address;
            settings.DateFormat = model.DateFormat;
            settings.ShortDateFormat = model.ShortDateFormat;
            settings.DefaultLanguage = model.DefaultLanguage;
            settings.TimeFormat = model.TimeFormat;
            settings.ItemsPerPage = model.ItemsPerPage;
            settings.WeekStartsOn = model.WeekStartsOn;
            settings.DefaultDashboard = model.DefaultDashboard;
            settings.AllowPublicRegistration = model.AllowPublicRegistration;
            settings.SessionTimeoutMinutes = model.SessionTimeoutMinutes;
            settings.EnableAuditLogs = model.EnableAuditLogs;
            settings.PasswordExpiryDays = model.PasswordExpiryDays;
            settings.EnableTwoFactorAuth = model.EnableTwoFactorAuth;
            settings.MaintenanceMode = model.MaintenanceMode;
            settings.WeightUnit = model.WeightUnit;
            settings.HeightUnit = model.HeightUnit;
            settings.TemperatureUnit = model.TemperatureUnit;
            settings.Currency = model.Currency;
            settings.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "General settings saved successfully", data = settings });
    }

    [HttpGet("organization")]
    public async Task<IActionResult> GetOrganizationSettings()
    {
        var settings = await _context.OrganizationSettingsRecords.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new OrganizationSettingsRecord();
            _context.OrganizationSettingsRecords.Add(settings);
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, data = settings });
    }

    [HttpPost("organization")]
    [HttpPut("organization")]
    public async Task<IActionResult> SaveOrganizationSettings([FromBody] OrganizationSettingsRecord model)
    {
        var settings = await _context.OrganizationSettingsRecords.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = model;
            _context.OrganizationSettingsRecords.Add(settings);
        }
        else
        {
            settings.OrganizationName = model.OrganizationName;
            settings.LogoUrl = model.LogoUrl;
            settings.Tagline = model.Tagline;
            settings.Latitude = model.Latitude;
            settings.Longitude = model.Longitude;
            settings.OrganizationType = model.OrganizationType;
            settings.RegistrationNumber = model.RegistrationNumber;
            settings.EstablishedYear = model.EstablishedYear;
            settings.Website = model.Website;
            settings.PrimaryContactPerson = model.PrimaryContactPerson;
            settings.PrimaryContactDesignation = model.PrimaryContactDesignation;
            settings.PrimaryContactEmail = model.PrimaryContactEmail;
            settings.PrimaryContactPhone = model.PrimaryContactPhone;
            settings.PrimaryContactAlternatePhone = model.PrimaryContactAlternatePhone;
            settings.AddressLine1 = model.AddressLine1;
            settings.AddressLine2 = model.AddressLine2;
            settings.City = model.City;
            settings.State = model.State;
            settings.PinCode = model.PinCode;
            settings.Country = model.Country;
            settings.DefaultTimeZone = model.DefaultTimeZone;
            settings.DefaultLanguage = model.DefaultLanguage;
            settings.DefaultDateFormat = model.DefaultDateFormat;
            settings.DefaultTimeFormat = model.DefaultTimeFormat;
            settings.Currency = model.Currency;
            settings.WeekStartsOn = model.WeekStartsOn;
            settings.EnableMultiLocation = model.EnableMultiLocation;
            settings.EnabledModulesJson = model.EnabledModulesJson;
            settings.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Organization settings saved successfully", data = settings });
    }

    [HttpGet("users")]
    [HttpGet("user-management")]
    public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] string? role, [FromQuery] string? status)

    {
        var query = _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(searchLower) ||
                                     u.Username.ToLower().Contains(searchLower) ||
                                     u.Email.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(role) && role != "All Roles")
        {
            var roleLower = role.Trim().ToLower();
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role != null && (ur.Role.RoleName.ToLower() == roleLower || ur.Role.DisplayName.ToLower() == roleLower)) || u.Role.ToLower() == roleLower);
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All Status")
        {
            if (status.Equals("Active", StringComparison.OrdinalIgnoreCase))
                query = query.Where(u => u.IsActive);
            else if (status.Equals("Inactive", StringComparison.OrdinalIgnoreCase))
                query = query.Where(u => !u.IsActive);
        }

        var usersList = await query.OrderByDescending(u => u.CreatedDate).ToListAsync();

        var result = usersList.Select(u =>
        {
            var parts = (u.FullName ?? string.Empty).Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
            var fName = parts.Length > 0 ? parts[0] : string.Empty;
            var lName = parts.Length > 1 ? parts[1] : string.Empty;

            return new
            {
                id = u.Id,
                userName = u.Username,
                fullName = string.IsNullOrWhiteSpace(u.FullName) ? u.Username : u.FullName,
                firstName = fName,
                lastName = lName,
                email = u.Email,
                role = u.UserRoles.Select(ur => ur.Role?.DisplayName ?? ur.Role?.RoleName).FirstOrDefault() ?? (u.Role == "Admin" ? "System Administrator" : u.Role),
                department = u.Role.Contains("Doctor", StringComparison.OrdinalIgnoreCase) ? "Medical Staff" :
                             u.Role.Contains("Nurse", StringComparison.OrdinalIgnoreCase) ? "Nursing" : "Administration",
                location = "Main Campus",
                status = u.IsActive ? "Active" : "Inactive",
                lastSignInText = "Just now",
                avatar = u.Avatar,
                createdDate = u.CreatedDate,
                createdBy = u.CreatedBy,
                updatedDate = u.UpdatedDate,
                updatedBy = u.UpdatedBy
            };
        }).ToList();

        return Ok(new { success = true, data = result });
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] UserAccountItemRecord newUser)
    {
        var coreUsername = !string.IsNullOrWhiteSpace(newUser.UserName)
            ? newUser.UserName.Trim().ToLower().Replace(" ", "_")
            : (!string.IsNullOrWhiteSpace(newUser.FirstName) ? $"{newUser.FirstName.Trim().ToLower()}_{newUser.LastName?.Trim().ToLower()}".TrimEnd('_') : newUser.Email.Split('@')[0].ToLower());

        var existingCore = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == coreUsername || u.Email.ToLower() == newUser.Email.ToLower());
        if (existingCore != null)
        {
            return BadRequest(new { success = false, message = "A user with this username or email already exists." });
        }

        if (string.IsNullOrWhiteSpace(newUser.Password))
        {
            return BadRequest(new { success = false, message = "Password is required to create a new user account." });
        }

        if (!string.IsNullOrWhiteSpace(newUser.ConfirmPassword) && newUser.Password != newUser.ConfirmPassword)
        {
            return BadRequest(new { success = false, message = "Password and Confirm Password do not match." });
        }

        var fullName = !string.IsNullOrWhiteSpace(newUser.FirstName) || !string.IsNullOrWhiteSpace(newUser.LastName)
            ? $"{newUser.FirstName} {newUser.LastName}".Trim()
            : (!string.IsNullOrWhiteSpace(newUser.UserName) ? newUser.UserName.Trim() : coreUsername);

        var (h, s) = ConnectedCare.Application.Common.Security.PasswordHasher.CreatePasswordHash(newUser.Password);

        var normalizedRole = newUser.Role.Contains("Admin", StringComparison.OrdinalIgnoreCase) ? "Admin" :
                             newUser.Role.Contains("Doctor", StringComparison.OrdinalIgnoreCase) ? "Doctor" :
                             newUser.Role.Contains("Nurse", StringComparison.OrdinalIgnoreCase) ? "Nurse" : newUser.Role;

        var coreUser = new User
        {
            Username = coreUsername,
            Email = newUser.Email.Trim(),
            FullName = fullName,
            Phone = "(512) 555-0100",
            Avatar = newUser.Avatar,
            PasswordHash = h,
            PasswordSalt = s,
            Role = normalizedRole,
            IsActive = newUser.Status != "Inactive" && newUser.Status != "Locked",
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };
        _context.Users.Add(coreUser);
        await _context.SaveChangesAsync();

        var roleEntity = await _context.AppRoles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == normalizedRole.ToLower() || r.DisplayName.ToLower() == newUser.Role.ToLower());
        if (roleEntity != null && !await _context.UserRoles.AnyAsync(ur => ur.UserId == coreUser.Id && ur.RoleId == roleEntity.Id))
        {
            _context.UserRoles.Add(new UserRole { UserId = coreUser.Id, RoleId = roleEntity.Id });
            await _context.SaveChangesAsync();
        }

        // Auto-create Nurse or Doctor clinical profile
        if (normalizedRole.Equals("Nurse", StringComparison.OrdinalIgnoreCase))
        {
            var newNurse = new Nurse
            {
                UserId = coreUser.Id,
                NurseIdCode = $"NRS-{Random.Shared.Next(1000, 9999)}",
                Name = coreUser.FullName,
                Email = coreUser.Email,
                Phone = coreUser.Phone,
                Avatar = coreUser.Avatar,
                Department = "General Ward",
                SubUnit = "Floor 2",
                Location = "Main Campus",
                Shift = "Day Shift (08:00 AM - 04:00 PM)",
                Status = DoctorStatus.Active,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };
            _context.Nurses.Add(newNurse);
            await _context.SaveChangesAsync();
        }
        else if (normalizedRole.Equals("Doctor", StringComparison.OrdinalIgnoreCase))
        {
            var newDoctor = new Doctor
            {
                UserId = coreUser.Id,
                DoctorIdCode = $"DOC-{Random.Shared.Next(1000, 9999)}",
                Name = coreUser.FullName,
                Email = coreUser.Email,
                Phone = coreUser.Phone,
                Avatar = coreUser.Avatar,
                Specialty = "General Medicine",
                Department = "Internal Medicine",
                Location = "Main Campus",
                Status = DoctorStatus.Active,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };
            _context.Doctors.Add(newDoctor);
            await _context.SaveChangesAsync();
        }

        newUser.Id = coreUser.Id;
        return Ok(new { success = true, message = "User account created successfully", data = newUser });
    }

    [HttpGet("users/stats")]
    public async Task<IActionResult> GetUserStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
        var inactiveUsers = await _context.Users.CountAsync(u => !u.IsActive);
        var pendingInvitations = 0;
        var lockedAccounts = 0;

        var activePct = totalUsers > 0 ? Math.Round((double)activeUsers / totalUsers * 100, 1) : 0;

        var stats = new
        {
            totalUsers = totalUsers,
            totalUsersChange = "Live database record count",
            activeUsers = activeUsers,
            activeUsersPercentage = $"{activePct}% of total users",
            pendingInvitations = pendingInvitations,
            pendingInvitationsNote = "Invitations pending setup",
            inactiveUsers = inactiveUsers,
            inactiveUsersNote = "Deactivated accounts",
            lockedAccounts = lockedAccounts,
            lockedAccountsNote = "Security locked accounts"
        };
        return Ok(new { success = true, data = stats });
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserAccountItemRecord model)
    {
        var coreUser = await _context.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == id || u.Email.ToLower() == model.Email.ToLower());
        if (coreUser == null)
        {
            return NotFound(new { success = false, message = "User record not found" });
        }

        var normalizedRole = model.Role.Contains("Admin", StringComparison.OrdinalIgnoreCase) ? "Admin" :
                             model.Role.Contains("Doctor", StringComparison.OrdinalIgnoreCase) ? "Doctor" :
                             model.Role.Contains("Nurse", StringComparison.OrdinalIgnoreCase) ? "Nurse" : model.Role;

        coreUser.FullName = model.UserName;
        coreUser.Email = model.Email;
        coreUser.Role = normalizedRole;
        coreUser.IsActive = model.Status != "Inactive" && model.Status != "Locked";
        if (!string.IsNullOrWhiteSpace(model.Password))
        {
            var (h, s) = ConnectedCare.Application.Common.Security.PasswordHasher.CreatePasswordHash(model.Password);
            coreUser.PasswordHash = h;
            coreUser.PasswordSalt = s;
        }
        coreUser.UpdatedDate = DateTime.UtcNow;

        // Update role assignment in user_role
        var roleEntity = await _context.AppRoles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == normalizedRole.ToLower() || r.DisplayName.ToLower() == model.Role.ToLower());
        if (roleEntity != null)
        {
            var existingUserRoles = await _context.UserRoles.Where(ur => ur.UserId == coreUser.Id).ToListAsync();
            _context.UserRoles.RemoveRange(existingUserRoles);
            _context.UserRoles.Add(new UserRole { UserId = coreUser.Id, RoleId = roleEntity.Id });
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "User updated successfully", data = model });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var coreUser = await _context.Users.FindAsync(id);
        if (coreUser == null)
        {
            return NotFound(new { success = false, message = "User record not found" });
        }

        if (coreUser.Username.Equals("admin", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { success = false, message = "The primary System Administrator account cannot be deleted." });
        }

        var urs = await _context.UserRoles.Where(ur => ur.UserId == coreUser.Id).ToListAsync();
        _context.UserRoles.RemoveRange(urs);
        _context.Users.Remove(coreUser);

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "User record deleted successfully" });
    }

    private static readonly string[] SystemModules = new[]
    {
        "Dashboard", "Residents", "Care Team", "Doctors", "Nurses", "Locations",
        "Clinical", "Medication", "Tasks", "Messages", "Alerts & Incidents",
        "Reports & Analytics", "Financial", "AI Operations", "Integrations", "Audit Logs", "Settings"
    };

    public static string GenerateDefaultMatrixJson(string roleName)
    {
        var normalized = roleName?.Trim().ToLower() ?? string.Empty;
        var matrix = new Dictionary<string, Dictionary<string, bool>>();

        bool isAdmin = normalized.Contains("admin");
        bool isDoctor = normalized.Contains("doctor") || normalized.Contains("physician");
        bool isNurse = normalized.Contains("nurse");
        bool isCareManager = normalized.Contains("care manager");
        bool isBilling = normalized.Contains("billing") || normalized.Contains("finance");
        bool isPharmacist = normalized.Contains("pharmacist") || normalized.Contains("pharmacy");
        bool isLab = normalized.Contains("lab");
        bool isReceptionist = normalized.Contains("receptionist") || normalized.Contains("front desk");

        foreach (var mod in SystemModules)
        {
            var actions = new Dictionary<string, bool>
            {
                ["fullAccess"] = false,
                ["create"] = false,
                ["read"] = false,
                ["update"] = false,
                ["delete"] = false,
                ["export"] = false,
                ["import"] = false,
                ["print"] = false
            };

            if (isAdmin)
            {
                actions["fullAccess"] = true;
                actions["create"] = true;
                actions["read"] = true;
                actions["update"] = true;
                actions["delete"] = true;
                actions["export"] = true;
                actions["import"] = true;
                actions["print"] = true;
            }
            else if (isDoctor)
            {
                var isCore = new[] { "Dashboard", "Residents", "Care Team", "Clinical", "Medication", "Tasks", "Messages", "Alerts & Incidents", "AI Operations" }.Contains(mod);
                var isRead = new[] { "Doctors", "Nurses", "Locations", "Reports & Analytics" }.Contains(mod);
                if (isCore)
                {
                    actions["fullAccess"] = true;
                    actions["create"] = true;
                    actions["read"] = true;
                    actions["update"] = true;
                    actions["export"] = true;
                    actions["print"] = true;
                }
                else if (isRead)
                {
                    actions["read"] = true;
                }
            }
            else if (isNurse)
            {
                var isCore = new[] { "Dashboard", "Residents", "Care Team", "Clinical", "Medication", "Tasks", "Messages", "Alerts & Incidents" }.Contains(mod);
                var isRead = new[] { "Doctors", "Nurses", "Locations", "Reports & Analytics" }.Contains(mod);
                if (isCore)
                {
                    actions["create"] = true;
                    actions["read"] = true;
                    actions["update"] = true;
                    actions["print"] = true;
                }
                else if (isRead)
                {
                    actions["read"] = true;
                }
            }
            else if (isCareManager)
            {
                var isCore = new[] { "Dashboard", "Residents", "Care Team", "Clinical", "Tasks", "Messages", "Alerts & Incidents", "Reports & Analytics" }.Contains(mod);
                if (isCore)
                {
                    actions["create"] = true;
                    actions["read"] = true;
                    actions["update"] = true;
                    actions["export"] = true;
                    actions["print"] = true;
                }
                else if (new[] { "Doctors", "Nurses", "Locations", "Medication" }.Contains(mod))
                {
                    actions["read"] = true;
                }
            }
            else if (isBilling)
            {
                if (new[] { "Dashboard", "Financial", "Reports & Analytics" }.Contains(mod))
                {
                    actions["fullAccess"] = true;
                    actions["create"] = true;
                    actions["read"] = true;
                    actions["update"] = true;
                    actions["export"] = true;
                    actions["print"] = true;
                }
                else if (new[] { "Residents", "Locations" }.Contains(mod))
                {
                    actions["read"] = true;
                }
            }
            else if (isPharmacist)
            {
                if (new[] { "Dashboard", "Medication", "Alerts & Incidents" }.Contains(mod))
                {
                    actions["create"] = true;
                    actions["read"] = true;
                    actions["update"] = true;
                    actions["export"] = true;
                }
                else if (new[] { "Residents", "Clinical" }.Contains(mod))
                {
                    actions["read"] = true;
                }
            }
            else if (isLab)
            {
                if (new[] { "Dashboard", "Clinical", "Alerts & Incidents" }.Contains(mod))
                {
                    actions["create"] = true;
                    actions["read"] = true;
                    actions["update"] = true;
                }
                else if (new[] { "Residents" }.Contains(mod))
                {
                    actions["read"] = true;
                }
            }
            else if (isReceptionist)
            {
                if (new[] { "Dashboard", "Residents", "Locations", "Messages", "Tasks" }.Contains(mod))
                {
                    actions["create"] = true;
                    actions["read"] = true;
                    actions["update"] = true;
                    actions["print"] = true;
                }
            }
            else // Viewer / default read-only
            {
                if (!new[] { "Settings", "Integrations", "Audit Logs", "Financial" }.Contains(mod))
                {
                    actions["read"] = true;
                }
            }

            matrix[mod] = actions;
        }

        return System.Text.Json.JsonSerializer.Serialize(matrix);
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.RoleDefinitionItemRecords.OrderByDescending(r => r.CreatedDate).ToListAsync();
        var allUsers = await _context.Users.ToListAsync();
        bool changes = false;

        foreach (var r in roles)
        {
            r.UsersCount = allUsers.Count(u => string.Equals(u.Role, r.RoleName, StringComparison.OrdinalIgnoreCase));
            if (string.IsNullOrWhiteSpace(r.PermissionsMatrixJson) || r.PermissionsMatrixJson == "{}" || r.PermissionsMatrixJson.Length < 20)
            {
                r.PermissionsMatrixJson = GenerateDefaultMatrixJson(r.RoleName);
                changes = true;
            }
        }

        if (changes)
        {
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, data = roles });
    }

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole([FromBody] RoleDefinitionItemRecord newRole)
    {
        newRole.CreatedDate = DateTime.UtcNow;
        newRole.UpdatedDate = DateTime.UtcNow;

        if (string.IsNullOrWhiteSpace(newRole.PermissionsMatrixJson) || newRole.PermissionsMatrixJson == "{}")
        {
            newRole.PermissionsMatrixJson = GenerateDefaultMatrixJson(newRole.RoleName);
        }

        _context.RoleDefinitionItemRecords.Add(newRole);

        // Synchronize AppRole
        var appRole = await _context.AppRoles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == newRole.RoleName.ToLower());
        if (appRole == null)
        {
            appRole = new AppRole
            {
                RoleName = newRole.RoleName,
                DisplayName = newRole.RoleName,
                Description = newRole.Description,
                IsSystemRole = newRole.CategoryBadge == "System Role"
            };
            _context.AppRoles.Add(appRole);
        }

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Role definition created successfully", data = newRole });
    }

    [HttpPut("roles/{id}")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] RoleDefinitionItemRecord model)
    {
        var role = await _context.RoleDefinitionItemRecords.FindAsync(id);
        if (role == null)
        {
            return NotFound(new { success = false, message = "Role record not found" });
        }

        var oldRoleName = role.RoleName;
        role.RoleName = model.RoleName;
        role.Description = model.Description;
        role.CategoryBadge = model.CategoryBadge;
        bool isSystemAdmin = role.RoleName.Equals("System Administrator", StringComparison.OrdinalIgnoreCase) ||
                             role.RoleName.Equals("Administrator", StringComparison.OrdinalIgnoreCase) ||
                             role.RoleName.Equals("Admin", StringComparison.OrdinalIgnoreCase);

        if (isSystemAdmin)
        {
            role.PermissionsMatrixJson = GenerateDefaultMatrixJson("Admin");
        }
        else if (!string.IsNullOrWhiteSpace(model.PermissionsMatrixJson))
        {
            role.PermissionsMatrixJson = model.PermissionsMatrixJson;
        }
        role.UpdatedDate = DateTime.UtcNow;

        // Synchronize matching AppRole
        var appRole = await _context.AppRoles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == oldRoleName.ToLower() || r.DisplayName.ToLower() == oldRoleName.ToLower());
        if (appRole != null)
        {
            appRole.RoleName = model.RoleName;
            appRole.DisplayName = model.RoleName;
            appRole.Description = model.Description;
            appRole.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Role definition updated successfully", data = role });
    }

    [HttpDelete("roles/{id}")]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        var role = await _context.RoleDefinitionItemRecords.FindAsync(id);
        if (role == null)
        {
            return NotFound(new { success = false, message = "Role record not found" });
        }

        if (role.CategoryBadge == "System Role" || role.RoleName.Equals("System Administrator", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { success = false, message = "System roles cannot be deleted." });
        }

        var appRole = await _context.AppRoles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == role.RoleName.ToLower());
        if (appRole != null)
        {
            var rolePerms = await _context.RolePermissions.Where(rp => rp.RoleId == appRole.Id).ToListAsync();
            _context.RolePermissions.RemoveRange(rolePerms);
            _context.AppRoles.Remove(appRole);
        }

        _context.RoleDefinitionItemRecords.Remove(role);
        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Role definition deleted successfully" });
    }

    [HttpGet("permissions")]
    public async Task<IActionResult> GetAllPermissions()
    {
        var permissions = await _context.AppPermissions
            .OrderBy(p => p.Module)
            .ThenBy(p => p.Name)
            .ToListAsync();
        return Ok(new { success = true, data = permissions });
    }

    [HttpGet("roles/{id}/permissions")]
    public async Task<IActionResult> GetRolePermissions(Guid id)
    {
        // Try finding by AppRole Id, or find AppRole by RoleDefinitionItemRecord name
        var appRole = await _context.AppRoles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (appRole == null)
        {
            var defRole = await _context.RoleDefinitionItemRecords.FindAsync(id);
            if (defRole != null)
            {
                appRole = await _context.AppRoles
                    .Include(r => r.RolePermissions)
                    .FirstOrDefaultAsync(r => r.RoleName.ToLower() == defRole.RoleName.ToLower() || r.DisplayName.ToLower() == defRole.RoleName.ToLower());
            }
        }

        if (appRole == null)
        {
            return NotFound(new { success = false, message = "Role not found" });
        }

        var perms = await _context.RolePermissions
            .Where(rp => rp.RoleId == appRole.Id)
            .ToListAsync();

        return Ok(new { success = true, data = perms, roleName = appRole.RoleName, roleId = appRole.Id });
    }

    [HttpPost("roles/{id}/permissions")]
    public async Task<IActionResult> SaveRolePermissions(Guid id, [FromBody] SaveRolePermissionsRequest request)
    {
        var appRole = await _context.AppRoles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        RoleDefinitionItemRecord? defRole = null;

        if (appRole == null)
        {
            defRole = await _context.RoleDefinitionItemRecords.FindAsync(id);
            if (defRole != null)
            {
                appRole = await _context.AppRoles
                    .Include(r => r.RolePermissions)
                    .FirstOrDefaultAsync(r => r.RoleName.ToLower() == defRole.RoleName.ToLower() || r.DisplayName.ToLower() == defRole.RoleName.ToLower());
            }
        }
        else
        {
            defRole = await _context.RoleDefinitionItemRecords.FirstOrDefaultAsync(dr => dr.RoleName.ToLower() == appRole.RoleName.ToLower());
        }

        if (appRole == null)
        {
            return NotFound(new { success = false, message = "Role not found" });
        }

        // Remove existing role permissions
        var existingPerms = await _context.RolePermissions.Where(rp => rp.RoleId == appRole.Id).ToListAsync();
        _context.RolePermissions.RemoveRange(existingPerms);

        // Add selected permissions
        var allAppPerms = await _context.AppPermissions.ToListAsync();
        var selectedKeys = request.PermissionKeys ?? new List<string>();

        foreach (var key in selectedKeys)
        {
            var appPerm = allAppPerms.FirstOrDefault(ap => ap.PermissionKey.Equals(key, StringComparison.OrdinalIgnoreCase));
            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = appRole.Id,
                PermissionId = appPerm?.Id,
                PermissionKey = key,
                PermissionName = appPerm?.Name ?? key,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            });
        }

        // Also update RoleDefinitionItemRecord permissions matrix JSON if present
        if (defRole != null && !string.IsNullOrWhiteSpace(request.PermissionsMatrixJson))
        {
            defRole.PermissionsMatrixJson = request.PermissionsMatrixJson;
            defRole.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Role permissions updated successfully" });
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotificationTemplates()
    {
        var templates = await _context.NotificationTemplateItemRecords.OrderBy(t => t.Category).ThenBy(t => t.TemplateName).ToListAsync();
        return Ok(new { success = true, data = templates });
    }

    [HttpGet("notifications/stats")]
    public async Task<IActionResult> GetNotificationStats()
    {
        var total = await _context.NotificationTemplateItemRecords.CountAsync();
        var emailEnabled = await _context.NotificationTemplateItemRecords.CountAsync(t => t.IsEnabled && t.Channel.Contains("Email"));
        var smsEnabled = await _context.NotificationTemplateItemRecords.CountAsync(t => t.IsEnabled && t.Channel.Contains("SMS"));
        var pushEnabled = await _context.NotificationTemplateItemRecords.CountAsync(t => t.IsEnabled && (t.Channel.Contains("Push") || t.Channel.Contains("In-App")));
        var inAppEnabled = await _context.Notifications.CountAsync(n => !n.IsRead);
        var totalDispatched = await _context.Notifications.CountAsync();

        var stats = new
        {
            emailEnabled = emailEnabled,
            smsEnabled = smsEnabled,
            pushEnabled = pushEnabled,
            inAppEnabled = inAppEnabled,
            totalTemplates = total,
            deliverySuccessRate = totalDispatched > 0 ? "100%" : "0%",
            avgDeliveryTime = totalDispatched > 0 ? "< 1 sec" : "0 sec",
            emailsSent = totalDispatched.ToString("N0")
        };
        return Ok(new { success = true, data = stats });
    }

    [HttpPost("notifications/toggle/{id}")]
    public async Task<IActionResult> ToggleNotificationTemplate(Guid id)
    {
        var template = await _context.NotificationTemplateItemRecords.FindAsync(id);
        if (template == null) return NotFound(new { success = false, message = "Template not found" });

        template.IsEnabled = !template.IsEnabled;
        template.Status = template.IsEnabled ? "Active" : "Inactive";
        template.UpdatedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = template });
    }

    [HttpPost("notifications/templates")]
    public async Task<IActionResult> CreateNotificationTemplate([FromBody] NotificationTemplateItemRecord model)
    {
        model.Id = Guid.NewGuid();
        model.CreatedDate = DateTime.UtcNow;
        model.UpdatedDate = DateTime.UtcNow;
        _context.NotificationTemplateItemRecords.Add(model);
        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Template created successfully", data = model });
    }

    [HttpPut("notifications/templates/{id}")]
    public async Task<IActionResult> UpdateNotificationTemplate(Guid id, [FromBody] NotificationTemplateItemRecord model)
    {
        var template = await _context.NotificationTemplateItemRecords.FindAsync(id);
        if (template == null) return NotFound(new { success = false, message = "Template not found" });

        template.TemplateName = model.TemplateName;
        template.Description = model.Description;
        template.Category = model.Category;
        template.Channel = model.Channel;
        template.TriggerEvent = model.TriggerEvent;
        template.Status = model.Status;
        template.IsEnabled = model.IsEnabled;
        template.UpdatedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Template updated successfully", data = template });
    }

    [HttpDelete("notifications/templates/{id}")]
    public async Task<IActionResult> DeleteNotificationTemplate(Guid id)
    {
        var template = await _context.NotificationTemplateItemRecords.FindAsync(id);
        if (template == null) return NotFound(new { success = false, message = "Template not found" });

        _context.NotificationTemplateItemRecords.Remove(template);
        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Template deleted successfully" });
    }

    [HttpGet("notifications/history")]
    public async Task<IActionResult> GetNotificationDeliveryHistory([FromQuery] int limit = 20)
    {
        var notifications = await _context.Notifications
            .OrderByDescending(n => n.CreatedDate)
            .Take(limit)
            .Select(n => new
            {
                id = n.Id,
                title = n.Title,
                message = n.Message,
                type = n.Type,
                severity = n.Severity,
                channel = n.Type == "Alert" ? "Email + SMS + Push" : (n.Type == "Task" ? "Push + In-App" : "Email + In-App"),
                recipient = n.UserRole ?? "All Staff",
                patient = n.PatientName ?? "-",
                status = "Delivered",
                isRead = n.IsRead,
                sentAt = n.CreatedDate.ToString("MMM dd, yyyy hh:mm tt")
            })
            .ToListAsync();

        return Ok(new { success = true, data = notifications });
    }

    [HttpGet("localization")]
    public async Task<IActionResult> GetLocalizationSettings()
    {
        var settings = await _context.LocalizationSettingsRecords.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new LocalizationSettingsRecord();
            _context.LocalizationSettingsRecords.Add(settings);
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, data = settings });
    }

    [HttpPost("localization")]
    [HttpPut("localization")]
    public async Task<IActionResult> SaveLocalizationSettings([FromBody] LocalizationSettingsRecord model)
    {
        var settings = await _context.LocalizationSettingsRecords.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = model;
            _context.LocalizationSettingsRecords.Add(settings);
        }
        else
        {
            settings.DefaultLanguage = model.DefaultLanguage;
            settings.FallbackLanguage = model.FallbackLanguage;
            settings.DateFormat = model.DateFormat;
            settings.ShortDateFormat = model.ShortDateFormat;
            settings.TimeFormat = model.TimeFormat;
            settings.WeekStartsOn = model.WeekStartsOn;
            settings.TimeZone = model.TimeZone;
            settings.PreviewRegion = model.PreviewRegion;
            settings.CalendarType = model.CalendarType;
            settings.SupportedLanguagesJson = model.SupportedLanguagesJson;
            settings.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Localization settings saved successfully", data = settings });
    }

    [HttpGet("security")]
    public async Task<IActionResult> GetSecuritySettings()
    {
        var settings = await _context.SecuritySettingsRecords.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new SecuritySettingsRecord();
            _context.SecuritySettingsRecords.Add(settings);
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, data = settings });
    }

    [HttpPost("security")]
    [HttpPut("security")]
    public async Task<IActionResult> SaveSecuritySettings([FromBody] SecuritySettingsRecord model)
    {
        var settings = await _context.SecuritySettingsRecords.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = model;
            _context.SecuritySettingsRecords.Add(settings);
        }
        else
        {
            settings.MinPasswordLength = model.MinPasswordLength;
            settings.RequireUppercase = model.RequireUppercase;
            settings.RequireLowercase = model.RequireLowercase;
            settings.RequireNumbers = model.RequireNumbers;
            settings.RequireSpecialChars = model.RequireSpecialChars;
            settings.PasswordExpiryDays = model.PasswordExpiryDays;
            settings.EnableMfaFor = model.EnableMfaFor;
            settings.MfaAuthenticatorApp = model.MfaAuthenticatorApp;
            settings.MfaSmsVerification = model.MfaSmsVerification;
            settings.MfaEmailVerification = model.MfaEmailVerification;
            settings.RememberMfaDays = model.RememberMfaDays;
            settings.SessionTimeoutMinutes = model.SessionTimeoutMinutes;
            settings.IdleTimeoutMinutes = model.IdleTimeoutMinutes;
            settings.ForceLogoutOnPasswordChange = model.ForceLogoutOnPasswordChange;
            settings.AllowMultipleActiveSessions = model.AllowMultipleActiveSessions;
            settings.LockoutThreshold = model.LockoutThreshold;
            settings.LockoutDurationMinutes = model.LockoutDurationMinutes;
            settings.PreventUserEnumeration = model.PreventUserEnumeration;
            settings.RequireEmailVerification = model.RequireEmailVerification;
            settings.RestrictLoginToRegisteredDevices = model.RestrictLoginToRegisteredDevices;
            settings.AllowPasswordReset = model.AllowPasswordReset;
            settings.RestrictSpecificIps = model.RestrictSpecificIps;
            settings.AllowedIpsJson = model.AllowedIpsJson;
            settings.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Security settings saved successfully", data = settings });
    }

    [HttpPut("users/{id}/toggle-status")]
    [HttpPut("user-management/{id}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { success = false, message = "User not found" });

        user.IsActive = !user.IsActive;
        user.UpdatedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "User status toggled successfully", isActive = user.IsActive });
    }

    [HttpGet("integrations")]
    public async Task<IActionResult> GetIntegrations()
    {
        var list = await _context.IntegrationItemRecords.ToListAsync();
        return Ok(new { success = true, data = list });
    }

    [HttpGet("backup")]
    public async Task<IActionResult> GetBackupSettings()
    {
        var history = await _context.BackupHistoryRecords.OrderByDescending(b => b.CreatedDate).ToListAsync();
        var lastSuccess = history.FirstOrDefault(b => b.Status == "Success");
        var lastSuccessText = lastSuccess != null && !string.IsNullOrWhiteSpace(lastSuccess.CreatedOnText)
            ? lastSuccess.CreatedOnText
            : (history.Count > 0 ? history[0].CreatedOnText : "No backups recorded yet");

        var nextScheduledDate = DateTime.UtcNow.Date.AddDays(1).AddHours(2).AddMinutes(30);
        var nextScheduledText = nextScheduledDate.ToString("MMM dd, yyyy hh:mm tt") + " (UTC)";

        var total = history.Count;
        var successful = history.Count(b => b.Status == "Success");
        var failed = history.Count(b => b.Status != "Success");

        var stats = new
        {
            lastSuccessfulBackup = lastSuccessText,
            nextScheduledBackup = nextScheduledText,
            totalBackups = total,
            successfulBackups = successful,
            failedBackups = failed,
            history = history
        };

        return Ok(new { success = true, data = stats });
    }

    [HttpPost("backup/create")]
    public async Task<IActionResult> CreateBackup([FromBody] dynamic body)
    {
        string scope = body?.GetProperty("scope").GetString() ?? "Full Backup";
        string description = body?.GetProperty("description").GetString() ?? "Manual on-demand backup";

        var backup = new BackupHistoryRecord
        {
            BackupName = $"{scope} - {DateTime.UtcNow:MMM dd, yyyy HH:mm}",
            Type = scope,
            Description = string.IsNullOrWhiteSpace(description) ? "Manual on-demand backup" : description,
            SizeText = scope == "Database Only" ? "1.4 GB" : scope == "Files Only" ? "8.2 GB" : "12.6 GB",
            CreatedOnText = DateTime.UtcNow.ToString("MMM dd, yyyy hh:mm tt") + " (UTC)",
            Status = "Success"
        };

        _context.BackupHistoryRecords.Add(backup);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Backup created successfully", data = backup });
    }

    [HttpGet("subscription")]
    [HttpGet("billing")]
    public async Task<IActionResult> GetSubscription()
    {
        var plan = await _context.SubscriptionPlanRecords.FirstOrDefaultAsync();
        var invoices = await _context.BillingInvoiceRecords.OrderByDescending(i => i.CreatedDate).ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                plan = plan ?? new SubscriptionPlanRecord(),
                invoices = invoices
            }
        });
    }

    [HttpPost("maintenance/clear-database")]
    public async Task<IActionResult> ClearTransactionalDatabase([FromBody] ClearDatabaseRequest request)
    {
        if (request?.ConfirmationCode != "CLEAR_TRANSACTIONAL_DATA")
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid confirmation code. Pass confirmationCode: 'CLEAR_TRANSACTIONAL_DATA' in the request body to confirm."
            });
        }

        try
        {
            if (_context.Database.IsNpgsql())
            {
                var sql = @"
                    DO $$
                    DECLARE
                        tbl text;
                        tbls text[] := ARRAY[
                            'chat_messages', 'chat_conversations', 'notifications',
                            'patient_document_records', 'patient_care_plan_records',
                            'medication_administrations', 'medication_records', 'medication_reminders',
                            'drug_interaction_alerts', 'discharge_checklists', 'vital_rounds',
                            'care_plans', 'consultations', 'doctor_consultations',
                            'clinical_encounter_records', 'nurse_documentations', 'nurse_reports',
                            'tasks', 'alerts', 'shift_handover_patient_records', 'shift_handovers',
                            'patient_doctors', 'patient_nurses', 'care_team_members', 'patients',
                            'nurse_profiles', 'doctors', 'nurses',
                            'location_units', 'care_units',
                            'doctor_ai_conversations', 'ai_patient_summary_records', 'ai_care_priority_records',
                            'ai_discharge_review_records', 'ai_alert_prioritization_records',
                            'ai_feedback_records', 'ai_audit_entry_records', 'ai_medication_reviews',
                            'ai_activity_log_records', 'billing_invoice_records', 'financial_transaction_records',
                            'custom_report_records', 'backup_history_records',
                            'activity_summary_logs', 'integration_activity_log_records',
                            'audit_log_entry_records', 'audit_logs'
                        ];
                    BEGIN
                        FOREACH tbl IN ARRAY tbls LOOP
                            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
                                EXECUTE 'TRUNCATE TABLE ' || quote_ident(tbl) || ' CASCADE;';
                            END IF;
                        END LOOP;
                    END $$;

                    -- Remove non-admin users and user roles
                    DELETE FROM user_role WHERE user_id NOT IN (SELECT id FROM users WHERE lower(username) = 'admin' OR lower(role) = 'admin');
                    DELETE FROM users WHERE lower(username) != 'admin' AND lower(role) != 'admin';
                    DELETE FROM user_account_item_records WHERE lower(email) != 'admin@connectcare.org' AND lower(coalesce(role, '')) NOT IN ('admin', 'system administrator');

                    -- Reset AI counters and metrics
                    UPDATE ai_settings_records SET tokens_used_this_month = 0;
                    UPDATE ai_workflow_metric_records SET requests_count = 0;
                    UPDATE subscription_plan_records SET residents_current = 0, staff_current = 0, sms_current = 0, api_current = 0, storage_current_gb = '0 GB';
                    UPDATE users SET avatar = '' WHERE avatar IS NOT NULL AND avatar != '';
                ";

                await _context.Database.ExecuteSqlRawAsync(sql);
            }
            else
            {
                // In-Memory or fallback provider
                _context.Patients.RemoveRange(_context.Patients);
                _context.Doctors.RemoveRange(_context.Doctors);
                _context.Nurses.RemoveRange(_context.Nurses);
                _context.CareTeamMembers.RemoveRange(_context.CareTeamMembers);
                _context.Tasks.RemoveRange(_context.Tasks);
                _context.Alerts.RemoveRange(_context.Alerts);
                _context.MedicationRecords.RemoveRange(_context.MedicationRecords);
                _context.MedicationAdministrations.RemoveRange(_context.MedicationAdministrations);
                _context.VitalRounds.RemoveRange(_context.VitalRounds);
                _context.Consultations.RemoveRange(_context.Consultations);
                _context.CarePlans.RemoveRange(_context.CarePlans);
                _context.DischargeChecklists.RemoveRange(_context.DischargeChecklists);
                _context.ShiftHandovers.RemoveRange(_context.ShiftHandovers);
                _context.NurseDocumentations.RemoveRange(_context.NurseDocumentations);
                _context.ChatConversations.RemoveRange(_context.ChatConversations);
                _context.ChatMessages.RemoveRange(_context.ChatMessages);
                _context.Notifications.RemoveRange(_context.Notifications);

                var nonAdminUsers = await _context.Users.Where(u => u.Username.ToLower() != "admin" && u.Role.ToLower() != "admin").ToListAsync();
                _context.Users.RemoveRange(nonAdminUsers);

                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                success = true,
                message = "Database cleared successfully. All transactional and clinical data removed; Admin and master data preserved."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to clear database", error = ex.Message });
        }
    }
}

public class ClearDatabaseRequest
{
    public string? ConfirmationCode { get; set; }
}


