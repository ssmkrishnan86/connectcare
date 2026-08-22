using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class LocationUnit : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty; // e.g. LOC-001
    public string Name { get; set; } = string.Empty; // e.g. Main Hospital
    public string Avatar { get; set; } = string.Empty;
    public string Type { get; set; } = "Hospital"; // e.g. Hospital, Wing, Block, Specialty Center, Center, Clinic
    public string Facility { get; set; } = "Connected Care Hospital";
    public string FacilityLocation { get; set; } = "Chennai, Tamil Nadu";
    public int UnitsCount { get; set; } = 18;
    public int Beds { get; set; } = 220;
    public DoctorStatus Status { get; set; } = DoctorStatus.Active;
    public string Floor { get; set; } = "Ground Floor";
    public string Capacity { get; set; } = "220 Beds";
    public string Occupied { get; set; } = "180 Beds";
    public string OccupancyRate { get; set; } = "81.8%";
    public AlertSeverity AttentionPriority { get; set; } = AlertSeverity.Low;
}
