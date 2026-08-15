using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/custom-reports")]
public class CustomReportsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public CustomReportsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetReports([FromQuery] string? search, [FromQuery] string? category)
    {
        var query = _context.CustomReportRecords.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(r => r.ReportName.ToLower().Contains(search.ToLower()) ||
                                     r.Description.ToLower().Contains(search.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "All Reports")
        {
            query = query.Where(r => r.Category.ToLower() == category.ToLower());
        }

        var reports = await query.OrderByDescending(r => r.CreatedDate).ToListAsync();
        return Ok(new { success = true, data = reports });
    }

    [HttpPost]
    public async Task<IActionResult> CreateReport([FromBody] CustomReportRecord newReport)
    {
        if (string.IsNullOrWhiteSpace(newReport.LastModifiedText))
        {
            newReport.LastModifiedText = DateTime.Now.ToString("MMM dd, yyyy");
        }
        if (string.IsNullOrWhiteSpace(newReport.CreatedBy))
        {
            newReport.CreatedBy = "John Admin";
        }
        newReport.CreatedDate = DateTime.UtcNow;
        newReport.UpdatedDate = DateTime.UtcNow;

        _context.CustomReportRecords.Add(newReport);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Custom report created successfully", data = newReport });
    }

    [HttpGet("preview/{id}")]
    public async Task<IActionResult> GetReportPreview(Guid id)
    {
        var report = await _context.CustomReportRecords.FindAsync(id);
        if (report == null)
        {
            return NotFound(new { success = false, message = "Report not found" });
        }

        var previewData = new
        {
            reportName = report.ReportName,
            dateRange = "May 13 - May 19, 2025",
            location = "All Locations",
            totalPatients = 1248,
            inpatients = 642,
            outpatients = 436,
            dayCare = 170,
            dayCarePercentage = "13.6%",
            patientsByLocation = new[]
            {
                new { location = "Main Campus", count = 642, percentage = "51.4%" },
                new { location = "West Wing", count = 356, percentage = "28.5%" },
                new { location = "Care Center - North", count = 150, percentage = "12.0%" },
                new { location = "Rehab Unit", count = 80, percentage = "6.4%" },
                new { location = "Other Locations", count = 20, percentage = "1.7%" }
            },
            careLevelDistribution = new[]
            {
                new { level = "Critical Care", count = 120 },
                new { level = "Assisted Living", count = 420 },
                new { level = "Independent", count = 560 },
                new { level = "Memory Care", count = 90 },
                new { level = "Palliative Care", count = 58 }
            }
        };

        return Ok(new { success = true, data = previewData });
    }
}
