using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface IConsultationRepository : IRepository<ConsultationRecord>
{
    Task<List<ConsultationRecord>> GetConsultationsAsync(
        string? tabFilter,
        string? statusFilter,
        string? typeFilter,
        string? patientFilter,
        string? unitFilter,
        string? search,
        string? doctorName);
}
