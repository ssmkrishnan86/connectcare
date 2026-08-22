namespace ConnectedCare.Application.Features.Authentication.DTOs;

public record LoginRequest(
    string Username,
    string Password,
    string? Role = null
);
