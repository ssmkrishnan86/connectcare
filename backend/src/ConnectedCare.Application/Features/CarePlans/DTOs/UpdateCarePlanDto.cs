using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.CarePlans.DTOs;

public class UpdateCarePlanDto
{
    public string? PatientName { get; set; }
    public string? PatientIdCode { get; set; }
    public string? PrimaryCondition { get; set; }
    public string? PlanTitle { get; set; }
    public int? GoalCount { get; set; }
    public string? Status { get; set; }
    public string? StartDateText { get; set; }
    public string? ReviewDateText { get; set; }
    public string? ReviewDueBadge { get; set; }
    public string? AssignedNurseName { get; set; }
    public string? AttendingDoctorName { get; set; }
    public string? CareUnit { get; set; }
    public string? RoomNumber { get; set; }
    public int? OverallProgressPercentage { get; set; }
    public int? CompletedTasksCount { get; set; }
    public int? InProgressTasksCount { get; set; }
    public int? NotStartedTasksCount { get; set; }
    public int? OverdueTasksCount { get; set; }
}
