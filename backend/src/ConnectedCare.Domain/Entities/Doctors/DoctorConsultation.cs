using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class DoctorConsultation : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; } = "Dr. Sarah Wilson";
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string DateText { get; set; } = string.Empty;
    public string ConsultationType { get; set; } = "Follow-up";
    public string ChiefComplaint { get; set; } = string.Empty;
    public string Diagnosis { get; set; } = string.Empty;
    public string ClinicalNotes { get; set; } = string.Empty;
    public string Status { get; set; } = "Completed";
}
