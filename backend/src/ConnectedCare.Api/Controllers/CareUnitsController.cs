using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Common.Models;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CareUnitsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public CareUnitsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCareUnits(
        [FromQuery] string? search,
        [FromQuery] bool activeOnly = true)
    {
        var query = _context.CareUnits.AsQueryable();

        if (activeOnly)
        {
            query = query.Where(c => c.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();

            query = query.Where(c =>
                c.Name.ToLower().Contains(searchLower) ||
                c.Code.ToLower().Contains(searchLower) ||
                c.Department.ToLower().Contains(searchLower));
        }

        var list = await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();

        return Ok(ApiResponse<List<CareUnit>>.Ok(list));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCareUnitById(Guid id)
    {
        var careUnit = await _context.CareUnits.FindAsync(id);

        if (careUnit == null)
        {
            return NotFound(
                ApiResponse<CareUnit>.Fail("Care unit not found"));
        }

        return Ok(ApiResponse<CareUnit>.Ok(careUnit));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCareUnit(
        [FromBody] CareUnit careUnit)
    {
        if (string.IsNullOrWhiteSpace(careUnit.Name))
        {
            return BadRequest(
                ApiResponse<CareUnit>.Fail("Care unit name is required"));
        }

        if (string.IsNullOrWhiteSpace(careUnit.Code))
        {
            careUnit.Code =
                $"CU-{Random.Shared.Next(1000, 9999)}";
        }

        var exists = await _context.CareUnits
            .AnyAsync(c => c.Code == careUnit.Code);

        if (exists)
        {
            return Conflict(
                ApiResponse<CareUnit>.Fail(
                    "Care unit code already exists"));
        }

        _context.CareUnits.Add(careUnit);
        await _context.SaveChangesAsync();

        return Ok(
            ApiResponse<CareUnit>.Ok(
                careUnit,
                "Care unit created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCareUnit(
        Guid id,
        [FromBody] CareUnit updated)
    {
        var careUnit = await _context.CareUnits.FindAsync(id);

        if (careUnit == null)
        {
            return NotFound(
                ApiResponse<CareUnit>.Fail(
                    "Care unit not found"));
        }

        careUnit.Code = updated.Code;
        careUnit.Name = updated.Name;
        careUnit.Department = updated.Department;
        careUnit.Type = updated.Type;
        careUnit.Floor = updated.Floor;
        careUnit.LocationUnitId = updated.LocationUnitId;
        careUnit.IsActive = updated.IsActive;
        careUnit.DisplayOrder = updated.DisplayOrder;

        await _context.SaveChangesAsync();

        return Ok(
            ApiResponse<CareUnit>.Ok(
                careUnit,
                "Care unit updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCareUnit(Guid id)
    {
        var careUnit = await _context.CareUnits.FindAsync(id);

        if (careUnit == null)
        {
            return NotFound(
                ApiResponse<string>.Fail(
                    "Care unit not found"));
        }

        // Soft delete because patients may already reference
        // this care unit by name.
        careUnit.IsActive = false;

        await _context.SaveChangesAsync();

        return Ok(
            ApiResponse<string>.Ok(
                "Care unit deactivated successfully"));
    }
}
