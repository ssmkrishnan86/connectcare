using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class ChatMessageRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public string SenderName { get; set; } = string.Empty; // e.g. Dr. Sarah Wilson or Emma Johnson
    public string SenderRole { get; set; } = string.Empty;
    public string SenderAvatar { get; set; } = string.Empty;
    public string MessageText { get; set; } = string.Empty;
    public string TimeText { get; set; } = string.Empty; // e.g. 10:20 AM
    public bool IsMe { get; set; } = false;
    public bool IsUnread { get; set; } = false;
}
