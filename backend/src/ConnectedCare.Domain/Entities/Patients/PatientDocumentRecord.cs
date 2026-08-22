using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class PatientDocumentRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string DocumentType { get; set; } = "MedicalDocuments"; // ProfilePicture, MedicalDocuments, OtherDocuments
    public string Category { get; set; } = "MedicalDocuments";
    public string FilePath { get; set; } = string.Empty; // Patient/{PatientId}/{DocumentType}/{FileName}
    public string ContentType { get; set; } = "application/pdf";
    public long FileSizeBytes { get; set; } = 0;
    public string UploadedDate { get; set; } = string.Empty;
    public string FileSizeText { get; set; } = "1.2 MB";
    public string UploadedBy { get; set; } = "Dr. Sarah Wilson";
}
