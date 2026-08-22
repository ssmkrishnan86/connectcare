using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Application.Features.CareTeams.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CareTeamsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public CareTeamsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    // GET: /api/careteams
    // Optional: /api/careteams?patientId={patientId}
    [HttpGet]
    public async Task<IActionResult> GetCareTeamMembers(
        [FromQuery] Guid? patientId)
    {
        var query = _context.CareTeamMembers
            .AsNoTracking()
            .AsQueryable();

        if (patientId.HasValue)
        {
            query = query.Where(x => x.PatientId == patientId.Value);
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

    // POST: /api/careteams
    [HttpPost]
    public async Task<IActionResult> CreateCareTeamMember(
        [FromBody] CareTeamMember newMember)
    {
        if (string.IsNullOrWhiteSpace(newMember.MemberIdCode))
        {
            newMember.MemberIdCode =
                $"CTM-{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        }

        if (string.IsNullOrWhiteSpace(newMember.Avatar))
        {
            newMember.Avatar =
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
        }

        newMember.CreatedDate = DateTime.UtcNow;
        newMember.UpdatedDate = DateTime.UtcNow;

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
        [FromBody] CareTeamMember updatedMember)
    {
        var member = await _context.CareTeamMembers
            .FindAsync(id);

        if (member == null)
        {
            return NotFound(
                ApiResponse<CareTeamMember>.Fail(
                    "Care team member not found"));
        }

        member.Name = updatedMember.Name;
        member.Role = updatedMember.Role;
        member.Department = updatedMember.Department;
        member.Location = updatedMember.Location;
        member.Phone = updatedMember.Phone;
        member.Email = updatedMember.Email;
        member.Shift = updatedMember.Shift;
        member.Status = updatedMember.Status;

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
