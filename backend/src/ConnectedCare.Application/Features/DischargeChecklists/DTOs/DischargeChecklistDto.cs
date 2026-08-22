using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.DischargeChecklists.DTOs;

public class DischargeChecklistDto
{
    public Guid Id { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AdmitDateText { get; set; } = string.Empty;
    public string AdmitDaysText { get; set; } = string.Empty;
    public string ChecklistStatus { get; set; } = "InProgress";
    public int ProgressPercentage { get; set; } = 70;
    public int PendingItemsCount { get; set; } = 2;
    public int TotalItemsCount { get; set; } = 14;
    public int CompletedItemsCount { get; set; } = 7;
    public int InProgressItemsCount { get; set; } = 4;
    public int NotStartedItemsCount { get; set; } = 1;
    public string ExpectedDischargeText { get; set; } = string.Empty;
    public string ExpectedDischargeRelative { get; set; } = "Today";
    public string AttendingDoctorName { get; set; } = "Dr. Sarah Wilson";
    public int CareTeamMembersCount { get; set; } = 3;
    public string Notes { get; set; } = string.Empty;
}
