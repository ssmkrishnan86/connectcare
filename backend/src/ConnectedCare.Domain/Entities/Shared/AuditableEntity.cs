using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public abstract class AuditableEntity
{
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; } = "System";
    public DateTime? UpdatedDate { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; } = "System";

    // Backward compatibility property
    public DateTime CreatedAtUtc
    {
        get => CreatedDate;
        set => CreatedDate = value;
    }
}
