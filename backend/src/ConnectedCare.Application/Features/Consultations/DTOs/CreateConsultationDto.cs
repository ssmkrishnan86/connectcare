using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Consultations.DTOs;

public class CreateConsultationDto
{
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string ConsultationType { get; set; } = string.Empty;
    public string ConsultationSubtitle { get; set; } = string.Empty;
    public string PhysicianName { get; set; } = string.Empty;
    public string PhysicianRole { get; set; } = "Physician";
    public string DateTimeText { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Scheduled";
    public string FollowUpDateText { get; set; } = string.Empty;
    public string ClinicalNotes { get; set; } = string.Empty;
}
