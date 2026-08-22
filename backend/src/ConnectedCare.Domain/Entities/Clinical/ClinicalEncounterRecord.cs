using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class ClinicalEncounterRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DateText { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string EncounterType { get; set; } = "Outpatient";
    public string ProviderName { get; set; } = string.Empty;
    public string ReasonDiagnosis { get; set; } = string.Empty;
}
