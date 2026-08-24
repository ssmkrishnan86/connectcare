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

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(v => v.PatientName.Contains(search) || v.PatientIdCode.Contains(search) || v.RoomBed.Contains(search));
        }

        return await query.OrderByDescending(v => v.CreatedDate).ToListAsync();
    }
}
