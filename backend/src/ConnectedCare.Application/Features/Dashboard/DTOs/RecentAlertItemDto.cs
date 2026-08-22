using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class RecentAlertItemDto
{
    public string Severity { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
}
