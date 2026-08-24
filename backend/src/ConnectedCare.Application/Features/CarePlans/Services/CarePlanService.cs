using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Application.Features.CarePlans.DTOs;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.CarePlans.Services;
public class CarePlanNoteItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Text { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
}

public class CarePlanService : ICarePlanService
{
    private readonly ICarePlanRepository _repository;

    public CarePlanService(ICarePlanRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CarePlanDto>> GetCarePlansAsync(
        string? tabFilter,
        string? statusFilter,
        string? unitFilter,
        string? patientFilter,
        string? conditionFilter,
        string? search,
        string? doctorName)
    {
        var list = await _repository.GetCarePlansAsync(tabFilter, statusFilter, unitFilter, patientFilter, conditionFilter, search, doctorName);
        return list.Select(MapToDto).ToList();
    }

    public async Task<CarePlanSummaryDto> GetSummaryAsync()
    {
        var all = await _repository.GetAllAsync();
        var list = all.ToList();
        return new CarePlanSummaryDto
        {
            TotalCarePlans = list.Count,
            ActivePlans = list.Count(c => c.Status == Domain.Enums.CarePlanStatus.Active),
            ReviewDue = list.Count(c => c.Status == Domain.Enums.CarePlanStatus.ReviewDue),
            Completed = list.Count(c => c.Status == Domain.Enums.CarePlanStatus.Completed),
            DraftPlans = list.Count(c => c.Status == Domain.Enums.CarePlanStatus.Draft)
        };
    }

    public async Task<CarePlanDto?> GetByIdAsync(Guid id)
    {
        var record = await _repository.GetByIdAsync(id);
        return record != null ? MapToDto(record) : null;
    }

    public async Task<CarePlanDto> CreateCarePlanAsync(CreateCarePlanDto dto)
    {
        var initialNotes = new List<CarePlanNoteItem>
        {
            new CarePlanNoteItem
            {
                Id = Guid.NewGuid().ToString("N"),
                Text = $"Initial care plan created for {dto.PrimaryCondition}.",
                Date = DateTime.Now.ToString("MMM dd, yyyy â€¢ hh:mm tt"),
                Author = string.IsNullOrWhiteSpace(dto.AssignedNurseName) ? "Attending Physician" : dto.AssignedNurseName
            }
        };

        var record = new CarePlanRecord
        {
            PatientName = dto.PatientName,
            PatientIdCode = string.IsNullOrWhiteSpace(dto.PatientIdCode) ? $"PT-{Random.Shared.Next(10000, 99999)}" : dto.PatientIdCode,
            PatientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
            RoomNumber = string.IsNullOrWhiteSpace(dto.RoomNumber) ? "Room 302" : dto.RoomNumber,
            CareUnit = string.IsNullOrWhiteSpace(dto.CareUnit) ? "Cardiology Unit" : dto.CareUnit,
            AgeGender = "65 Y â€¢ General",
            BloodGroup = "A+",
            AttendingDoctorName = string.IsNullOrWhiteSpace(dto.AttendingDoctorName) ? "Dr. Sarah Wilson" : dto.AttendingDoctorName,
            CareTeamMembersCount = 3,
            LengthOfStayText = "3 Days",
            PrimaryCondition = dto.PrimaryCondition,
            ConditionIcon = dto.PrimaryCondition == "Heart Failure" ? "HeartPulse" : "Activity",
            PlanTitle = dto.PlanTitle,
            GoalCount = dto.GoalCount > 0 ? dto.GoalCount : 5,
            StartDateText = string.IsNullOrWhiteSpace(dto.StartDateText) ? DateTime.Now.ToString("MMM dd, yyyy") : dto.StartDateText,
            ReviewDateText = string.IsNullOrWhiteSpace(dto.ReviewDateText) ? DateTime.Now.AddDays(7).ToString("MMM dd, yyyy") : dto.ReviewDateText,
            ReviewDueBadge = "7 days left",
            AssignedNurseName = string.IsNullOrWhiteSpace(dto.AssignedNurseName) ? "Emma Johnson" : dto.AssignedNurseName,
            Status = Domain.Enums.CarePlanStatus.Active,
            OverallProgressPercentage = 75,
            CompletedTasksCount = 12,
            InProgressTasksCount = 6,
            NotStartedTasksCount = 3,
            OverdueTasksCount = 1,
            LastUpdatedText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt"),
            NotesJson = System.Text.Json.JsonSerializer.Serialize(initialNotes)
        };

        var created = await _repository.AddAsync(record);
        return MapToDto(created);
    }

    public async Task<CarePlanDto?> UpdateCarePlanAsync(Guid id, UpdateCarePlanDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        if (dto.PatientName != null) existing.PatientName = dto.PatientName;
        if (dto.PatientIdCode != null) existing.PatientIdCode = dto.PatientIdCode;
        if (dto.PrimaryCondition != null) existing.PrimaryCondition = dto.PrimaryCondition;
        if (dto.PlanTitle != null) existing.PlanTitle = dto.PlanTitle;
        if (dto.GoalCount.HasValue) existing.GoalCount = dto.GoalCount.Value;
        if (dto.StartDateText != null) existing.StartDateText = dto.StartDateText;
        if (dto.ReviewDateText != null) existing.ReviewDateText = dto.ReviewDateText;
        if (dto.ReviewDueBadge != null) existing.ReviewDueBadge = dto.ReviewDueBadge;
        if (dto.AssignedNurseName != null) existing.AssignedNurseName = dto.AssignedNurseName;
        if (dto.AttendingDoctorName != null) existing.AttendingDoctorName = dto.AttendingDoctorName;
        if (dto.CareUnit != null) existing.CareUnit = dto.CareUnit;
        if (dto.RoomNumber != null) existing.RoomNumber = dto.RoomNumber;
        if (dto.OverallProgressPercentage.HasValue) existing.OverallProgressPercentage = dto.OverallProgressPercentage.Value;
        if (dto.CompletedTasksCount.HasValue) existing.CompletedTasksCount = dto.CompletedTasksCount.Value;
        if (dto.InProgressTasksCount.HasValue) existing.InProgressTasksCount = dto.InProgressTasksCount.Value;
        if (dto.NotStartedTasksCount.HasValue) existing.NotStartedTasksCount = dto.NotStartedTasksCount.Value;
        if (dto.OverdueTasksCount.HasValue) existing.OverdueTasksCount = dto.OverdueTasksCount.Value;

        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            if (dto.Status.Equals("Active", StringComparison.OrdinalIgnoreCase)) existing.Status = Domain.Enums.CarePlanStatus.Active;
            else if (dto.Status.Equals("ReviewDue", StringComparison.OrdinalIgnoreCase) || dto.Status.Equals("Review Due", StringComparison.OrdinalIgnoreCase)) existing.Status = Domain.Enums.CarePlanStatus.ReviewDue;
            else if (dto.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase)) existing.Status = Domain.Enums.CarePlanStatus.Completed;
            else if (dto.Status.Equals("Draft", StringComparison.OrdinalIgnoreCase)) existing.Status = Domain.Enums.CarePlanStatus.Draft;
        }

