namespace ConnectedCare.Application.Features.CustomReports.DTOs;

public class CreateCustomReportRequest
{
    public string ReportName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? CreatedBy { get; set; }
    public string? Frequency { get; set; }
    public string? Category { get; set; }
    public string? Status { get; set; }
}
