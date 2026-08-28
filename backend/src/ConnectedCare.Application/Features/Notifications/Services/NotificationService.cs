using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.Notifications.Services;

public class NotificationService : INotificationService
{
    private readonly ConnectedCareDbContext _context;

    public NotificationService(ConnectedCareDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationListResult> GetNotificationsAsync(NotificationFilterParams filter)
    {
        var query = _context.Notifications.AsQueryable();

        // Target user or role filtering:
        // A user sees notifications that are:
        // 1. Specifically addressed to their UserId, OR
        // 2. Addressed to their Role, OR
        // 3. System broadcast (UserRole == "All" or null)
        if (filter.UserId.HasValue && filter.UserId.Value != Guid.Empty)
        {
            var roleNormalized = filter.Role?.Trim().ToLower() ?? "";
            query = query.Where(n =>
                n.UserId == filter.UserId.Value ||
                (n.UserId == null && (
                    string.IsNullOrEmpty(n.UserRole) ||
                    n.UserRole.ToLower() == "all" ||
                    (!string.IsNullOrEmpty(roleNormalized) && n.UserRole.ToLower().Contains(roleNormalized))
                ))
            );
        }
        else if (!string.IsNullOrWhiteSpace(filter.Role) && !filter.Role.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var roleNormalized = filter.Role.Trim().ToLower();
            query = query.Where(n =>
                string.IsNullOrEmpty(n.UserRole) ||
                n.UserRole.ToLower() == "all" ||
                n.UserRole.ToLower().Contains(roleNormalized)
            );
        }

        if (!string.IsNullOrWhiteSpace(filter.Type) && !filter.Type.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var typeLower = filter.Type.Trim().ToLower();
            query = query.Where(n => n.Type.ToLower() == typeLower);
        }

        if (!string.IsNullOrWhiteSpace(filter.Severity) && !filter.Severity.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var sevLower = filter.Severity.Trim().ToLower();
            query = query.Where(n => n.Severity.ToLower() == sevLower);
        }

        if (filter.IsRead.HasValue)
        {
            query = query.Where(n => n.IsRead == filter.IsRead.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            query = query.Where(n =>
                n.Title.ToLower().Contains(s) ||
                n.Message.ToLower().Contains(s) ||
                (n.PatientName != null && n.PatientName.ToLower().Contains(s)) ||
                (n.PatientIdCode != null && n.PatientIdCode.ToLower().Contains(s)) ||
                (n.RoomLocation != null && n.RoomLocation.ToLower().Contains(s))
            );
        }

        var totalCount = await query.CountAsync();
        var unreadCount = await query.CountAsync(n => !n.IsRead);
        var criticalCount = await query.CountAsync(n => n.Severity.ToLower() == "critical" && !n.IsRead);

        var page = filter.Page > 0 ? filter.Page : 1;
        var pageSize = filter.PageSize > 0 ? Math.Min(filter.PageSize, 100) : 50;

        var notifications = await query
            .OrderByDescending(n => n.CreatedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new NotificationListResult
        {
            TotalCount = totalCount,
            UnreadCount = unreadCount,
            CriticalCount = criticalCount,
            Page = page,
            PageSize = pageSize,
            Notifications = notifications
        };
    }

    public async Task<int> GetUnreadCountAsync(Guid? userId, string? role)
    {
        var query = _context.Notifications.Where(n => !n.IsRead);

        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            var roleNormalized = role?.Trim().ToLower() ?? "";
            query = query.Where(n =>
                n.UserId == userId.Value ||
                (n.UserId == null && (
                    string.IsNullOrEmpty(n.UserRole) ||
                    n.UserRole.ToLower() == "all" ||
                    (!string.IsNullOrEmpty(roleNormalized) && n.UserRole.ToLower().Contains(roleNormalized))
                ))
            );
        }
        else if (!string.IsNullOrWhiteSpace(role) && !role.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var roleNormalized = role.Trim().ToLower();
            query = query.Where(n =>
                string.IsNullOrEmpty(n.UserRole) ||
                n.UserRole.ToLower() == "all" ||
                n.UserRole.ToLower().Contains(roleNormalized)
            );
        }

        return await query.CountAsync();
    }

    public async Task<AppNotification> CreateNotificationAsync(CreateNotificationDto dto)
    {
        var notification = new AppNotification
        {
            UserId = dto.UserId,
            UserRole = string.IsNullOrWhiteSpace(dto.UserRole) ? "All" : dto.UserRole,
            Title = dto.Title,
            Message = dto.Message,
            Type = string.IsNullOrWhiteSpace(dto.Type) ? "System" : dto.Type,
            Severity = string.IsNullOrWhiteSpace(dto.Severity) ? "Info" : dto.Severity,
            ActionUrl = dto.ActionUrl,
            RelatedEntityId = dto.RelatedEntityId,
            RelatedEntityType = dto.RelatedEntityType,
            PatientName = dto.PatientName,
            PatientIdCode = dto.PatientIdCode,
            RoomLocation = dto.RoomLocation,
            IsRead = false,
            TimestampText = string.IsNullOrWhiteSpace(dto.TimestampText) ? "Just now" : dto.TimestampText,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task<AppNotification?> MarkAsReadAsync(Guid id, Guid? userId = null)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null) return null;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        notification.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task<int> MarkAllAsReadAsync(Guid? userId = null, string? role = null)
    {
        var query = _context.Notifications.Where(n => !n.IsRead);

        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            var roleNormalized = role?.Trim().ToLower() ?? "";
            query = query.Where(n =>
                n.UserId == userId.Value ||
                (n.UserId == null && (
                    string.IsNullOrEmpty(n.UserRole) ||
                    n.UserRole.ToLower() == "all" ||
                    (!string.IsNullOrEmpty(roleNormalized) && n.UserRole.ToLower().Contains(roleNormalized))
                ))
            );
        }
        else if (!string.IsNullOrWhiteSpace(role) && !role.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var roleNormalized = role.Trim().ToLower();
            query = query.Where(n =>
                string.IsNullOrEmpty(n.UserRole) ||
                n.UserRole.ToLower() == "all" ||
                n.UserRole.ToLower().Contains(roleNormalized)
            );
        }

        var unreadList = await query.ToListAsync();
        var now = DateTime.UtcNow;

        foreach (var n in unreadList)
        {
            n.IsRead = true;
            n.ReadAt = now;
            n.UpdatedDate = now;
        }

        await _context.SaveChangesAsync();
        return unreadList.Count;
    }

    public async Task<bool> DeleteNotificationAsync(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> ClearAllReadAsync(Guid? userId = null, string? role = null)
    {
        var query = _context.Notifications.Where(n => n.IsRead);

        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            var roleNormalized = role?.Trim().ToLower() ?? "";
            query = query.Where(n =>
                n.UserId == userId.Value ||
                (n.UserId == null && (
                    string.IsNullOrEmpty(n.UserRole) ||
                    n.UserRole.ToLower() == "all" ||
                    (!string.IsNullOrEmpty(roleNormalized) && n.UserRole.ToLower().Contains(roleNormalized))
                ))
            );
        }

        var readList = await query.ToListAsync();
        _context.Notifications.RemoveRange(readList);
        await _context.SaveChangesAsync();
        return readList.Count;
    }

    public async Task<int> ClearAllNotificationsAsync()
    {
        var all = await _context.Notifications.ToListAsync();
        _context.Notifications.RemoveRange(all);
        await _context.SaveChangesAsync();
        return all.Count;
    }

    public async Task<AppNotification> DispatchNotificationAsync(
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
        string? relatedEntityType = null)
    {
        return await CreateNotificationAsync(new CreateNotificationDto
        {
            Title = title,
            Message = message,
            Type = type,
            Severity = severity,
            ActionUrl = actionUrl,
            UserRole = userRole,
            UserId = userId,
            PatientName = patientName,
            PatientIdCode = patientIdCode,
            RoomLocation = roomLocation,
            RelatedEntityId = relatedEntityId,
            RelatedEntityType = relatedEntityType,
            TimestampText = "Just now"
        });
    }
}
