using ConnectedCare.Application.Features.Dashboard.DTOs;

namespace ConnectedCare.Application.Features.Dashboard.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
    Task<AlertSummaryDto> GetAlertSummaryAsync();
    Task<PatientStatusDto> GetPatientStatusAsync();
    Task<List<RecentAlertItemDto>> GetRecentAlertsAsync();
    Task<List<IntegrationItemDto>> GetIntegrationsAsync();
    Task<NurseDashboardDto> GetNurseDashboardAsync();
}
