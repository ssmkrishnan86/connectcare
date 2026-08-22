namespace ConnectedCare.Application.Features.Nurses.DTOs;

public record CreateNurseRequest(
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
    string? Avatar,
    string? NurseIdCode,
    string? Username,
    string? Password
);
