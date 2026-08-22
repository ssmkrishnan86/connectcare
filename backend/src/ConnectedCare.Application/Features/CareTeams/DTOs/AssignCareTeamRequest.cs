namespace ConnectedCare.Application.Features.CareTeams.DTOs;

public sealed class AssignCareTeamRequest
{
    public Guid PatientId { get; set; }

    public Guid ProviderId { get; set; }

    public string Role { get; set; } = string.Empty;
}
