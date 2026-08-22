using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class NurseAlertDto
{
    public string Severity { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string PatientLocation { get; set; } = string.Empty;
    public string TimeText { get; set; } = string.Empty;
    public string ColorClass { get; set; } = string.Empty;
}
