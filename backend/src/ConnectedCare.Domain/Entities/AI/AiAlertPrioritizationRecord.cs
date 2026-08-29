using System;
using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiAlertPrioritizationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AlertId { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    
    // AI Prioritization Output
    public int AiRankScore { get; set; } = 50; // 1 to 100
    public string UrgencyLevel { get; set; } = "High"; // Critical, High, Medium, Low
    public string ClinicalRationale { get; set; } = string.Empty;
    public string SuggestedIntervention { get; set; } = string.Empty;
    
    // Preserved Original Deterministic Data
    public string OriginalSeverity { get; set; } = string.Empty;
    public string OriginalTitle { get; set; } = string.Empty;
    public string OriginalSource { get; set; } = string.Empty;
    
    // Human Disposition
    public string DispositionStatus { get; set; } = "Active"; // Active, Overridden, Dismissed, Resolved
    public string? ActionedBy { get; set; }
    public DateTime? ActionedDate { get; set; }
}
