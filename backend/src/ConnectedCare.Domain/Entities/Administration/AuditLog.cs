using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AuditLog : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string LogIdCode { get; set; } = string.Empty;
    public string User { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string TimestampText { get; set; } = string.Empty;
}
