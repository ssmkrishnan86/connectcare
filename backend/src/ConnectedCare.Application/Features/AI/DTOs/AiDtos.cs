using System;
using System.Collections.Generic;

namespace ConnectedCare.Application.Features.AI.DTOs;

#region Patient Context Models (Minimum-Necessary PHI Boundary)

public class PatientContextBundle
{
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string RoomBed { get; set; } = string.Empty;
    public string PrimaryDoctor { get; set; } = string.Empty;
    public string AssignedNurse { get; set; } = string.Empty;
    public string AdmissionDate { get; set; } = string.Empty;
    public string FallRiskLevel { get; set; } = "Low";
    
    // Clinical Data Bundles
    public List<string> ActiveDiagnoses { get; set; } = new();
    public List<string> Allergies { get; set; } = new();
    public List<ContextMedicationItem> ActiveMedications { get; set; } = new();
    public List<ContextVitalItem> RecentVitals { get; set; } = new();
    public List<ContextLabItem> RecentLabs { get; set; } = new();
    public List<ContextAlertItem> ActiveAlerts { get; set; } = new();
    public List<ContextTaskItem> PendingTasks { get; set; } = new();
    public List<string> RecentNotes { get; set; } = new();
    public ContextDischargeChecklistInfo? DischargeChecklist { get; set; }
    public DateTime ContextGeneratedUtc { get; set; } = DateTime.UtcNow;
}

public class ContextMedicationItem
{
    public string Name { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public string? PrescribedBy { get; set; }
    public string? StartDate { get; set; }
}

public class ContextVitalItem
{
    public string BloodPressure { get; set; } = string.Empty;
    public string HeartRate { get; set; } = string.Empty;
    public string TemperatureF { get; set; } = string.Empty;
    public string SpO2 { get; set; } = string.Empty;
    public string RespirationRate { get; set; } = string.Empty;
    public string PainLevel { get; set; } = string.Empty;
    public string RecordedAt { get; set; } = string.Empty;
}

public class ContextLabItem
{
    public string TestName { get; set; } = string.Empty;
    public string ResultValue { get; set; } = string.Empty;
    public string ReferenceRange { get; set; } = string.Empty;
    public string Status { get; set; } = "Normal"; // Normal, Abnormal, Critical
    public string RecordedAt { get; set; } = string.Empty;
}

public class ContextAlertItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}

public class ContextTaskItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? DueDate { get; set; }
    public string? AssignedTo { get; set; }
}

public class ContextDischargeChecklistInfo
{
    public Guid ChecklistId { get; set; }
    public string Status { get; set; } = "In Progress";
    public int ProgressPercentage { get; set; }
    public int CompletedItemsCount { get; set; }
    public int TotalItemsCount { get; set; }
    public int PendingItemsCount { get; set; }
    public List<string> PendingItemTitles { get; set; } = new();
}

#endregion

#region P0 Workflow DTOs

// 1. AI Patient Summary
public class AiPatientSummaryDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    
    public string CurrentStatus { get; set; } = string.Empty;
    public string RecentChanges { get; set; } = string.Empty;
    public string ActiveConcerns { get; set; } = string.Empty;
    public string OutstandingActions { get; set; } = string.Empty;
    public string FollowUpPlan { get; set; } = string.Empty;
    
    public List<string> Citations { get; set; } = new();
    public DateTime DataFreshnessUtc { get; set; } = DateTime.UtcNow;
    public string ModelVersion { get; set; } = "gpt-4o";
    public string DispositionStatus { get; set; } = "Draft"; // Draft, Accepted, Edited, Dismissed
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedDate { get; set; }
    public bool IsAiGenerated { get; set; } = true;
    public long LatencyMs { get; set; }
}

// 2. AI Care Team Intelligence
public class AiCarePrioritiesDto
{
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public List<AiCarePriorityItemDto> Priorities { get; set; } = new();
    public DateTime GeneratedAtUtc { get; set; } = DateTime.UtcNow;
    public string ModelVersion { get; set; } = "gpt-4o";
    public long LatencyMs { get; set; }
}

public class AiCarePriorityItemDto
{
    public Guid Id { get; set; }
    public string PriorityLevel { get; set; } = "High"; // Critical, High, Medium, Low
    public string TargetRole { get; set; } = "Nurse"; // Doctor, Nurse, CareCoordinator, Pharmacist, SocialWorker
    public string Title { get; set; } = string.Empty;
    public string Rationale { get; set; } = string.Empty;
    public string SuggestedAction { get; set; } = string.Empty;
    public string ActionType { get; set; } = "TaskCreation"; // OrderReview, TaskCreation, MedicationRecon, VitalsCheck, CarePlanUpdate
    public string Urgency { get; set; } = "Today"; // Immediate, Today, NextShift, Routine
    public string DispositionStatus { get; set; } = "Pending"; // Pending, Accepted, Dismissed
    public string? ActionedBy { get; set; }
    public DateTime? ActionedDate { get; set; }
    public Guid? ResultingTaskId { get; set; }
    public string? ResultingTaskIdCode { get; set; }
}

