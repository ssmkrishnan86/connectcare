namespace ConnectedCare.Application.Features.Assignments.DTOs;

public record AssignDoctorRequest(
    Guid DoctorId,
    bool IsPrimary = true,
    string? Notes = null
);
