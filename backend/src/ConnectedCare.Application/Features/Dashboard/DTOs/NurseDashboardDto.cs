using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class NurseDashboardDto
{
    public int TotalPatients { get; set; }
    public int InpatientsCount { get; set; }
    public int OutpatientsCount { get; set; }
    
    public int TasksTotal { get; set; }
    public int TasksPending { get; set; }
    public int TasksCompleted { get; set; }
    
    public int MedicationsDueTotal { get; set; }
    public int MedicationsOverdue { get; set; }
    public int MedicationsUpcoming { get; set; }
    
    public int AlertsTotal { get; set; }
    public int AlertsCritical { get; set; }
    public int AlertsHigh { get; set; }
    
    public int RoundsCompleted { get; set; }
    public int RoundsTotal { get; set; }
    
    public int AdmissionsToday { get; set; }
    public int DischargesToday { get; set; }
    public int TransfersToday { get; set; }

    public List<NurseCategoryStatDto> CareTypes { get; set; } = new();
    public List<NurseCategoryStatDto> Priorities { get; set; } = new();
    public List<NurseUpcomingMedicationDto> UpcomingMedications { get; set; } = new();
    public List<NurseTaskItemDto> MyTasks { get; set; } = new();
    public List<NurseAlertDto> LatestAlerts { get; set; } = new();
}
