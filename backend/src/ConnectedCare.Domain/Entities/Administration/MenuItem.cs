using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class MenuItem : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string MenuKey { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public string Icon { get; set; } = "LayoutDashboard";
    public int SortOrder { get; set; } = 0;
    public string RequiredPermission { get; set; } = string.Empty;
    public string RolesAllowedJson { get; set; } = "[\"Admin\"]";
    public string BadgeType { get; set; } = string.Empty; // count, text, new, none
    public string BadgeValue { get; set; } = string.Empty;
}
