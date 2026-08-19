using ConnectedCare.Application.Common.Interfaces;
using ConnectedCare.Application.Features.Dashboard.DTOs;
using ConnectedCare.Application.Features.NurseApp.DTOs;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Services;

public interface IPatientService
{
    Task<List<Patient>> GetPatientsAsync(string? search, string? status, string? careUnit);
    Task<Patient?> GetPatientByIdAsync(string id);
    Task<Patient> CreatePatientAsync(Patient patient);
    Task<Patient?> UpdatePatientAsync(string id, Patient patient);
    Task<bool> DeletePatientAsync(string id);
    Task<PatientStatsDto> GetPatientStatsAsync();
}

public class PatientService : IPatientService
{
    private readonly IPatientRepository _repository;

    public PatientService(IPatientRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Patient>> GetPatientsAsync(string? search, string? status, string? careUnit)
    {
        return await _repository.SearchPatientsAsync(search, status, careUnit);
    }

    public async Task<Patient?> GetPatientByIdAsync(string id)
    {
        return await _repository.GetByIdCodeOrGuidAsync(id);
    }

    public async Task<Patient?> UpdatePatientAsync(string id, Patient updated)
    {
        var existing = await _repository.GetByIdCodeOrGuidAsync(id);
        if (existing == null) return null;

        existing.Name = string.IsNullOrWhiteSpace(updated.Name) ? existing.Name : updated.Name;
        existing.FirstName = string.IsNullOrWhiteSpace(updated.FirstName) ? existing.FirstName : updated.FirstName;
        existing.LastName = string.IsNullOrWhiteSpace(updated.LastName) ? existing.LastName : updated.LastName;
        existing.Phone = updated.Phone ?? existing.Phone;
        existing.Email = updated.Email ?? existing.Email;
        existing.Address = updated.Address ?? existing.Address;
        existing.City = updated.City ?? existing.City;
        existing.State = updated.State ?? existing.State;
        existing.ZipCode = updated.ZipCode ?? existing.ZipCode;
        existing.Country = updated.Country ?? existing.Country;

        existing.CareUnit = string.IsNullOrWhiteSpace(updated.CareUnit) ? existing.CareUnit : updated.CareUnit;
        existing.FloorRoom = updated.FloorRoom ?? existing.FloorRoom;
        existing.PrimaryDoctorName = updated.PrimaryDoctorName ?? existing.PrimaryDoctorName;
        existing.Status = updated.Status;
        existing.RiskLevel = updated.RiskLevel;
        if (!string.IsNullOrWhiteSpace(updated.Dob)) existing.Dob = updated.Dob;
        if (!string.IsNullOrWhiteSpace(updated.Gender)) existing.Gender = updated.Gender;
        if (!string.IsNullOrWhiteSpace(updated.AgeGender)) existing.AgeGender = updated.AgeGender;
        if (!string.IsNullOrWhiteSpace(updated.BloodType)) existing.BloodType = updated.BloodType;
        if (!string.IsNullOrWhiteSpace(updated.MaritalStatus)) existing.MaritalStatus = updated.MaritalStatus;
        if (!string.IsNullOrWhiteSpace(updated.Avatar)) existing.Avatar = updated.Avatar;

        // Emergency Contact
        existing.EmergencyContactName = updated.EmergencyContactName ?? existing.EmergencyContactName;
        existing.EmergencyContactRelationship = updated.EmergencyContactRelationship ?? existing.EmergencyContactRelationship;
        existing.EmergencyContactPhone = updated.EmergencyContactPhone ?? existing.EmergencyContactPhone;
        existing.EmergencyContactIsPrimary = updated.EmergencyContactIsPrimary;

        // Medical Info
        existing.MedicalConditions = updated.MedicalConditions ?? existing.MedicalConditions;
        existing.Allergies = updated.Allergies ?? existing.Allergies;
        existing.CurrentMedications = updated.CurrentMedications ?? existing.CurrentMedications;
        existing.PastMedicalHistory = updated.PastMedicalHistory ?? existing.PastMedicalHistory;

        // Insurance
        existing.InsuranceProvider = updated.InsuranceProvider ?? existing.InsuranceProvider;
        existing.InsurancePolicyNumber = updated.InsurancePolicyNumber ?? existing.InsurancePolicyNumber;
        existing.InsuranceGroupNumber = updated.InsuranceGroupNumber ?? existing.InsuranceGroupNumber;
        existing.InsuranceValidUntil = updated.InsuranceValidUntil ?? existing.InsuranceValidUntil;

        // Notes
        existing.AdditionalNotes = updated.AdditionalNotes ?? existing.AdditionalNotes;

        await _repository.UpdateAsync(existing);
        return existing;
    }

    public async Task<Patient> CreatePatientAsync(Patient patient)
    {
        if (string.IsNullOrWhiteSpace(patient.Name) && (!string.IsNullOrWhiteSpace(patient.FirstName) || !string.IsNullOrWhiteSpace(patient.LastName)))
        {
            patient.Name = $"{patient.FirstName} {patient.LastName}".Trim();
        }
        else if (!string.IsNullOrWhiteSpace(patient.Name) && string.IsNullOrWhiteSpace(patient.FirstName))
        {
            var parts = patient.Name.Split(' ');
            patient.FirstName = parts.Length > 0 ? parts[0] : patient.Name;
            patient.LastName = parts.Length > 1 ? string.Join(" ", parts.Skip(1)) : string.Empty;
        }

        if (string.IsNullOrWhiteSpace(patient.PatientIdCode) || await _repository.GetByIdCodeOrGuidAsync(patient.PatientIdCode) != null)
        {
            patient.PatientIdCode = $"PT-{Random.Shared.Next(10000, 99999)}";
        }
        if (string.IsNullOrWhiteSpace(patient.Mrn) || await _repository.GetByIdCodeOrGuidAsync(patient.Mrn) != null)
        {
            patient.Mrn = $"MRN-2026-{Random.Shared.Next(10000, 99999)}";
        }
        if (string.IsNullOrWhiteSpace(patient.Avatar))
        {
            patient.Avatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80";
        }
        if (string.IsNullOrWhiteSpace(patient.LastVisit))
        {
            patient.LastVisit = DateTime.UtcNow.ToString("MMM dd, yyyy hh:mm tt");
        }
        if (string.IsNullOrWhiteSpace(patient.CareUnit))
        {
            patient.CareUnit = "General Ward";
        }
        if (string.IsNullOrWhiteSpace(patient.FloorRoom))
        {
            patient.FloorRoom = "1st Floor - 101";
        }

        try
        {
            return await _repository.AddAsync(patient);
        }
        catch (Exception ex) when (ex.GetType().Name.Contains("DbUpdateException") || (ex.InnerException != null && ex.InnerException.GetType().Name.Contains("PostgresException")))
        {
            patient.Id = Guid.NewGuid();
            patient.PatientIdCode = $"PT-{Random.Shared.Next(10000, 99999)}";
            patient.Mrn = $"MRN-2026-{Random.Shared.Next(10000, 99999)}";
            return await _repository.AddAsync(patient);
        }
    }

    public async Task<bool> DeletePatientAsync(string id)
    {
        var patient = await _repository.GetByIdCodeOrGuidAsync(id);
        if (patient == null) return false;
        await _repository.DeleteAsync(patient.Id);
        return true;
    }

    public async Task<PatientStatsDto> GetPatientStatsAsync()
    {
        return await _repository.GetPatientStatsAsync();
    }
}

public interface IDoctorService
{
    Task<List<Doctor>> GetDoctorsAsync(string? search, string? specialty);
}

public class DoctorService : IDoctorService
{
    private readonly IDoctorRepository _repository;

