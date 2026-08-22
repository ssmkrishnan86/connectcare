using ConnectedCare.Application.Features.DischargeChecklists.DTOs;

namespace ConnectedCare.Application.Features.DischargeChecklists.Services;

public interface IDischargeChecklistService
{
    Task<List<DischargeChecklistDto>> GetChecklistsAsync(
        string? statusFilter,
        string? unitFilter,
        string? search);

    Task<DischargeChecklistSummaryDto> GetSummaryAsync();

    Task<DischargeChecklistDto> CreateChecklistAsync(
        CreateDischargeChecklistDto dto);
}
