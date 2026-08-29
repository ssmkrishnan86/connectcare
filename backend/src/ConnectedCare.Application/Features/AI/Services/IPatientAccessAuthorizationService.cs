using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace ConnectedCare.Application.Features.AI.Services;

public class PatientAuthorizationResult
{
    public bool IsAuthorized { get; set; } = true;
    public string? FailureReason { get; set; }
    public int StatusCode { get; set; } = 200; // 200, 401, 403, 404
}

public interface IPatientAccessAuthorizationService
{
    Task<PatientAuthorizationResult> AuthorizePatientAiAccessAsync(
        ClaimsPrincipal user,
        Guid patientId,
        string workflowName,
        CancellationToken cancellationToken = default);

    Task<PatientAuthorizationResult> AuthorizeCopilotAccessAsync(
        ClaimsPrincipal user,
        string targetRole,
        CancellationToken cancellationToken = default);
}
