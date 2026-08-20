using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NursesController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public NursesController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetNurses([FromQuery] string? search)
    {
        var query = _context.Nurses.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(n => n.Name.ToLower().Contains(searchLower) ||
                                     n.NurseIdCode.ToLower().Contains(searchLower) ||
                                     n.Department.ToLower().Contains(searchLower) ||
                                     n.Email.ToLower().Contains(searchLower));
        }

        var list = await query.ToListAsync();
        return Ok(ApiResponse<List<Nurse>>.Ok(list));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetNurseById(Guid id)
    {
        var nurse = await _context.Nurses.FindAsync(id);
        if (nurse == null)
        {
            return NotFound(ApiResponse<Nurse>.Fail("Nurse not found"));
        }
        return Ok(ApiResponse<Nurse>.Ok(nurse));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetNurseStats()
    {
        var nurses = await _context.Nurses.ToListAsync();
        var stats = new
        {
            totalNurses = nurses.Count,
            active = nurses.Count(n => n.Status == DoctorStatus.Active),
            onLeave = nurses.Count(n => n.Status == DoctorStatus.OnLeave),
            inactive = nurses.Count(n => n.Status == DoctorStatus.Inactive),
            departments = nurses.Select(n => n.Department).Distinct().Count(),
            certificationsDue = 7
        };
        return Ok(ApiResponse<object>.Ok(stats));
    }

    [HttpPost]
    public async Task<IActionResult> CreateNurse([FromBody] Nurse newNurse)
    {
        if (string.IsNullOrWhiteSpace(newNurse.NurseIdCode))
        {
            newNurse.NurseIdCode = $"NRS-{Random.Shared.Next(1000, 9999)}";
        }
        if (string.IsNullOrWhiteSpace(newNurse.Avatar))
        {
            newNurse.Avatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80";
        }
        newNurse.CreatedDate = DateTime.UtcNow;
        newNurse.UpdatedDate = DateTime.UtcNow;

        _context.Nurses.Add(newNurse);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Nurse>.Ok(newNurse, "Nurse added successfully"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateNurse(Guid id, [FromBody] Nurse updatedNurse)
    {
        var nurse = await _context.Nurses.FindAsync(id);
        if (nurse == null)
        {
            return NotFound(ApiResponse<Nurse>.Fail("Nurse not found"));
        }

        nurse.Name = updatedNurse.Name;
        nurse.Department = updatedNurse.Department;
        nurse.SubUnit = updatedNurse.SubUnit;
        nurse.Location = updatedNurse.Location;
        nurse.Shift = updatedNurse.Shift;
        nurse.Phone = updatedNurse.Phone;
        nurse.Email = updatedNurse.Email;
        nurse.Experience = updatedNurse.Experience;
        nurse.Status = updatedNurse.Status;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Avatar))
        {
            nurse.Avatar = updatedNurse.Avatar;
        }
        nurse.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Nurse>.Ok(nurse, "Nurse updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNurse(Guid id)
    {
        var nurse = await _context.Nurses.FindAsync(id);
        if (nurse == null)
        {
            return NotFound(ApiResponse<string>.Fail("Nurse not found"));
        }

        _context.Nurses.Remove(nurse);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Nurse removed successfully"));
    }
}
