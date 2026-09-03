using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Features.Handovers.DTOs;
using ConnectedCare.Application.Features.Notifications.Services;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HandoversController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;
    private readonly INotificationService _notificationService;

    public HandoversController(ConnectedCareDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetHandoverOverview([FromQuery] Guid? nurseId)
    {
        string currentNurseName = string.Empty;
        string currentNurseRole = "Staff Nurse";
        string currentNurseAvatar = string.Empty;

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
                            if (user?.Nurse != null)
                            {
                                nurseId = user.Nurse.Id;
                                currentNurseName = user.Nurse.Name;
                                currentNurseAvatar = user.Nurse.Avatar;
                                currentNurseRole = user.Nurse.Role ?? "Staff Nurse";
                            }
                            else if (user != null)
                            {
                                var n = await _context.Nurses.FirstOrDefaultAsync(n => n.UserId == uid || n.Email.ToLower() == user.Email.ToLower());
                                if (n != null)
                                {
                                    nurseId = n.Id;
                                    currentNurseName = n.Name;
                                    currentNurseAvatar = n.Avatar;
                                    currentNurseRole = n.Role ?? "Staff Nurse";
                                }
                                else
                                {
                                    currentNurseName = user.FullName ?? user.Username;
                                }
                            }
                        }
                        else if (!string.IsNullOrEmpty(usernameClaim))
                        {
                            var n = await _context.Nurses.FirstOrDefaultAsync(n => n.Email.ToLower() == usernameClaim.ToLower() || n.Name.ToLower() == usernameClaim.ToLower());
                            if (n != null)
                            {
                                nurseId = n.Id;
                                currentNurseName = n.Name;
                                currentNurseAvatar = n.Avatar;
                                currentNurseRole = n.Role ?? "Staff Nurse";
                            }
                            else
                            {
                                currentNurseName = usernameClaim;
                            }
                        }
                    }
                }
                catch { }
            }
        }

        if (nurseId.HasValue && nurseId.Value != Guid.Empty && string.IsNullOrEmpty(currentNurseName))
        {
            var n = await _context.Nurses.FirstOrDefaultAsync(x => x.Id == nurseId.Value);
            if (n != null)
            {
                currentNurseName = n.Name;
                currentNurseAvatar = n.Avatar;
                currentNurseRole = n.Role ?? "Staff Nurse";
            }
        }

        // 2. Query assigned patients or fallback to InCare patients
        List<Guid> assignedPatientIds = new();
        if (nurseId.HasValue && nurseId.Value != Guid.Empty)
        {
            assignedPatientIds = await _context.PatientNurses
                .Where(pn => pn.NurseId == nurseId.Value)
                .Select(pn => pn.PatientId)
                .ToListAsync();
        }

        List<Patient> patients;
        if (assignedPatientIds.Any())
        {
            patients = await _context.Patients
                .Where(p => assignedPatientIds.Contains(p.Id) && p.Status == PatientStatus.InCare)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }
        else
        {
            // Fallback to all InCare patients so overview reflects live hospital data
            patients = await _context.Patients
                .Where(p => p.Status == PatientStatus.InCare)
                .OrderBy(p => p.Name)
                .Take(25)
                .ToListAsync();

            assignedPatientIds = patients.Select(p => p.Id).ToList();
        }

        var patientSummaries = patients.Select(p => new
        {
            id = p.Id.ToString(),
            patientName = p.Name,
            patientIdCode = p.PatientIdCode,
            patientAvatar = !string.IsNullOrEmpty(p.Avatar) ? p.Avatar : string.Empty,
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
            .Where(t => t.PatientId != null && assignedPatientIds.Contains(t.PatientId.Value) && t.Status != TaskStatusItem.Completed && t.StatusStr != "Completed")
            .OrderByDescending(t => t.CreatedDate)
            .Take(15)
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
            .Where(a => a.PatientId != null && assignedPatientIds.Contains(a.PatientId.Value) && a.Status != "Resolved" && a.Status != "Dismissed")
            .OrderByDescending(a => a.CreatedDate)
            .Take(15)
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

        // Determine current shift based on local hour
        var nowLocal = DateTime.Now;
        string currentShiftText;
        string nextShiftText;
        if (nowLocal.Hour >= 7 && nowLocal.Hour < 15)
        {
            currentShiftText = "Day Shift (07:00 AM - 03:00 PM)";
            nextShiftText = "Evening Shift (03:00 PM - 11:00 PM)";
        }
        else if (nowLocal.Hour >= 15 && nowLocal.Hour < 23)
        {
            currentShiftText = "Evening Shift (03:00 PM - 11:00 PM)";
            nextShiftText = "Night Shift (11:00 PM - 07:00 AM)";
        }
        else
        {
            currentShiftText = "Night Shift (11:00 PM - 07:00 AM)";
            nextShiftText = "Day Shift (07:00 AM - 03:00 PM)";
        }

        // 3. Find latest draft handover or create one
        var handover = await _context.ShiftHandovers
            .Where(s => s.Status == "Draft")
            .OrderByDescending(s => s.UpdatedDate)
            .FirstOrDefaultAsync();

        if (handover == null)
        {
            // Suggest default incoming nurse from other active nurses
            var otherNurse = await _context.Nurses
                .Where(n => !string.IsNullOrEmpty(n.Name) && (string.IsNullOrEmpty(currentNurseName) || n.Name.ToLower() != currentNurseName.ToLower()))
                .FirstOrDefaultAsync();

            handover = new ShiftHandoverRecord
            {
                Id = Guid.NewGuid(),
                HandoverIdCode = $"SHO-{DateTime.UtcNow:MMdd}-{new Random().Next(100, 999)}",
                CurrentShift = currentShiftText,
                HandoverToShift = nextShiftText,
                OutgoingNurseName = !string.IsNullOrEmpty(currentNurseName) ? currentNurseName : "Current Nurse",
                OutgoingNurseRole = currentNurseRole,
                OutgoingNurseAvatar = currentNurseAvatar,
                IncomingNurseName = otherNurse?.Name ?? "On-Call Nurse",
                IncomingNurseRole = otherNurse?.Role ?? "Staff Nurse",
                IncomingNurseAvatar = otherNurse?.Avatar ?? string.Empty,
                PatientsAssignedCount = patientSummaries.Count,
                HighPriorityPatientsCount = patientSummaries.Count(p => p.priority == "High" || p.priority == "Critical"),
                PendingTasksCount = pendingTasks.Count,
                NewAlertsCount = recentAlerts.Count,
                CompletedSectionsCount = 3,
                TotalSectionsCount = 4,
                CompletionPercentage = 75,
                HandoverNotes = string.Empty,
                Status = "Draft",
                HandoverDateText = nowLocal.ToString("MMM dd, yyyy"),
                HandoverTimeText = nowLocal.ToString("hh:mm tt"),
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };
            _context.ShiftHandovers.Add(handover);
            await _context.SaveChangesAsync();
        }
        else
        {
            // Keep stats current in draft
            handover.PatientsAssignedCount = patientSummaries.Count;
            handover.HighPriorityPatientsCount = patientSummaries.Count(p => p.priority == "High" || p.priority == "Critical");
            handover.PendingTasksCount = pendingTasks.Count;
            handover.NewAlertsCount = recentAlerts.Count;
            if (!string.IsNullOrEmpty(currentNurseName) && string.IsNullOrEmpty(handover.OutgoingNurseName))
            {
                handover.OutgoingNurseName = currentNurseName;
                handover.OutgoingNurseRole = currentNurseRole;
                handover.OutgoingNurseAvatar = currentNurseAvatar;
            }
            handover.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            success = true,
            data = new
            {
                handover,
                patientSummaries,
                pendingTasks,
                recentAlerts,
                metrics = new
                {
                    patientsAssigned = patientSummaries.Count,
                    highPriority = patientSummaries.Count(p => p.priority == "High" || p.priority == "Critical"),
                    pendingTasks = pendingTasks.Count,
                    newAlerts = recentAlerts.Count
                }
            }
        });
    }

    [HttpPost("save-draft")]
    public async Task<IActionResult> SaveDraft([FromBody] SaveHandoverDraftRequest request)
    {
        var handover = await _context.ShiftHandovers
            .Where(s => s.Status == "Draft")
            .OrderByDescending(s => s.UpdatedDate)
            .FirstOrDefaultAsync();

        if (handover == null)
        {
            handover = new ShiftHandoverRecord
            {
                Id = Guid.NewGuid(),
                HandoverIdCode = $"SHO-{DateTime.UtcNow:MMdd}-{new Random().Next(100, 999)}",
                Status = "Draft",
                CreatedDate = DateTime.UtcNow
            };
            _context.ShiftHandovers.Add(handover);
        }

        if (request.Notes != null) handover.HandoverNotes = request.Notes;
        if (!string.IsNullOrWhiteSpace(request.OutgoingNurseName)) handover.OutgoingNurseName = request.OutgoingNurseName;
        if (!string.IsNullOrWhiteSpace(request.OutgoingNurseRole)) handover.OutgoingNurseRole = request.OutgoingNurseRole;
        if (!string.IsNullOrWhiteSpace(request.OutgoingNurseAvatar)) handover.OutgoingNurseAvatar = request.OutgoingNurseAvatar;
        if (!string.IsNullOrWhiteSpace(request.IncomingNurseName)) handover.IncomingNurseName = request.IncomingNurseName;
        if (!string.IsNullOrWhiteSpace(request.IncomingNurseRole)) handover.IncomingNurseRole = request.IncomingNurseRole;
        if (!string.IsNullOrWhiteSpace(request.IncomingNurseAvatar)) handover.IncomingNurseAvatar = request.IncomingNurseAvatar;
        if (!string.IsNullOrWhiteSpace(request.CurrentShift)) handover.CurrentShift = request.CurrentShift;
        if (!string.IsNullOrWhiteSpace(request.HandoverToShift)) handover.HandoverToShift = request.HandoverToShift;

        handover.HandoverDateText = DateTime.Now.ToString("MMM dd, yyyy");
        handover.HandoverTimeText = DateTime.Now.ToString("hh:mm tt");
        handover.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { success = true, data = handover, message = "Handover draft saved successfully" });
    }

    [HttpPost("save-notes")]
    public async Task<IActionResult> SaveNotes([FromBody] SaveNotesRequest request)
    {
        var handover = await _context.ShiftHandovers
            .Where(s => s.Status == "Draft")
            .OrderByDescending(s => s.UpdatedDate)
            .FirstOrDefaultAsync();

        if (handover != null)
        {
            handover.HandoverNotes = request.Notes;
            handover.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        return Ok(new { success = true, message = "Handover notes saved successfully" });
    }

    [HttpPost("complete")]
    public async Task<IActionResult> CompleteHandover([FromBody] CompleteHandoverRequest? request)
    {
        var handover = await _context.ShiftHandovers
            .Where(s => s.Status == "Draft")
            .OrderByDescending(s => s.UpdatedDate)
            .FirstOrDefaultAsync();

        if (handover == null)
        {
            handover = new ShiftHandoverRecord
            {
                Id = Guid.NewGuid(),
                HandoverIdCode = $"SHO-{DateTime.UtcNow:MMdd}-{new Random().Next(100, 999)}",
                CreatedDate = DateTime.UtcNow
            };
            _context.ShiftHandovers.Add(handover);
        }

        if (request != null)
        {
            if (!string.IsNullOrWhiteSpace(request.Notes)) handover.HandoverNotes = request.Notes;
            if (!string.IsNullOrWhiteSpace(request.OutgoingNurseName)) handover.OutgoingNurseName = request.OutgoingNurseName;
            if (!string.IsNullOrWhiteSpace(request.OutgoingNurseRole)) handover.OutgoingNurseRole = request.OutgoingNurseRole;
            if (!string.IsNullOrWhiteSpace(request.OutgoingNurseAvatar)) handover.OutgoingNurseAvatar = request.OutgoingNurseAvatar;
            if (!string.IsNullOrWhiteSpace(request.IncomingNurseName)) handover.IncomingNurseName = request.IncomingNurseName;
            if (!string.IsNullOrWhiteSpace(request.IncomingNurseRole)) handover.IncomingNurseRole = request.IncomingNurseRole;
            if (!string.IsNullOrWhiteSpace(request.IncomingNurseAvatar)) handover.IncomingNurseAvatar = request.IncomingNurseAvatar;
            if (!string.IsNullOrWhiteSpace(request.CurrentShift)) handover.CurrentShift = request.CurrentShift;
            if (!string.IsNullOrWhiteSpace(request.HandoverToShift)) handover.HandoverToShift = request.HandoverToShift;
        }

        // Mark any tasks checked as completed
        if (request?.CompletedTaskIds != null && request.CompletedTaskIds.Any())
        {
            var tasksToComplete = await _context.Tasks.Where(t => request.CompletedTaskIds.Contains(t.Id)).ToListAsync();
            foreach (var t in tasksToComplete)
            {
                t.Status = TaskStatusItem.Completed;
                t.StatusStr = "Completed";
                t.UpdatedDate = DateTime.UtcNow;
            }
        }

        handover.Status = "Completed";
        handover.CompletionPercentage = 100;
        handover.CompletedSectionsCount = 4;
        handover.TotalSectionsCount = 4;
        handover.HandoverDateText = DateTime.Now.ToString("MMM dd, yyyy");
        handover.HandoverTimeText = DateTime.Now.ToString("hh:mm tt");
        handover.UpdatedDate = DateTime.UtcNow;

        // Snapshot patient records for this handover
        var inCarePatients = await _context.Patients
            .Where(p => p.Status == PatientStatus.InCare)
            .OrderBy(p => p.Name)
            .Take(25)
            .ToListAsync();

        handover.PatientsAssignedCount = inCarePatients.Count;
        handover.HighPriorityPatientsCount = inCarePatients.Count(p => p.RiskLevel == AlertSeverity.High || p.RiskLevel == AlertSeverity.Critical);

        foreach (var p in inCarePatients)
        {
            var patientSnapshot = new ShiftHandoverPatientRecord
            {
                Id = Guid.NewGuid(),
                HandoverId = handover.Id,
                PatientId = p.Id,
                PatientName = p.Name,
                PatientIdCode = p.PatientIdCode,
                PatientAvatar = p.Avatar,
                AgeGender = p.AgeGender,
                RoomNumber = p.FloorRoom,
                CareUnit = p.CareUnit,
                ConditionStatus = p.Status == PatientStatus.InCare ? "Stable" : p.Status.ToString(),
                ConditionSubtitle = !string.IsNullOrEmpty(p.DischargePlan) ? p.DischargePlan : "In Monitoring",
                PendingTasksCount = _context.Tasks.Count(t => t.PatientId == p.Id && t.Status != TaskStatusItem.Completed),
                SpecialInstructions = !string.IsNullOrEmpty(p.AdditionalNotes) ? p.AdditionalNotes : "Routine vitals observation",
                Priority = p.RiskLevel.ToString(),
                CreatedDate = DateTime.UtcNow
            };
            _context.ShiftHandoverPatientRecords.Add(patientSnapshot);
        }

        await _context.SaveChangesAsync();

        // Dispatch in-app notification
        try
        {
            await _notificationService.DispatchNotificationAsync(
                title: "Shift Handover Completed",
                message: $"Shift handover report from {handover.OutgoingNurseName} ({handover.CurrentShift}) to {handover.IncomingNurseName} ({handover.HandoverToShift}) is finalized.",
                type: "ShiftHandover",
                severity: "Medium",
                actionUrl: "/shift-handover",
                userRole: "Nurse",
                roomLocation: "General Ward",
                relatedEntityId: handover.Id.ToString(),
                relatedEntityType: "ShiftHandoverRecord"
            );
        }
        catch { /* ignore */ }

        // Automatically initialize the next fresh draft for the next shift rotation
        var nextDraft = new ShiftHandoverRecord
        {
            Id = Guid.NewGuid(),
            HandoverIdCode = $"SHO-{DateTime.UtcNow:MMdd}-{new Random().Next(100, 999)}",
            CurrentShift = handover.HandoverToShift,
            HandoverToShift = handover.CurrentShift,
            OutgoingNurseName = handover.IncomingNurseName,
            OutgoingNurseRole = handover.IncomingNurseRole,
            OutgoingNurseAvatar = handover.IncomingNurseAvatar,
            IncomingNurseName = string.Empty,
            Status = "Draft",
            HandoverDateText = DateTime.Now.ToString("MMM dd, yyyy"),
            HandoverTimeText = DateTime.Now.ToString("hh:mm tt"),
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };
        _context.ShiftHandovers.Add(nextDraft);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = handover, message = "Shift handover completed successfully" });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHandoverHistory()
    {
        var list = await _context.ShiftHandovers
            .Where(s => s.Status == "Completed")
            .OrderByDescending(s => s.UpdatedDate)
            .Take(50)
            .ToListAsync();

        return Ok(new { success = true, data = list });
    }

    [HttpGet("received")]
    public async Task<IActionResult> GetReceivedHandovers([FromQuery] string? nurseName)
    {
        var query = _context.ShiftHandovers
            .Where(s => s.Status == "Completed");

        if (!string.IsNullOrWhiteSpace(nurseName))
        {
            var lower = nurseName.Trim().ToLower();
            query = query.Where(s => s.IncomingNurseName.ToLower().Contains(lower));
        }

        var list = await query
            .OrderByDescending(s => s.UpdatedDate)
            .Take(50)
            .ToListAsync();

        return Ok(new { success = true, data = list });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetHandoverById(Guid id)
    {
        var handover = await _context.ShiftHandovers.FirstOrDefaultAsync(s => s.Id == id);
        if (handover == null)
        {
            return NotFound(new { success = false, message = "Shift handover not found" });
        }

        var patientSnapshots = await _context.ShiftHandoverPatientRecords
            .Where(sp => sp.HandoverId == id)
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                handover,
                patientSnapshots
            }
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHandover(Guid id)
    {
        var handover = await _context.ShiftHandovers.FirstOrDefaultAsync(s => s.Id == id);
        if (handover == null)
        {
            return NotFound(new { success = false, message = "Handover not found" });
        }

        var snapshots = await _context.ShiftHandoverPatientRecords.Where(sp => sp.HandoverId == id).ToListAsync();
        _context.ShiftHandoverPatientRecords.RemoveRange(snapshots);
        _context.ShiftHandovers.Remove(handover);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Handover deleted successfully" });
    }
}

