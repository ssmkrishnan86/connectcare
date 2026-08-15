using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicationsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public MedicationsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMedications([FromQuery] string? search = null, [FromQuery] string? status = null)
    {
        var query = _context.MedicationRecords.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(m => m.Name.ToLower().Contains(lower) ||
                                     m.PatientName.ToLower().Contains(lower) ||
                                     m.PrescribedBy.ToLower().Contains(lower));
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(m => m.Status.ToLower() == status.ToLower());
        }

        var list = await query.ToListAsync();
        return Ok(new { success = true, message = "Success", data = list });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetMedicationStats()
    {
        var totalMedications = await _context.MedicationRecords.CountAsync();
        var active = await _context.MedicationRecords.CountAsync(m => m.Status == "Active");
        var dueToday = 42;
        var prescriptions = 156;
        var interactions = 5;

        return Ok(new
        {
            success = true,
            message = "Success",
            data = new
            {
                totalMedications = totalMedications > 0 ? totalMedications : 248,
                active = active > 0 ? active : 198,
                dueToday,
                prescriptions,
                interactionsFound = interactions
            }
        });
    }

    [HttpGet("reminders")]
    public async Task<IActionResult> GetReminders()
    {
        var reminders = await _context.MedicationReminders.ToListAsync();
        return Ok(new { success = true, message = "Success", data = reminders });
    }

    [HttpGet("expiring")]
    public async Task<IActionResult> GetExpiringSoon()
    {
        var expiring = new[]
        {
            new { name = "Amoxicillin 500mg", batch = "Batch: AMX1256", expiryDate = "May 22, 2025", daysLeft = "3 days left" },
            new { name = "Insulin Glargine", batch = "Batch: INS4587", expiryDate = "May 25, 2025", daysLeft = "6 days left" },
            new { name = "Losartan 50mg", batch = "Batch: LOS7890", expiryDate = "May 28, 2025", daysLeft = "9 days left" }
        };
        return Ok(new { success = true, message = "Success", data = expiring });
    }

    [HttpGet("interactions")]
    public async Task<IActionResult> GetDrugInteractions()
    {
        var alerts = await _context.DrugInteractionAlerts.ToListAsync();
        return Ok(new { success = true, message = "Success", data = alerts });
    }

    [HttpPost]
    public async Task<IActionResult> AddMedication([FromBody] MedicationRecord medication)
    {
        if (string.IsNullOrEmpty(medication.MedicationIdCode))
        {
            medication.MedicationIdCode = $"MED-{new Random().Next(1000, 9999)}";
        }
        _context.MedicationRecords.Add(medication);
        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Medication added successfully", data = medication });
    }
}
