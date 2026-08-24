using ConnectedCare.Domain.Entities;
using ConnectedCare.Infrastructure.Common.DTOs;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface IPatientRepository : IRepository<Patient>
{
    Task<List<Patient>> SearchPatientsAsync(
        string? search,
        string? status,
        string? careUnit,
        Guid? doctorId = null,
        Guid? nurseId = null);

    Task<Patient?> GetByIdCodeOrGuidAsync(string id);
    Task<DependencyCheckResult> CheckPatientDependenciesAsync(Guid patientId);
    Task<PatientStatsDto> GetPatientStatsAsync(
        Guid? doctorId = null,
        Guid? nurseId = null);
}



