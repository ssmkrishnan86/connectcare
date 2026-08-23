using ConnectedCare.Application.Features.Patients.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.Dashboard.DTOs;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;
    private readonly ConnectedCareDbContext _context;

    public PatientsController(IPatientService patientService, ConnectedCareDbContext context)
    {
        _patientService = patientService;
        _context = context;
    }

    private async Task<(Guid? doctorId, Guid? nurseId, string role)> ResolveCallerScopeAsync(Guid? queryDoctorId, Guid? queryNurseId)
    {
        // 1. Explicit query parameter overrides - verify against database
        if (queryDoctorId.HasValue && queryDoctorId.Value != Guid.Empty)
        {
            var matchedDoc = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == queryDoctorId.Value || d.UserId == queryDoctorId.Value);
            if (matchedDoc != null) return (matchedDoc.Id, null, "Doctor");
        }
        if (queryNurseId.HasValue && queryNurseId.Value != Guid.Empty)
        {
            var matchedNurse = await _context.Nurses.FirstOrDefaultAsync(n => n.Id == queryNurseId.Value || n.UserId == queryNurseId.Value);
            if (matchedNurse != null) return (null, matchedNurse.Id, "Nurse");
        }

        // 2. Resolve identity from JWT Bearer token claims
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var jwt = authHeader["Bearer ".Length..].Trim();
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                if (handler.CanReadToken(jwt))
                {
                    var jwtToken = handler.ReadJwtToken(jwt);
                    var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role || c.Type == "role")?.Value;
                    var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier || c.Type == "nameid" || c.Type == "sub")?.Value;
                    var usernameClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Name || c.Type == "unique_name")?.Value;
                    var doctorIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "doctorId")?.Value;
                    var nurseIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "nurseId")?.Value;

                    // If caller is explicitly Admin role, they can view all patients without filter
                    if (roleClaim?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true)
                    {
                        return (null, null, "Admin");
                    }

                    if (!string.IsNullOrEmpty(nurseIdClaim) && Guid.TryParse(nurseIdClaim, out var tokenNurseId))
                    {
                        var n = await _context.Nurses.FirstOrDefaultAsync(n => n.Id == tokenNurseId || n.UserId == tokenNurseId);
                        if (n != null) return (null, n.Id, "Nurse");
                    }

                    if (!string.IsNullOrEmpty(doctorIdClaim) && Guid.TryParse(doctorIdClaim, out var tokenDocId))
                    {
                        var d = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == tokenDocId || d.UserId == tokenDocId);
                        if (d != null) return (d.Id, null, "Doctor");
                    }

                    // Check user record in database
                    User? user = null;
                    if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var userId))
                    {
                        user = await _context.Users
                            .Include(u => u.Doctor)
                            .Include(u => u.Nurse)
                            .Include(u => u.UserRoles)
                                .ThenInclude(ur => ur.Role)
                            .FirstOrDefaultAsync(u => u.Id == userId);
                    }

                    if (user == null && !string.IsNullOrEmpty(usernameClaim))
                    {
                        var uLower = usernameClaim.ToLower();
                        user = await _context.Users
                            .Include(u => u.Doctor)
                            .Include(u => u.Nurse)
                            .Include(u => u.UserRoles)
                                .ThenInclude(ur => ur.Role)
                            .FirstOrDefaultAsync(u => u.Username.ToLower() == uLower || u.Email.ToLower() == uLower || (u.FullName != null && u.FullName.ToLower() == uLower));
                    }

                    if (user != null)
                    {
                        var userRole = user.UserRoles.Select(ur => ur.Role?.RoleName).FirstOrDefault() ?? user.Role ?? roleClaim ?? "";

                        if (userRole.Equals("Nurse", StringComparison.OrdinalIgnoreCase) || roleClaim?.Equals("Nurse", StringComparison.OrdinalIgnoreCase) == true)
                        {
                            var nurse = user.Nurse ?? await _context.Nurses.FirstOrDefaultAsync(n => n.UserId == user.Id || n.Email.ToLower() == user.Email.ToLower() || n.Name.ToLower() == user.FullName.ToLower() || n.Name.ToLower() == user.Username.ToLower());
                            if (nurse == null)
                            {
                                nurse = new Nurse
                                {
                                    UserId = user.Id,
                                    NurseIdCode = $"NRS-{Random.Shared.Next(1000, 9999)}",
                                    Name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username,
                                    Email = user.Email,
                                    Phone = !string.IsNullOrWhiteSpace(user.Phone) ? user.Phone : "(512) 555-0100",
                                    Avatar = !string.IsNullOrWhiteSpace(user.Avatar) ? user.Avatar : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
                                    Department = "General Ward",
                                    SubUnit = "Floor 2",
                                    Location = "Main Campus",
                                    Shift = "Day Shift (08:00 AM - 04:00 PM)",
                                    Status = DoctorStatus.Active,
                                    CreatedDate = DateTime.UtcNow,
                                    UpdatedDate = DateTime.UtcNow
                                };
                                _context.Nurses.Add(nurse);
                                await _context.SaveChangesAsync();
                            }
                            else if (nurse.UserId != user.Id)
                            {
                                nurse.UserId = user.Id;
                                await _context.SaveChangesAsync();
                            }
                            return (null, nurse.Id, "Nurse");
                        }

                        if (userRole.Equals("Doctor", StringComparison.OrdinalIgnoreCase) || roleClaim?.Equals("Doctor", StringComparison.OrdinalIgnoreCase) == true)
                        {
                            var doctor = user.Doctor ?? await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == user.Id || d.Email.ToLower() == user.Email.ToLower() || d.Name.ToLower() == user.FullName.ToLower() || d.Name.ToLower() == user.Username.ToLower());
                            if (doctor == null)
                            {
                                doctor = new Doctor
                                {
                                    UserId = user.Id,
                                    DoctorIdCode = $"DOC-{Random.Shared.Next(1000, 9999)}",
                                    Name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username,
                                    Email = user.Email,
                                    Phone = !string.IsNullOrWhiteSpace(user.Phone) ? user.Phone : "(512) 555-0100",
                                    Avatar = !string.IsNullOrWhiteSpace(user.Avatar) ? user.Avatar : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
                                    Specialty = "General Medicine",
                                    Department = "Internal Medicine",
                                    Location = "Main Campus",
                                    Status = DoctorStatus.Active,
                                    CreatedDate = DateTime.UtcNow,
                                    UpdatedDate = DateTime.UtcNow
                                };
                                _context.Doctors.Add(doctor);
                                await _context.SaveChangesAsync();
                            }
                            else if (doctor.UserId != user.Id)
                            {
                                doctor.UserId = user.Id;
                                await _context.SaveChangesAsync();
                            }
                            return (doctor.Id, null, "Doctor");
                        }

                        if (userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                        {
                            return (null, null, "Admin");
                        }
                    }
                }
            }
            catch { }
        }

        // Fallback for query params if not matched earlier
        if (queryDoctorId.HasValue && queryDoctorId.Value != Guid.Empty)
            return (queryDoctorId, null, "Doctor");
        if (queryNurseId.HasValue && queryNurseId.Value != Guid.Empty)
            return (null, queryNurseId, "Nurse");

        return (null, null, "Unknown");
    }

    [HttpGet]
    public async Task<IActionResult> GetPatients(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? careUnit,
        [FromQuery] Guid? doctorId,
        [FromQuery] Guid? nurseId)
    {
        var scope = await ResolveCallerScopeAsync(doctorId, nurseId);
        var patients = await _patientService.GetPatientsAsync(search, status, careUnit, scope.doctorId, scope.nurseId);
        return Ok(ApiResponse<List<Patient>>.Ok(patients));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetPatientStats(
        [FromQuery] Guid? doctorId,
        [FromQuery] Guid? nurseId)
    {
        var scope = await ResolveCallerScopeAsync(doctorId, nurseId);
        var stats = await _patientService.GetPatientStatsAsync(scope.doctorId, scope.nurseId);
        return Ok(ApiResponse<PatientStatsDto>.Ok(stats));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPatientById(string id)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);

        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        return Ok(ApiResponse<Patient>.Ok(patient));
    }

    [HttpGet("{id}/clinical-encounters")]
    public async Task<IActionResult> GetPatientClinicalEncounters(string id)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);

        if (patient == null)
        {
            return NotFound(
                ApiResponse<string>.Fail(
                    "Patient not found",
                    "NOT_FOUND"));
        }

        var encounters = await _context.ClinicalEncounterRecords
            .Where(e =>
                e.PatientIdCode == patient.PatientIdCode ||
                e.PatientName == patient.Name)
            .OrderByDescending(e => e.Id)
            .Select(e => new
            {
                id = e.Id,
                dateText = e.DateText,
                patientName = e.PatientName,
                patientIdCode = e.PatientIdCode,
                encounterType = e.EncounterType,
                providerName = e.ProviderName,
                reasonDiagnosis = e.ReasonDiagnosis
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            message = "Success",
            data = encounters
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreatePatient([FromBody] Patient newPatient)
    {
        var created = await _patientService.CreatePatientAsync(newPatient);

        // 1. Resolve caller scope
        var scope = await ResolveCallerScopeAsync(null, null);

        // 2. If logged in caller is Nurse, auto-assign this patient to caller nurse
        if (scope.nurseId.HasValue && scope.nurseId.Value != Guid.Empty)
        {
            var exists = await _context.PatientNurses.AnyAsync(pn => pn.PatientId == created.Id && pn.NurseId == scope.nurseId.Value);
            if (!exists)
            {
                var nurse = await _context.Nurses.FirstOrDefaultAsync(n => n.Id == scope.nurseId.Value);
                _context.PatientNurses.Add(new PatientNurse
                {
                    PatientId = created.Id,
                    NurseId = scope.nurseId.Value,
                    IsPrimary = true,
                    AssignedDate = DateTime.UtcNow,
                    Shift = nurse?.Shift ?? "Day Shift",
                    Notes = "Assigned upon patient creation"
                });
                created.AssignedNurseId = scope.nurseId.Value;
                created.AssignedNurseName = nurse?.Name ?? "";
                await _context.SaveChangesAsync();
            }
        }

        // 3. If explicit AssignedNurseId was passed
        if (newPatient.AssignedNurseId.HasValue && newPatient.AssignedNurseId.Value != Guid.Empty)
        {
            var nurse = await _context.Nurses.FirstOrDefaultAsync(n => n.Id == newPatient.AssignedNurseId.Value || n.UserId == newPatient.AssignedNurseId.Value);
            if (nurse != null)
            {
                var exists = await _context.PatientNurses.AnyAsync(pn => pn.PatientId == created.Id && pn.NurseId == nurse.Id);
                if (!exists)
                {
                    _context.PatientNurses.Add(new PatientNurse
                    {
                        PatientId = created.Id,
                        NurseId = nurse.Id,
                        IsPrimary = true,
                        AssignedDate = DateTime.UtcNow,
                        Shift = nurse.Shift ?? "Day Shift",
                        Notes = "Assigned primary nurse"
                    });
                    created.AssignedNurseId = nurse.Id;
                    created.AssignedNurseName = nurse.Name;
                    await _context.SaveChangesAsync();
                }
            }
        }
        else if (!string.IsNullOrWhiteSpace(newPatient.AssignedNurseName))
        {
            var nurse = await _context.Nurses.FirstOrDefaultAsync(n => n.Name.ToLower() == newPatient.AssignedNurseName.ToLower() || n.Email.ToLower() == newPatient.AssignedNurseName.ToLower());
            if (nurse != null)
            {
                var exists = await _context.PatientNurses.AnyAsync(pn => pn.PatientId == created.Id && pn.NurseId == nurse.Id);
                if (!exists)
                {
                    _context.PatientNurses.Add(new PatientNurse
                    {
                        PatientId = created.Id,
                        NurseId = nurse.Id,
                        IsPrimary = true,
                        AssignedDate = DateTime.UtcNow,
                        Shift = nurse.Shift,
                        Notes = "Assigned primary nurse"
                    });
                    created.AssignedNurseId = nurse.Id;
                    created.AssignedNurseName = nurse.Name;
                    await _context.SaveChangesAsync();
                }
            }
        }

        // 4. Sync patient_doctors
        if (created.PrimaryDoctorId.HasValue && created.PrimaryDoctorId.Value != Guid.Empty)
        {
            var docExists = await _context.PatientDoctors.AnyAsync(pd => pd.PatientId == created.Id && pd.DoctorId == created.PrimaryDoctorId.Value);
            if (!docExists)
            {
                _context.PatientDoctors.Add(new PatientDoctor
                {
                    PatientId = created.Id,
                    DoctorId = created.PrimaryDoctorId.Value,
                    IsPrimary = true,
                    AssignedDate = DateTime.UtcNow,
                    Notes = "Primary attending physician"
                });
                await _context.SaveChangesAsync();
            }
        }
        else if (!string.IsNullOrWhiteSpace(created.PrimaryDoctorName))
        {
            var doc = await _context.Doctors.FirstOrDefaultAsync(d => d.Name.ToLower() == created.PrimaryDoctorName.ToLower() || d.Email.ToLower() == created.PrimaryDoctorName.ToLower());
            if (doc != null)
            {
                var docExists = await _context.PatientDoctors.AnyAsync(pd => pd.PatientId == created.Id && pd.DoctorId == doc.Id);
                if (!docExists)
                {
                    _context.PatientDoctors.Add(new PatientDoctor
                    {
                        PatientId = created.Id,
                        DoctorId = doc.Id,
                        IsPrimary = true,
                        AssignedDate = DateTime.UtcNow,
                        Notes = "Primary attending physician"
                    });
                    created.PrimaryDoctorId = doc.Id;
                    await _context.SaveChangesAsync();
                }
            }
        }

        return CreatedAtAction(nameof(GetPatientById), new { id = created.PatientIdCode }, ApiResponse<Patient>.Ok(created, "Patient created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePatient(string id, [FromBody] Patient updatedPatient)
    {
        var result = await _patientService.UpdatePatientAsync(id, updatedPatient);
        if (result == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        // Handle Nurse Assignment update safely
        Guid? targetNurseId = null;
        if (updatedPatient.AssignedNurseId.HasValue && updatedPatient.AssignedNurseId.Value != Guid.Empty)
        {
            targetNurseId = updatedPatient.AssignedNurseId.Value;
        }
        else if (!string.IsNullOrWhiteSpace(updatedPatient.AssignedNurseName))
        {
            var nurse = await _context.Nurses.FirstOrDefaultAsync(n => n.Name.ToLower() == updatedPatient.AssignedNurseName.ToLower() || n.Email.ToLower() == updatedPatient.AssignedNurseName.ToLower());
            if (nurse != null)
            {
                targetNurseId = nurse.Id;
                result.AssignedNurseName = nurse.Name;
            }
        }

        if (targetNurseId.HasValue)
        {
            var patientNurses = await _context.PatientNurses.Where(pn => pn.PatientId == result.Id).ToListAsync();
            var matchingPn = patientNurses.FirstOrDefault(pn => pn.NurseId == targetNurseId.Value);

            foreach (var pn in patientNurses.Where(pn => pn.NurseId != targetNurseId.Value))
            {
                pn.IsPrimary = false;
            }

            if (matchingPn == null)
            {
                var nurse = await _context.Nurses.FirstOrDefaultAsync(n => n.Id == targetNurseId.Value);
                _context.PatientNurses.Add(new PatientNurse
                {
                    PatientId = result.Id,
                    NurseId = targetNurseId.Value,
                    IsPrimary = true,
                    AssignedDate = DateTime.UtcNow,
                    Shift = nurse?.Shift ?? "Day Shift",
                    Notes = "Assigned nurse"
                });
                if (nurse != null)
                {
                    result.AssignedNurseName = nurse.Name;
                }
            }
            else
            {
                matchingPn.IsPrimary = true;
                matchingPn.UpdatedDate = DateTime.UtcNow;
            }
            result.AssignedNurseId = targetNurseId.Value;
            await _context.SaveChangesAsync();
        }

        // Handle Doctor Assignment update safely
        Guid? targetDoctorId = null;
        if (result.PrimaryDoctorId.HasValue && result.PrimaryDoctorId.Value != Guid.Empty)
        {
            targetDoctorId = result.PrimaryDoctorId.Value;
        }
        else if (!string.IsNullOrWhiteSpace(updatedPatient.PrimaryDoctorName))
        {
            var doc = await _context.Doctors.FirstOrDefaultAsync(d => d.Name.ToLower() == updatedPatient.PrimaryDoctorName.ToLower() || d.Email.ToLower() == updatedPatient.PrimaryDoctorName.ToLower());
            if (doc != null)
            {
                targetDoctorId = doc.Id;
                result.PrimaryDoctorId = doc.Id;
                result.PrimaryDoctorName = doc.Name;
                result.PrimaryDoctorSpecialty = doc.Specialty;
                result.PrimaryDoctorAvatar = doc.Avatar;
            }
        }

        if (targetDoctorId.HasValue)
        {
            var patientDoctors = await _context.PatientDoctors.Where(pd => pd.PatientId == result.Id).ToListAsync();
            var matchingPd = patientDoctors.FirstOrDefault(pd => pd.DoctorId == targetDoctorId.Value);

            foreach (var pd in patientDoctors.Where(pd => pd.DoctorId != targetDoctorId.Value))
            {
                pd.IsPrimary = false;
            }

            if (matchingPd == null)
            {
                _context.PatientDoctors.Add(new PatientDoctor
                {
                    PatientId = result.Id,
                    DoctorId = targetDoctorId.Value,
                    IsPrimary = true,
                    AssignedDate = DateTime.UtcNow,
                    Notes = "Primary attending physician"
                });
            }
            else
            {
                matchingPd.IsPrimary = true;
                matchingPd.UpdatedDate = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
        }

        return Ok(ApiResponse<Patient>.Ok(result, "Patient updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePatient(string id)
    {
        var isGuid = Guid.TryParse(id, out var parsedGuid);
        var idLower = id.ToLower();
        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientIdCode.ToLower() == idLower || (isGuid && p.Id == parsedGuid));
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        var pNurses = await _context.PatientNurses.Where(pn => pn.PatientId == patient.Id).ToListAsync();
        if (pNurses.Any()) _context.PatientNurses.RemoveRange(pNurses);

        var pDoctors = await _context.PatientDoctors.Where(pd => pd.PatientId == patient.Id).ToListAsync();
        if (pDoctors.Any()) _context.PatientDoctors.RemoveRange(pDoctors);

        _context.Patients.Remove(patient);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Patient deleted successfully"));
    }
}



