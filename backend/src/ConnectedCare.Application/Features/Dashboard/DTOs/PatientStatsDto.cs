using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class PatientStatsDto
{
    public int AllPatients { get; set; }
    public string? AllPatientsChange { get; set; }
    public bool? AllPatientsUp { get; set; }

    public int InCare { get; set; }
    public string? InCareChange { get; set; }
    public bool? InCareUp { get; set; }

    public int Admitted { get; set; }
    public string? AdmittedChange { get; set; }
    public bool? AdmittedUp { get; set; }

    public int Discharged { get; set; }
    public string? DischargedChange { get; set; }
    public bool? DischargedUp { get; set; }

    public int Inactive { get; set; }
    public string? InactiveChange { get; set; }
    public bool? InactiveUp { get; set; }

    public int NewThisMonth { get; set; }
    public string? NewThisMonthChange { get; set; }
    public bool? NewThisMonthUp { get; set; }
}
