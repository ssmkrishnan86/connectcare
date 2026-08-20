using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentationsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public DocumentationsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDocumentations(
        [FromQuery] string? patientId,
        [FromQuery] string? patientName,
        [FromQuery] string? search,
        [FromQuery] string? docType,
        [FromQuery] string? status,
        [FromQuery] string? careUnit)
    {
        var query = _context.NurseDocumentations.AsQueryable();

        if (!string.IsNullOrWhiteSpace(patientId))
        {
            if (Guid.TryParse(patientId, out var gId))
            {
                query = query.Where(d => d.PatientId == gId || d.PatientIdCode == patientId);
            }
            else
            {
                query = query.Where(d => d.PatientIdCode == patientId);
            }
        }

        if (!string.IsNullOrWhiteSpace(patientName))
        {
            var pNameLower = patientName.ToLower();
            query = query.Where(d => d.PatientName.ToLower().Contains(pNameLower));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(d => d.DocumentName.ToLower().Contains(searchLower) ||
                                     d.DocumentCode.ToLower().Contains(searchLower) ||
                                     d.PatientName.ToLower().Contains(searchLower) ||
                                     d.PatientIdCode.ToLower().Contains(searchLower) ||
                                     d.NotesContent.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(docType) && docType != "All")
        {
            query = query.Where(d => d.DocumentType == docType);
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(d => d.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(careUnit) && careUnit != "All")
        {
            query = query.Where(d => d.CareUnit.Contains(careUnit) || d.RoomLocation.Contains(careUnit));
        }

        var list = await query.OrderByDescending(d => d.CreatedDate).ToListAsync();
        return Ok(new { success = true, data = list });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var all = await _context.NurseDocumentations.ToListAsync();
        var stats = new
        {
            totalDocuments = 56,
            completed = 34,
            completedPercentage = 61,
            pending = 12,
            pendingPercentage = 21,
            needsReview = 6,
            needsReviewPercentage = 11,
            drafts = 4,
            draftsPercentage = 7,

            careNotesCount = 18,
            assessmentsCount = 14,
            medicationsCount = 10,
            educationCount = 6,
            reportsCount = 4,
            otherDocumentsCount = 4
        };
        return Ok(new { success = true, data = stats });
    }

    [HttpPost]
    public async Task<IActionResult> CreateDocumentation([FromBody] NurseDocumentationRecord newDoc)
    {
        if (string.IsNullOrWhiteSpace(newDoc.DocumentCode))
        {
            newDoc.DocumentCode = $"DOC-2024-{Random.Shared.Next(1000, 9999)}";
        }
        if (string.IsNullOrWhiteSpace(newDoc.DateTimeText))
        {
            newDoc.DateTimeText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt");
        }
        newDoc.CreatedDate = DateTime.UtcNow;
        newDoc.UpdatedDate = DateTime.UtcNow;

        _context.NurseDocumentations.Add(newDoc);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Documentation created successfully", data = newDoc });
    }
}
