using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class ActivitySummaryLog : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ActivityType { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string RelatedTo { get; set; } = string.Empty;
    public string LocationUnit { get; set; } = string.Empty;
    public string DateTimeText { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = string.Empty;
}
