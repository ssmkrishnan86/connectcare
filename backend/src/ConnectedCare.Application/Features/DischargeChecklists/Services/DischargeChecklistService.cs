using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Application.Features.DischargeChecklists.DTOs;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Application.Features.DischargeChecklists.Services;

public class DischargeChecklistService : IDischargeChecklistService
{
    private readonly IDischargeChecklistRepository _repository;

    public DischargeChecklistService(IDischargeChecklistRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<DischargeChecklistDto>> GetChecklistsAsync(string? statusFilter, string? unitFilter, string? search, Guid? doctorId = null, Guid? nurseId = null)
    {
        var list = await _repository.GetChecklistsAsync(statusFilter, unitFilter, search, doctorId, nurseId);
        return list.Select(MapToDto).ToList();
    }

    public async Task<DischargeChecklistSummaryDto> GetSummaryAsync(Guid? doctorId = null, Guid? nurseId = null)
    {
        var list = await _repository.GetChecklistsAsync(null, null, null, doctorId, nurseId);
        return new DischargeChecklistSummaryDto
        {
            TotalPatients = list.Count,
            InProgress = list.Count(c => c.ChecklistStatus == DischargeStatus.InProgress),
            ReadyForDischarge = list.Count(c => c.ChecklistStatus == DischargeStatus.Ready),
            PendingItems = list.Count(c => c.ChecklistStatus == DischargeStatus.PendingItems),
            DischargedToday = list.Count(c => c.ChecklistStatus == DischargeStatus.Discharged)
        };
    }

    public async Task<DischargeChecklistDto> CreateChecklistAsync(CreateDischargeChecklistDto dto)
    {
        var progress = dto.ProgressPercentage ?? 0;
        var completed = dto.CompletedItemsCount ?? (int)Math.Round((progress / 100.0) * 14);
        var pending = dto.PendingItemsCount ?? Math.Max(0, 14 - completed);
        var inProgress = dto.InProgressItemsCount ?? 0;
        var notStarted = dto.NotStartedItemsCount ?? Math.Max(0, 14 - completed - inProgress);

        DischargeStatus status = DischargeStatus.PendingItems;
        if (!string.IsNullOrWhiteSpace(dto.ChecklistStatus))
        {
            if (Enum.TryParse<DischargeStatus>(dto.ChecklistStatus, true, out var parsedStatus))
                status = parsedStatus;
            else if (dto.ChecklistStatus.Equals("Ready", StringComparison.OrdinalIgnoreCase) || dto.ChecklistStatus.Equals("Ready for Discharge", StringComparison.OrdinalIgnoreCase))
                status = DischargeStatus.Ready;
            else if (dto.ChecklistStatus.Equals("Discharged", StringComparison.OrdinalIgnoreCase))
                status = DischargeStatus.Discharged;
            else if (dto.ChecklistStatus.Equals("InProgress", StringComparison.OrdinalIgnoreCase) || dto.ChecklistStatus.Equals("In Progress", StringComparison.OrdinalIgnoreCase))
                status = DischargeStatus.InProgress;
        }
        else
        {
            status = progress == 100 ? DischargeStatus.Ready : (progress > 0 ? DischargeStatus.InProgress : DischargeStatus.PendingItems);
        }

        var existingList = await _repository.GetChecklistsAsync(null, null, dto.PatientName);
        var existing = existingList.FirstOrDefault(x =>
            (dto.PatientId.HasValue && dto.PatientId.Value != Guid.Empty && x.PatientId == dto.PatientId.Value) ||
            (!string.IsNullOrWhiteSpace(dto.PatientName) && x.PatientName.Trim().Equals(dto.PatientName.Trim(), StringComparison.OrdinalIgnoreCase)));

        if (existing != null)
        {
            if (!string.IsNullOrWhiteSpace(dto.RoomNumber)) existing.RoomNumber = dto.RoomNumber;
            if (!string.IsNullOrWhiteSpace(dto.CareUnit)) existing.CareUnit = dto.CareUnit;
            if (!string.IsNullOrWhiteSpace(dto.AttendingDoctorName)) existing.AttendingDoctorName = dto.AttendingDoctorName;
            if (!string.IsNullOrWhiteSpace(dto.ExpectedDischargeText)) existing.ExpectedDischargeText = dto.ExpectedDischargeText;
            if (!string.IsNullOrWhiteSpace(dto.Notes)) existing.Notes = dto.Notes;
            existing.ChecklistStatus = status;
            existing.ProgressPercentage = progress;
            existing.CompletedItemsCount = completed;
            existing.PendingItemsCount = pending;
            existing.InProgressItemsCount = inProgress;
            existing.NotStartedItemsCount = notStarted;
            existing.UpdatedDate = DateTime.UtcNow;
            await _repository.UpdateAsync(existing);
            return MapToDto(existing);
        }

        var record = new DischargeChecklistRecord
        {
            PatientId = dto.PatientId,
            PatientName = dto.PatientName,
            PatientIdCode = string.IsNullOrWhiteSpace(dto.PatientIdCode) ? $"PT-{Random.Shared.Next(10000, 99999)}" : dto.PatientIdCode,
            RoomNumber = dto.RoomNumber,
            CareUnit = dto.CareUnit,
            AdmitDateText = dto.AdmitDateText,
            ExpectedDischargeText = dto.ExpectedDischargeText,
            AttendingDoctorName = string.IsNullOrWhiteSpace(dto.AttendingDoctorName) ? "Dr. Sarah Wilson" : dto.AttendingDoctorName,
            Notes = dto.Notes,
            ChecklistStatus = status,
            ProgressPercentage = progress,
            PendingItemsCount = pending,
            TotalItemsCount = 14,
            CompletedItemsCount = completed,
            InProgressItemsCount = inProgress,
            NotStartedItemsCount = notStarted
        };

        var created = await _repository.AddAsync(record);
        return MapToDto(created);
    }

    private static DischargeChecklistDto MapToDto(DischargeChecklistRecord c) => new DischargeChecklistDto
    {
        Id = c.Id,
        PatientId = c.PatientId,
        PatientName = c.PatientName,
        PatientIdCode = c.PatientIdCode,
        PatientAvatar = c.PatientAvatar,
        AgeGender = c.AgeGender,
        BloodGroup = c.BloodGroup,
        RoomNumber = c.RoomNumber,
        CareUnit = c.CareUnit,
        AdmitDateText = c.AdmitDateText,
        AdmitDaysText = c.AdmitDaysText,
        ChecklistStatus = c.ChecklistStatus.ToString(),
        ProgressPercentage = c.ProgressPercentage,
        PendingItemsCount = c.PendingItemsCount,
        TotalItemsCount = c.TotalItemsCount,
        CompletedItemsCount = c.CompletedItemsCount,
        InProgressItemsCount = c.InProgressItemsCount,
        NotStartedItemsCount = c.NotStartedItemsCount,
        ExpectedDischargeText = c.ExpectedDischargeText,
        ExpectedDischargeRelative = c.ExpectedDischargeRelative,
        AttendingDoctorName = c.AttendingDoctorName,
        CareTeamMembersCount = c.CareTeamMembersCount,
        Notes = c.Notes
    };
}
