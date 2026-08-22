using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class MedicationReminder : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PatientName { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string MedicationName { get; set; } = string.Empty;
    public string DoseTimeText { get; set; } = string.Empty; // e.g. 10:00 AM
    public string RelativeTimeText { get; set; } = string.Empty; // e.g. in 1h 20m
}
