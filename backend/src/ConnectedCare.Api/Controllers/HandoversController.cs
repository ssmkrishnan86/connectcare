using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Features.Handovers.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HandoversController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public HandoversController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetHandoverOverview()
    {
        var handover = await _context.ShiftHandovers.FirstOrDefaultAsync() ?? new ShiftHandoverRecord();
        var patientSummaries = await _context.ShiftHandoverPatientRecords.ToListAsync();
        var pendingTasks = await _context.Tasks
            .Take(5)
            .Select(t => new
            {
                id = t.Id,
                title = t.Title,
                patientName = t.PatientName,
                roomLocation = t.Patient != null ? t.Patient.FloorRoom : "Room 201",
                dueTime = t.DueTime ?? "03:30 PM",
                isOverdue = t.IsOverdue
            })
            .ToListAsync();

        var recentAlerts = await _context.Alerts
            .Take(4)
            .Select(a => new
            {
                id = a.Id,
                title = a.Title,
                patientName = a.PatientName,
                roomLocation = a.RoomLocation,
                severity = a.Severity.ToString(),
                time = a.TimestampText
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                handover,
                patientSummaries,
                pendingTasks,
                recentAlerts
            }
        });
    }

    [HttpPost("save-notes")]
    public async Task<IActionResult> SaveNotes([FromBody] SaveNotesRequest request)
    {
        var handover = await _context.ShiftHandovers.FirstOrDefaultAsync();
        if (handover != null)
        {
            handover.HandoverNotes = request.Notes;
            handover.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        return Ok(new { success = true, message = "Notes saved successfully" });
    }

    [HttpPost("complete")]
    public async Task<IActionResult> CompleteHandover()
    {
        var handover = await _context.ShiftHandovers.FirstOrDefaultAsync();
        if (handover != null)
        {
            handover.Status = "Completed";
            handover.CompletedSectionsCount = 24;
            handover.CompletionPercentage = 100;
            handover.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        return Ok(new { success = true, message = "Shift Handover completed successfully" });
    }
}

