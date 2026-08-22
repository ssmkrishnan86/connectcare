using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class PatientDoctor : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }
    public Guid DoctorId { get; set; }
    public Doctor? Doctor { get; set; }
    public bool IsPrimary { get; set; } = true;
    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    public string Notes { get; set; } = string.Empty;
}
