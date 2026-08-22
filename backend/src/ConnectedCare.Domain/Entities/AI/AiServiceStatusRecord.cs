using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiServiceStatusRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ServiceName { get; set; } = string.Empty;
    public string Status { get; set; } = "Healthy"; // Healthy, Degraded, Unhealthy
    public string ModelVersion { get; set; } = "gpt-4o";
    public string UptimePercentage { get; set; } = "99.9%";
}
