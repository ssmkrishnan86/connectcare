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

public class PatientStatsDto
{
    public int AllPatients { get; set; }
    public string AllPatientsChange { get; set; } = "12.5% vs last month";
    public bool AllPatientsUp { get; set; } = true;

    public int InCare { get; set; }
    public string InCareChange { get; set; } = "8.4% vs last month";
    public bool InCareUp { get; set; } = true;

    public int Admitted { get; set; }
    public string AdmittedChange { get; set; } = "3.2% vs last month";
    public bool AdmittedUp { get; set; } = true;

    public int Discharged { get; set; }
    public string DischargedChange { get; set; } = "4.1% vs last month";
    public bool DischargedUp { get; set; } = false;

    public int Inactive { get; set; }
    public string InactiveChange { get; set; } = "10% vs last month";
    public bool InactiveUp { get; set; } = false;

    public int NewThisMonth { get; set; }
    public string NewThisMonthChange { get; set; } = "7.6% vs last month";
    public bool NewThisMonthUp { get; set; } = true;
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

public class NurseDashboardDto
{
    public int TotalPatients { get; set; } = 24;
    public int InpatientsCount { get; set; } = 12;
    public int OutpatientsCount { get; set; } = 12;
    
    public int TasksTotal { get; set; } = 8;
    public int TasksPending { get; set; } = 5;
    public int TasksCompleted { get; set; } = 3;
    
    public int MedicationsDueTotal { get; set; } = 6;
    public int MedicationsOverdue { get; set; } = 2;
    public int MedicationsUpcoming { get; set; } = 4;
    
    public int AlertsTotal { get; set; } = 6;
    public int AlertsCritical { get; set; } = 3;
    public int AlertsHigh { get; set; } = 3;
    
    public int RoundsCompleted { get; set; } = 18;
    public int RoundsTotal { get; set; } = 24;
    
    public int AdmissionsToday { get; set; } = 4;
    public int DischargesToday { get; set; } = 1;
    public int TransfersToday { get; set; } = 2;

    public List<NurseCategoryStatDto> CareTypes { get; set; } = new();
    public List<NurseCategoryStatDto> Priorities { get; set; } = new();
    public List<NurseUpcomingMedicationDto> UpcomingMedications { get; set; } = new();
    public List<NurseTaskItemDto> MyTasks { get; set; } = new();
    public List<NurseAlertDto> LatestAlerts { get; set; } = new();
}

public class NurseCategoryStatDto
{
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class NurseUpcomingMedicationDto
{
    public string Time { get; set; } = string.Empty;
    public string MedicationName { get; set; } = string.Empty;
    public string PatientNameLocation { get; set; } = string.Empty;
    public string DueText { get; set; } = string.Empty;
    public string ColorClass { get; set; } = string.Empty;
}

public class NurseTaskItemDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string DueText { get; set; } = string.Empty;
    public string DueColorClass { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}

public class NurseAlertDto
{
    public string Severity { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string PatientLocation { get; set; } = string.Empty;
    public string TimeText { get; set; } = string.Empty;
    public string ColorClass { get; set; } = string.Empty;
}
