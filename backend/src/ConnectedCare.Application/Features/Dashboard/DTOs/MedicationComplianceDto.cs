using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class MedicationComplianceDto
{
    public int Overall { get; set; }
    public int OnTime { get; set; }
    public int Missed { get; set; }
    public int Late { get; set; }
}
