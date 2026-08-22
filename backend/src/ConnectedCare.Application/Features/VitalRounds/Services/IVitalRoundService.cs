using ConnectedCare.Application.Features.VitalRounds.DTOs;

namespace ConnectedCare.Application.Features.VitalRounds.Services;

public interface IVitalRoundService
{
    Task<List<VitalRoundDto>> GetVitalRoundsAsync(
        string? statusFilter,
        string? search);

    Task<VitalRoundSummaryDto> GetSummaryAsync();

    Task<VitalRoundDto> CreateVitalRoundAsync(
        CreateVitalRoundDto dto);

    Task<VitalRoundDto> RecordVitalsAsync(
        Guid id,
        RecordVitalsDto dto);
}
