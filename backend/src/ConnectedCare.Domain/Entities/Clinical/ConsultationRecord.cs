using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class ConsultationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string ConsultationType { get; set; } = string.Empty; // e.g. Cardiology Consult
    public string ConsultationSubtitle { get; set; } = string.Empty; // e.g. Heart Failure
    public string ConsultationIcon { get; set; } = "HeartPulse";
    public Guid? PhysicianId { get; set; }
    public string PhysicianName { get; set; } = string.Empty;
    public string PhysicianRole { get; set; } = "Cardiologist";
    public string PhysicianAvatar { get; set; } = string.Empty;
    public string DateTimeText { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public ConsultationStatus Status { get; set; } = ConsultationStatus.InProgress;
    public string FollowUpDateText { get; set; } = string.Empty;
    public string ClinicalNotes { get; set; } = string.Empty;
    public bool IsLiked { get; set; } = false;
}
