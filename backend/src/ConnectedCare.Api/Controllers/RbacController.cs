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

        // Filter menus by role
        var filteredMenus = allMenus.Where(m =>
        {
            if (string.IsNullOrWhiteSpace(m.RolesAllowedJson)) return false;
            return m.RolesAllowedJson.Contains($"\"{activeRole}\"", StringComparison.OrdinalIgnoreCase);
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
