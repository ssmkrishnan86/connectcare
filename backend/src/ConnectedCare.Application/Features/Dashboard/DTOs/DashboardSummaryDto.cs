using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class DashboardSummaryDto
{
    public string TotalPatients { get; set; } = string.Empty;
    public string? PatientsChange { get; set; }

    public string ActiveAlerts { get; set; } = string.Empty;
    public string? ActiveAlertsChange { get; set; }

    public string CriticalAlerts { get; set; } = string.Empty;
    public string? CriticalAlertsChange { get; set; }

    public string CareTeams { get; set; } = string.Empty;
    public string? CareTeamsChange { get; set; }

    public string OpenTasks { get; set; } = string.Empty;
    public string? OpenTasksChange { get; set; }

    public string PendingReviews { get; set; } = string.Empty;
    public string? PendingReviewsChange { get; set; }
}
