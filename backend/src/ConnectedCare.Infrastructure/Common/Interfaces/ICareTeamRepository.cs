using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface ICareTeamRepository : IRepository<CareTeamMember>
{
    Task<List<CareTeamMember>> GetCareTeamMembersAsync();
}
