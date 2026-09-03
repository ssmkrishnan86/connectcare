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
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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
                                    Avatar = user.Avatar ?? string.Empty,
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
                                    Avatar = user.Avatar ?? string.Empty,
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
        [FromQuery] Guid? nurseId,
        [FromQuery] bool? all)
    {
        if (all == true)
        {
            var allList = await _patientService.GetPatientsAsync(search, status, careUnit, null, null);
            return Ok(ApiResponse<List<Patient>>.Ok(allList));
        }

        var scope = await ResolveCallerScopeAsync(doctorId, nurseId);
        var patients = await _patientService.GetPatientsAsync(search, status, careUnit, scope.doctorId, scope.nurseId);
        
        // If scoped query returned empty but patient records exist and no specific search was applied, fallback to ward patients
        if (patients.Count == 0 && string.IsNullOrEmpty(search) && !doctorId.HasValue && !nurseId.HasValue)
        {
            patients = await _patientService.GetPatientsAsync(search, status, careUnit, null, null);
        }

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
            .Where(e => e.PatientIdCode == patient.PatientIdCode)
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

    [HttpPost("{id}/clinical-encounters")]
    public async Task<IActionResult> CreatePatientClinicalEncounter(string id, [FromBody] ClinicalEncounterRequestDto dto)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        var encounter = new ClinicalEncounterRecord
        {
            Id = Guid.NewGuid(),
            PatientName = patient.Name,
            PatientIdCode = patient.PatientIdCode,
            EncounterType = !string.IsNullOrWhiteSpace(dto?.EncounterType) ? dto.EncounterType : "Inpatient Review",
            ReasonDiagnosis = dto?.ReasonDiagnosis ?? string.Empty,
            ProviderName = !string.IsNullOrWhiteSpace(dto?.ProviderName) ? dto.ProviderName : (patient.PrimaryDoctorName ?? "Attending Staff"),
            DateText = !string.IsNullOrWhiteSpace(dto?.DateText) ? dto.DateText : DateTime.UtcNow.ToString("MM/dd/yyyy"),
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _context.ClinicalEncounterRecords.Add(encounter);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Clinical encounter recorded successfully", data = encounter });
    }

    [HttpPut("{id}/clinical-encounters/{encounterId}")]
    public async Task<IActionResult> UpdatePatientClinicalEncounter(string id, Guid encounterId, [FromBody] ClinicalEncounterRequestDto dto)
    {
        var existing = await _context.ClinicalEncounterRecords.FirstOrDefaultAsync(e => e.Id == encounterId);
        if (existing == null)
        {
            return NotFound(ApiResponse<string>.Fail("Clinical encounter not found", "NOT_FOUND"));
        }

        existing.EncounterType = !string.IsNullOrWhiteSpace(dto?.EncounterType) ? dto.EncounterType : existing.EncounterType;
        existing.ReasonDiagnosis = dto?.ReasonDiagnosis ?? existing.ReasonDiagnosis;
        existing.ProviderName = !string.IsNullOrWhiteSpace(dto?.ProviderName) ? dto.ProviderName : existing.ProviderName;
        existing.DateText = !string.IsNullOrWhiteSpace(dto?.DateText) ? dto.DateText : existing.DateText;
        existing.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Clinical encounter updated successfully", data = existing });
    }

    [HttpDelete("{id}/clinical-encounters/{encounterId}")]
    public async Task<IActionResult> DeletePatientClinicalEncounter(string id, Guid encounterId)
    {
        var existing = await _context.ClinicalEncounterRecords.FirstOrDefaultAsync(e => e.Id == encounterId);
        if (existing == null)
        {
            return NotFound(ApiResponse<string>.Fail("Clinical encounter not found", "NOT_FOUND"));
        }

        _context.ClinicalEncounterRecords.Remove(existing);
        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Clinical encounter deleted successfully" });
    }

    [HttpGet("{id}/vitals")]
    public async Task<IActionResult> GetPatientVitals(string id)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        var rounds = await _context.VitalRounds
            .Where(v => v.PatientId == patient.Id || v.PatientIdCode == patient.PatientIdCode)
            .OrderBy(v => v.CreatedDate)
            .Take(30)
            .ToListAsync();

        var historyLogs = new List<object>();

        if (rounds.Count > 0)
        {
            foreach (var r in rounds)
            {
                int sys = ParseSystolic(r.BloodPressure);
                int dia = ParseDiastolic(r.BloodPressure);
                int hr = ParseIntDigits(r.HeartRate, 72);
                int bs = ParseIntDigits(patient.BloodSugar, 105);
                double temp = ParseDoubleDigits(r.Temperature, 98.6);
                int spo2 = ParseIntDigits(r.SpO2, 98);
                int rr = ParseIntDigits(r.RespiratoryRate, 18);

                historyLogs.Add(new {
                    id = r.Id,
                    bloodPressure = !string.IsNullOrWhiteSpace(r.BloodPressure) ? r.BloodPressure : $"{sys}/{dia} mmHg",
                    systolic = sys,
                    diastolic = dia,
                    heartRate = !string.IsNullOrWhiteSpace(r.HeartRate) ? r.HeartRate : $"{hr} bpm",
                    heartRateVal = hr,
                    bloodSugar = !string.IsNullOrWhiteSpace(patient.BloodSugar) ? patient.BloodSugar : $"{bs} mg/dL",
                    bloodSugarVal = bs,
                    temperature = !string.IsNullOrWhiteSpace(r.Temperature) ? r.Temperature : $"{temp} Â°F",
                    temperatureVal = temp,
                    spO2 = !string.IsNullOrWhiteSpace(r.SpO2) ? r.SpO2 : $"{spo2} %",
                    spO2Val = spo2,
                    respiratoryRate = !string.IsNullOrWhiteSpace(r.RespiratoryRate) ? r.RespiratoryRate : $"{rr} /min",
                    respiratoryRateVal = rr,
                    recordedBy = !string.IsNullOrWhiteSpace(r.RecordedByNurseName) ? r.RecordedByNurseName : "Staff Nurse",
                    timeText = !string.IsNullOrWhiteSpace(r.LastRoundTimeText) ? r.LastRoundTimeText : r.CreatedDate.ToString("hh:mm tt"),
                    dateText = !string.IsNullOrWhiteSpace(r.LastRoundDateText) ? r.LastRoundDateText : r.CreatedDate.ToString("MMM dd, yyyy"),
                    timestamp = r.CreatedDate.ToString("o"),
                    status = r.Status.ToString()
                });
            }
        }

        // Calculate summary trend statistics
        var systolicList = historyLogs.Select(h => (int)((dynamic)h).systolic).ToList();
        var diastolicList = historyLogs.Select(h => (int)((dynamic)h).diastolic).ToList();
        var heartRateList = historyLogs.Select(h => (int)((dynamic)h).heartRateVal).ToList();
        var spo2List = historyLogs.Select(h => (int)((dynamic)h).spO2Val).ToList();
        var sugarList = historyLogs.Select(h => (int)((dynamic)h).bloodSugarVal).ToList();
        var tempList = historyLogs.Select(h => (double)((dynamic)h).temperatureVal).ToList();

        var trendsSummary = historyLogs.Count > 0 ? new {
            totalRounds = historyLogs.Count,
            avgSystolic = systolicList.Any() ? (int)Math.Round(systolicList.Average()) : 120,
            avgDiastolic = diastolicList.Any() ? (int)Math.Round(diastolicList.Average()) : 80,
            avgHeartRate = heartRateList.Any() ? (int)Math.Round(heartRateList.Average()) : 72,
            minHeartRate = heartRateList.Any() ? heartRateList.Min() : 68,
            maxHeartRate = heartRateList.Any() ? heartRateList.Max() : 80,
            avgSpO2 = spo2List.Any() ? Math.Round(spo2List.Average(), 1) : 98.0,
            avgBloodSugar = sugarList.Any() ? (int)Math.Round(sugarList.Average()) : 105,
            avgTemperature = tempList.Any() ? Math.Round(tempList.Average(), 1) : 98.6,
            hemodynamicStatus = "Stable Telemetry",
            trendDirection = "Stable & Optimal"
        } : new {
            totalRounds = 0,
            avgSystolic = 0,
            avgDiastolic = 0,
            avgHeartRate = 0,
            minHeartRate = 0,
            maxHeartRate = 0,
            avgSpO2 = 0.0,
            avgBloodSugar = 0,
            avgTemperature = 0.0,
            hemodynamicStatus = "No Telemetry Recorded",
            trendDirection = "No Data"
        };

        var currentVitals = new {
            bloodPressure = patient.BloodPressure,
            heartRate = patient.HeartRate,
            bloodSugar = patient.BloodSugar,
            temperature = patient.Temperature,
            spO2 = patient.SpO2,
            history = historyLogs,
            trends = trendsSummary
        };

        return Ok(new { success = true, data = currentVitals });
    }

    [HttpPost("{id}/vitals")]
    [HttpPut("{id}/vitals")]
    public async Task<IActionResult> UpdatePatientVitals(
        string id,
        [FromBody] PatientVitalsDto vitalsPayload)
    {
        // Only authenticated Doctors and Nurses can record patient vitals.
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(authHeader) ||
            !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(
                StatusCodes.Status401Unauthorized,
                ApiResponse<string>.Fail(
                    "Authentication is required to record patient vital signs.",
                    "AUTHENTICATION_REQUIRED"));
        }

        string? role = null;

        try
        {
            var jwt = authHeader["Bearer ".Length..].Trim();
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();

            if (handler.CanReadToken(jwt))
            {
                var jwtToken = handler.ReadJwtToken(jwt);

                role = jwtToken.Claims
                    .FirstOrDefault(c =>
                        c.Type == System.Security.Claims.ClaimTypes.Role ||
                        c.Type == "role")
                    ?.Value;
            }
        }
        catch
        {
            return StatusCode(
                StatusCodes.Status401Unauthorized,
                ApiResponse<string>.Fail(
                    "Invalid authentication token.",
                    "INVALID_TOKEN"));
        }

        if (!string.Equals(role, "Doctor", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(role, "Nurse", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<string>.Fail(
                    "Only doctors, nurses, and administrators can record patient vital signs.",
                    "VITALS_RECORDING_NOT_ALLOWED"));
        }

        if (vitalsPayload == null)
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "Vital sign data is required.",
                    "VITALS_REQUIRED"));
        }

        var patient = await _patientService.GetPatientByIdAsync(id);

        if (patient == null)
        {
            return NotFound(
                ApiResponse<string>.Fail(
                    "Patient not found",
                    "NOT_FOUND"));
        }

        string bp = vitalsPayload.BloodPressure?.Trim() ?? "";
        string hr = vitalsPayload.HeartRate?.Trim() ?? "";
        string bs = vitalsPayload.BloodSugar?.Trim() ?? "";
        string temp = vitalsPayload.Temperature?.Trim() ?? "";
        string spo2 = (
            vitalsPayload.SpO2 ??
            vitalsPayload.OxygenSaturation ??
            "").Trim();
        string rr = vitalsPayload.RespiratoryRate?.Trim() ?? "";

        // Do not create a telemetry/history record when no actual
        // measurement has been provided.
        if (string.IsNullOrWhiteSpace(bp) &&
            string.IsNullOrWhiteSpace(hr) &&
            string.IsNullOrWhiteSpace(bs) &&
            string.IsNullOrWhiteSpace(temp) &&
            string.IsNullOrWhiteSpace(spo2) &&
            string.IsNullOrWhiteSpace(rr))
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "Please enter at least one vital measurement before recording the telemetry round.",
                    "VITALS_MEASUREMENT_REQUIRED"));
        }

        if (!string.IsNullOrWhiteSpace(bp))
            patient.BloodPressure = bp;

        if (!string.IsNullOrWhiteSpace(hr))
            patient.HeartRate = hr;

        if (!string.IsNullOrWhiteSpace(bs))
            patient.BloodSugar = bs;

        if (!string.IsNullOrWhiteSpace(temp))
            patient.Temperature = temp;

        if (!string.IsNullOrWhiteSpace(spo2))
            patient.SpO2 = spo2;

        patient.UpdatedDate = DateTime.UtcNow;

        var now = DateTime.UtcNow;

        // Create a historical vital record ONLY because a Doctor/Nurse
        // explicitly recorded an actual measurement.
        var round = new VitalRoundRecord
        {
            Id = Guid.NewGuid(),
            PatientId = patient.Id,
            PatientName = patient.Name,
            PatientIdCode = patient.PatientIdCode,

            BloodPressure = bp,
            HeartRate = hr,
            Temperature = temp,
            SpO2 = spo2,
            RespiratoryRate = rr,

            RecordedByNurseName =
                !string.IsNullOrWhiteSpace(vitalsPayload.RecordedBy)
                    ? vitalsPayload.RecordedBy.Trim()
                    : role,

            CareUnit = patient.CareUnit,
            RoomBed = patient.FloorRoom,

            Status = ConnectedCare.Domain.Enums.VitalRoundStatus.Completed,

            LastRoundTimeText =
                !string.IsNullOrWhiteSpace(vitalsPayload.TimeText)
                    ? vitalsPayload.TimeText.Trim()
                    : now.ToString("hh:mm tt"),

            LastRoundDateText =
                !string.IsNullOrWhiteSpace(vitalsPayload.DateText)
                    ? vitalsPayload.DateText.Trim()
                    : now.ToString("MMM dd, yyyy"),

            CreatedDate = now
        };

        _context.VitalRounds.Add(round);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Vital signs recorded successfully.",
            data = patient,
            round = round
        });
    }

    [HttpGet("{id}/care-plan")]
    public async Task<IActionResult> GetPatientCarePlan(string id)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        var plan = await _context.PatientCarePlanRecords
            .FirstOrDefaultAsync(p => p.PatientId == patient.Id || p.PatientIdCode == patient.PatientIdCode);

        if (plan == null)
        {
            // Return structured baseline care plan derived from patient records
            var defaultGoals = new List<string>
            {
                "Maintain Blood Pressure below 130/85 mmHg",
                "Adhere to daily low-sodium cardiac diet protocol",
                "Complete 20-minute daily assisted physical rehabilitation",
                "Monitor oxygen saturation (SpO2 >= 95%) during mobility exercises"
            };

            return Ok(new {
                success = true,
                data = new {
                    id = Guid.NewGuid(),
                    patientId = patient.Id,
                    patientName = patient.Name,
                    patientIdCode = patient.PatientIdCode,
                    planTitle = $"{patient.CareUnit} Comprehensive Individualized Care Plan",
                    primaryCondition = !string.IsNullOrWhiteSpace(patient.MedicalConditions) ? patient.MedicalConditions.Split(',')[0].Trim() : "Cardiac Management",
                    status = "Active",
                    progressPercentage = 75,
                    startDate = !string.IsNullOrWhiteSpace(patient.AdmissionDate) ? patient.AdmissionDate : patient.CreatedDate.ToString("MM/dd/yyyy"),
                    reviewDate = DateTime.UtcNow.AddDays(14).ToString("MM/dd/yyyy"),
                    goals = defaultGoals,
                    interventions = "Daily telemetry monitoring, cardiac diet, physical therapy 2x daily, medication titration as ordered.",
                    attendingDoctorName = patient.PrimaryDoctorName ?? "",
                    assignedNurseName = patient.AssignedNurseName ?? "Staff Nurse",
                    notes = patient.AdditionalNotes ?? ""
                }
            });
        }

        List<string> goalsList = new List<string>();
        if (!string.IsNullOrWhiteSpace(plan.GoalsText))
        {
            goalsList = plan.GoalsText.Split(new[] { "||", "\n", ";" }, StringSplitOptions.RemoveEmptyEntries)
                                      .Select(g => g.Trim())
                                      .ToList();
        }

        return Ok(new {
            success = true,
            data = new {
                id = plan.Id,
                patientId = plan.PatientId,
                patientName = plan.PatientName,
                patientIdCode = plan.PatientIdCode,
                planTitle = plan.PlanName,
                status = plan.Status,
                progressPercentage = plan.ProgressPercentage,
                startDate = plan.StartDate,
                reviewDate = plan.ReviewDate,
                goals = goalsList,
                interventions = plan.NotesText,
                attendingDoctorName = plan.PrescribedBy ?? patient.PrimaryDoctorName ?? "",
                assignedNurseName = patient.AssignedNurseName ?? "Staff Nurse"
            }
        });
    }

    [HttpPost("{id}/care-plan")]
    [HttpPut("{id}/care-plan")]
    public async Task<IActionResult> UpdatePatientCarePlan(string id, [FromBody] PatientCarePlanDto dto)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        var existingPlan = await _context.PatientCarePlanRecords
            .FirstOrDefaultAsync(p => p.PatientId == patient.Id || p.PatientIdCode == patient.PatientIdCode);

        string joinedGoals = dto.Goals != null ? string.Join(" || ", dto.Goals) : (dto.Interventions ?? "");

        if (existingPlan != null)
        {
            if (!string.IsNullOrWhiteSpace(dto.PlanTitle)) existingPlan.PlanName = dto.PlanTitle;
            if (!string.IsNullOrWhiteSpace(dto.Status)) existingPlan.Status = dto.Status;
            if (dto.ProgressPercentage > 0) existingPlan.ProgressPercentage = dto.ProgressPercentage;
            if (!string.IsNullOrWhiteSpace(dto.StartDate)) existingPlan.StartDate = dto.StartDate;
            if (!string.IsNullOrWhiteSpace(dto.ReviewDate)) existingPlan.ReviewDate = dto.ReviewDate;
            if (!string.IsNullOrWhiteSpace(joinedGoals)) existingPlan.GoalsText = joinedGoals;
            if (!string.IsNullOrWhiteSpace(dto.Interventions)) existingPlan.NotesText = dto.Interventions;
            if (!string.IsNullOrWhiteSpace(dto.AttendingDoctorName)) existingPlan.PrescribedBy = dto.AttendingDoctorName;
            existingPlan.UpdatedDate = DateTime.UtcNow;
        }
        else
        {
            existingPlan = new PatientCarePlanRecord
            {
                Id = Guid.NewGuid(),
                PatientId = patient.Id,
                PatientName = patient.Name,
                PatientIdCode = patient.PatientIdCode,
                PlanName = dto.PlanTitle ?? $"{patient.CareUnit} Comprehensive Care Plan",
                Status = dto.Status ?? "Active",
                ProgressPercentage = dto.ProgressPercentage > 0 ? dto.ProgressPercentage : 50,
                StartDate = dto.StartDate ?? DateTime.UtcNow.ToString("MM/dd/yyyy"),
                ReviewDate = dto.ReviewDate ?? DateTime.UtcNow.AddDays(14).ToString("MM/dd/yyyy"),
                GoalsText = joinedGoals,
                NotesText = dto.Interventions ?? "",
                PrescribedBy = dto.AttendingDoctorName ?? patient.PrimaryDoctorName ?? "",
                CreatedDate = DateTime.UtcNow
            };
            _context.PatientCarePlanRecords.Add(existingPlan);
        }

        if (!string.IsNullOrWhiteSpace(dto.Interventions))
        {
            patient.AdditionalNotes = dto.Interventions;
        }

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Care plan saved successfully", data = existingPlan });
    }



    [HttpGet("{id}/appointments")]
    public async Task<IActionResult> GetPatientAppointments(string id)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        var consultations = await _context.Consultations
            .Where(c => c.PatientId == patient.Id || c.PatientIdCode == patient.PatientIdCode || c.PatientName.ToLower() == patient.Name.ToLower())
            .OrderByDescending(c => c.CreatedDate)
            .ToListAsync();

        return Ok(new { success = true, message = "Success", data = consultations });
    }

    [HttpPost("{id}/appointments")]
    public async Task<IActionResult> CreatePatientAppointment(string id, [FromBody] ConsultationRecord appt)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        appt.Id = Guid.NewGuid();
        appt.PatientId = patient.Id;
        appt.PatientName = patient.Name;
        appt.PatientIdCode = patient.PatientIdCode;
        appt.PatientAvatar = patient.Avatar ?? "";
        appt.CareUnit = patient.CareUnit;
        appt.RoomNumber = patient.FloorRoom;
        appt.AgeGender = patient.AgeGender;
        appt.BloodGroup = patient.BloodType;
        if (string.IsNullOrWhiteSpace(appt.PhysicianName)) appt.PhysicianName = patient.PrimaryDoctorName ?? "Attending Staff";
        if (string.IsNullOrWhiteSpace(appt.ConsultationType)) appt.ConsultationType = "Follow-up Consultation";
        if (string.IsNullOrWhiteSpace(appt.DateTimeText)) appt.DateTimeText = DateTime.UtcNow.ToString("MMM dd, yyyy hh:mm tt");
        appt.CreatedDate = DateTime.UtcNow;
        appt.UpdatedDate = DateTime.UtcNow;

        _context.Consultations.Add(appt);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Appointment scheduled successfully", data = appt });
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetPatientHistory(string id)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        var historyItems = new List<object>
        {
            new { id = Guid.NewGuid(), title = "Patient Profile Registered", date = patient.CreatedDate.ToString("MMM dd, yyyy hh:mm tt"), by = patient.CreatedBy ?? "System Administrator", type = "Registration" },
            new { id = Guid.NewGuid(), title = $"Admitted to {patient.CareUnit} ({patient.FloorRoom})", date = (!string.IsNullOrEmpty(patient.AdmissionDate) ? patient.AdmissionDate : patient.CreatedDate.ToString("MM/dd/yyyy")), by = patient.PrimaryDoctorName ?? "Attending Staff", type = "Admission" },
            new { id = Guid.NewGuid(), title = $"Vitals Logged - BP: {patient.BloodPressure}, HR: {patient.HeartRate}", date = (patient.UpdatedDate ?? DateTime.UtcNow).ToString("MMM dd, yyyy hh:mm tt"), by = patient.AssignedNurseName ?? "Staff Nurse", type = "Vitals" }
        };

        return Ok(new { success = true, data = historyItems });
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

    [HttpPut("{id}/status")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdatePatientStatus(string id, [FromBody] System.Text.Json.JsonElement body)
    {
        Patient? patient = null;
        if (Guid.TryParse(id, out var gId))
        {
            patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == gId);
        }
        if (patient == null)
        {
            var idLower = id.Trim().ToLower();
            patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientIdCode.ToLower() == idLower || p.Mrn.ToLower() == idLower || p.Name.ToLower() == idLower);
        }

        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        string? statusStr = null;
        if (body.ValueKind == System.Text.Json.JsonValueKind.Object)
        {
            if (body.TryGetProperty("status", out var sProp)) statusStr = sProp.GetString();
            else if (body.TryGetProperty("Status", out var sProp2)) statusStr = sProp2.GetString();
        }
        else if (body.ValueKind == System.Text.Json.JsonValueKind.String)
        {
            statusStr = body.GetString();
        }

        if (!string.IsNullOrWhiteSpace(statusStr))
        {
            var s = statusStr.Trim();
            if (s.Contains("Discharg", StringComparison.OrdinalIgnoreCase) || s == "2")
            {
                patient.Status = PatientStatus.Discharged;
                patient.DischargePlan = "Discharged";
            }
            else if (s.Contains("Care", StringComparison.OrdinalIgnoreCase) || s == "0" || s.Equals("InCare", StringComparison.OrdinalIgnoreCase))
            {
                patient.Status = PatientStatus.InCare;
                patient.DischargePlan = "In Care";
            }
            else if (s.Contains("Admit", StringComparison.OrdinalIgnoreCase) || s == "1")
            {
                patient.Status = PatientStatus.Admitted;
            }
            else if (s.Contains("Inact", StringComparison.OrdinalIgnoreCase) || s == "3")
            {
                patient.Status = PatientStatus.Inactive;
            }

            patient.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return Ok(ApiResponse<Patient>.Ok(patient, "Patient status updated successfully"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePatient(string id, [FromBody] Patient updatedPatient)
    {
        var result = await _patientService.UpdatePatientAsync(id, updatedPatient);
        if (result == null)
        {
            var idLower = id.Trim().ToLower();
            var fallback = await _context.Patients.FirstOrDefaultAsync(p => p.PatientIdCode.ToLower() == idLower || p.Name.ToLower() == idLower);
            if (fallback != null)
            {
                result = await _patientService.UpdatePatientAsync(fallback.Id.ToString(), updatedPatient);
            }
        }

        if (result == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }

        if (result.Status == PatientStatus.Discharged)
        {
            result.DischargePlan = "Discharged";
            result.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
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
        var result = await _patientService.DeletePatientAsync(id);

        if (!result.Success)
        {
            if (result.ErrorMessage == "Patient not found.")
            {
                return NotFound(
                    ApiResponse<string>.Fail(
                        result.ErrorMessage,
                        "NOT_FOUND"));
            }

            return Conflict(
                ApiResponse<string>.Fail(
                    result.ErrorMessage!,
                    "DEPENDENCY_EXISTS"));
        }

        return Ok(
            ApiResponse<string>.Ok(
                "Patient deleted successfully."));
    }

    private static int ParseSystolic(string? bp)
    {
        if (string.IsNullOrWhiteSpace(bp)) return 120;
        var parts = bp.Split('/');
        if (parts.Length > 0)
        {
            var digits = new string(parts[0].Where(char.IsDigit).ToArray());
            if (int.TryParse(digits, out int sys) && sys > 0) return sys;
        }
        return 120;
    }


    private static int ParseDiastolic(string? bp)
    {
        if (string.IsNullOrWhiteSpace(bp)) return 80;
        var parts = bp.Split('/');
        if (parts.Length > 1)
        {
            var digits = new string(parts[1].Where(char.IsDigit).ToArray());
            if (int.TryParse(digits, out int dia) && dia > 0) return dia;
        }
        return 80;
    }

    private static int ParseIntDigits(string? val, int defaultVal)
    {
        if (string.IsNullOrWhiteSpace(val)) return defaultVal;
        var digits = new string(val.Where(char.IsDigit).ToArray());
        if (int.TryParse(digits, out int res) && res > 0) return res;
        return defaultVal;
    }

    private static double ParseDoubleDigits(string? val, double defaultVal)
    {
        if (string.IsNullOrWhiteSpace(val)) return defaultVal;
        var cleaned = new string(val.Where(c => char.IsDigit(c) || c == '.').ToArray());
        if (double.TryParse(cleaned, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double res) && res > 0) return res;
        return defaultVal;
    }
}

public class PatientVitalsDto
{
    public string? BloodPressure { get; set; }
    public string? HeartRate { get; set; }
    public string? BloodSugar { get; set; }
    public string? Temperature { get; set; }
    public string? SpO2 { get; set; }
    public string? OxygenSaturation { get; set; }
    public string? RespiratoryRate { get; set; }
    public string? RecordedBy { get; set; }
    public string? TimeText { get; set; }
    public string? DateText { get; set; }
}

public class PatientCarePlanDto
{
    public string? PlanTitle { get; set; }
    public string? PrimaryCondition { get; set; }
    public string? Status { get; set; }
    public int ProgressPercentage { get; set; }
    public string? StartDate { get; set; }
    public string? ReviewDate { get; set; }
    public List<string>? Goals { get; set; }
    public string? Interventions { get; set; }
    public string? Notes { get; set; }
    public string? AttendingDoctorName { get; set; }
    public string? AssignedNurseName { get; set; }
}

public class ClinicalEncounterRequestDto
{
    public string? EncounterType { get; set; }
    public string? ReasonDiagnosis { get; set; }
    public string? ProviderName { get; set; }
    public string? DateText { get; set; }
}







