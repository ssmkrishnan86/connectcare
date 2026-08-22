using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.VitalRounds.DTOs;

public class RecordVitalsDto
{
    public string BloodPressure { get; set; } = "120/80 mmHg";
    public string HeartRate { get; set; } = "82 bpm";
    public string Temperature { get; set; } = "98.6 Â°F";
    public string SpO2 { get; set; } = "98 %";
    public string RespiratoryRate { get; set; } = "18 /min";
    public string PainScore { get; set; } = "2/10";
    public string NurseName { get; set; } = "Emma Johnson";
}
