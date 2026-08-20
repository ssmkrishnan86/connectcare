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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDoctorById(Guid id)
    {
        var doctor = await _context.Doctors.FindAsync(id);
        if (doctor == null)
        {
            return NotFound(ApiResponse<Doctor>.Fail("Doctor not found"));
        }
        return Ok(ApiResponse<Doctor>.Ok(doctor));
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

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDoctor(Guid id, [FromBody] Doctor updatedDoctor)
    {
        var doctor = await _context.Doctors.FindAsync(id);
        if (doctor == null)
        {
            return NotFound(ApiResponse<Doctor>.Fail("Doctor not found"));
        }

        doctor.Name = updatedDoctor.Name;
        doctor.Specialty = updatedDoctor.Specialty;
        doctor.SpecialtyIcon = updatedDoctor.SpecialtyIcon;
        doctor.Department = updatedDoctor.Department;
        doctor.Location = updatedDoctor.Location;
        doctor.Phone = updatedDoctor.Phone;
        doctor.Email = updatedDoctor.Email;
        doctor.Experience = updatedDoctor.Experience;
        doctor.Status = updatedDoctor.Status;
        doctor.TeleconsultationEnabled = updatedDoctor.TeleconsultationEnabled;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Avatar))
        {
            doctor.Avatar = updatedDoctor.Avatar;
        }
        doctor.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Doctor>.Ok(doctor, "Doctor updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDoctor(Guid id)
    {
        var doctor = await _context.Doctors.FindAsync(id);
        if (doctor == null)
        {
            return NotFound(ApiResponse<string>.Fail("Doctor not found"));
        }

        _context.Doctors.Remove(doctor);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Doctor removed successfully"));
    }
}
