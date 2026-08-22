using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class MedicationAdministration : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MedicationId { get; set; }
    public MedicationRecord? Medication { get; set; }

    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }

    public Guid NurseId { get; set; }
    public Nurse? Nurse { get; set; }

    public string Status { get; set; } = "Given";

    public string Notes { get; set; } = string.Empty;

    public DateTime AdministeredAt { get; set; } = DateTime.UtcNow;
}
