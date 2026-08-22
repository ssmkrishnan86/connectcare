using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class AuditLogEntryRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DateTimeText { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string Action { get; set; } = "CREATE"; // CREATE, UPDATE, DELETE, LOGIN, LOGIN_FAIL, EXPORT
    public string Module { get; set; } = "Resident";
    public string RecordDescription { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string Status { get; set; } = "Success"; // Success, Failed
    public string UserDetailsJson { get; set; } = "{}";
    public string ActionDetailsJson { get; set; } = "{}";
    public string TechDetailsJson { get; set; } = "{}";
    public string ChangesJson { get; set; } = "{}";
}
