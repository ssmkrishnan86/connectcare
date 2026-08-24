using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

public class CarePlanRepository : Repository<CarePlanRecord>, ICarePlanRepository
{
    public CarePlanRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<CarePlanRecord>> GetCarePlansAsync(
        string? tabFilter,
        string? statusFilter,
        string? unitFilter,
        string? patientFilter,
        string? conditionFilter,
        string? search,
        string? doctorName)
    {
        var query = _context.CarePlans.AsQueryable();

        // 1. Tab Filter
        if (!string.IsNullOrWhiteSpace(tabFilter) && !tabFilter.Equals("All Care Plans", StringComparison.OrdinalIgnoreCase) && !tabFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (tabFilter.Equals("My Patients' Plans", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("My Patients Plans", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("My Plans", StringComparison.OrdinalIgnoreCase))
            {
                if (!string.IsNullOrWhiteSpace(doctorName))
                {
                    var docNorm = doctorName.Replace("Dr.", "").Trim().ToLower();
                    query = query.Where(c => c.AttendingDoctorName.ToLower().Contains(docNorm) || c.AttendingDoctorName.ToLower().Contains(doctorName.ToLower()) || c.AssignedNurseName.ToLower().Contains(doctorName.ToLower()));
                }
            }
            else if (tabFilter.Equals("Active Plans", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("Active", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.Active);
            }
            else if (tabFilter.Equals("Completed Plans", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.Completed);
            }
            else if (tabFilter.Equals("Review Due", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("ReviewDue", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.ReviewDue);
            }
        }

        // 2. Status Filter
        if (!string.IsNullOrWhiteSpace(statusFilter) && !statusFilter.Equals("All Status", StringComparison.OrdinalIgnoreCase) && !statusFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (statusFilter.Equals("Active", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.Active);
            }
            else if (statusFilter.Equals("Review Due", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("ReviewDue", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.ReviewDue);
            }
            else if (statusFilter.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.Completed);
            }
            else if (statusFilter.Equals("Draft", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == CarePlanStatus.Draft);
            }
        }

        // 3. Unit / Floor Filter
        if (!string.IsNullOrWhiteSpace(unitFilter) && !unitFilter.Equals("All Units / Floors", StringComparison.OrdinalIgnoreCase) && !unitFilter.Equals("All Units", StringComparison.OrdinalIgnoreCase) && !unitFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.CareUnit.ToLower() == unitFilter.ToLower());
        }

        // 4. Patient Filter
        if (!string.IsNullOrWhiteSpace(patientFilter) && !patientFilter.Equals("All Patients", StringComparison.OrdinalIgnoreCase) && !patientFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.PatientName.ToLower().Contains(patientFilter.ToLower()) || c.PatientIdCode.ToLower() == patientFilter.ToLower());
        }

        // 5. Condition Filter
        if (!string.IsNullOrWhiteSpace(conditionFilter) && !conditionFilter.Equals("All Conditions", StringComparison.OrdinalIgnoreCase) && !conditionFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.PrimaryCondition.ToLower() == conditionFilter.ToLower());
        }

        // 6. Search Query
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c =>
                c.PatientName.ToLower().Contains(s) ||
                c.PatientIdCode.ToLower().Contains(s) ||
                c.PlanTitle.ToLower().Contains(s) ||
                c.PrimaryCondition.ToLower().Contains(s) ||
                c.AttendingDoctorName.ToLower().Contains(s) ||
                c.AssignedNurseName.ToLower().Contains(s) ||
                c.CareUnit.ToLower().Contains(s) ||
                c.RoomNumber.ToLower().Contains(s));
        }

        return await query.OrderByDescending(c => c.CreatedDate).ToListAsync();
    }
}
