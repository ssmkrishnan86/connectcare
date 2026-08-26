namespace ConnectedCare.Application.Features.Messages.DTOs;

public class CreateConversationRequest
{
    public string ParticipantName { get; set; } = string.Empty;
    public string ParticipantRole { get; set; } = string.Empty;
    public string? ParticipantAvatar { get; set; }
    public Guid? ParticipantUserId { get; set; }
    public bool IsGroup { get; set; } = false;
    public string Category { get; set; } = "All";
    
    // Shared Patient optional
    public Guid? SharedPatientId { get; set; }
    public string? SharedPatientName { get; set; }
    public string? SharedPatientIdCode { get; set; }
    public string? SharedPatientRoom { get; set; }
    public string? SharedPatientCareUnit { get; set; }
    public string? SharedPatientStatus { get; set; }
    public string? SharedPatientAvatar { get; set; }

    // Initial message optional
    public string? InitialMessage { get; set; }
    public string? SenderName { get; set; }
    public string? SenderRole { get; set; }
    public string? SenderAvatar { get; set; }
    public Guid? SenderUserId { get; set; }
}
