using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class ChatConversationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ParticipantName { get; set; } = string.Empty; // e.g. Dr. Sarah Wilson
    public string ParticipantRole { get; set; } = string.Empty; // e.g. Cardiologist / Attending Doctor
    public string ParticipantAvatar { get; set; } = string.Empty;
    public bool IsOnline { get; set; } = true;
    public string LastMessageText { get; set; } = string.Empty;
    public string LastMessageTimeText { get; set; } = string.Empty; // e.g. 10:30 AM
    public int UnreadCount { get; set; } = 0;
    public bool IsGroup { get; set; } = false;
    public string Category { get; set; } = "All"; // All, Unread, Mentions
    public bool IsMuted { get; set; } = false;
    public Guid? CreatorUserId { get; set; }
    public Guid? ParticipantUserId { get; set; }

    // Shared Patient Details
    public Guid? SharedPatientId { get; set; }
    public string SharedPatientName { get; set; } = "Patricia Smith";
    public string SharedPatientIdCode { get; set; } = "PT-10001";
    public string SharedPatientRoom { get; set; } = "Room 302";
    public string SharedPatientCareUnit { get; set; } = "Cardiology Unit";
    public string SharedPatientStatus { get; set; } = "In Progress";
    public string SharedPatientAvatar { get; set; } = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80";
}
