using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface IDashboardRepository
{
    Task<int> GetTotalPatientsCountAsync();

    Task<int> GetPatientStatusCountAsync(PatientStatus status);

    Task<int> GetActiveAlertsCountAsync();
    Task<int> GetAlertsBySeverityCountAsync(AlertSeverity severity);
    Task<int> GetCriticalAlertsCountAsync();

    Task<int> GetActiveCareTeamsCountAsync();

    Task<int> GetOpenTasksCountAsync();
    Task<int> GetCompletedTasksCountAsync();
    Task<int> GetPendingReviewsCountAsync();

    Task<int> GetVitalRoundsCountAsync(VitalRoundStatus status);
    Task<int> GetVitalRoundsCountAsync(
        VitalRoundStatus status,
        PatientType patientType);

    Task<int> GetMedicationAdministrationsCountAsync(string? status = null);

    Task<List<Alert>> GetRecentAlertsAsync();
    Task<List<SystemIntegration>> GetSystemIntegrationsAsync();
}
