using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class MedicationAdministrationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MedicationId { get; set; }
    public MedicationRecord? Medication { get; set; }

    public Guid? NurseId { get; set; }

    public string Status { get; set; } = "Given";

    public string Notes { get; set; } = string.Empty;

    public string AdministeredAtText { get; set; } = string.Empty;

    public string NurseName { get; set; } = string.Empty;
}
