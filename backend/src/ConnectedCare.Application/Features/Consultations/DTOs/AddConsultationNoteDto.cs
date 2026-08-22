using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Consultations.DTOs;

public class AddConsultationNoteDto
{
    public string ClinicalNotes { get; set; } = string.Empty;
    public string? Diagnosis { get; set; }
}
