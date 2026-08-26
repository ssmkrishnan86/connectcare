using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Features.Messages.DTOs;

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

    private async Task<(Guid? userId, string? userName, string? userRole, string? avatar)> GetCurrentUserAsync()
    {
        string? username = User.Identity?.Name;
        if (string.IsNullOrEmpty(username))
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var jwt = authHeader["Bearer ".Length..].Trim();
                    var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                    if (handler.CanReadToken(jwt))
                    {
                        var jwtToken = handler.ReadJwtToken(jwt);
                        username = jwtToken.Claims.FirstOrDefault(c =>
                            c.Type == System.Security.Claims.ClaimTypes.Name ||
                            c.Type == "unique_name" ||
                            c.Type == "name" ||
                            c.Type == "sub")?.Value;
                    }
                }
                catch { }
            }
        }

        if (!string.IsNullOrEmpty(username))
        {
            var reqUser = username.Trim().ToLower();
            var user = await _context.Users
                .Include(u => u.Doctor)
                .Include(u => u.Nurse)
                .FirstOrDefaultAsync(u => (u.Username.ToLower() == reqUser || u.Email.ToLower() == reqUser || (u.FullName != null && u.FullName.ToLower() == reqUser)) && u.IsActive);

            if (user != null)
            {
                var name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username;
                var role = user.Role;
                var avatar = !string.IsNullOrEmpty(user.Avatar)
                    ? user.Avatar
                    : (user.Doctor?.Avatar ?? user.Nurse?.Avatar ?? "");

                return (user.Id, name, role, avatar);
            }
        }

        return (null, null, null, null);
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations([FromQuery] string? category, [FromQuery] string? search)
    {
        var query = _context.ChatConversations.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (category.Equals("Unread", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.UnreadCount > 0);
            }
            else if (category.Equals("Mentions", StringComparison.OrdinalIgnoreCase) || category.Equals("Groups", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.IsGroup);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(c => c.ParticipantName.ToLower().Contains(searchLower) ||
                                     c.LastMessageText.ToLower().Contains(searchLower) ||
                                     (c.ParticipantRole != null && c.ParticipantRole.ToLower().Contains(searchLower)) ||
                                     (c.SharedPatientName != null && c.SharedPatientName.ToLower().Contains(searchLower)));
        }

        var list = await query.OrderByDescending(c => c.UpdatedDate).ToListAsync();
        var unreadCount = await _context.ChatConversations.SumAsync(c => c.UnreadCount);

        return Ok(new { success = true, data = list, unreadCount });
    }

    [HttpGet("conversations/{id}/messages")]
    public async Task<IActionResult> GetMessages(Guid id)
    {
        var (currentUserId, currentUserName, _, _) = await GetCurrentUserAsync();

        var messages = await _context.ChatMessages
            .Where(m => m.ConversationId == id)
            .OrderBy(m => m.CreatedDate)
            .ToListAsync();

        // Calculate isMe dynamically relative to requesting user
        var messageDtos = messages.Select(m => new
        {
            m.Id,
            m.ConversationId,
            m.SenderUserId,
            m.SenderName,
            m.SenderRole,
            m.SenderAvatar,
            m.MessageText,
            m.TimeText,
            IsMe = (currentUserId.HasValue && m.SenderUserId == currentUserId.Value) ||
                   (!string.IsNullOrEmpty(currentUserName) && !string.IsNullOrEmpty(m.SenderName) && m.SenderName.Equals(currentUserName, StringComparison.OrdinalIgnoreCase)),
            m.IsUnread,
            m.AttachmentUrl,
            m.AttachmentName,
            m.AttachmentType,
            m.AttachmentSize,
            m.CreatedDate
        }).ToList();

        return Ok(new { success = true, data = messageDtos });
    }

    [HttpPost("conversations/{id}/send")]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] SendMessageRequest request)
    {
        var conversation = await _context.ChatConversations.FindAsync(id);
        if (conversation == null)
        {
            return NotFound(new { success = false, message = "Conversation not found" });
        }

        var (currentUserId, currentUserName, currentUserRole, currentUserAvatar) = await GetCurrentUserAsync();

        var senderName = !string.IsNullOrWhiteSpace(request.SenderName)
            ? request.SenderName
            : (currentUserName ?? "User");

        var senderRole = !string.IsNullOrWhiteSpace(request.SenderRole)
            ? request.SenderRole
            : (currentUserRole ?? "Staff");

        var senderAvatar = !string.IsNullOrWhiteSpace(request.SenderAvatar)
            ? request.SenderAvatar
            : (!string.IsNullOrEmpty(currentUserAvatar) ? currentUserAvatar : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80");

        var senderUserId = request.SenderUserId ?? currentUserId;
        var timeNow = DateTime.Now.ToString("hh:mm tt");

        var msg = new ChatMessageRecord
        {
            ConversationId = id,
            SenderUserId = senderUserId,
            SenderName = senderName,
            SenderRole = senderRole,
            SenderAvatar = senderAvatar,
            MessageText = request.MessageText,
            TimeText = timeNow,
            IsMe = true,
            IsUnread = false,
            AttachmentUrl = request.AttachmentUrl,
            AttachmentName = request.AttachmentName,
            AttachmentType = request.AttachmentType,
            AttachmentSize = request.AttachmentSize,
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

    [HttpPost("conversations")]
    public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ParticipantName))
        {
            return BadRequest(new { success = false, message = "Participant or group name is required." });
        }

        var (currentUserId, currentUserName, currentUserRole, currentUserAvatar) = await GetCurrentUserAsync();

        var timeNow = DateTime.Now.ToString("hh:mm tt");

        var conversation = new ChatConversationRecord
        {
            ParticipantName = request.ParticipantName.Trim(),
            ParticipantRole = !string.IsNullOrWhiteSpace(request.ParticipantRole) ? request.ParticipantRole.Trim() : "Care Team Member",
            ParticipantAvatar = !string.IsNullOrWhiteSpace(request.ParticipantAvatar) ? request.ParticipantAvatar : "",
            ParticipantUserId = request.ParticipantUserId,
            CreatorUserId = currentUserId,
            IsOnline = true,
            LastMessageText = !string.IsNullOrWhiteSpace(request.InitialMessage) ? request.InitialMessage : "Conversation started",
            LastMessageTimeText = timeNow,
            UnreadCount = 0,
            IsGroup = request.IsGroup,
            Category = request.IsGroup ? "Mentions" : "All",
            SharedPatientId = request.SharedPatientId,
            SharedPatientName = !string.IsNullOrWhiteSpace(request.SharedPatientName) ? request.SharedPatientName : "General Ward Patients",
            SharedPatientIdCode = !string.IsNullOrWhiteSpace(request.SharedPatientIdCode) ? request.SharedPatientIdCode : "PT-10001",
            SharedPatientRoom = !string.IsNullOrWhiteSpace(request.SharedPatientRoom) ? request.SharedPatientRoom : "Room 302",
            SharedPatientCareUnit = !string.IsNullOrWhiteSpace(request.SharedPatientCareUnit) ? request.SharedPatientCareUnit : "Cardiology Unit",
            SharedPatientStatus = !string.IsNullOrWhiteSpace(request.SharedPatientStatus) ? request.SharedPatientStatus : "Active",
            SharedPatientAvatar = !string.IsNullOrWhiteSpace(request.SharedPatientAvatar) ? request.SharedPatientAvatar : "",
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _context.ChatConversations.Add(conversation);
        await contextSaveAsync();

        // If initial message supplied, save it
        if (!string.IsNullOrWhiteSpace(request.InitialMessage))
        {
            var senderName = !string.IsNullOrWhiteSpace(request.SenderName) ? request.SenderName : (currentUserName ?? "User");
            var senderRole = !string.IsNullOrWhiteSpace(request.SenderRole) ? request.SenderRole : (currentUserRole ?? "Staff");
            var senderAvatar = !string.IsNullOrWhiteSpace(request.SenderAvatar) ? request.SenderAvatar : (currentUserAvatar ?? "");

            var initialMsg = new ChatMessageRecord
            {
                ConversationId = conversation.Id,
                SenderUserId = request.SenderUserId ?? currentUserId,
                SenderName = senderName,
                SenderRole = senderRole,
                SenderAvatar = senderAvatar,
                MessageText = request.InitialMessage,
                TimeText = timeNow,
                IsMe = true,
                IsUnread = false,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };

            _context.ChatMessages.Add(initialMsg);
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, message = "Conversation created successfully", data = conversation });
    }

    [HttpGet("contacts")]
    public async Task<IActionResult> GetContacts()
    {
        var (currentUserId, _, _, _) = await GetCurrentUserAsync();

        var doctors = await _context.Doctors
            .Where(d => d.Status == Domain.Enums.DoctorStatus.Active && (!currentUserId.HasValue || d.UserId != currentUserId.Value))
            .Select(d => new
            {
                id = d.Id,
                userId = d.UserId,
                name = d.Name,
                role = d.Specialty ?? "Physician / Specialist",
                category = "Doctor",
                department = d.Department,
                avatar = d.Avatar,
                isOnline = true
            })
            .ToListAsync();

        var nurses = await _context.Nurses
            .Where(n => n.Status == Domain.Enums.DoctorStatus.Active && (!currentUserId.HasValue || n.UserId != currentUserId.Value))
            .Select(n => new
            {
                id = n.Id,
                userId = n.UserId,
                name = n.Name,
                role = "Staff Nurse",
                category = "Nurse",
                department = n.Department,
                avatar = n.Avatar,
                isOnline = true
            })
            .ToListAsync();

        var admins = await _context.Users
            .Where(u => (u.Role == "Admin" || u.Role == "System Administrator") && u.IsActive && (!currentUserId.HasValue || u.Id != currentUserId.Value))
            .Select(u => new
            {
                id = u.Id,
                userId = (Guid?)u.Id,
                name = !string.IsNullOrWhiteSpace(u.FullName) ? u.FullName : u.Username,
                role = "Hospital Administrator",
                category = "Admin",
                department = "Administration",
                avatar = u.Avatar,
                isOnline = true
            })
            .ToListAsync();

        var groups = new[]
        {
            new
            {
                id = Guid.NewGuid(),
                userId = (Guid?)null,
                name = "Pharmacy Support Team",
                role = "Clinical Pharmacy & Dispensing",
                category = "Group",
                department = "Pharmacy",
                avatar = "",
                isOnline = true
            },
            new
            {
                id = Guid.NewGuid(),
                userId = (Guid?)null,
                name = "Cardiology Shift Handover",
                role = "Nursing & Resident Care Team",
                category = "Group",
                department = "Cardiology Unit",
                avatar = "",
                isOnline = true
            },
            new
            {
                id = Guid.NewGuid(),
                userId = (Guid?)null,
                name = "Critical Care & ICU Alert Channel",
                role = "ICU Rapid Response",
                category = "Group",
                department = "Intensive Care Unit",
                avatar = "",
                isOnline = true
            }
        };

        return Ok(new
        {
            success = true,
            data = new
            {
                doctors,
                nurses,
                admins,
                groups
            }
        });
    }

    [HttpPut("conversations/{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var conversation = await _context.ChatConversations.FindAsync(id);
        if (conversation == null)
        {
            return NotFound(new { success = false, message = "Conversation not found" });
        }

        conversation.UnreadCount = 0;
        conversation.UpdatedDate = DateTime.UtcNow;

        var unreadMessages = await _context.ChatMessages
            .Where(m => m.ConversationId == id && m.IsUnread)
            .ToListAsync();

        foreach (var m in unreadMessages)
        {
            m.IsUnread = false;
        }

        await _context.SaveChangesAsync();

        var totalUnread = await _context.ChatConversations.SumAsync(c => c.UnreadCount);

        return Ok(new { success = true, message = "Marked as read", unreadCount = totalUnread });
    }

    [HttpPut("conversations/{id}/mute")]
    public async Task<IActionResult> ToggleMute(Guid id, [FromBody] dynamic? body)
    {
        var conversation = await _context.ChatConversations.FindAsync(id);
        if (conversation == null)
        {
            return NotFound(new { success = false, message = "Conversation not found" });
        }

        bool? isMuted = null;
        try
        {
            if (body != null && body.isMuted != null)
            {
                isMuted = (bool)body.isMuted;
            }
        }
        catch { }

        conversation.IsMuted = isMuted ?? !conversation.IsMuted;
        conversation.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, isMuted = conversation.IsMuted });
    }

    [HttpDelete("conversations/{id}")]
    public async Task<IActionResult> DeleteConversation(Guid id)
    {
        var conversation = await _context.ChatConversations.FindAsync(id);
        if (conversation == null)
        {
            return NotFound(new { success = false, message = "Conversation not found" });
        }

        var messages = await _context.ChatMessages.Where(m => m.ConversationId == id).ToListAsync();
        _context.ChatMessages.RemoveRange(messages);
        _context.ChatConversations.Remove(conversation);

        await _context.SaveChangesAsync();

        var totalUnread = await _context.ChatConversations.SumAsync(c => c.UnreadCount);

        return Ok(new { success = true, message = "Conversation deleted successfully", unreadCount = totalUnread });
    }

    private Task<int> contextSaveAsync() => _context.SaveChangesAsync();
}

