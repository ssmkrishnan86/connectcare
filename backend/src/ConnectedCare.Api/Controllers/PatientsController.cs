using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Services;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.Dashboard.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;

    public PatientsController(IPatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPatients(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? careUnit)
    {
        var patients = await _patientService.GetPatientsAsync(search, status, careUnit);
        return Ok(ApiResponse<List<Patient>>.Ok(patients));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetPatientStats()
    {
        var stats = await _patientService.GetPatientStatsAsync();
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
