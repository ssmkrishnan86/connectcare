using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Infrastructure.Repositories;

public class ConsultationRepository : Repository<ConsultationRecord>, IConsultationRepository
{
    public ConsultationRepository(ConnectedCareDbContext context) : base(context) { }

    public async Task<List<ConsultationRecord>> GetConsultationsAsync(
        string? tabFilter,
        string? statusFilter,
        string? typeFilter,
        string? patientFilter,
        string? unitFilter,
        string? search,
        string? doctorName)
    {
        var query = _context.Consultations.AsQueryable();

        // 1. Tab Filter
        if (!string.IsNullOrWhiteSpace(tabFilter) && !tabFilter.Equals("All Consultations", StringComparison.OrdinalIgnoreCase))
        {
            if (tabFilter.Equals("My Consultations", StringComparison.OrdinalIgnoreCase))
            {
                if (!string.IsNullOrWhiteSpace(doctorName))
                {
                    var docNorm = doctorName.Replace("Dr.", "").Trim().ToLower();
                    query = query.Where(c => c.PhysicianName.ToLower().Contains(docNorm) || c.PhysicianName.ToLower().Contains(doctorName.ToLower()));
                }
            }
            else if (tabFilter.Equals("Today's Schedule", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("Today", StringComparison.OrdinalIgnoreCase))
            {
                var todayStr = DateTime.Now.ToString("MMM dd");
                var todayLongStr = DateTime.Now.ToString("MMMM dd");
                query = query.Where(c => c.DateTimeText.Contains(todayStr) || c.DateTimeText.Contains(todayLongStr) || c.Status == ConsultationStatus.Scheduled || c.Status == ConsultationStatus.InProgress);
            }
            else if (tabFilter.Equals("Follow-ups", StringComparison.OrdinalIgnoreCase) || tabFilter.Equals("Follow-up Due", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.FollowUpDue || (!string.IsNullOrEmpty(c.FollowUpDateText) && c.FollowUpDateText != "-"));
            }
            else if (tabFilter.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.Completed);
            }
        }

        // 2. Status Filter
        if (!string.IsNullOrWhiteSpace(statusFilter) && !statusFilter.Equals("All Status", StringComparison.OrdinalIgnoreCase) && !statusFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (statusFilter.Equals("In Progress", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("InProgress", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.InProgress);
            }
            else if (statusFilter.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.Completed);
            }
            else if (statusFilter.Equals("Scheduled", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.Scheduled);
            }
            else if (statusFilter.Equals("Follow-up Due", StringComparison.OrdinalIgnoreCase) || statusFilter.Equals("FollowUpDue", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Status == ConsultationStatus.FollowUpDue);
            }
        }

        // 3. Consultation Type Filter
        if (!string.IsNullOrWhiteSpace(typeFilter) && !typeFilter.Equals("All Consultation Types", StringComparison.OrdinalIgnoreCase) && !typeFilter.Equals("All Types", StringComparison.OrdinalIgnoreCase) && !typeFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.ConsultationType.ToLower() == typeFilter.ToLower());
        }

        // 4. Patient Filter
        if (!string.IsNullOrWhiteSpace(patientFilter) && !patientFilter.Equals("All Patients", StringComparison.OrdinalIgnoreCase) && !patientFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.PatientName.ToLower().Contains(patientFilter.ToLower()) || c.PatientIdCode.ToLower() == patientFilter.ToLower());
        }

        // 5. Unit / Floor Filter
        if (!string.IsNullOrWhiteSpace(unitFilter) && !unitFilter.Equals("All Units / Floors", StringComparison.OrdinalIgnoreCase) && !unitFilter.Equals("All Units", StringComparison.OrdinalIgnoreCase) && !unitFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.CareUnit.ToLower() == unitFilter.ToLower());
        }

        // 6. Search Query
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c =>
                c.PatientName.ToLower().Contains(s) ||
                c.PatientIdCode.ToLower().Contains(s) ||
                c.PhysicianName.ToLower().Contains(s) ||
                c.Reason.ToLower().Contains(s) ||
                c.Location.ToLower().Contains(s) ||
                c.ClinicalNotes.ToLower().Contains(s) ||
                c.CareUnit.ToLower().Contains(s) ||
                c.RoomNumber.ToLower().Contains(s));
        }

        return await query.OrderByDescending(c => c.CreatedDate).ToListAsync();
    }
}
