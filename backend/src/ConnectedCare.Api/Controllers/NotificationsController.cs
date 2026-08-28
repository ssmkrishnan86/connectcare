using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.Notifications.Services;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] Guid? userId = null,
        [FromQuery] string? role = null,
        [FromQuery] string? type = null,
        [FromQuery] string? severity = null,
        [FromQuery] bool? isRead = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var filter = new NotificationFilterParams
        {
            UserId = userId,
            Role = role,
            Type = type,
            Severity = severity,
            IsRead = isRead,
            Search = search,
            Page = page,
            PageSize = pageSize
        };

        var result = await _notificationService.GetNotificationsAsync(filter);

        var notifications = result.Notifications.Select(n => new
        {
            id = n.Id,
            userId = n.UserId,
            userRole = n.UserRole,
            title = n.Title,
            message = n.Message,
            description = n.Message, // backwards compatibility
            type = n.Type,
            severity = n.Severity,
            actionUrl = n.ActionUrl ?? (n.Type.ToLower() switch
            {
                "alert" => "/alerts",
                "task" => "/tasks",
                "medication" => "/medications",
                "consultation" => "/consultations",
                "shifthandover" => "/shift-handover",
                "careplan" => "/care-plans",
                "message" => "/messages",
                _ => "/notifications"
            }),
            relatedEntityId = n.RelatedEntityId,
            relatedEntityType = n.RelatedEntityType,
            patientName = n.PatientName,
            patientIdCode = n.PatientIdCode,
            roomLocation = n.RoomLocation,
            isRead = n.IsRead,
            readAt = n.ReadAt,
            timestampText = string.IsNullOrEmpty(n.TimestampText) ? n.CreatedDate.ToString("MMM dd, yyyy hh:mm tt") : n.TimestampText,
            createdDate = n.CreatedDate
        }).ToList();

        return Ok(ApiResponse<object>.Ok(new
        {
            totalCount = result.TotalCount,
            unreadCount = result.UnreadCount,
            criticalCount = result.CriticalCount,
            page = result.Page,
            pageSize = result.PageSize,
            notifications
        }));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount([FromQuery] Guid? userId = null, [FromQuery] string? role = null)
    {
        var count = await _notificationService.GetUnreadCountAsync(userId, role);
        return Ok(ApiResponse<object>.Ok(new { unreadCount = count }));
    }

    [HttpPost]
    public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Message))
        {
            return BadRequest(ApiResponse<string>.Fail("Title and Message are required."));
        }

        var created = await _notificationService.CreateNotificationAsync(dto);
        return Ok(ApiResponse<AppNotification>.Ok(created, "Notification created successfully"));
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, [FromQuery] Guid? userId = null)
    {
        var updated = await _notificationService.MarkAsReadAsync(id, userId);
        if (updated == null)
        {
            return NotFound(ApiResponse<string>.Fail("Notification not found"));
        }

        var unreadCount = await _notificationService.GetUnreadCountAsync(userId, null);
        return Ok(ApiResponse<object>.Ok(new { id = updated.Id, isRead = true, unreadCount }, "Notification marked as read"));
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead([FromQuery] Guid? userId = null, [FromQuery] string? role = null)
    {
        var markedCount = await _notificationService.MarkAllAsReadAsync(userId, role);
        return Ok(ApiResponse<object>.Ok(new { unreadCount = 0, markedCount }, "All notifications marked as read"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        var deleted = await _notificationService.DeleteNotificationAsync(id);
        if (!deleted)
        {
            return NotFound(ApiResponse<string>.Fail("Notification not found"));
        }

        return Ok(ApiResponse<bool>.Ok(true, "Notification deleted successfully"));
    }

    [HttpPost("clear-all")]
    public async Task<IActionResult> ClearAllRead([FromQuery] Guid? userId = null, [FromQuery] string? role = null)
    {
        var clearedCount = await _notificationService.ClearAllReadAsync(userId, role);
        return Ok(ApiResponse<object>.Ok(new { clearedCount }, "All read notifications cleared"));
    }

    [HttpPost("clear-all-data")]
    [HttpDelete("all")]
    public async Task<IActionResult> ClearAllData()
    {
        var clearedCount = await _notificationService.ClearAllNotificationsAsync();
        return Ok(ApiResponse<object>.Ok(new { clearedCount }, "All notifications cleared"));
    }
}
