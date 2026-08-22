using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class HealthOverviewDto
{
    public string? BloodPressure { get; set; }
    public string? BloodSugar { get; set; }
    public string? HeartRate { get; set; }
}
