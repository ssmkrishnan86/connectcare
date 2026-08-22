using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiActivityLogRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TimeText { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string ResidentInfo { get; set; } = string.Empty;
    public string Type { get; set; } = "Success"; // Success, Warning, Error, Info
    public string Service { get; set; } = string.Empty;
}
