using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.Tasks.Services;

public interface ITaskService
{
    Task<List<TaskItem>> GetTasksAsync(
        string? patientId,
        string? patientName,
        string? search);

    Task<object> GetTaskStatsAsync();

    Task<TaskItem> CreateTaskAsync(TaskItem task);

    Task<TaskItem?> ToggleTaskStatusAsync(Guid id);

    Task<TaskItem?> GetTaskByIdAsync(Guid id);

    Task<TaskItem?> UpdateTaskAsync(
        Guid id,
        TaskItem updatedTask);

    Task<bool> DeleteTaskAsync(Guid id);
}
