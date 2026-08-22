using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Services;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.DischargeChecklists.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/discharge-checklists")]
public class DischargeChecklistsController : ControllerBase
{
    private readonly IDischargeChecklistService _service;

    public DischargeChecklistsController(IDischargeChecklistService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetChecklists(
        [FromQuery] string? status,
        [FromQuery] string? careUnit,
        [FromQuery] string? search)
    {
        var result = await _service.GetChecklistsAsync(status, careUnit, search);
        return Ok(ApiResponse<List<DischargeChecklistDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _service.GetSummaryAsync();
        return Ok(ApiResponse<DischargeChecklistSummaryDto>.Ok(summary));
    }

    [HttpPost]
    public async Task<IActionResult> CreateChecklist([FromBody] CreateDischargeChecklistDto dto)
    {
        var created = await _service.CreateChecklistAsync(dto);
        return Ok(ApiResponse<DischargeChecklistDto>.Ok(created, "Discharge checklist created successfully"));
    }
}
