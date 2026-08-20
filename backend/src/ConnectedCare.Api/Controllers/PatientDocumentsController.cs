using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Common.Models;
using System.Text.RegularExpressions;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/patients")]
public class PatientDocumentsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;
    private readonly IWebHostEnvironment _environment;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx", ".txt", ".csv", ".xls", ".xlsx"
    };

    public PatientDocumentsController(ConnectedCareDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    /// <summary>
    /// Uploads a file for a specific patient under Files/Patient/{PatientId}/{DocumentType}/
    /// </summary>
    [HttpPost("{patientId}/documents/upload")]
    [HttpPost("documents/upload")]
    public async Task<IActionResult> UploadPatientDocument(
        [FromRoute] string? patientId,
        [FromForm] string? patientIdForm,
        [FromForm] string? documentType,
        IFormFile? file)
    {
        var targetPatientId = !string.IsNullOrWhiteSpace(patientId) ? patientId : patientIdForm;

        if (string.IsNullOrWhiteSpace(targetPatientId))
        {
            return BadRequest(ApiResponse<string>.Fail("Patient ID is required.", "INVALID_PATIENT_ID"));
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<string>.Fail("Please select a valid file to upload.", "NO_FILE_PROVIDED"));
        }

        // 1. Verify Patient exists in DB
        Patient? patient = null;
        if (Guid.TryParse(targetPatientId, out var patientGuid))
        {
            patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == patientGuid);
        }

        if (patient == null)
        {
            patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientIdCode.ToLower() == targetPatientId.ToLower());
        }

        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found.", "PATIENT_NOT_FOUND"));
        }

        var resolvedPatientId = patient.Id.ToString();

        // 2. Validate & Normalize Document Category
        var validDocType = NormalizeDocumentType(documentType);

        // 3. Validate File Extension & Size (Max 15MB)
        var fileExt = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(fileExt) || !AllowedExtensions.Contains(fileExt))
        {
            return BadRequest(ApiResponse<string>.Fail($"The uploaded file type '{fileExt}' is not supported.", "INVALID_FILE_TYPE"));
        }

        const long maxSizeBytes = 15 * 1024 * 1024; // 15MB
        if (file.Length > maxSizeBytes)
        {
            return BadRequest(ApiResponse<string>.Fail("The uploaded file exceeds the maximum allowed size of 15MB.", "FILE_TOO_LARGE"));
        }

        // 4. Construct Target Directory Path: Files/Patient/{PatientId}/{DocumentType}/
        var rootFilesFolder = Path.Combine(_environment.ContentRootPath, "Files", "Patient", resolvedPatientId, validDocType);
        Directory.CreateDirectory(rootFilesFolder);

        // 5. Sanitize Filename & Handle Duplicates
        var originalNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
        var sanitizedBaseName = SanitizeFileName(originalNameWithoutExt);

        string safeFileName;
        if (validDocType == "ProfilePicture")
        {
            safeFileName = $"profile-picture{fileExt.ToLower()}";
        }
        else
        {
            safeFileName = $"{sanitizedBaseName}{fileExt.ToLower()}";
            var destinationPathCheck = Path.Combine(rootFilesFolder, safeFileName);
            
            // Prevent accidental overwrite
            if (System.IO.File.Exists(destinationPathCheck))
            {
                var uniqueSuffix = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
                safeFileName = $"{sanitizedBaseName}-{uniqueSuffix}{fileExt.ToLower()}";
            }
        }

        var fullPhysicalPath = Path.Combine(rootFilesFolder, safeFileName);

        // Path Traversal Security Check
        var fullCanonicalPath = Path.GetFullPath(fullPhysicalPath);
        var canonicalFolder = Path.GetFullPath(rootFilesFolder);
        if (!fullCanonicalPath.StartsWith(canonicalFolder, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(ApiResponse<string>.Fail("Invalid file path specification.", "SECURITY_VIOLATION"));
        }

        // 6. If ProfilePicture, handle clean replacement
        if (validDocType == "ProfilePicture")
        {
            try
            {
                var existingFiles = Directory.GetFiles(rootFilesFolder);
                foreach (var oldFile in existingFiles)
                {
                    System.IO.File.Delete(oldFile);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Failed to clean old profile picture: {ex.Message}");
            }
        }

        // 7. Save Physical File to Disk
        using (var stream = new FileStream(fullPhysicalPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Relative path e.g. Patient/38800930-cc79-47cf-ab2d-2cd986171be0/MedicalDocuments/Medical-Report.pdf
        var relativeStoragePath = $"Patient/{resolvedPatientId}/{validDocType}/{safeFileName}";

        // 8. Update Patient Avatar if ProfilePicture
        if (validDocType == "ProfilePicture")
        {
            var avatarUrl = $"/api/patients/{resolvedPatientId}/documents/ProfilePicture/{safeFileName}";
            patient.Avatar = avatarUrl;
            patient.UpdatedDate = DateTime.UtcNow;
            _context.Patients.Update(patient);
        }

        // 9. Save Metadata in Database
        var docRecord = new PatientDocumentRecord
        {
            Id = Guid.NewGuid(),
            PatientId = patient.Id,
            PatientName = patient.Name,
            PatientIdCode = patient.PatientIdCode,
            DocumentName = originalNameWithoutExt,
            FileName = safeFileName,
            DocumentType = validDocType,
            Category = validDocType,
            FilePath = relativeStoragePath,
            ContentType = file.ContentType ?? GetContentType(fileExt),
            FileSizeBytes = file.Length,
            FileSizeText = FormatFileSize(file.Length),
            UploadedDate = DateTime.UtcNow.ToString("MMM dd, yyyy hh:mm tt"),
            UploadedBy = "Staff",
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _context.PatientDocumentRecords.Add(docRecord);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "File uploaded successfully.",
            patientId = resolvedPatientId,
            fileName = safeFileName,
            documentType = validDocType,
            filePath = relativeStoragePath,
            data = docRecord
        });
    }

    /// <summary>
    /// Gets all document records for a patient
    /// </summary>
    [HttpGet("{patientId}/documents")]
    public async Task<IActionResult> GetPatientDocuments(string patientId)
    {
        var patient = await FindPatientAsync(patientId);
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found.", "PATIENT_NOT_FOUND"));
        }

        var docs = await _context.PatientDocumentRecords
            .Where(d => d.PatientId == patient.Id || d.PatientIdCode.ToLower() == patient.PatientIdCode.ToLower())
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync();

        return Ok(ApiResponse<List<PatientDocumentRecord>>.Ok(docs));
    }

    /// <summary>
    /// Streams/downloads a specific file for a patient
    /// </summary>
    [HttpGet("{patientId}/documents/{documentType}/{fileName}")]
    public async Task<IActionResult> GetPatientFile(string patientId, string documentType, string fileName)
    {
        var patient = await FindPatientAsync(patientId);
        if (patient == null)
        {
            return NotFound("Patient not found.");
        }

        var validDocType = NormalizeDocumentType(documentType);
        var resolvedPatientId = patient.Id.ToString();
        var safeFileName = Path.GetFileName(fileName);

        var physicalPath = Path.Combine(_environment.ContentRootPath, "Files", "Patient", resolvedPatientId, validDocType, safeFileName);

        // Security check
        var canonicalPath = Path.GetFullPath(physicalPath);
        var expectedRoot = Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "Files", "Patient", resolvedPatientId, validDocType));

        if (!canonicalPath.StartsWith(expectedRoot, StringComparison.OrdinalIgnoreCase) || !System.IO.File.Exists(canonicalPath))
        {
            return NotFound("Requested document file not found.");
        }

        var contentType = GetContentType(Path.GetExtension(safeFileName));
        return PhysicalFile(canonicalPath, contentType, safeFileName);
    }

    /// <summary>
    /// Deletes a specific patient document
    /// </summary>
    [HttpDelete("{patientId}/documents/{documentId}")]
    public async Task<IActionResult> DeletePatientDocument(string patientId, string documentId)
    {
        var patient = await FindPatientAsync(patientId);
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found.", "PATIENT_NOT_FOUND"));
        }

        PatientDocumentRecord? docRecord = null;
        if (Guid.TryParse(documentId, out var docGuid))
        {
            docRecord = await _context.PatientDocumentRecords.FirstOrDefaultAsync(d => d.Id == docGuid && (d.PatientId == patient.Id || d.PatientIdCode == patient.PatientIdCode));
        }

        if (docRecord == null)
        {
            docRecord = await _context.PatientDocumentRecords.FirstOrDefaultAsync(d => d.FileName.ToLower() == documentId.ToLower() && (d.PatientId == patient.Id || d.PatientIdCode == patient.PatientIdCode));
        }

        if (docRecord != null)
        {
            var resolvedPatientId = patient.Id.ToString();
            var physicalPath = Path.Combine(_environment.ContentRootPath, "Files", "Patient", resolvedPatientId, docRecord.DocumentType, docRecord.FileName);

            if (System.IO.File.Exists(physicalPath))
            {
                try
                {
                    System.IO.File.Delete(physicalPath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting file: {ex.Message}");
                }
            }

            _context.PatientDocumentRecords.Remove(docRecord);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("Document deleted successfully."));
        }

        return NotFound(ApiResponse<string>.Fail("Document record not found.", "NOT_FOUND"));
    }

    private async Task<Patient?> FindPatientAsync(string patientId)
    {
        if (Guid.TryParse(patientId, out var guid))
        {
            var p = await _context.Patients.FirstOrDefaultAsync(x => x.Id == guid);
            if (p != null) return p;
        }
        return await _context.Patients.FirstOrDefaultAsync(x => x.PatientIdCode.ToLower() == patientId.ToLower());
    }

    private static string NormalizeDocumentType(string? rawType)
    {
        if (string.IsNullOrWhiteSpace(rawType)) return "MedicalDocuments";
        var t = rawType.Trim();
        if (t.Equals("ProfilePicture", StringComparison.OrdinalIgnoreCase) || t.Equals("Profile", StringComparison.OrdinalIgnoreCase))
            return "ProfilePicture";
        if (t.Equals("OtherDocuments", StringComparison.OrdinalIgnoreCase) || t.Equals("Other", StringComparison.OrdinalIgnoreCase))
            return "OtherDocuments";
        return "MedicalDocuments";
    }

    private static string SanitizeFileName(string fileName)
    {
        var sanitized = Regex.Replace(fileName, @"[^\w\.-]", "-");
        sanitized = Regex.Replace(sanitized, @"-+", "-").Trim('-');
        return string.IsNullOrWhiteSpace(sanitized) ? "Document" : sanitized;
    }

    private static string FormatFileSize(long bytes)
    {
        if (bytes >= 1024 * 1024)
            return $"{(bytes / (1024.0 * 1024.0)):F1} MB";
        if (bytes >= 1024)
            return $"{(bytes / 1024.0):F1} KB";
        return $"{bytes} B";
    }

    private static string GetContentType(string extension)
    {
        return extension.ToLower() switch
        {
            ".pdf" => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".txt" => "text/plain",
            ".csv" => "text/csv",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            _ => "application/octet-stream",
        };
    }
}
