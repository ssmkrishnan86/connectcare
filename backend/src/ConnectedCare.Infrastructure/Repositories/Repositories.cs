using Microsoft.EntityFrameworkCore;
using ConnectedCare.Application.Common.Interfaces;
using ConnectedCare.Application.Features.Dashboard.DTOs;
using ConnectedCare.Domain.Entities;
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

    public async Task<List<Patient>> SearchPatientsAsync(string? search, string? status, string? careUnit)
    {
        var query = _context.Patients
            .Include(p => p.PrimaryDoctor)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p =>
                p.Name.Contains(search) ||
                p.PatientIdCode.Contains(search) ||
                p.Mrn.Contains(search) ||
                p.Phone.Contains(search) ||
                p.Email.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(careUnit) && careUnit != "All")
        {
            query = query.Where(p => p.CareUnit.Equals(careUnit, StringComparison.OrdinalIgnoreCase));
        }

        return await query.ToListAsync();
    }

    public async Task<Patient?> GetByIdCodeOrGuidAsync(string id)
    {
        return await _context.Patients
            .Include(p => p.PrimaryDoctor)
            .Include(p => p.Alerts)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.PatientIdCode.ToLower() == id.ToLower() || p.Mrn.ToLower() == id.ToLower() || p.Id.ToString() == id);
    }

    public async Task<PatientStatsDto> GetPatientStatsAsync()
    {
        var allPatients = await _context.Patients.CountAsync();
        var inCare = await _context.Patients.CountAsync(p => p.Status == Domain.Enums.PatientStatus.InCare);
        var admitted = await _context.Patients.CountAsync(p => p.Status == Domain.Enums.PatientStatus.Admitted);
        var discharged = await _context.Patients.CountAsync(p => p.Status == Domain.Enums.PatientStatus.Discharged);
        var inactive = await _context.Patients.CountAsync(p => p.Status == Domain.Enums.PatientStatus.Inactive);

        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;
        var newThisMonth = await _context.Patients.CountAsync(p => p.CreatedDate.Month == currentMonth && p.CreatedDate.Year == currentYear);

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

    public async Task<int> GetTotalPatientsCountAsync() => await _context.Patients.CountAsync();
    public async Task<int> GetActiveAlertsCountAsync() => await _context.Alerts.CountAsync(a => !a.IsAcknowledged);
    public async Task<int> GetCriticalAlertsCountAsync() => await _context.Alerts.CountAsync(a => a.Severity == Domain.Enums.AlertSeverity.Critical && !a.IsAcknowledged);
    public async Task<int> GetActiveCareTeamsCountAsync() => await _context.CareTeamMembers.CountAsync();
    public async Task<int> GetOpenTasksCountAsync() => await _context.Tasks.CountAsync(t => t.Status != Domain.Enums.TaskStatusItem.Completed);
    public async Task<List<Alert>> GetRecentAlertsAsync() => await _context.Alerts.OrderByDescending(a => a.CreatedDate).Take(5).ToListAsync();
    public async Task<List<SystemIntegration>> GetSystemIntegrationsAsync() => await _context.SystemIntegrations.ToListAsync();
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

    public async Task<List<ConsultationRecord>> GetConsultationsAsync(string? statusFilter, string? typeFilter, string? search)
    {
        var query = _context.Consultations.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.PatientName.Contains(search) || c.PatientIdCode.Contains(search) || c.PhysicianName.Contains(search));
        }

        return await query.OrderByDescending(c => c.CreatedDate).ToListAsync();
    }
}

public class CarePlanRepository : Repository<CarePlanRecord>, ICarePlanRepository
{
    public CarePlanRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<CarePlanRecord>> GetCarePlansAsync(string? statusFilter, string? search)
    {
        var query = _context.CarePlans.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.PatientName.Contains(search) || c.PatientIdCode.Contains(search) || c.PlanTitle.Contains(search));
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