    public DoctorService(IDoctorRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Doctor>> GetDoctorsAsync(string? search, string? specialty)
    {
        return await _repository.SearchDoctorsAsync(search, specialty);
    }
}

public interface ICareTeamService
{
    Task<List<CareTeamMember>> GetCareTeamMembersAsync();
}

public class CareTeamService : ICareTeamService
{
    private readonly ICareTeamRepository _repository;

    public CareTeamService(ICareTeamRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CareTeamMember>> GetCareTeamMembersAsync()
    {
        return await _repository.GetCareTeamMembersAsync();
    }
}

public interface IAlertService
{
    Task<List<Alert>> GetAlertsAsync();
    Task<bool> AcknowledgeAlertAsync(Guid id);
}

public class AlertService : IAlertService
{
    private readonly IAlertRepository _repository;

    public AlertService(IAlertRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Alert>> GetAlertsAsync()
    {
        return await _repository.GetAlertsAsync();
    }

    public async Task<bool> AcknowledgeAlertAsync(Guid id)
    {
        return await _repository.AcknowledgeAlertAsync(id);
    }
}

public interface ITaskService
{
    Task<List<TaskItem>> GetTasksAsync();
    Task<TaskItem> CreateTaskAsync(TaskItem task);
}

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;

    public TaskService(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TaskItem>> GetTasksAsync()
    {
        return await _repository.GetTasksAsync();
    }

    public async Task<TaskItem> CreateTaskAsync(TaskItem task)
    {
        if (string.IsNullOrWhiteSpace(task.TaskIdCode))
        {
            task.TaskIdCode = $"TSK-0{Random.Shared.Next(10, 99)}";
        }
        return await _repository.AddAsync(task);
    }
}

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
    Task<AlertSummaryDto> GetAlertSummaryAsync();
    Task<PatientStatusDto> GetPatientStatusAsync();
    Task<List<RecentAlertItemDto>> GetRecentAlertsAsync();
    Task<List<IntegrationItemDto>> GetIntegrationsAsync();
    Task<NurseDashboardDto> GetNurseDashboardAsync();
}

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repository;

