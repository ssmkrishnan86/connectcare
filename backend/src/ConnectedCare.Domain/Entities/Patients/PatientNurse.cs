using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class PatientNurse : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }
    public Guid NurseId { get; set; }
    public Nurse? Nurse { get; set; }
    public bool IsPrimary { get; set; } = false;
    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    public string Shift { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}
