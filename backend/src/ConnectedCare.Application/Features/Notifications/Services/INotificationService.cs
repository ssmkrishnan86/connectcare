using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.Notifications.Services;

public class NotificationFilterParams
{
    public Guid? UserId { get; set; }
    public string? Role { get; set; }
    public string? Type { get; set; }
    public string? Severity { get; set; }
    public bool? IsRead { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class NotificationListResult
{
    public int TotalCount { get; set; }
    public int UnreadCount { get; set; }
    public int CriticalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public List<AppNotification> Notifications { get; set; } = new();
}

public class CreateNotificationDto
{
    public Guid? UserId { get; set; }
    public string? UserRole { get; set; } = "All";
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "System";
    public string Severity { get; set; } = "Info";
    public string? ActionUrl { get; set; }
    public string? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
    public string? PatientName { get; set; }
    public string? PatientIdCode { get; set; }
    public string? RoomLocation { get; set; }
    public string? TimestampText { get; set; }
}

public interface INotificationService
{
    Task<NotificationListResult> GetNotificationsAsync(NotificationFilterParams filter);
    Task<int> GetUnreadCountAsync(Guid? userId, string? role);
    Task<AppNotification> CreateNotificationAsync(CreateNotificationDto dto);
    Task<AppNotification?> MarkAsReadAsync(Guid id, Guid? userId = null);
    Task<int> MarkAllAsReadAsync(Guid? userId = null, string? role = null);
    Task<bool> DeleteNotificationAsync(Guid id);
    Task<int> ClearAllReadAsync(Guid? userId = null, string? role = null);
    Task<int> ClearAllNotificationsAsync();
    Task<AppNotification> DispatchNotificationAsync(
        string title,
        string message,
        string type,
        string severity = "Info",
        string? actionUrl = null,
        string? userRole = "All",
        Guid? userId = null,
        string? patientName = null,
        string? patientIdCode = null,
        string? roomLocation = null,
        string? relatedEntityId = null,
        string? relatedEntityType = null);
}
