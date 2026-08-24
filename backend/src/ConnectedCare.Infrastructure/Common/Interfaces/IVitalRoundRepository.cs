using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface IVitalRoundRepository : IRepository<VitalRoundRecord>
{
    Task<List<VitalRoundRecord>> GetVitalRoundsAsync(
        string? statusFilter,
        string? search);
}
