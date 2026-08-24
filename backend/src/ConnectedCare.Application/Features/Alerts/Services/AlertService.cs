using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.Alerts.Services;

public class AlertService : IAlertService
{
    private readonly IAlertRepository _repository;

    public AlertService(IAlertRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Alert>> GetAlertsAsync()
    {
        return await _repository.GetAlertsAsync();
    }

    public async Task<bool> AcknowledgeAlertAsync(Guid id)
    {
        return await _repository.AcknowledgeAlertAsync(id);
    }
}
