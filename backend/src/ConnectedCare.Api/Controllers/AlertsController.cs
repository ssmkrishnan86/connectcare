using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Api.Controllers;

public class ResolveAlertRequest
{
    public string? ResolutionNotes { get; set; }
    public string? ResolvedBy { get; set; }
}

public class AcknowledgeAlertRequest
{
    public string? AcknowledgedBy { get; set; }
}

public class BulkAlertActionRequest
{
    public string Action { get; set; } = "acknowledge"; // acknowledge, resolve, dismiss
    public List<Guid> AlertIds { get; set; } = new();
    public string? Note { get; set; }
    public string? ActionBy { get; set; }
}

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
    public async Task<IActionResult> GetAlerts(
        [FromQuery] string? search = null,
        [FromQuery] string? severity = null,
        [FromQuery] string? type = null,
        [FromQuery] string? status = null,
        [FromQuery] string? careUnit = null,
        [FromQuery] Guid? patientId = null,
        [FromQuery] bool? isAcknowledged = null)
    {
        var query = _context.Alerts.AsQueryable();

        if (patientId.HasValue)
        {
            query = query.Where(a => a.PatientId == patientId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(a =>
                a.Title.ToLower().Contains(s) ||
                a.Description.ToLower().Contains(s) ||
                a.PatientName.ToLower().Contains(s) ||
                a.PatientIdCode.ToLower().Contains(s) ||
                a.AlertIdCode.ToLower().Contains(s) ||
                a.TriggerCondition.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(severity) && !severity.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<AlertSeverity>(severity, true, out var parsedSev))
            {
                query = query.Where(a => a.Severity == parsedSev);
            }
        }

        if (!string.IsNullOrWhiteSpace(type) && !type.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(a => a.Type.ToLower() == type.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(a => a.Status.ToLower() == status.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(careUnit) && !careUnit.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var unit = careUnit.Trim().ToLower();
            query = query.Where(a => a.CareUnit.ToLower().Contains(unit) || a.RoomLocation.ToLower().Contains(unit));
        }

        if (isAcknowledged.HasValue)
        {
            query = query.Where(a => a.IsAcknowledged == isAcknowledged.Value);
        }

        var alerts = await query.OrderByDescending(a => a.CreatedDate).ToListAsync();
        return Ok(ApiResponse<List<Alert>>.Ok(alerts));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAlertById(Guid id)
    {
        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null)
        {
            return NotFound(ApiResponse<string>.Fail("Alert not found"));
        }
        return Ok(ApiResponse<Alert>.Ok(alert));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetAlertStats()
    {
        var alerts = await _context.Alerts.ToListAsync();
        var stats = new
        {
            totalAlerts = alerts.Count,
            critical = alerts.Count(a => a.Severity == AlertSeverity.Critical && a.Status != "Resolved" && a.Status != "Dismissed"),
            high = alerts.Count(a => a.Severity == AlertSeverity.High && a.Status != "Resolved" && a.Status != "Dismissed"),
            medium = alerts.Count(a => a.Severity == AlertSeverity.Medium && a.Status != "Resolved" && a.Status != "Dismissed"),
            information = alerts.Count(a => a.Severity == AlertSeverity.Low && a.Status != "Resolved" && a.Status != "Dismissed"),
            activeAlerts = alerts.Count(a => a.Status != "Resolved" && a.Status != "Dismissed"),
            resolvedToday = alerts.Count(a => a.Status == "Resolved" || a.IsAcknowledged),
            unacknowledged = alerts.Count(a => !a.IsAcknowledged && a.Status != "Resolved" && a.Status != "Dismissed")
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

        if (string.IsNullOrWhiteSpace(newAlert.Status))
        {
            newAlert.Status = "New";
        }

        // Auto-fill patient metadata if patient exists
        if (newAlert.PatientId.HasValue && newAlert.PatientId.Value != Guid.Empty)
        {
            var patient = await _context.Patients.FindAsync(newAlert.PatientId.Value);
            if (patient != null)
            {
                if (string.IsNullOrWhiteSpace(newAlert.PatientName)) newAlert.PatientName = patient.Name;
                if (string.IsNullOrWhiteSpace(newAlert.PatientIdCode)) newAlert.PatientIdCode = patient.PatientIdCode;
                if (string.IsNullOrWhiteSpace(newAlert.PatientAvatar)) newAlert.PatientAvatar = patient.Avatar ?? "";
                if (string.IsNullOrWhiteSpace(newAlert.RoomLocation)) newAlert.RoomLocation = patient.FloorRoom;
                if (string.IsNullOrWhiteSpace(newAlert.CareUnit)) newAlert.CareUnit = patient.CareUnit;
                if (string.IsNullOrWhiteSpace(newAlert.AgeGender)) newAlert.AgeGender = patient.AgeGender;
                if (string.IsNullOrWhiteSpace(newAlert.BloodGroup)) newAlert.BloodGroup = patient.BloodType;
            }
        }

        newAlert.CreatedDate = DateTime.UtcNow;
        newAlert.UpdatedDate = DateTime.UtcNow;

        _context.Alerts.Add(newAlert);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Alert>.Ok(newAlert, "Alert created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAlert(Guid id, [FromBody] Alert updated)
    {
        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null)
        {
            return NotFound(ApiResponse<string>.Fail("Alert not found"));
        }

        if (!string.IsNullOrWhiteSpace(updated.Title)) alert.Title = updated.Title;
        if (!string.IsNullOrWhiteSpace(updated.Description)) alert.Description = updated.Description;
        if (!string.IsNullOrWhiteSpace(updated.Type)) alert.Type = updated.Type;
        alert.Severity = updated.Severity;
        if (!string.IsNullOrWhiteSpace(updated.Status)) alert.Status = updated.Status;
        if (!string.IsNullOrWhiteSpace(updated.Notes)) alert.Notes = updated.Notes;
        if (!string.IsNullOrWhiteSpace(updated.ResolutionNotes)) alert.ResolutionNotes = updated.ResolutionNotes;
        if (!string.IsNullOrWhiteSpace(updated.RoomLocation)) alert.RoomLocation = updated.RoomLocation;
        if (!string.IsNullOrWhiteSpace(updated.CareUnit)) alert.CareUnit = updated.CareUnit;

        alert.UpdatedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Alert>.Ok(alert, "Alert updated successfully"));
    }

    [HttpPost("{id}/acknowledge")]
    public async Task<IActionResult> AcknowledgeAlert(Guid id, [FromBody] AcknowledgeAlertRequest? request = null)
    {
        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null)
        {
            return NotFound(ApiResponse<string>.Fail("Alert not found"));
        }

        alert.IsAcknowledged = true;
        if (alert.Status == "New" || alert.Status == "Open")
        {
            alert.Status = "Acknowledged";
        }
        alert.AcknowledgedBy = !string.IsNullOrWhiteSpace(request?.AcknowledgedBy) ? request.AcknowledgedBy : "Attending Caregiver";
        alert.AcknowledgedDate = DateTime.UtcNow;
        alert.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Alert>.Ok(alert, "Alert acknowledged successfully"));
    }

    [HttpPost("{id}/resolve")]
    public async Task<IActionResult> ResolveAlert(Guid id, [FromBody] ResolveAlertRequest? request = null)
    {
        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null)
        {
            return NotFound(ApiResponse<string>.Fail("Alert not found"));
        }

        alert.IsAcknowledged = true;
        alert.Status = "Resolved";
        alert.ResolvedBy = !string.IsNullOrWhiteSpace(request?.ResolvedBy) ? request.ResolvedBy : "Attending Staff";
        alert.ResolvedDate = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(request?.ResolutionNotes))
        {
            alert.ResolutionNotes = request.ResolutionNotes;
        }
        alert.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Alert>.Ok(alert, "Alert resolved successfully"));
    }

    [HttpPost("{id}/dismiss")]
    public async Task<IActionResult> DismissAlert(Guid id, [FromBody] ResolveAlertRequest? request = null)
    {
        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null)
        {
            return NotFound(ApiResponse<string>.Fail("Alert not found"));
        }

        alert.Status = "Dismissed";
        alert.IsAcknowledged = true;
        alert.ResolvedBy = !string.IsNullOrWhiteSpace(request?.ResolvedBy) ? request.ResolvedBy : "Attending Staff";
        alert.ResolvedDate = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(request?.ResolutionNotes))
        {
            alert.ResolutionNotes = request.ResolutionNotes;
        }
        alert.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Alert>.Ok(alert, "Alert dismissed successfully"));
    }

    [HttpPost("bulk-action")]
    public async Task<IActionResult> BulkAction([FromBody] BulkAlertActionRequest request)
    {
        if (request.AlertIds == null || request.AlertIds.Count == 0)
        {
            return BadRequest(ApiResponse<string>.Fail("No alert IDs provided"));
        }

        var alerts = await _context.Alerts.Where(a => request.AlertIds.Contains(a.Id)).ToListAsync();
        var action = request.Action.ToLower();
        var actor = !string.IsNullOrWhiteSpace(request.ActionBy) ? request.ActionBy : "Attending Staff";

        foreach (var alert in alerts)
        {
            if (action == "acknowledge")
            {
                alert.IsAcknowledged = true;
                if (alert.Status == "New" || alert.Status == "Open") alert.Status = "Acknowledged";
                alert.AcknowledgedBy = actor;
                alert.AcknowledgedDate = DateTime.UtcNow;
            }
            else if (action == "resolve")
            {
                alert.IsAcknowledged = true;
                alert.Status = "Resolved";
                alert.ResolvedBy = actor;
                alert.ResolvedDate = DateTime.UtcNow;
                if (!string.IsNullOrWhiteSpace(request.Note)) alert.ResolutionNotes = request.Note;
            }
            else if (action == "dismiss")
            {
                alert.Status = "Dismissed";
                alert.IsAcknowledged = true;
                alert.ResolvedBy = actor;
                alert.ResolvedDate = DateTime.UtcNow;
                if (!string.IsNullOrWhiteSpace(request.Note)) alert.ResolutionNotes = request.Note;
            }
            alert.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(alerts.Count, $"Successfully processed {alerts.Count} alerts"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAlert(Guid id)
    {
        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null)
        {
            return NotFound(ApiResponse<string>.Fail("Alert not found"));
        }

        _context.Alerts.Remove(alert);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok(id.ToString(), "Alert deleted successfully"));
    }
}
