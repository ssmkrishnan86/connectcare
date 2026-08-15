using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;

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

    [HttpGet("overview")]
    public async Task<IActionResult> GetReportsOverview()
    {
        var totalPatients = await _context.Patients.CountAsync();
        var activeAlerts = await _context.Alerts.CountAsync(a => !a.IsAcknowledged);
        var openTasks = await _context.Tasks.CountAsync(t => t.StatusStr != "Completed");
        var recentActivities = await _context.ActivitySummaryLogs.ToListAsync();

        return Ok(new
        {
            success = true,
            message = "Success",
            data = new
            {
                kpis = new
                {
                    totalPatients = totalPatients > 0 ? totalPatients : 1248,
                    activeEpisodes = 892,
                    alertsRaised = 28,
                    tasksCompleted = 156,
                    medicationsAdministered = 2354
                },
                patientTrend = new[]
                {
                    new { date = "May 13", newPatients = 60, discharged = 30 },
                    new { date = "May 14", newPatients = 75, discharged = 45 },
                    new { date = "May 15", newPatients = 65, discharged = 35 },
                    new { date = "May 16", newPatients = 90, discharged = 50 },
                    new { date = "May 17", newPatients = 70, discharged = 40 },
                    new { date = "May 18", newPatients = 80, discharged = 42 },
                    new { date = "May 19", newPatients = 92, discharged = 52 }
                },
                alertsBySeverity = new[]
                {
                    new { name = "Critical", count = 6, percentage = "21.4%", color = "#EF4444" },
                    new { name = "High", count = 8, percentage = "28.6%", color = "#F59E0B" },
                    new { name = "Medium", count = 9, percentage = "32.1%", color = "#3B82F6" },
                    new { name = "Low", count = 5, percentage = "17.9%", color = "#10B981" }
                },
                tasksOverview = new[]
                {
                    new { name = "Completed", count = 54, percentage = "34.6%", color = "#10B981" },
                    new { name = "In Progress", count = 34, percentage = "21.8%", color = "#3B82F6" },
                    new { name = "Pending", count = 62, percentage = "39.7%", color = "#A855F7" },
                    new { name = "Overdue", count = 6, percentage = "3.8%", color = "#EF4444" }
                },
                topConditions = new[]
                {
                    new { condition = "Hypertension", count = 320 },
                    new { condition = "Diabetes Mellitus", count = 280 },
                    new { condition = "COPD", count = 190 },
                    new { condition = "Coronary Artery Disease", count = 150 },
                    new { condition = "Asthma", count = 110 }
                },
                medicationAdministration = new[]
                {
                    new { name = "On Time", count = 1782, percentage = "75.7%", color = "#10B981" },
                    new { name = "Late", count = 412, percentage = "17.5%", color = "#F59E0B" },
                    new { name = "Missed", count = 160, percentage = "6.8%", color = "#EF4444" }
                },
                occupancyOverview = new[]
                {
                    new { unit = "ICU", occupied = 28, available = 12, rate = "70%" },
                    new { unit = "Medical Ward", occupied = 142, available = 38, rate = "78%" },
                    new { unit = "Surgical Ward", occupied = 96, available = 24, rate = "80%" },
                    new { unit = "Rehab Unit", occupied = 34, available = 16, rate = "68%" },
                    new { unit = "Pediatrics", occupied = 18, available = 12, rate = "60%" }
                },
                recentActivities
            }
        });
    }

    [HttpGet("operational")]
    public async Task<IActionResult> GetOperationalReports()
    {
        return Ok(new
        {
            success = true,
            message = "Success",
            data = new
            {
                kpis = new
                {
                    totalAdmissions = 78,
                    totalDischarges = 65,
                    avgLengthOfStay = "5.6 days",
                    bedOccupancyRate = "82.6%",
                    activePatients = 1248,
                    appointmentsCompleted = 356
                },
                patientFlowSummary = new[]
                {
                    new { category = "Inpatients", count = 642, percentage = "51.4%", color = "#8B5CF6" },
                    new { category = "Outpatients", count = 436, percentage = "34.9%", color = "#06B6D4" },
                    new { category = "Day Care", count = 112, percentage = "9.0%", color = "#F59E0B" },
                    new { category = "ICU", count = 58, percentage = "4.7%", color = "#EF4444" }
                },
                appointmentsByStatus = new[]
                {
                    new { status = "Completed", count = 246, percentage = "69.1%", color = "#10B981" },
                    new { status = "Cancelled", count = 48, percentage = "13.5%", color = "#EF4444" },
                    new { status = "No Show", count = 32, percentage = "9.0%", color = "#F59E0B" },
                    new { status = "Rescheduled", count = 30, percentage = "8.4%", color = "#3B82F6" }
                },
                operationalMetrics = new[]
                {
                    new { metric = "New Admissions", description = "Number of new patient admissions", m13 = "10", m14 = "12", m15 = "15", m16 = "11", m17 = "13", m18 = "9", m19 = "8" },
                    new { metric = "Discharges", description = "Number of patient discharges", m13 = "8", m14 = "9", m15 = "11", m16 = "10", m17 = "9", m18 = "11", m19 = "7" },
                    new { metric = "Average Length of Stay (Days)", description = "Average stay duration for discharged patients", m13 = "5.2", m14 = "5.6", m15 = "5.4", m16 = "5.8", m17 = "5.3", m18 = "5.7", m19 = "5.6" },
                    new { metric = "Bed Occupancy Rate (%)", description = "Percentage of occupied beds", m13 = "78.1%", m14 = "79.3%", m15 = "81.6%", m16 = "83.2%", m17 = "82.0%", m18 = "83.1%", m19 = "82.6%" },
                    new { metric = "ICU Occupancy Rate (%)", description = "Percentage of occupied ICU beds", m13 = "71.4%", m14 = "72.0%", m15 = "73.3%", m16 = "74.6%", m17 = "72.2%", m18 = "73.8%", m19 = "74.1%" },
                    new { metric = "Appointment Completed", description = "Total completed appointments", m13 = "42", m14 = "48", m15 = "50", m16 = "47", m17 = "49", m18 = "56", m19 = "64" },
                    new { metric = "No Show Rate (%)", description = "Percentage of missed appointments", m13 = "8.6%", m14 = "9.1%", m15 = "8.3%", m16 = "9.0%", m17 = "8.7%", m18 = "8.9%", m19 = "8.5%" }
                }
            }
        });
    }

    [HttpGet("clinical")]
    public async Task<IActionResult> GetClinicalReports()
    {
        var encounters = await _context.ClinicalEncounterRecords.ToListAsync();

        return Ok(new
        {
            success = true,
            message = "Success",
            data = new
            {
                kpis = new
                {
                    totalPatients = 1248,
                    clinicalEncounters = 1856,
                    newDiagnoses = 312,
                    medicationsPrescribed = 2354,
                    labTestsOrdered = 987,
                    vaccinationsGiven = 256
                },
                diagnosesByCategory = new[]
                {
                    new { category = "Cardiovascular", count = 78, percentage = "25.0%", color = "#3B82F6" },
                    new { category = "Respiratory", count = 64, percentage = "20.5%", color = "#10B981" },
                    new { category = "Endocrine", count = 48, percentage = "15.4%", color = "#8B5CF6" },
                    new { category = "Musculoskeletal", count = 40, percentage = "12.8%", color = "#F59E0B" },
                    new { category = "Other", count = 82, percentage = "26.3%", color = "#64748B" }
                },
                topDiagnoses = new[]
                {
                    new { diagnosis = "Hypertension (I10)", count = 52 },
                    new { diagnosis = "Type 2 Diabetes (E11)", count = 38 },
                    new { diagnosis = "COPD (J44.1)", count = 28 },
                    new { diagnosis = "Asthma (J45.9)", count = 24 },
                    new { diagnosis = "Osteoarthritis (M17.9)", count = 18 }
                },
                encountersByType = new[]
                {
                    new { type = "Outpatient", count = 1124, percentage = "60.6%", color = "#3B82F6" },
                    new { type = "Inpatient", count = 412, percentage = "22.2%", color = "#06B6D4" },
                    new { type = "Emergency", count = 210, percentage = "11.3%", color = "#F59E0B" },
                    new { type = "Telehealth", count = 110, percentage = "5.9%", color = "#EF4444" }
                },
                clinicalOutcomes = new[]
                {
                    new { outcome = "Improved", description = "Patients with improved condition", count = 762, rate = "41.0%", trend = "↑ 6.5%" },
                    new { outcome = "Stable", description = "Patients with stable condition", count = 703, rate = "37.9%", trend = "↑ 2.1%" },
                    new { outcome = "Worsened", description = "Patients with worsened condition", count = 218, rate = "11.7%", trend = "↓ 4.3%" },
                    new { outcome = "Deceased", description = "Patient mortality", count = 23, rate = "1.2%", trend = "↓ 8.0%" },
                    new { outcome = "Unknown", description = "Outcome not recorded", count = 150, rate = "8.1%", trend = "-- 0.0%" }
                },
                recentClinicalEncounters = encounters
            }
        });
    }

    [HttpGet("financial")]
    public async Task<IActionResult> GetFinancialReports()
    {
        var transactions = await _context.FinancialTransactionRecords.ToListAsync();

        return Ok(new
        {
            success = true,
            message = "Success",
            data = new
            {
                kpis = new
                {
                    totalRevenue = "₹ 24,58,760",
                    totalExpenses = "₹ 15,32,480",
                    netIncome = "₹ 9,26,280",
                    outstandingReceivables = "₹ 8,45,230",
                    receivablesInvoiceCount = 263,
                    outstandingPayables = "₹ 3,12,450",
                    payablesBillCount = 87,
                    collectionRate = "89.6%"
                },
                revenueByPayerType = new[]
                {
                    new { type = "Insurance", amount = "₹ 13,25,410", percentage = "53.9%", color = "#8B5CF6" },
                    new { type = "Private Pay", amount = "₹ 7,85,230", percentage = "31.9%", color = "#06B6D4" },
                    new { type = "Government", amount = "₹ 2,45,600", percentage = "10.0%", color = "#10B981" },
                    new { type = "Corporate", amount = "₹ 1,02,520", percentage = "4.2%", color = "#3B82F6" }
                },
                expensesByCategory = new[]
                {
                    new { category = "Salaries & Benefits", amount = "₹ 6,12,340", percentage = "39.9%", color = "#3B82F6" },
                    new { category = "Medical Supplies", amount = "₹ 3,45,280", percentage = "22.5%", color = "#10B981" },
                    new { category = "Utilities & Facilities", amount = "₹ 2,10,560", percentage = "13.7%", color = "#F59E0B" },
                    new { category = "Services & Contracts", amount = "₹ 1,78,900", percentage = "11.7%", color = "#8B5CF6" },
                    new { category = "Other Expenses", amount = "₹ 1,85,400", percentage = "12.2%", color = "#06B6D4" }
                },
                paymentModeCollection = new[]
                {
                    new { mode = "Online", percentage = "45.6%", color = "#8B5CF6" },
                    new { mode = "Card", percentage = "28.3%", color = "#06B6D4" },
                    new { mode = "Cash", percentage = "16.7%", color = "#F59E0B" },
                    new { mode = "Bank Transfer", percentage = "9.4%", color = "#10B981" }
                },
                revenueSummary = new[]
                {
                    new { category = "Inpatient Services", amount = "₹ 11,45,230", percentage = "46.6%", trend = "↑ 14.6%" },
                    new { category = "Outpatient Services", amount = "₹ 6,78,450", percentage = "27.6%", trend = "↑ 9.8%" },
                    new { category = "Diagnostic Services", amount = "₹ 3,12,560", percentage = "12.7%", trend = "↑ 6.2%" },
                    new { category = "Pharmacy", amount = "₹ 2,45,780", percentage = "10.0%", trend = "↑ 11.3%" },
                    new { category = "Other Services", amount = "₹ 76,740", percentage = "3.1%", trend = "↓ 2.1%" }
                },
                expenseSummary = new[]
                {
                    new { category = "Salaries & Benefits", amount = "₹ 6,12,340", percentage = "39.9%", trend = "↑ 6.5%" },
                    new { category = "Medical Supplies", amount = "₹ 3,45,280", percentage = "22.5%", trend = "↑ 5.9%" },
                    new { category = "Utilities & Facilities", amount = "₹ 2,10,560", percentage = "13.7%", trend = "↑ 3.1%" },
                    new { category = "Services & Contracts", amount = "₹ 1,78,900", percentage = "11.7%", trend = "↑ 2.7%" },
                    new { category = "Other Expenses", amount = "₹ 1,85,400", percentage = "12.2%", trend = "↓ 1.8%" }
                },
                agingReceivables = new[]
                {
                    new { range = "0 - 30 Days", amount = "₹ 3,12,450", percentage = "36.9%" },
                    new { range = "31 - 60 Days", amount = "₹ 2,45,780", percentage = "29.1%" },
                    new { range = "61 - 90 Days", amount = "₹ 1,56,230", percentage = "18.5%" },
                    new { range = "91 - 120 Days", amount = "₹ 89,450", percentage = "10.6%" },
                    new { range = "> 120 Days", amount = "₹ 41,320", percentage = "4.9%" }
                },
                topLocations = new[]
                {
                    new { location = "Main Hospital", amount = "₹ 12,45,230", percentage = "50.7%", trend = "↑ 13.2%" },
                    new { location = "West Wing", amount = "₹ 5,23,450", percentage = "27.3%", trend = "↑ 9.1%" },
                    new { location = "Care Center - North", amount = "₹ 3,45,780", percentage = "14.1%", trend = "↑ 6.4%" },
                    new { location = "Downtown Clinic", amount = "₹ 2,15,230", percentage = "8.8%", trend = "↓ 1.3%" },
                    new { location = "Rehab Unit", amount = "₹ 1,28,070", percentage = "5.1%", trend = "↑ 4.7%" }
                },
                recentTransactions = transactions
            }
        });
    }
}
