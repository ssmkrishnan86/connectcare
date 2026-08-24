using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

public class CareTeamRepository : Repository<CareTeamMember>, ICareTeamRepository
{
    public CareTeamRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<CareTeamMember>> GetCareTeamMembersAsync()
    {
        return await _context.CareTeamMembers
            .Include(c => c.Doctor)
            .Include(c => c.Nurse)
            .Include(c => c.Patient)
            .ToListAsync();
    }
}
