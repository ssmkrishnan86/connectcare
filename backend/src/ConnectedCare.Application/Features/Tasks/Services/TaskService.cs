using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Application.Features.Tasks.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;

    public TaskService(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TaskItem>> GetTasksAsync(
        string? patientId,
        string? patientName,
        string? search)
    {
        var tasks = await _repository.GetTasksAsync();

        IEnumerable<TaskItem> query = tasks;

        if (!string.IsNullOrWhiteSpace(patientId))
        {
            if (Guid.TryParse(patientId, out var patientGuid))
            {
                query = query.Where(t =>
                    t.PatientId == patientGuid ||
                    t.PatientIdCode == patientId);
            }
            else
            {
                query = query.Where(t =>
                    t.PatientIdCode == patientId);
            }
        }

        if (!string.IsNullOrWhiteSpace(patientName))
        {
            query = query.Where(t =>
                t.PatientName.Contains(
                    patientName,
                    StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t =>
                t.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                t.Description.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                t.PatientName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                t.AssignedCaregiver.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        return query
            .OrderByDescending(t => t.CreatedDate)
            .ToList();
    }

    public async Task<object> GetTaskStatsAsync()
    {
        var tasks = await _repository.GetTasksAsync();

        return new
        {
            totalTasks = tasks.Count,

            open = tasks.Count(t =>
                t.Status == TaskStatusItem.Pending ||
                t.StatusStr == "Open"),

            inProgress = tasks.Count(t =>
                t.Status == TaskStatusItem.InProgress ||
                t.StatusStr == "In Progress"),

            completed = tasks.Count(t =>
                t.Status == TaskStatusItem.Completed ||
                t.StatusStr == "Completed"),

            overdue = tasks.Count(t => t.IsOverdue)
        };
    }

    public async Task<TaskItem> CreateTaskAsync(TaskItem task)
    {
        if (string.IsNullOrWhiteSpace(task.TaskIdCode))
        {
            task.TaskIdCode =
                $"TSK-{Random.Shared.Next(1000, 9999)}";
        }

        if (string.IsNullOrWhiteSpace(task.StatusStr))
        {
            task.StatusStr = task.Status.ToString();
        }

        task.CreatedDate = DateTime.UtcNow;
        task.UpdatedDate = DateTime.UtcNow;

        return await _repository.AddAsync(task);
    }

    public async Task<TaskItem?> ToggleTaskStatusAsync(Guid id)
    {
        var task = await _repository.GetByIdAsync(id);

        if (task == null)
        {
            return null;
        }

        if (task.Status == TaskStatusItem.Completed ||
            task.StatusStr == "Completed")
        {
            task.Status = TaskStatusItem.Pending;
            task.StatusStr = "Pending";
        }
        else
        {
            task.Status = TaskStatusItem.Completed;
            task.StatusStr = "Completed";
        }

        task.UpdatedDate = DateTime.UtcNow;

        await _repository.UpdateAsync(task);

        return task;
    }

    public async Task<TaskItem?> GetTaskByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<TaskItem?> UpdateTaskAsync(
        Guid id,
        TaskItem updatedTask)
    {
        var task = await _repository.GetByIdAsync(id);

        if (task == null)
        {
            return null;
        }

        task.Title = updatedTask.Title;
        task.Description = updatedTask.Description;
        task.TaskType = updatedTask.TaskType;
        task.Priority = updatedTask.Priority;
        task.AssignedCaregiver = updatedTask.AssignedCaregiver;
        task.AssigneeRole = updatedTask.AssigneeRole;
        task.DueTime = updatedTask.DueTime;
        task.Status = updatedTask.Status;
        task.StatusStr =
            updatedTask.StatusStr ?? updatedTask.Status.ToString();
        task.PatientName = updatedTask.PatientName;
        task.PatientIdCode = updatedTask.PatientIdCode;
        task.UpdatedDate = DateTime.UtcNow;

        await _repository.UpdateAsync(task);

        return task;
    }

    public async Task<bool> DeleteTaskAsync(Guid id)
    {
        var task = await _repository.GetByIdAsync(id);

        if (task == null)
        {
            return false;
        }

        await _repository.DeleteAsync(id);

        return true;
    }
}
