using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiWorkflowMetricRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string WorkflowName { get; set; } = string.Empty;
    public int RequestsCount { get; set; } = 4562;
    public string SuccessRate { get; set; } = "96.3%";
    public string AvgResponseTimeSeconds { get; set; } = "1.21 sec";
    public string TrendDataJson { get; set; } = "[]";
}
