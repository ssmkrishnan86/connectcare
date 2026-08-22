namespace ConnectedCare.Application.Features.CustomReports.DTOs;

public class CustomReportDto
{
    public Guid Id { get; set; }
    public string ReportName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string LastModifiedText { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