    public DashboardService(IDashboardRepository repository)
    {
        _repository = repository;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var total = await _repository.GetTotalPatientsCountAsync();
        var activeAlerts = await _repository.GetActiveAlertsCountAsync();
        var critical = await _repository.GetCriticalAlertsCountAsync();
        var teams = await _repository.GetActiveCareTeamsCountAsync();
        var openTasks = await _repository.GetOpenTasksCountAsync();

        return new DashboardSummaryDto
        {
            TotalPatients = total.ToString("N0"),
            PatientsChange = "12.5% vs last month",
            ActiveAlerts = activeAlerts.ToString(),
            ActiveAlertsChange = "20% vs yesterday",
            CriticalAlerts = critical.ToString(),
            CriticalAlertsChange = "50% vs yesterday",
            CareTeams = teams.ToString(),
            CareTeamsChange = "Active",
            OpenTasks = openTasks.ToString(),
            OpenTasksChange = "8% vs yesterday",
            PendingReviews = "24",
            PendingReviewsChange = "15% vs yesterday"
        };
    }

    public async Task<AlertSummaryDto> GetAlertSummaryAsync()
    {
        var activeAlerts = await _repository.GetActiveAlertsCountAsync();
        var critical = await _repository.GetCriticalAlertsCountAsync();

        return new AlertSummaryDto
        {
            TotalAlerts = activeAlerts,
            Critical = critical,
            High = 4,
            Medium = 3,
            Low = 2
        };
    }

    public async Task<PatientStatusDto> GetPatientStatusAsync()
    {
        var total = await _repository.GetTotalPatientsCountAsync();
        return new PatientStatusDto
        {
            TotalPatients = total,
            InCare = (int)(total * 0.8),
            Admitted = (int)(total * 0.14),
            Discharged = (int)(total * 0.05),
            Inactive = (int)(total * 0.01)
        };
    }

    public async Task<List<RecentAlertItemDto>> GetRecentAlertsAsync()
    {
        var alerts = await _repository.GetRecentAlertsAsync();
        return alerts.Select(a => new RecentAlertItemDto
        {
            Severity = a.Severity.ToString(),
            PatientName = a.PatientName,
            Location = a.RoomLocation,
            Time = a.TimestampText
        }).ToList();
    }

    public async Task<List<IntegrationItemDto>> GetIntegrationsAsync()
    {
        var integrations = await _repository.GetSystemIntegrationsAsync();
        return integrations.Select(i => new IntegrationItemDto
        {
            Name = i.Name,
            Status = i.Status
        }).ToList();
    }

