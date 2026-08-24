using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

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
