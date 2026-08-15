using ConnectedCare.Application.Common.Interfaces;
using ConnectedCare.Application.Features.Dashboard.DTOs;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Services;

public interface IPatientService
{
    Task<List<Patient>> GetPatientsAsync(string? search, string? status, string? careUnit);
    Task<Patient?> GetPatientByIdAsync(string id);
    Task<Patient> CreatePatientAsync(Patient patient);
}

public class PatientService : IPatientService
{
    private readonly IPatientRepository _repository;

    public PatientService(IPatientRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Patient>> GetPatientsAsync(string? search, string? status, string? careUnit)
    {
        return await _repository.SearchPatientsAsync(search, status, careUnit);
    }

    public async Task<Patient?> GetPatientByIdAsync(string id)
    {
        return await _repository.GetByIdCodeOrGuidAsync(id);
    }

    public async Task<Patient> CreatePatientAsync(Patient patient)
    {
        if (string.IsNullOrWhiteSpace(patient.PatientIdCode))
        {
            patient.PatientIdCode = $"P-00{Random.Shared.Next(100, 999)}";
        }
        if (string.IsNullOrWhiteSpace(patient.Mrn))
        {
            patient.Mrn = $"MRN-00{Random.Shared.Next(1000, 9999)}";
        }
        return await _repository.AddAsync(patient);
    }
}

public interface IDoctorService
{
    Task<List<Doctor>> GetDoctorsAsync(string? search, string? specialty);
}

public class DoctorService : IDoctorService
{
    private readonly IDoctorRepository _repository;

    public DoctorService(IDoctorRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Doctor>> GetDoctorsAsync(string? search, string? specialty)
    {
        return await _repository.SearchDoctorsAsync(search, specialty);
    }
}

public interface ICareTeamService
{
    Task<List<CareTeamMember>> GetCareTeamMembersAsync();
}

public class CareTeamService : ICareTeamService
{
    private readonly ICareTeamRepository _repository;

    public CareTeamService(ICareTeamRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CareTeamMember>> GetCareTeamMembersAsync()
    {
        return await _repository.GetCareTeamMembersAsync();
    }
}

public interface IAlertService
{
    Task<List<Alert>> GetAlertsAsync();
    Task<bool> AcknowledgeAlertAsync(Guid id);
}

public class AlertService : IAlertService
{
    private readonly IAlertRepository _repository;

    public AlertService(IAlertRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Alert>> GetAlertsAsync()
    {
        return await _repository.GetAlertsAsync();
    }

    public async Task<bool> AcknowledgeAlertAsync(Guid id)
    {
        return await _repository.AcknowledgeAlertAsync(id);
    }
}

public interface ITaskService
{
    Task<List<TaskItem>> GetTasksAsync();
    Task<TaskItem> CreateTaskAsync(TaskItem task);
}

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;

    public TaskService(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TaskItem>> GetTasksAsync()
    {
        return await _repository.GetTasksAsync();
    }

    public async Task<TaskItem> CreateTaskAsync(TaskItem task)
    {
        if (string.IsNullOrWhiteSpace(task.TaskIdCode))
        {
            task.TaskIdCode = $"TSK-0{Random.Shared.Next(10, 99)}";
        }
        return await _repository.AddAsync(task);
    }
}

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
    Task<AlertSummaryDto> GetAlertSummaryAsync();
    Task<PatientStatusDto> GetPatientStatusAsync();
    Task<List<RecentAlertItemDto>> GetRecentAlertsAsync();
    Task<List<IntegrationItemDto>> GetIntegrationsAsync();
}

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

        return new DashboardSummaryDto
        {
            TotalPatients = total.ToString("N0"),
            PatientsChange = "12.5% vs last month",
            ActiveAlerts = activeAlerts.ToString(),
            ActiveAlertsChange = "20% vs yesterday",
            CriticalAlerts = critical.ToString(),
            CriticalAlertsChange = "50% vs yesterday",
            CareTeams = teams.ToString(),
            CareTeamsChange = "Active",
            OpenTasks = openTasks.ToString(),
            OpenTasksChange = "8% vs yesterday",
            PendingReviews = "24",
            PendingReviewsChange = "15% vs yesterday"
        };
    }

    public async Task<AlertSummaryDto> GetAlertSummaryAsync()
    {
        var activeAlerts = await _repository.GetActiveAlertsCountAsync();
        var critical = await _repository.GetCriticalAlertsCountAsync();

        return new AlertSummaryDto
        {
            TotalAlerts = activeAlerts,
            Critical = critical,
            High = 4,
            Medium = 3,
            Low = 2
        };
    }

    public async Task<PatientStatusDto> GetPatientStatusAsync()
    {
        var total = await _repository.GetTotalPatientsCountAsync();
        return new PatientStatusDto
        {
            TotalPatients = total,
            InCare = (int)(total * 0.8),
            Admitted = (int)(total * 0.14),
            Discharged = (int)(total * 0.05),
            Inactive = (int)(total * 0.01)
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
}