    public async Task<NurseDashboardDto> GetNurseDashboardAsync()
    {
        var totalPatients = await _repository.GetTotalPatientsCountAsync();
        var activeAlerts = await _repository.GetActiveAlertsCountAsync();
        var criticalAlerts = await _repository.GetCriticalAlertsCountAsync();
        var openTasks = await _repository.GetOpenTasksCountAsync();
        var recentAlerts = await _repository.GetRecentAlertsAsync();

        return new NurseDashboardDto
        {
            TotalPatients = totalPatients > 0 ? totalPatients : 24,
            InpatientsCount = 12,
            OutpatientsCount = 12,
            TasksTotal = openTasks > 0 ? openTasks : 8,
            TasksPending = openTasks > 0 ? Math.Max(0, openTasks - 3) : 5,
            TasksCompleted = 3,
            MedicationsDueTotal = 6,
            MedicationsOverdue = 2,
            MedicationsUpcoming = 4,
            AlertsTotal = activeAlerts > 0 ? activeAlerts : 6,
            AlertsCritical = criticalAlerts > 0 ? criticalAlerts : 3,
            AlertsHigh = 3,
            RoundsCompleted = 18,
            RoundsTotal = 24,
            AdmissionsToday = 4,
            DischargesToday = 1,
            TransfersToday = 2,
            CareTypes = new List<NurseCategoryStatDto>
            {
                new NurseCategoryStatDto { Name = "Medical", Value = 10, Color = "#6366F1" },
                new NurseCategoryStatDto { Name = "Surgical", Value = 7, Color = "#10B981" },
                new NurseCategoryStatDto { Name = "ICU", Value = 4, Color = "#3B82F6" },
                new NurseCategoryStatDto { Name = "Maternity", Value = 3, Color = "#F59E0B" }
            },
            Priorities = new List<NurseCategoryStatDto>
            {
                new NurseCategoryStatDto { Name = "Critical", Value = 4, Color = "#EF4444" },
                new NurseCategoryStatDto { Name = "High", Value = 6, Color = "#F59E0B" },
                new NurseCategoryStatDto { Name = "Medium", Value = 9, Color = "#10B981" },
                new NurseCategoryStatDto { Name = "Low", Value = 5, Color = "#3B82F6" }
            },
            UpcomingMedications = new List<NurseUpcomingMedicationDto>
            {
                new NurseUpcomingMedicationDto { Time = "09:00 AM", MedicationName = "Metoprolol 50 mg", PatientNameLocation = "Patricia Smith • Room 102", DueText = "Due in 20 min", ColorClass = "bg-rose-50 text-rose-700 border-rose-200" },
                new NurseUpcomingMedicationDto { Time = "10:00 AM", MedicationName = "Furosemide 20 mg", PatientNameLocation = "Michael Davis • Room 201", DueText = "Due in 1 hr", ColorClass = "bg-amber-50 text-amber-700 border-amber-200" },
                new NurseUpcomingMedicationDto { Time = "11:00 AM", MedicationName = "Paracetamol 650 mg", PatientNameLocation = "Linda Martinez • Room 305", DueText = "Due in 2 hr", ColorClass = "bg-blue-50 text-blue-700 border-blue-200" }
            },
            MyTasks = new List<NurseTaskItemDto>
            {
                new NurseTaskItemDto { Id = 1, Text = "Vital Signs - Room 102", PatientName = "Patricia Smith", DueText = "Due Today 08:00 AM", DueColorClass = "text-rose-600", IsCompleted = false },
                new NurseTaskItemDto { Id = 2, Text = "Wound Care - Room 201", PatientName = "Michael Davis", DueText = "Due Today 09:30 AM", DueColorClass = "text-amber-600", IsCompleted = false },
                new NurseTaskItemDto { Id = 3, Text = "IV Site Assessment - Room 305", PatientName = "Linda Martinez", DueText = "Due Today 10:00 AM", DueColorClass = "text-amber-600", IsCompleted = true },
                new NurseTaskItemDto { Id = 4, Text = "Medication Round", PatientName = "Completed", DueText = "07:30 AM", DueColorClass = "text-emerald-600", IsCompleted = true },
                new NurseTaskItemDto { Id = 5, Text = "Care Plan Update - Room 105", PatientName = "Completed", DueText = "07:15 AM", DueColorClass = "text-emerald-600", IsCompleted = false }
            },
            LatestAlerts = recentAlerts.Select(a => new NurseAlertDto
            {
                Severity = a.Severity.ToString(),
                Title = a.Title,
                PatientLocation = $"{a.PatientName} • {a.RoomLocation}",
                TimeText = a.TimestampText,
                ColorClass = a.Severity.ToString() == "Critical" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-amber-50 border-amber-200 text-amber-700"
            }).ToList()
        };
    }
}

// --- Discharge Checklist Service ---
public interface IDischargeChecklistService
{
    Task<List<DischargeChecklistDto>> GetChecklistsAsync(string? statusFilter, string? unitFilter, string? search);
    Task<DischargeChecklistSummaryDto> GetSummaryAsync();
    Task<DischargeChecklistDto> CreateChecklistAsync(CreateDischargeChecklistDto dto);
}

public class DischargeChecklistService : IDischargeChecklistService
{
    private readonly IDischargeChecklistRepository _repository;

