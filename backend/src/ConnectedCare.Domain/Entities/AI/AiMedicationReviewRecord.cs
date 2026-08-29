using System;
using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiMedicationReviewRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;

    // Review Summary & Score
    public int SafetyScore { get; set; } = 95; // 0 - 100
    public string ReviewStatus { get; set; } = "Completed"; // Completed, Warning, ActionRequired
    public string ClinicalSynthesis { get; set; } = string.Empty;

    // Structured JSON Fields
    public string InteractionsJson { get; set; } = "[]"; // Drug-Drug & Drug-Condition interaction warnings
    public string DosageAdjustmentFlagsJson { get; set; } = "[]"; // Renal, hepatic, geriatric dosage adjustments
    public string BeersCriteriaFlagsJson { get; set; } = "[]"; // High-risk geriatric criteria
    public string RecommendationsJson { get; set; } = "[]"; // Suggested actions for pharmacist / doctor

    // Governance & Human Disposition
    public string DispositionStatus { get; set; } = "Pending"; // Pending, PharmacistSignedOff, PhysicianReviewed, Dismissed
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedDate { get; set; }
    public string? ReviewNotes { get; set; }
    public string ModelVersion { get; set; } = "gpt-4o";
}
