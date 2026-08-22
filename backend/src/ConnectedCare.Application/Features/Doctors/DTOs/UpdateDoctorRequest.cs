namespace ConnectedCare.Application.Features.Doctors.DTOs;

public record UpdateDoctorRequest(
    string? Name,
    string? Specialty,
    string? SpecialtyIcon,
    string? Department,
    string? Location,
    string? Phone,
    string? Email,
    string? Experience,
    string? Status,
    bool? TeleconsultationEnabled,
    string? Avatar
);
