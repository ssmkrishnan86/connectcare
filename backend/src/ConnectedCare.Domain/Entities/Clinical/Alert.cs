using System;
using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class Alert : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string AlertIdCode { get; set; } = string.Empty; // e.g. ALT-1001
    public string Title { get; set; } = string.Empty; // e.g. Fall Detected
    public string Description { get; set; } = string.Empty; // e.g. Patient fall detected in Room 305
    public Guid? PatientId { get; set; }
    public Patient? Patient { get; set; }
    public Guid? RecipientId { get; set; }
    public string RecipientRole { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string Type { get; set; } = "Patient Safety"; // e.g. Patient Safety, Vital Signs, Medication, Equipment, Admission, Care Plan, Lab Result
    public AlertSeverity Severity { get; set; } = AlertSeverity.Medium; // Critical, High, Medium, Low
    public string RoomLocation { get; set; } = string.Empty; // e.g. Room 302 • Cardiology
    public string ReportedBy { get; set; } = string.Empty; // e.g. Nurse Sarah Wilson
    public string ReportedByRole { get; set; } = string.Empty; // e.g. Nurse Sarah
    public string TriggerCondition { get; set; } = string.Empty;
    public string TimestampText { get; set; } = string.Empty; // e.g. May 22, 2024 08:05 AM
    public string Status { get; set; } = "New"; // New, Acknowledged, In Progress, Pending, Resolved, Dismissed
    public bool IsAcknowledged { get; set; } = false;

    // Resolution & Action Details
    public string? ResolutionNotes { get; set; }
    public string? ResolvedBy { get; set; }
    public DateTime? ResolvedDate { get; set; }
    public string? AcknowledgedBy { get; set; }
    public DateTime? AcknowledgedDate { get; set; }

    // Extra Details for Alert Detail Panel
    public string CareUnit { get; set; } = "Cardiology Unit";
    public string AgeGender { get; set; } = "68 Y • Female";
    public string BloodGroup { get; set; } = "A+";
    public string PatientType { get; set; } = "Inpatient";
    public string DetectedBy { get; set; } = "Monitor System";
    public string Source { get; set; } = "Bedside Monitor";
    public string Notes { get; set; } = "Patient complained of headache and dizziness.";
}
