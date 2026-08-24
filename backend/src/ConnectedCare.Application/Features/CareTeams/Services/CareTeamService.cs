using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.CareTeams.Services;

public class CareTeamService : ICareTeamService
{
    private readonly ICareTeamRepository _repository;

    public CareTeamService(ICareTeamRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CareTeamMember>> GetCareTeamMembersAsync()
    {
        return await _repository.GetCareTeamMembersAsync();
    }
}
