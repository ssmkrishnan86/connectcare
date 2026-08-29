using ConnectedCare.Application.Features.DischargeChecklists.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.DischargeChecklists.DTOs;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
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

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateChecklist(Guid id, [FromBody] CreateDischargeChecklistDto dto)
    {
        var item = await _context.DischargeChecklists.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
        {
            return NotFound(ApiResponse<string>.Fail("Discharge checklist not found"));
        }

        if (!string.IsNullOrWhiteSpace(dto.PatientName)) item.PatientName = dto.PatientName;
        if (!string.IsNullOrWhiteSpace(dto.RoomNumber)) item.RoomNumber = dto.RoomNumber;
        if (!string.IsNullOrWhiteSpace(dto.CareUnit)) item.CareUnit = dto.CareUnit;
        if (!string.IsNullOrWhiteSpace(dto.AttendingDoctorName)) item.AttendingDoctorName = dto.AttendingDoctorName;
        if (!string.IsNullOrWhiteSpace(dto.ExpectedDischargeText)) item.ExpectedDischargeText = dto.ExpectedDischargeText;
        if (!string.IsNullOrWhiteSpace(dto.ExpectedDischargeRelative)) item.ExpectedDischargeRelative = dto.ExpectedDischargeRelative;
        if (!string.IsNullOrWhiteSpace(dto.AdmitDateText)) item.AdmitDateText = dto.AdmitDateText;
        if (!string.IsNullOrWhiteSpace(dto.AdmitDaysText)) item.AdmitDaysText = dto.AdmitDaysText;
        if (!string.IsNullOrWhiteSpace(dto.Notes)) item.Notes = dto.Notes;

        if (!string.IsNullOrWhiteSpace(dto.ChecklistStatus))
        {
            if (Enum.TryParse<DischargeStatus>(dto.ChecklistStatus, true, out var status))
            {
                item.ChecklistStatus = status;
            }
            else if (dto.ChecklistStatus.Equals("Ready for Discharge", StringComparison.OrdinalIgnoreCase) || dto.ChecklistStatus.Equals("Ready", StringComparison.OrdinalIgnoreCase))
            {
                item.ChecklistStatus = DischargeStatus.Ready;
            }
            else if (dto.ChecklistStatus.Equals("Pending Items", StringComparison.OrdinalIgnoreCase) || dto.ChecklistStatus.Equals("PendingItems", StringComparison.OrdinalIgnoreCase))
            {
                item.ChecklistStatus = DischargeStatus.PendingItems;
            }
            else if (dto.ChecklistStatus.Equals("Discharged", StringComparison.OrdinalIgnoreCase))
            {
                item.ChecklistStatus = DischargeStatus.Discharged;
            }
            else if (dto.ChecklistStatus.Equals("In Progress", StringComparison.OrdinalIgnoreCase) || dto.ChecklistStatus.Equals("InProgress", StringComparison.OrdinalIgnoreCase))
            {
                item.ChecklistStatus = DischargeStatus.InProgress;
            }
            else if (dto.ChecklistStatus.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                item.ChecklistStatus = DischargeStatus.Cancelled;
            }
        }

        if (dto.ProgressPercentage.HasValue) item.ProgressPercentage = dto.ProgressPercentage.Value;
        if (dto.PendingItemsCount.HasValue) item.PendingItemsCount = dto.PendingItemsCount.Value;
        if (dto.CompletedItemsCount.HasValue) item.CompletedItemsCount = dto.CompletedItemsCount.Value;
        if (dto.InProgressItemsCount.HasValue) item.InProgressItemsCount = dto.InProgressItemsCount.Value;
        if (dto.NotStartedItemsCount.HasValue) item.NotStartedItemsCount = dto.NotStartedItemsCount.Value;
        if (dto.TotalItemsCount.HasValue) item.TotalItemsCount = dto.TotalItemsCount.Value;

        item.UpdatedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<DischargeChecklistRecord>.Ok(item, "Discharge checklist updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChecklist(Guid id)
    {
        var item = await _context.DischargeChecklists.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
        {
            return NotFound(ApiResponse<string>.Fail("Discharge checklist not found"));
        }

        _context.DischargeChecklists.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "Discharge checklist deleted successfully"));
    }
}



