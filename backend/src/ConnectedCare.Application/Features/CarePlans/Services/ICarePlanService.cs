using ConnectedCare.Application.Features.CarePlans.DTOs;

namespace ConnectedCare.Application.Features.CarePlans.Services;

public interface ICarePlanService
{
    Task<List<CarePlanDto>> GetCarePlansAsync(
        string? tabFilter,
        string? statusFilter,
        string? unitFilter,
        string? patientFilter,
        string? conditionFilter,
        string? search,
        string? doctorName);

    Task<CarePlanSummaryDto> GetSummaryAsync();

    Task<CarePlanDto?> GetByIdAsync(Guid id);

    Task<CarePlanDto> CreateCarePlanAsync(
        CreateCarePlanDto dto);

    Task<CarePlanDto?> UpdateCarePlanAsync(
        Guid id,
        UpdateCarePlanDto dto);

    Task<bool> DeleteCarePlanAsync(Guid id);

    Task<CarePlanDto?> AddNoteAsync(
        Guid id,
        AddCarePlanNoteDto dto);

    Task<CarePlanDto?> ReviewCarePlanAsync(
        Guid id,
        ReviewCarePlanDto dto);
}
