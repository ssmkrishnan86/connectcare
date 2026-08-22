using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class ShiftHandoverRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string HandoverIdCode { get; set; } = "SHO-1001";
    public string CurrentShift { get; set; } = "Day Shift (07:00 AM - 03:00 PM)";
    public string HandoverToShift { get; set; } = "Evening Shift (03:00 PM - 11:00 PM)";
    public string OutgoingNurseName { get; set; } = "Emma Johnson";
    public string OutgoingNurseRole { get; set; } = "Staff Nurse";
    public string OutgoingNurseAvatar { get; set; } = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80";
    public string IncomingNurseName { get; set; } = "Sophia Williams";
    public string IncomingNurseRole { get; set; } = "Staff Nurse";
    public string IncomingNurseAvatar { get; set; } = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";
    public int PatientsAssignedCount { get; set; } = 24;
    public int HighPriorityPatientsCount { get; set; } = 5;
    public int PendingTasksCount { get; set; } = 6;
    public int NewAlertsCount { get; set; } = 4;
    public int CompletedSectionsCount { get; set; } = 18;
    public int TotalSectionsCount { get; set; } = 24;
    public int CompletionPercentage { get; set; } = 75;
    public string HandoverNotes { get; set; } = "â€¢ Patricia's BP was high in the morning, medication adjusted.\nâ€¢ Linda is experiencing mild pain, pain meds given.\nâ€¢ James needs assistance while walking.\nâ€¢ Room 502 patient (Robert Johnson) awaiting lab results.\nâ€¢ All medications up to date.";
    public string Status { get; set; } = "Draft"; // Draft, Completed
    public string HandoverDateText { get; set; } = "May 22, 2024";
    public string HandoverTimeText { get; set; } = "02:45 PM";
}
