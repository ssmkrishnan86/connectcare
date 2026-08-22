using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.VitalRounds.DTOs;

public class VitalRoundSummaryDto
{
    public int TotalPatients { get; set; } = 24;
    public int InpatientsCount { get; set; } = 12;
    public int OutpatientsCount { get; set; } = 12;
    public int Completed { get; set; } = 18;
    public int Pending { get; set; } = 4;
    public int Overdue { get; set; } = 2;
    public int OnTimeCount { get; set; } = 16;
    public int CompletedLateCount { get; set; } = 2;
    public string AverageCompletionTime { get; set; } = "5m 20s";
}
