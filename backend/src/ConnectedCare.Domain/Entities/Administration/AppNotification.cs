using System;
using System.Text.Json.Serialization;

namespace ConnectedCare.Domain.Entities;

public class AppNotification : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Specific user recipient ID if targeted to a single user (null = role-based or system broadcast)
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Role targeting: "All", "Admin", "Doctor", "Nurse", "Staff"
    /// </summary>
    public string? UserRole { get; set; } = "All";

    /// <summary>
    /// Notification headline / title
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Detailed message content
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Category/Type: Alert, Clinical, Task, Medication, Consultation, ShiftHandover, CarePlan, Message, System
    /// </summary>
    public string Type { get; set; } = "System";

    /// <summary>
    /// Severity priority: Critical, High, Medium, Low, Info
    /// </summary>
    public string Severity { get; set; } = "Info";

    /// <summary>
    /// Route/URL to navigate to upon click: /alerts, /tasks, /medications, /consultations, /shift-handover, /care-plans, /messages
    /// </summary>
    public string? ActionUrl { get; set; }

    /// <summary>
    /// Optional foreign ID of related record (alert ID, task ID, consultation ID, etc.)
    /// </summary>
    public string? RelatedEntityId { get; set; }

    /// <summary>
    /// Type of related entity: Alert, TaskItem, ConsultationRecord, MedicationRecord, ShiftHandoverRecord
    /// </summary>
    public string? RelatedEntityType { get; set; }

    /// <summary>
    /// Associated patient name if clinical notification
    /// </summary>
    public string? PatientName { get; set; }

    /// <summary>
    /// Associated patient ID code (e.g. PT-1001)
    /// </summary>
    public string? PatientIdCode { get; set; }

    /// <summary>
    /// Associated room / location (e.g. Room 204 • Floor 2)
    /// </summary>
    public string? RoomLocation { get; set; }

    /// <summary>
    /// Read/Unread status indicator
    /// </summary>
    public bool IsRead { get; set; } = false;

    /// <summary>
    /// Timestamp when marked read
    /// </summary>
    public DateTime? ReadAt { get; set; }

    /// <summary>
    /// Human readable relative or formatted timestamp
    /// </summary>
    public string? TimestampText { get; set; }
}
