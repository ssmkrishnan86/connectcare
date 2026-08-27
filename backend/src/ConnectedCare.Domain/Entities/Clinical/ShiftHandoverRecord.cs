using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class ShiftHandoverRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string HandoverIdCode { get; set; } = "SHO-1001";
    public string CurrentShift { get; set; } = "Day Shift (07:00 AM - 03:00 PM)";
    public string HandoverToShift { get; set; } = "Evening Shift (03:00 PM - 11:00 PM)";
    public string OutgoingNurseName { get; set; } = string.Empty;
    public string OutgoingNurseRole { get; set; } = "Staff Nurse";
    public string OutgoingNurseAvatar { get; set; } = string.Empty;
    public string IncomingNurseName { get; set; } = string.Empty;
    public string IncomingNurseRole { get; set; } = "Staff Nurse";
    public string IncomingNurseAvatar { get; set; } = string.Empty;
    public int PatientsAssignedCount { get; set; } = 0;
    public int HighPriorityPatientsCount { get; set; } = 0;
    public int PendingTasksCount { get; set; } = 0;
    public int NewAlertsCount { get; set; } = 0;
    public int CompletedSectionsCount { get; set; } = 0;
    public int TotalSectionsCount { get; set; } = 0;
    public int CompletionPercentage { get; set; } = 0;
    public string HandoverNotes { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft"; // Draft, Completed
    public string HandoverDateText { get; set; } = string.Empty;
    public string HandoverTimeText { get; set; } = string.Empty;
}
