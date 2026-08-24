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
            .FirstOrDefaultAsync(p => p.PatientIdCode.ToLower() == idLower || p.Mrn.ToLower() == idLower || (isGuid && p.Id == parsedGuid));
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
}






