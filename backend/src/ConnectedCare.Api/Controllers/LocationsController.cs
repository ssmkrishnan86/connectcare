using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public LocationsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLocations([FromQuery] string? search)
    {
        var query = _context.LocationUnits.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(l => l.Name.ToLower().Contains(searchLower) ||
                                     l.Code.ToLower().Contains(searchLower) ||
                                     l.Facility.ToLower().Contains(searchLower) ||
                                     l.Type.ToLower().Contains(searchLower));
        }

        var list = await query.ToListAsync();
        return Ok(ApiResponse<List<LocationUnit>>.Ok(list));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetLocationStats()
    {
        var locations = await _context.LocationUnits.ToListAsync();
        var stats = new
        {
            totalLocations = locations.Count,
            active = locations.Count(l => l.Status == DoctorStatus.Active),
            inactive = locations.Count(l => l.Status == DoctorStatus.Inactive),
            totalUnits = locations.Sum(l => l.UnitsCount),
            totalBeds = locations.Sum(l => l.Beds)
        };
        return Ok(ApiResponse<object>.Ok(stats));
    }

    [HttpPost]
    public async Task<IActionResult> CreateLocation([FromBody] LocationUnit newLocation)
    {
        if (string.IsNullOrWhiteSpace(newLocation.Code))
        {
            newLocation.Code = $"LOC-{Random.Shared.Next(1000, 9999)}";
        }
        newLocation.CreatedDate = DateTime.UtcNow;
        newLocation.UpdatedDate = DateTime.UtcNow;

        _context.LocationUnits.Add(newLocation);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<LocationUnit>.Ok(newLocation, "Location unit created successfully"));
    }
}
