using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ConnectedCare.Application.Features.AI.DTOs;

namespace ConnectedCare.Application.Features.AI.Services;

public class ClinicalEvidenceService : IClinicalEvidenceService
{
    private static readonly List<ClinicalEvidenceGuideline> ApprovedGuidelines = new()
    {
        new ClinicalEvidenceGuideline
        {
            Title = "AHA/ACC Guideline for Prevention, Detection, Evaluation, and Management of High Blood Pressure",
            Category = "Cardiovascular",
            IssuingBody = "American Heart Association & American College of Cardiology",
            SummaryText = "Target BP < 130/80 mmHg in adults with confirmed hypertension. Regular vitals surveillance and renal function monitoring during ACEi/ARB titration.",
            CitationText = "AHA/ACC Clinical Practice Guideline (JACC 2024)",
            MatchingKeywords = new() { "hypertension", "blood pressure", "systolic", "diastolic", "lisinopril", "losartan", "amlodipine" }
        },
        new ClinicalEvidenceGuideline
        {
            Title = "ADA Standards of Care in Diabetes — Inpatient Glycemic Management",
            Category = "Endocrinology",
            IssuingBody = "American Diabetes Association",
            SummaryText = "Maintain inpatient blood glucose between 140–180 mg/dL for most non-critically ill patients. Monitor for hypoglycemia upon changes in oral nutritional intake.",
            CitationText = "ADA Standards of Care (Diabetes Care 2025)",
            MatchingKeywords = new() { "diabetes", "blood sugar", "glucose", "metformin", "insulin", "hba1c" }
        },
        new ClinicalEvidenceGuideline
        {
            Title = "AGS Beers Criteria® for Potentially Inappropriate Medication Use in Older Adults",
            Category = "Geriatric Pharmacology",
            IssuingBody = "American Geriatrics Society",
            SummaryText = "Exercise high vigilance with anticholinergics, benzodiazepines, non-selective NSAIDs, and sedative-hypnotics in patients aged 65+ due to elevated fall and delirium risk.",
            CitationText = "AGS Beers Criteria® (J Am Geriatr Soc 2024)",
            MatchingKeywords = new() { "geriatric", "beers", "elderly", "fall risk", "sedative", "anticholinergic", "polypharmacy" }
        },
        new ClinicalEvidenceGuideline
        {
            Title = "Joint Commission Hospital National Patient Safety Goals: Fall Prevention & Safe Mobility",
            Category = "Nursing & Patient Safety",
            IssuingBody = "The Joint Commission",
            SummaryText = "Implement multifactorial fall reduction bundle: non-slip yellow footwear, call light within easy reach, scheduled toileting rounds, and bedside assistance.",
            CitationText = "The Joint Commission NPSG.09.02.01",
            MatchingKeywords = new() { "fall", "mobility", "ambulation", "bedside", "triage", "sbar", "nurse" }
        },
        new ClinicalEvidenceGuideline
        {
            Title = "Joint Commission & CMS Standards for Safe Patient Discharge & Care Transitions",
            Category = "Care Transitions",
            IssuingBody = "CMS & The Joint Commission",
            SummaryText = "Mandatory multidisciplinary reconciliation of pre-admission versus post-discharge medications, confirmed follow-up provider appointment, and patient instruction comprehension verification.",
            CitationText = "CMS Inpatient Discharge Planning CoP §482.43",
            MatchingKeywords = new() { "discharge", "transition", "readiness", "follow-up", "checklist" }
        }
    };

    public Task<List<ClinicalEvidenceGuideline>> RetrieveRelevantEvidenceAsync(
        PatientContextBundle contextBundle,
        string workflowType,
        CancellationToken cancellationToken = default)
    {
        var relevant = new List<ClinicalEvidenceGuideline>();
        var diagnoses = contextBundle.ActiveDiagnoses ?? new List<string>();
        var medNames = contextBundle.ActiveMedications?.Select(m => m.Name).ToList() ?? new List<string>();
        var searchableText = $"{workflowType} {string.Join(" ", diagnoses)} {string.Join(" ", medNames)}".ToLowerInvariant();

        foreach (var guide in ApprovedGuidelines)
        {
            if (guide.MatchingKeywords.Any(kw => searchableText.Contains(kw.ToLowerInvariant())))
            {
                relevant.Add(guide);
            }
        }

        // Default safety guideline if none matched
        if (relevant.Count == 0)
        {
            relevant.Add(ApprovedGuidelines.First(g => g.Category == "Nursing & Patient Safety"));
        }

        return Task.FromResult(relevant.Take(3).ToList());
    }
}
