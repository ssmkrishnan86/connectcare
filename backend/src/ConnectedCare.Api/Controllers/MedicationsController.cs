using ConnectedCare.Application.Features.Medications.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicationsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public MedicationsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMedications(
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] Guid? patientId = null,
        [FromQuery] Guid? nurseId = null,
        [FromQuery] Guid? doctorId = null)
    {
        // First sync any patients with CurrentMedications that don't have records yet
        var patientsWithMeds = await _context.Patients
            .Where(p => !string.IsNullOrEmpty(p.CurrentMedications))
            .ToListAsync();

        foreach (var p in patientsWithMeds)
        {
            var hasAny = await _context.MedicationRecords.AnyAsync(m => m.PatientId == p.Id || m.PatientIdCode == p.PatientIdCode);
            if (!hasAny)
            {
                var medNames = p.CurrentMedications.Split(new[] { ',', '\n', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                foreach (var mName in medNames)
                {
                    _context.MedicationRecords.Add(new MedicationRecord
                    {
                        Id = Guid.NewGuid(),
                        MedicationIdCode = $"MED-{Random.Shared.Next(1000, 9999)}",
                        Name = mName,
                        PatientId = p.Id,
                        PatientName = p.Name,
                        PatientIdCode = p.PatientIdCode,
                        PatientAvatar = p.Avatar,
                        Dosage = "Standard Dose",
                        Route = "Oral",
                        Frequency = "Daily",
                        PrescribedBy = p.PrimaryDoctorName ?? "Dr. Sarah Wilson",
                        Status = "Active",
                        CreatedDate = DateTime.UtcNow,
                        UpdatedDate = DateTime.UtcNow
                    });
                }
                await _context.SaveChangesAsync();
            }
        }

        var query = _context.MedicationRecords.AsQueryable();

        if (patientId.HasValue && patientId.Value != Guid.Empty)
        {
            query = query.Where(m => m.PatientId == patientId.Value);
        }

        if (nurseId.HasValue && nurseId.Value != Guid.Empty)
        {
            var assignedPatientIds = await _context.PatientNurses
                .Where(pn => pn.NurseId == nurseId.Value)
                .Select(pn => pn.PatientId)
                .ToListAsync();
            var docPatIds = await _context.Patients
                .Where(p => p.AssignedNurseId == nurseId.Value)
                .Select(p => p.Id)
                .ToListAsync();
            var allNursePids = assignedPatientIds.Union(docPatIds).ToList();
            if (allNursePids.Count > 0)
            {
                query = query.Where(m => m.PatientId.HasValue && allNursePids.Contains(m.PatientId.Value));
            }
            else
            {
                query = query.Where(m => false);
            }
        }

        if (doctorId.HasValue && doctorId.Value != Guid.Empty)
        {
            var assignedPatientIds = await _context.PatientDoctors
                .Where(pd => pd.DoctorId == doctorId.Value)
                .Select(pd => pd.PatientId)
                .ToListAsync();
            var docPatIds = await _context.Patients
                .Where(p => p.PrimaryDoctorId == doctorId.Value)
                .Select(p => p.Id)
                .ToListAsync();
            var allDocPids = assignedPatientIds.Union(docPatIds).ToList();
            if (allDocPids.Count > 0)
            {
                query = query.Where(m => m.PatientId.HasValue && allDocPids.Contains(m.PatientId.Value));
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(m => m.Name.ToLower().Contains(lower) ||
                                     m.PatientName.ToLower().Contains(lower) ||
                                     m.PrescribedBy.ToLower().Contains(lower));
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(m => m.Status.ToLower() == status.ToLower());
        }

        var list = await query.OrderByDescending(m => m.CreatedDate).ToListAsync();
        return Ok(new { success = true, message = "Success", data = list });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetMedicationStats()
    {
        var totalMedications = await _context.MedicationRecords.CountAsync();
        var active = await _context.MedicationRecords.CountAsync(m => m.Status == "Active");
        var dueToday = 42;
        var prescriptions = 156;
        var interactions = 5;

        return Ok(new
        {
            success = true,
            message = "Success",
            data = new
            {
                totalMedications = totalMedications > 0 ? totalMedications : 248,
                active = active > 0 ? active : 198,
                dueToday,
                prescriptions,
                interactionsFound = interactions
            }
        });
    }

    [HttpGet("reminders")]
    public async Task<IActionResult> GetReminders()
    {
        var reminders = await _context.MedicationReminders.ToListAsync();
        return Ok(new { success = true, message = "Success", data = reminders });
    }

    [HttpGet("expiring")]
    public async Task<IActionResult> GetExpiringSoon()
    {
        var expiring = new[]
        {
            new { name = "Amoxicillin 500mg", batch = "Batch: AMX1256", expiryDate = "May 22, 2025", daysLeft = "3 days left" },
            new { name = "Insulin Glargine", batch = "Batch: INS4587", expiryDate = "May 25, 2025", daysLeft = "6 days left" },
            new { name = "Losartan 50mg", batch = "Batch: LOS7890", expiryDate = "May 28, 2025", daysLeft = "9 days left" }
        };
        return Ok(new { success = true, message = "Success", data = expiring });
    }

    [HttpGet("interactions")]
    public async Task<IActionResult> GetDrugInteractions()
    {
        var alerts = await _context.DrugInteractionAlerts.ToListAsync();
        return Ok(new { success = true, message = "Success", data = alerts });
    }

    [HttpPost]
    public async Task<IActionResult> AddMedication([FromBody] MedicationRecord medication)
    {
        if (!medication.PatientId.HasValue || medication.PatientId.Value == Guid.Empty)
        {
            var p = await _context.Patients.FirstOrDefaultAsync(p => (!string.IsNullOrEmpty(medication.PatientIdCode) && p.PatientIdCode == medication.PatientIdCode) || (!string.IsNullOrEmpty(medication.PatientName) && p.Name.ToLower() == medication.PatientName.ToLower()))
                    ?? await _context.Patients.FirstOrDefaultAsync();
            if (p != null)
            {
                medication.PatientId = p.Id;
                medication.PatientName = p.Name;
                medication.PatientIdCode = p.PatientIdCode;
                medication.PatientAvatar = p.Avatar;
            }
        }

        if (medication.PatientId == null)
        {
            return BadRequest(new
            {
                success = false,
                message = "PatientId is required for medication prescription"
            });
        }

        if (string.IsNullOrEmpty(medication.MedicationIdCode))
        {
            medication.MedicationIdCode = $"MED-{Guid.NewGuid():N}";
        }

        // Get patient
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == medication.PatientId.Value);

        if (patient == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Patient not found"
            });
        }

        // Populate patient information on medication
        medication.PatientName = patient.Name;
        medication.PatientIdCode = patient.PatientIdCode;
        medication.PatientAvatar = patient.Avatar;


        _context.MedicationRecords.Add(medication);

        // Find the assigned doctor and nurse for this patient
        var careTeamMembers = await _context.CareTeamMembers
            .Where(c => c.PatientId == medication.PatientId.Value)
            .ToListAsync();

        foreach (var member in careTeamMembers)
        {
            Guid? recipientId = null;
            string recipientRole = string.Empty;

            if (member.DoctorId.HasValue)
            {
                recipientId = member.DoctorId.Value;
                recipientRole = "Doctor";
            }
            else if (member.NurseId.HasValue)
            {
                recipientId = member.NurseId.Value;
                recipientRole = "Nurse";
            }

            if (!recipientId.HasValue)
                continue;

            var alert = new Alert
            {
                AlertIdCode = $"ALT-MED-{Guid.NewGuid():N}",
                Title = "Medication Alert",
                Description =
                    $"Medication {medication.Name} has been prescribed for patient {patient.Name}.",

                PatientId = patient.Id,
                PatientName = patient.Name,
                PatientIdCode = patient.PatientIdCode,
                PatientAvatar = patient.Avatar,

                Type = "Medication",
                Severity = AlertSeverity.Medium,

                RecipientId = recipientId,
                RecipientRole = recipientRole,

                ReportedBy = medication.PrescribedBy,
                ReportedByRole = "Doctor",

                TriggerCondition = "Medication prescribed",
                TimestampText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt"),

                Status = "New",
                IsAcknowledged = false,

                Source = "Medication",
                DetectedBy = "Medication Service",

                Notes =
                    $"Medication: {medication.Name}; " +
                    $"Dosage: {medication.Dosage}; " +
                    $"Route: {medication.Route}; " +
                    $"Frequency: {medication.Frequency}"
            };

            _context.Alerts.Add(alert);
        }

        await _context.SaveChangesAsync();

        return StatusCode(StatusCodes.Status201Created, new
        {
            success = true,
            message = "Medication added successfully",
            data = medication
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMedication(Guid id, [FromBody] MedicationRecord updated)
    {
        var record = await _context.MedicationRecords.FindAsync(id);
        if (record == null)
            return NotFound(new { success = false, message = "Medication record not found" });

        record.Name = updated.Name;
        record.Form = updated.Form;
        record.Dosage = updated.Dosage;
        record.Route = updated.Route;
        record.Frequency = updated.Frequency;
        record.NextDoseTime = updated.NextDoseTime;
        record.RelativeTimeText = updated.RelativeTimeText;
        record.Status = updated.Status;
        record.PrescribedBy = updated.PrescribedBy;
        record.PrescribedBySpecialty = updated.PrescribedBySpecialty;
        record.Batch = updated.Batch;
        record.ExpiryDateText = updated.ExpiryDateText;
        record.DaysLeftText = updated.DaysLeftText;
        record.Category = updated.Category;
        record.PatientName = updated.PatientName;
        record.PatientIdCode = updated.PatientIdCode;

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Medication updated successfully", data = record });
    }

    [HttpPost("start-round")]
    public async Task<IActionResult> StartMedicationRound()
    {
        var pendingRecords = await _context.MedicationRecords
            .Where(m => m.Status == "Pending" || m.Status == "Overdue")
            .ToListAsync();

        foreach (var m in pendingRecords)
        {
            m.Status = "Given";
            m.RelativeTimeText = "Given";
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = $"Started Medication Round! Updated {pendingRecords.Count} medications to Given.", count = pendingRecords.Count });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedication(Guid id)
    {
        var record = await _context.MedicationRecords.FindAsync(id);
        if (record == null)
            return NotFound(new { success = false, message = "Medication record not found" });

        _context.MedicationRecords.Remove(record);
        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Medication deleted successfully" });
    }

    [HttpPost("{id}/administer")]
    public async Task<IActionResult> AdministerMedication(
    Guid id,
    [FromBody] MedicationAdministrationRequest request)
    {
        var medication = await _context.MedicationRecords
            .FirstOrDefaultAsync(x => x.Id == id);

        if (medication == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Medication record not found"
            });
        }

        var patient = await _context.Patients
            .FirstOrDefaultAsync(x => x.Id == medication.PatientId);

        if (patient == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Patient not found"
            });
        }

        var nurse = await _context.Nurses
            .FirstOrDefaultAsync(x => x.Id == request.NurseId);

        if (nurse == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Nurse not found"
            });
        }

        var administration = new MedicationAdministration
        {
            MedicationId = medication.Id,
            PatientId = patient.Id,
            NurseId = nurse.Id,
            Status = string.IsNullOrWhiteSpace(request.Status)
                ? "Given"
                : request.Status,
            Notes = request.Notes ?? string.Empty,
            AdministeredAt = DateTime.UtcNow,
            CreatedBy = nurse.Name,
            UpdatedBy = nurse.Name
        };

        _context.MedicationAdministrations.Add(administration);

        medication.Status = administration.Status;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Medication administered successfully",
            data = new
            {
                administration.Id,
                medicationId = administration.MedicationId,
                patientId = administration.PatientId,
                nurseId = administration.NurseId,
                status = administration.Status,
                notes = administration.Notes,
                administeredAt = administration.AdministeredAt
            }
        });
    }

    [HttpGet("{id}/administrations")]
    public async Task<IActionResult> GetMedicationAdministrations(Guid id)
    {
        var medicationExists = await _context.MedicationRecords
            .AnyAsync(x => x.Id == id);

        if (!medicationExists)
        {
            return NotFound(new
            {
                success = false,
                message = "Medication record not found"
            });
        }

        var administrations = await _context.MedicationAdministrations
            .Where(x => x.MedicationId == id)
            .OrderByDescending(x => x.AdministeredAt)
            .Select(x => new
            {
                x.Id,
                medicationId = x.MedicationId,
                patientId = x.PatientId,
                nurseId = x.NurseId,
                x.Status,
                x.Notes,
                x.AdministeredAt,
                x.CreatedDate,
                x.CreatedBy
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            message = "Medication administrations retrieved successfully",
            data = administrations
        });
    }
}



