using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface IAlertRepository : IRepository<Alert>
{
    Task<List<Alert>> GetAlertsAsync();
    Task<bool> AcknowledgeAlertAsync(Guid id);
}
