using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/integrations")]
public class IntegrationsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public IntegrationsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetIntegrations([FromQuery] string? search, [FromQuery] string? category, [FromQuery] string? status)
    {
        var query = _context.IntegrationItemRecords.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(i => i.Name.ToLower().Contains(search.ToLower()) ||
                                     i.SystemApplication.ToLower().Contains(search.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "All Categories")
        {
            var catLower = category.ToLower();
            query = query.Where(i => i.Category.ToLower().Contains(catLower) || catLower.Contains(i.Category.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All Status" && status != "All Integrations")
        {
            query = query.Where(i => i.Status.ToLower() == status.ToLower());
        }

        var items = await query.OrderByDescending(i => i.CreatedDate).ToListAsync();
        return Ok(new { success = true, data = items });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetIntegrationById(Guid id)
    {
        var item = await _context.IntegrationItemRecords.FindAsync(id);
        if (item == null)
        {
            return NotFound(new { success = false, message = "Integration not found" });
        }

        return Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> CreateIntegration([FromBody] IntegrationItemRecord newIntegration)
    {
        if (string.IsNullOrWhiteSpace(newIntegration.LastSyncText))
        {
            newIntegration.LastSyncText = "Just now";
        }
        if (string.IsNullOrWhiteSpace(newIntegration.ConnectedOnText))
        {
            newIntegration.ConnectedOnText = DateTime.Now.ToString("MMM dd, yyyy");
        }
        newIntegration.CreatedDate = DateTime.UtcNow;
        newIntegration.UpdatedDate = DateTime.UtcNow;

        _context.IntegrationItemRecords.Add(newIntegration);

        _context.IntegrationActivityLogRecords.Add(new IntegrationActivityLogRecord
        {
            DateTimeText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt"),
            IntegrationName = newIntegration.Name,
            Event = "Integration Connected",
            Status = "Success",
            Details = $"Connected {newIntegration.SystemApplication} via {newIntegration.ConnectionType}",
            TriggeredBy = "John Admin"
        });

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Integration added successfully", data = newIntegration });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIntegration(Guid id, [FromBody] IntegrationItemRecord updatedIntegration)
    {
        var item = await _context.IntegrationItemRecords.FindAsync(id);
        if (item == null)
        {
            return NotFound(new { success = false, message = "Integration not found" });
        }

        item.Name = updatedIntegration.Name;
        item.SystemApplication = updatedIntegration.SystemApplication;
        item.Category = updatedIntegration.Category;
        item.ConnectionType = updatedIntegration.ConnectionType;
        item.Description = updatedIntegration.Description;
        item.Status = updatedIntegration.Status;
        if (!string.IsNullOrWhiteSpace(updatedIntegration.EndpointUrl))
            item.EndpointUrl = updatedIntegration.EndpointUrl;
        if (!string.IsNullOrWhiteSpace(updatedIntegration.AuthType))
            item.AuthType = updatedIntegration.AuthType;
        if (!string.IsNullOrWhiteSpace(updatedIntegration.SyncInterval))
            item.SyncInterval = updatedIntegration.SyncInterval;
        if (!string.IsNullOrWhiteSpace(updatedIntegration.Environment))
            item.Environment = updatedIntegration.Environment;
        if (!string.IsNullOrWhiteSpace(updatedIntegration.SettingsJson))
            item.SettingsJson = updatedIntegration.SettingsJson;
        
        item.UpdatedDate = DateTime.UtcNow;

        _context.IntegrationActivityLogRecords.Add(new IntegrationActivityLogRecord
        {
            DateTimeText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt"),
            IntegrationName = item.Name,
            Event = "Integration Updated",
            Status = "Success",
            Details = $"Updated integration specifications for {item.Name}",
            TriggeredBy = "John Admin"
        });

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Integration updated successfully", data = item });
    }

    [HttpPut("{id}/settings")]
    public async Task<IActionResult> UpdateIntegrationSettings(Guid id, [FromBody] IntegrationItemRecord settingsUpdate)
    {
        var item = await _context.IntegrationItemRecords.FindAsync(id);
        if (item == null)
        {
            return NotFound(new { success = false, message = "Integration not found" });
        }

        item.EndpointUrl = settingsUpdate.EndpointUrl ?? item.EndpointUrl;
        item.AuthType = settingsUpdate.AuthType ?? item.AuthType;
        item.SyncInterval = settingsUpdate.SyncInterval ?? item.SyncInterval;
        item.Environment = settingsUpdate.Environment ?? item.Environment;
        item.SettingsJson = settingsUpdate.SettingsJson ?? item.SettingsJson;
        item.UpdatedDate = DateTime.UtcNow;

        _context.IntegrationActivityLogRecords.Add(new IntegrationActivityLogRecord
        {
            DateTimeText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt"),
            IntegrationName = item.Name,
            Event = "Settings Updated",
            Status = "Success",
            Details = $"Updated technical connection parameters for {item.Name}",
            TriggeredBy = "John Admin"
        });

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Settings updated successfully", data = item });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIntegration(Guid id)
    {
        var item = await _context.IntegrationItemRecords.FindAsync(id);
        if (item == null)
        {
            return NotFound(new { success = false, message = "Integration not found" });
        }

        var name = item.Name;
        _context.IntegrationItemRecords.Remove(item);

        _context.IntegrationActivityLogRecords.Add(new IntegrationActivityLogRecord
        {
            DateTimeText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt"),
            IntegrationName = name,
            Event = "Integration Removed",
            Status = "Success",
            Details = $"Removed integration {name} from system",
            TriggeredBy = "John Admin"
        });

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Integration deleted successfully" });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var total = await _context.IntegrationItemRecords.CountAsync();
        var active = await _context.IntegrationItemRecords.CountAsync(i => i.Status == "Active");
        var inactive = await _context.IntegrationItemRecords.CountAsync(i => i.Status == "Inactive");
        var failed = await _context.IntegrationItemRecords.CountAsync(i => i.Status == "Failed");

        // Calculate dynamic sync success rate from activity logs or active integrations
        var totalLogs = await _context.IntegrationActivityLogRecords.CountAsync();
        var successLogs = await _context.IntegrationActivityLogRecords.CountAsync(l => l.Status == "Success");

        string syncRate = "100.0%";
        if (totalLogs > 0)
        {
            double rate = ((double)successLogs / totalLogs) * 100.0;
            syncRate = $"{rate:F1}%";
        }
        else if (total > 0)
        {
            double rate = ((double)(active + inactive) / total) * 100.0;
            syncRate = $"{rate:F1}%";
        }

        var stats = new
        {
            totalIntegrations = total,
            activeIntegrations = active,
            inactiveIntegrations = inactive,
            failedIntegrations = failed,
            dataSyncTodayRate = syncRate
        };

        return Ok(new { success = true, data = stats });
    }

    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] int? limit)
    {
        var query = _context.IntegrationActivityLogRecords
            .OrderByDescending(l => l.CreatedDate)
            .AsQueryable();

        if (limit.HasValue && limit.Value > 0)
        {
            query = query.Take(limit.Value);
        }

        var logs = await query.ToListAsync();
        return Ok(new { success = true, data = logs });
    }

    [HttpPost("{id}/sync")]
    public async Task<IActionResult> TriggerSync(Guid id)
    {
        var item = await _context.IntegrationItemRecords.FindAsync(id);
        if (item == null)
        {
            return NotFound(new { success = false, message = "Integration not found" });
        }

        item.LastSyncText = "Just now";
        item.UpdatedDate = DateTime.UtcNow;

        _context.IntegrationActivityLogRecords.Add(new IntegrationActivityLogRecord
        {
            DateTimeText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt"),
            IntegrationName = item.Name,
            Event = "Manual Sync Executed",
            Status = "Success",
            Details = $"{item.DataLastSyncCount} records synced",
            TriggeredBy = "John Admin"
        });

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Sync triggered successfully" });
    }
}
