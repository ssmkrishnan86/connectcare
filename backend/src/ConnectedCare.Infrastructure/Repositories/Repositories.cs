using Microsoft.EntityFrameworkCore;
using ConnectedCare.Application.Common.Interfaces;
using ConnectedCare.Application.Features.Dashboard.DTOs;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly ConnectedCareDbContext _context;

    public Repository(ConnectedCareDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _context.Set<T>().ToListAsync();
    }

    public async Task<T?> GetByIdAsync(Guid id)
    {
        return await _context.Set<T>().FindAsync(id);
    }

    public async Task<T> AddAsync(T entity)
    {
        await _context.Set<T>().AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(T entity)
    {
        _context.Set<T>().Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _context.Set<T>().Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}

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
            if (Enum.TryParse<Domain.Enums.PatientStatus>(status.Replace(" ", ""), true, out var parsedStatus))
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
        var inCare = await query.CountAsync(p => p.Status == Domain.Enums.PatientStatus.InCare);
        var admitted = await query.CountAsync(p => p.Status == Domain.Enums.PatientStatus.Admitted);
        var discharged = await query.CountAsync(p => p.Status == Domain.Enums.PatientStatus.Discharged);
        var inactive = await query.CountAsync(p => p.Status == Domain.Enums.PatientStatus.Inactive);

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

public class DoctorRepository : Repository<Doctor>, IDoctorRepository
{
    public DoctorRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<Doctor>> SearchDoctorsAsync(string? search, string? specialty)
    {
        var query = _context.Doctors.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(d =>
                d.Name.Contains(search) ||
                d.DoctorIdCode.Contains(search) ||
                d.Email.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(specialty) && specialty != "All")
        {
            query = query.Where(d => d.Specialty.Equals(specialty, StringComparison.OrdinalIgnoreCase));
        }

        return await query.ToListAsync();
    }
}

public class CareTeamRepository : Repository<CareTeamMember>, ICareTeamRepository
{
    public CareTeamRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<CareTeamMember>> GetCareTeamMembersAsync()
    {
        return await _context.CareTeamMembers
            .Include(c => c.Doctor)
            .Include(c => c.Nurse)
            .Include(c => c.Patient)
            .ToListAsync();
    }
}

public class AlertRepository : Repository<Alert>, IAlertRepository
{
    public AlertRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<Alert>> GetAlertsAsync()
    {
        return await _context.Alerts
            .Include(a => a.Patient)
            .OrderByDescending(a => a.CreatedDate)
            .ToListAsync();
    }

    public async Task<bool> AcknowledgeAlertAsync(Guid id)
    {
        return await _context.AcknowledgeAlertAsync(id);
    }
}

public class TaskRepository : Repository<TaskItem>, ITaskRepository
{
    public TaskRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<TaskItem>> GetTasksAsync()
    {
        return await _context.Tasks
            .Include(t => t.Patient)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();
    }
}

public class DashboardRepository : IDashboardRepository
{
    private readonly ConnectedCareDbContext _context;

    public DashboardRepository(ConnectedCareDbContext context)
    {
        _context = context;
    }

    public async Task<int> GetTotalPatientsCountAsync()
    {
        return await _context.Patients.CountAsync();
    }

    public async Task<int> GetPatientStatusCountAsync(PatientStatus status)
    {
        return await _context.Patients
            .CountAsync(p => p.Status == status);
    }

    public async Task<int> GetActiveAlertsCountAsync()
    {
        return await _context.Alerts
            .CountAsync(a => !a.IsAcknowledged);
    }

    public async Task<int> GetCriticalAlertsCountAsync()
    {
        return await GetAlertsBySeverityCountAsync(AlertSeverity.Critical);
    }

    public async Task<int> GetAlertsBySeverityCountAsync(AlertSeverity severity)
    {
        return await _context.Alerts
            .CountAsync(a =>
                a.Severity == severity &&
                !a.IsAcknowledged);
    }

    public async Task<int> GetActiveCareTeamsCountAsync()
    {
        return await _context.CareTeamMembers.CountAsync();
    }

    public async Task<int> GetOpenTasksCountAsync()
    {
        return await _context.Tasks
            .CountAsync(t => t.Status != TaskStatusItem.Completed);
    }

    public async Task<int> GetCompletedTasksCountAsync()
    {
        return await _context.Tasks
            .CountAsync(t => t.Status == TaskStatusItem.Completed);
    }

    public async Task<int> GetPendingReviewsCountAsync()
    {
        return await _context.Tasks
            .CountAsync(t => t.Status != TaskStatusItem.Completed);
    }

    public async Task<int> GetVitalRoundsCountAsync(
        VitalRoundStatus status)
    {
        return await _context.VitalRounds
            .CountAsync(v => v.Status == status);
    }

    public async Task<int> GetVitalRoundsCountAsync(
        VitalRoundStatus status,
        PatientType patientType)
    {
        return await _context.VitalRounds
            .CountAsync(v =>
                v.Status == status &&
                v.PatientType == patientType);
    }

    public async Task<int> GetMedicationAdministrationsCountAsync(
        string? status = null)
    {
        var query = _context.MedicationAdministrations
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        return await query.CountAsync();
    }

    public async Task<List<Alert>> GetRecentAlertsAsync()
    {
        return await _context.Alerts
            .OrderByDescending(a => a.CreatedDate)
            .Take(5)
            .ToListAsync();
    }

    public async Task<List<SystemIntegration>> GetSystemIntegrationsAsync()
    {
        return await _context.SystemIntegrations
            .ToListAsync();
    }
}
public class DischargeChecklistRepository : Repository<DischargeChecklistRecord>, IDischargeChecklistRepository
{
    public DischargeChecklistRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<DischargeChecklistRecord>> GetChecklistsAsync(string? statusFilter, string? unitFilter, string? search)
    {
        var query = _context.DischargeChecklists.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.PatientName.Contains(search) || c.PatientIdCode.Contains(search) || c.RoomNumber.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(unitFilter) && unitFilter != "All")
        {
            query = query.Where(c => c.CareUnit.Equals(unitFilter, StringComparison.OrdinalIgnoreCase));
        }

        return await query.OrderByDescending(c => c.CreatedDate).ToListAsync();
    }
}

