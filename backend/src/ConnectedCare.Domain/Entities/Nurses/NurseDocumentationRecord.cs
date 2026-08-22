using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class NurseDocumentationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DocumentCode { get; set; } = string.Empty; // e.g. DOC-2024-0056
    public string DocumentName { get; set; } = string.Empty; // e.g. Nursing Care Note
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty; // e.g. Patricia Smith
    public string PatientIdCode { get; set; } = string.Empty; // e.g. PT-10001
    public string PatientAvatar { get; set; } = string.Empty;
    public string RoomLocation { get; set; } = string.Empty; // e.g. Room 302
    public string CareUnit { get; set; } = string.Empty; // e.g. Cardiology Unit
    public string AgeGender { get; set; } = string.Empty; // e.g. 68 Y â€¢ Female
    public string BloodGroup { get; set; } = string.Empty; // e.g. A+
    public string PatientType { get; set; } = "Inpatient";
    public string DocumentType { get; set; } = string.Empty; // Care Note, Assessment, Medication, Education, Report, Care Plan, Discharge Summary
    public string DateTimeText { get; set; } = string.Empty; // May 22, 2024 10:30 AM
    public string CreatedByName { get; set; } = "Emma Johnson";
    public string CreatedByRole { get; set; } = "Staff Nurse";
    public string Status { get; set; } = "Completed"; // Completed, Pending, Needs Review, Draft
    public bool IsDraft { get; set; } = false;
    public string NotesContent { get; set; } = string.Empty;
}
