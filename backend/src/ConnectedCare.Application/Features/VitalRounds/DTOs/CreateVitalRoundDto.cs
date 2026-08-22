using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.VitalRounds.DTOs;

public class CreateVitalRoundDto
{
    public Guid PatientId { get; set; }
    public Guid NurseId { get; set; }
}
