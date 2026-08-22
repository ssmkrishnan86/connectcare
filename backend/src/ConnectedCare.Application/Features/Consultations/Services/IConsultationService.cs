using ConnectedCare.Application.Features.Consultations.DTOs;

namespace ConnectedCare.Application.Features.Consultations.Services;

public interface IConsultationService
{
    Task<List<ConsultationDto>> GetConsultationsAsync(
        string? tabFilter,
        string? statusFilter,
        string? typeFilter,
        string? patientFilter,
        string? unitFilter,
        string? search,
        string? doctorName);

    Task<ConsultationDto?> GetByIdAsync(Guid id);

    Task<ConsultationSummaryDto> GetSummaryAsync();

    Task<ConsultationDto> CreateConsultationAsync(
        CreateConsultationDto dto);

    Task<ConsultationDto?> UpdateConsultationAsync(
        Guid id,
        UpdateConsultationDto dto);

    Task<bool> DeleteConsultationAsync(Guid id);

    Task<ConsultationDto?> ToggleLikeAsync(Guid id);

    Task<ConsultationDto?> ScheduleFollowUpAsync(
        Guid id,
        ScheduleFollowUpDto dto);

    Task<ConsultationDto?> AddConsultationNoteAsync(
        Guid id,
        AddConsultationNoteDto dto);

    Task<ConsultationDto?> ReferSpecialistAsync(
        Guid id,
        ReferSpecialistDto dto);

    Task<List<ConsultationDto>> GetRecentConsultationsByPatientAsync(
        string patientIdCode);
}
