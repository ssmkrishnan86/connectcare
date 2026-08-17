using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Services;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.NurseApp.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/consultations")]
public class ConsultationsController : ControllerBase
{
    private readonly IConsultationService _service;

    public ConsultationsController(IConsultationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetConsultations(
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] string? search)
    {
        var result = await _service.GetConsultationsAsync(status, type, search);
        return Ok(ApiResponse<List<ConsultationDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _service.GetSummaryAsync();
        return Ok(ApiResponse<ConsultationSummaryDto>.Ok(summary));
    }

    [HttpPost]
    public async Task<IActionResult> CreateConsultation([FromBody] CreateConsultationDto dto)
    {
        var created = await _service.CreateConsultationAsync(dto);
        return Ok(ApiResponse<ConsultationDto>.Ok(created, "Consultation created successfully"));
    }
}
