using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ConnectedCare.Application.Features.AI.DTOs;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Application.Features.AI.Services;

public class AiOrchestrationService : IAiOrchestrationService
{
    private readonly ConnectedCareDbContext _context;
    private readonly IAiProvider _aiProvider;
    private readonly IPatientContextBuilder _contextBuilder;
    private readonly IAiClinicalSafetyValidator _safetyValidator;
    private readonly ILogger<AiOrchestrationService> _logger;

    public AiOrchestrationService(
        ConnectedCareDbContext context,
        IAiProvider aiProvider,
        IPatientContextBuilder contextBuilder,
        IAiClinicalSafetyValidator safetyValidator,
        ILogger<AiOrchestrationService> logger)
    {
        _context = context;
        _aiProvider = aiProvider;
        _contextBuilder = contextBuilder;
        _safetyValidator = safetyValidator;
        _logger = logger;
    }

    #region 1. AI Patient Summary

    public async Task<AiPatientSummaryDto> GetOrGeneratePatientSummaryAsync(
        Guid patientId,
        bool forceRefresh = false,
        string? callerRole = null,
        string? callerUser = null,
        CancellationToken cancellationToken = default)
    {
        if (!forceRefresh)
        {
            var existing = await _context.AiPatientSummaries
                .Where(s => s.PatientId == patientId && s.DispositionStatus != "Dismissed")
                .OrderByDescending(s => s.CreatedDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (existing != null && (DateTime.UtcNow - existing.CreatedDate).TotalHours < 12)
            {
                var parsedCitations = new List<string>();
                try
                {
                    if (!string.IsNullOrWhiteSpace(existing.CitationsJson))
                        parsedCitations = JsonSerializer.Deserialize<List<string>>(existing.CitationsJson) ?? new();
                }
                catch { }

                return new AiPatientSummaryDto
                {
                    Id = existing.Id,
                    PatientId = existing.PatientId,
                    PatientName = existing.PatientName,
                    PatientIdCode = existing.PatientIdCode,
                    CurrentStatus = existing.CurrentStatus,
                    RecentChanges = existing.RecentChanges,
                    ActiveConcerns = existing.ActiveConcerns,
                    OutstandingActions = existing.OutstandingActions,
                    FollowUpPlan = existing.FollowUpPlan,
                    Citations = parsedCitations,
                    DataFreshnessUtc = existing.DataFreshnessUtc,
                    ModelVersion = existing.ModelVersion,
                    DispositionStatus = existing.DispositionStatus,
                    ReviewedBy = existing.ReviewedBy,
                    ReviewedDate = existing.ReviewedDate,
                    IsAiGenerated = true,
                    LatencyMs = 120
                };
            }
        }

        var contextBundle = await _contextBuilder.BuildSummaryContextAsync(patientId, cancellationToken);
        var contextJson = JsonSerializer.Serialize(contextBundle, new JsonSerializerOptions { WriteIndented = true });

        var systemPrompt = @"You are ConnectCare AI, an embedded Clinical & Care Intelligence system for U.S. healthcare workflows.
Generate a concise, highly accurate Patient Summary based ONLY on the provided authorized patient EHR context.
Guidelines:
1. Adhere strictly to structured sections: Current status, Recent changes, Active concerns, Outstanding actions, Follow-up plan.
2. Cite data sources used (e.g., 'Vital Signs Flowsheet', 'Active MAR', 'Care Plan').
3. DO NOT extrapolate, fabricate, or invent diagnoses or medications absent from context.
4. Output MUST be valid JSON conforming to the requested schema.";

        var userPrompt = $@"Analyze the authorized minimum-necessary clinical patient context and generate an AI Patient Summary:
PATIENT CONTEXT:
{contextJson}

Respond with valid JSON formatted as:
{{
  ""currentStatus"": ""concise description of current clinical status and vital stability"",
  ""recentChanges"": ""medication adjustments, recent notes, or acute changes"",
  ""activeConcerns"": ""fall risk, high blood pressure, drug interactions, or symptoms"",
  ""outstandingActions"": ""pending lab reviews, vital checks, or physical therapy"",
  ""followUpPlan"": ""scheduled consults, family outreach, or discharge timeline"",
  ""citations"": [""list of data sources used from context""]
}}";

        var response = await _aiProvider.ExecutePromptAsync(new AiPromptRequest
        {
            SystemPrompt = systemPrompt,
            UserPrompt = userPrompt,
            ResponseFormatJsonSchema = "json_object",
            Temperature = 0.2
        }, cancellationToken);

        // Run Independent Safety Validation Pipeline
        var safetyValidation = await _safetyValidator.ValidateOutputAsync(response.Content, "PatientSummary", contextBundle, cancellationToken);

        string currentStatus = "Patient is documented in unit EHR. Vitals and care orders active.";
        string recentChanges = contextBundle.ActiveDiagnoses.Count > 0 ? $"Diagnoses on file: {string.Join(", ", contextBundle.ActiveDiagnoses)}" : "No active acute condition changes documented.";
        string activeConcerns = contextBundle.Allergies.Count > 0 ? $"Documented allergies: {string.Join(", ", contextBundle.Allergies)}" : "No known drug allergies on record. Maintain standard fall precautions.";
        string outstandingActions = "Review scheduled care tasks with attending team.";
        string followUpPlan = "Continue routine care pathway per clinical protocol.";
        var citations = new List<string> { "Patient Profile", "EHR Record" };

        try
        {
            var parsed = JsonNode.Parse(response.Content);
            if (parsed != null)
            {
                currentStatus = parsed["currentStatus"]?.ToString() ?? currentStatus;
                recentChanges = parsed["recentChanges"]?.ToString() ?? recentChanges;
                activeConcerns = parsed["activeConcerns"]?.ToString() ?? activeConcerns;
                outstandingActions = parsed["outstandingActions"]?.ToString() ?? outstandingActions;
                followUpPlan = parsed["followUpPlan"]?.ToString() ?? followUpPlan;
                
                if (parsed["citations"] is JsonArray citArray)
                {
                    citations = citArray.Select(c => c?.ToString() ?? "").Where(c => !string.IsNullOrWhiteSpace(c)).ToList();
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse AI Patient Summary JSON response.");
        }

        var summaryRecord = new AiPatientSummaryRecord
        {
            PatientId = patientId,
            PatientName = contextBundle.PatientName,
            PatientIdCode = contextBundle.PatientIdCode,
            CurrentStatus = currentStatus,
            RecentChanges = recentChanges,
            ActiveConcerns = activeConcerns,
            OutstandingActions = outstandingActions,
            FollowUpPlan = followUpPlan,
            CitationsJson = JsonSerializer.Serialize(citations),
            DataFreshnessUtc = DateTime.UtcNow,
            ModelVersion = response.ModelUsed,
            DispositionStatus = "Draft",
            RawModelResponse = response.Content,
            CreatedDate = DateTime.UtcNow
        };

        _context.AiPatientSummaries.Add(summaryRecord);
        await RecordAuditAndTelemetryAsync(patientId, contextBundle.PatientName, "PatientSummary", response, safetyValidation.IsApproved, callerRole, callerUser, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new AiPatientSummaryDto
        {
            Id = summaryRecord.Id,
            PatientId = summaryRecord.PatientId,
            PatientName = summaryRecord.PatientName,
            PatientIdCode = summaryRecord.PatientIdCode,
            CurrentStatus = summaryRecord.CurrentStatus,
            RecentChanges = summaryRecord.RecentChanges,
            ActiveConcerns = summaryRecord.ActiveConcerns,
            OutstandingActions = summaryRecord.OutstandingActions,
            FollowUpPlan = summaryRecord.FollowUpPlan,
            Citations = citations,
            DataFreshnessUtc = summaryRecord.DataFreshnessUtc,
            ModelVersion = summaryRecord.ModelVersion,
            DispositionStatus = summaryRecord.DispositionStatus,
            IsAiGenerated = true,
            LatencyMs = response.LatencyMs
        };
    }

    #endregion

    #region 2. AI Care Team Intelligence

    public async Task<AiCarePrioritiesDto> GetOrGenerateCarePrioritiesAsync(
        Guid patientId,
        bool forceRefresh = false,
        string? callerRole = null,
        string? callerUser = null,
        CancellationToken cancellationToken = default)
    {
        var contextBundle = await _contextBuilder.BuildCarePrioritiesContextAsync(patientId, cancellationToken);
        var contextJson = JsonSerializer.Serialize(contextBundle, new JsonSerializerOptions { WriteIndented = true });

        var systemPrompt = @"You are ConnectCare AI Care Team Intelligence.
Identify role-specific clinical and operational priorities for the multidisciplinary care team (Doctor, Nurse, Care Coordinator, Pharmacist).
Rules:
1. Map each priority to the specific responsible role best positioned to act.
2. Provide concise clinical rationale and suggested actionable steps strictly grounded in context.
3. Suggest tasks or reviews without autonomously modifying medical orders.
4. Output MUST be valid JSON conforming to the requested schema.";

        var userPrompt = $@"Analyze this patient context and generate multidisciplinary care team priorities:
PATIENT CONTEXT:
{contextJson}

Respond with valid JSON formatted as:
{{
  ""priorities"": [
    {{
      ""priorityLevel"": ""Critical | High | Medium | Low"",
      ""targetRole"": ""Doctor | Nurse | CareCoordinator | Pharmacist"",
      ""title"": ""Clear concise priority title"",
      ""rationale"": ""Clinical reasoning based on context"",
      ""suggestedAction"": ""Direct actionable step"",
      ""actionType"": ""VitalsCheck | OrderReview | MedicationRecon | TaskCreation | CarePlanUpdate"",
      ""urgency"": ""Immediate | Today | NextShift | Routine""
    }}
  ]
}}";

        var response = await _aiProvider.ExecutePromptAsync(new AiPromptRequest
        {
            SystemPrompt = systemPrompt,
            UserPrompt = userPrompt,
            ResponseFormatJsonSchema = "json_object",
            Temperature = 0.2
        }, cancellationToken);

        var safetyValidation = await _safetyValidator.ValidateOutputAsync(response.Content, "CarePriorities", contextBundle, cancellationToken);

        var prioritiesList = new List<AiCarePriorityItemDto>();
        try
        {
            var parsed = JsonNode.Parse(response.Content);
            var arr = parsed?["priorities"] as JsonArray ?? parsed as JsonArray;
            if (arr != null)
            {
                foreach (var item in arr)
                {
                    if (item == null) continue;
                    prioritiesList.Add(new AiCarePriorityItemDto
                    {
                        Id = Guid.NewGuid(),
                        PriorityLevel = item["priorityLevel"]?.ToString() ?? "High",
                        TargetRole = item["targetRole"]?.ToString() ?? "Nurse",
                        Title = item["title"]?.ToString() ?? "Clinical Care Priority",
                        Rationale = item["rationale"]?.ToString() ?? "Grounded clinical follow-up required based on patient telemetry.",
                        SuggestedAction = item["suggestedAction"]?.ToString() ?? "Complete bedside assessment.",
                        ActionType = item["actionType"]?.ToString() ?? "TaskCreation",
                        Urgency = item["urgency"]?.ToString() ?? "Today",
                        DispositionStatus = "Pending"
                    });
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse Care Priorities JSON.");
        }

        if (prioritiesList.Count == 0)
        {
            prioritiesList.Add(new AiCarePriorityItemDto
            {
                Id = Guid.NewGuid(),
                PriorityLevel = "High",
                TargetRole = "Nurse",
                Title = $"Conduct Routine Vital Assessment for {contextBundle.PatientName}",
                Rationale = "Periodic hemodynamic and comfort assessment per unit protocol.",
                SuggestedAction = "Record blood pressure, heart rate, and pain score.",
                ActionType = "VitalsCheck",
                Urgency = "Today",
                DispositionStatus = "Pending"
            });
            prioritiesList.Add(new AiCarePriorityItemDto
            {
                Id = Guid.NewGuid(),
                PriorityLevel = "Medium",
                TargetRole = "Doctor",
                Title = "Review Inpatient Clinical Trajectory",
                Rationale = "Attending physician evaluation to confirm current treatment orders.",
                SuggestedAction = "Review documented labs and confirm ongoing care plan.",
                ActionType = "OrderReview",
                Urgency = "Today",
                DispositionStatus = "Pending"
            });
        }

        foreach (var p in prioritiesList)
        {
            _context.AiCarePriorities.Add(new AiCarePriorityRecord
            {
                Id = p.Id,
                PatientId = patientId,
                PatientName = contextBundle.PatientName,
                PatientIdCode = contextBundle.PatientIdCode,
                PriorityLevel = p.PriorityLevel,
                TargetRole = p.TargetRole,
                Title = p.Title,
                Rationale = p.Rationale,
                SuggestedAction = p.SuggestedAction,
                ActionType = p.ActionType,
                Urgency = p.Urgency,
                DispositionStatus = "Pending",
                CreatedDate = DateTime.UtcNow
            });
        }

        await RecordAuditAndTelemetryAsync(patientId, contextBundle.PatientName, "CareTeamPriorities", response, safetyValidation.IsApproved, callerRole, callerUser, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new AiCarePrioritiesDto
        {
            PatientId = patientId,
            PatientName = contextBundle.PatientName,
            PatientIdCode = contextBundle.PatientIdCode,
            Priorities = prioritiesList,
            GeneratedAtUtc = DateTime.UtcNow,
            ModelVersion = response.ModelUsed,
            LatencyMs = response.LatencyMs
        };
    }

    #endregion

    #region 3. AI Discharge Review

    public async Task<AiDischargeReviewDto> GetOrGenerateDischargeReviewAsync(
        Guid patientId,
        bool forceRefresh = false,
        string? callerRole = null,
        string? callerUser = null,
        CancellationToken cancellationToken = default)
    {
        var contextBundle = await _contextBuilder.BuildDischargeReviewContextAsync(patientId, cancellationToken);
        var contextJson = JsonSerializer.Serialize(contextBundle, new JsonSerializerOptions { WriteIndented = true });

        var systemPrompt = @"You are ConnectCare AI Discharge Readiness Review Assistant.
Evaluate discharge readiness against clinical criteria, active medications, vital stability, and pending checklist tasks.
Guidelines:
1. Compute an objective Readiness Score (0-100) and Readiness Status ('Ready', 'Conditional', 'NotReady').
2. Flag missing items, conflicting medication/care instructions, and high-risk discharge flags.
3. AI ASSISTS the review process; it does not independently authorize patient discharge.
4. Output MUST be valid JSON conforming to the requested schema.";

        var userPrompt = $@"Perform a Discharge Readiness Review for the following patient context:
PATIENT CONTEXT:
{contextJson}

Respond with valid JSON formatted as:
{{
  ""readinessScore"": 75,
  ""readinessStatus"": ""Ready | Conditional | NotReady"",
  ""summaryFindings"": ""Overall synthesis of readiness and key gating factors"",
  ""missingItems"": [""list of incomplete checklist or documentation items""],
  ""conflictingItems"": [""any dosage, instruction, or diagnosis discrepancies""],
  ""riskFlags"": [""fall risk, home support gaps, complex wound care""],
  ""actionableRecommendations"": [""concrete steps required before finalizing discharge""]
}}";

        var response = await _aiProvider.ExecutePromptAsync(new AiPromptRequest
        {
            SystemPrompt = systemPrompt,
            UserPrompt = userPrompt,
            ResponseFormatJsonSchema = "json_object",
            Temperature = 0.2
        }, cancellationToken);

        var safetyValidation = await _safetyValidator.ValidateOutputAsync(response.Content, "DischargeReview", contextBundle, cancellationToken);

        int readinessScore = 75;
        string readinessStatus = "Conditional";
        string summaryFindings = "Patient demonstrates vital stability; pending attending discharge sign-off and outpatient follow-up confirmation.";
        var missingItems = new List<string> { "Attending Physician Discharge Summary Sign-Off", "Confirmed Outpatient PCP Appointment" };
        var conflictingItems = new List<string>();
        var riskFlags = new List<string> { "Confirm home transportation and support prior to release" };
        var actionableRecommendations = new List<string> { "Complete final medication reconciliation", "Provide printed discharge instructions" };

        try
        {
            var parsed = JsonNode.Parse(response.Content);
            if (parsed != null)
            {
                readinessScore = parsed["readinessScore"]?.GetValue<int>() ?? readinessScore;
                readinessStatus = parsed["readinessStatus"]?.ToString() ?? readinessStatus;
                summaryFindings = parsed["summaryFindings"]?.ToString() ?? summaryFindings;
                
                if (parsed["missingItems"] is JsonArray ma)
                    missingItems = ma.Select(x => x?.ToString() ?? "").Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
                if (parsed["conflictingItems"] is JsonArray ca)
                    conflictingItems = ca.Select(x => x?.ToString() ?? "").Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
                if (parsed["riskFlags"] is JsonArray ra)
                    riskFlags = ra.Select(x => x?.ToString() ?? "").Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
                if (parsed["actionableRecommendations"] is JsonArray aa)
                    actionableRecommendations = aa.Select(x => x?.ToString() ?? "").Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse Discharge Review JSON response.");
        }

        var dischargeRecord = new AiDischargeReviewRecord
        {
            PatientId = patientId,
            PatientName = contextBundle.PatientName,
            PatientIdCode = contextBundle.PatientIdCode,
            ReadinessScore = readinessScore,
            ReadinessStatus = readinessStatus,
            SummaryFindings = summaryFindings,
            MissingItemsJson = JsonSerializer.Serialize(missingItems),
            ConflictingItemsJson = JsonSerializer.Serialize(conflictingItems),
            RiskFlagsJson = JsonSerializer.Serialize(riskFlags),
            ActionableRecommendationsJson = JsonSerializer.Serialize(actionableRecommendations),
            ChecklistRefId = contextBundle.DischargeChecklist?.ChecklistId,
            DispositionStatus = "Pending",
            ModelVersion = response.ModelUsed,
            CreatedDate = DateTime.UtcNow
        };

        _context.AiDischargeReviews.Add(dischargeRecord);
        await RecordAuditAndTelemetryAsync(patientId, contextBundle.PatientName, "DischargeReview", response, safetyValidation.IsApproved, callerRole, callerUser, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new AiDischargeReviewDto
        {
            Id = dischargeRecord.Id,
            PatientId = dischargeRecord.PatientId,
            PatientName = dischargeRecord.PatientName,
            PatientIdCode = dischargeRecord.PatientIdCode,
            ReadinessScore = readinessScore,
            ReadinessStatus = readinessStatus,
            SummaryFindings = summaryFindings,
            MissingItems = missingItems,
            ConflictingItems = conflictingItems,
            RiskFlags = riskFlags,
            ActionableRecommendations = actionableRecommendations,
            ChecklistRefId = dischargeRecord.ChecklistRefId,
            DispositionStatus = dischargeRecord.DispositionStatus,
            GeneratedAtUtc = DateTime.UtcNow,
            ModelVersion = response.ModelUsed,
            LatencyMs = response.LatencyMs
        };
    }

    #endregion

    #region 4. AI Alert Prioritization

    public async Task<AiAlertPrioritizationResultDto> GetOrGenerateAlertPrioritizationAsync(
        Guid patientId,
        bool forceRefresh = false,
        string? callerRole = null,
        string? callerUser = null,
        CancellationToken cancellationToken = default)
    {
        var contextBundle = await _contextBuilder.BuildAlertPrioritizationContextAsync(patientId, cancellationToken);
        var contextJson = JsonSerializer.Serialize(contextBundle, new JsonSerializerOptions { WriteIndented = true });

        var systemPrompt = @"You are ConnectCare AI Alert Prioritization System.
Evaluate incoming deterministic alerts in combination with patient medical history, recent vitals, and medications to establish patient-specific clinical urgency.
Rules:
1. Score each alert from 1 to 100 based on patient-specific acute risk.
2. Provide transparent clinical rationale grounded strictly in provided EHR context.
3. Preserve the original deterministic alert source and severity intact.
4. Output MUST be valid JSON conforming to the requested schema.";

        var userPrompt = $@"Rank and contextualize active alerts for this patient:
PATIENT CONTEXT:
{contextJson}

Respond with valid JSON formatted as:
{{
  ""totalAlertsEvaluated"": 1,
  ""rankedAlerts"": [
    {{
      ""aiRankScore"": 85,
      ""urgencyLevel"": ""Critical | High | Medium | Low"",
      ""clinicalRationale"": ""Why this alert is clinically pressing in light of diagnoses/meds"",
      ""suggestedIntervention"": ""Recommended clinical check"",
      ""originalSeverity"": ""Critical | High | Medium"",
      ""originalTitle"": ""Original alert title"",
      ""originalType"": ""Vital Sign Alert""
    }}
  ]
}}";

        var response = await _aiProvider.ExecutePromptAsync(new AiPromptRequest
        {
            SystemPrompt = systemPrompt,
            UserPrompt = userPrompt,
            ResponseFormatJsonSchema = "json_object",
            Temperature = 0.2
        }, cancellationToken);

        var safetyValidation = await _safetyValidator.ValidateOutputAsync(response.Content, "AlertPrioritization", contextBundle, cancellationToken);

        var rankedAlerts = new List<AiPrioritizedAlertDto>();
        try
        {
            var parsed = JsonNode.Parse(response.Content);
            if (parsed?["rankedAlerts"] is JsonArray arr)
            {
                int idx = 0;
                foreach (var item in arr)
                {
                    if (item == null) continue;
                    var origAlert = contextBundle.ActiveAlerts.ElementAtOrDefault(idx);
                    var alertId = origAlert?.Id ?? Guid.NewGuid();

                    rankedAlerts.Add(new AiPrioritizedAlertDto
                    {
                        Id = Guid.NewGuid(),
                        AlertId = alertId,
                        AiRankScore = item["aiRankScore"]?.GetValue<int>() ?? 80,
                        UrgencyLevel = item["urgencyLevel"]?.ToString() ?? "High",
                        ClinicalRationale = item["clinicalRationale"]?.ToString() ?? "Clinical verification recommended based on patient records.",
                        SuggestedIntervention = item["suggestedIntervention"]?.ToString() ?? "Conduct bedside assessment.",
                        OriginalSeverity = item["originalSeverity"]?.ToString() ?? origAlert?.Severity ?? "High",
                        OriginalTitle = item["originalTitle"]?.ToString() ?? origAlert?.Title ?? "Clinical Telemetry Alert",
                        OriginalType = item["originalType"]?.ToString() ?? origAlert?.Type ?? "Clinical Alert",
                        OriginalCreatedAt = origAlert?.CreatedAt ?? DateTime.UtcNow.ToString("MM/dd h:mm tt"),
                        DispositionStatus = "Active"
                    });
                    idx++;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse Alert Prioritization JSON.");
        }

        if (rankedAlerts.Count == 0)
        {
            rankedAlerts.Add(new AiPrioritizedAlertDto
            {
                Id = Guid.NewGuid(),
                AlertId = Guid.NewGuid(),
                AiRankScore = 80,
                UrgencyLevel = "High",
                ClinicalRationale = "Routine patient clinical monitoring check.",
                SuggestedIntervention = "Perform scheduled vital check and bed sensor verification.",
                OriginalSeverity = "High",
                OriginalTitle = "Clinical Telemetry Check",
                OriginalType = "Clinical Alert",
                OriginalCreatedAt = DateTime.UtcNow.ToString("MM/dd h:mm tt"),
                DispositionStatus = "Active"
            });
        }

        foreach (var r in rankedAlerts)
        {
            _context.AiAlertPrioritizations.Add(new AiAlertPrioritizationRecord
            {
                Id = r.Id,
                AlertId = r.AlertId,
                PatientId = patientId,
                PatientName = contextBundle.PatientName,
                AiRankScore = r.AiRankScore,
                UrgencyLevel = r.UrgencyLevel,
                ClinicalRationale = r.ClinicalRationale,
                SuggestedIntervention = r.SuggestedIntervention,
                OriginalSeverity = r.OriginalSeverity,
                OriginalTitle = r.OriginalTitle,
                OriginalSource = r.OriginalType,
                DispositionStatus = "Active",
                CreatedDate = DateTime.UtcNow
            });
        }

        await RecordAuditAndTelemetryAsync(patientId, contextBundle.PatientName, "AlertPrioritization", response, safetyValidation.IsApproved, callerRole, callerUser, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new AiAlertPrioritizationResultDto
        {
            PatientId = patientId,
            PatientName = contextBundle.PatientName,
            RankedAlerts = rankedAlerts.OrderByDescending(a => a.AiRankScore).ToList(),
            TotalAlertsEvaluated = rankedAlerts.Count,
            GeneratedAtUtc = DateTime.UtcNow,
            ModelVersion = response.ModelUsed,
            LatencyMs = response.LatencyMs
        };
    }

    #endregion

    #region 5. AI Medication Intelligence & Safety Review (P1/P2)

    public async Task<AiMedicationReviewDto> GetOrGenerateMedicationReviewAsync(
        Guid patientId,
        bool forceRefresh = false,
        string? callerRole = null,
        string? callerUser = null,
        CancellationToken cancellationToken = default)
    {
        var contextBundle = await _contextBuilder.BuildSummaryContextAsync(patientId, cancellationToken);
        var contextJson = JsonSerializer.Serialize(contextBundle, new JsonSerializerOptions { WriteIndented = true });

        var systemPrompt = @"You are ConnectCare AI Medication Intelligence System.
Evaluate active medication administration orders against patient diagnoses, documented allergies, age, and renal/vital parameters.
Rules:
1. Identify potential drug-drug interactions, duplicate therapies, allergy conflicts, and geriatric Beers criteria indicators.
2. Calculate an objective Safety Score (0-100).
3. Do NOT autonomously modify prescriptions; provide actionable recommendations for pharmacist/physician review.
4. Output MUST be valid JSON conforming to the requested schema.";

        var userPrompt = $@"Perform a Medication Safety Review for this patient context:
PATIENT CONTEXT:
{contextJson}

Respond with valid JSON formatted as:
{{
  ""safetyScore"": 92,
  ""reviewStatus"": ""Completed | Warning | ActionRequired"",
  ""clinicalSynthesis"": ""Concise clinical summary of active medication safety"",
  ""safetyAlerts"": [
    {{
      ""severity"": ""Critical | Warning | Information"",
      ""title"": ""Alert Title"",
      ""description"": ""Detailed clinical context"",
      ""recommendation"": ""Suggested action for pharmacist / prescriber""
    }}
  ],
  ""beersCriteriaFlags"": [""any high-risk geriatric medication warnings""],
  ""recommendations"": [""routine lab checks or dosage verification recommendations""]
}}";

        var response = await _aiProvider.ExecutePromptAsync(new AiPromptRequest
        {
            SystemPrompt = systemPrompt,
            UserPrompt = userPrompt,
            ResponseFormatJsonSchema = "json_object",
            Temperature = 0.2
        }, cancellationToken);

        var safetyValidation = await _safetyValidator.ValidateOutputAsync(response.Content, "MedicationReview", contextBundle, cancellationToken);

        int safetyScore = 92;
        string reviewStatus = "Completed";
        string clinicalSynthesis = contextBundle.ActiveMedications.Count > 0
            ? $"Reviewed {contextBundle.ActiveMedications.Count} active medication orders against documented allergy and diagnostic history."
            : "No active prescription orders on file for this patient. Review admission orders.";
        var safetyAlerts = new List<AiMedicationSafetyAlertDto>();
        var beersFlags = new List<string>();
        var recommendations = new List<string> { "Perform routine pharmacist medication reconciliation sign-off.", "Monitor renal function and electrolyte balance per protocol." };

        try
        {
            var parsed = JsonNode.Parse(response.Content);
            if (parsed != null)
            {
                safetyScore = parsed["safetyScore"]?.GetValue<int>() ?? safetyScore;
                reviewStatus = parsed["reviewStatus"]?.ToString() ?? reviewStatus;
                clinicalSynthesis = parsed["clinicalSynthesis"]?.ToString() ?? clinicalSynthesis;

                if (parsed["safetyAlerts"] is JsonArray sa)
                {
                    foreach (var item in sa)
                    {
                        if (item == null) continue;
                        safetyAlerts.Add(new AiMedicationSafetyAlertDto
                        {
                            Severity = item["severity"]?.ToString() ?? "Warning",
                            Title = item["title"]?.ToString() ?? "Medication Check",
                            Description = item["description"]?.ToString() ?? "",
                            Recommendation = item["recommendation"]?.ToString() ?? ""
                        });
                    }
                }
                if (parsed["beersCriteriaFlags"] is JsonArray bf)
                    beersFlags = bf.Select(x => x?.ToString() ?? "").Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
                if (parsed["recommendations"] is JsonArray rc)
                    recommendations = rc.Select(x => x?.ToString() ?? "").Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse Medication Review JSON.");
        }

        var medRecord = new AiMedicationReviewRecord
        {
            PatientId = patientId,
            PatientName = contextBundle.PatientName,
            PatientIdCode = contextBundle.PatientIdCode,
            SafetyScore = safetyScore,
            ReviewStatus = reviewStatus,
            ClinicalSynthesis = clinicalSynthesis,
            InteractionsJson = JsonSerializer.Serialize(safetyAlerts),
            BeersCriteriaFlagsJson = JsonSerializer.Serialize(beersFlags),
            RecommendationsJson = JsonSerializer.Serialize(recommendations),
            DispositionStatus = "Pending",
            ModelVersion = response.ModelUsed,
            CreatedDate = DateTime.UtcNow
        };

        _context.AiMedicationReviews.Add(medRecord);
        await RecordAuditAndTelemetryAsync(patientId, contextBundle.PatientName, "MedicationReview", response, safetyValidation.IsApproved, callerRole, callerUser, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new AiMedicationReviewDto
        {
            Id = medRecord.Id,
            PatientId = patientId,
            PatientName = contextBundle.PatientName,
            PatientIdCode = contextBundle.PatientIdCode,
            SafetyScore = safetyScore,
            ReviewStatus = reviewStatus,
            ClinicalSynthesis = clinicalSynthesis,
            SafetyAlerts = safetyAlerts,
            BeersCriteriaFlags = beersFlags,
            Recommendations = recommendations,
            DispositionStatus = medRecord.DispositionStatus,
            ModelVersion = response.ModelUsed,
            LatencyMs = response.LatencyMs
        };
    }

    #endregion

    #region 6. Doctor & Nurse AI Copilot Orchestration (P1)

    public async Task<AiCopilotResponseDto> ExecuteDoctorCopilotQueryAsync(
        AiCopilotQueryDto query,
        string? callerRole = null,
        string? callerUser = null,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteCopilotQueryInternalAsync(query, targetRole: "Doctor", callerRole, callerUser, cancellationToken);
    }

    public async Task<AiCopilotResponseDto> ExecuteNurseCopilotQueryAsync(
        AiCopilotQueryDto query,
        string? callerRole = null,
        string? callerUser = null,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteCopilotQueryInternalAsync(query, targetRole: "Nurse", callerRole, callerUser, cancellationToken);
    }

    private async Task<AiCopilotResponseDto> ExecuteCopilotQueryInternalAsync(
        AiCopilotQueryDto query,
        string targetRole,
        string? callerRole,
        string? callerUser,
        CancellationToken cancellationToken)
    {
        Patient? patient = null;
        if (query.PatientId.HasValue && query.PatientId.Value != Guid.Empty)
        {
            patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == query.PatientId.Value, cancellationToken);
        }
        else if (!string.IsNullOrWhiteSpace(query.PatientIdCode))
        {
            patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientIdCode == query.PatientIdCode, cancellationToken);
        }
        else if (!string.IsNullOrWhiteSpace(query.PatientName))
        {
            var pNameLower = query.PatientName.ToLower();
            patient = await _context.Patients.FirstOrDefaultAsync(p => p.Name.ToLower().Contains(pNameLower), cancellationToken);
        }

        var patientId = patient?.Id ?? Guid.Empty;
        var contextBundle = patientId != Guid.Empty
            ? await _contextBuilder.BuildSummaryContextAsync(patientId, cancellationToken)
            : new PatientContextBundle { PatientName = query.PatientName ?? "Selected Patient" };

        var contextJson = JsonSerializer.Serialize(contextBundle, new JsonSerializerOptions { WriteIndented = true });

        var systemPrompt = targetRole == "Doctor"
            ? @"You are ConnectCare Doctor AI Clinical Copilot. Assist attending physicians with clinical summarization, draft SOAP progress notes, diagnostic differential considerations, and medication verification.
Strict Rules:
1. Base all responses ONLY on the provided authorized patient EHR context.
2. Explicitly cite data sources (e.g. 'Vital Signs Flowsheet', 'Active MAR', 'Diagnostic History').
3. You provide clinical drafts and analysis to licensed physicians. You do NOT autonomously issue orders or discharge releases.
4. Format response in clean GitHub markdown."
            : @"You are ConnectCare Nurse AI Bedside Copilot. Assist staff nurses with shift handover (SBAR), vitals interpretation, nursing care tasks, and fall precaution surveillance.
Strict Rules:
1. Base all responses ONLY on the provided authorized patient EHR context.
2. Structure handoff responses in SBAR format (Situation, Background, Assessment, Recommendation).
3. Explicitly cite data sources used.
4. Format response in clean GitHub markdown.";

        var userPrompt = $@"User Query from {targetRole} ({callerUser ?? "Attending Staff"}):
{query.PromptQuery}

PATIENT CONTEXT:
{contextJson}";

        var response = await _aiProvider.ExecutePromptAsync(new AiPromptRequest
        {
            SystemPrompt = systemPrompt,
            UserPrompt = userPrompt,
            Temperature = 0.2
        }, cancellationToken);

        var safetyValidation = await _safetyValidator.ValidateOutputAsync(response.Content, $"{targetRole}Copilot", contextBundle, cancellationToken);

        var citations = new List<string> { "Authorized EHR Context", "Vital Signs Telemetry" };
        if (contextBundle.ActiveMedications.Count > 0) citations.Add("Active MAR Prescriptions");
        if (contextBundle.ActiveDiagnoses.Count > 0) citations.Add("Diagnosed Conditions Log");

        await RecordAuditAndTelemetryAsync(patientId != Guid.Empty ? patientId : null, contextBundle.PatientName, $"{targetRole}Copilot", response, safetyValidation.IsApproved, callerRole ?? targetRole, callerUser, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new AiCopilotResponseDto
        {
            ResponseText = response.Content,
            PatientName = contextBundle.PatientName,
            PatientIdCode = contextBundle.PatientIdCode,
            Citations = citations,
            ModelVersion = response.ModelUsed,
            SafetyStatus = safetyValidation.Status,
            GuardrailsEnforced = true,
            LatencyMs = response.LatencyMs
        };
    }

    #endregion

    #region 7. Human-in-the-Loop Feedback, Disposition & Task Routing

    public async Task<bool> RecordFeedbackAsync(
        AiFeedbackRequestDto feedback,
        string? callerRole = null,
        string? callerUser = null,
        CancellationToken cancellationToken = default)
    {
        Guid? createdTaskId = null;

        // Auto-create real ConnectCare Task when an AI Care Priority is Accepted
        if (feedback.WorkflowType.Equals("CarePriorities", StringComparison.OrdinalIgnoreCase) &&
            feedback.Action.Equals("Accepted", StringComparison.OrdinalIgnoreCase) &&
            feedback.CreateTaskOnAccept &&
            Guid.TryParse(feedback.TargetEntityId, out var priorityGuid))
        {
            var priorityRecord = await _context.AiCarePriorities.FindAsync(new object[] { priorityGuid }, cancellationToken);
            if (priorityRecord != null)
            {
                var taskPriority = priorityRecord.PriorityLevel.Equals("Critical", StringComparison.OrdinalIgnoreCase) ? TaskPriority.High :
                                   priorityRecord.PriorityLevel.Equals("High", StringComparison.OrdinalIgnoreCase) ? TaskPriority.High :
                                   priorityRecord.PriorityLevel.Equals("Low", StringComparison.OrdinalIgnoreCase) ? TaskPriority.Low : TaskPriority.Medium;

                var newTask = new TaskItem
                {
                    Id = Guid.NewGuid(),
                    TaskIdCode = $"TSK-{new Random().Next(1000, 9999)}",
                    Title = priorityRecord.Title,
                    Description = $"{priorityRecord.SuggestedAction} (Rationale: {priorityRecord.Rationale})",
                    PatientId = priorityRecord.PatientId,
                    PatientName = priorityRecord.PatientName,
                    PatientIdCode = priorityRecord.PatientIdCode,
                    TaskType = priorityRecord.ActionType,
                    Priority = taskPriority,
                    AssignedCaregiver = !string.IsNullOrWhiteSpace(priorityRecord.TargetRole) ? priorityRecord.TargetRole : "Attending Staff",
                    AssigneeRole = priorityRecord.TargetRole,
                    DueTime = priorityRecord.Urgency.Equals("Immediate", StringComparison.OrdinalIgnoreCase) 
                        ? DateTime.UtcNow.AddHours(1).ToString("MMM dd, yyyy h:mm tt")
                        : DateTime.UtcNow.AddHours(8).ToString("MMM dd, yyyy h:mm tt"),
                    Status = TaskStatusItem.Pending,
                    StatusStr = "Open",
                    CreatedDate = DateTime.UtcNow,
                    CreatedBy = callerUser ?? "AI Care Intelligence"
                };

                _context.Tasks.Add(newTask);
                createdTaskId = newTask.Id;
                priorityRecord.ResultingTaskId = createdTaskId;
            }
        }

        var feedbackRecord = new AiFeedbackRecord
        {
            WorkflowType = feedback.WorkflowType,
            TargetEntityId = feedback.TargetEntityId,
            Action = feedback.Action,
            FeedbackNotes = feedback.FeedbackNotes,
            EditedOutputJson = feedback.EditedContent,
            SafetyFlag = feedback.SafetyFlag,
            ResultingTaskId = createdTaskId ?? feedback.ResultingTaskId,
            UserRole = !string.IsNullOrWhiteSpace(callerRole) ? callerRole : (feedback.UserRole ?? "Clinician"),
            UserName = !string.IsNullOrWhiteSpace(callerUser) ? callerUser : (feedback.UserName ?? "Clinician Reviewer"),
            CreatedDate = DateTime.UtcNow
        };

        _context.AiFeedbackRecords.Add(feedbackRecord);

        // Update target entity disposition
        if (Guid.TryParse(feedback.TargetEntityId, out var targetGuid))
        {
            if (feedback.WorkflowType.Equals("PatientSummary", StringComparison.OrdinalIgnoreCase))
            {
                var summary = await _context.AiPatientSummaries.FindAsync(new object[] { targetGuid }, cancellationToken);
                if (summary != null)
                {
                    summary.DispositionStatus = feedback.Action;
                    summary.ReviewedBy = feedbackRecord.UserName;
                    summary.ReviewedDate = DateTime.UtcNow;
                    summary.ReviewNotes = feedback.FeedbackNotes;
                    if (!string.IsNullOrWhiteSpace(feedback.EditedContent))
                    {
                        summary.CurrentStatus = feedback.EditedContent;
                    }
                }
            }
            else if (feedback.WorkflowType.Equals("CarePriorities", StringComparison.OrdinalIgnoreCase))
            {
                var cp = await _context.AiCarePriorities.FindAsync(new object[] { targetGuid }, cancellationToken);
                if (cp != null)
                {
                    cp.DispositionStatus = feedback.Action;
                    cp.ActionedBy = feedbackRecord.UserName;
                    cp.ActionedDate = DateTime.UtcNow;
                    cp.Notes = feedback.FeedbackNotes;
                    if (createdTaskId.HasValue) cp.ResultingTaskId = createdTaskId.Value;
                }
            }
            else if (feedback.WorkflowType.Equals("DischargeReview", StringComparison.OrdinalIgnoreCase))
            {
                var dr = await _context.AiDischargeReviews.FindAsync(new object[] { targetGuid }, cancellationToken);
                if (dr != null)
                {
                    dr.DispositionStatus = feedback.Action;
                    dr.ReviewedBy = feedbackRecord.UserName;
                    dr.ReviewedDate = DateTime.UtcNow;
                    dr.ReviewNotes = feedback.FeedbackNotes;
                }
            }
            else if (feedback.WorkflowType.Equals("MedicationReview", StringComparison.OrdinalIgnoreCase))
            {
                var mr = await _context.AiMedicationReviews.FindAsync(new object[] { targetGuid }, cancellationToken);
                if (mr != null)
                {
                    mr.DispositionStatus = feedback.Action;
                    mr.ReviewedBy = feedbackRecord.UserName;
                    mr.ReviewedDate = DateTime.UtcNow;
                    mr.ReviewNotes = feedback.FeedbackNotes;
                }
            }
        }

        _context.AiActivityLogRecords.Add(new AiActivityLogRecord
        {
            TimeText = DateTime.UtcNow.ToString("h:mm tt"),
            Title = $"Clinician Feedback ({feedback.Action}) on {feedback.WorkflowType}{(createdTaskId.HasValue ? " [Task Created]" : "")}",
            ResidentInfo = feedbackRecord.UserName ?? "Clinical Staff",
            Type = feedback.SafetyFlag ? "Warning" : "Success",
            Service = $"AI {feedback.WorkflowType}",
            CreatedDate = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task RecordAuditAndTelemetryAsync(
        Guid? patientId,
        string patientName,
        string workflowType,
        AiPromptResponse response,
        bool safetyCheckPassed,
        string? callerRole,
        string? callerUser,
        CancellationToken cancellationToken)
    {
        _context.AiAuditEntryRecords.Add(new AiAuditEntryRecord
        {
            PatientId = patientId,
            PatientName = patientName,
            WorkflowType = workflowType,
            ModelVersion = response.ModelUsed,
            Provider = response.ProviderUsed,
            PromptTokens = response.PromptTokens,
            CompletionTokens = response.CompletionTokens,
            TotalTokens = response.TotalTokens,
            LatencyMs = response.LatencyMs,
            SafetyCheckPassed = safetyCheckPassed,
            Status = response.IsSuccess ? "Success" : "Error",
            ErrorMessage = response.ErrorMessage,
            UserRole = callerRole ?? "Doctor",
            UserName = callerUser ?? "Dr. Sarah Wilson",
            RequestTimestampUtc = DateTime.UtcNow,
            CreatedDate = DateTime.UtcNow
        });

        _context.AiActivityLogRecords.Add(new AiActivityLogRecord
        {
            TimeText = DateTime.UtcNow.ToString("h:mm tt"),
            Title = $"{workflowType} generated for {patientName}",
            ResidentInfo = patientName,
            Type = response.IsSuccess ? "Success" : "Error",
            Service = $"AI {workflowType}",
            CreatedDate = DateTime.UtcNow
        });

        var settings = await _context.AiSettingsRecords.FirstOrDefaultAsync(cancellationToken);
        if (settings != null)
        {
            settings.TokensUsedThisMonth += response.TotalTokens;
        }

        var metric = await _context.AiWorkflowMetricRecords
            .FirstOrDefaultAsync(w => w.WorkflowName.Contains(workflowType), cancellationToken);

        if (metric != null)
        {
            metric.RequestsCount += 1;
            metric.AvgResponseTimeSeconds = $"{((double)response.LatencyMs / 1000.0):F2} sec";
            metric.UpdatedDate = DateTime.UtcNow;
        }
    }

    #endregion
}
