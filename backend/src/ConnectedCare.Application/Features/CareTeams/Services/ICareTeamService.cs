using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.CareTeams.Services;

public interface ICareTeamService
{
    Task<List<CareTeamMember>> GetCareTeamMembersAsync();
}
