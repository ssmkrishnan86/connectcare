using ConnectedCare.Application.Common.Interfaces;
using ConnectedCare.Application.Features.CustomReports.DTOs;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.CustomReports.Services;

public class CustomReportService : ICustomReportService
{
    private readonly ICustomReportRepository _repository;

    public CustomReportService(ICustomReportRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CustomReportDto>> GetReportsAsync(
        string? search,
        string? category)
    {
        var reports = await _repository.GetReportsAsync(search, category);

        return reports
            .Select(MapToDto)
            .ToList();
    }

    public async Task<CustomReportDto> CreateReportAsync(
        CreateCustomReportRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ReportName))
        {
            throw new ArgumentException(
                "Report name is required.",
                nameof(request.ReportName));
        }

        var report = new CustomReportRecord
        {
            ReportName = request.ReportName.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            CreatedBy = string.IsNullOrWhiteSpace(request.CreatedBy)
                ? "System"
                : request.CreatedBy.Trim(),
            LastModifiedText = DateTime.UtcNow.ToString("MMM dd, yyyy"),
            Frequency = string.IsNullOrWhiteSpace(request.Frequency)
                ? "Daily"
                : request.Frequency.Trim(),
            Category = string.IsNullOrWhiteSpace(request.Category)
                ? "General"
                : request.Category.Trim(),
            Status = string.IsNullOrWhiteSpace(request.Status)
                ? "Active"
                : request.Status.Trim()
        };

        report.CreatedDate = DateTime.UtcNow;
        report.UpdatedDate = DateTime.UtcNow;

        var created = await _repository.AddAsync(report);

        return MapToDto(created);
    }

    public async Task<CustomReportPreviewDto?> GetReportPreviewAsync(
        Guid id)
    {
        var report = await _repository.GetReportAsync(id);

        if (report == null)
        {
            return null;
        }

        return new CustomReportPreviewDto
        {
            ReportName = report.ReportName,
            DateRange = string.Empty,
            Location = "All Locations",
            TotalPatients = 0,
            Inpatients = 0,
            Outpatients = 0,
            DayCare = 0,
            DayCarePercentage = "0%",
            PatientsByLocation = new List<ReportPreviewItemDto>(),
            CareLevelDistribution = new List<ReportPreviewItemDto>()
        };
    }

    private static CustomReportDto MapToDto(
        CustomReportRecord report)
    {
        return new CustomReportDto
        {
            Id = report.Id,
            ReportName = report.ReportName,
            Description = report.Description,
            CreatedBy = report.CreatedBy,
            LastModifiedText = report.LastModifiedText,
            Frequency = report.Frequency,
            Category = report.Category,
            Status = report.Status
        };
    }
}
