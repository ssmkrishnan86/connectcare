using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

public class VitalRoundRepository : Repository<VitalRoundRecord>, IVitalRoundRepository
{
    public VitalRoundRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<VitalRoundRecord>> GetVitalRoundsAsync(string? statusFilter, string? search)
    {
        var query = _context.VitalRounds.AsQueryable();

        if (!string.IsNullOrWhiteSpace(statusFilter) && !statusFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<ConnectedCare.Domain.Enums.VitalRoundStatus>(statusFilter, true, out var parsedStatus))
            {
                query = query.Where(v => v.Status == parsedStatus);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(v => v.PatientName.ToLower().Contains(s) || v.PatientIdCode.ToLower().Contains(s) || v.RoomBed.ToLower().Contains(s));
        }

        return await query.OrderByDescending(v => v.CreatedDate).ToListAsync();
    }
}
