using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
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
    private readonly ConnectedCareDbContext _context;

    public TasksController(ITaskService taskService, ConnectedCareDbContext context)
    {
        _taskService = taskService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] string? patientId, [FromQuery] string? patientName, [FromQuery] string? search)
    {
        var query = _context.Tasks.AsQueryable();

        if (!string.IsNullOrWhiteSpace(patientId))
        {
            if (Guid.TryParse(patientId, out var gId))
            {
                query = query.Where(t => t.PatientId == gId || t.PatientIdCode == patientId);
            }
            else
            {
                query = query.Where(t => t.PatientIdCode == patientId);
            }
        }

        if (!string.IsNullOrWhiteSpace(patientName))
        {
            var pNameLower = patientName.ToLower();
            query = query.Where(t => t.PatientName.ToLower().Contains(pNameLower));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var sLower = search.ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(sLower) ||
                                     t.Description.ToLower().Contains(sLower) ||
                                     t.PatientName.ToLower().Contains(sLower) ||
                                     t.AssignedCaregiver.ToLower().Contains(sLower));
        }

        var list = await query.OrderByDescending(t => t.CreatedDate).ToListAsync();
        return Ok(ApiResponse<List<TaskItem>>.Ok(list));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetTaskStats()
    {
        var tasks = await _context.Tasks.ToListAsync();
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
        if (string.IsNullOrWhiteSpace(newTask.TaskIdCode))
        {
            newTask.TaskIdCode = $"TSK-{Random.Shared.Next(1000, 9999)}";
        }
        if (string.IsNullOrWhiteSpace(newTask.StatusStr))
        {
            newTask.StatusStr = newTask.Status.ToString();
        }
        newTask.CreatedDate = DateTime.UtcNow;
        newTask.UpdatedDate = DateTime.UtcNow;

        _context.Tasks.Add(newTask);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<TaskItem>.Ok(newTask, "Task created successfully"));
    }

    [HttpPost("{id}/toggle")]
    public async Task<IActionResult> ToggleTaskStatus(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound(ApiResponse<string>.Fail("Task not found"));
        }

        if (task.Status == TaskStatusItem.Completed || task.StatusStr == "Completed")
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
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<TaskItem>.Ok(task, "Task status updated"));
    }
}
