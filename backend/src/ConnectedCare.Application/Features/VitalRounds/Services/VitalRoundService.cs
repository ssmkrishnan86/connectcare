using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Application.Features.VitalRounds.DTOs;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.VitalRounds.Services;

public class VitalRoundService : IVitalRoundService
{
    private readonly IVitalRoundRepository _repository;
    private readonly IPatientRepository _patientRepository;

    public VitalRoundService(IVitalRoundRepository repository, IPatientRepository patientRepository)
    {
        _repository = repository;
        _patientRepository = patientRepository;
    }

    public async Task<List<VitalRoundDto>> GetVitalRoundsAsync(string? statusFilter, string? search)
    {
        var list = await _repository.GetVitalRoundsAsync(statusFilter, search);
        return list.Select(MapToDto).ToList();
    }

    public async Task<VitalRoundDto> CreateVitalRoundAsync(CreateVitalRoundDto dto)
    {
        Patient? patient = null;
        if (dto.PatientId != Guid.Empty)
        {
            patient = await _patientRepository.GetByIdAsync(dto.PatientId);
        }
        else if (!string.IsNullOrWhiteSpace(dto.PatientIdCode))
        {
            patient = await _patientRepository.GetByIdCodeOrGuidAsync(dto.PatientIdCode);
        }

        var isCompleted = !string.IsNullOrWhiteSpace(dto.Status) && dto.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase);

        var bp = !string.IsNullOrWhiteSpace(dto.BloodPressure) ? dto.BloodPressure : (patient?.BloodPressure ?? string.Empty);
        var hr = !string.IsNullOrWhiteSpace(dto.HeartRate) ? dto.HeartRate : (patient?.HeartRate ?? string.Empty);
        var temp = !string.IsNullOrWhiteSpace(dto.Temperature) ? dto.Temperature : (patient?.Temperature ?? string.Empty);
        var spo2 = !string.IsNullOrWhiteSpace(dto.SpO2) ? dto.SpO2 : (patient?.SpO2 ?? string.Empty);
        var rr = !string.IsNullOrWhiteSpace(dto.RespiratoryRate) ? dto.RespiratoryRate : "18 /min";
        var pain = !string.IsNullOrWhiteSpace(dto.PainScore) ? dto.PainScore : "0/10";
        var recordedBy = !string.IsNullOrWhiteSpace(dto.RecordedByNurseName) ? dto.RecordedByNurseName : "Staff Nurse";

        var record = new VitalRoundRecord
        {
            PatientId = patient?.Id ?? (dto.PatientId != Guid.Empty ? dto.PatientId : null),
            Status = isCompleted ? Domain.Enums.VitalRoundStatus.Completed : Domain.Enums.VitalRoundStatus.Pending,
            PatientName = !string.IsNullOrWhiteSpace(dto.PatientName) ? dto.PatientName : (patient?.Name ?? string.Empty),
            PatientIdCode = !string.IsNullOrWhiteSpace(dto.PatientIdCode) ? dto.PatientIdCode : (patient?.PatientIdCode ?? string.Empty),
            PatientAvatar = patient?.Avatar ?? string.Empty,
            AgeGender = patient?.AgeGender ?? string.Empty,
            BloodGroup = !string.IsNullOrWhiteSpace(patient?.BloodType) ? patient.BloodType : "A+",
            RoomBed = !string.IsNullOrWhiteSpace(dto.RoomBed) ? dto.RoomBed : (patient?.FloorRoom ?? string.Empty),
            CareUnit = !string.IsNullOrWhiteSpace(dto.CareUnit) ? dto.CareUnit : (patient?.CareUnit ?? string.Empty),
            PatientType = Domain.Enums.PatientType.Inpatient,
            AttendingDoctorName = patient?.PrimaryDoctorName ?? "Dr. Sarah Wilson",
            CareTeamMembersCount = 3,
            LengthOfStayText = $"{patient?.CareDays ?? 1} Days",
            LastRoundTimeText = isCompleted ? DateTime.UtcNow.ToString("hh:mm tt") : string.Empty,
            LastRoundDateText = isCompleted ? DateTime.UtcNow.ToString("MMM dd, yyyy") : string.Empty,
            RecordedByNurseName = recordedBy,
            NextDueTimeText = !string.IsNullOrWhiteSpace(dto.NextDueTimeText) ? dto.NextDueTimeText : DateTime.Now.AddHours(4).ToString("hh:mm tt"),
            NextDueRelativeText = isCompleted ? "Due in 4h" : "Due now",
            BloodPressure = bp,
            HeartRate = hr,
            Temperature = temp,
            SpO2 = spo2,
            RespiratoryRate = rr,
            PainScore = pain
        };

