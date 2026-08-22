using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.Doctors.Services;

public interface IDoctorService
{
    Task<List<Doctor>> GetDoctorsAsync(
        string? search,
        string? specialty);
}
