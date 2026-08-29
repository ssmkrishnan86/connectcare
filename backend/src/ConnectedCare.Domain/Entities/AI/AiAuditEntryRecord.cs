using System;
using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiAuditEntryRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string WorkflowType { get; set; } = "PatientSummary";
    public string ModelVersion { get; set; } = "gpt-4o";
    public string Provider { get; set; } = "OpenAI";
    public int PromptTokens { get; set; } = 0;
    public int CompletionTokens { get; set; } = 0;
    public int TotalTokens { get; set; } = 0;
    public long LatencyMs { get; set; } = 0;
    public bool SafetyCheckPassed { get; set; } = true;
    public string Status { get; set; } = "Success"; // Success, Warning, Error
    public string? ErrorMessage { get; set; }
    public string UserRole { get; set; } = "Doctor";
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime RequestTimestampUtc { get; set; } = DateTime.UtcNow;
}
