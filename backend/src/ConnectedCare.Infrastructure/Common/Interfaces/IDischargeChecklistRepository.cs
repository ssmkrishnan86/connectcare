using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface IDischargeChecklistRepository : IRepository<DischargeChecklistRecord>
{
    Task<List<DischargeChecklistRecord>> GetChecklistsAsync(
        string? statusFilter,
        string? unitFilter,
        string? search,
        Guid? doctorId = null,
        Guid? nurseId = null);
}
