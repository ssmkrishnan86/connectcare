using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class PatientCarePlanRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string ReviewDate { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; } = 0;
    public string GoalsText { get; set; } = string.Empty;
    public string NotesText { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public string PrescribedBy { get; set; } = "Dr. Sarah Wilson";
}
