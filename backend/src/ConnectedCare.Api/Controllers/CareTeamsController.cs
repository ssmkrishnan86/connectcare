using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Application.Features.CareTeams.DTOs;

namespace ConnectedCare.Api.Controllers;

public class CreateCareTeamMemberRequest
{
    public string? Name { get; set; }
    public string? MemberIdCode { get; set; }
    public string? Avatar { get; set; }
    public string? Role { get; set; }
    public string? TeamName { get; set; }
    public string? Specialty { get; set; }
    public string? Department { get; set; }
    public string? Location { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Status { get; set; }
    public string? Shift { get; set; }
    public Guid? DoctorId { get; set; }
    public Guid? NurseId { get; set; }
    public Guid? PatientId { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class CareTeamsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public CareTeamsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    public static CareTeamRole ParseCareTeamRole(string? roleStr)
    {
        if (string.IsNullOrWhiteSpace(roleStr)) return CareTeamRole.Doctor;
        var clean = roleStr.Trim().ToLower();
        if (clean.Contains("doctor") || clean == "0") return CareTeamRole.Doctor;
        if (clean.Contains("nurse") || clean == "1") return CareTeamRole.Nurse;
        if (clean.Contains("allied") || clean.Contains("manager") || clean.Contains("physio") || clean.Contains("pharmacist") || clean.Contains("social") || clean.Contains("specialist") || clean == "2") return CareTeamRole.AlliedHealth;
        return CareTeamRole.SupportStaff;
    }

    public static DoctorStatus ParseDoctorStatus(string? statusStr)
    {
        if (string.IsNullOrWhiteSpace(statusStr)) return DoctorStatus.Active;
        var clean = statusStr.Trim().ToLower();
        if (clean.Contains("active") || clean == "0") return DoctorStatus.Active;
        if (clean.Contains("leave") || clean == "1") return DoctorStatus.OnLeave;
        return DoctorStatus.Inactive;
    }

    // GET: /api/careteams
    // Optional: /api/careteams?patientId={patientId}&teamName={teamName}&doctorId={doctorId}
    [HttpGet]
    public async Task<IActionResult> GetCareTeamMembers(
        [FromQuery] Guid? patientId,
        [FromQuery] string? teamName,
        [FromQuery] Guid? doctorId)
    {
        var query = _context.CareTeamMembers
            .AsNoTracking()
            .AsQueryable();

        if (patientId.HasValue)
        {
            query = query.Where(x => x.PatientId == patientId.Value);
        }

        if (doctorId.HasValue)
        {
            var docPatientIds = await _context.PatientDoctors
                .Where(pd => pd.DoctorId == doctorId.Value)
                .Select(pd => pd.PatientId)
                .ToListAsync();

            query = query.Where(x => x.DoctorId == doctorId.Value || (x.PatientId.HasValue && docPatientIds.Contains(x.PatientId.Value)));
        }

        if (!string.IsNullOrWhiteSpace(teamName) && !teamName.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x => x.TeamName.ToLower() == teamName.ToLower() || x.Department.ToLower().Contains(teamName.ToLower()));
        }

        var members = await query.ToListAsync();

        return Ok(
            ApiResponse<List<CareTeamMember>>.Ok(members));
    }


    // GET: /api/careteams/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCareTeamMemberById(Guid id)
    {
        var member = await _context.CareTeamMembers
            .FindAsync(id);

        if (member == null)
        {
            return NotFound(
                ApiResponse<CareTeamMember>.Fail(
                    "Care team member not found"));
        }

        return Ok(
            ApiResponse<CareTeamMember>.Ok(member));
    }

    // POST: /api/careteams, /api/careteams/members
    [HttpPost]
    [HttpPost("members")]
    public async Task<IActionResult> CreateCareTeamMember(
        [FromBody] CreateCareTeamMemberRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiResponse<string>.Fail("Name is required"));
        }

