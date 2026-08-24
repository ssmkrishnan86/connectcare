using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Application.Features.VitalRounds.DTOs;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.VitalRounds.Services;
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

    public async Task<VitalRoundDto> CreateVitalRoundAsync(CreateVitalRoundDto dto)
    {
        var record = new VitalRoundRecord
        {
            PatientId = dto.PatientId,
            Status = Domain.Enums.VitalRoundStatus.Pending,
            PatientName = string.Empty,
            PatientIdCode = string.Empty,
            PatientAvatar = string.Empty,
            AgeGender = string.Empty,
            BloodGroup = "A+",
            RoomBed = string.Empty,
            CareUnit = string.Empty,
            PatientType = Domain.Enums.PatientType.Inpatient,
            AttendingDoctorName = "Dr. Sarah Wilson",
            CareTeamMembersCount = 0,
            LengthOfStayText = string.Empty,
            LastRoundTimeText = string.Empty,
            LastRoundDateText = string.Empty,
            RecordedByNurseName = string.Empty,
            NextDueTimeText = DateTime.Now.AddHours(4).ToString("hh:mm tt"),
            NextDueRelativeText = "Due in 4h",
            BloodPressure = "120/80 mmHg",
            HeartRate = "82 bpm",
            Temperature = "98.6 Â°F",
            SpO2 = "98 %",
            RespiratoryRate = "18 /min",
            PainScore = "0/10"
        };

        var created = await _repository.AddAsync(record);

        return MapToDto(created);
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












