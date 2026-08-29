using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Application.Features.AI.Services;

public class PatientAccessAuthorizationService : IPatientAccessAuthorizationService
{
    private readonly ConnectedCareDbContext _context;
    private readonly ILogger<PatientAccessAuthorizationService> _logger;

    public PatientAccessAuthorizationService(
        ConnectedCareDbContext context,
        ILogger<PatientAccessAuthorizationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PatientAuthorizationResult> AuthorizePatientAiAccessAsync(
        ClaimsPrincipal user,
        Guid patientId,
        string workflowName,
        CancellationToken cancellationToken = default)
    {
        // 1. Validated JWT identity check
        if (user == null || user.Identity == null || !user.Identity.IsAuthenticated)
        {
            _logger.LogWarning("[AUTH_DENIAL] Unauthenticated request for AI workflow {Workflow} on Patient {PatientId}", workflowName, patientId);
            return new PatientAuthorizationResult
            {
                IsAuthorized = false,
                StatusCode = 401,
                FailureReason = "Authentication required. Please provide a valid JWT bearer token."
            };
        }

        var role = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value ?? "Doctor";
        var userId = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "sub" || c.Type == "id")?.Value;

        // 2. Role permission check for AI workflows
        var allowedRoles = new[] { "doctor", "nurse", "carecoordinator", "pharmacist", "admin", "superadmin", "systemadmin", "clinicaldirector" };
        if (!allowedRoles.Contains(role.ToLowerInvariant()))
        {
            _logger.LogWarning("[AUTH_DENIAL] User {UserId} with Role {Role} forbidden from executing AI workflow {Workflow}", userId, role, workflowName);
            return new PatientAuthorizationResult
            {
                IsAuthorized = false,
                StatusCode = 403,
                FailureReason = $"Role '{role}' is not authorized to access clinical AI workflows."
            };
        }

        // 3. Patient existence check
        var patient = await _context.Patients
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == patientId, cancellationToken);

        if (patient == null)
        {
            _logger.LogWarning("[AUTH_NOT_FOUND] Patient {PatientId} not found during AI authorization check", patientId);
            return new PatientAuthorizationResult
            {
                IsAuthorized = false,
                StatusCode = 404,
                FailureReason = $"Patient record '{patientId}' does not exist in authoritative EHR."
            };
        }

        // 4. Care Unit / Department authorization check (if caller has restricted care unit claim)
        var userCareUnit = user.Claims.FirstOrDefault(c => c.Type == "careUnit" || c.Type == "department")?.Value;
        if (!string.IsNullOrWhiteSpace(userCareUnit) && !string.IsNullOrWhiteSpace(patient.CareUnit))
        {
            if (!string.Equals(userCareUnit, "All", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(userCareUnit, patient.CareUnit, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("[AUTH_DENIAL] Care-unit scope mismatch for User {UserId} (Unit: {UserUnit}) to Patient {PatientId} (Unit: {PatientUnit})",
                    userId, userCareUnit, patientId, patient.CareUnit);
                return new PatientAuthorizationResult
                {
                    IsAuthorized = false,
                    StatusCode = 403,
                    FailureReason = $"Access restricted to '{userCareUnit}' care unit. Patient is in '{patient.CareUnit}'."
                };
            }
        }

        return new PatientAuthorizationResult
        {
            IsAuthorized = true,
            StatusCode = 200
        };
    }

    public Task<PatientAuthorizationResult> AuthorizeCopilotAccessAsync(
        ClaimsPrincipal user,
        string targetRole,
        CancellationToken cancellationToken = default)
    {
        if (user == null || user.Identity == null || !user.Identity.IsAuthenticated)
        {
            return Task.FromResult(new PatientAuthorizationResult
            {
                IsAuthorized = false,
                StatusCode = 401,
                FailureReason = "Authentication required. Please provide a valid JWT bearer token."
            });
        }

        var callerRole = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value ?? "Doctor";
        var allowedRoles = new[] { "doctor", "nurse", "carecoordinator", "pharmacist", "admin", "superadmin", "systemadmin", "clinicaldirector" };

        if (!allowedRoles.Contains(callerRole.ToLowerInvariant()))
        {
            return Task.FromResult(new PatientAuthorizationResult
            {
                IsAuthorized = false,
                StatusCode = 403,
                FailureReason = $"Role '{callerRole}' is not authorized to access AI Copilot services."
            });
        }

        return Task.FromResult(new PatientAuthorizationResult
        {
            IsAuthorized = true,
            StatusCode = 200
        });
    }
}
