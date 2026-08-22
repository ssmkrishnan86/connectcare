using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Dashboard.DTOs;

public class TopUnitAttentionDto
{
    public string UnitName { get; set; } = string.Empty;
    public string? Priority { get; set; }
}
