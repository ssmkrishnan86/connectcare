using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.DischargeChecklists.DTOs;

public class DischargeChecklistSummaryDto
{
    public int TotalPatients { get; set; } = 21;
    public int InProgress { get; set; } = 7;
    public int ReadyForDischarge { get; set; } = 9;
    public int PendingItems { get; set; } = 3;
    public int DischargedToday { get; set; } = 2;
}
