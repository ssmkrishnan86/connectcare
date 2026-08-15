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
    public async Task<IActionResult> GetDoctorOverview([FromQuery] string doctorName = "Dr. Sarah Wilson")
    {
        try
        {
            var totalPatientsCount = await _context.Patients.CountAsync();
            var criticalAlertsCount = await _context.Alerts.CountAsync(a => a.Severity == AlertSeverity.Critical && !a.IsAcknowledged);
            var pendingReviewsCount = await _context.Tasks.CountAsync(t => t.StatusStr != "Completed");
            var doctorConsultations = await _context.DoctorConsultations
                .OrderByDescending(c => c.CreatedDate)
                .Take(5)
                .ToListAsync();

            var criticalPatients = await _context.Patients
                .Where(p => p.RiskLevel == AlertSeverity.High || p.RiskLevel == AlertSeverity.Critical)
                .Take(5)
                .Select(p => new
                {
                    id = p.Id,
                    name = p.Name,
                    condition = p.DischargePlan ?? "Cardiovascular Disease",
                    severity = p.RiskLevel.ToString(),
                    color = "bg-rose-500 text-white"
                })
                .ToListAsync();

            var todaySchedule = new[]
            {
                new { time = "09:00 AM", name = "Robert Johnson", type = "Follow-up Consultation", status = "Confirmed", color = "bg-blue-50 text-blue-700" },
                new { time = "10:30 AM", name = "Mary Williams", type = "Routine Check-up", status = "Confirmed", color = "bg-blue-50 text-blue-700" },
                new { time = "11:30 AM", name = "Michael Brown", type = "Blood Pressure Check", status = "Pending", color = "bg-amber-50 text-amber-700" },
                new { time = "02:00 PM", name = "Jennifer Davis", type = "Follow-up Consultation", status = "Confirmed", color = "bg-blue-50 text-blue-700" },
                new { time = "03:30 PM", name = "Lisa Martinez", type = "ECG Review", status = "Confirmed", color = "bg-blue-50 text-blue-700" }
            };

            var vitalsTrendData = new[]
            {
                new { day = "May 15", systolic = 120, diastolic = 76 },
                new { day = "May 16", systolic = 125, diastolic = 80 },
                new { day = "May 17", systolic = 118, diastolic = 74 },
                new { day = "May 18", systolic = 122, diastolic = 78 },
                new { day = "May 19", systolic = 128, diastolic = 82 },
                new { day = "May 20", systolic = 124, diastolic = 79 },
                new { day = "May 21", systolic = 126, diastolic = 81 }
            };

            return Ok(new
            {
                success = true,
                doctorName,
                metrics = new
                {
                    todayAppointments = 12,
                    totalPatients = totalPatientsCount > 0 ? totalPatientsCount : 128,
                    criticalAlerts = criticalAlertsCount,
                    pendingReviews = pendingReviewsCount > 0 ? pendingReviewsCount : 18
                },
                todaySchedule,
                criticalPatients,
                vitalsTrendData,
                recentConsultations = doctorConsultations
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

            string responseText = "";
            string queryLower = dto.PromptQuery.ToLower();

            if (queryLower.Contains("summarize") || queryLower.Contains("history"))
            {
                responseText = "**Patient Summary:** Robert Johnson is a 68-year-old male with a history of hypertension, type 2 diabetes mellitus, and hyperlipidemia.\n\n**Recent Vitals:**\n• BP: 146/88 mmHg (Slightly elevated)\n• HbA1c: 7.2% (Controlled)\n• Pulse: 78 bpm\n\n**Current Medications:** Lisinopril 10mg OD, Metformin 500mg BD, Atorvastatin 20mg OD, Aspirin 81mg OD.";
            }
            else if (queryLower.Contains("interaction") || queryLower.Contains("drug"))
            {
                responseText = "**Drug Interaction Analysis:**\n• **Aspirin + NSAIDs**: Increased risk of gastrointestinal bleeding.\n• **Metformin + Lisinopril**: Monitor renal function annually.\n• No severe contraindications detected in current regimen.";
            }
            else if (queryLower.Contains("care plan") || queryLower.Contains("suggest"))
            {
                responseText = "**Suggested Care Plan Steps:**\n1. Maintain daily BP log targeting < 130/80 mmHg.\n2. Encourage 30 minutes of low-impact aerobic exercise 5 days/week.\n3. Schedule repeat HbA1c and Comprehensive Metabolic Panel in 60 days.";
            }
            else
            {
                responseText = $"Based on clinical history for {dto.PatientName} ({dto.PatientIdCode}), current treatment protocols recommend regular monitoring of vital signs, blood glucose, and renal panels. Please review latest lab notes for tailored dosage adjustments.";
            }

            dto.Id = Guid.NewGuid();
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
