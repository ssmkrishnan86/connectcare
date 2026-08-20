using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Common.Models;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public NotificationsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var alerts = await _context.Alerts
            .OrderByDescending(a => a.CreatedDate)
            .Take(20)
            .ToListAsync();

        var unreadCount = await _context.Alerts.CountAsync(a => !a.IsAcknowledged);

        var notifications = alerts.Select(a => new
        {
            id = a.Id,
            alertIdCode = a.AlertIdCode,
            title = a.Title,
            description = a.Description,
            severity = a.Severity.ToString(),
            type = a.Type,
            patientName = a.PatientName,
            roomLocation = a.RoomLocation,
            timestampText = string.IsNullOrEmpty(a.TimestampText) ? a.CreatedDate.ToString("MMM dd, yyyy hh:mm tt") : a.TimestampText,
            status = a.Status,
            isRead = a.IsAcknowledged,
            createdDate = a.CreatedDate
        }).ToList();

        return Ok(ApiResponse<object>.Ok(new
        {
            unreadCount,
            notifications
        }));
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null)
        {
            return NotFound(ApiResponse<string>.Fail("Notification not found"));
        }

        alert.IsAcknowledged = true;
        alert.Status = "Resolved";
        alert.UpdatedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var unreadCount = await _context.Alerts.CountAsync(a => !a.IsAcknowledged);

        return Ok(ApiResponse<object>.Ok(new { unreadCount, id }, "Notification marked as read"));
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var unreadAlerts = await _context.Alerts.Where(a => !a.IsAcknowledged).ToListAsync();
        foreach (var alert in unreadAlerts)
        {
            alert.IsAcknowledged = true;
            alert.Status = "Resolved";
            alert.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { unreadCount = 0 }, "All notifications marked as read"));
    }
}
