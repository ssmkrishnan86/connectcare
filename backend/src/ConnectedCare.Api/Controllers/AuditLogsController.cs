using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public AuditLogsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] string? search,
        [FromQuery] string? user,
        [FromQuery] string? module,
        [FromQuery] string? action,
        [FromQuery] string? status)
    {
        var query = _context.AuditLogEntryRecords.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a => a.RecordDescription.ToLower().Contains(search.ToLower()) ||
                                     a.UserName.ToLower().Contains(search.ToLower()) ||
                                     a.IpAddress.ToLower().Contains(search.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(user) && user != "All Users")
        {
            query = query.Where(a => a.UserName.ToLower() == user.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(module) && module != "All Modules")
        {
            query = query.Where(a => a.Module.ToLower() == module.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(action) && action != "All Actions")
        {
            query = query.Where(a => a.Action.ToLower() == action.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All Status")
        {
            query = query.Where(a => a.Status.ToLower() == status.ToLower());
        }

        var entries = await query.OrderByDescending(a => a.CreatedDate).ToListAsync();
        return Ok(new { success = true, data = entries });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalEvents = await _context.AuditLogEntryRecords.CountAsync();
        var userLogins = await _context.AuditLogEntryRecords.CountAsync(a => a.Action == "LOGIN" || a.Action == "LOGIN_FAIL");
        var dataChanges = await _context.AuditLogEntryRecords.CountAsync(a => a.Action == "CREATE" || a.Action == "UPDATE" || a.Action == "DELETE");
        var securityEvents = await _context.AuditLogEntryRecords.CountAsync(a => a.Module == "Authentication" || a.Action == "LOGIN_FAIL" || a.Module == "System");
        var failedAttempts = await _context.AuditLogEntryRecords.CountAsync(a => a.Status == "Failed" || a.Action == "LOGIN_FAIL");

        var stats = new
        {
            totalEvents,
            totalEventsChange = totalEvents > 0 ? "↑ Active audit pipeline" : "No events recorded",
            userLogins,
            userLoginsChange = userLogins > 0 ? $"{userLogins} sessions recorded" : "0 sessions",
            dataChanges,
            dataChangesChange = dataChanges > 0 ? $"{dataChanges} audit mutations" : "0 mutations",
            securityEvents,
            securityEventsChange = securityEvents > 0 ? $"{securityEvents} security events" : "0 events",
            failedAttempts,
            failedAttemptsChange = failedAttempts > 0 ? $"↑ {failedAttempts} security alerts" : "0 security alerts"
        };

        return Ok(new { success = true, data = stats });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAuditLogById(Guid id)
    {
        var entry = await _context.AuditLogEntryRecords.FindAsync(id);
        if (entry == null)
        {
            return NotFound(new { success = false, message = "Audit log entry not found" });
        }

        return Ok(new { success = true, data = entry });
    }

    [HttpPost]
    public async Task<IActionResult> CreateAuditLog([FromBody] ConnectedCare.Domain.Entities.AuditLogEntryRecord entry)
    {
        if (entry.Id == Guid.Empty)
        {
            entry.Id = Guid.NewGuid();
        }
        if (string.IsNullOrWhiteSpace(entry.DateTimeText))
        {
            entry.DateTimeText = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
        }
        entry.CreatedDate = DateTime.UtcNow;

        _context.AuditLogEntryRecords.Add(entry);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = entry, message = "Audit log created successfully" });
    }

    [HttpPost("batch")]
    public async Task<IActionResult> BatchCreateAuditLogs([FromBody] List<ConnectedCare.Domain.Entities.AuditLogEntryRecord> entries)
    {
        foreach (var entry in entries)
        {
            if (entry.Id == Guid.Empty) entry.Id = Guid.NewGuid();
            if (string.IsNullOrWhiteSpace(entry.DateTimeText)) entry.DateTimeText = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            entry.CreatedDate = DateTime.UtcNow;
            _context.AuditLogEntryRecords.Add(entry);
        }
        await _context.SaveChangesAsync();

        return Ok(new { success = true, count = entries.Count, message = $"Imported {entries.Count} audit logs" });
    }
}
