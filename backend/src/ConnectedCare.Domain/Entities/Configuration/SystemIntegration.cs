using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class SystemIntegration : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string SystemType { get; set; } = string.Empty;
    public string Status { get; set; } = "Connected";
    public string LastSyncTime { get; set; } = "Just now";
}
