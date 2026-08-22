using ConnectedCare.Application.Features.CustomReports.DTOs;

namespace ConnectedCare.Application.Features.CustomReports.Services;

public interface ICustomReportService
{
    Task<List<CustomReportDto>> GetReportsAsync(
        string? search,
        string? category);

    Task<CustomReportDto> CreateReportAsync(
        CreateCustomReportRequest request);

    Task<CustomReportPreviewDto?> GetReportPreviewAsync(
        Guid id);
}
