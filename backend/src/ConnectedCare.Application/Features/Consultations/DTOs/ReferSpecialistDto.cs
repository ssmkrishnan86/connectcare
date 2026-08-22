using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Consultations.DTOs;

public class ReferSpecialistDto
{
    public string SpecialistDepartment { get; set; } = string.Empty;
    public string SpecialistName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Priority { get; set; } = "Routine";
}

// --- Care Plans DTOs ---
