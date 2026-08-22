using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class PatientStatusDto
{
    public int TotalPatients { get; set; }
    public int InCare { get; set; }
    public int Admitted { get; set; }
    public int Discharged { get; set; }
    public int Inactive { get; set; }
}
