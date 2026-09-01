using System;
using System.Collections.Generic;
using ConnectedCare.Application.Features.CarePlans.Services;

namespace ConnectedCare.Application.Features.CarePlans.DTOs;

public class CarePlanDto
{
    public Guid Id { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string AttendingDoctorName { get; set; } = "Dr. Sarah Wilson";
    public int CareTeamMembersCount { get; set; } = 3;
    public string LengthOfStayText { get; set; } = "4 Days";
    public string PrimaryCondition { get; set; } = string.Empty;
    public string ConditionIcon { get; set; } = "Heart";
    public string PlanTitle { get; set; } = string.Empty;
    public int GoalCount { get; set; } = 6;
    public string Status { get; set; } = "Active";
    public string StartDateText { get; set; } = string.Empty;
    public string ReviewDateText { get; set; } = string.Empty;
    public string ReviewDueBadge { get; set; } = "5 days left";
    public string AssignedNurseName { get; set; } = "Emma Johnson";
    public string AssignedNurseAvatar { get; set; } = string.Empty;
    public int OverallProgressPercentage { get; set; } = 78;
    public int CompletedTasksCount { get; set; } = 14;
    public int InProgressTasksCount { get; set; } = 8;
    public int NotStartedTasksCount { get; set; } = 4;
    public int OverdueTasksCount { get; set; } = 2;
    public string LastUpdatedText { get; set; } = "May 22, 2024 10:30 AM";
    public string NotesJson { get; set; } = "[]";
    public List<CarePlanNoteItem> Notes { get; set; } = new();
}
