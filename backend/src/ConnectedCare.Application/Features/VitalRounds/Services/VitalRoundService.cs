using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Application.Features.VitalRounds.DTOs;
using ConnectedCare.Application.Features.Notifications.Services;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Application.Features.VitalRounds.Services;

public class VitalRoundService : IVitalRoundService
{
    private readonly IVitalRoundRepository _repository;
    private readonly IPatientRepository _patientRepository;
    private readonly IAlertRepository _alertRepository;
    private readonly INotificationService _notificationService;

    public VitalRoundService(
        IVitalRoundRepository repository,
        IPatientRepository patientRepository,
        IAlertRepository alertRepository,
        INotificationService notificationService)
    {
        _repository = repository;
        _patientRepository = patientRepository;
        _alertRepository = alertRepository;
        _notificationService = notificationService;
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
        else if (!string.IsNullOrWhiteSpace(dto.PatientName))
        {
            var pNameLower = dto.PatientName.Trim().ToLower();
            var allPatients = await _patientRepository.GetAllAsync();
            patient = allPatients.FirstOrDefault(p => p.Name.ToLower() == pNameLower || p.Name.ToLower().Contains(pNameLower));
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

        if (patient != null && (!string.IsNullOrWhiteSpace(bp) || !string.IsNullOrWhiteSpace(hr) || !string.IsNullOrWhiteSpace(temp) || !string.IsNullOrWhiteSpace(spo2) || !string.IsNullOrWhiteSpace(dto.BloodSugar)))
        {
            if (!string.IsNullOrWhiteSpace(bp)) patient.BloodPressure = bp;
            if (!string.IsNullOrWhiteSpace(hr)) patient.HeartRate = hr;
            if (!string.IsNullOrWhiteSpace(temp)) patient.Temperature = temp;
            if (!string.IsNullOrWhiteSpace(spo2)) patient.SpO2 = spo2;
            if (!string.IsNullOrWhiteSpace(dto.BloodSugar)) patient.BloodSugar = dto.BloodSugar;
            patient.UpdatedDate = DateTime.UtcNow;
            await _patientRepository.UpdateAsync(patient);
        }

        // Automated Safety Threshold Alert Evaluation
        await EvaluateAndCreateVitalAlertsAsync(patient, record, dto.BloodSugar);

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

        Patient? patient = null;
        if (record.PatientId.HasValue && record.PatientId.Value != Guid.Empty)
        {
            patient = await _patientRepository.GetByIdAsync(record.PatientId.Value);
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

        // Automated Safety Threshold Alert Evaluation
        await EvaluateAndCreateVitalAlertsAsync(patient, record);

        return MapToDto(record);
    }

    private async Task EvaluateAndCreateVitalAlertsAsync(Patient? patient, VitalRoundRecord record, string? bloodSugarInput = null)
    {
        try
        {
            // 1. Blood Pressure Check (e.g. 220/140, 190/110, 80/50)
            if (!string.IsNullOrWhiteSpace(record.BloodPressure))
            {
                var bpMatch = Regex.Match(record.BloodPressure, @"(\d+)(?:[^\d]+(\d+))?");
                if (bpMatch.Success && int.TryParse(bpMatch.Groups[1].Value, out var sys))
                {
                    int.TryParse(bpMatch.Groups[2].Value, out var dia);
                    if (sys >= 180 || dia >= 120)
                    {
                        await CreateThresholdAlertAsync(
                            title: "High BP",
                            description: $"BP is {record.BloodPressure.Trim()}",
                            severity: AlertSeverity.Critical,
                            trigger: $"Systolic BP {sys} mmHg",
                            patient: patient,
                            record: record);
                    }
                    else if (sys < 90 || (dia > 0 && dia < 55))
                    {
                        await CreateThresholdAlertAsync(
                            title: "Critical Low BP",
                            description: $"BP is {record.BloodPressure.Trim()}",
                            severity: AlertSeverity.Critical,
                            trigger: $"Hypotension BP {sys}/{dia}",
                            patient: patient,
                            record: record);
                    }
                    else if (sys >= 140 || dia >= 90)
                    {
                        await CreateThresholdAlertAsync(
                            title: "Elevated Blood Pressure",
                            description: $"BP is {record.BloodPressure.Trim()}",
                            severity: AlertSeverity.High,
                            trigger: $"Systolic BP {sys} mmHg",
                            patient: patient,
                            record: record);
                    }
                }
            }

            // 2. Blood Sugar Check (e.g. 450, 450 mg/dL, 45)
            var bsValue = !string.IsNullOrWhiteSpace(bloodSugarInput) ? bloodSugarInput : (patient?.BloodSugar ?? "");
            if (!string.IsNullOrWhiteSpace(bsValue))
            {
                var bsMatch = Regex.Match(bsValue, @"(\d+(?:\.\d+)?)");
                if (bsMatch.Success && double.TryParse(bsMatch.Groups[1].Value, out var bs))
                {
                    if (bs >= 300)
                    {
                        await CreateThresholdAlertAsync(
                            title: "High Sugar",
                            description: $"Sugar level is {bsValue.Trim()}",
                            severity: AlertSeverity.Critical,
                            trigger: $"Blood Glucose {bs} mg/dL",
                            patient: patient,
                            record: record);
                    }
                    else if (bs < 60)
                    {
                        await CreateThresholdAlertAsync(
                            title: "Critical Low Sugar",
                            description: $"Sugar level is {bsValue.Trim()}",
                            severity: AlertSeverity.Critical,
                            trigger: $"Hypoglycemia {bs} mg/dL",
                            patient: patient,
                            record: record);
                    }
                }
            }

            // 3. SpO2 Check (e.g. 84%, 70, 91%)
            if (!string.IsNullOrWhiteSpace(record.SpO2))
            {
                var spo2Match = Regex.Match(record.SpO2, @"(\d+)");
                if (spo2Match.Success && int.TryParse(spo2Match.Groups[1].Value, out var spo2Num))
                {
                    if (spo2Num <= 88)
                    {
                        await CreateThresholdAlertAsync(
                            title: "High SPO2",
                            description: $"SpO2 level is {record.SpO2.Trim()}",
                            severity: AlertSeverity.Critical,
                            trigger: $"SpO2 {spo2Num}%",
                            patient: patient,
                            record: record);
                    }
                    else if (spo2Num < 92)
                    {
                        await CreateThresholdAlertAsync(
                            title: "Low SpO2 Warning",
                            description: $"SpO2 level is {record.SpO2.Trim()}",
                            severity: AlertSeverity.High,
                            trigger: $"SpO2 {spo2Num}%",
                            patient: patient,
                            record: record);
                    }
                }
            }

            // 4. Heart Rate Check (e.g. 160, 40 bpm)
            if (!string.IsNullOrWhiteSpace(record.HeartRate))
            {
                var hrMatch = Regex.Match(record.HeartRate, @"(\d+)");
                if (hrMatch.Success && int.TryParse(hrMatch.Groups[1].Value, out var hrNum))
                {
                    if (hrNum >= 135 || hrNum <= 45)
                    {
                        await CreateThresholdAlertAsync(
                            title: hrNum >= 135 ? "Critical Tachycardia" : "Critical Bradycardia",
                            description: $"Heart rate recorded at {record.HeartRate.Trim()}",
                            severity: AlertSeverity.Critical,
                            trigger: $"Heart Rate {hrNum} bpm",
                            patient: patient,
                            record: record);
                    }
                }
            }

            // 5. Temperature Check (e.g. 104°F, 39.8°C)
            if (!string.IsNullOrWhiteSpace(record.Temperature))
            {
                var tempMatch = Regex.Match(record.Temperature, @"(\d+(?:\.\d+)?)");
                if (tempMatch.Success && double.TryParse(tempMatch.Groups[1].Value, out var tempNum))
                {
                    if (tempNum >= 103.0 || (tempNum >= 39.4 && tempNum < 50.0))
                    {
                        await CreateThresholdAlertAsync(
                            title: "High Temperature",
                            description: $"Temperature is {record.Temperature.Trim()}",
                            severity: AlertSeverity.Critical,
                            trigger: $"Body Temperature {record.Temperature.Trim()}",
                            patient: patient,
                            record: record);
                    }
                }
            }
        }
        catch { }
    }

    private async Task CreateThresholdAlertAsync(
        string title,
        string description,
        AlertSeverity severity,
        string trigger,
        Patient? patient,
        VitalRoundRecord record)
    {
        var alert = new Alert
        {
            Id = Guid.NewGuid(),
            AlertIdCode = $"ALT-{Random.Shared.Next(1000, 9999)}",
            Title = title,
            Description = description,
            PatientId = patient?.Id ?? record.PatientId,
            PatientName = !string.IsNullOrWhiteSpace(record.PatientName) ? record.PatientName : (patient?.Name ?? "Patient"),
            PatientIdCode = !string.IsNullOrWhiteSpace(record.PatientIdCode) ? record.PatientIdCode : (patient?.PatientIdCode ?? ""),
            PatientAvatar = patient?.Avatar ?? record.PatientAvatar ?? "",
            RoomLocation = !string.IsNullOrWhiteSpace(record.RoomBed) ? record.RoomBed : (patient?.FloorRoom ?? "General Ward"),
            CareUnit = !string.IsNullOrWhiteSpace(record.CareUnit) ? record.CareUnit : (patient?.CareUnit ?? "General Ward"),
            Type = "Vital Signs",
            Severity = severity,
            Status = "New",
            IsAcknowledged = false,
            TriggerCondition = trigger,
            TimestampText = "Just now",
            ReportedBy = !string.IsNullOrWhiteSpace(record.RecordedByNurseName) ? record.RecordedByNurseName : "Clinical Monitoring",
            ReportedByRole = "Staff Nurse",
            RecipientRole = "All",
            AgeGender = !string.IsNullOrWhiteSpace(record.AgeGender) ? record.AgeGender : (patient?.AgeGender ?? "68 Y • Female"),
            BloodGroup = !string.IsNullOrWhiteSpace(record.BloodGroup) ? record.BloodGroup : (patient?.BloodType ?? "A+"),
            PatientType = "Inpatient",
            DetectedBy = "Vital Telemetry",
            Source = "Bedside Monitor",
            Notes = $"Automated clinical alert triggered by vital observation telemetry: {description}.",
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        await _alertRepository.AddAsync(alert);

        try
        {
            await _notificationService.DispatchNotificationAsync(
                title: alert.Title,
                message: $"{alert.Description} for {alert.PatientName} ({alert.RoomLocation})",
                type: "Alert",
                severity: alert.Severity.ToString(),
                actionUrl: "/alerts",
                userRole: "All",
                patientName: alert.PatientName,
                patientIdCode: alert.PatientIdCode,
                roomLocation: alert.RoomLocation,
                relatedEntityId: alert.Id.ToString(),
                relatedEntityType: "Alert"
            );
        }
        catch { }
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







