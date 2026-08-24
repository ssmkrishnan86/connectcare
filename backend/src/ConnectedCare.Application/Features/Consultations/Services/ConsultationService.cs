using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Application.Features.Consultations.DTOs;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.Consultations.Services;
public class ConsultationService : IConsultationService
{
    private readonly IConsultationRepository _repository;

    public ConsultationService(IConsultationRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ConsultationDto>> GetConsultationsAsync(
        string? tabFilter,
        string? statusFilter,
        string? typeFilter,
        string? patientFilter,
        string? unitFilter,
        string? search,
        string? doctorName)
    {
        var list = await _repository.GetConsultationsAsync(tabFilter, statusFilter, typeFilter, patientFilter, unitFilter, search, doctorName);
        return list.Select(MapToDto).ToList();
    }

    public async Task<ConsultationDto?> GetByIdAsync(Guid id)
    {
        var record = await _repository.GetByIdAsync(id);
        return record != null ? MapToDto(record) : null;
    }

    public async Task<ConsultationSummaryDto> GetSummaryAsync()
    {
        var all = await _repository.GetAllAsync();
        var list = all.ToList();
        return new ConsultationSummaryDto
        {
            TotalConsultations = list.Count,
            Completed = list.Count(c => c.Status == Domain.Enums.ConsultationStatus.Completed),
            InProgress = list.Count(c => c.Status == Domain.Enums.ConsultationStatus.InProgress),
            Scheduled = list.Count(c => c.Status == Domain.Enums.ConsultationStatus.Scheduled),
            FollowUpDue = list.Count(c => c.Status == Domain.Enums.ConsultationStatus.FollowUpDue || (!string.IsNullOrEmpty(c.FollowUpDateText) && c.FollowUpDateText != "-"))
        };
    }

    public async Task<ConsultationDto> CreateConsultationAsync(CreateConsultationDto dto)
    {
        var parseStatus = Domain.Enums.ConsultationStatus.Scheduled;
        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            if (dto.Status.Equals("InProgress", StringComparison.OrdinalIgnoreCase) || dto.Status.Equals("In Progress", StringComparison.OrdinalIgnoreCase))
                parseStatus = Domain.Enums.ConsultationStatus.InProgress;
            else if (dto.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
                parseStatus = Domain.Enums.ConsultationStatus.Completed;
            else if (dto.Status.Equals("FollowUpDue", StringComparison.OrdinalIgnoreCase) || dto.Status.Equals("Follow-up Due", StringComparison.OrdinalIgnoreCase))
                parseStatus = Domain.Enums.ConsultationStatus.FollowUpDue;
        }

        var record = new ConsultationRecord
        {
            PatientName = dto.PatientName,
            PatientIdCode = string.IsNullOrWhiteSpace(dto.PatientIdCode) ? $"PT-{Random.Shared.Next(10000, 99999)}" : dto.PatientIdCode,
            RoomNumber = string.IsNullOrWhiteSpace(dto.RoomNumber) ? "302" : dto.RoomNumber,
            CareUnit = string.IsNullOrWhiteSpace(dto.CareUnit) ? "Cardiology Unit" : dto.CareUnit,
            AgeGender = string.IsNullOrWhiteSpace(dto.AgeGender) ? "65 Y â€¢ General" : dto.AgeGender,
            BloodGroup = string.IsNullOrWhiteSpace(dto.BloodGroup) ? "A+" : dto.BloodGroup,
            ConsultationType = dto.ConsultationType,
            ConsultationSubtitle = string.IsNullOrWhiteSpace(dto.ConsultationSubtitle) ? dto.ConsultationType : dto.ConsultationSubtitle,
            PhysicianName = dto.PhysicianName,
            PhysicianRole = string.IsNullOrWhiteSpace(dto.PhysicianRole) ? "Attending Physician" : dto.PhysicianRole,
            DateTimeText = string.IsNullOrWhiteSpace(dto.DateTimeText) ? DateTime.Now.ToString("MMM dd, yyyy hh:mm tt") : dto.DateTimeText,
            Location = string.IsNullOrWhiteSpace(dto.Location) ? "Consultation Room 1" : dto.Location,
            Reason = dto.Reason,
            Status = parseStatus,
            FollowUpDateText = dto.FollowUpDateText,
            ClinicalNotes = dto.ClinicalNotes,
            IsLiked = false
        };

        var created = await _repository.AddAsync(record);
        return MapToDto(created);
    }

    public async Task<ConsultationDto?> UpdateConsultationAsync(Guid id, UpdateConsultationDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        if (dto.PatientName != null) existing.PatientName = dto.PatientName;
        if (dto.PatientIdCode != null) existing.PatientIdCode = dto.PatientIdCode;
        if (dto.RoomNumber != null) existing.RoomNumber = dto.RoomNumber;
        if (dto.CareUnit != null) existing.CareUnit = dto.CareUnit;
        if (dto.AgeGender != null) existing.AgeGender = dto.AgeGender;
        if (dto.BloodGroup != null) existing.BloodGroup = dto.BloodGroup;
        if (dto.ConsultationType != null) existing.ConsultationType = dto.ConsultationType;
        if (dto.ConsultationSubtitle != null) existing.ConsultationSubtitle = dto.ConsultationSubtitle;
        if (dto.PhysicianName != null) existing.PhysicianName = dto.PhysicianName;
        if (dto.PhysicianRole != null) existing.PhysicianRole = dto.PhysicianRole;
        if (dto.DateTimeText != null) existing.DateTimeText = dto.DateTimeText;
        if (dto.Location != null) existing.Location = dto.Location;
        if (dto.Reason != null) existing.Reason = dto.Reason;
        if (dto.FollowUpDateText != null) existing.FollowUpDateText = dto.FollowUpDateText;
        if (dto.ClinicalNotes != null) existing.ClinicalNotes = dto.ClinicalNotes;
        if (dto.IsLiked.HasValue) existing.IsLiked = dto.IsLiked.Value;

        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            if (dto.Status.Equals("InProgress", StringComparison.OrdinalIgnoreCase) || dto.Status.Equals("In Progress", StringComparison.OrdinalIgnoreCase))
                existing.Status = Domain.Enums.ConsultationStatus.InProgress;
            else if (dto.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
                existing.Status = Domain.Enums.ConsultationStatus.Completed;
            else if (dto.Status.Equals("Scheduled", StringComparison.OrdinalIgnoreCase))
                existing.Status = Domain.Enums.ConsultationStatus.Scheduled;
            else if (dto.Status.Equals("FollowUpDue", StringComparison.OrdinalIgnoreCase) || dto.Status.Equals("Follow-up Due", StringComparison.OrdinalIgnoreCase))
                existing.Status = Domain.Enums.ConsultationStatus.FollowUpDue;
        }

        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    public async Task<bool> DeleteConsultationAsync(Guid id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<ConsultationDto?> ToggleLikeAsync(Guid id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;
        existing.IsLiked = !existing.IsLiked;
        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    public async Task<ConsultationDto?> ScheduleFollowUpAsync(Guid id, ScheduleFollowUpDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        existing.FollowUpDateText = dto.FollowUpDate;
        existing.Status = Domain.Enums.ConsultationStatus.FollowUpDue;
        if (!string.IsNullOrWhiteSpace(dto.PhysicianName)) existing.PhysicianName = dto.PhysicianName;
        if (!string.IsNullOrWhiteSpace(dto.Notes))
        {
            existing.ClinicalNotes = string.IsNullOrWhiteSpace(existing.ClinicalNotes)
                ? $"Follow-up note ({dto.FollowUpDate}): {dto.Notes}"
                : $"{existing.ClinicalNotes}\nFollow-up note ({dto.FollowUpDate}): {dto.Notes}";
        }

        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    public async Task<ConsultationDto?> AddConsultationNoteAsync(Guid id, AddConsultationNoteDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        if (!string.IsNullOrWhiteSpace(dto.Diagnosis))
        {
            existing.ConsultationSubtitle = dto.Diagnosis;
        }

        if (!string.IsNullOrWhiteSpace(dto.ClinicalNotes))
        {
            existing.ClinicalNotes = string.IsNullOrWhiteSpace(existing.ClinicalNotes)
                ? dto.ClinicalNotes
                : $"{existing.ClinicalNotes}\n[{DateTime.Now:MMM dd, yyyy HH:mm}]: {dto.ClinicalNotes}";
        }

        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    public async Task<ConsultationDto?> ReferSpecialistAsync(Guid id, ReferSpecialistDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        var refNote = $"Referral to {dto.SpecialistDepartment} ({dto.SpecialistName}) - Priority: {dto.Priority}. Reason: {dto.Reason}";
        existing.ClinicalNotes = string.IsNullOrWhiteSpace(existing.ClinicalNotes)
            ? refNote
            : $"{existing.ClinicalNotes}\n[{DateTime.Now:MMM dd, yyyy HH:mm}]: {refNote}";

        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    public async Task<List<ConsultationDto>> GetRecentConsultationsByPatientAsync(string patientIdCode)
    {
        var all = await _repository.GetAllAsync();
        var list = all.Where(c => c.PatientIdCode.Equals(patientIdCode, StringComparison.OrdinalIgnoreCase) || c.PatientName.Contains(patientIdCode, StringComparison.OrdinalIgnoreCase))
                      .OrderByDescending(c => c.CreatedDate)
                      .Take(5)
                      .Select(MapToDto)
                      .ToList();
        return list;
    }

    private static ConsultationDto MapToDto(ConsultationRecord c) => new ConsultationDto
    {
        Id = c.Id,
        PatientId = c.PatientId,
        PatientName = c.PatientName,
        PatientIdCode = c.PatientIdCode,
        PatientAvatar = c.PatientAvatar,
        RoomNumber = c.RoomNumber,
        CareUnit = c.CareUnit,
        AgeGender = c.AgeGender,
        BloodGroup = c.BloodGroup,
        ConsultationType = c.ConsultationType,
        ConsultationSubtitle = c.ConsultationSubtitle,
        ConsultationIcon = c.ConsultationIcon,
        PhysicianId = c.PhysicianId,
        PhysicianName = c.PhysicianName,
        PhysicianRole = c.PhysicianRole,
        PhysicianAvatar = c.PhysicianAvatar,
        DateTimeText = c.DateTimeText,
        Location = c.Location,
        Reason = c.Reason,
        Status = c.Status.ToString(),
        FollowUpDateText = c.FollowUpDateText,
        ClinicalNotes = c.ClinicalNotes,
        IsLiked = c.IsLiked
    };
}

// --- Care Plan Service ---

