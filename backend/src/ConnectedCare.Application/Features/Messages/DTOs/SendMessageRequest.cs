namespace ConnectedCare.Application.Features.Messages.DTOs;

public class SendMessageRequest
{
    public string MessageText { get; set; } = string.Empty;
    public string? SenderName { get; set; }
    public string? SenderRole { get; set; }
    public string? SenderAvatar { get; set; }
    public Guid? SenderUserId { get; set; }
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }
    public string? AttachmentType { get; set; }
    public string? AttachmentSize { get; set; }
}
