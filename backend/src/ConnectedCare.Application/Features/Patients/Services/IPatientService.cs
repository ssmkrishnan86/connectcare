using ConnectedCare.Application.Features.Dashboard.DTOs;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.Patients.Services;

public interface IPatientService
{
    Task<List<Patient>> GetPatientsAsync(
        string? search,
        string? status,
        string? careUnit,
        Guid? doctorId = null,
        Guid? nurseId = null);

    Task<Patient?> GetPatientByIdAsync(string id);

    Task<Patient> CreatePatientAsync(Patient patient);

    Task<Patient?> UpdatePatientAsync(
        string id,
        Patient patient);

    Task<bool> DeletePatientAsync(string id);

    Task<PatientStatsDto> GetPatientStatsAsync(
        Guid? doctorId = null,
        Guid? nurseId = null);
}
