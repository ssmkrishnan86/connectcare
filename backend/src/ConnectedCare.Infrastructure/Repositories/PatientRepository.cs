using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Infrastructure.Common.DTOs;

namespace ConnectedCare.Infrastructure.Repositories;

public class PatientRepository : Repository<Patient>, IPatientRepository
{
    public PatientRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<Patient>> SearchPatientsAsync(string? search, string? status, string? careUnit, Guid? doctorId = null, Guid? nurseId = null)
    {
        var query = _context.Patients
            .Include(p => p.PrimaryDoctor)
            .Include(p => p.PatientDoctors)
                .ThenInclude(pd => pd.Doctor)
            .Include(p => p.PatientNurses)
                .ThenInclude(pn => pn.Nurse)
            .AsQueryable();

        // 1. Role-based Doctor filter via patient_doctors table and primaryDoctorId
        if (doctorId.HasValue && doctorId.Value != Guid.Empty)
        {
            var docPatientIds = await _context.PatientDoctors
                .Where(pd => pd.DoctorId == doctorId.Value)
                .Select(pd => pd.PatientId)
                .ToListAsync();

            query = query.Where(p => docPatientIds.Contains(p.Id) || p.PrimaryDoctorId == doctorId.Value);
        }

        // 2. Role-based Nurse filter strictly via patient_nurses table
        if (nurseId.HasValue && nurseId.Value != Guid.Empty)
        {
            var nursePatientIds = await _context.PatientNurses
                .Where(pn => pn.NurseId == nurseId.Value)
                .Select(pn => pn.PatientId)
                .ToListAsync();

            query = query.Where(p => nursePatientIds.Contains(p.Id));
        }

        // 3. Search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchLower) ||
                p.PatientIdCode.ToLower().Contains(searchLower) ||
                p.Mrn.ToLower().Contains(searchLower) ||
                p.Phone.ToLower().Contains(searchLower) ||
                p.Email.ToLower().Contains(searchLower));
        }

        // 4. Status filter
        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase) && !status.Equals("All Status", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<PatientStatus>(status.Replace(" ", ""), true, out var parsedStatus))
            {
                query = query.Where(p => p.Status == parsedStatus);
            }
        }

        // 5. Care Unit filter
        if (!string.IsNullOrWhiteSpace(careUnit) && !careUnit.Equals("All", StringComparison.OrdinalIgnoreCase) && !careUnit.Equals("All Units", StringComparison.OrdinalIgnoreCase))
        {
            var careUnitLower = careUnit.Trim().ToLower();
            query = query.Where(p => p.CareUnit.ToLower().Contains(careUnitLower));
        }

        return await query.OrderByDescending(p => p.CreatedDate).ToListAsync();
    }

    public async Task<Patient?> GetByIdCodeOrGuidAsync(string id)
    {
        var isGuid = Guid.TryParse(id, out var parsedGuid);
        var idLower = id.ToLower();
        return await _context.Patients
            .Include(p => p.PrimaryDoctor)
            .Include(p => p.PatientDoctors)
                .ThenInclude(pd => pd.Doctor)
            .Include(p => p.PatientNurses)
                .ThenInclude(pn => pn.Nurse)
            .Include(p => p.Alerts)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.PatientIdCode.ToLower() == idLower || p.Mrn.ToLower() == idLower || (isGuid && p.Id == parsedGuid) || p.Name.ToLower() == idLower || (p.FirstName + " " + p.LastName).ToLower() == idLower);
    }

    public async Task<PatientStatsDto> GetPatientStatsAsync(Guid? doctorId = null, Guid? nurseId = null)
    {
        var query = _context.Patients.AsQueryable();

        // 1. Role-based Doctor filter
        if (doctorId.HasValue && doctorId.Value != Guid.Empty)
        {
            var docPatientIds = await _context.PatientDoctors
                .Where(pd => pd.DoctorId == doctorId.Value)
                .Select(pd => pd.PatientId)
                .ToListAsync();

            query = query.Where(p => docPatientIds.Contains(p.Id) || p.PrimaryDoctorId == doctorId.Value);
        }

        // 2. Role-based Nurse filter strictly via patient_nurses table
        if (nurseId.HasValue && nurseId.Value != Guid.Empty)
        {
            var nursePatientIds = await _context.PatientNurses
                .Where(pn => pn.NurseId == nurseId.Value)
                .Select(pn => pn.PatientId)
                .ToListAsync();

            query = query.Where(p => nursePatientIds.Contains(p.Id));
        }

        var allPatients = await query.CountAsync();
        var inCare = await query.CountAsync(p => p.Status == PatientStatus.InCare);
        var admitted = await query.CountAsync(p => p.Status == PatientStatus.Admitted);
        var discharged = await query.CountAsync(p => p.Status == PatientStatus.Discharged);
        var inactive = await query.CountAsync(p => p.Status == PatientStatus.Inactive);

        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;
        var newThisMonth = await query.CountAsync(p => p.CreatedDate.Month == currentMonth && p.CreatedDate.Year == currentYear);

        return new PatientStatsDto
        {
            AllPatients = allPatients,
            InCare = inCare,
            Admitted = admitted,
            Discharged = discharged,
            Inactive = inactive,
            NewThisMonth = newThisMonth
        };
    }

    public async Task<DependencyCheckResult> CheckPatientDependenciesAsync(Guid patientId)
    {
        var result = new DependencyCheckResult();

        if (await _context.PatientDoctors.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("assigned doctor");

        if (await _context.PatientNurses.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("assigned nurse");

        if (await _context.CareTeamMembers.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("care team member");

        if (await _context.CarePlans.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("care plan");

        if (await _context.PatientCarePlanRecords.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("patient care plan record");

        if (await _context.Consultations.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("consultation");

        if (await _context.DoctorConsultations.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("doctor consultation");

        if (await _context.Alerts.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("alert");

        if (await _context.Tasks.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("task");

        if (await _context.MedicationRecords.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("medication record");

        if (await _context.MedicationAdministrations.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("medication administration");

        if (await _context.PatientDocumentRecords.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("medical document");

        if (await _context.DischargeChecklists.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("discharge checklist");

        if (await _context.ShiftHandoverPatientRecords.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("shift handover");

        if (await _context.VitalRounds.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("vital record");

        if (await _context.NurseDocumentations.AnyAsync(x => x.PatientId == patientId))
            result.Dependencies.Add("nurse documentation");

        if (await _context.ClinicalEncounterRecords.AnyAsync(
                x => x.PatientIdCode != null &&
                     _context.Patients
                         .Where(p => p.Id == patientId)
                         .Select(p => p.PatientIdCode)
                         .Contains(x.PatientIdCode)))
        {
            result.Dependencies.Add("clinical encounter");
        }

        return result;
    }
}






