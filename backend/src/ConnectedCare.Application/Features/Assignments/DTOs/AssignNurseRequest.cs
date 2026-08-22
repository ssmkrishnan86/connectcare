namespace ConnectedCare.Application.Features.Assignments.DTOs;

public record AssignNurseRequest(
    Guid NurseId,
    bool IsPrimary = false,
    string? Shift = "Day Shift",
    string? Notes = null
);
