using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class NurseTaskItemDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string DueText { get; set; } = string.Empty;
    public string DueColorClass { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}
