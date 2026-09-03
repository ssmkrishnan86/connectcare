namespace ConnectedCare.Application.Features.Handovers.DTOs;

public class SaveNotesRequest
{
    public string Notes { get; set; } = string.Empty;
}

public class SaveHandoverDraftRequest
{
    public string? Notes { get; set; }
    public string? OutgoingNurseName { get; set; }
    public string? OutgoingNurseRole { get; set; }
    public string? OutgoingNurseAvatar { get; set; }
    public string? IncomingNurseName { get; set; }
    public string? IncomingNurseRole { get; set; }
    public string? IncomingNurseAvatar { get; set; }
    public string? CurrentShift { get; set; }
    public string? HandoverToShift { get; set; }
}

public class CompleteHandoverRequest
{
    public string? Notes { get; set; }
    public string? OutgoingNurseName { get; set; }
    public string? OutgoingNurseRole { get; set; }
    public string? OutgoingNurseAvatar { get; set; }
    public string? IncomingNurseName { get; set; }
    public string? IncomingNurseRole { get; set; }
    public string? IncomingNurseAvatar { get; set; }
    public string? CurrentShift { get; set; }
    public string? HandoverToShift { get; set; }
    public List<Guid>? CompletedTaskIds { get; set; }
}