        var created = await _repository.AddAsync(record);

        if (patient != null && (!string.IsNullOrWhiteSpace(bp) || !string.IsNullOrWhiteSpace(hr) || !string.IsNullOrWhiteSpace(temp) || !string.IsNullOrWhiteSpace(spo2)))
        {
            if (!string.IsNullOrWhiteSpace(bp)) patient.BloodPressure = bp;
            if (!string.IsNullOrWhiteSpace(hr)) patient.HeartRate = hr;
            if (!string.IsNullOrWhiteSpace(temp)) patient.Temperature = temp;
            if (!string.IsNullOrWhiteSpace(spo2)) patient.SpO2 = spo2;
            patient.UpdatedDate = DateTime.UtcNow;
            await _patientRepository.UpdateAsync(patient);
        }

        return MapToDto(created);
    }

    public async Task<VitalRoundSummaryDto> GetSummaryAsync()
    {
        var all = await _repository.GetAllAsync();
        var list = all.ToList();
        var completed = list.Count(v => v.Status == Domain.Enums.VitalRoundStatus.Completed);
        var pending = list.Count(v => v.Status == Domain.Enums.VitalRoundStatus.Pending);
        var overdue = list.Count(v => v.Status == Domain.Enums.VitalRoundStatus.Overdue);

        return new VitalRoundSummaryDto
        {
            TotalPatients = list.Count,
            InpatientsCount = list.Count(v => v.PatientType == Domain.Enums.PatientType.Inpatient),
            OutpatientsCount = list.Count(v => v.PatientType == Domain.Enums.PatientType.Outpatient),
            Completed = completed,
            Pending = pending,
            Overdue = overdue,
            OnTimeCount = completed,
            CompletedLateCount = 0,
            AverageCompletionTime = list.Count > 0 ? "5m 20s" : "--"
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
        record.RecordedByNurseName = string.IsNullOrWhiteSpace(dto.NurseName) ? "Staff Nurse" : dto.NurseName;
        record.Status = Domain.Enums.VitalRoundStatus.Completed;
        record.LastRoundTimeText = DateTime.UtcNow.ToString("hh:mm tt");
        record.LastRoundDateText = DateTime.UtcNow.ToString("MMM dd, yyyy");

        await _repository.UpdateAsync(record);

        if (record.PatientId.HasValue && record.PatientId.Value != Guid.Empty)
        {
            var patient = await _patientRepository.GetByIdAsync(record.PatientId.Value);
            if (patient != null)
            {
                if (!string.IsNullOrWhiteSpace(dto.BloodPressure)) patient.BloodPressure = dto.BloodPressure;
                if (!string.IsNullOrWhiteSpace(dto.HeartRate)) patient.HeartRate = dto.HeartRate;
                if (!string.IsNullOrWhiteSpace(dto.Temperature)) patient.Temperature = dto.Temperature;
                if (!string.IsNullOrWhiteSpace(dto.SpO2)) patient.SpO2 = dto.SpO2;
                patient.UpdatedDate = DateTime.UtcNow;
                await _patientRepository.UpdateAsync(patient);
            }
        }

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







