using ConnectedCare.Application.Features.Tasks.Services;
using ConnectedCare.Application.Features.Notifications.Services;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
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
        [FromBody] TaskRequestDto dto)
    {
        var newTask = dto.ToEntity();
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
        [FromBody] TaskRequestDto dto)
    {
        var updatedTask = dto.ToEntity();
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

public class TaskRequestDto
{
    public Guid? Id { get; set; }
    public string? TaskIdCode { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientIdCode { get; set; }
    public string? RoomNumber { get; set; }
    public string? CareUnit { get; set; }
    public string? TaskType { get; set; }
    public object? Priority { get; set; }
    public object? Status { get; set; }
    public string? StatusStr { get; set; }
    public string? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssignedCaregiver { get; set; }
    public string? AssigneeRole { get; set; }
    public string? AssigneeAvatar { get; set; }
    public string? DueDateText { get; set; }
    public string? DueTimeText { get; set; }
    public string? DueTime { get; set; }
    public bool? IsOverdue { get; set; }

    public TaskItem ToEntity()
    {
        Guid? pGuid = null;
        if (!string.IsNullOrWhiteSpace(PatientId) && Guid.TryParse(PatientId, out var g))
        {
            pGuid = g;
        }

        var priorityVal = TaskPriority.Medium;
        if (Priority != null)
        {
            var pStr = Priority.ToString() ?? "";
            if (Enum.TryParse<TaskPriority>(pStr, true, out var pParsed))
            {
                priorityVal = pParsed;
            }
            else if (int.TryParse(pStr, out var pInt) && Enum.IsDefined(typeof(TaskPriority), pInt))
            {
                priorityVal = (TaskPriority)pInt;
            }
            else if (pStr.Equals("Critical", StringComparison.OrdinalIgnoreCase) || pStr.Equals("Stat", StringComparison.OrdinalIgnoreCase))
            {
                priorityVal = TaskPriority.High;
            }
        }

        var statusVal = TaskStatusItem.Pending;
        var sStr = StatusStr ?? Status?.ToString() ?? "Open";
        if (sStr.Equals("Completed", StringComparison.OrdinalIgnoreCase) || sStr == "2")
        {
            statusVal = TaskStatusItem.Completed;
            sStr = "Completed";
        }
        else if (sStr.Equals("In Progress", StringComparison.OrdinalIgnoreCase) || sStr.Equals("InProgress", StringComparison.OrdinalIgnoreCase) || sStr == "1")
        {
            statusVal = TaskStatusItem.InProgress;
            sStr = "In Progress";
        }
        else
        {
            statusVal = TaskStatusItem.Pending;
            sStr = "Open";
        }

        var caregiver = !string.IsNullOrWhiteSpace(AssignedCaregiver)
            ? AssignedCaregiver
            : (!string.IsNullOrWhiteSpace(AssigneeName) ? AssigneeName : "Staff Nurse");

        var due = !string.IsNullOrWhiteSpace(DueTime)
            ? DueTime
            : (!string.IsNullOrWhiteSpace(DueDateText) ? DueDateText : (!string.IsNullOrWhiteSpace(DueTimeText) ? DueTimeText : "Today 05:00 PM"));

        return new TaskItem
        {
            Id = Id.HasValue && Id.Value != Guid.Empty ? Id.Value : Guid.NewGuid(),
            TaskIdCode = !string.IsNullOrWhiteSpace(TaskIdCode) ? TaskIdCode : $"TSK-{Random.Shared.Next(1000, 9999)}",
            Title = Title ?? "New Task",
            Description = Description ?? string.Empty,
            PatientId = pGuid,
            PatientName = PatientName ?? string.Empty,
            PatientIdCode = PatientIdCode ?? string.Empty,
            TaskType = !string.IsNullOrWhiteSpace(TaskType) ? TaskType : "Documentation",
            Priority = priorityVal,
            Status = statusVal,
            StatusStr = sStr,
            AssignedCaregiver = caregiver,
            AssigneeRole = !string.IsNullOrWhiteSpace(AssigneeRole) ? AssigneeRole : "Nursing",
            AssigneeAvatar = AssigneeAvatar ?? string.Empty,
            DueTime = due,
            IsOverdue = IsOverdue ?? false
        };
    }
}
