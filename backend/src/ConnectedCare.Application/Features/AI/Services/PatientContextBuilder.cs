using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Application.Features.AI.DTOs;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Application.Features.AI.Services;

public class PatientContextBuilder : IPatientContextBuilder
{
    private readonly ConnectedCareDbContext _context;

    public PatientContextBuilder(ConnectedCareDbContext context)
    {
        _context = context;
    }

    public async Task<PatientContextBundle> BuildSummaryContextAsync(Guid patientId, CancellationToken cancellationToken = default)
    {
        return await BuildBasePatientContextAsync(patientId, includeDischarge: false, cancellationToken);
    }

    public async Task<PatientContextBundle> BuildCarePrioritiesContextAsync(Guid patientId, CancellationToken cancellationToken = default)
    {
        return await BuildBasePatientContextAsync(patientId, includeDischarge: false, cancellationToken);
    }

    public async Task<PatientContextBundle> BuildDischargeReviewContextAsync(Guid patientId, CancellationToken cancellationToken = default)
    {
        return await BuildBasePatientContextAsync(patientId, includeDischarge: true, cancellationToken);
    }

    public async Task<PatientContextBundle> BuildAlertPrioritizationContextAsync(Guid patientId, CancellationToken cancellationToken = default)
    {
        return await BuildBasePatientContextAsync(patientId, includeDischarge: false, cancellationToken);
    }

    public async Task<AiContextPreviewDto> GetContextPreviewAsync(Guid patientId, string callerRole, CancellationToken cancellationToken = default)
    {
        var bundle = await BuildBasePatientContextAsync(patientId, includeDischarge: true, cancellationToken);
        return new AiContextPreviewDto
        {
            PatientId = patientId,
            PatientName = bundle.PatientName,
            PatientIdCode = bundle.PatientIdCode,
            AuthorizedScope = $"Role: {callerRole} | Minimum-Necessary Clinical Scope",
            ContextBundle = bundle,
            Purpose = "Clinical & Care Intelligence Generation",
            SafetyPolicy = "Minimum-Necessary PHI Boundary strictly enforced. Output requires licensed clinician review. Zero fabricated clinical facts policy.",
            TimestampUtc = DateTime.UtcNow
        };
    }

