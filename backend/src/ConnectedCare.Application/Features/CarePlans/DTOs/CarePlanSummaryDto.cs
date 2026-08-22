using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.CarePlans.DTOs;

public class CarePlanSummaryDto
{
    public int TotalCarePlans { get; set; } = 28;
    public int ActivePlans { get; set; } = 16;
    public int ReviewDue { get; set; } = 6;
    public int Completed { get; set; } = 4;
    public int DraftPlans { get; set; } = 2;
}
