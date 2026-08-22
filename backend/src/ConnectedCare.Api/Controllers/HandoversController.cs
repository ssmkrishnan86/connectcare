using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Features.Handovers.DTOs;
using ConnectedCare.Domain.Enums;

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
    public async Task<IActionResult> GetHandoverOverview([FromQuery] Guid? nurseId)
    {
        // 1. Resolve nurseId from query or JWT token
        if (!nurseId.HasValue || nurseId.Value == Guid.Empty)
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
                        var nurseIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "nurseId")?.Value;
                        var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier || c.Type == "nameid" || c.Type == "sub")?.Value;
                        var usernameClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Name || c.Type == "unique_name")?.Value;

                        if (!string.IsNullOrEmpty(nurseIdClaim) && Guid.TryParse(nurseIdClaim, out var nid))
                        {
                            nurseId = nid;
                        }
                        else if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var uid))
                        {
                            var user = await _context.Users.Include(u => u.Nurse).FirstOrDefaultAsync(u => u.Id == uid);
                            if (user?.Nurse != null) nurseId = user.Nurse.Id;
                            else if (user != null)
                            {
                                var n = await _context.Nurses.FirstOrDefaultAsync(n => n.UserId == uid || n.Email.ToLower() == user.Email.ToLower());
                                if (n != null) nurseId = n.Id;
                            }
                        }
                        else if (!string.IsNullOrEmpty(usernameClaim))
                        {
                            var n = await _context.Nurses.FirstOrDefaultAsync(n => n.Email.ToLower() == usernameClaim.ToLower() || n.Name.ToLower() == usernameClaim.ToLower());
                            if (n != null) nurseId = n.Id;
                        }
                    }
                }
                catch { }
            }
        }

        // 2. Query patient_nurses mapping strictly
        List<Guid> assignedPatientIds = new();
        if (nurseId.HasValue && nurseId.Value != Guid.Empty)
        {
            assignedPatientIds = await _context.PatientNurses
                .Where(pn => pn.NurseId == nurseId.Value)
                .Select(pn => pn.PatientId)
                .ToListAsync();
        }

        var handover = await _context.ShiftHandovers.FirstOrDefaultAsync() ?? new ShiftHandoverRecord();

        var patients = await _context.Patients
            .Where(p => assignedPatientIds.Contains(p.Id))
            .ToListAsync();

        var patientSummaries = patients.Select(p => new
        {
            id = p.Id.ToString(),
            patientName = p.Name,
            patientIdCode = p.PatientIdCode,
            patientAvatar = !string.IsNullOrEmpty(p.Avatar) ? p.Avatar : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
            ageGender = p.AgeGender,
            roomNumber = p.FloorRoom,
            careUnit = p.CareUnit,
            conditionStatus = p.Status == PatientStatus.InCare ? "Stable" : p.Status.ToString(),
            conditionSubtitle = !string.IsNullOrEmpty(p.DischargePlan) ? p.DischargePlan : "In Monitoring",
            pendingTasksCount = _context.Tasks.Count(t => t.PatientId == p.Id && t.Status != TaskStatusItem.Completed && t.StatusStr != "Completed"),
            specialInstructions = !string.IsNullOrEmpty(p.AdditionalNotes) ? p.AdditionalNotes : "Routine vitals observation",
            priority = p.RiskLevel.ToString()
        }).ToList();

        var pendingTasks = await _context.Tasks
            .Where(t => t.PatientId != null && assignedPatientIds.Contains(t.PatientId.Value))
            .OrderByDescending(t => t.CreatedDate)
            .Take(10)
            .Select(t => new
            {
                id = t.Id,
                title = t.Title,
                patientName = t.PatientName,
                roomLocation = t.Patient != null ? t.Patient.FloorRoom : "Assigned Room",
                dueTime = t.DueTime ?? "03:30 PM",
                isOverdue = t.IsOverdue
            })
            .ToListAsync();

        var recentAlerts = await _context.Alerts
            .Where(a => a.PatientId != null && assignedPatientIds.Contains(a.PatientId.Value))
            .OrderByDescending(a => a.CreatedDate)
            .Take(10)
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
        return Ok(new { success = true, message = "Handover notes saved successfully" });
    }

    [HttpPost("complete")]
    public async Task<IActionResult> CompleteHandover()
    {
        var handover = await _context.ShiftHandovers.FirstOrDefaultAsync();
        if (handover != null)
        {
            handover.Status = "Completed";
            handover.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        return Ok(new { success = true, message = "Shift handover completed successfully" });
    }
}

