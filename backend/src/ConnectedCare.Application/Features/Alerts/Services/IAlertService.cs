using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.Alerts.Services;

public interface IAlertService
{
    Task<List<Alert>> GetAlertsAsync();
    Task<bool> AcknowledgeAlertAsync(Guid id);
}
