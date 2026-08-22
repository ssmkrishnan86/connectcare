using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.CarePlans.DTOs;

public class AddCarePlanNoteDto
{
    public string NoteText { get; set; } = string.Empty;
    public string? AuthorName { get; set; }
}
