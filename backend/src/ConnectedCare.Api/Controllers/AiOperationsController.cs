using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/ai-operations")]
public class AiOperationsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public AiOperationsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var services = await _context.AiServiceStatusRecords.ToListAsync();
        var workflows = await _context.AiWorkflowMetricRecords.ToListAsync();
        var recentActivities = await _context.AiActivityLogRecords.OrderByDescending(a => a.CreatedDate).Take(10).ToListAsync();

        var overview = new
        {
            kpis = new
            {
                aiRequestsToday = "2,458",
                aiRequestsChange = "↑ 18.5% vs yesterday",
                successRate = "95.8%",
                successRateChange = "↑ 2.4% vs yesterday",
                avgResponseTime = "1.42 sec",
                avgResponseTimeChange = "↓ 0.38 sec vs yesterday",
                tokensUsedToday = "1.2M",
                tokensUsedChange = "↑ 12.7% vs yesterday",
                errorsToday = "28",
                errorsChange = "↓ 17.6% vs yesterday"
            },
            summaryStats = new
            {
                totalRequests = "16,842",
                totalTokens = "8.7M",
                totalCost = "$48.62",
                avgResponseTime = "1.42 sec"
            },
            modelUsage = new[]
            {
                new { model = "GPT-4o", tokens = "4.2M", percentage = "48.3%", color = "#8B5CF6" },
                new { model = "GPT-4o Mini", tokens = "2.1M", percentage = "24.1%", color = "#06B6D4" },
                new { model = "Claude 3 Haiku", tokens = "1.3M", percentage = "14.9%", color = "#10B981" },
                new { model = "Gemini 1.5 Pro", tokens = "0.7M", percentage = "8.0%", color = "#F59E0B" },
                new { model = "GPT-3.5 Turbo", tokens = "0.4M", percentage = "4.7%", color = "#EF4444" }
            },
            alertsAndRecommendations = new[]
            {
                new { title = "High Error Rate Detected", type = "warning", description = "Conversation Assistant is experiencing a higher error rate than usual.", actionText = "View Details" },
                new { title = "Model Optimization Available", type = "info", description = "Switching some workflows to GPT-4o Mini could reduce costs by up to 18%.", actionText = "View Recommendation" }
            },
            potentialMonthlySavings = "$1,245",
            potentialMonthlySavingsPercentage = "18%",
            services = services,
            workflows = workflows,
            recentActivities = recentActivities
        };

        return Ok(new { success = true, data = overview });
    }

    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        var services = await _context.AiServiceStatusRecords.ToListAsync();
        return Ok(new { success = true, data = services });
    }

    [HttpGet("workflows")]
    public async Task<IActionResult> GetWorkflows()
    {
        var workflows = await _context.AiWorkflowMetricRecords.ToListAsync();
        return Ok(new { success = true, data = workflows });
    }

    [HttpGet("activities")]
    public async Task<IActionResult> GetActivities()
    {
        var activities = await _context.AiActivityLogRecords.OrderByDescending(a => a.CreatedDate).ToListAsync();
        return Ok(new { success = true, data = activities });
    }
}
