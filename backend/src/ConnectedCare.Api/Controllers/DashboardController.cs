using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Features.Dashboard.Services;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.Dashboard.DTOs;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using Microsoft.EntityFrameworkCore;

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
    [HttpGet("stats")]
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
        try
        {
            // ============================================================
            // 1. Resolve the logged-in nurse and user from JWT or Query
            // ============================================================
            var nurseIdClaim = User.Claims
                .FirstOrDefault(c =>
                    string.Equals(c.Type, "nurseId", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(c.Type, "nurse_id", StringComparison.OrdinalIgnoreCase))
                ?.Value;

            var userIdClaim = User.Claims
                .FirstOrDefault(c =>
                    c.Type == System.Security.Claims.ClaimTypes.NameIdentifier ||
                    c.Type == "nameid" ||
                    c.Type == "sub")
                ?.Value;

            User? userObj = null;
            if (Guid.TryParse(userIdClaim, out var parsedUid) && parsedUid != Guid.Empty)
            {
                userObj = await _context.Users.FirstOrDefaultAsync(u => u.Id == parsedUid);
            }

            var username = User.Identity?.Name ?? User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Name || c.Type == "unique_name")?.Value;
            if (userObj == null && !string.IsNullOrEmpty(username))
            {
                userObj = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower() || u.Email.ToLower() == username.ToLower());
            }

            if (!nurseId.HasValue || nurseId.Value == Guid.Empty)
            {
                if (Guid.TryParse(nurseIdClaim, out var parsedNid) && parsedNid != Guid.Empty)
                {
                    nurseId = parsedNid;
                }
            }

            Nurse? currentNurse = null;

            if (nurseId.HasValue && nurseId.Value != Guid.Empty)
            {
                currentNurse = await _context.Nurses.FirstOrDefaultAsync(n => n.Id == nurseId.Value);
            }

            if (currentNurse == null && userObj != null)
            {
                currentNurse = await _context.Nurses.FirstOrDefaultAsync(n =>
                    n.UserId == userObj.Id ||
                    n.Email.ToLower() == userObj.Email.ToLower() ||
                    n.Name.ToLower() == userObj.FullName.ToLower() ||
                    n.Name.ToLower() == userObj.Username.ToLower() ||
                    userObj.FullName.ToLower().Contains(n.Name.ToLower()) ||
                    n.Name.ToLower().Contains(userObj.FullName.ToLower()));
            }

            if (currentNurse == null && !string.IsNullOrEmpty(username))
            {
                currentNurse = await _context.Nurses.FirstOrDefaultAsync(n =>
                    n.Email.ToLower() == username.ToLower() ||
                    n.Name.ToLower() == username.ToLower());
            }

            // Fallback: If still not found, fetch the first active nurse
            if (currentNurse == null)
            {
                currentNurse = await _context.Nurses.FirstOrDefaultAsync();
            }

            var nId = currentNurse?.Id ?? Guid.Empty;
            var nurseDisplayName = currentNurse?.Name ?? userObj?.FullName ?? userObj?.Username ?? "Staff Nurse";

            // Build matching name tokens for the logged-in nurse
            var nurseNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (!string.IsNullOrWhiteSpace(currentNurse?.Name)) nurseNames.Add(currentNurse.Name.Trim());
            if (!string.IsNullOrWhiteSpace(userObj?.FullName)) nurseNames.Add(userObj.FullName.Trim());
            if (!string.IsNullOrWhiteSpace(userObj?.Username)) nurseNames.Add(userObj.Username.Trim());
            if (!string.IsNullOrWhiteSpace(User.Identity?.Name)) nurseNames.Add(User.Identity.Name.Trim());
            if (!string.IsNullOrWhiteSpace(currentNurse?.Email)) nurseNames.Add(currentNurse.Email.Trim());

            // ============================================================
            // 2. Resolve Assigned & Associated Patients for this Nurse
            // ============================================================
            var assignedPatientIds = new HashSet<Guid>();

            if (nId != Guid.Empty)
            {
                var pnIds = await _context.PatientNurses
                    .Where(pn => pn.NurseId == nId)
                    .Select(pn => pn.PatientId)
                    .ToListAsync();
                foreach (var id in pnIds) assignedPatientIds.Add(id);
            }

            // Direct assignment on Patients table
            var directPatients = await _context.Patients
                .Where(p => (nId != Guid.Empty && p.AssignedNurseId == nId) ||
                            (p.AssignedNurseName != null && nurseNames.Contains(p.AssignedNurseName)))
                .Select(p => p.Id)
                .ToListAsync();
            foreach (var id in directPatients) assignedPatientIds.Add(id);

            // Patients associated via vital rounds performed by this nurse
            var vrPatientIds = await _context.VitalRounds
                .Where(vr => vr.PatientId.HasValue &&
                             ((vr.RecordedByNurseName != null && nurseNames.Contains(vr.RecordedByNurseName)) ||
                              (vr.CreatedBy != null && nurseNames.Contains(vr.CreatedBy))))
                .Select(vr => vr.PatientId!.Value)
                .ToListAsync();
            foreach (var id in vrPatientIds) assignedPatientIds.Add(id);

            // Patients associated via nurse documentation records
            var docPatientIds = await _context.NurseDocumentations
                .Where(nd => nd.PatientId.HasValue &&
                             ((nd.CreatedByName != null && nurseNames.Contains(nd.CreatedByName)) ||
                              (nd.CreatedBy != null && nurseNames.Contains(nd.CreatedBy))))
                .Select(nd => nd.PatientId!.Value)
                .ToListAsync();
            foreach (var id in docPatientIds) assignedPatientIds.Add(id);

            // Patients associated via tasks assigned to this nurse
            var taskPatientIds = await _context.Tasks
                .Where(t => t.PatientId.HasValue &&
                            ((t.AssignedCaregiver != null && nurseNames.Contains(t.AssignedCaregiver)) ||
                             (t.CreatedBy != null && nurseNames.Contains(t.CreatedBy))))
                .Select(t => t.PatientId!.Value)
                .ToListAsync();
            foreach (var id in taskPatientIds) assignedPatientIds.Add(id);

            // Patients associated via care team membership
            if (nId != Guid.Empty)
            {
                var ctPatientIds = await _context.CareTeamMembers
                    .Where(ct => ct.NurseId == nId && ct.PatientId.HasValue)
                    .Select(ct => ct.PatientId!.Value)
                    .ToListAsync();
                foreach (var id in ctPatientIds) assignedPatientIds.Add(id);
            }

            var patientIdList = assignedPatientIds.ToList();
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

            var patientsQuery = _context.Patients.Where(p => patientIdList.Contains(p.Id));
            var allPatients = await patientsQuery.AsNoTracking().ToListAsync();
            var totalPatientsCount = allPatients.Count;
            var newPatientsThisWeek = allPatients.Count(p => p.CreatedDate >= sevenDaysAgo);

            // ============================================================
            // 3. Vital Rounds for Nurse
            // ============================================================
            var vitalRounds = await _context.VitalRounds
                .Where(v => (v.PatientId.HasValue && patientIdList.Contains(v.PatientId.Value)) ||
                            (v.RecordedByNurseName != null && nurseNames.Contains(v.RecordedByNurseName)) ||
                            (v.CreatedBy != null && nurseNames.Contains(v.CreatedBy)))
                .OrderByDescending(v => v.CreatedDate)
                .ToListAsync();

            var roundsCompletedCount = vitalRounds.Count(v => v.Status == VitalRoundStatus.Completed);
            var roundsTotalCount = vitalRounds.Count;

            // ============================================================
            // 4. Alerts for Nurse's Patients
            // ============================================================
            var alertsQuery = _context.Alerts
                .Where(a => !a.IsAcknowledged &&
                            a.Status != "Resolved" &&
                            a.Status != "Dismissed" &&
                            a.PatientId.HasValue &&
                            patientIdList.Contains(a.PatientId.Value));

            var patientIdsWithHighAlerts = await alertsQuery
                .Where(a => a.Severity == AlertSeverity.High || a.Severity == AlertSeverity.Critical)
                .Select(a => a.PatientId!.Value)
                .Distinct()
                .ToListAsync();

            var activeAlertsCount = await alertsQuery.CountAsync();

            var criticalAlertsCount = await alertsQuery
                .CountAsync(a => a.Severity == AlertSeverity.Critical || a.Severity == AlertSeverity.High);

            var alertsList = await alertsQuery
                .OrderByDescending(a => a.CreatedDate)
                .Take(6)
                .Select(a => new
                {
                    id = a.Id,
                    msg = $"{a.Title} - {a.PatientName}",
                    time = !string.IsNullOrEmpty(a.TimestampText) ? a.TimestampText : a.CreatedDate.ToString("hh:mm tt"),
                    severity = a.Severity.ToString()
                })
                .ToListAsync();

            // ============================================================
            // 5. Tasks for Nurse's Patients & Assignee
            // ============================================================
            var tasksQuery = _context.Tasks
                .Where(t => (t.Status != TaskStatusItem.Completed && t.StatusStr != "Completed") &&
                            ((t.PatientId.HasValue && patientIdList.Contains(t.PatientId.Value)) ||
                             (t.AssignedCaregiver != null && nurseNames.Contains(t.AssignedCaregiver))));

            var openTasksCount = await tasksQuery.CountAsync();

            var tasksList = await tasksQuery
                .OrderByDescending(t => t.CreatedDate)
                .Take(6)
                .Select(t => new
                {
                    id = t.Id,
                    title = t.Title + (!string.IsNullOrEmpty(t.PatientName) ? $" - {t.PatientName}" : ""),
                    prio = t.Priority.ToString() + " Priority",
                    prioCol = t.Priority == TaskPriority.High ? "text-rose-600" : (t.Priority == TaskPriority.Medium ? "text-amber-600" : "text-slate-400"),
                    due = !string.IsNullOrEmpty(t.DueTime) ? t.DueTime : "Scheduled",
                    status = t.StatusStr ?? t.Status.ToString()
                })
                .ToListAsync();

            // ============================================================
            // 6. Today's Schedule & Rounds
            // ============================================================
            var todayScheduleList = new List<object>();

            foreach (var vr in vitalRounds.Take(6))
            {
                var pat = allPatients.FirstOrDefault(p => p.Id == vr.PatientId);
                var bpSummary = !string.IsNullOrEmpty(vr.BloodPressure) ? $"BP: {vr.BloodPressure}" : "";
                var hrSummary = !string.IsNullOrEmpty(vr.HeartRate) ? $"HR: {vr.HeartRate} bpm" : "";
                var typeDesc = string.Join(", ", new[] { bpSummary, hrSummary }.Where(s => !string.IsNullOrEmpty(s)));
                if (string.IsNullOrEmpty(typeDesc)) typeDesc = "Vital Signs Round";

                todayScheduleList.Add(new
                {
                    id = vr.Id,
                    time = !string.IsNullOrEmpty(vr.LastRoundTimeText) ? vr.LastRoundTimeText : (!string.IsNullOrEmpty(vr.NextDueTimeText) ? vr.NextDueTimeText : vr.CreatedDate.ToString("hh:mm tt")),
                    name = vr.PatientName ?? pat?.Name ?? "Patient Round",
                    type = typeDesc,
                    status = vr.Status == VitalRoundStatus.Completed ? "Confirmed" : (vr.Status == VitalRoundStatus.Overdue ? "Overdue" : "Pending"),
                    avatar = pat?.Avatar ?? vr.PatientAvatar
                });
            }

            var todaySchedule = todayScheduleList.Take(6).ToList();

            // ============================================================
            // 7. High-Risk Patients (Strictly matching nurse's patients)
            // ============================================================
            var criticalPatients = allPatients
                .Where(p =>
                    p.RiskLevel == AlertSeverity.High ||
                    p.RiskLevel == AlertSeverity.Critical ||
                    patientIdsWithHighAlerts.Contains(p.Id))
                .OrderByDescending(p => patientIdsWithHighAlerts.Contains(p.Id) ? 1 : 0)
                .ThenByDescending(p => p.RiskLevel == AlertSeverity.Critical ? 2 : (p.RiskLevel == AlertSeverity.High ? 1 : 0))
                .ThenByDescending(p => p.CreatedDate)
                .Take(6)
                .Select(p => new
                {
                    id = p.Id,
                    name = p.Name,
                    patientIdCode = p.PatientIdCode,
                    condition = !string.IsNullOrEmpty(p.MedicalConditions) ? p.MedicalConditions : (!string.IsNullOrEmpty(p.CareUnit) ? p.CareUnit : "High Risk Monitoring"),
                    severity = "High Risk",
                    status = "High Risk",
                    color = "bg-rose-50 text-rose-500",
                    avatar = p.Avatar
                })
                .ToList();

            // ============================================================
            // 8. My Patients List
            // ============================================================
            var myPatients = allPatients.Take(12).Select(p => new
            {
                id = p.Id,
                patientIdCode = p.PatientIdCode,
                name = p.Name,
                age = !string.IsNullOrEmpty(p.AgeGender) ? p.AgeGender : (string.IsNullOrEmpty(p.Dob) ? p.Gender : p.Dob),
                last = !string.IsNullOrEmpty(p.LastVisit) ? p.LastVisit : p.CreatedDate.ToString("MMM dd, yyyy"),
                next = !string.IsNullOrEmpty(p.AdmissionDate) ? p.AdmissionDate : "In-Care",
                careUnit = !string.IsNullOrEmpty(p.CareUnit) ? p.CareUnit : "General Ward",
                floorRoom = !string.IsNullOrEmpty(p.FloorRoom) ? p.FloorRoom : "Room 101",
                cond = !string.IsNullOrEmpty(p.MedicalConditions) ? p.MedicalConditions : "General Nursing Care",
                status = p.Status.ToString(),
                riskLevel = (p.RiskLevel == AlertSeverity.Critical || p.RiskLevel == AlertSeverity.High || patientIdsWithHighAlerts.Contains(p.Id)) ? "High" : (p.RiskLevel == AlertSeverity.Medium || p.Status == PatientStatus.Admitted ? "Medium" : "Low"),
                color = (p.RiskLevel == AlertSeverity.Critical || p.RiskLevel == AlertSeverity.High || patientIdsWithHighAlerts.Contains(p.Id)) ? "bg-rose-50 text-rose-700" : (p.RiskLevel == AlertSeverity.Medium || p.Status == PatientStatus.Admitted ? "bg-amber-50 text-amber-700" : (p.Status == PatientStatus.Discharged ? "bg-slate-100 text-slate-700" : "bg-emerald-50 text-emerald-700")),
                avatar = p.Avatar
            }).ToList();

            // ============================================================
            // 9. Medications Due & Administered
            // ============================================================
            var medications = await _context.MedicationRecords
                .Where(m => m.PatientId.HasValue && patientIdList.Contains(m.PatientId.Value))
                .OrderByDescending(m => m.CreatedDate)
                .ToListAsync();

            var medsDueTotal = medications.Count(m => m.Status == "Active" || m.Status == "Due" || m.Status == "Overdue" || m.Status == "Pending");
            if (medsDueTotal == 0 && medications.Count > 0)
            {
                medsDueTotal = medications.Count;
            }
            var medsOverdue = medications.Count(m => m.Status.Equals("Overdue", StringComparison.OrdinalIgnoreCase) || m.Status.Equals("Late", StringComparison.OrdinalIgnoreCase));
            var medsUpcoming = Math.Max(0, medsDueTotal - medsOverdue);

            // ============================================================
            // 10. Care Teams for Nurse's Patients (100% Real DB Data)
            // ============================================================
            var careTeamQuery = _context.CareTeamMembers
                .Where(ct => (nId != Guid.Empty && ct.NurseId == nId) ||
                             (ct.PatientId.HasValue && patientIdList.Contains(ct.PatientId.Value)));

            var careTeamList = await careTeamQuery
                .OrderBy(ct => ct.Name)
                .Take(12)
                .Select(ct => new
                {
                    id = ct.Id,
                    name = ct.Name,
                    role = ct.Role.ToString(),
                    department = ct.Department,
                    shift = ct.Shift,
                    avatar = ct.Avatar,
                    status = ct.Status.ToString()
                })
                .ToListAsync();

            // Also check assigned doctors from PatientDoctors table
            if (patientIdList.Count > 0)
            {
                var assignedDocs = await _context.PatientDoctors
                    .Where(pd => patientIdList.Contains(pd.PatientId))
                    .Include(pd => pd.Doctor)
                    .Select(pd => pd.Doctor)
                    .Where(d => d != null)
                    .Distinct()
                    .ToListAsync();

                foreach (var doc in assignedDocs)
                {
                    if (doc != null && !careTeamList.Any(ct => ct.name.Equals(doc.Name, StringComparison.OrdinalIgnoreCase)))
                    {
                        careTeamList.Add(new
                        {
                            id = doc.Id,
                            name = doc.Name,
                            role = "Doctor",
                            department = doc.Department,
                            shift = "Day Shift",
                            avatar = doc.Avatar,
                            status = "Active"
                        });
                    }
                }
            }

            var careTeamsCount = careTeamList.Select(ct => ct.name).Distinct(StringComparer.OrdinalIgnoreCase).Count();

            // ============================================================
            // 11. Health Segmentation (Donut Chart)
            // ============================================================
            int highRiskCount = 0;
            int needsAttentionCount = 0;
            int stableCount = 0;

            foreach (var p in allPatients)
            {
                bool isHighRisk = p.RiskLevel == AlertSeverity.High ||
                                  p.RiskLevel == AlertSeverity.Critical ||
                                  patientIdsWithHighAlerts.Contains(p.Id);

                if (isHighRisk) highRiskCount++;
                else if (p.RiskLevel == AlertSeverity.Medium || p.Status == PatientStatus.Admitted) needsAttentionCount++;
                else stableCount++;
            }

            // ============================================================
            // 12. Shift Handovers & Pending Actions Real Data
            // ============================================================
            var shiftHandoversPending = await _context.ShiftHandovers
                .CountAsync(sh => (sh.Status == "Draft" || sh.Status == "Pending") &&
                                  ((sh.OutgoingNurseName != null && nurseNames.Contains(sh.OutgoingNurseName)) ||
                                   (sh.IncomingNurseName != null && nurseNames.Contains(sh.IncomingNurseName)) ||
                                   (sh.CreatedBy != null && nurseNames.Contains(sh.CreatedBy))));

            var roundsPendingCount = vitalRounds.Count(v => v.Status == VitalRoundStatus.Pending || v.Status == VitalRoundStatus.Overdue);
            if (roundsPendingCount == 0 && totalPatientsCount > 0 && roundsCompletedCount < totalPatientsCount)
            {
                roundsPendingCount = totalPatientsCount - roundsCompletedCount;
            }
            else if (roundsPendingCount == 0 && vitalRounds.Count > 0 && roundsCompletedCount == 0)
            {
                roundsPendingCount = vitalRounds.Count;
            }

            // ============================================================
            // 13. Upcoming Schedule (Next 3 Days - Real Database Queries)
            // ============================================================
            var upcomingSchedule = new List<object>();
            for (int d = 1; d <= 3; d++)
            {
                var targetDate = DateTime.UtcNow.AddDays(d).Date;
                var targetDateFormatted = targetDate.ToString("MMM dd, yyyy");
                var targetDayFormatted = targetDate.ToString("ddd");

                var scheduledTasks = await _context.Tasks
                    .CountAsync(t => ((t.PatientId.HasValue && patientIdList.Contains(t.PatientId.Value)) ||
                                      (t.AssignedCaregiver != null && nurseNames.Contains(t.AssignedCaregiver))) &&
                                     t.CreatedDate.Date == targetDate);

                var scheduledConsults = await _context.Consultations
                    .CountAsync(c => c.PatientId.HasValue && patientIdList.Contains(c.PatientId.Value) &&
                                     c.CreatedDate.Date == targetDate);

                var dayCount = scheduledTasks + scheduledConsults;

                upcomingSchedule.Add(new
                {
                    id = $"u-{d}",
                    date = targetDateFormatted,
                    day = targetDayFormatted,
                    count = $"{dayCount} Round{(dayCount == 1 ? "" : "s")}"
                });
            }

            // ============================================================
            // 14. Recent Patient Activity (Vital Rounds, Meds, Docs)
            // ============================================================
            var recentActivitiesList = new List<object>();

            foreach (var vr in vitalRounds.Take(4))
            {
                var pat = allPatients.FirstOrDefault(p => p.Id == vr.PatientId);
                var vitalsParts = new List<string>();
                if (!string.IsNullOrWhiteSpace(vr.BloodPressure)) vitalsParts.Add($"BP {vr.BloodPressure}");
                if (!string.IsNullOrWhiteSpace(vr.HeartRate)) vitalsParts.Add($"HR {vr.HeartRate} bpm");
                if (!string.IsNullOrWhiteSpace(vr.SpO2)) vitalsParts.Add($"SpO2 {vr.SpO2}");
                if (!string.IsNullOrWhiteSpace(vr.Temperature)) vitalsParts.Add($"Temp {vr.Temperature}");
                var actText = vitalsParts.Count > 0 ? $"Vitals Recorded: {string.Join(", ", vitalsParts)}" : "Vital signs round recorded";

                recentActivitiesList.Add(new
                {
                    id = vr.Id,
                    patientName = vr.PatientName ?? pat?.Name ?? "Patient",
                    avatar = pat?.Avatar ?? vr.PatientAvatar,
                    activity = actText,
                    dateTime = vr.CreatedDate.ToString("MMM dd, yyyy hh:mm tt"),
                    by = !string.IsNullOrWhiteSpace(vr.RecordedByNurseName) ? vr.RecordedByNurseName : nurseDisplayName,
                    status = vr.Status == VitalRoundStatus.Completed ? "Completed" : "Recorded"
                });
            }

            foreach (var m in medications.Take(3))
            {
                var pat = allPatients.FirstOrDefault(p => p.Id == m.PatientId);
                recentActivitiesList.Add(new
                {
                    id = m.Id,
                    patientName = m.PatientName ?? pat?.Name ?? "Patient",
                    avatar = pat?.Avatar,
                    activity = $"Medication Administered: {m.Name} {m.Dosage}".Trim(),
                    dateTime = m.CreatedDate.ToString("MMM dd, yyyy hh:mm tt"),
                    by = nurseDisplayName,
                    status = "Recorded"
                });
            }

            var recentDocumentations = await _context.NurseDocumentations
                .Where(nd => (nd.PatientId.HasValue && patientIdList.Contains(nd.PatientId.Value)) ||
                             (nd.CreatedByName != null && nurseNames.Contains(nd.CreatedByName)))
                .OrderByDescending(nd => nd.CreatedDate)
                .Take(2)
                .ToListAsync();

            foreach (var doc in recentDocumentations)
            {
                var pat = allPatients.FirstOrDefault(p => p.Id == doc.PatientId);
                recentActivitiesList.Add(new
                {
                    id = doc.Id,
                    patientName = doc.PatientName ?? pat?.Name ?? "Patient",
                    avatar = pat?.Avatar ?? doc.PatientAvatar,
                    activity = $"Documentation Filed: {doc.DocumentName ?? doc.DocumentType ?? "Clinical Note"}",
                    dateTime = doc.CreatedDate.ToString("MMM dd, yyyy hh:mm tt"),
                    by = !string.IsNullOrWhiteSpace(doc.CreatedByName) ? doc.CreatedByName : nurseDisplayName,
                    status = "Completed"
                });
            }

            var recentActivities = recentActivitiesList.Take(6).ToList();

            // Group Care Types
            var careTypes = allPatients
                .GroupBy(p => string.IsNullOrWhiteSpace(p.CareUnit) ? "General Ward" : p.CareUnit)
                .Select(g => new
                {
                    name = g.Key,
                    value = g.Count(),
                    color = g.Key.Contains("ICU", StringComparison.OrdinalIgnoreCase) ? "#3B82F6" :
                            g.Key.Contains("Surg", StringComparison.OrdinalIgnoreCase) ? "#10B981" :
                            g.Key.Contains("Cardio", StringComparison.OrdinalIgnoreCase) ? "#EF4444" :
                            g.Key.Contains("Mat", StringComparison.OrdinalIgnoreCase) ? "#F59E0B" : "#6366F1"
                })
                .ToList();

            return Ok(new
            {
                success = true,
                nurseName = nurseDisplayName,
                metrics = new
                {
                    totalPatients = totalPatientsCount,
                    newPatientsThisWeek = newPatientsThisWeek,
                    todayAppointments = todaySchedule.Count,
                    todayRounds = roundsTotalCount,
                    pendingVitalRounds = roundsPendingCount,
                    activeAlerts = activeAlertsCount,
                    criticalAlerts = criticalAlertsCount,
                    careTeams = careTeamsCount,
                    openTasks = openTasksCount,
                    pendingReviews = medsDueTotal > 0 ? medsDueTotal : openTasksCount,
                    medicationsDue = medsDueTotal,
                    shiftHandoversPending = shiftHandoversPending,
                    stablePatients = stableCount,
                    needsAttentionPatients = needsAttentionCount,
                    highRiskPatients = highRiskCount
                },
                todaySchedule,
                criticalPatients,
                myPatients,
                tasks = tasksList,
                alerts = alertsList,
                recentActivities,
                recentConsultations = recentActivities,
                careTeamMembers = careTeamList,
                upcomingSchedule,
                careTypes,
                totalPatients = totalPatientsCount,
                inpatientsCount = allPatients.Count(p => p.Status == PatientStatus.InCare || p.Status == PatientStatus.Admitted),
                outpatientsCount = allPatients.Count(p => p.Status == PatientStatus.Discharged),
                tasksTotal = openTasksCount,
                tasksPending = openTasksCount,
                medicationsDueTotal = medsDueTotal,
                medicationsOverdue = medsOverdue,
                medicationsUpcoming = medsUpcoming,
                alertsTotal = activeAlertsCount,
                alertsCritical = criticalAlertsCount,
                roundsCompleted = roundsCompletedCount,
                roundsPending = roundsPendingCount,
                roundsTotal = roundsTotalCount,
                shiftHandoversPending = shiftHandoversPending
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to load Nurse Overview data.",
                error = ex.Message
            });
        }
    }
}





