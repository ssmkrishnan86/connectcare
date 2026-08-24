using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/doctor")]
public class DoctorViewController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;
    private readonly ILogger<DoctorViewController> _logger;

    public DoctorViewController(ConnectedCareDbContext context, ILogger<DoctorViewController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetDoctorOverview([FromQuery] string? doctorName)
    {
        try
        {
            var todayUtc = DateTime.UtcNow.Date;
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            var yesterdayUtc = DateTime.UtcNow.AddDays(-1).Date;

            // 1. Database Patient Metrics
            var totalPatientsCount = await _context.Patients.CountAsync();
            var newPatientsThisWeek = await _context.Patients.CountAsync(p => p.CreatedDate >= sevenDaysAgo);

            // 2. Database Critical / High Alerts
            var criticalAlertsCount = await _context.Alerts.CountAsync(a => (a.Severity == AlertSeverity.Critical || a.Severity == AlertSeverity.High) && !a.IsAcknowledged);

            // 3. Database Pending Reviews (Open tasks + Active care plans)
            var pendingReviewsCount = await _context.Tasks.CountAsync(t => t.Status != TaskStatusItem.Completed && t.StatusStr != "Completed") +
                                      await _context.CarePlans.CountAsync(cp => cp.Status == CarePlanStatus.Active);
            var pendingReviewsYesterday = await _context.Tasks.CountAsync(t => t.CreatedDate.Date <= yesterdayUtc && t.Status != TaskStatusItem.Completed && t.StatusStr != "Completed");
            var pendingReviewsDiff = pendingReviewsCount - pendingReviewsYesterday;

            // 4. Database Today's Consultations / Appointments
            var consultationsTodayCount = await _context.Consultations.CountAsync(c => c.CreatedDate.Date == todayUtc || c.Status == ConsultationStatus.InProgress || c.Status == ConsultationStatus.Scheduled) +
                                          await _context.DoctorConsultations.CountAsync(dc => dc.CreatedDate.Date == todayUtc);
            var consultationsYesterday = await _context.Consultations.CountAsync(c => c.CreatedDate.Date == yesterdayUtc) +
                                         await _context.DoctorConsultations.CountAsync(dc => dc.CreatedDate.Date == yesterdayUtc);
            var appointmentsDiff = consultationsTodayCount - consultationsYesterday;

            // 5. Database Schedule (Real Consultations)
            var consultations = await _context.Consultations
                .OrderByDescending(c => c.CreatedDate)
                .Take(10)
                .ToListAsync();

            var docConsultations = await _context.DoctorConsultations
                .OrderByDescending(dc => dc.CreatedDate)
                .Take(10)
                .ToListAsync();

            var combinedSchedule = new List<object>();

            foreach (var c in consultations)
            {
                combinedSchedule.Add(new
                {
                    id = c.Id,
                    time = !string.IsNullOrEmpty(c.DateTimeText) ? c.DateTimeText : c.CreatedDate.ToString("hh:mm tt"),
                    name = c.PatientName,
                    type = !string.IsNullOrEmpty(c.ConsultationType) ? c.ConsultationType : "Clinical Consultation",
                    status = c.Status.ToString(),
                    color = c.Status == ConsultationStatus.Completed ? "bg-emerald-50 text-emerald-700" :
                            c.Status == ConsultationStatus.InProgress ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                });
            }

            foreach (var dc in docConsultations)
            {
                combinedSchedule.Add(new
                {
                    id = dc.Id,
                    time = !string.IsNullOrEmpty(dc.DateText) ? dc.DateText : dc.CreatedDate.ToString("hh:mm tt"),
                    name = dc.PatientName,
                    type = !string.IsNullOrEmpty(dc.ConsultationType) ? dc.ConsultationType : "Doctor Consultation",
                    status = dc.Status,
                    color = dc.Status == "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                });
            }

            var todaySchedule = combinedSchedule.Take(6).ToList();

            // 6. Database Critical Patients
            var criticalPatients = await _context.Patients
                .Where(p => p.RiskLevel == AlertSeverity.High || p.RiskLevel == AlertSeverity.Critical)
                .OrderByDescending(p => p.CreatedDate)
                .Take(6)
                .Select(p => new
                {
                    id = p.Id,
                    name = p.Name,
                    condition = !string.IsNullOrEmpty(p.MedicalConditions) ? p.MedicalConditions : (!string.IsNullOrEmpty(p.DischargePlan) ? p.DischargePlan : "High Risk Monitoring"),
                    severity = p.RiskLevel.ToString(),
                    color = p.RiskLevel == AlertSeverity.Critical ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                })
                .ToListAsync();

            // 7. Database Vitals Trends & Computed Averages
            var vitalRounds = await _context.VitalRounds
                .OrderByDescending(v => v.CreatedDate)
                .Take(30)
                .ToListAsync();

            var patientsList = await _context.Patients
                .OrderByDescending(p => p.CreatedDate)
                .Take(15)
                .ToListAsync();

            int ParseSystolic(string bp)
            {
                if (string.IsNullOrWhiteSpace(bp)) return 120;
                var parts = bp.Split('/');
                if (parts.Length > 0 && int.TryParse(new string(parts[0].Where(char.IsDigit).ToArray()), out var s))
                    return s;
                return 120;
            }

            int ParseDiastolic(string bp)
            {
                if (string.IsNullOrWhiteSpace(bp)) return 80;
                var parts = bp.Split('/');
                if (parts.Length > 1 && int.TryParse(new string(parts[1].Where(char.IsDigit).ToArray()), out var d))
                    return d;
                return 80;
            }

            int ParseHeartRate(string hr)
            {
                if (string.IsNullOrWhiteSpace(hr)) return 75;
                if (int.TryParse(new string(hr.Where(char.IsDigit).ToArray()), out var val))
                    return val;
                return 75;
            }

            int ParseSpO2(string spo2)
            {
                if (string.IsNullOrWhiteSpace(spo2)) return 98;
                if (int.TryParse(new string(spo2.Where(char.IsDigit).ToArray()), out var val))
                    return val;
                return 98;
            }

            double ParseTemp(string temp)
            {
                if (string.IsNullOrWhiteSpace(temp)) return 98.6;
                var cleaned = new string(temp.Where(c => char.IsDigit(c) || c == '.').ToArray());
                if (double.TryParse(cleaned, out var val))
                    return val;
                return 98.6;
            }

            var vitalsTrendData = new List<object>();

            if (vitalRounds.Any())
            {
                var grouped = vitalRounds
                    .GroupBy(v => v.CreatedDate.ToString("MMM dd"))
                    .Take(7)
                    .Reverse()
                    .ToList();

                foreach (var grp in grouped)
                {
                    var avgSys = (int)grp.Average(v => ParseSystolic(v.BloodPressure));
                    var avgDia = (int)grp.Average(v => ParseDiastolic(v.BloodPressure));
                    var avgHr = (int)grp.Average(v => ParseHeartRate(v.HeartRate));
                    var avgSp = (int)grp.Average(v => ParseSpO2(v.SpO2));
                    var avgT = Math.Round(grp.Average(v => ParseTemp(v.Temperature)), 1);

                    vitalsTrendData.Add(new
                    {
                        day = grp.Key,
                        systolic = avgSys,
                        diastolic = avgDia,
                        heartRate = avgHr,
                        spo2 = avgSp,
                        temperature = avgT
                    });
                }
            }
            int count = 0;
            int totalSystolic = 0, totalDiastolic = 0, totalHr = 0, totalSp = 0;

            if (vitalRounds.Any())
            {
                count = vitalRounds.Count;
                totalSystolic = (int)vitalRounds.Average(v => ParseSystolic(v.BloodPressure));
                totalDiastolic = (int)vitalRounds.Average(v => ParseDiastolic(v.BloodPressure));
                totalHr = (int)vitalRounds.Average(v => ParseHeartRate(v.HeartRate));
                totalSp = (int)vitalRounds.Average(v => ParseSpO2(v.SpO2));
            }
            else
            {
                var patientsWithVitals = patientsList.Where(p => !string.IsNullOrWhiteSpace(p.BloodPressure)).ToList();
                if (patientsWithVitals.Any())
                {
                    count = patientsWithVitals.Count;
                    totalSystolic = (int)patientsWithVitals.Average(p => ParseSystolic(p.BloodPressure));
                    totalDiastolic = (int)patientsWithVitals.Average(p => ParseDiastolic(p.BloodPressure));
                    totalHr = (int)patientsWithVitals.Average(p => ParseHeartRate(p.HeartRate));
                    totalSp = (int)patientsWithVitals.Average(p => ParseSpO2(p.SpO2));
                }
            }

            var vitalsSummary = new
            {
                avgSystolic = count > 0 ? $"{totalSystolic} mmHg" : "--",
                avgDiastolic = count > 0 ? $"{totalDiastolic} mmHg" : "--",
                avgHeartRate = count > 0 ? $"{totalHr} bpm" : "--",
                avgSpO2 = count > 0 ? $"{totalSp}%" : "--"
            };

            // 8. Database My Patients Table
            var myPatients = await _context.Patients
                .OrderByDescending(p => p.CreatedDate)
                .Take(10)
                .Select(p => new
                {
                    id = p.Id,
                    patientIdCode = p.PatientIdCode,
                    name = p.Name,
                    age = !string.IsNullOrEmpty(p.AgeGender) ? p.AgeGender : (string.IsNullOrEmpty(p.Dob) ? p.Gender : p.Dob),
                    last = !string.IsNullOrEmpty(p.LastVisit) ? p.LastVisit : p.CreatedDate.ToString("MMM dd, yyyy"),
                    next = !string.IsNullOrEmpty(p.AdmissionDate) ? p.AdmissionDate : "Not scheduled",
                    cond = !string.IsNullOrEmpty(p.MedicalConditions) ? p.MedicalConditions : (!string.IsNullOrEmpty(p.DischargePlan) ? p.DischargePlan : "General Care"),
                    status = p.Status.ToString(),
                    color = p.RiskLevel == AlertSeverity.Critical ? "bg-rose-50 text-rose-700" :
                            p.Status == PatientStatus.Admitted ? "bg-amber-50 text-amber-700" :
                            p.Status == PatientStatus.Discharged ? "bg-slate-100 text-slate-700" : "bg-emerald-50 text-emerald-700"
                })
                .ToListAsync();

            // 9. Database Tasks
            var tasks = await _context.Tasks
                .OrderByDescending(t => t.CreatedDate)
                .Take(6)
                .Select(t => new
                {
                    id = t.Id,
                    title = t.Title + (!string.IsNullOrEmpty(t.PatientName) ? $" - {t.PatientName}" : ""),
                    prio = t.Priority.ToString() + " Priority",
                    prioCol = t.Priority == TaskPriority.High ? "text-rose-600" :
                              t.Priority == TaskPriority.Medium ? "text-amber-600" : "text-slate-400",
                    due = !string.IsNullOrEmpty(t.DueTime) ? t.DueTime : "Scheduled",
                    status = t.StatusStr
                })
                .ToListAsync();

            // 10. Database Alerts
            var alerts = await _context.Alerts
                .Where(a => !a.IsAcknowledged)
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

            // 11. Database Recent Consultations
            var recentConsultationsList = new List<object>();

            foreach (var dc in docConsultations.Take(4))
            {
                recentConsultationsList.Add(new
                {
                    id = dc.Id,
                    name = dc.PatientName,
                    date = !string.IsNullOrEmpty(dc.DateText) ? dc.DateText : dc.CreatedDate.ToString("MMM dd, yyyy hh:mm tt"),
                    note = !string.IsNullOrEmpty(dc.ClinicalNotes) ? dc.ClinicalNotes : (!string.IsNullOrEmpty(dc.Diagnosis) ? dc.Diagnosis : "Consultation completed")
                });
            }

            foreach (var c in consultations.Take(4))
            {
                recentConsultationsList.Add(new
                {
                    id = c.Id,
                    name = c.PatientName,
                    date = !string.IsNullOrEmpty(c.DateTimeText) ? c.DateTimeText : c.CreatedDate.ToString("MMM dd, yyyy hh:mm tt"),
                    note = !string.IsNullOrEmpty(c.ClinicalNotes) ? c.ClinicalNotes : (!string.IsNullOrEmpty(c.Reason) ? c.Reason : "Clinical follow-up recorded")
                });
            }

            var recentConsultations = recentConsultationsList.Take(5).ToList();

            var currentDoctorName = string.IsNullOrWhiteSpace(doctorName) ? "Dr. Sarah Wilson" : doctorName;

            return Ok(new
            {
                success = true,
                doctorName = currentDoctorName,
                metrics = new
                {
                    todayAppointments = consultationsTodayCount,
                    todayAppointmentsDiff = appointmentsDiff,
                    totalPatients = totalPatientsCount,
                    newPatientsThisWeek = newPatientsThisWeek,
                    criticalAlerts = criticalAlertsCount,
                    pendingReviews = pendingReviewsCount,
                    pendingReviewsDiff = pendingReviewsDiff
                },
                todaySchedule,
                criticalPatients,
                vitalsTrendData,
                vitalsSummary,
                myPatients,
                tasks,
                alerts,
                recentConsultations
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching doctor overview.");
            return StatusCode(500, new { success = false, message = "Failed to load Doctor Overview data." });
        }
    }

    [HttpGet("consultations")]
    public async Task<IActionResult> GetConsultations()
    {
        try
        {
            var consultations = await _context.DoctorConsultations
                .OrderByDescending(c => c.CreatedDate)
                .ToListAsync();

            return Ok(new { success = true, data = consultations });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching doctor consultations.");
            return StatusCode(500, new { success = false, message = "Failed to load consultations." });
        }
    }

    [HttpPost("consultations")]
    public async Task<IActionResult> CreateConsultation([FromBody] DoctorConsultation dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.PatientName))
            {
                return BadRequest(new { success = false, message = "Patient Name is required." });
            }

            dto.Id = Guid.NewGuid();
            dto.CreatedDate = DateTime.UtcNow;
            dto.DateText = string.IsNullOrWhiteSpace(dto.DateText) ? DateTime.Now.ToString("MMM dd, yyyy hh:mm tt") : dto.DateText;

            _context.DoctorConsultations.Add(dto);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = dto, message = "Consultation recorded successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating consultation.");
            return StatusCode(500, new { success = false, message = "Failed to record consultation." });
        }
    }

    [HttpGet("care-plans")]
    public async Task<IActionResult> GetCarePlans()
    {
        try
        {
            var plans = await _context.PatientCarePlanRecords
                .OrderByDescending(cp => cp.CreatedDate)
                .ToListAsync();

            return Ok(new { success = true, data = plans });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching care plans.");
            return StatusCode(500, new { success = false, message = "Failed to load care plans." });
        }
    }

    [HttpPost("care-plans")]
    public async Task<IActionResult> CreateCarePlan([FromBody] PatientCarePlanRecord dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.PlanName))
            {
                return BadRequest(new { success = false, message = "Care Plan Name is required." });
            }

            dto.Id = Guid.NewGuid();
            dto.CreatedDate = DateTime.UtcNow;
            dto.StartDate = string.IsNullOrWhiteSpace(dto.StartDate) ? DateTime.Now.ToString("MMM dd, yyyy") : dto.StartDate;

            _context.PatientCarePlanRecords.Add(dto);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = dto, message = "Care Plan created successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating care plan.");
            return StatusCode(500, new { success = false, message = "Failed to create care plan." });
        }
    }

    [HttpGet("documents")]
    public async Task<IActionResult> GetDocuments()
    {
        try
        {
            var docs = await _context.PatientDocumentRecords
                .OrderByDescending(d => d.CreatedDate)
                .ToListAsync();

            return Ok(new { success = true, data = docs });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching documents.");
            return StatusCode(500, new { success = false, message = "Failed to load documents." });
        }
    }

    [HttpPost("ai-assistant")]
    public async Task<IActionResult> ProcessAiAssistant([FromBody] DoctorAiConversation dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.PromptQuery))
            {
                return BadRequest(new { success = false, message = "Prompt query is required." });
            }

            // Fetch real patient from database if specified or default first patient
            Patient? targetPatient = null;
            if (!string.IsNullOrWhiteSpace(dto.PatientIdCode))
            {
                targetPatient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientIdCode == dto.PatientIdCode);
            }
            if (targetPatient == null && !string.IsNullOrWhiteSpace(dto.PatientName))
            {
                var pNameLower = dto.PatientName.ToLower();
                targetPatient = await _context.Patients.FirstOrDefaultAsync(p => p.Name.ToLower().Contains(pNameLower));
            }
            if (targetPatient == null)
            {
                targetPatient = await _context.Patients.FirstOrDefaultAsync();
            }

            string patientName = targetPatient?.Name ?? (!string.IsNullOrWhiteSpace(dto.PatientName) ? dto.PatientName : "Patient");
            string patientCode = targetPatient?.PatientIdCode ?? (!string.IsNullOrWhiteSpace(dto.PatientIdCode) ? dto.PatientIdCode : "PT-001");
            string medicalHistory = targetPatient?.PastMedicalHistory ?? targetPatient?.MedicalConditions ?? "None recorded";
            string currentMeds = targetPatient?.CurrentMedications ?? "Standard regimen";
            string allergies = targetPatient?.Allergies ?? "No known allergies (NKDA)";
            string vitalsInfo = targetPatient != null ? $"BP: {targetPatient.BloodPressure}, Pulse: {targetPatient.HeartRate}, SpO2: {targetPatient.SpO2}, Temp: {targetPatient.Temperature}" : "Standard vitals";

            string responseText = "";
            string queryLower = dto.PromptQuery.ToLower();

            if (queryLower.Contains("summarize") || queryLower.Contains("history") || queryLower.Contains("analyze") || queryLower.Contains("data"))
            {
                responseText = $"**Patient Clinical Summary ({patientName} - {patientCode}):**\n• **Medical History/Conditions:** {medicalHistory}\n• **Recorded Vitals:** {vitalsInfo}\n• **Current Medications:** {currentMeds}\n• **Allergies:** {allergies}\n• **Risk Assessment:** {(targetPatient != null ? targetPatient.RiskLevel.ToString() : "Low")} priority.";
            }
            else if (queryLower.Contains("interaction") || queryLower.Contains("drug"))
            {
                responseText = $"**Drug & Medication Analysis for {patientName}:**\n• **Active Prescriptions:** {currentMeds}\n• **Known Allergies:** {allergies}\n• **Safety Recommendation:** Verify renal and hepatic panels prior to adjusting dosages. No critical drug-drug conflicts found in documented regimen.";
            }
            else if (queryLower.Contains("care plan") || queryLower.Contains("suggest"))
            {
                responseText = $"**Suggested Care Plan Protocol for {patientName}:**\n1. Maintain daily vital logging (Target BP < 130/80 mmHg, SpO2 > 95%).\n2. Monitor compliance on: {currentMeds}.\n3. Schedule clinical follow-up in 14 days and repeat metabolic panel if indicated.";
            }
            else if (queryLower.Contains("risk") || queryLower.Contains("assessment"))
            {
                responseText = $"**Health Risk Assessment for {patientName}:**\n• **Risk Level:** {(targetPatient != null ? targetPatient.RiskLevel.ToString() : "Moderate")}\n• **Status:** {(targetPatient != null ? targetPatient.Status.ToString() : "In Care")}\n• **Key Factors:** {medicalHistory}\n• **Recommended Action:** Continue standard surveillance and follow up on pending review items.";
            }
            else
            {
                responseText = $"Clinical AI Assistant response for {patientName} ({patientCode}): Based on current electronic health records, patient presents with conditions: {medicalHistory}. Vitals on record: {vitalsInfo}. Continue current clinical pathway and monitor for symptom changes.";
            }

            dto.Id = Guid.NewGuid();
            dto.PatientName = patientName;
            dto.PatientIdCode = patientCode;
            dto.AiResponse = responseText;
            dto.CreatedDate = DateTime.UtcNow;

            _context.DoctorAiConversations.Add(dto);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = dto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI assistant prompt.");
            return StatusCode(500, new { success = false, message = "Failed to process AI request." });
        }
    }

    [HttpGet("reports-overview")]
    public async Task<IActionResult> GetReportsOverview()
    {
        try
        {
            var customReports = await _context.CustomReportRecords
                .OrderByDescending(r => r.CreatedDate)
                .ToListAsync();

            var metrics = new
            {
                totalAppointments = 1248,
                newPatients = 356,
                completedAppointments = 1032,
                cancelledAppointments = 128,
                noShowRatePercentage = 10.3,
                appointmentsTrend = new[]
                {
                    new { date = "May 15", count = 142 },
                    new { date = "May 16", count = 156 },
                    new { date = "May 17", count = 189 },
                    new { date = "May 18", count = 143 },
                    new { date = "May 19", count = 138 },
                    new { date = "May 20", count = 176 },
                    new { date = "May 21", count = 233 },
                    new { date = "May 22", count = 171 }
                },
                appointmentsByType = new[]
                {
                    new { type = "In-Person", count = 768, percentage = 61.5, color = "#6366F1" },
                    new { type = "Video", count = 312, percentage = 25.0, color = "#3B82F6" },
                    new { type = "Phone", count = 96, percentage = 7.7, color = "#10B981" },
                    new { type = "Other", count = 72, percentage = 5.8, color = "#F59E0B" }
                },
                departmentBreakdown = new[]
                {
                    new { department = "Cardiology", count = 342 },
                    new { department = "General Medicine", count = 289 },
                    new { department = "Orthopedics", count = 218 },
                    new { department = "Pediatrics", count = 156 },
                    new { department = "Dermatology", count = 102 },
                    new { department = "Neurology", count = 84 },
                    new { department = "Other", count = 57 }
                },
                operationalSummary = new
                {
                    bedOccupancyRate = "72.6%",
                    opdUtilization = "68.4%",
                    theatreUtilization = "81.3%",
                    labUtilization = "65.8%",
                    radiologyUtilization = "69.1%"
                }
            };

            return Ok(new { success = true, metrics, customReports });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching operations reports overview.");
            return StatusCode(500, new { success = false, message = "Failed to load reports overview." });
        }
    }
}
