using ConnectedCare.Application.Features.Patients.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Domain.Entities;
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
        // 1. Explicit query parameter overrides
        if (queryDoctorId.HasValue && queryDoctorId.Value != Guid.Empty)
            return (queryDoctorId, null, "Doctor");
        if (queryNurseId.HasValue && queryNurseId.Value != Guid.Empty)
            return (null, queryNurseId, "Nurse");

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

                    // If caller is explicitly Admin role, they can view all patients without filter
                    if (roleClaim?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true)
                    {
                        return (null, null, "Admin");
                    }

                    // Check user record in database
                    if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var userId))
                    {
                        var user = await _context.Users
                            .Include(u => u.Doctor)
                            .Include(u => u.Nurse)
                            .Include(u => u.UserRoles)
                                .ThenInclude(ur => ur.Role)
                            .FirstOrDefaultAsync(u => u.Id == userId);

                        if (user != null)
                        {
                            var userRole = user.UserRoles.Select(ur => ur.Role?.RoleName).FirstOrDefault() ?? user.Role;
                            if (userRole.Equals("Doctor", StringComparison.OrdinalIgnoreCase) && user.Doctor != null)
                            {
                                return (user.Doctor.Id, null, "Doctor");
                            }
                            if (userRole.Equals("Nurse", StringComparison.OrdinalIgnoreCase) && user.Nurse != null)
                            {
                                return (null, user.Nurse.Id, "Nurse");
                            }
                            if (userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                            {
                                return (null, null, "Admin");
                            }
                        }
                    }

                    if (!string.IsNullOrEmpty(usernameClaim))
                    {
                        var user = await _context.Users
                            .Include(u => u.Doctor)
                            .Include(u => u.Nurse)
                            .FirstOrDefaultAsync(u => u.Username.ToLower() == usernameClaim.ToLower());

                        if (user != null)
                        {
                            if (user.Doctor != null) return (user.Doctor.Id, null, "Doctor");
                            if (user.Nurse != null) return (null, user.Nurse.Id, "Nurse");
                        }
                    }
                }
            }
            catch { }
        }

        return (null, null, "All");
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

    [HttpPost]
    public async Task<IActionResult> CreatePatient([FromBody] Patient newPatient)
    {
        var created = await _patientService.CreatePatientAsync(newPatient);
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
        return Ok(ApiResponse<Patient>.Ok(result, "Patient updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePatient(string id)
    {
        var result = await _patientService.DeletePatientAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found", "NOT_FOUND"));
        }
        return Ok(ApiResponse<string>.Ok("Patient deleted successfully"));
    }
}



