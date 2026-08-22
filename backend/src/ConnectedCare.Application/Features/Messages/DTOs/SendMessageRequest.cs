namespace ConnectedCare.Application.Features.Messages.DTOs;

public class SendMessageRequest
{
    public string MessageText { get; set; } = string.Empty;
    public string? SenderName { get; set; }
}
