using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

public class AlertRepository : Repository<Alert>, IAlertRepository
{
    public AlertRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<Alert>> GetAlertsAsync()
    {
        return await _context.Alerts
            .Include(a => a.Patient)
            .OrderByDescending(a => a.CreatedDate)
            .ToListAsync();
    }

    public async Task<bool> AcknowledgeAlertAsync(Guid id)
    {
        return await _context.AcknowledgeAlertAsync(id);
    }
}
