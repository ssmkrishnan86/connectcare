using System;
using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiDischargeReviewRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    
    // Readiness Assessment
    public int ReadinessScore { get; set; } = 0; // 0 to 100
    public string ReadinessStatus { get; set; } = "Conditional"; // Ready, Conditional, NotReady
    public string SummaryFindings { get; set; } = string.Empty;
    
    // Detailed Structured Findings (JSON arrays)
    public string MissingItemsJson { get; set; } = "[]";
    public string ConflictingItemsJson { get; set; } = "[]";
    public string RiskFlagsJson { get; set; } = "[]";
    public string ActionableRecommendationsJson { get; set; } = "[]";
    
    public Guid? ChecklistRefId { get; set; }
    
    // Human Review Disposition
    public string DispositionStatus { get; set; } = "Pending"; // Pending, ApprovedByClinician, Overridden, Dismissed
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedDate { get; set; }
    public string? ReviewNotes { get; set; }
    public string ModelVersion { get; set; } = "gpt-4o";
}