        existing.LastUpdatedText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt");
        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    public async Task<bool> DeleteCarePlanAsync(Guid id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<CarePlanDto?> AddNoteAsync(Guid id, AddCarePlanNoteDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        List<CarePlanNoteItem> notes;
        try
        {
            notes = System.Text.Json.JsonSerializer.Deserialize<List<CarePlanNoteItem>>(existing.NotesJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
        }
        catch
        {
            notes = new();
        }

        notes.Insert(0, new CarePlanNoteItem
        {
            Id = Guid.NewGuid().ToString("N"),
            Text = dto.NoteText,
            Date = DateTime.Now.ToString("MMM dd, yyyy â€¢ hh:mm tt"),
            Author = string.IsNullOrWhiteSpace(dto.AuthorName) ? "Staff Nurse" : dto.AuthorName
        });

        existing.NotesJson = System.Text.Json.JsonSerializer.Serialize(notes);
        existing.LastUpdatedText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt");

        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    public async Task<CarePlanDto?> ReviewCarePlanAsync(Guid id, ReviewCarePlanDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        if (!string.IsNullOrWhiteSpace(dto.NewReviewDateText))
        {
            existing.ReviewDateText = dto.NewReviewDateText;
            existing.ReviewDueBadge = "Reviewed";
        }

        if (dto.OverallProgressPercentage.HasValue)
        {
            existing.OverallProgressPercentage = dto.OverallProgressPercentage.Value;
        }

        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            if (dto.Status.Equals("Active", StringComparison.OrdinalIgnoreCase)) existing.Status = Domain.Enums.CarePlanStatus.Active;
            else if (dto.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase)) existing.Status = Domain.Enums.CarePlanStatus.Completed;
            else if (dto.Status.Equals("ReviewDue", StringComparison.OrdinalIgnoreCase)) existing.Status = Domain.Enums.CarePlanStatus.ReviewDue;
        }

        if (!string.IsNullOrWhiteSpace(dto.ReviewOutcome))
        {
            List<CarePlanNoteItem> notes;
            try
            {
                notes = System.Text.Json.JsonSerializer.Deserialize<List<CarePlanNoteItem>>(existing.NotesJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
            }
            catch
            {
                notes = new();
            }

            notes.Insert(0, new CarePlanNoteItem
            {
                Id = Guid.NewGuid().ToString("N"),
                Text = $"[Care Plan Review]: {dto.ReviewOutcome}",
                Date = DateTime.Now.ToString("MMM dd, yyyy â€¢ hh:mm tt"),
                Author = "Attending Physician"
            });

            existing.NotesJson = System.Text.Json.JsonSerializer.Serialize(notes);
        }

        existing.LastUpdatedText = DateTime.Now.ToString("MMM dd, yyyy hh:mm tt");
        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    private static CarePlanDto MapToDto(CarePlanRecord c) => new CarePlanDto
    {
        Id = c.Id,
        PatientId = c.PatientId,
        PatientName = c.PatientName,
        PatientIdCode = c.PatientIdCode,
        PatientAvatar = c.PatientAvatar,
        RoomNumber = c.RoomNumber,
        CareUnit = c.CareUnit,
        AgeGender = c.AgeGender,
        BloodGroup = c.BloodGroup,
        AttendingDoctorName = c.AttendingDoctorName,
        CareTeamMembersCount = c.CareTeamMembersCount,
        LengthOfStayText = c.LengthOfStayText,
        PrimaryCondition = c.PrimaryCondition,
        ConditionIcon = c.ConditionIcon,
        PlanTitle = c.PlanTitle,
        GoalCount = c.GoalCount,
        Status = c.Status.ToString(),
        StartDateText = c.StartDateText,
        ReviewDateText = c.ReviewDateText,
        ReviewDueBadge = c.ReviewDueBadge,
        AssignedNurseName = c.AssignedNurseName,
        AssignedNurseAvatar = c.AssignedNurseAvatar,
        OverallProgressPercentage = c.OverallProgressPercentage,
        CompletedTasksCount = c.CompletedTasksCount,
        InProgressTasksCount = c.InProgressTasksCount,
        NotStartedTasksCount = c.NotStartedTasksCount,
        OverdueTasksCount = c.OverdueTasksCount,
        LastUpdatedText = c.LastUpdatedText,
        NotesJson = c.NotesJson
    };
}

// --- Vital Round Service ---

