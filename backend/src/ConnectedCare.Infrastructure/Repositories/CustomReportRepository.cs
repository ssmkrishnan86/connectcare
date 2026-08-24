using Microsoft.EntityFrameworkCore;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Infrastructure.Common.Interfaces;

namespace ConnectedCare.Infrastructure.Repositories;

public class CustomReportRepository : Repository<CustomReportRecord>, ICustomReportRepository
{
    public CustomReportRepository(ConnectedCareDbContext context)
        : base(context)
    {
    }

    public async Task<List<CustomReportRecord>> GetReportsAsync(
        string? search,
        string? category)
    {
        var query = _context.CustomReportRecords.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim().ToLower();

            query = query.Where(r =>
                r.ReportName.ToLower().Contains(searchTerm) ||
                r.Description.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(category) &&
            !category.Equals("All Reports", StringComparison.OrdinalIgnoreCase) &&
            !category.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var categoryFilter = category.Trim().ToLower();

            query = query.Where(r =>
                r.Category.ToLower() == categoryFilter);
        }

        return await query
            .OrderByDescending(r => r.CreatedDate)
            .ToListAsync();
    }

    public async Task<CustomReportRecord?> GetReportAsync(Guid id)
    {
        return await _context.CustomReportRecords
            .FirstOrDefaultAsync(r => r.Id == id);
    }
}
