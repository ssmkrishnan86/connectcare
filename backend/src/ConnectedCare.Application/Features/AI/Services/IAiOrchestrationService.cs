using System;
using System.Threading;
using System.Threading.Tasks;
using ConnectedCare.Application.Features.AI.DTOs;

namespace ConnectedCare.Application.Features.AI.Services;

public interface IAiOrchestrationService
{
    // P0 Workflows
    Task<AiPatientSummaryDto> GetOrGeneratePatientSummaryAsync(Guid patientId, bool forceRefresh = false, string? callerRole = null, string? callerUser = null, CancellationToken cancellationToken = default);
    Task<AiCarePrioritiesDto> GetOrGenerateCarePrioritiesAsync(Guid patientId, bool forceRefresh = false, string? callerRole = null, string? callerUser = null, CancellationToken cancellationToken = default);
    Task<AiDischargeReviewDto> GetOrGenerateDischargeReviewAsync(Guid patientId, bool forceRefresh = false, string? callerRole = null, string? callerUser = null, CancellationToken cancellationToken = default);
    Task<AiAlertPrioritizationResultDto> GetOrGenerateAlertPrioritizationAsync(Guid patientId, bool forceRefresh = false, string? callerRole = null, string? callerUser = null, CancellationToken cancellationToken = default);
    
    // P1/P2 Workflows: Medication Intelligence & Clinical Copilots
    Task<AiMedicationReviewDto> GetOrGenerateMedicationReviewAsync(Guid patientId, bool forceRefresh = false, string? callerRole = null, string? callerUser = null, CancellationToken cancellationToken = default);
    Task<AiCopilotResponseDto> ExecuteDoctorCopilotQueryAsync(AiCopilotQueryDto query, string? callerRole = null, string? callerUser = null, CancellationToken cancellationToken = default);
    Task<AiCopilotResponseDto> ExecuteNurseCopilotQueryAsync(AiCopilotQueryDto query, string? callerRole = null, string? callerUser = null, CancellationToken cancellationToken = default);

    // Human-in-the-Loop Feedback, Task Creation & Disposition
    Task<bool> RecordFeedbackAsync(AiFeedbackRequestDto feedback, string? callerRole = null, string? callerUser = null, CancellationToken cancellationToken = default);
}
