using System;
using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiFeedbackRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string WorkflowType { get; set; } = "PatientSummary"; // PatientSummary, CarePriorities, DischargeReview, AlertPrioritization, General
    public string TargetEntityId { get; set; } = string.Empty;
    public string Action { get; set; } = "Accepted"; // Accepted, Edited, Dismissed, ReportedIssue
    public string UserRole { get; set; } = "Doctor";
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? FeedbackNotes { get; set; }
    public string? OriginalOutputJson { get; set; }
    public string? EditedOutputJson { get; set; }
    public long LatencyMs { get; set; } = 0;
    public string ModelVersion { get; set; } = "gpt-4o";
    public bool SafetyFlag { get; set; } = false;
    public Guid? ResultingTaskId { get; set; }
}
