namespace ConnectedCare.Application.Features.CustomReports.DTOs;

public class CustomReportPreviewDto
{
    public string ReportName { get; set; } = string.Empty;
    public string DateRange { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    public int TotalPatients { get; set; }
    public int Inpatients { get; set; }
    public int Outpatients { get; set; }
    public int DayCare { get; set; }
    public string DayCarePercentage { get; set; } = string.Empty;

    public List<ReportPreviewItemDto> PatientsByLocation { get; set; } = new();
    public List<ReportPreviewItemDto> CareLevelDistribution { get; set; } = new();
}
