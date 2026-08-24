using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface ICarePlanRepository : IRepository<CarePlanRecord>
{
    Task<List<CarePlanRecord>> GetCarePlansAsync(
        string? tabFilter,
        string? statusFilter,
        string? unitFilter,
        string? patientFilter,
        string? conditionFilter,
        string? search,
        string? doctorName);
}
