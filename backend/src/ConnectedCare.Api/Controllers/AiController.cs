using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.AI.DTOs;
using ConnectedCare.Application.Features.AI.Services;

namespace ConnectedCare.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IAiOrchestrationService _orchestrationService;
    private readonly IPatientContextBuilder _contextBuilder;
    private readonly IPatientAccessAuthorizationService _authService;
    private readonly IAiEvaluationService _evaluationService;

    public AiController(
        IAiOrchestrationService orchestrationService,
        IPatientContextBuilder contextBuilder,
        IPatientAccessAuthorizationService authService,
        IAiEvaluationService evaluationService)
    {
        _orchestrationService = orchestrationService;
        _contextBuilder = contextBuilder;
        _authService = authService;
        _evaluationService = evaluationService;
    }

    private (string role, string userName, string userId) GetCallerIdentity()
    {
        var role = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value ?? "Doctor";
        var name = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name || c.Type == "unique_name" || c.Type == "username")?.Value ?? "Clinical Staff";
        var id = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "sub" || c.Type == "id")?.Value ?? string.Empty;

        return (role, name, id);
    }

    #region 1. AI Patient Summary Endpoints

    [HttpGet("patients/{id}/summary")]
    public async Task<IActionResult> GetPatientSummary(Guid id, [FromQuery] bool refresh = false)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "PatientSummary");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var summary = await _orchestrationService.GetOrGeneratePatientSummaryAsync(id, forceRefresh: refresh, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiPatientSummaryDto>.Ok(summary, "Patient summary retrieved successfully"));
    }

    [HttpPost("patients/{id}/summary/generate")]
    public async Task<IActionResult> GeneratePatientSummary(Guid id)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "PatientSummary");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var summary = await _orchestrationService.GetOrGeneratePatientSummaryAsync(id, forceRefresh: true, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiPatientSummaryDto>.Ok(summary, "Patient summary generated successfully"));
    }

    #endregion

    #region 2. AI Care Team Priorities Endpoints

    [HttpGet("patients/{id}/care-priorities")]
    public async Task<IActionResult> GetCarePriorities(Guid id, [FromQuery] bool refresh = false)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "CarePriorities");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var priorities = await _orchestrationService.GetOrGenerateCarePrioritiesAsync(id, forceRefresh: refresh, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiCarePrioritiesDto>.Ok(priorities, "Care team priorities retrieved successfully"));
    }

    [HttpPost("patients/{id}/care-priorities/generate")]
    public async Task<IActionResult> GenerateCarePriorities(Guid id)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "CarePriorities");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var priorities = await _orchestrationService.GetOrGenerateCarePrioritiesAsync(id, forceRefresh: true, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiCarePrioritiesDto>.Ok(priorities, "Care team priorities generated successfully"));
    }

    #endregion

    #region 3. AI Discharge Readiness Review Endpoints

    [HttpGet("patients/{id}/discharge-review")]
    public async Task<IActionResult> GetDischargeReview(Guid id, [FromQuery] bool refresh = false)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "DischargeReview");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var review = await _orchestrationService.GetOrGenerateDischargeReviewAsync(id, forceRefresh: refresh, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiDischargeReviewDto>.Ok(review, "Discharge review retrieved successfully"));
    }

    [HttpPost("patients/{id}/discharge-review/generate")]
    public async Task<IActionResult> GenerateDischargeReview(Guid id)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "DischargeReview");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var review = await _orchestrationService.GetOrGenerateDischargeReviewAsync(id, forceRefresh: true, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiDischargeReviewDto>.Ok(review, "Discharge review generated successfully"));
    }

    #endregion

    #region 4. AI Alert Prioritization Endpoints

    [HttpGet("patients/{id}/alert-prioritization")]
    public async Task<IActionResult> GetAlertPrioritization(Guid id, [FromQuery] bool refresh = false)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "AlertPrioritization");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var result = await _orchestrationService.GetOrGenerateAlertPrioritizationAsync(id, forceRefresh: refresh, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiAlertPrioritizationResultDto>.Ok(result, "Alert prioritization retrieved successfully"));
    }

    [HttpPost("patients/{id}/alert-prioritization/generate")]
    public async Task<IActionResult> GenerateAlertPrioritization(Guid id)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "AlertPrioritization");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var result = await _orchestrationService.GetOrGenerateAlertPrioritizationAsync(id, forceRefresh: true, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiAlertPrioritizationResultDto>.Ok(result, "Alert prioritization generated successfully"));
    }

    #endregion

    #region 5. AI Medication Intelligence & Review Endpoints (P1/P2)

    [HttpGet("patients/{id}/medication-review")]
    public async Task<IActionResult> GetMedicationReview(Guid id, [FromQuery] bool refresh = false)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "MedicationReview");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var result = await _orchestrationService.GetOrGenerateMedicationReviewAsync(id, forceRefresh: refresh, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiMedicationReviewDto>.Ok(result, "Medication safety review retrieved successfully"));
    }

    [HttpPost("patients/{id}/medication-review/generate")]
    public async Task<IActionResult> GenerateMedicationReview(Guid id)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "MedicationReview");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var result = await _orchestrationService.GetOrGenerateMedicationReviewAsync(id, forceRefresh: true, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiMedicationReviewDto>.Ok(result, "Medication safety review generated successfully"));
    }

    #endregion

    #region 6. Doctor & Nurse AI Copilot Orchestration Endpoints (P1)

    [HttpPost("copilot/doctor")]
    public async Task<IActionResult> ExecuteDoctorCopilot([FromBody] AiCopilotQueryDto query)
    {
        var auth = await _authService.AuthorizeCopilotAccessAsync(User, "Doctor");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var result = await _orchestrationService.ExecuteDoctorCopilotQueryAsync(query, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiCopilotResponseDto>.Ok(result, "Doctor AI clinical response generated"));
    }

    [HttpPost("copilot/nurse")]
    public async Task<IActionResult> ExecuteNurseCopilot([FromBody] AiCopilotQueryDto query)
    {
        var auth = await _authService.AuthorizeCopilotAccessAsync(User, "Nurse");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, user, _) = GetCallerIdentity();
        var result = await _orchestrationService.ExecuteNurseCopilotQueryAsync(query, callerRole: role, callerUser: user);
        return Ok(ApiResponse<AiCopilotResponseDto>.Ok(result, "Nurse AI bedside response generated"));
    }

    #endregion

    #region 7. Context Preview & Transparency Endpoint

    [HttpGet("patients/{id}/context-preview")]
    public async Task<IActionResult> GetContextPreview(Guid id)
    {
        var auth = await _authService.AuthorizePatientAiAccessAsync(User, id, "ContextPreview");
        if (!auth.IsAuthorized)
        {
            return StatusCode(auth.StatusCode, ApiResponse<string>.Fail(auth.FailureReason ?? "Access Denied", "AUTH_FORBIDDEN"));
        }

        var (role, _, _) = GetCallerIdentity();
        var preview = await _contextBuilder.GetContextPreviewAsync(id, role);
        return Ok(ApiResponse<AiContextPreviewDto>.Ok(preview, "Patient AI context preview retrieved"));
    }

    #endregion

    #region 8. Human-in-the-Loop Feedback, Disposition & Task Routing Endpoint

    [HttpPost("feedback")]
    public async Task<IActionResult> RecordFeedback([FromBody] AiFeedbackRequestDto feedback)
    {
        var (role, user, _) = GetCallerIdentity();
        var success = await _orchestrationService.RecordFeedbackAsync(feedback, callerRole: role, callerUser: user);
        return Ok(new { success = true, message = "Clinician review feedback and task routing processed successfully" });
    }

    #endregion

    #region 9. Formal AI Evaluation Benchmark Endpoints (P1)

    [HttpGet("evaluation/benchmark")]
    [HttpPost("evaluation/run")]
    public async Task<IActionResult> RunAiEvaluationBenchmark()
    {
        var benchmark = await _evaluationService.RunEvaluationSuiteAsync();
        return Ok(ApiResponse<AiEvaluationBenchmarkResultDto>.Ok(benchmark, "AI clinical evaluation benchmark completed"));
    }

    #endregion
}
