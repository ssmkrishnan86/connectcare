using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.Doctors.Services;

public class DoctorService : IDoctorService
{
    private readonly IDoctorRepository _repository;

    public DoctorService(IDoctorRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Doctor>> GetDoctorsAsync(
        string? search,
        string? specialty)
    {
        return await _repository.SearchDoctorsAsync(
            search,
            specialty);
    }
}
