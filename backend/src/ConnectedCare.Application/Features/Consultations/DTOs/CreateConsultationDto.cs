using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ConnectedCare.Application.Features.Consultations.DTOs;

public class CreateConsultationDto
{
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";

    [Required(ErrorMessage = "Appointment Type is required.")]
    [MaxLength(30, ErrorMessage = "Appointment Type cannot exceed 30 characters.")]
    public string ConsultationType { get; set; } = string.Empty;

    public string ConsultationSubtitle { get; set; } = string.Empty;
    public string PhysicianName { get; set; } = string.Empty;
    public string PhysicianRole { get; set; } = "Physician";

    [Required(ErrorMessage = "Date & Time is required.")]
    public string DateTimeText { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Scheduled";
    public string FollowUpDateText { get; set; } = string.Empty;
    public string ClinicalNotes { get; set; } = string.Empty;
}
