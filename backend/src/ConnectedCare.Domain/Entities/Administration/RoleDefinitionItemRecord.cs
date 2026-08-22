using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class RoleDefinitionItemRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RoleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int UsersCount { get; set; } = 1;
    public string Status { get; set; } = "Active";
    public string CategoryBadge { get; set; } = "System Role";
    public string PermissionsMatrixJson { get; set; } = "{}";
}
