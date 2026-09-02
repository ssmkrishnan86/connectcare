using ConnectedCare.Application.Features.DischargeChecklists.DTOs;

namespace ConnectedCare.Application.Features.DischargeChecklists.Services;

public interface IDischargeChecklistService
{
    Task<List<DischargeChecklistDto>> GetChecklistsAsync(
        string? statusFilter,
        string? unitFilter,
        string? search,
        Guid? doctorId = null,
        Guid? nurseId = null);

    Task<DischargeChecklistSummaryDto> GetSummaryAsync(
        Guid? doctorId = null,
        Guid? nurseId = null);

    Task<DischargeChecklistDto> CreateChecklistAsync(
        CreateDischargeChecklistDto dto);
}
