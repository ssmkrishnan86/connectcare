using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Common.Interfaces;

public interface IRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(Guid id);
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(Guid id);
}

public interface IPatientRepository : IRepository<Patient>
{
    Task<List<Patient>> SearchPatientsAsync(string? search, string? status, string? careUnit);
    Task<Patient?> GetByIdCodeOrGuidAsync(string id);
}

public interface IDoctorRepository : IRepository<Doctor>
{
    Task<List<Doctor>> SearchDoctorsAsync(string? search, string? specialty);
}

public interface ICareTeamRepository : IRepository<CareTeamMember>
{
    Task<List<CareTeamMember>> GetCareTeamMembersAsync();
}

public interface IAlertRepository : IRepository<Alert>
{
    Task<List<Alert>> GetAlertsAsync();
    Task<bool> AcknowledgeAlertAsync(Guid id);
}

public interface ITaskRepository : IRepository<TaskItem>
{
    Task<List<TaskItem>> GetTasksAsync();
}

public interface IDashboardRepository
{
    Task<int> GetTotalPatientsCountAsync();
    Task<int> GetActiveAlertsCountAsync();
    Task<int> GetCriticalAlertsCountAsync();
    Task<int> GetActiveCareTeamsCountAsync();
    Task<int> GetOpenTasksCountAsync();
    Task<List<Alert>> GetRecentAlertsAsync();
    Task<List<SystemIntegration>> GetSystemIntegrationsAsync();
}
