using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using ConnectedCare.Application.Features.AI.DTOs;

namespace ConnectedCare.Application.Features.AI.Services;

public class AiClinicalSafetyValidator : IAiClinicalSafetyValidator
{
    private readonly ILogger<AiClinicalSafetyValidator> _logger;

    // Prohibited autonomous actions that AI must NEVER execute autonomously in U.S. clinical workflows
    private static readonly string[] ProhibitedAutonomousPhrases = new[]
    {
        "i have prescribed",
        "i have ordered",
        "i have stopped",
        "i have discontinued the medication",
        "i have discharged",
        "patient is discharged by ai",
        "you do not need doctor approval",
        "no physician review needed",
        "i adjusted the dosage",
        "i modified the prescription",
        "autonomous medication change",
        "dispensed medication",
        "final medical diagnosis by ai"
    };

    // Known common clinical drugs for hallucination surveillance
    private static readonly string[] CommonClinicalDrugNames = new[]
    {
        "lisinopril", "metformin", "atorvastatin", "amlodipine", "metoprolol", "omeprazole",
        "losartan", "gabapentin", "hydrochlorothiazide", "sertraline", "simvastatin", "levothyroxine",
        "warfarin", "apixaban", "clopidogrel", "furosemide", "vancomycin", "ciprofloxacin", "morphine", "oxycodone"
    };

    public AiClinicalSafetyValidator(ILogger<AiClinicalSafetyValidator> logger)
    {
        _logger = logger;
    }

    public Task<AiSafetyValidationResult> ValidateOutputAsync(
        string rawOutputJson,
        string workflowType,
        PatientContextBundle contextBundle,
        CancellationToken cancellationToken = default)
    {
        var result = new AiSafetyValidationResult();

        if (string.IsNullOrWhiteSpace(rawOutputJson))
        {
            result.IsApproved = false;
            result.IsBlocked = true;
            result.Status = "Blocked";
            result.ValidationSummary = "Empty or null model output.";
            result.Findings.Add("Model returned no content.");
            return Task.FromResult(result);
        }

        var outputLower = rawOutputJson.ToLowerInvariant();

        // 1. Stage 1: Prohibited Autonomous Actions Guardrail
        foreach (var phrase in ProhibitedAutonomousPhrases)
        {
            if (outputLower.Contains(phrase))
            {
                result.IsApproved = false;
                result.IsBlocked = true;
                result.Status = "Blocked";
                result.ValidationSummary = $"Prohibited autonomous clinical directive detected: '{phrase}'.";
                result.Findings.Add($"AI attempted unauthorized clinical authority action: '{phrase}'. Must require licensed human clinician order.");
                _logger.LogWarning("[SAFETY_BLOCKED] AI Safety Guardrail Blocked output for workflow {Workflow}: {Summary}", workflowType, result.ValidationSummary);
                return Task.FromResult(result);
            }
        }

        // 2. Stage 2: JSON Schema Structure & Field Validation
        try
        {
            var parsed = JsonNode.Parse(rawOutputJson);
            if (parsed == null)
            {
                result.HasWarnings = true;
                result.Status = "WarningFlagged";
                result.Findings.Add("Output parsed as null JSON object.");
            }
            else
            {
                // Workflow-specific schema field checks
                if (workflowType.Equals("PatientSummary", StringComparison.OrdinalIgnoreCase))
                {
                    if (parsed["currentStatus"] == null) result.Findings.Add("Missing required schema field 'currentStatus'.");
                    if (parsed["followUpPlan"] == null) result.Findings.Add("Missing required schema field 'followUpPlan'.");
                }
                else if (workflowType.Equals("CarePriorities", StringComparison.OrdinalIgnoreCase))
                {
                    if (parsed["priorities"] == null && !(parsed is JsonArray))
                    {
                        result.Findings.Add("Missing required 'priorities' array.");
                    }
                }
                else if (workflowType.Equals("DischargeReview", StringComparison.OrdinalIgnoreCase))
                {
                    if (parsed["readinessScore"] == null) result.Findings.Add("Missing required field 'readinessScore'.");
                    if (parsed["readinessStatus"] == null) result.Findings.Add("Missing required field 'readinessStatus'.");
                }
                else if (workflowType.Equals("MedicationReview", StringComparison.OrdinalIgnoreCase))
                {
                    if (parsed["safetyScore"] == null) result.Findings.Add("Missing required field 'safetyScore'.");
                }
            }
        }
        catch (Exception ex)
        {
            result.HasWarnings = true;
            result.Status = "WarningFlagged";
            result.Findings.Add($"Structured JSON parsing warning: {ex.Message}");
        }

        // 3. Stage 3: Claim-Level Context Consistency & Hallucination Check
        var contextMedNames = contextBundle.ActiveMedications?
            .Select(m => m.Name.ToLowerInvariant().Trim())
            .ToList() ?? new List<string>();

        // Check if output introduces ungrounded specific medications absent from patient EHR MAR
        if (contextMedNames.Count == 0 && outputLower.Contains("active prescriptions") && !outputLower.Contains("no active prescriptions") && !outputLower.Contains("no active medications"))
        {
            result.HasWarnings = true;
            result.Findings.Add("Context inconsistency: EHR context has 0 active medications, but output references active prescriptions.");
        }

        foreach (var drug in CommonClinicalDrugNames)
        {
            if (outputLower.Contains(drug))
            {
                bool isDocumented = contextMedNames.Any(cm => cm.Contains(drug));
                bool isAllergy = contextBundle.Allergies?.Any(a => a.ToLowerInvariant().Contains(drug)) ?? false;
                if (!isDocumented && !isAllergy)
                {
                    // Drug mentioned in output that is not in patient's active MAR or allergies
                    result.HasWarnings = true;
                    result.Findings.Add($"Unlisted drug mention '{drug}' detected in AI output; verify against patient chart before clinical action.");
                }
            }
        }

        // 4. Stage 4: Safety Classification & Summary Formulation
        if (result.Findings.Count > 0)
        {
            result.HasWarnings = true;
            if (result.Status != "Blocked")
            {
                result.Status = "WarningFlagged";
                result.ValidationSummary = $"Passed with {result.Findings.Count} clinical verification finding(s).";
            }
        }
        else
        {
            result.IsApproved = true;
            result.Status = "Approved";
            result.ValidationSummary = "Full clinical schema and context guardrail verification passed.";
        }

        return Task.FromResult(result);
    }
}
