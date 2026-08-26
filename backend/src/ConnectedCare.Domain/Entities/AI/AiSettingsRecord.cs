using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiSettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PrimaryModel { get; set; } = "gpt-4o";
    public string FallbackModel { get; set; } = "gpt-4o-mini";
    public string MonthlyTokenLimit { get; set; } = "15M";
    public int MaxConcurrentRequests { get; set; } = 25;
    public bool AutoRetryFailed { get; set; } = true;
    public bool EnableSafetyGuardrails { get; set; } = true;
    public string ActiveProvider { get; set; } = "OpenAI";
    public int TokensUsedThisMonth { get; set; } = 0;
}
