using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public MessagesController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations([FromQuery] string? category, [FromQuery] string? search)
    {
        var query = _context.ChatConversations.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            if (category == "Unread")
            {
                query = query.Where(c => c.UnreadCount > 0);
            }
            else if (category == "Mentions")
            {
                query = query.Where(c => c.IsGroup);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => c.ParticipantName.ToLower().Contains(searchLower) ||
                                     c.LastMessageText.ToLower().Contains(searchLower));
        }

        var list = await query.OrderByDescending(c => c.UpdatedDate).ToListAsync();
        var unreadCount = await _context.ChatConversations.SumAsync(c => c.UnreadCount);
        return Ok(new { success = true, data = list, unreadCount });
    }

    [HttpGet("conversations/{id}/messages")]
    public async Task<IActionResult> GetMessages(Guid id)
    {
        var messages = await _context.ChatMessages
            .Where(m => m.ConversationId == id)
            .OrderBy(m => m.CreatedDate)
            .ToListAsync();

        return Ok(new { success = true, data = messages });
    }

    [HttpPost("conversations/{id}/send")]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] SendMessageRequest request)
    {
        var conversation = await _context.ChatConversations.FindAsync(id);
        if (conversation == null)
        {
            return NotFound(new { success = false, message = "Conversation not found" });
        }

        var timeNow = DateTime.Now.ToString("hh:mm tt");

        var msg = new ChatMessageRecord
        {
            ConversationId = id,
            SenderName = request.SenderName ?? "Emma Johnson",
            SenderRole = "Staff Nurse",
            SenderAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
            MessageText = request.MessageText,
            TimeText = timeNow,
            IsMe = true,
            IsUnread = false,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _context.ChatMessages.Add(msg);

        // Update conversation summary
        conversation.LastMessageText = request.MessageText;
        conversation.LastMessageTimeText = timeNow;
        conversation.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Message sent successfully", data = msg });
    }
}

public class SendMessageRequest
{
    public string MessageText { get; set; } = string.Empty;
    public string? SenderName { get; set; }
}
