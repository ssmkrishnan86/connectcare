using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.VitalRounds.DTOs;

public class CreateVitalRoundDto
{
    public Guid PatientId { get; set; }
    public Guid? NurseId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientIdCode { get; set; }
    public string? CareUnit { get; set; }
    public string? RoomBed { get; set; }
    public string? BloodPressure { get; set; }
    public string? HeartRate { get; set; }
    public string? Temperature { get; set; }
    public string? SpO2 { get; set; }
    public string? RespiratoryRate { get; set; }
    public string? PainScore { get; set; }
    public string? RecordedByNurseName { get; set; }
    public string? Status { get; set; }
    public string? NextDueTimeText { get; set; }
}
