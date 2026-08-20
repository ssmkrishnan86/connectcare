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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetLocationById(Guid id)
    {
        var location = await _context.LocationUnits.FindAsync(id);
        if (location == null)
        {
            return NotFound(ApiResponse<LocationUnit>.Fail("Location not found"));
        }
        return Ok(ApiResponse<LocationUnit>.Ok(location));
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
        if (string.IsNullOrWhiteSpace(newLocation.Avatar))
        {
            newLocation.Avatar = "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=150&auto=format&fit=crop&q=80";
        }
        newLocation.CreatedDate = DateTime.UtcNow;
        newLocation.UpdatedDate = DateTime.UtcNow;

        _context.LocationUnits.Add(newLocation);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<LocationUnit>.Ok(newLocation, "Location unit created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLocation(Guid id, [FromBody] LocationUnit updatedLocation)
    {
        var location = await _context.LocationUnits.FindAsync(id);
        if (location == null)
        {
            return NotFound(ApiResponse<LocationUnit>.Fail("Location not found"));
        }

        location.Name = updatedLocation.Name;
        location.Code = updatedLocation.Code;
        location.Type = updatedLocation.Type;
        location.Floor = updatedLocation.Floor;
        location.Beds = updatedLocation.Beds;
        location.Capacity = updatedLocation.Capacity;
        location.Occupied = updatedLocation.Occupied;
        location.OccupancyRate = updatedLocation.OccupancyRate;
        location.Facility = updatedLocation.Facility;
        location.FacilityLocation = updatedLocation.FacilityLocation;
        location.Status = updatedLocation.Status;
        location.AttentionPriority = updatedLocation.AttentionPriority;
        location.UnitsCount = updatedLocation.UnitsCount;
        if (!string.IsNullOrWhiteSpace(updatedLocation.Avatar))
        {
            location.Avatar = updatedLocation.Avatar;
        }
        location.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<LocationUnit>.Ok(location, "Location updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLocation(Guid id)
    {
        var location = await _context.LocationUnits.FindAsync(id);
        if (location == null)
        {
            return NotFound(ApiResponse<string>.Fail("Location not found"));
        }

        _context.LocationUnits.Remove(location);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Location removed successfully"));
    }
}
