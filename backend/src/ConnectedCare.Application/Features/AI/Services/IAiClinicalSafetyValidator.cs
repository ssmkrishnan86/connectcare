using System.Threading;
using System.Threading.Tasks;
using ConnectedCare.Application.Features.AI.DTOs;

namespace ConnectedCare.Application.Features.AI.Services;

public class AiSafetyValidationResult
{
    public bool IsApproved { get; set; } = true;
    public bool HasWarnings { get; set; } = false;
    public bool IsBlocked { get; set; } = false;
    public string Status { get; set; } = "Approved"; // Approved, WarningFlagged, Blocked
    public string ValidationSummary { get; set; } = "Passed clinical safety verification.";
    public List<string> Findings { get; set; } = new();
}

public interface IAiClinicalSafetyValidator
{
    Task<AiSafetyValidationResult> ValidateOutputAsync(
        string rawOutputJson,
        string workflowType,
        PatientContextBundle contextBundle,
        CancellationToken cancellationToken = default);
}
