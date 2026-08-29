using System;
using System.Threading;
using System.Threading.Tasks;
using ConnectedCare.Application.Features.AI.DTOs;

namespace ConnectedCare.Application.Features.AI.Services;

public interface IPatientContextBuilder
{
    Task<PatientContextBundle> BuildSummaryContextAsync(Guid patientId, CancellationToken cancellationToken = default);
    Task<PatientContextBundle> BuildCarePrioritiesContextAsync(Guid patientId, CancellationToken cancellationToken = default);
    Task<PatientContextBundle> BuildDischargeReviewContextAsync(Guid patientId, CancellationToken cancellationToken = default);
    Task<PatientContextBundle> BuildAlertPrioritizationContextAsync(Guid patientId, CancellationToken cancellationToken = default);
    Task<AiContextPreviewDto> GetContextPreviewAsync(Guid patientId, string callerRole, CancellationToken cancellationToken = default);
}