    public DischargeChecklistService(IDischargeChecklistRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<DischargeChecklistDto>> GetChecklistsAsync(string? statusFilter, string? unitFilter, string? search)
    {
        var list = await _repository.GetChecklistsAsync(statusFilter, unitFilter, search);
        return list.Select(MapToDto).ToList();
    }

    public async Task<DischargeChecklistSummaryDto> GetSummaryAsync()
    {
        var all = await _repository.GetAllAsync();
        var list = all.ToList();
        return new DischargeChecklistSummaryDto
        {
            TotalPatients = list.Count > 0 ? list.Count : 21,
            InProgress = list.Count(c => c.ChecklistStatus == Domain.Enums.DischargeStatus.InProgress),
            ReadyForDischarge = list.Count(c => c.ChecklistStatus == Domain.Enums.DischargeStatus.Ready),
            PendingItems = list.Count(c => c.ChecklistStatus == Domain.Enums.DischargeStatus.PendingItems),
            DischargedToday = list.Count(c => c.ChecklistStatus == Domain.Enums.DischargeStatus.Discharged)
        };
    }

    public async Task<DischargeChecklistDto> CreateChecklistAsync(CreateDischargeChecklistDto dto)
    {
        var record = new DischargeChecklistRecord
        {
            PatientName = dto.PatientName,
            PatientIdCode = string.IsNullOrWhiteSpace(dto.PatientIdCode) ? $"PT-{Random.Shared.Next(10000, 99999)}" : dto.PatientIdCode,
            RoomNumber = dto.RoomNumber,
            CareUnit = dto.CareUnit,
            AdmitDateText = dto.AdmitDateText,
            ExpectedDischargeText = dto.ExpectedDischargeText,
            AttendingDoctorName = string.IsNullOrWhiteSpace(dto.AttendingDoctorName) ? "Dr. Sarah Wilson" : dto.AttendingDoctorName,
            Notes = dto.Notes,
            ChecklistStatus = Domain.Enums.DischargeStatus.InProgress,
            ProgressPercentage = 70,
            PendingItemsCount = 2,
            TotalItemsCount = 14,
            CompletedItemsCount = 7,
            InProgressItemsCount = 4,
            NotStartedItemsCount = 1
        };

        var created = await _repository.AddAsync(record);
        return MapToDto(created);
    }

    private static DischargeChecklistDto MapToDto(DischargeChecklistRecord c) => new DischargeChecklistDto
    {
        Id = c.Id,
        PatientId = c.PatientId,
        PatientName = c.PatientName,
        PatientIdCode = c.PatientIdCode,
        PatientAvatar = c.PatientAvatar,
        AgeGender = c.AgeGender,
        BloodGroup = c.BloodGroup,
        RoomNumber = c.RoomNumber,
        CareUnit = c.CareUnit,
        AdmitDateText = c.AdmitDateText,
        AdmitDaysText = c.AdmitDaysText,
        ChecklistStatus = c.ChecklistStatus.ToString(),
        ProgressPercentage = c.ProgressPercentage,
        PendingItemsCount = c.PendingItemsCount,
        TotalItemsCount = c.TotalItemsCount,
        CompletedItemsCount = c.CompletedItemsCount,
        InProgressItemsCount = c.InProgressItemsCount,
        NotStartedItemsCount = c.NotStartedItemsCount,
        ExpectedDischargeText = c.ExpectedDischargeText,
        ExpectedDischargeRelative = c.ExpectedDischargeRelative,
        AttendingDoctorName = c.AttendingDoctorName,
        CareTeamMembersCount = c.CareTeamMembersCount,
        Notes = c.Notes
    };
}

// --- Consultation Service ---
public interface IConsultationService
{
    Task<List<ConsultationDto>> GetConsultationsAsync(string? statusFilter, string? typeFilter, string? search);
    Task<ConsultationSummaryDto> GetSummaryAsync();
    Task<ConsultationDto> CreateConsultationAsync(CreateConsultationDto dto);
}

public class ConsultationService : IConsultationService
{
    private readonly IConsultationRepository _repository;

