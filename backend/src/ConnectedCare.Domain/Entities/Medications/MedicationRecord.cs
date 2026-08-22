using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class MedicationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string MedicationIdCode { get; set; } = string.Empty; // e.g. MED-1001
    public string Name { get; set; } = string.Empty; // e.g. Paracetamol 500mg
    public string Form { get; set; } = "Tablet"; // Tablet, Inhaler, Capsule, Solution
    public Guid? PatientId { get; set; }
    public Patient? Patient { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string Dosage { get; set; } = "500 mg";
    public string Route { get; set; } = "Oral"; // Oral, Inhalation, Intravenous
    public string Frequency { get; set; } = "Every 6 hours";
    public string NextDoseTime { get; set; } = "May 19, 2025 10:00 AM";
    public string RelativeTimeText { get; set; } = "in 1h 20m";
    public string Status { get; set; } = "Active"; // Active, Discontinued, On Hold
    public string PrescribedBy { get; set; } = "Dr. Michael Brown";
    public string PrescribedBySpecialty { get; set; } = "Physician";
    public string Batch { get; set; } = "Batch: AMX1256";
    public string ExpiryDateText { get; set; } = "May 22, 2025";
    public string DaysLeftText { get; set; } = "3 days left";
    public string Category { get; set; } = "Analgesic";
    public string AdherencePercentage { get; set; } = "95%";
    public int ActivePrescriptions { get; set; } = 156;
}
