using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public DoctorsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDoctors([FromQuery] string? search, [FromQuery] string? specialty)
    {
        var query = _context.Doctors.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(d => d.Name.ToLower().Contains(searchLower) ||
                                     d.DoctorIdCode.ToLower().Contains(searchLower) ||
                                     d.Email.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(specialty) && specialty != "All")
        {
            query = query.Where(d => d.Specialty.Equals(specialty, StringComparison.OrdinalIgnoreCase));
        }

        var list = await query.ToListAsync();
        return Ok(ApiResponse<List<Doctor>>.Ok(list));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDoctorStats()
    {
        var doctors = await _context.Doctors.ToListAsync();
        var stats = new
        {
            totalDoctors = doctors.Count,
            active = doctors.Count(d => d.Status == DoctorStatus.Active),
            onLeave = doctors.Count(d => d.Status == DoctorStatus.OnLeave),
            inactive = doctors.Count(d => d.Status == DoctorStatus.Inactive),
            teleconsultation = doctors.Count(d => d.TeleconsultationEnabled),
            specialties = doctors.Select(d => d.Specialty).Distinct().Count()
        };
        return Ok(ApiResponse<object>.Ok(stats));
    }

    [HttpPost]
    public async Task<IActionResult> CreateDoctor([FromBody] Doctor newDoctor)
    {
        if (string.IsNullOrWhiteSpace(newDoctor.DoctorIdCode))
        {
            newDoctor.DoctorIdCode = $"DOC-{Random.Shared.Next(1000, 9999)}";
        }
        if (string.IsNullOrWhiteSpace(newDoctor.Avatar))
        {
            newDoctor.Avatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80";
        }
        newDoctor.CreatedDate = DateTime.UtcNow;
        newDoctor.UpdatedDate = DateTime.UtcNow;

        _context.Doctors.Add(newDoctor);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Doctor>.Ok(newDoctor, "Doctor added successfully"));
    }
}