        var newMember = new CareTeamMember
        {
            Id = Guid.NewGuid(),
            MemberIdCode = string.IsNullOrWhiteSpace(request.MemberIdCode) ? $"CTM-{Guid.NewGuid():N}"[..12].ToUpperInvariant() : request.MemberIdCode,
            Name = request.Name,
            Avatar = request.Avatar?.Trim() ?? string.Empty,
            Role = ParseCareTeamRole(request.Role),
            TeamName = !string.IsNullOrWhiteSpace(request.TeamName) ? request.TeamName : "General Care Team",
            Specialty = request.Specialty ?? string.Empty,
            Department = !string.IsNullOrWhiteSpace(request.Department) ? request.Department : "Cardiology Unit",
            Location = !string.IsNullOrWhiteSpace(request.Location) ? request.Location : "Main Campus (3rd Floor)",
            Phone = request.Phone ?? string.Empty,
            Email = request.Email ?? string.Empty,
            Status = ParseDoctorStatus(request.Status),
            Shift = !string.IsNullOrWhiteSpace(request.Shift) ? request.Shift : "Day Shift (07:00 AM - 03:00 PM)",
            DoctorId = request.DoctorId,
            NurseId = request.NurseId,
            PatientId = request.PatientId,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _context.CareTeamMembers.Add(newMember);
        await _context.SaveChangesAsync();

        return Ok(
            ApiResponse<CareTeamMember>.Ok(
                newMember,
                "Care team member added successfully"));
    }

