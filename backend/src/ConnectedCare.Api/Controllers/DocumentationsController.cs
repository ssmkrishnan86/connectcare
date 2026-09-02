using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/nurse-documentation")]
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
        var total = all.Count;
        var totalBase = total > 0 ? (double)total : 1.0;

        var completed = all.Count(d => d.Status == "Completed");
        var pending = all.Count(d => d.Status == "Pending");
        var needsReview = all.Count(d => d.Status == "Needs Review" || d.Status == "NeedsReview");
        var drafts = all.Count(d => d.Status == "Draft");

        var careNotes = all.Count(d => d.DocumentType == "Care Note");
        var assessments = all.Count(d => d.DocumentType == "Assessment");
        var medications = all.Count(d => d.DocumentType == "Medication");
        var education = all.Count(d => d.DocumentType == "Education");
        var reports = all.Count(d => d.DocumentType == "Report");
        var others = all.Count(d => d.DocumentType != "Care Note" && d.DocumentType != "Assessment" && d.DocumentType != "Medication" && d.DocumentType != "Education" && d.DocumentType != "Report");

        var stats = new
        {
            totalDocuments = total,
            completed = completed,
            completedPercentage = (int)Math.Round((completed / totalBase) * 100),
            pending = pending,
            pendingPercentage = (int)Math.Round((pending / totalBase) * 100),
            needsReview = needsReview,
            needsReviewPercentage = (int)Math.Round((needsReview / totalBase) * 100),
            drafts = drafts,
            draftsPercentage = (int)Math.Round((drafts / totalBase) * 100),

            careNotesCount = careNotes,
            assessmentsCount = assessments,
            medicationsCount = medications,
            educationCount = education,
            reportsCount = reports,
            otherDocumentsCount = others
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

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDocumentation(Guid id, [FromBody] NurseDocumentationRecord updatedDoc)
    {
        var existing = await _context.NurseDocumentations.FindAsync(id);
        if (existing == null)
        {
            return NotFound(new { success = false, message = "Documentation not found" });
        }

        if (!string.IsNullOrWhiteSpace(updatedDoc.DocumentName)) existing.DocumentName = updatedDoc.DocumentName;
        if (!string.IsNullOrWhiteSpace(updatedDoc.DocumentType)) existing.DocumentType = updatedDoc.DocumentType;
        if (!string.IsNullOrWhiteSpace(updatedDoc.Status)) existing.Status = updatedDoc.Status;
        if (updatedDoc.NotesContent != null) existing.NotesContent = updatedDoc.NotesContent;
        if (!string.IsNullOrWhiteSpace(updatedDoc.PatientName)) existing.PatientName = updatedDoc.PatientName;
        if (!string.IsNullOrWhiteSpace(updatedDoc.RoomLocation)) existing.RoomLocation = updatedDoc.RoomLocation;
        if (!string.IsNullOrWhiteSpace(updatedDoc.CareUnit)) existing.CareUnit = updatedDoc.CareUnit;

        existing.UpdatedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Documentation updated successfully", data = existing });
    }
}
