using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class UserSettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrganizationName { get; set; } = "Connected Care Senior Living";
    public string TimeZone { get; set; } = "(UTC-06:00) Central Time (US & Canada)";
    public string DateFormat { get; set; } = "MM/DD/YYYY";
    public string TimeFormat { get; set; } = "12 Hour (AM/PM)";
    public string Language { get; set; } = "English (US)";
    public int ItemsPerPage { get; set; } = 10;
}
