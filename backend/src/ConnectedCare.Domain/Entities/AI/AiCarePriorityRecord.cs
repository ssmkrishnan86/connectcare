using System;
using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AiCarePriorityRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    
    // Priority Details
    public string PriorityLevel { get; set; } = "High"; // Critical, High, Medium, Low
    public string TargetRole { get; set; } = "Nurse"; // Doctor, Nurse, CareCoordinator, Pharmacist, SocialWorker
    public string Title { get; set; } = string.Empty;
    public string Rationale { get; set; } = string.Empty;
    public string SuggestedAction { get; set; } = string.Empty;
    public string ActionType { get; set; } = "TaskCreation"; // OrderReview, TaskCreation, MedicationRecon, VitalsCheck, CarePlanUpdate
    public string Urgency { get; set; } = "Today"; // Immediate, Today, NextShift, Routine
    
    // Human-in-the-loop Disposition
    public string DispositionStatus { get; set; } = "Pending"; // Pending, Accepted, Dismissed
    public string? ActionedBy { get; set; }
    public DateTime? ActionedDate { get; set; }
    public string? Notes { get; set; }
    public Guid? ResultingTaskId { get; set; }
}
