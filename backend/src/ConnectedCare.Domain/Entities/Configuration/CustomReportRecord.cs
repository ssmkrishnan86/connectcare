using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class CustomReportRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ReportName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string LastModifiedText { get; set; } = string.Empty;
    public string Frequency { get; set; } = "Daily"; // Daily, Weekly, Monthly
    public string Category { get; set; } = "General";
    public string Status { get; set; } = "Active";
}
