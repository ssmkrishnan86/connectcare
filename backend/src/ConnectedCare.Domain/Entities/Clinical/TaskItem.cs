using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class TaskItem : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TaskIdCode { get; set; } = string.Empty; // e.g. TSK-1001
    public string Title { get; set; } = string.Empty; // e.g. Review Admission Form
    public string Description { get; set; } = string.Empty; // e.g. Review and verify admission details
    public Guid? PatientId { get; set; }
    public Patient? Patient { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string TaskType { get; set; } = "Documentation"; // Documentation, Medication, Clinical Care, Care Activity, Care Coordination, Follow-up, Care Planning
    public TaskPriority Priority { get; set; } = TaskPriority.Medium; // High, Medium, Low
    public string AssignedCaregiver { get; set; } = string.Empty; // e.g. Nurse Sarah
    public string AssigneeRole { get; set; } = string.Empty; // e.g. Nursing
    public string AssigneeAvatar { get; set; } = string.Empty;
    public string DueTime { get; set; } = string.Empty; // e.g. May 19, 2025 10:00 AM
    public bool IsOverdue { get; set; } = false;
    public TaskStatusItem Status { get; set; } = TaskStatusItem.Pending; // Pending / Open, In Progress, Completed
    public string StatusStr { get; set; } = "Open"; // Open, In Progress, Completed
}
