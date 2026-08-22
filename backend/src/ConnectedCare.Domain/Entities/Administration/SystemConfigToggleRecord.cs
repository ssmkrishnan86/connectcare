using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class SystemConfigToggleRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ConfigKey { get; set; } = string.Empty;
    public string ConfigLabel { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
}
