using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.Diagnoses.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/diagnoses")]
public class DiagnosesController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public DiagnosesController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    // GET: /api/diagnoses?patientId={patientId}&doctorId={doctorId}
    [HttpGet]
    public async Task<IActionResult> GetDiagnoses(
        [FromQuery] Guid? patientId,
        [FromQuery] Guid? doctorId)
    {
        var query = _context.DoctorConsultations
            .AsNoTracking()
            .AsQueryable();

        if (patientId.HasValue)
        {
            query = query.Where(x => x.PatientId == patientId.Value);
        }

        if (doctorId.HasValue)
        {
            query = query.Where(x => x.DoctorId == doctorId.Value);
        }

        var diagnoses = await query
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync();

        return Ok(
            ApiResponse<List<DoctorConsultation>>.Ok(
                diagnoses));
    }

    // POST: /api/diagnoses
    [HttpPost]
    public async Task<IActionResult> CreateDiagnosis(
        [FromBody] CreateDiagnosisRequest request)
    {
        if (request.PatientId == Guid.Empty)
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "PatientId is required."));
        }

        if (request.DoctorId == Guid.Empty)
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "DoctorId is required."));
        }

        if (string.IsNullOrWhiteSpace(request.Diagnosis))
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "Diagnosis is required."));
        }

        var patient = await _context.Patients
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == request.PatientId);

        if (patient == null)
        {
            return NotFound(
                ApiResponse<string>.Fail(
                    "Patient not found."));
        }

        var doctor = await _context.Doctors
            .AsNoTracking()
            .FirstOrDefaultAsync(d =>
                d.Id == request.DoctorId);

        if (doctor == null)
        {
            return NotFound(
                ApiResponse<string>.Fail(
                    "Doctor not found."));
        }

        var diagnosis = new DoctorConsultation
        {
            Id = Guid.NewGuid(),

            DoctorId = doctor.Id,
            DoctorName = doctor.Name,

            PatientId = patient.Id,
            PatientName = patient.Name,
            PatientIdCode = patient.PatientIdCode,

            DateText = DateTime.UtcNow
                .ToString("MMM dd, yyyy hh:mm tt"),

            ConsultationType = "Diagnosis",

            ChiefComplaint = string.Empty,

            Diagnosis = request.Diagnosis.Trim(),

            ClinicalNotes =
                request.ClinicalNotes?.Trim() ?? string.Empty,

            Status = "Completed"
        };

        _context.DoctorConsultations.Add(diagnosis);

        await _context.SaveChangesAsync();

        return StatusCode(
            StatusCodes.Status201Created,
            ApiResponse<DoctorConsultation>.Ok(
                diagnosis,
                "Diagnosis created successfully"));
    }
}

