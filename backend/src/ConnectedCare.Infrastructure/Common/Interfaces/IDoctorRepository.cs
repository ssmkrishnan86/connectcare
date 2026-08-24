using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Infrastructure.Common.Interfaces;

public interface IDoctorRepository : IRepository<Doctor>
{
    Task<List<Doctor>> SearchDoctorsAsync(string? search, string? specialty);
}
