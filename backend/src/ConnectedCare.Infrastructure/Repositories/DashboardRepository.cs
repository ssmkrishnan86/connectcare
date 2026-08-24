using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly ConnectedCareDbContext _context;

    public DashboardRepository(ConnectedCareDbContext context)
    {
        _context = context;
    }

    public async Task<int> GetTotalPatientsCountAsync()
    {
        return await _context.Patients.CountAsync();
    }

    public async Task<int> GetPatientStatusCountAsync(PatientStatus status)
    {
        return await _context.Patients
            .CountAsync(p => p.Status == status);
    }

    public async Task<int> GetActiveAlertsCountAsync()
    {
        return await _context.Alerts
            .CountAsync(a => !a.IsAcknowledged);
    }

    public async Task<int> GetCriticalAlertsCountAsync()
    {
        return await GetAlertsBySeverityCountAsync(AlertSeverity.Critical);
    }

    public async Task<int> GetAlertsBySeverityCountAsync(AlertSeverity severity)
    {
        return await _context.Alerts
            .CountAsync(a =>
                a.Severity == severity &&
                !a.IsAcknowledged);
    }

    public async Task<int> GetActiveCareTeamsCountAsync()
    {
        return await _context.CareTeamMembers.CountAsync();
    }

    public async Task<int> GetOpenTasksCountAsync()
    {
        return await _context.Tasks
            .CountAsync(t => t.Status != TaskStatusItem.Completed);
    }

    public async Task<int> GetCompletedTasksCountAsync()
    {
        return await _context.Tasks
            .CountAsync(t => t.Status == TaskStatusItem.Completed);
    }

    public async Task<int> GetPendingReviewsCountAsync()
    {
        return await _context.Tasks
            .CountAsync(t => t.Status != TaskStatusItem.Completed);
    }

    public async Task<int> GetVitalRoundsCountAsync(VitalRoundStatus status)
    {
        return await _context.VitalRounds
            .CountAsync(v => v.Status == status);
    }

    public async Task<int> GetVitalRoundsCountAsync(VitalRoundStatus status, PatientType patientType)
    {
        return await _context.VitalRounds
            .CountAsync(v =>
                v.Status == status &&
                v.PatientType == patientType);
    }

    public async Task<int> GetMedicationAdministrationsCountAsync(string? status = null)
    {
        var query = _context.MedicationAdministrations
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        return await query.CountAsync();
    }

    public async Task<List<Alert>> GetRecentAlertsAsync()
    {
        return await _context.Alerts
            .OrderByDescending(a => a.CreatedDate)
            .Take(5)
            .ToListAsync();
    }

    public async Task<List<SystemIntegration>> GetSystemIntegrationsAsync()
    {
        return await _context.SystemIntegrations
            .ToListAsync();
    }
}
