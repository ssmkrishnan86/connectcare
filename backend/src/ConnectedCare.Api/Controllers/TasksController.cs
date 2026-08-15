using Microsoft.AspNetCore.Mvc;
using ConnectedCare.Application.Services;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks()
    {
        var tasks = await _taskService.GetTasksAsync();
        return Ok(ApiResponse<List<TaskItem>>.Ok(tasks));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetTaskStats()
    {
        var tasks = await _taskService.GetTasksAsync();
        var stats = new
        {
            totalTasks = tasks.Count,
            open = tasks.Count(t => t.Status == TaskStatusItem.Pending || t.StatusStr == "Open"),
            inProgress = tasks.Count(t => t.Status == TaskStatusItem.InProgress || t.StatusStr == "In Progress"),
            completed = tasks.Count(t => t.Status == TaskStatusItem.Completed || t.StatusStr == "Completed"),
            overdue = tasks.Count(t => t.IsOverdue)
        };
        return Ok(ApiResponse<object>.Ok(stats));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] TaskItem newTask)
    {
        var created = await _taskService.CreateTaskAsync(newTask);
        return Ok(ApiResponse<TaskItem>.Ok(created, "Task created successfully"));
    }
}
