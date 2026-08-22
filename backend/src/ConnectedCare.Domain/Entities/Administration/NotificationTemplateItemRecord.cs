using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class NotificationTemplateItemRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TemplateName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Channel { get; set; } = "Email";
    public string TriggerEvent { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public bool IsEnabled { get; set; } = true;
}
