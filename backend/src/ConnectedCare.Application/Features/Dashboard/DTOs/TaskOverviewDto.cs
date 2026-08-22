using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class TaskOverviewDto
{
    public int Overdue { get; set; }
    public int DueToday { get; set; }
    public int DueThisWeek { get; set; }
    public int CompletedToday { get; set; }
}
