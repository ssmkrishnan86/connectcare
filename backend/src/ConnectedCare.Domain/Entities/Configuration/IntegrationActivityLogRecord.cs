using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class IntegrationActivityLogRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DateTimeText { get; set; } = string.Empty;
    public string IntegrationName { get; set; } = string.Empty;
    public string Event { get; set; } = string.Empty;
    public string Status { get; set; } = "Success"; // Success, Failed
    public string Details { get; set; } = string.Empty;
    public string TriggeredBy { get; set; } = "System";
}
