using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Application.Services;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public AlertsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAlerts()
    {
        var alerts = await _context.Alerts.OrderByDescending(a => a.CreatedDate).ToListAsync();
        return Ok(ApiResponse<List<Alert>>.Ok(alerts));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetAlertStats()
    {
        var alerts = await _context.Alerts.ToListAsync();
        var stats = new
        {
            totalAlerts = alerts.Count,
            critical = alerts.Count(a => a.Severity == AlertSeverity.Critical),
            high = alerts.Count(a => a.Severity == AlertSeverity.High),
            medium = alerts.Count(a => a.Severity == AlertSeverity.Medium),
            resolvedToday = alerts.Count(a => a.Status == "Resolved" || a.IsAcknowledged)
        };
        return Ok(ApiResponse<object>.Ok(stats));
    }

    [HttpPost]
    public async Task<IActionResult> CreateAlert([FromBody] Alert newAlert)
    {
        if (string.IsNullOrWhiteSpace(newAlert.AlertIdCode))
        {
            newAlert.AlertIdCode = $"ALT-{Random.Shared.Next(1000, 9999)}";
        }
        if (string.IsNullOrWhiteSpace(newAlert.TimestampText))
        {
            newAlert.TimestampText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt");
        }
        newAlert.CreatedDate = DateTime.UtcNow;
        newAlert.UpdatedDate = DateTime.UtcNow;

        _context.Alerts.Add(newAlert);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Alert>.Ok(newAlert, "Alert created successfully"));
    }

    [HttpPost("{id}/acknowledge")]
    public async Task<IActionResult> AcknowledgeAlert(Guid id)
    {
        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null)
        {
            return NotFound(ApiResponse<string>.Fail("Alert not found"));
        }

        alert.IsAcknowledged = true;
        alert.Status = "Resolved";
        alert.UpdatedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Alert>.Ok(alert, "Alert acknowledged successfully"));
    }
}
