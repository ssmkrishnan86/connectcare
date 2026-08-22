using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class ShiftHandoverPatientRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? HandoverId { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string ConditionStatus { get; set; } = "Stable"; // Stable, Improving, Post Op Day 2
    public string ConditionSubtitle { get; set; } = "BP controlled";
    public int PendingTasksCount { get; set; } = 2;
    public string SpecialInstructions { get; set; } = "Monitor BP every 4 hrs";
    public string Priority { get; set; } = "High"; // High, Medium, Low
}
