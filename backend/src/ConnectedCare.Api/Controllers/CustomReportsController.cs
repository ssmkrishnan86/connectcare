using ConnectedCare.Application.Features.CustomReports.DTOs;
using ConnectedCare.Application.Features.CustomReports.Services;
using Microsoft.AspNetCore.Mvc;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/custom-reports")]
public class CustomReportsController : ControllerBase
{
    private readonly ICustomReportService _service;

    public CustomReportsController(ICustomReportService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetReports(
        [FromQuery] string? search,
        [FromQuery] string? category)
    {
        var reports = await _service.GetReportsAsync(search, category);

        return Ok(new
        {
            success = true,
            data = reports
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateReport(
        [FromBody] CreateCustomReportRequest request)
    {
        var report = await _service.CreateReportAsync(request);

        return Ok(new
        {
            success = true,
            message = "Custom report created successfully",
            data = report
        });
    }

    [HttpGet("preview/{id}")]
    public async Task<IActionResult> GetReportPreview(Guid id)
    {
        var preview = await _service.GetReportPreviewAsync(id);

        if (preview == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Report not found"
            });
        }

        return Ok(new
        {
            success = true,
            data = preview
        });
    }
}

