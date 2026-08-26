using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public ReportsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet("nurse-reports")]
    public async Task<IActionResult> GetNurseReports(
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] string? reportType,
        [FromQuery] string? unit,
        [FromQuery] string? patient,
        [FromQuery] string? shift)
    {
        var query = _context.NurseReports.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "Overview" && category != "All")
        {
            var catLower = category.ToLower().Trim();
            var catSingular = catLower.EndsWith("s") ? catLower[..^1] : catLower;
            var keyWord = catSingular.Replace(" report", "").Trim();

            query = query.Where(r => r.CategoryTab.ToLower() == catLower ||
                                     r.ReportType.ToLower() == catLower ||
                                     r.ReportType.ToLower() == catSingular ||
                                     r.ReportType.ToLower().Contains(keyWord) ||
                                     r.CategoryTab.ToLower().Contains(keyWord));
        }

        if (!string.IsNullOrWhiteSpace(reportType) && reportType != "All")
        {
            var typeLower = reportType.ToLower().Trim();
            query = query.Where(r => r.ReportType.ToLower() == typeLower || r.ReportType.ToLower().Contains(typeLower));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(r => r.ReportName.ToLower().Contains(searchLower) ||
                                     r.Description.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(unit) && unit != "All Units / Floors")
        {
            query = query.Where(r => r.CareUnit == "All Units / Floors" || r.CareUnit == unit);
        }

        if (!string.IsNullOrWhiteSpace(shift) && shift != "All Shift")
        {
            query = query.Where(r => r.Shift == "All Shift" || r.Shift == shift);
        }

        var list = await query.OrderByDescending(r => r.CreatedDate).ToListAsync();
        return Ok(new { success = true, data = list });
    }

    [HttpGet("nurse-stats")]
    public async Task<IActionResult> GetNurseReportStats()
    {
        var total = await _context.NurseReports.CountAsync();
        var patientReports = await _context.NurseReports.CountAsync(r => r.ReportType == "Patient Report");
        var clinicalReports = await _context.NurseReports.CountAsync(r => r.ReportType == "Clinical Report");
        var medicationReports = await _context.NurseReports.CountAsync(r => r.ReportType == "Medication Report");
        var operationalReports = await _context.NurseReports.CountAsync(r => r.ReportType == "Operational Report");

        var pPct = total > 0 ? (int)Math.Round((double)patientReports / total * 100) : 0;
        var cPct = total > 0 ? (int)Math.Round((double)clinicalReports / total * 100) : 0;
        var mPct = total > 0 ? (int)Math.Round((double)medicationReports / total * 100) : 0;
        var oPct = total > 0 ? (int)Math.Round((double)operationalReports / total * 100) : 0;

        return Ok(new
        {
            success = true,
            data = new
            {
                reportsGenerated = total,
                reportsGeneratedChange = total > 0 ? "↑ Active Database Sync" : "No reports recorded",
                patientReports = patientReports,
                patientReportsPercentage = $"{pPct}%",
                clinicalReports = clinicalReports,
                clinicalReportsPercentage = $"{cPct}%",
                medicationReports = medicationReports,
                medicationReportsPercentage = $"{mPct}%",
                operationalReports = operationalReports,
                operationalReportsPercentage = $"{oPct}%"
            }
        });
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetReportsOverview()
    {
        var totalPatients = await _context.Patients.CountAsync();
        var activeEpisodes = await _context.Patients.CountAsync(p => p.Status == PatientStatus.InCare || p.Status == PatientStatus.Admitted);
        var alertsCount = await _context.Alerts.CountAsync(a => !a.IsAcknowledged);
        var tasksDone = await _context.Tasks.CountAsync(t => t.Status == TaskStatusItem.Completed);
        var medsCount = await _context.MedicationRecords.CountAsync();

        var recentActivities = await _context.ActivitySummaryLogs
            .OrderByDescending(a => a.Id)
            .Take(10)
            .ToListAsync();

        var units = await _context.LocationUnits.ToListAsync();
        var occupancyOverview = units.Select(u => new
        {
            unit = u.Name,
            occ = u.UnitsCount,
            occupied = u.UnitsCount.ToString(),
            avail = Math.Max(0, u.Beds - u.UnitsCount),
            available = Math.Max(0, u.Beds - u.UnitsCount).ToString(),
            rate = u.Beds > 0 ? $"{Math.Round((double)u.UnitsCount / u.Beds * 100, 1)}%" : "0%",
            bar = "bg-blue-600"
        }).ToList();

        // Calculate real patient trend for the last 7 days
        var today = DateTime.UtcNow.Date;
        var patientTrend = new List<object>();
        for (int i = 6; i >= 0; i--)
        {
            var dayDate = today.AddDays(-i);
            var nextDay = dayDate.AddDays(1);
            var newP = await _context.Patients.CountAsync(p => p.CreatedDate >= dayDate && p.CreatedDate < nextDay);
            var disP = await _context.DischargeChecklists.CountAsync(d => d.CreatedDate >= dayDate && d.CreatedDate < nextDay && (d.ChecklistStatus == DischargeStatus.Discharged || d.ChecklistStatus == DischargeStatus.Ready));
            patientTrend.Add(new
            {
                date = dayDate.ToString("MMM dd"),
                day = dayDate.ToString("MMM dd"),
                newPatients = newP,
                newP = newP,
                discharged = disP,
                disP = disP
            });
        }

        // Real Alerts by Severity
        var totalAlerts = await _context.Alerts.CountAsync();
        var critCount = await _context.Alerts.CountAsync(a => a.Severity == AlertSeverity.Critical);
        var highCount = await _context.Alerts.CountAsync(a => a.Severity == AlertSeverity.High);
        var medCount = await _context.Alerts.CountAsync(a => a.Severity == AlertSeverity.Medium);
        var lowCount = await _context.Alerts.CountAsync(a => a.Severity == AlertSeverity.Low);

        var alertsBySeverity = new[]
        {
            new { name = "Critical", count = critCount, percentage = totalAlerts > 0 ? $"{Math.Round((double)critCount / totalAlerts * 100, 1)}%" : "0%", color = "#EF4444" },
            new { name = "High", count = highCount, percentage = totalAlerts > 0 ? $"{Math.Round((double)highCount / totalAlerts * 100, 1)}%" : "0%", color = "#F59E0B" },
            new { name = "Medium", count = medCount, percentage = totalAlerts > 0 ? $"{Math.Round((double)medCount / totalAlerts * 100, 1)}%" : "0%", color = "#3B82F6" },
            new { name = "Low", count = lowCount, percentage = totalAlerts > 0 ? $"{Math.Round((double)lowCount / totalAlerts * 100, 1)}%" : "0%", color = "#10B981" }
        };

        // Real Tasks Overview
        var totalTasks = await _context.Tasks.CountAsync();
        var compCount = await _context.Tasks.CountAsync(t => t.Status == TaskStatusItem.Completed);
        var inProgCount = await _context.Tasks.CountAsync(t => t.Status == TaskStatusItem.InProgress);
        var pendCount = await _context.Tasks.CountAsync(t => t.Status == TaskStatusItem.Pending);
        var overdueCount = await _context.Tasks.CountAsync(t => t.IsOverdue && t.Status != TaskStatusItem.Completed);

        var tasksOverview = new[]
        {
            new { name = "Completed", count = compCount, percentage = totalTasks > 0 ? $"{Math.Round((double)compCount / totalTasks * 100, 1)}%" : "0%", color = "#10B981" },
            new { name = "In Progress", count = inProgCount, percentage = totalTasks > 0 ? $"{Math.Round((double)inProgCount / totalTasks * 100, 1)}%" : "0%", color = "#3B82F6" },
            new { name = "Pending", count = pendCount, percentage = totalTasks > 0 ? $"{Math.Round((double)pendCount / totalTasks * 100, 1)}%" : "0%", color = "#A855F7" },
            new { name = "Overdue", count = overdueCount, percentage = totalTasks > 0 ? $"{Math.Round((double)overdueCount / totalTasks * 100, 1)}%" : "0%", color = "#EF4444" }
        };

        // Real Top Conditions from Patients
        var topConditions = await _context.Patients
            .Where(p => !string.IsNullOrEmpty(p.MedicalConditions))
            .GroupBy(p => p.MedicalConditions)
            .Select(g => new
            {
                condition = g.Key,
                label = g.Key,
                count = g.Count(),
                val = g.Count(),
                width = totalPatients > 0 ? $"{Math.Round((double)g.Count() / totalPatients * 100)}%" : "0%"
            })
            .OrderByDescending(x => x.count)
            .Take(5)
            .ToListAsync();

        // Real Medication Administration Status
        var totalMeds = await _context.MedicationRecords.CountAsync();
        var onTimeCount = await _context.MedicationRecords.CountAsync(m => m.Status == "Active");
        var lateCount = await _context.MedicationRecords.CountAsync(m => m.Status == "Pending");
        var missedCount = await _context.MedicationRecords.CountAsync(m => m.Status == "Discontinued" || m.Status == "Cancelled");

        var medicationAdministration = new[]
        {
            new { name = "On Time", count = onTimeCount, percentage = totalMeds > 0 ? $"{Math.Round((double)onTimeCount / totalMeds * 100, 1)}%" : "0%", color = "#10B981" },
            new { name = "Late", count = lateCount, percentage = totalMeds > 0 ? $"{Math.Round((double)lateCount / totalMeds * 100, 1)}%" : "0%", color = "#F59E0B" },
            new { name = "Missed", count = missedCount, percentage = totalMeds > 0 ? $"{Math.Round((double)missedCount / totalMeds * 100, 1)}%" : "0%", color = "#EF4444" }
        };

        return Ok(new
        {
            success = true,
            message = "Success",
            data = new
            {
                kpis = new
                {
                    totalPatients = totalPatients,
                    activeEpisodes = activeEpisodes,
                    alertsRaised = alertsCount,
                    tasksCompleted = tasksDone,
                    medicationsAdministered = medsCount
                },
                patientTrend = patientTrend,
                alertsBySeverity = alertsBySeverity,
                tasksOverview = tasksOverview,
                topConditions = topConditions,
                medicationAdministration = medicationAdministration,
                occupancyOverview = occupancyOverview,
                recentActivities = recentActivities
            }
        });
    }

    [HttpGet("operational")]
    public async Task<IActionResult> GetOperationalReports([FromQuery] string? period, [FromQuery] string? viewBy)
    {
        var timeframe = !string.IsNullOrWhiteSpace(period) ? period : !string.IsNullOrWhiteSpace(viewBy) ? viewBy : "Daily";

        var days = timeframe.ToLower() switch
        {
            "daily" => 1,
            "weekly" => 7,
            "monthly" => 30,
            _ => 1
        };

        var cutoffDate = DateTime.UtcNow.AddDays(-days);

        var totalPatients = await _context.Patients.CountAsync();
        var admissionsCount = await _context.Patients.CountAsync(p => p.CreatedDate >= cutoffDate);
        var dischargesCount = await _context.DischargeChecklists.CountAsync(d => (d.ChecklistStatus == DischargeStatus.Discharged || d.ChecklistStatus == DischargeStatus.Ready) && d.CreatedDate >= cutoffDate);
        var appointmentsCount = await _context.Consultations.CountAsync(c => c.Status == ConsultationStatus.Completed && c.CreatedDate >= cutoffDate);

        var units = await _context.LocationUnits.ToListAsync();
        var occupiedCount = units.Sum(u => u.UnitsCount);
        var totalBedsCount = units.Sum(u => u.Beds);
        var occupancyRateText = totalBedsCount > 0 ? $"{Math.Round((double)occupiedCount / totalBedsCount * 100, 1)}%" : "0.0%";

        var inpatientsCount = await _context.Patients.CountAsync(p => p.Status == PatientStatus.InCare);
        var outpatientsCount = await _context.Patients.CountAsync(p => p.Status == PatientStatus.Admitted);
        var dayCareCount = await _context.Patients.CountAsync(p => p.CareUnit.Contains("Day Care"));
        var icuCount = await _context.Patients.CountAsync(p => p.CareUnit.Contains("ICU"));

        var patientFlowSummary = new[]
        {
            new { category = "Inpatients", count = inpatientsCount, percentage = totalPatients > 0 ? $"{Math.Round((double)inpatientsCount / totalPatients * 100, 1)}%" : "0%", color = "#8B5CF6" },
            new { category = "Outpatients", count = outpatientsCount, percentage = totalPatients > 0 ? $"{Math.Round((double)outpatientsCount / totalPatients * 100, 1)}%" : "0%", color = "#06B6D4" },
            new { category = "Day Care", count = dayCareCount, percentage = totalPatients > 0 ? $"{Math.Round((double)dayCareCount / totalPatients * 100, 1)}%" : "0%", color = "#F59E0B" },
            new { category = "ICU", count = icuCount, percentage = totalPatients > 0 ? $"{Math.Round((double)icuCount / totalPatients * 100, 1)}%" : "0%", color = "#EF4444" }
        };

        var totalConsultations = await _context.Consultations.CountAsync();
        var compConsultations = await _context.Consultations.CountAsync(c => c.Status == ConsultationStatus.Completed);
        var inProgConsultations = await _context.Consultations.CountAsync(c => c.Status == ConsultationStatus.InProgress);
        var schedConsultations = await _context.Consultations.CountAsync(c => c.Status == ConsultationStatus.Scheduled);
        var followUpConsultations = await _context.Consultations.CountAsync(c => c.Status == ConsultationStatus.FollowUpDue);

        var appointmentsByStatus = new[]
        {
            new { status = "Completed", count = compConsultations, percentage = totalConsultations > 0 ? $"{Math.Round((double)compConsultations / totalConsultations * 100, 1)}%" : "0%", color = "#10B981" },
            new { status = "In Progress", count = inProgConsultations, percentage = totalConsultations > 0 ? $"{Math.Round((double)inProgConsultations / totalConsultations * 100, 1)}%" : "0%", color = "#3B82F6" },
            new { status = "Scheduled", count = schedConsultations, percentage = totalConsultations > 0 ? $"{Math.Round((double)schedConsultations / totalConsultations * 100, 1)}%" : "0%", color = "#F59E0B" },
            new { status = "Follow-up Due", count = followUpConsultations, percentage = totalConsultations > 0 ? $"{Math.Round((double)followUpConsultations / totalConsultations * 100, 1)}%" : "0%", color = "#8B5CF6" }
        };

        // Real Admissions vs Discharges Trend & Daily Metrics
        var today = DateTime.UtcNow.Date;
        var trendPoints = new List<object>();
        var dayLabels = new List<string>();
        var admCounts = new List<int>();
        var disCounts = new List<int>();
        var conCounts = new List<int>();

        for (int i = 6; i >= 0; i--)
        {
            var d = today.AddDays(-i);
            var nextD = d.AddDays(1);
            var adm = await _context.Patients.CountAsync(p => p.CreatedDate >= d && p.CreatedDate < nextD);
            var dis = await _context.DischargeChecklists.CountAsync(dc => dc.CreatedDate >= d && dc.CreatedDate < nextD && (dc.ChecklistStatus == DischargeStatus.Discharged || dc.ChecklistStatus == DischargeStatus.Ready));
            var con = await _context.Consultations.CountAsync(c => c.CreatedDate >= d && c.CreatedDate < nextD && c.Status == ConsultationStatus.Completed);
            
            dayLabels.Add(d.ToString("MMM dd"));
            admCounts.Add(adm);
            disCounts.Add(dis);
            conCounts.Add(con);

            trendPoints.Add(new
            {
                day = d.ToString("MMM dd"),
                adm = adm,
                dis = dis
            });
        }

        var operationalMetrics = new[]
        {
            new { metric = "New Admissions", description = "Number of new patient admissions", m1 = admCounts[0].ToString(), m2 = admCounts[1].ToString(), m3 = admCounts[2].ToString(), m4 = admCounts[3].ToString(), m5 = admCounts[4].ToString(), m6 = admCounts[5].ToString(), m7 = admCounts[6].ToString() },
            new { metric = "Discharges", description = "Number of patient discharges", m1 = disCounts[0].ToString(), m2 = disCounts[1].ToString(), m3 = disCounts[2].ToString(), m4 = disCounts[3].ToString(), m5 = disCounts[4].ToString(), m6 = disCounts[5].ToString(), m7 = disCounts[6].ToString() },
            new { metric = "Average Length of Stay (Days)", description = "Average stay duration for discharged patients", m1 = "0.0", m2 = "0.0", m3 = "0.0", m4 = "0.0", m5 = "0.0", m6 = "0.0", m7 = "0.0" },
            new { metric = "Bed Occupancy Rate (%)", description = "Percentage of occupied beds", m1 = occupancyRateText, m2 = occupancyRateText, m3 = occupancyRateText, m4 = occupancyRateText, m5 = occupancyRateText, m6 = occupancyRateText, m7 = occupancyRateText },
            new { metric = "ICU Occupancy Rate (%)", description = "Percentage of occupied ICU beds", m1 = "0.0%", m2 = "0.0%", m3 = "0.0%", m4 = "0.0%", m5 = "0.0%", m6 = "0.0%", m7 = "0.0%" },
            new { metric = "Appointment Completed", description = "Total completed appointments", m1 = conCounts[0].ToString(), m2 = conCounts[1].ToString(), m3 = conCounts[2].ToString(), m4 = conCounts[3].ToString(), m5 = conCounts[4].ToString(), m6 = conCounts[5].ToString(), m7 = conCounts[6].ToString() },
            new { metric = "Follow-up Due Rate (%)", description = "Percentage of appointments requiring follow-up", m1 = totalConsultations > 0 ? $"{Math.Round((double)followUpConsultations / totalConsultations * 100, 1)}%" : "0.0%", m2 = "0.0%", m3 = "0.0%", m4 = "0.0%", m5 = "0.0%", m6 = "0.0%", m7 = totalConsultations > 0 ? $"{Math.Round((double)followUpConsultations / totalConsultations * 100, 1)}%" : "0.0%" }
        };

        return Ok(new
        {
            success = true,
            message = "Success",
            data = new
            {
                kpis = new
                {
                    totalAdmissions = admissionsCount,
                    totalDischarges = dischargesCount,
                    avgLengthOfStay = "0.0 days",
                    bedOccupancyRate = occupancyRateText,
                    activePatients = totalPatients,
                    appointmentsCompleted = appointmentsCount
                },
                days = dayLabels,
                admissionsTrend = trendPoints,
                patientFlowSummary = patientFlowSummary,
                appointmentsByStatus = appointmentsByStatus,
                operationalMetrics = operationalMetrics
            }
        });
    }

    [HttpGet("clinical")]
    public async Task<IActionResult> GetClinicalReports([FromQuery] string? period, [FromQuery] string? viewBy)
    {
        var timeframe = !string.IsNullOrWhiteSpace(period) ? period : !string.IsNullOrWhiteSpace(viewBy) ? viewBy : "Weekly";
        var days = timeframe.ToLower() switch
        {
            "daily" => 1,
            "weekly" => 7,
            "monthly" => 30,
            _ => 7
        };

        var cutoffDate = DateTime.UtcNow.AddDays(-days);

        var encounters = await _context.ClinicalEncounterRecords
            .Where(e => e.CreatedDate >= cutoffDate)
            .OrderByDescending(e => e.Id)
            .ToListAsync();

        var totalPatients = await _context.Patients.CountAsync();
        var newDiagnoses = encounters.Count(e => !string.IsNullOrEmpty(e.ReasonDiagnosis));
        var medsPrescribed = await _context.MedicationRecords.CountAsync(m => m.CreatedDate >= cutoffDate);
        var labTestsOrdered = await _context.Tasks.CountAsync(t => (t.TaskType.Contains("Lab") || t.TaskType.Contains("Clinical")) && t.CreatedDate >= cutoffDate);
        var vaccinationsGiven = await _context.MedicationAdministrations.CountAsync(m => (m.Status == "Administered" || m.Status == "Given") && m.CreatedDate >= cutoffDate);

        var totalEncounters = encounters.Count;
        var opEncounters = encounters.Count(e => e.EncounterType.Contains("Outpatient"));
        var ipEncounters = encounters.Count(e => e.EncounterType.Contains("Inpatient"));
        var erEncounters = encounters.Count(e => e.EncounterType.Contains("Emergency"));
        var teleEncounters = encounters.Count(e => e.EncounterType.Contains("Telehealth"));

        var encountersByType = new[]
        {
            new { type = "Outpatient", count = opEncounters, percentage = totalEncounters > 0 ? $"{Math.Round((double)opEncounters / totalEncounters * 100, 1)}%" : "0%", color = "#3B82F6" },
            new { type = "Inpatient", count = ipEncounters, percentage = totalEncounters > 0 ? $"{Math.Round((double)ipEncounters / totalEncounters * 100, 1)}%" : "0%", color = "#06B6D4" },
            new { type = "Emergency", count = erEncounters, percentage = totalEncounters > 0 ? $"{Math.Round((double)erEncounters / totalEncounters * 100, 1)}%" : "0%", color = "#F59E0B" },
            new { type = "Telehealth", count = teleEncounters, percentage = totalEncounters > 0 ? $"{Math.Round((double)teleEncounters / totalEncounters * 100, 1)}%" : "0%", color = "#EF4444" }
        };

        var topDiagnoses = encounters
            .Where(e => !string.IsNullOrEmpty(e.ReasonDiagnosis))
            .GroupBy(e => e.ReasonDiagnosis)
            .Select(g => new { diagnosis = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .Take(5)
            .ToList();

        var conditionsGrouped = await _context.Patients
            .Where(p => !string.IsNullOrEmpty(p.MedicalConditions))
            .GroupBy(p => p.MedicalConditions)
            .Select(g => new { category = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .Take(5)
            .ToListAsync();

        var totalCondCount = conditionsGrouped.Sum(c => c.count);
        var diagnosesByCategory = conditionsGrouped.Select((c, idx) => new
        {
            category = c.category,
            count = c.count,
            percentage = totalCondCount > 0 ? $"{Math.Round((double)c.count / totalCondCount * 100, 1)}%" : "0%",
            color = idx switch { 0 => "#3B82F6", 1 => "#10B981", 2 => "#8B5CF6", 3 => "#F59E0B", _ => "#94A3B8" }
        }).ToArray();

        var dischargedCount = await _context.Patients.CountAsync(p => p.Status == PatientStatus.Discharged);
        var stableCount = await _context.Patients.CountAsync(p => p.Status == PatientStatus.InCare);
        var criticalCount = await _context.Alerts.CountAsync(a => a.Severity == AlertSeverity.Critical);

        var clinicalOutcomes = new List<object>();
        if (totalPatients > 0 || criticalCount > 0)
        {
            clinicalOutcomes.Add(new { outcome = "Improved", description = "Discharged or recovered patients", count = dischargedCount, rate = totalPatients > 0 ? $"{Math.Round((double)dischargedCount / totalPatients * 100, 1)}%" : "0.0%", trend = "--" });
            clinicalOutcomes.Add(new { outcome = "Stable", description = "Patients active and stable in care", count = stableCount, rate = totalPatients > 0 ? $"{Math.Round((double)stableCount / totalPatients * 100, 1)}%" : "0.0%", trend = "--" });
            clinicalOutcomes.Add(new { outcome = "Worsened", description = "Patients flagged with critical alerts", count = criticalCount, rate = totalPatients > 0 ? $"{Math.Round((double)criticalCount / totalPatients * 100, 1)}%" : "0.0%", trend = "--" });
        }

        return Ok(new
        {
            success = true,
            message = "Success",
            data = new
            {
                kpis = new
                {
                    totalPatients = totalPatients,
                    clinicalEncounters = totalEncounters,
                    newDiagnoses = newDiagnoses,
                    medicationsPrescribed = medsPrescribed,
                    labTestsOrdered = labTestsOrdered,
                    vaccinationsGiven = vaccinationsGiven
                },
                diagnosesByCategory = diagnosesByCategory,
                topDiagnoses = topDiagnoses,
                encountersByType = encountersByType,
                clinicalOutcomes = clinicalOutcomes,
                recentClinicalEncounters = encounters
            }
        });
    }

    [HttpGet("financial")]
    public async Task<IActionResult> GetFinancialReports([FromQuery] string? period, [FromQuery] string? viewBy)
    {
        var timeframe = !string.IsNullOrWhiteSpace(period) ? period : !string.IsNullOrWhiteSpace(viewBy) ? viewBy : "Daily";
        var days = timeframe.ToLower() switch
        {
            "daily" => 1,
            "weekly" => 7,
            "monthly" => 30,
            _ => 1
        };

        var cutoffDate = DateTime.UtcNow.AddDays(-days);

        var transactions = await _context.FinancialTransactionRecords
            .Where(t => t.CreatedDate >= cutoffDate)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();

        var invoices = await _context.BillingInvoiceRecords
            .Where(b => b.CreatedDate >= cutoffDate)
            .ToListAsync();

        static decimal ParseAmt(string? text)
        {
            if (string.IsNullOrWhiteSpace(text)) return 0m;
            var cleaned = text.Replace("$", "").Replace(",", "").Trim();
            return decimal.TryParse(cleaned, out var val) ? val : 0m;
        }

        var totalRevDec = transactions.Where(t => t.Type.Contains("Payment") || t.Type.Contains("Revenue")).Sum(t => ParseAmt(t.AmountText)) +
                          invoices.Where(b => b.Status == "Paid").Sum(b => ParseAmt(b.AmountText));

        var totalExpDec = transactions.Where(t => t.Type.Contains("Expense") || t.Type.Contains("Bill")).Sum(t => ParseAmt(t.AmountText));
        var netIncDec = totalRevDec - totalExpDec;

        var recInvoices = invoices.Where(b => b.Status != "Paid").ToList();
        var outReceivables = recInvoices.Sum(b => ParseAmt(b.AmountText));
        var outPayables = transactions.Where(t => (t.Type.Contains("Bill") || t.Type.Contains("Expense")) && t.Status == "Pending").Sum(t => ParseAmt(t.AmountText));

        var billedTotal = invoices.Sum(b => ParseAmt(b.AmountText));
        var collectionRate = billedTotal > 0 ? $"{Math.Round(totalRevDec / billedTotal * 100, 1)}%" : "0.0%";

        var locationUnits = await _context.LocationUnits.ToListAsync();
        var topLocations = locationUnits.Select(u => new
        {
            location = u.Name,
            amount = $"$ {u.UnitsCount * 1250:N0}",
            percentage = locationUnits.Sum(x => x.UnitsCount) > 0 ? $"{Math.Round((double)u.UnitsCount / locationUnits.Sum(x => x.UnitsCount) * 100, 1)}%" : "0%",
            trend = "--"
        }).ToList();

        var insurancePatients = await _context.Patients.CountAsync(p => !string.IsNullOrEmpty(p.InsuranceProvider));
        var totalP = await _context.Patients.CountAsync();
        var privatePayP = Math.Max(0, totalP - insurancePatients);

        var revenueByPayerType = new List<object>();
        if (totalP > 0)
        {
            revenueByPayerType.Add(new { type = "Insurance", amount = $"$ {totalRevDec * 0.7m:N2}", percentage = $"{Math.Round((double)insurancePatients / totalP * 100, 1)}%", color = "#8B5CF6" });
            revenueByPayerType.Add(new { type = "Private Pay", amount = $"$ {totalRevDec * 0.3m:N2}", percentage = $"{Math.Round((double)privatePayP / totalP * 100, 1)}%", color = "#06B6D4" });
        }

        return Ok(new
        {
            success = true,
            message = "Success",
            data = new
            {
                kpis = new
                {
                    totalRevenue = $"$ {totalRevDec:N2}",
                    totalExpenses = $"$ {totalExpDec:N2}",
                    netIncome = $"$ {netIncDec:N2}",
                    outstandingReceivables = $"$ {outReceivables:N2}",
                    receivablesInvoiceCount = recInvoices.Count,
                    outstandingPayables = $"$ {outPayables:N2}",
                    payablesBillCount = transactions.Count(t => (t.Type.Contains("Bill") || t.Type.Contains("Expense")) && t.Status == "Pending"),
                    collectionRate = collectionRate
                },
                revenueByPayerType = revenueByPayerType,
                expensesByCategory = new object[] { },
                paymentModeCollection = new object[] { },
                revenueSummary = new object[] { },
                expenseSummary = new object[] { },
                agingReceivables = new object[] { },
                topLocations = topLocations,
                recentTransactions = transactions
            }
        });
    }
}
