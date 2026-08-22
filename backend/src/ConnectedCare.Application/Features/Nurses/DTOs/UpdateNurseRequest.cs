namespace ConnectedCare.Application.Features.Nurses.DTOs;

public record UpdateNurseRequest(
    string? Name,
    string? Department,
    string? SubUnit,
    string? Location,
    string? Shift,
    string? AssignedUnit,
    string? Phone,
    string? Email,
    string? Experience,
    string? Status,
    string? Avatar
);
