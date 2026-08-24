using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.DischargeChecklists.DTOs;

public class CreateDischargeChecklistDto
{
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AdmitDateText { get; set; } = string.Empty;
    public string ExpectedDischargeText { get; set; } = string.Empty;
    public string AttendingDoctorName { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

// --- Consultations DTOs ---
