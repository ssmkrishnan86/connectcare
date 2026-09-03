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
        [FromQuery] string? search,
        [FromQuery] Guid? doctorId,
        [FromQuery] Guid? nurseId)
    {
        var result = await _service.GetChecklistsAsync(status, careUnit, search, doctorId, nurseId);
        return Ok(ApiResponse<List<DischargeChecklistDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] Guid? doctorId,
        [FromQuery] Guid? nurseId)
    {
        var summary = await _service.GetSummaryAsync(doctorId, nurseId);
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

    private async Task<Patient?> FindLinkedPatientAsync(Guid? patientId, string? patientIdCode, string? patientName)
    {
        Patient? patient = null;
        if (patientId.HasValue && patientId.Value != Guid.Empty)
        {
            patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == patientId.Value);
        }
        if (patient == null && !string.IsNullOrWhiteSpace(patientIdCode))
        {
            var code = patientIdCode.Trim().ToLower();
            patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientIdCode.ToLower() == code || p.Mrn.ToLower() == code);
        }
        if (patient == null && !string.IsNullOrWhiteSpace(patientName))
        {
            var name = patientName.Trim().ToLower();
            patient = await _context.Patients.FirstOrDefaultAsync(p => p.Name.ToLower() == name || (p.FirstName + " " + p.LastName).ToLower() == name || p.Name.ToLower().Contains(name));
        }
        return patient;
    }

    [HttpPost]
    public async Task<IActionResult> CreateChecklist([FromBody] CreateDischargeChecklistDto dto)
    {
        // Bug 9: Check if a checklist already exists for this patient to prevent duplicate rows
        DischargeChecklistRecord? existing = null;
        if (dto.PatientId.HasValue && dto.PatientId.Value != Guid.Empty)
        {
            existing = await _context.DischargeChecklists.FirstOrDefaultAsync(x => x.PatientId == dto.PatientId.Value);
        }
        if (existing == null && !string.IsNullOrWhiteSpace(dto.PatientIdCode))
        {
            var cLower = dto.PatientIdCode.Trim().ToLower();
            existing = await _context.DischargeChecklists.FirstOrDefaultAsync(x => x.PatientIdCode.ToLower() == cLower);
        }
        if (existing == null && !string.IsNullOrWhiteSpace(dto.PatientName))
        {
            var pLower = dto.PatientName.Trim().ToLower();
            existing = await _context.DischargeChecklists.FirstOrDefaultAsync(x => x.PatientName.ToLower() == pLower);
        }

        if (existing != null)
        {
            return await UpdateChecklist(existing.Id, dto);
        }

        var created = await _service.CreateChecklistAsync(dto);

        // Bug 6: Sync patient status if created as Discharged
        if (dto.ChecklistStatus?.Contains("Discharg", StringComparison.OrdinalIgnoreCase) == true || dto.ChecklistStatus == "3")
        {
            var patient = await FindLinkedPatientAsync(dto.PatientId, dto.PatientIdCode, dto.PatientName);
            if (patient != null)
            {
                patient.Status = PatientStatus.Discharged;
                patient.DischargePlan = "Discharged";
                patient.UpdatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

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

        bool isDischarged = false;
        if (!string.IsNullOrWhiteSpace(dto.ChecklistStatus))
        {
            var s = dto.ChecklistStatus.Trim().ToLower();
            if (s.Contains("discharg") || s == "3")
            {
                item.ChecklistStatus = DischargeStatus.Discharged;
                isDischarged = true;
            }
            else if (s.Contains("ready") || s == "1")
            {
                item.ChecklistStatus = DischargeStatus.Ready;
            }
            else if (s.Contains("pending") || s == "2")
            {
                item.ChecklistStatus = DischargeStatus.PendingItems;
            }
            else if (s.Contains("progress") || s == "0")
            {
                item.ChecklistStatus = DischargeStatus.InProgress;
            }
            else if (s.Contains("cancel") || s == "4")
            {
                item.ChecklistStatus = DischargeStatus.Cancelled;
            }
            else if (Enum.TryParse<DischargeStatus>(dto.ChecklistStatus, true, out var status))
            {
                item.ChecklistStatus = status;
                isDischarged = status == DischargeStatus.Discharged;
            }
        }

        if (dto.ProgressPercentage.HasValue) item.ProgressPercentage = dto.ProgressPercentage.Value;
        if (dto.PendingItemsCount.HasValue) item.PendingItemsCount = dto.PendingItemsCount.Value;
        if (dto.CompletedItemsCount.HasValue) item.CompletedItemsCount = dto.CompletedItemsCount.Value;
        if (dto.InProgressItemsCount.HasValue) item.InProgressItemsCount = dto.InProgressItemsCount.Value;
        if (dto.NotStartedItemsCount.HasValue) item.NotStartedItemsCount = dto.NotStartedItemsCount.Value;
        if (dto.TotalItemsCount.HasValue) item.TotalItemsCount = dto.TotalItemsCount.Value;

        item.UpdatedDate = DateTime.UtcNow;

        // Bug 6: Synchronize Patient.Status in database
        var patient = await FindLinkedPatientAsync(item.PatientId ?? dto.PatientId, item.PatientIdCode ?? dto.PatientIdCode, item.PatientName ?? dto.PatientName);
        if (patient != null)
        {
            if (isDischarged || item.ChecklistStatus == DischargeStatus.Discharged)
            {
                patient.Status = PatientStatus.Discharged;
                patient.DischargePlan = "Discharged";
                patient.UpdatedDate = DateTime.UtcNow;
                item.PatientId = patient.Id;
                item.PatientIdCode = patient.PatientIdCode;
            }
            else if (item.ChecklistStatus == DischargeStatus.InProgress || item.ChecklistStatus == DischargeStatus.PendingItems || item.ChecklistStatus == DischargeStatus.Ready)
            {
                if (patient.Status == PatientStatus.Discharged)
                {
                    patient.Status = PatientStatus.InCare;
                    patient.DischargePlan = "In Care";
                    patient.UpdatedDate = DateTime.UtcNow;
                }
            }
        }

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



