using ConnectedCare.Application.Features.CarePlans.Services;
using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.CarePlans.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/care-plans")]
[Route("api/careplans")]
public class CarePlansController : ControllerBase

{
    private readonly ICarePlanService _service;

    public CarePlansController(ICarePlanService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetCarePlans(
        [FromQuery] string? tab,
        [FromQuery] string? status,
        [FromQuery] string? unit,
        [FromQuery] string? patient,
        [FromQuery] string? condition,
        [FromQuery] string? search,
        [FromQuery] string? doctorName)
    {
        var result = await _service.GetCarePlansAsync(tab, status, unit, patient, condition, search, doctorName);
        return Ok(ApiResponse<List<CarePlanDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _service.GetSummaryAsync();
        return Ok(ApiResponse<CarePlanSummaryDto>.Ok(summary));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<CarePlanDto>.Fail("Care plan not found"));
        return Ok(ApiResponse<CarePlanDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCarePlan([FromBody] CreateCarePlanDto dto)
    {
        var created = await _service.CreateCarePlanAsync(dto);
        return Ok(ApiResponse<CarePlanDto>.Ok(created, "Care plan created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCarePlan(Guid id, [FromBody] UpdateCarePlanDto dto)
    {
        var updated = await _service.UpdateCarePlanAsync(id, dto);
        if (updated == null) return NotFound(ApiResponse<CarePlanDto>.Fail("Care plan not found"));
        return Ok(ApiResponse<CarePlanDto>.Ok(updated, "Care plan updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCarePlan(Guid id)
    {
        var deleted = await _service.DeleteCarePlanAsync(id);
        if (!deleted) return NotFound(ApiResponse<bool>.Fail("Care plan not found"));
        return Ok(ApiResponse<bool>.Ok(true, "Care plan deleted successfully"));
    }

    [HttpPost("{id:guid}/notes")]
    public async Task<IActionResult> AddNote(Guid id, [FromBody] AddCarePlanNoteDto dto)
    {
        var updated = await _service.AddNoteAsync(id, dto);
        if (updated == null) return NotFound(ApiResponse<CarePlanDto>.Fail("Care plan not found"));
        return Ok(ApiResponse<CarePlanDto>.Ok(updated, "Note added successfully"));
    }

    [HttpPost("{id:guid}/review")]
    public async Task<IActionResult> ReviewCarePlan(Guid id, [FromBody] ReviewCarePlanDto dto)
    {
        var updated = await _service.ReviewCarePlanAsync(id, dto);
        if (updated == null) return NotFound(ApiResponse<CarePlanDto>.Fail("Care plan not found"));
        return Ok(ApiResponse<CarePlanDto>.Ok(updated, "Care plan reviewed successfully"));
    }
}




