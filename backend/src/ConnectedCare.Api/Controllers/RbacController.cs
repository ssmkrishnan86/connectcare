using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RbacController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public RbacController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet("user-menu")]
    public async Task<IActionResult> GetUserMenu([FromQuery] string? role)
    {
        var activeRole = role?.Trim();
        if (string.IsNullOrWhiteSpace(activeRole))
        {
            activeRole = "Admin";
        }

        var allMenus = await _context.MenuItems
            .OrderBy(m => m.SortOrder)
            .ToListAsync();

        var allRoleDefs = await _context.RoleDefinitionItemRecords.ToListAsync();
        var activeClean = (activeRole ?? "").Replace(" ", "").Replace("-", "").Replace("_", "").ToLower();

        var roleDef = allRoleDefs.FirstOrDefault(r =>
        {
            var rClean = (r.RoleName ?? "").Replace(" ", "").Replace("-", "").Replace("_", "").ToLower();
            if (string.Equals(r.RoleName, activeRole, StringComparison.OrdinalIgnoreCase)) return true;
            if (rClean == activeClean) return true;
            if (activeClean.Contains("admin") && (rClean.Contains("admin") || rClean.Contains("systemadministrator"))) return true;
            if (activeClean.Contains("doctor") && rClean.Contains("doctor")) return true;
            if (activeClean.Contains("nurse") && rClean.Contains("nurse")) return true;
            if (activeClean.Contains("lab") && rClean.Contains("lab")) return true;
            if (activeClean.Contains("caremanager") && rClean.Contains("caremanager")) return true;
            return false;
        });

        Dictionary<string, Dictionary<string, bool>>? matrix = null;
        if (roleDef != null && !string.IsNullOrWhiteSpace(roleDef.PermissionsMatrixJson))
        {
            try
            {
                matrix = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, bool>>>(roleDef.PermissionsMatrixJson);
            }
            catch { }
        }

        // Module Path to Module Name Mapping
        string GetModuleForPath(string path) => path switch
        {
            "/dashboard" => "Dashboard",
            "/patients" => "Residents",
            "/care-teams" => "Care Team",
            "/doctors" => "Doctors",
            "/nurses" => "Nurses",
            "/locations" => "Locations",
            "/alerts" => "Alerts & Incidents",
            "/tasks" => "Tasks",
            "/medications" => "Medication",
            "/consultations" or "/care-plans" or "/vital-rounds" or "/shift-handover" or "/discharge-checklist" or "/documentations" => "Clinical",
            "/messages" => "Messages",
            "/reports" or "/reports/overview" => "Reports & Analytics",
            "/ai-operations" => "AI Operations",
            "/integrations" => "Integrations",
            "/audit-logs" => "Audit Logs",
            "/settings" or "/settings-profile" => "Settings",
            _ => string.Empty
        };

        var filteredMenus = allMenus.Where(m =>
        {
            if (activeRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) || activeRole.Equals("System Administrator", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            var mod = GetModuleForPath(m.Path);
            if (matrix != null && !string.IsNullOrEmpty(mod) && matrix.TryGetValue(mod, out var actions))
            {
                bool canRead = actions.TryGetValue("read", out var r) && r;
                bool fullAcc = actions.TryGetValue("fullAccess", out var f) && f;
                if (!canRead && !fullAcc) return false;
            }

            if (string.IsNullOrWhiteSpace(m.RolesAllowedJson)) return true;
            return m.RolesAllowedJson.Contains($"\"{activeRole}\"", StringComparison.OrdinalIgnoreCase) ||
                   (activeRole.Equals("Doctor", StringComparison.OrdinalIgnoreCase) && m.RolesAllowedJson.Contains("\"Doctor\"", StringComparison.OrdinalIgnoreCase)) ||
                   (activeRole.Equals("Nurse", StringComparison.OrdinalIgnoreCase) && m.RolesAllowedJson.Contains("\"Nurse\"", StringComparison.OrdinalIgnoreCase));
        }).ToList();

        return Ok(new
        {
            success = true,
            role = activeRole,
            data = filteredMenus
        });
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.AppRoles.ToListAsync();
        return Ok(new { success = true, data = roles });
    }
}
