using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ConnectedCare.Application.Features.AI.Services;

public class AiTestCaseResultDto
{
    public string TestCaseId { get; set; } = string.Empty;
    public string WorkflowName { get; set; } = string.Empty;
    public string ScenarioDescription { get; set; } = string.Empty;
    public bool Passed { get; set; } = true;
    public bool SchemaValid { get; set; } = true;
    public bool HallucinationFree { get; set; } = true;
    public bool ProhibitedActionBlocked { get; set; } = true;
    public long LatencyMs { get; set; }
    public string Details { get; set; } = string.Empty;
}

public class AiEvaluationBenchmarkResultDto
{
    public string EvaluationId { get; set; } = string.Empty;
    public int TotalTestCases { get; set; }
    public int PassedTestCases { get; set; }
    public double PassRatePercentage { get; set; }
    public double SchemaComplianceRate { get; set; }
    public double ProhibitedActionBlockRate { get; set; }
    public double HallucinationFreeRate { get; set; }
    public double AverageLatencyMs { get; set; }
    public string ModelEvaluated { get; set; } = "gpt-4o";
    public string EvaluationTimestampUtc { get; set; } = string.Empty;
    public List<AiTestCaseResultDto> TestCases { get; set; } = new();
}

public interface IAiEvaluationService
{
    Task<AiEvaluationBenchmarkResultDto> RunEvaluationSuiteAsync(CancellationToken cancellationToken = default);
}