    public ConsultationService(IConsultationRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ConsultationDto>> GetConsultationsAsync(string? statusFilter, string? typeFilter, string? search)
    {
        var list = await _repository.GetConsultationsAsync(statusFilter, typeFilter, search);
        return list.Select(MapToDto).ToList();
    }

    public async Task<ConsultationSummaryDto> GetSummaryAsync()
    {
        var all = await _repository.GetAllAsync();
        var list = all.ToList();
        return new ConsultationSummaryDto
        {
            TotalConsultations = list.Count > 0 ? list.Count : 18,
            Completed = list.Count(c => c.Status == Domain.Enums.ConsultationStatus.Completed),
            InProgress = list.Count(c => c.Status == Domain.Enums.ConsultationStatus.InProgress),
            Scheduled = list.Count(c => c.Status == Domain.Enums.ConsultationStatus.Scheduled),
            FollowUpDue = list.Count(c => c.Status == Domain.Enums.ConsultationStatus.FollowUpDue)
        };
    }

    public async Task<ConsultationDto> CreateConsultationAsync(CreateConsultationDto dto)
    {
        var record = new ConsultationRecord
        {
            PatientName = dto.PatientName,
            PatientIdCode = string.IsNullOrWhiteSpace(dto.PatientIdCode) ? $"PT-{Random.Shared.Next(10000, 99999)}" : dto.PatientIdCode,
            ConsultationType = dto.ConsultationType,
            PhysicianName = dto.PhysicianName,
            DateTimeText = dto.DateTimeText,
            Location = dto.Location,
            Reason = dto.Reason,
            FollowUpDateText = dto.FollowUpDateText,
            Status = Domain.Enums.ConsultationStatus.Scheduled
        };

        var created = await _repository.AddAsync(record);
        return MapToDto(created);
    }

    private static ConsultationDto MapToDto(ConsultationRecord c) => new ConsultationDto
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
        ConsultationType = c.ConsultationType,
        ConsultationSubtitle = c.ConsultationSubtitle,
        ConsultationIcon = c.ConsultationIcon,
        PhysicianId = c.PhysicianId,
        PhysicianName = c.PhysicianName,
        PhysicianRole = c.PhysicianRole,
        PhysicianAvatar = c.PhysicianAvatar,
        DateTimeText = c.DateTimeText,
        Location = c.Location,
        Reason = c.Reason,
        Status = c.Status.ToString(),
        FollowUpDateText = c.FollowUpDateText,
        ClinicalNotes = c.ClinicalNotes
    };
}

// --- Care Plan Service ---
public interface ICarePlanService
{
    Task<List<CarePlanDto>> GetCarePlansAsync(string? statusFilter, string? search);
    Task<CarePlanSummaryDto> GetSummaryAsync();
    Task<CarePlanDto> CreateCarePlanAsync(CreateCarePlanDto dto);
}

public class CarePlanService : ICarePlanService
{
    private readonly ICarePlanRepository _repository;

