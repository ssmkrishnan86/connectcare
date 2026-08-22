using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.Consultations.DTOs;

public class UpdateConsultationDto
{
    public string? PatientName { get; set; }
    public string? PatientIdCode { get; set; }
    public string? RoomNumber { get; set; }
    public string? CareUnit { get; set; }
    public string? AgeGender { get; set; }
    public string? BloodGroup { get; set; }
    public string? ConsultationType { get; set; }
    public string? ConsultationSubtitle { get; set; }
    public string? PhysicianName { get; set; }
    public string? PhysicianRole { get; set; }
    public string? DateTimeText { get; set; }
    public string? Location { get; set; }
    public string? Reason { get; set; }
    public string? Status { get; set; }
    public string? FollowUpDateText { get; set; }
    public string? ClinicalNotes { get; set; }
    public bool? IsLiked { get; set; }
}
