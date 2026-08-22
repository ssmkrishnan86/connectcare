using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class AlertSummaryDto
{
    public int TotalAlerts { get; set; }
    public int Critical { get; set; }
    public int High { get; set; }
    public int Medium { get; set; }
    public int Low { get; set; }
}
