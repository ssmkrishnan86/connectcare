using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class UserAccountItemRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "System Administrator";
    public string Department { get; set; } = "Administration";
    public string Location { get; set; } = "Main Campus";
    public string Status { get; set; } = "Active"; // Active, Inactive, Pending, Locked
    public string LastSignInText { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public string? FirstName { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public string? LastName { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public string? Password { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public string? ConfirmPassword { get; set; }
}
