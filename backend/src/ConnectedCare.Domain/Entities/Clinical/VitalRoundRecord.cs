using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class VitalRoundRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string RoomBed { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public PatientType PatientType { get; set; } = PatientType.Inpatient;
    public string AttendingDoctorName { get; set; } = "Dr. Sarah Wilson";
    public int CareTeamMembersCount { get; set; } = 3;
    public string LengthOfStayText { get; set; } = "4 Days";
    public string LastRoundTimeText { get; set; } = "08:00 AM";
    public string LastRoundDateText { get; set; } = "May 22, 2024";
    public string RecordedByNurseName { get; set; } = "Emma Johnson";
    public string NextDueTimeText { get; set; } = "12:00 PM";
    public string NextDueRelativeText { get; set; } = "Due in 1h 15m";
    public VitalRoundStatus Status { get; set; } = VitalRoundStatus.Pending;
    public string BloodPressure { get; set; } = "120/80 mmHg";
    public string HeartRate { get; set; } = "82 bpm";
    public string Temperature { get; set; } = "98.6 Â°F";
    public string SpO2 { get; set; } = "98 %";
    public string RespiratoryRate { get; set; } = "18 /min";
    public string PainScore { get; set; } = "2/10";
}
