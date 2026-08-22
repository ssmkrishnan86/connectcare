using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Api.Controllers;

public record AssignDoctorRequest(Guid DoctorId, bool IsPrimary = true, string? Notes = null);
public record AssignNurseRequest(Guid NurseId, bool IsPrimary = false, string? Shift = "Day Shift", string? Notes = null);

[ApiController]
[Route("api/[controller]")]
public class AssignmentsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public AssignmentsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    // 1. Assign Doctor to Patient
    [HttpPost("patients/{patientId}/doctors")]
    public async Task<IActionResult> AssignDoctorToPatient(Guid patientId, [FromBody] AssignDoctorRequest request)
    {
        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == patientId);
        if (patient == null) return NotFound(ApiResponse<string>.Fail("Patient not found"));

        var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == request.DoctorId);
        if (doctor == null) return NotFound(ApiResponse<string>.Fail("Doctor not found"));

        var assignment = await _context.PatientDoctors.FirstOrDefaultAsync(pd => pd.PatientId == patientId && pd.DoctorId == request.DoctorId);
        if (assignment == null)
        {
            assignment = new PatientDoctor
            {
                PatientId = patientId,
                DoctorId = request.DoctorId,
                IsPrimary = request.IsPrimary,
                AssignedDate = DateTime.UtcNow,
                Notes = request.Notes ?? "Attending physician assignment"
            };
            _context.PatientDoctors.Add(assignment);
        }
        else
        {
            assignment.IsPrimary = request.IsPrimary;
            if (!string.IsNullOrWhiteSpace(request.Notes)) assignment.Notes = request.Notes;
            assignment.UpdatedDate = DateTime.UtcNow;
        }

        if (request.IsPrimary)
        {
            patient.PrimaryDoctorId = doctor.Id;
            patient.PrimaryDoctorName = doctor.Name;
            patient.PrimaryDoctorSpecialty = doctor.Specialty;
            patient.PrimaryDoctorAvatar = doctor.Avatar;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<PatientDoctor>.Ok(assignment, "Doctor assigned to patient successfully"));
    }

    // 2. Remove Doctor from Patient
    [HttpDelete("patients/{patientId}/doctors/{doctorId}")]
    public async Task<IActionResult> RemoveDoctorFromPatient(Guid patientId, Guid doctorId)
    {
        var assignment = await _context.PatientDoctors.FirstOrDefaultAsync(pd => pd.PatientId == patientId && pd.DoctorId == doctorId);
        if (assignment == null) return NotFound(ApiResponse<string>.Fail("Assignment not found"));

        _context.PatientDoctors.Remove(assignment);

        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == patientId);
        if (patient != null && patient.PrimaryDoctorId == doctorId)
        {
            var nextDoctor = await _context.PatientDoctors.Include(pd => pd.Doctor).FirstOrDefaultAsync(pd => pd.PatientId == patientId && pd.DoctorId != doctorId);
            if (nextDoctor?.Doctor != null)
            {
                patient.PrimaryDoctorId = nextDoctor.Doctor.Id;
                patient.PrimaryDoctorName = nextDoctor.Doctor.Name;
                patient.PrimaryDoctorSpecialty = nextDoctor.Doctor.Specialty;
                patient.PrimaryDoctorAvatar = nextDoctor.Doctor.Avatar;
            }
            else
            {
                patient.PrimaryDoctorId = null;
                patient.PrimaryDoctorName = string.Empty;
                patient.PrimaryDoctorSpecialty = string.Empty;
                patient.PrimaryDoctorAvatar = string.Empty;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Doctor assignment removed successfully"));
    }

    // 3. Get Doctors assigned to Patient
    [HttpGet("patients/{patientId}/doctors")]
    public async Task<IActionResult> GetPatientDoctors(Guid patientId)
    {
        var doctors = await _context.PatientDoctors
            .Include(pd => pd.Doctor)
                .ThenInclude(d => d!.User)
            .Where(pd => pd.PatientId == patientId)
            .ToListAsync();

        return Ok(ApiResponse<List<PatientDoctor>>.Ok(doctors));
    }

    // 4. Get Patients assigned to Doctor
    [HttpGet("doctors/{doctorId}/patients")]
    public async Task<IActionResult> GetDoctorPatients(Guid doctorId)
    {
        var patients = await _context.PatientDoctors
            .Include(pd => pd.Patient)
            .Where(pd => pd.DoctorId == doctorId)
            .ToListAsync();

        return Ok(ApiResponse<List<PatientDoctor>>.Ok(patients));
    }

    // 5. Assign Nurse to Patient
    [HttpPost("patients/{patientId}/nurses")]
    public async Task<IActionResult> AssignNurseToPatient(Guid patientId, [FromBody] AssignNurseRequest request)
    {
        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == patientId);
        if (patient == null) return NotFound(ApiResponse<string>.Fail("Patient not found"));

        var nurse = await _context.Nurses.Include(n => n.User).FirstOrDefaultAsync(n => n.Id == request.NurseId);
        if (nurse == null) return NotFound(ApiResponse<string>.Fail("Nurse not found"));

        var assignment = await _context.PatientNurses.FirstOrDefaultAsync(pn => pn.PatientId == patientId && pn.NurseId == request.NurseId);
        if (assignment == null)
        {
            assignment = new PatientNurse
            {
                PatientId = patientId,
                NurseId = request.NurseId,
                IsPrimary = request.IsPrimary,
                Shift = request.Shift ?? nurse.Shift,
                AssignedDate = DateTime.UtcNow,
                Notes = request.Notes ?? "Staff nurse care assignment"
            };
            _context.PatientNurses.Add(assignment);
        }
        else
        {
            assignment.IsPrimary = request.IsPrimary;
            if (!string.IsNullOrWhiteSpace(request.Shift)) assignment.Shift = request.Shift;
            if (!string.IsNullOrWhiteSpace(request.Notes)) assignment.Notes = request.Notes;
            assignment.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<PatientNurse>.Ok(assignment, "Nurse assigned to patient successfully"));
    }

    // 6. Remove Nurse from Patient
    [HttpDelete("patients/{patientId}/nurses/{nurseId}")]
    public async Task<IActionResult> RemoveNurseFromPatient(Guid patientId, Guid nurseId)
    {
        var assignment = await _context.PatientNurses.FirstOrDefaultAsync(pn => pn.PatientId == patientId && pn.NurseId == nurseId);
        if (assignment == null) return NotFound(ApiResponse<string>.Fail("Assignment not found"));

        _context.PatientNurses.Remove(assignment);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Nurse assignment removed successfully"));
    }

    // 7. Get Nurses assigned to Patient
    [HttpGet("patients/{patientId}/nurses")]
    public async Task<IActionResult> GetPatientNurses(Guid patientId)
    {
        var nurses = await _context.PatientNurses
            .Include(pn => pn.Nurse)
                .ThenInclude(n => n!.User)
            .Where(pn => pn.PatientId == patientId)
            .ToListAsync();

        return Ok(ApiResponse<List<PatientNurse>>.Ok(nurses));
    }

    // 8. Get Patients assigned to Nurse
    [HttpGet("nurses/{nurseId}/patients")]
    public async Task<IActionResult> GetNursePatients(Guid nurseId)
    {
        var patients = await _context.PatientNurses
            .Include(pn => pn.Patient)
            .Where(pn => pn.NurseId == nurseId)
            .ToListAsync();

        return Ok(ApiResponse<List<PatientNurse>>.Ok(patients));
    }
}
