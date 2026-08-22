using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Consultations.DTOs;

public class ConsultationSummaryDto
{
    public int TotalConsultations { get; set; } = 18;
    public int Completed { get; set; } = 6;
    public int InProgress { get; set; } = 7;
    public int Scheduled { get; set; } = 4;
    public int FollowUpDue { get; set; } = 1;
}
