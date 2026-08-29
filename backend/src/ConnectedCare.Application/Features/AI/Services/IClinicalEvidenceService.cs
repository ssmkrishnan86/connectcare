using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ConnectedCare.Application.Features.AI.DTOs;

namespace ConnectedCare.Application.Features.AI.Services;

public class ClinicalEvidenceGuideline
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string IssuingBody { get; set; } = string.Empty;
    public string SummaryText { get; set; } = string.Empty;
    public string CitationText { get; set; } = string.Empty;
    public List<string> MatchingKeywords { get; set; } = new();
}

public interface IClinicalEvidenceService
{
    Task<List<ClinicalEvidenceGuideline>> RetrieveRelevantEvidenceAsync(
        PatientContextBundle contextBundle,
        string workflowType,
        CancellationToken cancellationToken = default);
}
