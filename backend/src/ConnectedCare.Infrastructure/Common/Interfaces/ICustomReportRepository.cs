using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface ICustomReportRepository : IRepository<CustomReportRecord>
{
    Task<List<CustomReportRecord>> GetReportsAsync(
        string? search,
        string? category);

    Task<CustomReportRecord?> GetReportAsync(Guid id);
}
