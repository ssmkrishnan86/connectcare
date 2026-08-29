using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.DischargeChecklists.DTOs;

public class CreateDischargeChecklistDto
{
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
    public int? ProgressPercentage { get; set; }
    public int? PendingItemsCount { get; set; }
    public int? TotalItemsCount { get; set; }
    public int? CompletedItemsCount { get; set; }
    public int? InProgressItemsCount { get; set; }
    public int? NotStartedItemsCount { get; set; }
    public string ExpectedDischargeText { get; set; } = string.Empty;
    public string ExpectedDischargeRelative { get; set; } = "Today";
    public string AttendingDoctorName { get; set; } = string.Empty;
    public int? CareTeamMembersCount { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string InstructionsTemplate { get; set; } = string.Empty;
}

// --- Consultations DTOs ---
