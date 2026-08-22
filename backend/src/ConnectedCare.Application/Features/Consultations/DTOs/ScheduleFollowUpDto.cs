using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Consultations.DTOs;

public class ScheduleFollowUpDto
{
    public string FollowUpDate { get; set; } = string.Empty;
    public string? PhysicianName { get; set; }
    public string? Notes { get; set; }
}
