using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Services;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.NurseApp.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/vital-rounds")]
public class VitalRoundsController : ControllerBase
{
    private readonly IVitalRoundService _service;

    public VitalRoundsController(IVitalRoundService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetVitalRounds(
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var result = await _service.GetVitalRoundsAsync(status, search);
        return Ok(ApiResponse<List<VitalRoundDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _service.GetSummaryAsync();
        return Ok(ApiResponse<VitalRoundSummaryDto>.Ok(summary));
    }

    [HttpPost("{id}/record")]
    public async Task<IActionResult> RecordVitals(Guid id, [FromBody] RecordVitalsDto dto)
    {
        var updated = await _service.RecordVitalsAsync(id, dto);
        return Ok(ApiResponse<VitalRoundDto>.Ok(updated, "Vitals recorded successfully"));
    }
}
