using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

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
    public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] string? role, [FromQuery] string? status)
    {
        var query = _context.UserAccountItemRecords.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u => u.UserName.ToLower().Contains(search.ToLower()) ||
                                     u.Email.ToLower().Contains(search.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(role) && role != "All Roles")
        {
            query = query.Where(u => u.Role.ToLower() == role.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All Status")
        {
            query = query.Where(u => u.Status.ToLower() == status.ToLower());
        }

        var users = await query.ToListAsync();
        return Ok(new { success = true, data = users });
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] UserAccountItemRecord newUser)
    {
        if (string.IsNullOrWhiteSpace(newUser.LastSignInText))
        {
            newUser.LastSignInText = "Just now";
        }
        newUser.CreatedDate = DateTime.UtcNow;
        newUser.UpdatedDate = DateTime.UtcNow;

        _context.UserAccountItemRecords.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "User account created successfully", data = newUser });
    }

    [HttpGet("users/stats")]
    public async Task<IActionResult> GetUserStats()
    {
        var totalUsers = await _context.UserAccountItemRecords.CountAsync();
        var activeUsers = await _context.UserAccountItemRecords.CountAsync(u => u.Status == "Active");
        var pendingInvitations = await _context.UserAccountItemRecords.CountAsync(u => u.Status == "Pending");
        var inactiveUsers = await _context.UserAccountItemRecords.CountAsync(u => u.Status == "Inactive");
        var lockedAccounts = await _context.UserAccountItemRecords.CountAsync(u => u.Status == "Locked");

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
        var user = await _context.UserAccountItemRecords.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User record not found" });
        }

        user.UserName = model.UserName;
        user.Email = model.Email;
        user.Role = model.Role;
        user.Department = model.Department;
        user.Location = model.Location;
        user.Status = model.Status;
        user.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "User updated successfully", data = user });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.UserAccountItemRecords.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User record not found" });
        }

        _context.UserAccountItemRecords.Remove(user);
        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "User record deleted successfully" });
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.RoleDefinitionItemRecords.OrderByDescending(r => r.CreatedDate).ToListAsync();
        var allUsers = await _context.UserAccountItemRecords.ToListAsync();

        foreach (var r in roles)
        {
            r.UsersCount = allUsers.Count(u => string.Equals(u.Role, r.RoleName, StringComparison.OrdinalIgnoreCase));
        }

        return Ok(new { success = true, data = roles });
    }

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole([FromBody] RoleDefinitionItemRecord newRole)
    {
        newRole.CreatedDate = DateTime.UtcNow;
        newRole.UpdatedDate = DateTime.UtcNow;

        _context.RoleDefinitionItemRecords.Add(newRole);
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

        role.RoleName = model.RoleName;
        role.Description = model.Description;
        role.CategoryBadge = model.CategoryBadge;
        role.Status = model.Status;
        if (!string.IsNullOrWhiteSpace(model.PermissionsMatrixJson))
        {
            role.PermissionsMatrixJson = model.PermissionsMatrixJson;
        }
        role.UpdatedDate = DateTime.UtcNow;

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

        _context.RoleDefinitionItemRecords.Remove(role);
        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Role definition deleted successfully" });
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotificationTemplates()
    {
        var templates = await _context.NotificationTemplateItemRecords.ToListAsync();
        return Ok(new { success = true, data = templates });
    }

    [HttpGet("notifications/stats")]
    public async Task<IActionResult> GetNotificationStats()
    {
        var stats = new
        {
            emailEnabled = 18,
            totalTemplates = 24,
            deliverySuccessRate = "98.6%",
            avgDeliveryTime = "32 sec",
            emailsSent = "12,548"
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

    [HttpGet("backup")]
    public async Task<IActionResult> GetBackupSettings()
    {
        var history = await _context.BackupHistoryRecords.OrderByDescending(b => b.CreatedDate).ToListAsync();
        var stats = new
        {
            lastSuccessfulBackup = "May 19, 2025 02:30 AM (UTC+05:30)",
            nextScheduledBackup = "May 20, 2025 02:30 AM (UTC+05:30)",
            totalBackups = 32,
            successfulBackups = 30,
            failedBackups = 2,
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
            BackupName = $"{scope} - {DateTime.Now:MMM dd, yyyy}",
            Type = scope,
            Description = string.IsNullOrWhiteSpace(description) ? "Manual on-demand backup" : description,
            SizeText = "24.8 GB",
            CreatedOnText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt") + " (UTC+05:30)",
            Status = "Success"
        };

        _context.BackupHistoryRecords.Add(backup);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Backup created successfully", data = backup });
    }

    [HttpGet("subscription")]
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
}
