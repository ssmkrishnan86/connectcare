using ConnectedCare.Application.Features.DischargeChecklists.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.DischargeChecklists.DTOs;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/discharge-checklists")]
public class DischargeChecklistsController : ControllerBase
{
    private readonly IDischargeChecklistService _service;
    private readonly ConnectedCareDbContext _context;

    public DischargeChecklistsController(IDischargeChecklistService service, ConnectedCareDbContext context)
    {
        _service = service;
        _context = context;
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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetChecklistById(Guid id)
    {
        var item = await _context.DischargeChecklists.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
        {
            return NotFound(ApiResponse<string>.Fail("Discharge checklist not found"));
        }
        return Ok(ApiResponse<object>.Ok(item));
    }

    [HttpPost]
    public async Task<IActionResult> CreateChecklist([FromBody] CreateDischargeChecklistDto dto)
    {
        var created = await _service.CreateChecklistAsync(dto);
        return Ok(ApiResponse<DischargeChecklistDto>.Ok(created, "Discharge checklist created successfully"));
    }

    [HttpPost("{id}/complete")]
    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompleteChecklist(Guid id)
    {
        var item = await _context.DischargeChecklists.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
        {
            return NotFound(ApiResponse<string>.Fail("Discharge checklist not found"));
        }

        item.ChecklistStatus = DischargeStatus.Ready;
        item.ProgressPercentage = 100;
        item.PendingItemsCount = 0;
        item.CompletedItemsCount = item.TotalItemsCount;
        item.InProgressItemsCount = 0;
        item.NotStartedItemsCount = 0;
        item.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new
        {
            item.Id,
            item.PatientId,
            item.PatientName,
            item.PatientIdCode,
            checklistStatus = "Ready",
            progressPercentage = 100,
            pendingItemsCount = 0
        }, "Checklist marked as ready for discharge"));
    }
}



