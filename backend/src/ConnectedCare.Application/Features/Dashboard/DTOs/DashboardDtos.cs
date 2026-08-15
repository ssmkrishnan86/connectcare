namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class DashboardSummaryDto
{
    public string TotalPatients { get; set; } = "2,350";
    public string PatientsChange { get; set; } = "12.5% vs last month";
    
    public string ActiveAlerts { get; set; } = "12";
    public string ActiveAlertsChange { get; set; } = "20% vs yesterday";
    
    public string CriticalAlerts { get; set; } = "3";
    public string CriticalAlertsChange { get; set; } = "50% vs yesterday";
    
    public string CareTeams { get; set; } = "45";
    public string CareTeamsChange { get; set; } = "Active";
    
    public string OpenTasks { get; set; } = "156";
    public string OpenTasksChange { get; set; } = "8% vs yesterday";
    
    public string PendingReviews { get; set; } = "24";
    public string PendingReviewsChange { get; set; } = "15% vs yesterday";
}

public class AlertSummaryDto
{
    public int TotalAlerts { get; set; } = 12;
    public int Critical { get; set; } = 3;
    public int High { get; set; } = 4;
    public int Medium { get; set; } = 3;
    public int Low { get; set; } = 2;
}

public class PatientStatusDto
{
    public int TotalPatients { get; set; } = 2350;
    public int InCare { get; set; } = 1880;
    public int Admitted { get; set; } = 320;
    public int Discharged { get; set; } = 120;
    public int Inactive { get; set; } = 30;
}

public class HealthOverviewDto
{
    public string BloodPressure { get; set; } = "120/80 mmHg";
    public string BloodSugar { get; set; } = "110 mg/dL";
    public string HeartRate { get; set; } = "72 bpm";
}

public class TaskOverviewDto
{
    public int Overdue { get; set; } = 18;
    public int DueToday { get; set; } = 45;
    public int DueThisWeek { get; set; } = 93;
    public int CompletedToday { get; set; } = 32;
}

public class MedicationComplianceDto
{
    public int Overall { get; set; } = 92;
    public int OnTime { get; set; } = 92;
    public int Missed { get; set; } = 5;
    public int Late { get; set; } = 3;
}

public class TopUnitAttentionDto
{
    public string UnitName { get; set; } = string.Empty;
    public string Priority { get; set; } = "High";
}

public class AiBriefItemDto
{
    public string Text { get; set; } = string.Empty;
}

public class RecentAlertItemDto
{
    public string Severity { get; set; } = "Critical";
    public string PatientName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
}

public class IntegrationItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "Connected";
}
