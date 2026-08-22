using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Services;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.Dashboard.DTOs;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ConnectedCareDbContext _context;

    public DashboardController(IDashboardService dashboardService, ConnectedCareDbContext context)
    {
        _dashboardService = dashboardService;
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _dashboardService.GetSummaryAsync();
        return Ok(ApiResponse<DashboardSummaryDto>.Ok(summary));
    }

    [HttpGet("alerts-summary")]
    public async Task<IActionResult> GetAlertsSummary()
    {
        var summary = await _dashboardService.GetAlertSummaryAsync();
        return Ok(ApiResponse<AlertSummaryDto>.Ok(summary));
    }

    [HttpGet("patient-status")]
    public async Task<IActionResult> GetPatientStatus()
    {
        var status = await _dashboardService.GetPatientStatusAsync();
        return Ok(ApiResponse<PatientStatusDto>.Ok(status));
    }

    [HttpGet("recent-alerts")]
    public async Task<IActionResult> GetRecentAlerts()
    {
        var alerts = await _dashboardService.GetRecentAlertsAsync();
        return Ok(ApiResponse<List<RecentAlertItemDto>>.Ok(alerts));
    }

    [HttpGet("integrations")]
    public async Task<IActionResult> GetIntegrations()
    {
        var integrations = await _dashboardService.GetIntegrationsAsync();
        return Ok(ApiResponse<List<IntegrationItemDto>>.Ok(integrations));
    }

    [HttpGet("nurse-overview")]
    public async Task<IActionResult> GetNurseOverview([FromQuery] Guid? nurseId)
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
                                var n = await _context.Nurses.FirstOrDefaultAsync(n => n.UserId == uid || n.Email.ToLower() == user.Email.ToLower() || n.Name.ToLower() == user.FullName.ToLower() || n.Name.ToLower() == user.Username.ToLower());
                                if (n == null && (user.Role == "Nurse" || user.Role.Contains("Nurse")))
                                {
                                    n = new Nurse
                                    {
                                        UserId = user.Id,
                                        NurseIdCode = $"NRS-{Random.Shared.Next(1000, 9999)}",
                                        Name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username,
                                        Email = user.Email,
                                        Phone = !string.IsNullOrWhiteSpace(user.Phone) ? user.Phone : "(512) 555-0100",
                                        Avatar = !string.IsNullOrWhiteSpace(user.Avatar) ? user.Avatar : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
                                        Department = "General Ward",
                                        SubUnit = "Floor 2",
                                        Location = "Main Campus",
                                        Shift = "Day Shift (08:00 AM - 04:00 PM)",
                                        Status = DoctorStatus.Active,
                                        CreatedDate = DateTime.UtcNow,
                                        UpdatedDate = DateTime.UtcNow
                                    };
                                    _context.Nurses.Add(n);
                                    await _context.SaveChangesAsync();
                                }
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

        var patients = await _context.Patients
            .Where(p => assignedPatientIds.Contains(p.Id))
            .ToListAsync();

        var totalPatients = patients.Count;
        var inpatientsCount = patients.Count(p => p.Status == PatientStatus.InCare || p.Status == PatientStatus.Admitted);
        var outpatientsCount = totalPatients - inpatientsCount;

        var tasks = await _context.Tasks
            .Where(t => t.PatientId != null && assignedPatientIds.Contains(t.PatientId.Value))
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();

        var tasksTotal = tasks.Count;
        var tasksPending = tasks.Count(t => t.Status != TaskStatusItem.Completed && t.StatusStr != "Completed");
        var tasksCompleted = tasks.Count(t => t.Status == TaskStatusItem.Completed || t.StatusStr == "Completed");

        var medications = await _context.MedicationRecords
            .Where(m => m.PatientId != null && assignedPatientIds.Contains(m.PatientId.Value))
            .OrderByDescending(m => m.CreatedDate)
            .ToListAsync();

        var medsDueTotal = medications.Count;
        var medsOverdue = medications.Count(m => m.Status.Equals("Overdue", StringComparison.OrdinalIgnoreCase) || m.Status.Equals("Late", StringComparison.OrdinalIgnoreCase));
        var medsUpcoming = medsDueTotal - medsOverdue;

        var alerts = await _context.Alerts
            .Where(a => a.PatientId != null && assignedPatientIds.Contains(a.PatientId.Value) && !a.IsAcknowledged)
            .OrderByDescending(a => a.CreatedDate)
            .ToListAsync();

        var alertsTotal = alerts.Count;
        var alertsCritical = alerts.Count(a => a.Severity == AlertSeverity.Critical);
        var alertsHigh = alerts.Count(a => a.Severity == AlertSeverity.High);

        var vitals = await _context.VitalRounds
            .Where(v => v.PatientId != null && assignedPatientIds.Contains(v.PatientId.Value))
            .ToListAsync();

        var roundsCompleted = vitals.Count;
        var roundsTotal = Math.Max(roundsCompleted, totalPatients * 2);

        // Group Care Types
        var careTypes = patients
            .GroupBy(p => string.IsNullOrWhiteSpace(p.CareUnit) ? "General Ward" : p.CareUnit)
            .Select(g => new NurseCategoryStatDto
            {
                Name = g.Key,
                Value = g.Count(),
                Color = g.Key.Contains("ICU", StringComparison.OrdinalIgnoreCase) ? "#3B82F6" :
                        g.Key.Contains("Surg", StringComparison.OrdinalIgnoreCase) ? "#10B981" :
                        g.Key.Contains("Cardio", StringComparison.OrdinalIgnoreCase) ? "#EF4444" :
                        g.Key.Contains("Mat", StringComparison.OrdinalIgnoreCase) ? "#F59E0B" : "#6366F1"
            })
            .ToList();

        // Group Priorities
        var priorities = patients
            .GroupBy(p => p.RiskLevel.ToString())
            .Select(g => new NurseCategoryStatDto
            {
                Name = g.Key,
                Value = g.Count(),
                Color = g.Key == "Critical" ? "#EF4444" :
                        g.Key == "High" ? "#F59E0B" :
                        g.Key == "Medium" ? "#10B981" : "#3B82F6"
            })
            .ToList();

        var upcomingMedications = medications.Take(5).Select(m => new NurseUpcomingMedicationDto
        {
            Time = !string.IsNullOrEmpty(m.NextDoseTime) ? m.NextDoseTime : (!string.IsNullOrEmpty(m.RelativeTimeText) ? m.RelativeTimeText : m.CreatedDate.ToString("hh:mm tt")),
            MedicationName = $"{m.Name} {m.Dosage}".Trim(),
            PatientNameLocation = $"{m.PatientName} • {(m.Patient != null ? m.Patient.FloorRoom : "Assigned Room")}",
            DueText = m.Status,
            ColorClass = m.Status.Equals("Overdue", StringComparison.OrdinalIgnoreCase) ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-blue-50 text-blue-700 border-blue-200"
        }).ToList();

        var myTasks = tasks.Take(5).Select(t => new NurseTaskItemDto
        {
            Id = Math.Abs(t.Id.GetHashCode() % 100000),
            Text = t.Title,
            PatientName = t.PatientName,
            DueText = !string.IsNullOrEmpty(t.DueTime) ? t.DueTime : "Today",
            DueColorClass = t.IsOverdue ? "text-rose-600" : "text-amber-600",
            IsCompleted = t.Status == TaskStatusItem.Completed || t.StatusStr == "Completed"
        }).ToList();

        var latestAlerts = alerts.Take(5).Select(a => new NurseAlertDto
        {
            Severity = a.Severity.ToString(),
            Title = a.Title,
            PatientLocation = $"{a.PatientName} • {a.RoomLocation}",
            TimeText = a.TimestampText,
            ColorClass = a.Severity == AlertSeverity.Critical ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-amber-50 border-amber-200 text-amber-700"
        }).ToList();

        var dto = new NurseDashboardDto
        {
            TotalPatients = totalPatients,
            InpatientsCount = inpatientsCount,
            OutpatientsCount = outpatientsCount,
            TasksTotal = tasksTotal,
            TasksPending = tasksPending,
            TasksCompleted = tasksCompleted,
            MedicationsDueTotal = medsDueTotal,
            MedicationsOverdue = medsOverdue,
            MedicationsUpcoming = medsUpcoming,
            AlertsTotal = alertsTotal,
            AlertsCritical = alertsCritical,
            AlertsHigh = alertsHigh,
            RoundsCompleted = roundsCompleted,
            RoundsTotal = roundsTotal,
            AdmissionsToday = patients.Count(p => p.CreatedDate.Date == DateTime.UtcNow.Date),
            DischargesToday = patients.Count(p => p.Status == PatientStatus.Discharged),
            TransfersToday = 0,
            CareTypes = careTypes,
            Priorities = priorities,
            UpcomingMedications = upcomingMedications,
            MyTasks = myTasks,
            LatestAlerts = latestAlerts
        };

        return Ok(ApiResponse<NurseDashboardDto>.Ok(dto));
    }
}