    public CarePlanService(ICarePlanRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CarePlanDto>> GetCarePlansAsync(string? statusFilter, string? search)
    {
        var list = await _repository.GetCarePlansAsync(statusFilter, search);
        return list.Select(MapToDto).ToList();
    }

    public async Task<CarePlanSummaryDto> GetSummaryAsync()
    {
        var all = await _repository.GetAllAsync();
        var list = all.ToList();
        return new CarePlanSummaryDto
        {
            TotalCarePlans = list.Count > 0 ? list.Count : 28,
            ActivePlans = list.Count(c => c.Status == Domain.Enums.CarePlanStatus.Active),
            ReviewDue = list.Count(c => c.Status == Domain.Enums.CarePlanStatus.ReviewDue),
            Completed = list.Count(c => c.Status == Domain.Enums.CarePlanStatus.Completed),
            DraftPlans = list.Count(c => c.Status == Domain.Enums.CarePlanStatus.Draft)
        };
    }

    public async Task<CarePlanDto> CreateCarePlanAsync(CreateCarePlanDto dto)
    {
        var record = new CarePlanRecord
        {
            PatientName = dto.PatientName,
            PatientIdCode = string.IsNullOrWhiteSpace(dto.PatientIdCode) ? $"PT-{Random.Shared.Next(10000, 99999)}" : dto.PatientIdCode,
            PrimaryCondition = dto.PrimaryCondition,
            PlanTitle = dto.PlanTitle,
            GoalCount = dto.GoalCount > 0 ? dto.GoalCount : 5,
            StartDateText = dto.StartDateText,
            ReviewDateText = dto.ReviewDateText,
            AssignedNurseName = string.IsNullOrWhiteSpace(dto.AssignedNurseName) ? "Emma Johnson" : dto.AssignedNurseName,
            Status = Domain.Enums.CarePlanStatus.Active,
            OverallProgressPercentage = 75
        };

        var created = await _repository.AddAsync(record);
        return MapToDto(created);
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
public interface IVitalRoundService
{
    Task<List<VitalRoundDto>> GetVitalRoundsAsync(string? statusFilter, string? search);
    Task<VitalRoundSummaryDto> GetSummaryAsync();
    Task<VitalRoundDto> RecordVitalsAsync(Guid id, RecordVitalsDto dto);
}

public class VitalRoundService : IVitalRoundService
{
    private readonly IVitalRoundRepository _repository;

    public VitalRoundService(IVitalRoundRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<VitalRoundDto>> GetVitalRoundsAsync(string? statusFilter, string? search)
    {
        var list = await _repository.GetVitalRoundsAsync(statusFilter, search);
        return list.Select(MapToDto).ToList();
    }

    public async Task<VitalRoundSummaryDto> GetSummaryAsync()
    {
        var all = await _repository.GetAllAsync();
        var list = all.ToList();
        return new VitalRoundSummaryDto
        {
            TotalPatients = list.Count > 0 ? list.Count : 24,
            InpatientsCount = list.Count(v => v.PatientType == Domain.Enums.PatientType.Inpatient),
            OutpatientsCount = list.Count(v => v.PatientType == Domain.Enums.PatientType.Outpatient),
            Completed = list.Count(v => v.Status == Domain.Enums.VitalRoundStatus.Completed),
            Pending = list.Count(v => v.Status == Domain.Enums.VitalRoundStatus.Pending),
            Overdue = list.Count(v => v.Status == Domain.Enums.VitalRoundStatus.Overdue),
            OnTimeCount = 16,
            CompletedLateCount = 2,
            AverageCompletionTime = "5m 20s"
        };
    }

    public async Task<VitalRoundDto> RecordVitalsAsync(Guid id, RecordVitalsDto dto)
    {
        var record = await _repository.GetByIdAsync(id);
        if (record == null)
        {
            throw new KeyNotFoundException("Vital Round record not found.");
        }

        record.BloodPressure = dto.BloodPressure;
        record.HeartRate = dto.HeartRate;
        record.Temperature = dto.Temperature;
        record.SpO2 = dto.SpO2;
        record.RespiratoryRate = dto.RespiratoryRate;
        record.PainScore = dto.PainScore;
        record.RecordedByNurseName = string.IsNullOrWhiteSpace(dto.NurseName) ? "Emma Johnson" : dto.NurseName;
        record.Status = Domain.Enums.VitalRoundStatus.Completed;
        record.LastRoundTimeText = DateTime.UtcNow.ToString("hh:mm tt");
        record.LastRoundDateText = DateTime.UtcNow.ToString("MMM dd, yyyy");

        await _repository.UpdateAsync(record);
        return MapToDto(record);
    }

    private static VitalRoundDto MapToDto(VitalRoundRecord v) => new VitalRoundDto
    {
        Id = v.Id,
        PatientId = v.PatientId,
        PatientName = v.PatientName,
        PatientIdCode = v.PatientIdCode,
        PatientAvatar = v.PatientAvatar,
        AgeGender = v.AgeGender,
        BloodGroup = v.BloodGroup,
        RoomBed = v.RoomBed,
        CareUnit = v.CareUnit,
        PatientType = v.PatientType.ToString(),
        AttendingDoctorName = v.AttendingDoctorName,
        CareTeamMembersCount = v.CareTeamMembersCount,
        LengthOfStayText = v.LengthOfStayText,
        LastRoundTimeText = v.LastRoundTimeText,
        LastRoundDateText = v.LastRoundDateText,
        RecordedByNurseName = v.RecordedByNurseName,
        NextDueTimeText = v.NextDueTimeText,
        NextDueRelativeText = v.NextDueRelativeText,
        Status = v.Status.ToString(),
        BloodPressure = v.BloodPressure,
        HeartRate = v.HeartRate,
        Temperature = v.Temperature,
        SpO2 = v.SpO2,
        RespiratoryRate = v.RespiratoryRate,
        PainScore = v.PainScore
    };
}