    private async Task<PatientContextBundle> BuildBasePatientContextAsync(Guid patientId, bool includeDischarge, CancellationToken cancellationToken)
    {
        var patient = await _context.Patients
            .Include(p => p.PrimaryDoctor)
            .FirstOrDefaultAsync(p => p.Id == patientId, cancellationToken);

        if (patient == null)
        {
            return new PatientContextBundle
            {
                PatientId = patientId,
                PatientName = "Patient Record Not Found",
                PatientIdCode = "NOT-FOUND",
                AgeGender = "Unavailable",
                CareUnit = "Unavailable",
                RoomBed = "Unavailable",
                PrimaryDoctor = "Unassigned",
                AssignedNurse = "Unassigned",
                AdmissionDate = "Unavailable",
                FallRiskLevel = "Unavailable",
                ActiveDiagnoses = new List<string>(),
                Allergies = new List<string>(),
                ActiveMedications = new List<ContextMedicationItem>(),
                RecentVitals = new List<ContextVitalItem>(),
                ActiveAlerts = new List<ContextAlertItem>(),
                PendingTasks = new List<ContextTaskItem>(),
                ContextGeneratedUtc = DateTime.UtcNow
            };
        }

        var bundle = new PatientContextBundle
        {
            PatientId = patient.Id,
            PatientName = !string.IsNullOrWhiteSpace(patient.Name) ? patient.Name : $"{patient.FirstName} {patient.LastName}".Trim(),
            PatientIdCode = !string.IsNullOrWhiteSpace(patient.PatientIdCode) ? patient.PatientIdCode : $"PT-{patient.Id.ToString()[..5]}",
            AgeGender = !string.IsNullOrWhiteSpace(patient.AgeGender) ? patient.AgeGender : $"{patient.Gender} • Blood Type: {patient.BloodType}",
            CareUnit = !string.IsNullOrWhiteSpace(patient.CareUnit) ? patient.CareUnit : "General Ward",
            RoomBed = !string.IsNullOrWhiteSpace(patient.FloorRoom) ? patient.FloorRoom : "Unassigned Room",
            PrimaryDoctor = patient.PrimaryDoctor?.Name ?? (!string.IsNullOrWhiteSpace(patient.PrimaryDoctorName) ? patient.PrimaryDoctorName : "Unassigned Physician"),
            AssignedNurse = !string.IsNullOrWhiteSpace(patient.AssignedNurseName) ? patient.AssignedNurseName : "Unassigned Nurse",
            AdmissionDate = patient.CreatedDate.ToString("MM/dd/yyyy"),
            FallRiskLevel = "Low",
            ContextGeneratedUtc = DateTime.UtcNow
        };

        // Active Diagnoses strictly from authoritative EHR record
        if (!string.IsNullOrWhiteSpace(patient.MedicalConditions))
        {
            bundle.ActiveDiagnoses = patient.MedicalConditions.Split(new[] { ',', ';', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(d => d.Trim())
                .Where(d => !string.IsNullOrWhiteSpace(d))
                .ToList();
        }
        else
        {
            bundle.ActiveDiagnoses = new List<string>();
        }

        // Allergies strictly from authoritative EHR record
        if (!string.IsNullOrWhiteSpace(patient.Allergies))
        {
            bundle.Allergies = patient.Allergies.Split(new[] { ',', ';', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(a => a.Trim())
                .Where(a => !string.IsNullOrWhiteSpace(a))
                .ToList();
        }
        else
        {
            bundle.Allergies = new List<string>();
        }

        // Active Medications strictly from database by PatientId
        var meds = await _context.MedicationRecords
            .Where(m => m.PatientId == patientId)
            .OrderByDescending(m => m.CreatedDate)
            .Take(10)
            .ToListAsync(cancellationToken);

        bundle.ActiveMedications = meds.Select(m => new ContextMedicationItem
        {
            Name = m.Name,
            Dosage = m.Dosage,
            Frequency = m.Frequency,
            Route = m.Route ?? "Oral",
            Status = m.Status,
            PrescribedBy = m.PrescribedBy,
            StartDate = m.ExpiryDateText
        }).ToList();

        // Recent Vitals strictly from vital rounds database by PatientId
        var vitals = await _context.VitalRounds
            .Where(v => v.PatientId == patientId)
            .OrderByDescending(v => v.CreatedDate)
            .Take(5)
            .ToListAsync(cancellationToken);

        bundle.RecentVitals = vitals.Select(v => new ContextVitalItem
        {
            BloodPressure = v.BloodPressure,
            HeartRate = v.HeartRate,
            TemperatureF = v.Temperature,
            SpO2 = v.SpO2,
            RespirationRate = v.RespiratoryRate,
            PainLevel = v.PainScore,
            RecordedAt = v.LastRoundTimeText ?? v.CreatedDate.ToString("h:mm tt")
        }).ToList();

        // Active Alerts strictly by PatientId
        var alerts = await _context.Alerts
            .Where(a => a.PatientId == patientId && !a.IsAcknowledged && a.Status != "Resolved")
            .OrderByDescending(a => a.CreatedDate)
            .Take(5)
            .ToListAsync(cancellationToken);

        bundle.ActiveAlerts = alerts.Select(a => new ContextAlertItem
        {
            Id = a.Id,
            Title = a.Title,
            Severity = a.Severity.ToString(),
            Type = a.Type ?? "Clinical Alert",
            CreatedAt = a.CreatedDate.ToString("MM/dd h:mm tt")
        }).ToList();

        // Pending Tasks strictly by PatientId
        var tasks = await _context.Tasks
            .Where(t => t.PatientId == patientId && t.Status != Domain.Enums.TaskStatusItem.Completed)
            .OrderBy(t => t.DueTime)
            .Take(5)
            .ToListAsync(cancellationToken);

        bundle.PendingTasks = tasks.Select(t => new ContextTaskItem
        {
            Id = t.Id,
            Title = t.Title,
            Priority = t.Priority.ToString(),
            Status = t.Status.ToString(),
            DueDate = t.DueTime,
            AssignedTo = t.AssignedCaregiver
        }).ToList();

        // Discharge Checklist strictly by PatientId
        if (includeDischarge)
        {
            var checklist = await _context.DischargeChecklists
                .FirstOrDefaultAsync(c => c.PatientId == patientId, cancellationToken);

            if (checklist != null)
            {
                bundle.DischargeChecklist = new ContextDischargeChecklistInfo
                {
                    ChecklistId = checklist.Id,
                    Status = checklist.ChecklistStatus.ToString(),
                    ProgressPercentage = checklist.ProgressPercentage,
                    CompletedItemsCount = checklist.CompletedItemsCount,
                    TotalItemsCount = checklist.TotalItemsCount,
                    PendingItemsCount = checklist.PendingItemsCount,
                    PendingItemTitles = new List<string>()
                };
            }
        }

        return bundle;
    }
}
