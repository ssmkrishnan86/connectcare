using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Services;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.Dashboard.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _dashboardService.GetSummaryAsync();
        return Ok(ApiResponse<DashboardSummaryDto>.Ok(summary));
    }

    [HttpGet("alerts-summary")]
    public async Task<IActionResult> GetAlertsSummary()
    {
        var summary = await _dashboardService.GetAlertSummaryAsync();
        return Ok(ApiResponse<AlertSummaryDto>.Ok(summary));
    }

    [HttpGet("patient-status")]
    public async Task<IActionResult> GetPatientStatus()
    {
        var status = await _dashboardService.GetPatientStatusAsync();
        return Ok(ApiResponse<PatientStatusDto>.Ok(status));
    }

    [HttpGet("recent-alerts")]
    public async Task<IActionResult> GetRecentAlerts()
    {
        var alerts = await _dashboardService.GetRecentAlertsAsync();
        return Ok(ApiResponse<List<RecentAlertItemDto>>.Ok(alerts));
    }

    [HttpGet("integrations")]
    public async Task<IActionResult> GetIntegrations()
    {
        var integrations = await _dashboardService.GetIntegrationsAsync();
        return Ok(ApiResponse<List<IntegrationItemDto>>.Ok(integrations));
    }

    [HttpGet("nurse-overview")]
    public async Task<IActionResult> GetNurseOverview()
    {
        var overview = await _dashboardService.GetNurseDashboardAsync();
        return Ok(ApiResponse<NurseDashboardDto>.Ok(overview));
    }
}
