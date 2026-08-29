using System;
using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiPatientSummaryRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    
    // Core Clinical Summary Sections
    public string CurrentStatus { get; set; } = string.Empty;
    public string RecentChanges { get; set; } = string.Empty;
    public string ActiveConcerns { get; set; } = string.Empty;
    public string OutstandingActions { get; set; } = string.Empty;
    public string FollowUpPlan { get; set; } = string.Empty;
    
    // Metadata & Governance
    public string CitationsJson { get; set; } = "[]";
    public DateTime DataFreshnessUtc { get; set; } = DateTime.UtcNow;
    public string ModelVersion { get; set; } = "gpt-4o";
    public string DispositionStatus { get; set; } = "Draft"; // Draft, Accepted, Edited, Dismissed
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedDate { get; set; }
    public string? ReviewNotes { get; set; }
    public string? RawModelResponse { get; set; }
}