public class ConsultationRepository : Repository<ConsultationRecord>, IConsultationRepository
{
    public ConsultationRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<ConsultationRecord>> GetConsultationsAsync(
        string? tabFilter,
        string? statusFilter,
        string? typeFilter,
        string? patientFilter,
        string? unitFilter,
        string? search,
        string? doctorName)
    {
        var query = _context.Consultations.AsQueryable();

        // 1. Tab Filter
        if (!string.IsNullOrWhiteSpace(tabFilter) && !tabFilter.Equals("All Consultations", StringComparison.OrdinalIgnoreCase))
        {
            if (tabFilter.Equals("My Consultations", StringComparison.OrdinalIgnoreCase))
            {
                if (!string.IsNullOrWhiteSpace(doctorName))
                {
                    var docNorm = doctorName.Replace("Dr.", "").Trim().ToLower();
                    query = query.Where(c => c.PhysicianName.ToLower().Contains(docNorm) || c.PhysicianName.ToLower().Contains(doctorName.ToLower()));
                }
            }
            else if (tabFilter.Equals("Today's Schedule", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("Today", StringComparison.OrdinalIgnoreCase))
            {
                var todayStr = DateTime.Now.ToString("MMM dd");
                var todayLongStr = DateTime.Now.ToString("MMMM dd");
                query = query.Where(c => c.DateTimeText.Contains(todayStr) || c.DateTimeText.Contains(todayLongStr) || c.Status == ConsultationStatus.Scheduled || c.Status == ConsultationStatus.InProgress);
            }
            else if (tabFilter.Equals("Follow-ups", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("Follow-up Due", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.FollowUpDue || (!string.IsNullOrEmpty(c.FollowUpDateText) && c.FollowUpDateText != "-"));
            }
            else if (tabFilter.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.Completed);
            }
        }

        // 2. Status Filter
        if (!string.IsNullOrWhiteSpace(statusFilter) && !statusFilter.Equals("All Status", StringComparison.OrdinalIgnoreCase) && !statusFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (statusFilter.Equals("In Progress", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("InProgress", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.InProgress);
            }
            else if (statusFilter.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.Completed);
            }
            else if (statusFilter.Equals("Scheduled", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.Scheduled);
            }
            else if (statusFilter.Equals("Follow-up Due", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("FollowUpDue", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.FollowUpDue);
            }
        }

        // 3. Consultation Type Filter
        if (!string.IsNullOrWhiteSpace(typeFilter) && !typeFilter.Equals("All Consultation Types", StringComparison.OrdinalIgnoreCase) && !typeFilter.Equals("All Types", StringComparison.OrdinalIgnoreCase) && !typeFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.ConsultationType.ToLower() == typeFilter.ToLower());
        }

        // 4. Patient Filter
        if (!string.IsNullOrWhiteSpace(patientFilter) && !patientFilter.Equals("All Patients", StringComparison.OrdinalIgnoreCase) && !patientFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.PatientName.ToLower().Contains(patientFilter.ToLower()) || c.PatientIdCode.ToLower() == patientFilter.ToLower());
        }

        // 5. Unit / Floor Filter
        if (!string.IsNullOrWhiteSpace(unitFilter) && !unitFilter.Equals("All Units / Floors", StringComparison.OrdinalIgnoreCase) && !unitFilter.Equals("All Units", StringComparison.OrdinalIgnoreCase) && !unitFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.CareUnit.ToLower() == unitFilter.ToLower());
        }

        // 6. Search Query
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c =>
                c.PatientName.ToLower().Contains(s) ||
                c.PatientIdCode.ToLower().Contains(s) ||
                c.PhysicianName.ToLower().Contains(s) ||
                c.Reason.ToLower().Contains(s) ||
                c.Location.ToLower().Contains(s) ||
                c.ClinicalNotes.ToLower().Contains(s) ||
                c.CareUnit.ToLower().Contains(s) ||
                c.RoomNumber.ToLower().Contains(s));
        }

        return await query.OrderByDescending(c => c.CreatedDate).ToListAsync();
    }
}

