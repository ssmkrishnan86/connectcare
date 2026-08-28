using ConnectedCare.Application.Features.Tasks.Services;
using ConnectedCare.Application.Features.Notifications.Services;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly INotificationService _notificationService;

    public TasksController(ITaskService taskService, INotificationService notificationService)
    {
        _taskService = taskService;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks(
        [FromQuery] string? patientId,
        [FromQuery] string? patientName,
        [FromQuery] string? search)
    {
        var tasks = await _taskService.GetTasksAsync(
            patientId,
            patientName,
            search);

        return Ok(ApiResponse<List<TaskItem>>.Ok(tasks));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetTaskStats()
    {
        var stats = await _taskService.GetTaskStatsAsync();

        return Ok(ApiResponse<object>.Ok(stats));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask(
        [FromBody] TaskItem newTask)
    {
        var task = await _taskService.CreateTaskAsync(newTask);

        try
        {
            await _notificationService.DispatchNotificationAsync(
                title: $"New Task: {task.Title}",
                message: $"Task assigned to {task.AssignedCaregiver ?? "Care Team"}. Priority: {task.Priority}. Due: {task.DueTime}",
                type: "Task",
                severity: task.Priority.ToString() switch
                {
                    "High" or "Critical" or "Stat" => "High",
                    _ => "Medium"
                },
                actionUrl: "/tasks",
                userRole: string.IsNullOrWhiteSpace(task.AssigneeRole) ? "Nurse" : task.AssigneeRole,
                patientName: task.PatientName,
                patientIdCode: task.PatientIdCode,
                relatedEntityId: task.Id.ToString(),
                relatedEntityType: "TaskItem"
            );
        }
        catch { /* ignore */ }

        return Ok(
            ApiResponse<TaskItem>.Ok(
                task,
                "Task created successfully"));
    }

    [HttpPost("{id}/toggle")]
    [HttpPut("{id}/toggle")]
    [HttpPost("{id}/toggle-complete")]
    [HttpPut("{id}/toggle-complete")]
    public async Task<IActionResult> ToggleTaskStatus(Guid id)

    {
        var task = await _taskService.ToggleTaskStatusAsync(id);

        if (task == null)
        {
            return NotFound(
                ApiResponse<string>.Fail("Task not found"));
        }

        return Ok(
            ApiResponse<TaskItem>.Ok(
                task,
                "Task status updated"));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTaskById(Guid id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);

        if (task == null)
        {
            return NotFound(
                ApiResponse<string>.Fail("Task not found"));
        }

        return Ok(ApiResponse<TaskItem>.Ok(task));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(
        Guid id,
        [FromBody] TaskItem updatedTask)
    {
        var task = await _taskService.UpdateTaskAsync(
            id,
            updatedTask);

        if (task == null)
        {
            return NotFound(
                ApiResponse<string>.Fail("Task not found"));
        }

        return Ok(
            ApiResponse<TaskItem>.Ok(
                task,
                "Task updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var deleted = await _taskService.DeleteTaskAsync(id);

        if (!deleted)
        {
            return NotFound(
                ApiResponse<string>.Fail("Task not found"));
        }

        return Ok(
            ApiResponse<bool>.Ok(
                true,
                "Task deleted successfully"));
    }
}
