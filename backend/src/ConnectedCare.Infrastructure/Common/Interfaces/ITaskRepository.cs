using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface ITaskRepository : IRepository<TaskItem>
{
    Task<List<TaskItem>> GetTasksAsync();
}
