using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.CarePlans.DTOs;

public class ReviewCarePlanDto
{
    public string NewReviewDateText { get; set; } = string.Empty;
    public string? ReviewOutcome { get; set; }
    public int? OverallProgressPercentage { get; set; }
    public string? Status { get; set; }
}

// --- Vital Rounds DTOs ---
