using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Application.Features.Dashboard.DTOs;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Application.Features.Dashboard.Services;
public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repository;

    public DashboardService(IDashboardRepository repository)
    {
        _repository = repository;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var total = await _repository.GetTotalPatientsCountAsync();
        var activeAlerts = await _repository.GetActiveAlertsCountAsync();
        var critical = await _repository.GetCriticalAlertsCountAsync();
        var teams = await _repository.GetActiveCareTeamsCountAsync();
        var openTasks = await _repository.GetOpenTasksCountAsync();
        var pendingReviews = await _repository.GetPendingReviewsCountAsync();

        return new DashboardSummaryDto
        {
            TotalPatients = total.ToString("N0"),
            PatientsChange = null,

            ActiveAlerts = activeAlerts.ToString(),
            ActiveAlertsChange = null,

            CriticalAlerts = critical.ToString(),
            CriticalAlertsChange = null,

            CareTeams = teams.ToString(),
            CareTeamsChange = null,

            OpenTasks = openTasks.ToString(),
            OpenTasksChange = null,

            PendingReviews = pendingReviews.ToString(),
            PendingReviewsChange = null
        };
    }

    public async Task<AlertSummaryDto> GetAlertSummaryAsync()
    {
        var activeAlerts = await _repository.GetActiveAlertsCountAsync();
        var critical = await _repository.GetCriticalAlertsCountAsync();
        var high = await _repository.GetAlertsBySeverityCountAsync(AlertSeverity.High);
        var medium = await _repository.GetAlertsBySeverityCountAsync(AlertSeverity.Medium);
        var low = await _repository.GetAlertsBySeverityCountAsync(AlertSeverity.Low);

        return new AlertSummaryDto
        {
            TotalAlerts = activeAlerts,
            Critical = critical,
            High = high,
            Medium = medium,
            Low = low
        };
    }

    public async Task<PatientStatusDto> GetPatientStatusAsync()
    {
        var total = await _repository.GetTotalPatientsCountAsync();
        var inCare = await _repository.GetPatientStatusCountAsync(PatientStatus.InCare);
        var admitted = await _repository.GetPatientStatusCountAsync(PatientStatus.Admitted);
        var discharged = await _repository.GetPatientStatusCountAsync(PatientStatus.Discharged);
        var inactive = await _repository.GetPatientStatusCountAsync(PatientStatus.Inactive);

        return new PatientStatusDto
        {
            TotalPatients = total,
            InCare = inCare,
            Admitted = admitted,
            Discharged = discharged,
            Inactive = inactive
        };
    }

    public async Task<List<RecentAlertItemDto>> GetRecentAlertsAsync()
    {
        var alerts = await _repository.GetRecentAlertsAsync();
        return alerts.Select(a => new RecentAlertItemDto
        {
            Severity = a.Severity.ToString(),
            PatientName = a.PatientName,
            Location = a.RoomLocation,
            Time = a.TimestampText
        }).ToList();
    }

    public async Task<List<IntegrationItemDto>> GetIntegrationsAsync()
    {
        var integrations = await _repository.GetSystemIntegrationsAsync();
        return integrations.Select(i => new IntegrationItemDto
        {
            Name = i.Name,
            Status = i.Status
        }).ToList();
    }

    public async Task<NurseDashboardDto> GetNurseDashboardAsync()
    {
        var totalPatients =
            await _repository.GetTotalPatientsCountAsync();

        var activeAlerts =
            await _repository.GetActiveAlertsCountAsync();

        var criticalAlerts =
            await _repository.GetCriticalAlertsCountAsync();

        var highAlerts =
            await _repository.GetAlertsBySeverityCountAsync(
                AlertSeverity.High);

        var openTasks =
            await _repository.GetOpenTasksCountAsync();

        var completedTasks =
            await _repository.GetCompletedTasksCountAsync();

        var inpatientRounds =
            await _repository.GetVitalRoundsCountAsync(
                VitalRoundStatus.Pending,
                PatientType.Inpatient);

        var outpatientRounds =
            await _repository.GetVitalRoundsCountAsync(
                VitalRoundStatus.Pending,
                PatientType.Outpatient);

        var completedRounds =
            await _repository.GetVitalRoundsCountAsync(
                VitalRoundStatus.Completed);

        var pendingRounds =
            await _repository.GetVitalRoundsCountAsync(
                VitalRoundStatus.Pending);

        var overdueRounds =
            await _repository.GetVitalRoundsCountAsync(
                VitalRoundStatus.Overdue);

        var recentAlerts =
            await _repository.GetRecentAlertsAsync();

        return new NurseDashboardDto
        {
            TotalPatients = totalPatients,

            InpatientsCount = inpatientRounds,
            OutpatientsCount = outpatientRounds,

            TasksTotal = openTasks + completedTasks,
            TasksPending = openTasks,
            TasksCompleted = completedTasks,

            // Medication scheduling is not currently represented
            // with a reliable DateTime in the domain model.
            MedicationsDueTotal = 0,
            MedicationsOverdue = 0,
            MedicationsUpcoming = 0,

            AlertsTotal = activeAlerts,
            AlertsCritical = criticalAlerts,
            AlertsHigh = highAlerts,

            RoundsCompleted = completedRounds,
            RoundsTotal = completedRounds + pendingRounds + overdueRounds,

            // The current domain model does not expose reliable
            // "today" admission/discharge/transfer timestamps.
            AdmissionsToday = 0,
            DischargesToday = 0,
            TransfersToday = 0,

            // These categories require a real clinical/unit
            // classification source and are therefore not fabricated.
            CareTypes = new List<NurseCategoryStatDto>(),

            Priorities = new List<NurseCategoryStatDto>(),

            // MedicationReminder currently stores schedule information
            // as text rather than a DateTime, so we do not fabricate
            // upcoming medication records.
            UpcomingMedications = new List<NurseUpcomingMedicationDto>(),

            // Nurse-specific task projection will be connected to the
            // TaskItem repository/query in the next step.
            MyTasks = new List<NurseTaskItemDto>(),

            LatestAlerts = recentAlerts.Select(a => new NurseAlertDto
            {
                Severity = a.Severity.ToString(),
                Title = a.Title,
                PatientLocation =
                    $"{a.PatientName} • {a.RoomLocation}",
                TimeText = a.TimestampText,
                ColorClass =
                    a.Severity == AlertSeverity.Critical
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
            }).ToList()
        };
    }
}

// --- Discharge Checklist Service ---

