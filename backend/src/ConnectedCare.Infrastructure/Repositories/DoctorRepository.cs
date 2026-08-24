using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

public class DoctorRepository : Repository<Doctor>, IDoctorRepository
{
    public DoctorRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<Doctor>> SearchDoctorsAsync(string? search, string? specialty)
    {
        var query = _context.Doctors.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(d =>
                d.Name.Contains(search) ||
                d.DoctorIdCode.Contains(search) ||
                d.Email.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(specialty) && specialty != "All")
        {
            query = query.Where(d => d.Specialty.ToLower() == specialty.ToLower());
        }

        return await query.ToListAsync();
    }
}