public class CarePlanRepository : Repository<CarePlanRecord>, ICarePlanRepository
{
    public CarePlanRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<CarePlanRecord>> GetCarePlansAsync(
        string? tabFilter,
        string? statusFilter,
        string? unitFilter,
        string? patientFilter,
        string? conditionFilter,
        string? search,
        string? doctorName)
    {
        var query = _context.CarePlans.AsQueryable();

        // 1. Tab Filter
        if (!string.IsNullOrWhiteSpace(tabFilter) && !tabFilter.Equals("All Care Plans", StringComparison.OrdinalIgnoreCase) && !tabFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (tabFilter.Equals("My Patients' Plans", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("My Patients Plans", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("My Plans", StringComparison.OrdinalIgnoreCase))
            {
                if (!string.IsNullOrWhiteSpace(doctorName))
                {
                    var docNorm = doctorName.Replace("Dr.", "").Trim().ToLower();
                    query = query.Where(c => c.AttendingDoctorName.ToLower().Contains(docNorm) || c.AttendingDoctorName.ToLower().Contains(doctorName.ToLower()) || c.AssignedNurseName.ToLower().Contains(doctorName.ToLower()));
                }
            }
            else if (tabFilter.Equals("Active Plans", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("Active", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.Active);
            }
            else if (tabFilter.Equals("Completed Plans", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.Completed);
            }
            else if (tabFilter.Equals("Review Due", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("ReviewDue", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.ReviewDue);
            }
        }

        // 2. Status Filter
        if (!string.IsNullOrWhiteSpace(statusFilter) && !statusFilter.Equals("All Status", StringComparison.OrdinalIgnoreCase) && !statusFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (statusFilter.Equals("Active", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.Active);
            }
            else if (statusFilter.Equals("Review Due", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("ReviewDue", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.ReviewDue);
            }
            else if (statusFilter.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.Completed);
            }
            else if (statusFilter.Equals("Draft", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.Draft);
            }
        }

        // 3. Unit / Floor Filter
        if (!string.IsNullOrWhiteSpace(unitFilter) && !unitFilter.Equals("All Units / Floors", StringComparison.OrdinalIgnoreCase) && !unitFilter.Equals("All Units", StringComparison.OrdinalIgnoreCase) && !unitFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.CareUnit.ToLower() == unitFilter.ToLower());
        }

        // 4. Patient Filter
        if (!string.IsNullOrWhiteSpace(patientFilter) && !patientFilter.Equals("All Patients", StringComparison.OrdinalIgnoreCase) && !patientFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.PatientName.ToLower().Contains(patientFilter.ToLower()) || c.PatientIdCode.ToLower() == patientFilter.ToLower());
        }

        // 5. Condition Filter
        if (!string.IsNullOrWhiteSpace(conditionFilter) && !conditionFilter.Equals("All Conditions", StringComparison.OrdinalIgnoreCase) && !conditionFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.PrimaryCondition.ToLower() == conditionFilter.ToLower());
        }

        // 6. Search Query
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c =>
                c.PatientName.ToLower().Contains(s) ||
                c.PatientIdCode.ToLower().Contains(s) ||
                c.PlanTitle.ToLower().Contains(s) ||
                c.PrimaryCondition.ToLower().Contains(s) ||
                c.AttendingDoctorName.ToLower().Contains(s) ||
                c.AssignedNurseName.ToLower().Contains(s) ||
                c.CareUnit.ToLower().Contains(s) ||
                c.RoomNumber.ToLower().Contains(s));
        }

        return await query.OrderByDescending(c => c.CreatedDate).ToListAsync();
    }
}

public class VitalRoundRepository : Repository<VitalRoundRecord>, IVitalRoundRepository
{
    public VitalRoundRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<VitalRoundRecord>> GetVitalRoundsAsync(string? statusFilter, string? search)
    {
        var query = _context.VitalRounds.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(v => v.PatientName.Contains(search) || v.PatientIdCode.Contains(search) || v.RoomBed.Contains(search));
        }

        return await query.OrderByDescending(v => v.CreatedDate).ToListAsync();
    }
}


public class CustomReportRepository : Repository<CustomReportRecord>, ICustomReportRepository
{
    public CustomReportRepository(ConnectedCareDbContext context)
        : base(context)
    {
    }

    public async Task<List<CustomReportRecord>> GetReportsAsync(
        string? search,
        string? category)
    {
        var query = _context.CustomReportRecords.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim().ToLower();

            query = query.Where(r =>
                r.ReportName.ToLower().Contains(searchTerm) ||
                r.Description.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(category) &&
            !category.Equals("All Reports", StringComparison.OrdinalIgnoreCase) &&
            !category.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var categoryFilter = category.Trim().ToLower();

            query = query.Where(r =>
                r.Category.ToLower() == categoryFilter);
        }

        return await query
            .OrderByDescending(r => r.CreatedDate)
            .ToListAsync();
    }

    public async Task<CustomReportRecord?> GetReportAsync(Guid id)
    {
        return await _context.CustomReportRecords
            .FirstOrDefaultAsync(r => r.Id == id);
    }
}
