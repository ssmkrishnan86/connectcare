using ConnectedCare.Application.Features.Consultations.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.Consultations.DTOs;

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
        [FromQuery] string? tab,
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] string? patient,
        [FromQuery] string? careUnit,
        [FromQuery] string? search,
        [FromQuery] string? doctorName)
    {
        var result = await _service.GetConsultationsAsync(tab, status, type, patient, careUnit, search, doctorName);
        return Ok(ApiResponse<List<ConsultationDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _service.GetSummaryAsync();
        return Ok(ApiResponse<ConsultationSummaryDto>.Ok(summary));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound(ApiResponse<ConsultationDto>.Fail("Consultation not found"));
        return Ok(ApiResponse<ConsultationDto>.Ok(item));
    }

    [HttpPost]
    public async Task<IActionResult> CreateConsultation([FromBody] CreateConsultationDto dto)
    {
        var created = await _service.CreateConsultationAsync(dto);
        return Ok(ApiResponse<ConsultationDto>.Ok(created, "Consultation created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateConsultation(Guid id, [FromBody] UpdateConsultationDto dto)
    {
        var updated = await _service.UpdateConsultationAsync(id, dto);
        if (updated == null)
            return NotFound(ApiResponse<ConsultationDto>.Fail("Consultation not found"));
        return Ok(ApiResponse<ConsultationDto>.Ok(updated, "Consultation updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteConsultation(Guid id)
    {
        var deleted = await _service.DeleteConsultationAsync(id);
        if (!deleted)
            return NotFound(ApiResponse<bool>.Fail("Consultation not found"));
        return Ok(ApiResponse<bool>.Ok(true, "Consultation deleted successfully"));
    }

    [HttpPost("{id:guid}/like")]
    public async Task<IActionResult> ToggleLike(Guid id)
    {
        var result = await _service.ToggleLikeAsync(id);
        if (result == null)
            return NotFound(ApiResponse<ConsultationDto>.Fail("Consultation not found"));
        return Ok(ApiResponse<ConsultationDto>.Ok(result, "Like status updated"));
    }

    [HttpPost("{id:guid}/follow-up")]
    public async Task<IActionResult> ScheduleFollowUp(Guid id, [FromBody] ScheduleFollowUpDto dto)
    {
        var result = await _service.ScheduleFollowUpAsync(id, dto);
        if (result == null)
            return NotFound(ApiResponse<ConsultationDto>.Fail("Consultation not found"));
        return Ok(ApiResponse<ConsultationDto>.Ok(result, "Follow-up scheduled successfully"));
    }

    [HttpPost("{id:guid}/notes")]
    public async Task<IActionResult> AddNotes(Guid id, [FromBody] AddConsultationNoteDto dto)
    {
        var result = await _service.AddConsultationNoteAsync(id, dto);
        if (result == null)
            return NotFound(ApiResponse<ConsultationDto>.Fail("Consultation not found"));
        return Ok(ApiResponse<ConsultationDto>.Ok(result, "Clinical note added successfully"));
    }

    [HttpPost("{id:guid}/referral")]
    public async Task<IActionResult> ReferSpecialist(Guid id, [FromBody] ReferSpecialistDto dto)
    {
        var result = await _service.ReferSpecialistAsync(id, dto);
        if (result == null)
            return NotFound(ApiResponse<ConsultationDto>.Fail("Consultation not found"));
        return Ok(ApiResponse<ConsultationDto>.Ok(result, "Specialist referral recorded successfully"));
    }

    [HttpGet("recent/{patientIdCode}")]
    public async Task<IActionResult> GetRecentByPatient(string patientIdCode)
    {
        var list = await _service.GetRecentConsultationsByPatientAsync(patientIdCode);
        return Ok(ApiResponse<List<ConsultationDto>>.Ok(list));
    }
}



