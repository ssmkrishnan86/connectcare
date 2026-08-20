using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Application.Common.Models;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalendarController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public CalendarController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet("events")]
    public async Task<IActionResult> GetCalendarEvents([FromQuery] string? date)
    {
        var eventsList = new List<object>();

        // 1. Fetch Consultations
        var consultations = await _context.Consultations
            .OrderByDescending(c => c.CreatedDate)
            .Take(15)
            .ToListAsync();

        foreach (var c in consultations)
        {
            eventsList.Add(new
            {
                id = c.Id,
                title = string.IsNullOrEmpty(c.ConsultationType) ? "Patient Consultation" : c.ConsultationType,
                type = "Consultation",
                time = string.IsNullOrEmpty(c.DateTimeText) ? "10:00 AM" : c.DateTimeText,
                dateText = string.IsNullOrEmpty(c.DateTimeText) ? "Today" : c.DateTimeText,
                patientName = c.PatientName,
                providerOrAssignee = string.IsNullOrEmpty(c.PhysicianName) ? "Dr. Sarah Wilson" : c.PhysicianName,
                location = string.IsNullOrEmpty(c.RoomNumber) ? c.CareUnit : $"{c.CareUnit} • {c.RoomNumber}",
                status = c.Status.ToString(),
                priority = "High"
            });
        }

        // 2. Fetch Tasks
        var tasks = await _context.Tasks
            .OrderByDescending(t => t.CreatedDate)
            .Take(15)
            .ToListAsync();

        foreach (var t in tasks)
        {
            eventsList.Add(new
            {
                id = t.Id,
                title = t.Title,
                type = "Task",
                time = string.IsNullOrEmpty(t.DueTime) ? "02:00 PM" : t.DueTime,
                dateText = string.IsNullOrEmpty(t.DueTime) ? "Today" : t.DueTime,
                patientName = t.PatientName,
                providerOrAssignee = string.IsNullOrEmpty(t.AssignedCaregiver) ? "Care Team" : t.AssignedCaregiver,
                location = t.TaskType,
                status = t.StatusStr,
                priority = t.Priority.ToString()
            });
        }

        // 3. Fetch Doctor Consultations if present
        var docConsultations = await _context.DoctorConsultations
            .OrderByDescending(dc => dc.CreatedDate)
            .Take(10)
            .ToListAsync();

        foreach (var dc in docConsultations)
        {
            eventsList.Add(new
            {
                id = dc.Id,
                title = dc.ConsultationType,
                type = "Consultation",
                time = dc.DateText,
                dateText = dc.DateText,
                patientName = dc.PatientName,
                providerOrAssignee = dc.DoctorName,
                location = "Consultation Clinic",
                status = dc.Status,
                priority = "Medium"
            });
        }

        // 4. Fetch Vital Rounds
        var vitals = await _context.VitalRounds
            .OrderByDescending(v => v.CreatedDate)
            .Take(10)
            .ToListAsync();

        foreach (var v in vitals)
        {
            eventsList.Add(new
            {
                id = v.Id,
                title = $"Vital Round - {v.PatientName}",
                type = "Vital Round",
                time = v.NextDueTimeText,
                dateText = v.LastRoundDateText,
                patientName = v.PatientName,
                providerOrAssignee = v.RecordedByNurseName,
                location = $"{v.CareUnit} • {v.RoomBed}",
                status = v.Status.ToString(),
                priority = "Normal"
            });
        }

        var todayEventsCount = eventsList.Count;

        return Ok(ApiResponse<object>.Ok(new
        {
            todayCount = todayEventsCount,
            events = eventsList
        }));
    }
}