// 3. AI Discharge Review
public class AiDischargeReviewDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public int ReadinessScore { get; set; } = 0; // 0 to 100
    public string ReadinessStatus { get; set; } = "Conditional"; // Ready, Conditional, NotReady
    public string SummaryFindings { get; set; } = string.Empty;
    public List<string> MissingItems { get; set; } = new();
    public List<string> ConflictingItems { get; set; } = new();
    public List<string> RiskFlags { get; set; } = new();
    public List<string> ActionableRecommendations { get; set; } = new();
    public Guid? ChecklistRefId { get; set; }
    public string DispositionStatus { get; set; } = "Pending";
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedDate { get; set; }
    public DateTime GeneratedAtUtc { get; set; } = DateTime.UtcNow;
    public string ModelVersion { get; set; } = "gpt-4o";
    public long LatencyMs { get; set; }
}

// 4. AI Alert Prioritization
public class AiAlertPrioritizationResultDto
{
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public List<AiPrioritizedAlertDto> RankedAlerts { get; set; } = new();
    public int TotalAlertsEvaluated { get; set; }
    public DateTime GeneratedAtUtc { get; set; } = DateTime.UtcNow;
    public string ModelVersion { get; set; } = "gpt-4o";
    public long LatencyMs { get; set; }
}

public class AiPrioritizedAlertDto
{
    public Guid Id { get; set; }
    public Guid AlertId { get; set; }
    public int AiRankScore { get; set; } // 1-100 (higher = more urgent)
    public string UrgencyLevel { get; set; } = "High"; // Critical, High, Medium, Low
    public string ClinicalRationale { get; set; } = string.Empty;
    public string SuggestedIntervention { get; set; } = string.Empty;
    public string OriginalSeverity { get; set; } = string.Empty;
    public string OriginalTitle { get; set; } = string.Empty;
    public string OriginalType { get; set; } = string.Empty;
    public string OriginalCreatedAt { get; set; } = string.Empty;
    public string DispositionStatus { get; set; } = "Active";
}

// 5. AI Medication Intelligence & Review DTO
public class AiMedicationReviewDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public int SafetyScore { get; set; } = 95;
    public string ReviewStatus { get; set; } = "Completed";
    public string ClinicalSynthesis { get; set; } = string.Empty;
    public List<AiMedicationSafetyAlertDto> SafetyAlerts { get; set; } = new();
    public List<string> BeersCriteriaFlags { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
    public string DispositionStatus { get; set; } = "Pending";
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedDate { get; set; }
    public string ModelVersion { get; set; } = "gpt-4o";
    public long LatencyMs { get; set; }
}

public class AiMedicationSafetyAlertDto
{
    public string Severity { get; set; } = "Warning"; // Critical, Warning, Information
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
}

// 6. Doctor & Nurse AI Copilot Query & Response DTOs
public class AiCopilotQueryDto
{
    public Guid? PatientId { get; set; }
    public string? PatientIdCode { get; set; }
    public string? PatientName { get; set; }
    public string PromptQuery { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string TargetRole { get; set; } = "Doctor"; // Doctor or Nurse
}

public class AiCopilotResponseDto
{
    public string ResponseText { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public List<string> Citations { get; set; } = new();
    public string ModelVersion { get; set; } = "gpt-4o";
    public string SafetyStatus { get; set; } = "Approved";
    public bool GuardrailsEnforced { get; set; } = true;
    public long LatencyMs { get; set; }
}

// 7. Context Preview / Transparency DTO
public class AiContextPreviewDto
{
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string AuthorizedScope { get; set; } = string.Empty;
    public PatientContextBundle ContextBundle { get; set; } = new();
    public string Purpose { get; set; } = "Clinical Intelligence Generation";
    public string SafetyPolicy { get; set; } = "Minimum-Necessary PHI Boundary strictly enforced. Output requires licensed clinician review.";
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
}

// 8. Feedback / Human-in-the-Loop Action Request DTO
public class AiFeedbackRequestDto
{
    public string WorkflowType { get; set; } = "PatientSummary"; // PatientSummary, CarePriorities, DischargeReview, AlertPrioritization, MedicationReview, Copilot
    public string TargetEntityId { get; set; } = string.Empty;
    public string Action { get; set; } = "Accepted"; // Accepted, Edited, Dismissed, ReportedIssue
    public string? FeedbackNotes { get; set; }
    public string? EditedContent { get; set; }
    public bool SafetyFlag { get; set; } = false;
    public string? UserRole { get; set; }
    public string? UserName { get; set; }
    public Guid? ResultingTaskId { get; set; }
    public bool CreateTaskOnAccept { get; set; } = true;
}

#endregion

