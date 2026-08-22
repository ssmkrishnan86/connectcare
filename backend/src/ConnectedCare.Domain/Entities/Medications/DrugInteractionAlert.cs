using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class DrugInteractionAlert : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Severity { get; set; } = "High";
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Count { get; set; } = 5;
    public string Status { get; set; } = "Requires review";
}
