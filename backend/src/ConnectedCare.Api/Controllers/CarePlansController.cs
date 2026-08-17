using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Services;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.NurseApp.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/care-plans")]
public class CarePlansController : ControllerBase
{
    private readonly ICarePlanService _service;

    public CarePlansController(ICarePlanService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetCarePlans(
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var result = await _service.GetCarePlansAsync(status, search);
        return Ok(ApiResponse<List<CarePlanDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _service.GetSummaryAsync();
        return Ok(ApiResponse<CarePlanSummaryDto>.Ok(summary));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCarePlan([FromBody] CreateCarePlanDto dto)
    {
        var created = await _service.CreateCarePlanAsync(dto);
        return Ok(ApiResponse<CarePlanDto>.Ok(created, "Care plan created successfully"));
    }
}
