using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.CarePlans.DTOs;

public class CreateCarePlanDto
{
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PrimaryCondition { get; set; } = string.Empty;
    public string PlanTitle { get; set; } = string.Empty;
    public int GoalCount { get; set; } = 5;
    public string StartDateText { get; set; } = string.Empty;
    public string ReviewDateText { get; set; } = string.Empty;
    public string AssignedNurseName { get; set; } = string.Empty;
    public string AttendingDoctorName { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
}
