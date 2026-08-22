using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class BackupHistoryRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string BackupName { get; set; } = string.Empty;
    public string Type { get; set; } = "Full Backup"; // Full Backup, Database Only, Files Only
    public string Description { get; set; } = string.Empty;
    public string SizeText { get; set; } = string.Empty;
    public string CreatedOnText { get; set; } = string.Empty;
    public string Status { get; set; } = "Success"; // Success, Failed
}