    // POST: /api/careteams/assign
    //
    // Request:
    // {
    //   "patientId": "...",
    //   "providerId": "...",
    //   "role": "Doctor"
    // }
    //
    // or:
    //
    // {
    //   "patientId": "...",
    //   "providerId": "...",
    //   "role": "Nurse"
    // }
    [HttpPost("assign")]
    public async Task<IActionResult> AssignCareTeamMember(
        [FromBody] AssignCareTeamRequest request)
    {
        if (request.PatientId == Guid.Empty)
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "PatientId is required"));
        }

        if (request.ProviderId == Guid.Empty)
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "ProviderId is required"));
        }

        if (string.IsNullOrWhiteSpace(request.Role))
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "Role is required"));
        }

        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == request.PatientId);

        if (patient == null)
        {
            return NotFound(
                ApiResponse<string>.Fail(
                    "Patient not found"));
        }

        if (!Enum.TryParse<CareTeamRole>(
                request.Role,
                true,
                out var role))
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    $"Unsupported care team role: {request.Role}"));
        }

        CareTeamMember? existingAssignment = null;

        if (role == CareTeamRole.Doctor)
        {
            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d =>
                    d.Id == request.ProviderId);

            if (doctor == null)
            {
                return NotFound(
                    ApiResponse<string>.Fail(
                        "Doctor not found"));
            }

            existingAssignment =
                await _context.CareTeamMembers
                    .FirstOrDefaultAsync(x =>
                        x.PatientId == request.PatientId &&
                        x.DoctorId == request.ProviderId);

            if (existingAssignment == null)
            {
                existingAssignment = new CareTeamMember
                {
                    Id = Guid.NewGuid(),
                    MemberIdCode =
                        $"CTM-{Guid.NewGuid():N}"[..12]
                            .ToUpperInvariant(),
                    Name = doctor.Name,
                    Avatar = doctor.Avatar,
                    Role = CareTeamRole.Doctor,
                    Department = doctor.Department,
                    Location = doctor.Location,
                    Phone = doctor.Phone,
                    Email = doctor.Email,
                    Status = doctor.Status,
                    DoctorId = doctor.Id,
                    PatientId = patient.Id,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };

                _context.CareTeamMembers.Add(
                    existingAssignment);
            }

            // Keep patient_doctors table in sync
            var existingPd = await _context.PatientDoctors.FirstOrDefaultAsync(pd => pd.PatientId == patient.Id && pd.DoctorId == doctor.Id);
            if (existingPd == null)
            {
                _context.PatientDoctors.Add(new PatientDoctor
                {
                    PatientId = patient.Id,
                    DoctorId = doctor.Id,
                    IsPrimary = true,
                    AssignedDate = DateTime.UtcNow,
                    Notes = "Care team doctor assignment"
                });
            }

            // Keep the patient's primary doctor in sync.
            patient.PrimaryDoctorId = doctor.Id;
            patient.PrimaryDoctorName = doctor.Name;
            patient.PrimaryDoctorSpecialty = doctor.Specialty;
            patient.PrimaryDoctorAvatar = doctor.Avatar;
        }
        else if (role == CareTeamRole.Nurse)
        {
            var nurse = await _context.Nurses
                .FirstOrDefaultAsync(n =>
                    n.Id == request.ProviderId);

            if (nurse == null)
            {
                return NotFound(
                    ApiResponse<string>.Fail(
                        "Nurse not found"));
            }

            existingAssignment =
                await _context.CareTeamMembers
                    .FirstOrDefaultAsync(x =>
                        x.PatientId == request.PatientId &&
                        x.NurseId == request.ProviderId);

            if (existingAssignment == null)
            {
                existingAssignment = new CareTeamMember
                {
                    Id = Guid.NewGuid(),
                    MemberIdCode =
                        $"CTM-{Guid.NewGuid():N}"[..12]
                            .ToUpperInvariant(),
                    Name = nurse.Name,
                    Avatar = nurse.Avatar,
                    Role = CareTeamRole.Nurse,
                    Department = nurse.Department,
                    Location = nurse.Location,
                    Phone = nurse.Phone,
                    Email = nurse.Email,
                    Status = nurse.Status,
                    Shift = nurse.Shift,
                    NurseId = nurse.Id,
                    PatientId = patient.Id,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };

                _context.CareTeamMembers.Add(
                    existingAssignment);
            }

            // Keep patient_nurses table in sync
            var existingPn = await _context.PatientNurses.FirstOrDefaultAsync(pn => pn.PatientId == patient.Id && pn.NurseId == nurse.Id);
            if (existingPn == null)
            {
                _context.PatientNurses.Add(new PatientNurse
                {
                    PatientId = patient.Id,
                    NurseId = nurse.Id,
                    IsPrimary = false,
                    Shift = nurse.Shift,
                    AssignedDate = DateTime.UtcNow,
                    Notes = "Care team nurse assignment"
                });
            }
        }
        else
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "Only Doctor and Nurse assignment is supported by this workflow"));
        }

        await _context.SaveChangesAsync();

        return Ok(
            ApiResponse<CareTeamMember>.Ok(
                existingAssignment!,
                $"{role} assigned to patient successfully"));
    }

    // PUT: /api/careteams/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCareTeamMember(
        Guid id,
        [FromBody] CreateCareTeamMemberRequest updatedMember)
    {
        var member = await _context.CareTeamMembers
            .FindAsync(id);

        if (member == null)
        {
            return NotFound(
                ApiResponse<CareTeamMember>.Fail(
                    "Care team member not found"));
        }

        if (!string.IsNullOrWhiteSpace(updatedMember.Name)) member.Name = updatedMember.Name;
        if (!string.IsNullOrWhiteSpace(updatedMember.Role)) member.Role = ParseCareTeamRole(updatedMember.Role);
        member.TeamName = !string.IsNullOrWhiteSpace(updatedMember.TeamName) ? updatedMember.TeamName : member.TeamName;
        member.Specialty = updatedMember.Specialty ?? member.Specialty;
        if (!string.IsNullOrWhiteSpace(updatedMember.Department)) member.Department = updatedMember.Department;
        if (!string.IsNullOrWhiteSpace(updatedMember.Location)) member.Location = updatedMember.Location;
        if (!string.IsNullOrWhiteSpace(updatedMember.Phone)) member.Phone = updatedMember.Phone;
        if (!string.IsNullOrWhiteSpace(updatedMember.Email)) member.Email = updatedMember.Email;
        if (!string.IsNullOrWhiteSpace(updatedMember.Shift)) member.Shift = updatedMember.Shift;
        if (!string.IsNullOrWhiteSpace(updatedMember.Status)) member.Status = ParseDoctorStatus(updatedMember.Status);

        if (!string.IsNullOrWhiteSpace(updatedMember.Avatar))
        {
            member.Avatar = updatedMember.Avatar;
        }

        member.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(
            ApiResponse<CareTeamMember>.Ok(
                member,
                "Care team member updated successfully"));
    }

    // DELETE: /api/careteams/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCareTeamMember(Guid id)
    {
        var member = await _context.CareTeamMembers
            .FindAsync(id);

        if (member == null)
        {
            return NotFound(
                ApiResponse<string>.Fail(
                    "Care team member not found"));
        }

        if (member.PatientId.HasValue && member.DoctorId.HasValue)
        {
            var pd = await _context.PatientDoctors.FirstOrDefaultAsync(x => x.PatientId == member.PatientId.Value && x.DoctorId == member.DoctorId.Value);
            if (pd != null) _context.PatientDoctors.Remove(pd);
        }
        else if (member.PatientId.HasValue && member.NurseId.HasValue)
        {
            var pn = await _context.PatientNurses.FirstOrDefaultAsync(x => x.PatientId == member.PatientId.Value && x.NurseId == member.NurseId.Value);
            if (pn != null) _context.PatientNurses.Remove(pn);
        }

        _context.CareTeamMembers.Remove(member);

        await _context.SaveChangesAsync();

        return Ok(
            ApiResponse<string>.Ok(
                "Care team member removed successfully"));
    }
}
