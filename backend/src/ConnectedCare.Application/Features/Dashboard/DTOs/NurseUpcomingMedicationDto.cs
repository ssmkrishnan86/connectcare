using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class NurseUpcomingMedicationDto
{
    public string Time { get; set; } = string.Empty;
    public string MedicationName { get; set; } = string.Empty;
    public string PatientNameLocation { get; set; } = string.Empty;
    public string DueText { get; set; } = string.Empty;
    public string ColorClass { get; set; } = string.Empty;
}
