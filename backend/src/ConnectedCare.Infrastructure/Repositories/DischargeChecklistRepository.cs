using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

public class DischargeChecklistRepository : Repository<DischargeChecklistRecord>, IDischargeChecklistRepository
{
    public DischargeChecklistRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<DischargeChecklistRecord>> GetChecklistsAsync(string? statusFilter, string? unitFilter, string? search)
    {
        var query = _context.DischargeChecklists.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.PatientName.Contains(search) || c.PatientIdCode.Contains(search) || c.RoomNumber.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(unitFilter) && unitFilter != "All")
        {
            query = query.Where(c => c.CareUnit.Equals(unitFilter, StringComparison.OrdinalIgnoreCase));
        }

        return await query.OrderByDescending(c => c.CreatedDate).ToListAsync();
    }
}
