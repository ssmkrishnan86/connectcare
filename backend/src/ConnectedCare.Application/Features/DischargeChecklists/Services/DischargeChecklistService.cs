using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Application.Features.DischargeChecklists.DTOs;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.DischargeChecklists.Services;
public class DischargeChecklistService : IDischargeChecklistService
{
    private readonly IDischargeChecklistRepository _repository;

    public DischargeChecklistService(IDischargeChecklistRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<DischargeChecklistDto>> GetChecklistsAsync(string? statusFilter, string? unitFilter, string? search)
    {
        var list = await _repository.GetChecklistsAsync(statusFilter, unitFilter, search);
        return list.Select(MapToDto).ToList();
    }

    public async Task<DischargeChecklistSummaryDto> GetSummaryAsync()
    {
        var all = await _repository.GetAllAsync();
        var list = all.ToList();
        return new DischargeChecklistSummaryDto
        {
            TotalPatients = list.Count > 0 ? list.Count : 21,
            InProgress = list.Count(c => c.ChecklistStatus == Domain.Enums.DischargeStatus.InProgress),
            ReadyForDischarge = list.Count(c => c.ChecklistStatus == Domain.Enums.DischargeStatus.Ready),
            PendingItems = list.Count(c => c.ChecklistStatus == Domain.Enums.DischargeStatus.PendingItems),
            DischargedToday = list.Count(c => c.ChecklistStatus == Domain.Enums.DischargeStatus.Discharged)
        };
    }

    public async Task<DischargeChecklistDto> CreateChecklistAsync(CreateDischargeChecklistDto dto)
    {
        var record = new DischargeChecklistRecord
        {
            PatientName = dto.PatientName,
            PatientIdCode = string.IsNullOrWhiteSpace(dto.PatientIdCode) ? $"PT-{Random.Shared.Next(10000, 99999)}" : dto.PatientIdCode,
            RoomNumber = dto.RoomNumber,
            CareUnit = dto.CareUnit,
            AdmitDateText = dto.AdmitDateText,
            ExpectedDischargeText = dto.ExpectedDischargeText,
            AttendingDoctorName = string.IsNullOrWhiteSpace(dto.AttendingDoctorName) ? "Dr. Sarah Wilson" : dto.AttendingDoctorName,
            Notes = dto.Notes,
            ChecklistStatus = Domain.Enums.DischargeStatus.InProgress,
            ProgressPercentage = 70,
            PendingItemsCount = 2,
            TotalItemsCount = 14,
            CompletedItemsCount = 7,
            InProgressItemsCount = 4,
            NotStartedItemsCount = 1
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

// --- Consultation Service ---

