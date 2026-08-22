namespace ConnectedCare.Application.Features.Doctors.DTOs;

public record CreateDoctorRequest(
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
    string? Avatar,
    string? DoctorIdCode,
    string? Username,
    string? Password
);
