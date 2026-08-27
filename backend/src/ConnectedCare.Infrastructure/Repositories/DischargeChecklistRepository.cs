using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

public class DischargeChecklistRepository : Repository<DischargeChecklistRecord>, IDischargeChecklistRepository
{
    public DischargeChecklistRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<DischargeChecklistRecord>> GetChecklistsAsync(string? statusFilter, string? unitFilter, string? search)
    {
        var query = _context.DischargeChecklists.AsQueryable();

        // 1. Search Filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c =>
                c.PatientName.ToLower().Contains(s) ||
                c.PatientIdCode.ToLower().Contains(s) ||
                c.RoomNumber.ToLower().Contains(s) ||
                c.CareUnit.ToLower().Contains(s) ||
                c.AttendingDoctorName.ToLower().Contains(s));
        }

        // 2. Unit Filter
        if (!string.IsNullOrWhiteSpace(unitFilter) &&
            !unitFilter.Equals("All Units / Floors", StringComparison.OrdinalIgnoreCase) &&
            !unitFilter.Equals("All Units", StringComparison.OrdinalIgnoreCase) &&
            !unitFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var u = unitFilter.Trim().ToLower();
            query = query.Where(c => c.CareUnit.ToLower() == u || c.CareUnit.ToLower().Contains(u));
        }

        // 3. Status / Tab Filter
        if (!string.IsNullOrWhiteSpace(statusFilter) &&
            !statusFilter.Equals("All Patients", StringComparison.OrdinalIgnoreCase) &&
            !statusFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<DischargeStatus>(statusFilter.Replace(" ", ""), true, out var parsedStatus))
            {
                query = query.Where(c => c.ChecklistStatus == parsedStatus);
            }
            else if (statusFilter.Equals("In Progress", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("InProgress", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.ChecklistStatus == DischargeStatus.InProgress);
            }
            else if (statusFilter.Equals("Ready for Discharge", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("Ready", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.ChecklistStatus == DischargeStatus.Ready);
            }
            else if (statusFilter.Equals("Discharged", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("Discharged Today", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.ChecklistStatus == DischargeStatus.Discharged);
            }
            else if (statusFilter.Equals("Pending Items", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("PendingItems", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("Pending", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.ChecklistStatus == DischargeStatus.PendingItems);
            }
            else if (statusFilter.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.ChecklistStatus == DischargeStatus.Cancelled);
            }
        }

        return await query.OrderByDescending(c => c.CreatedDate).ToListAsync();
    }
}
