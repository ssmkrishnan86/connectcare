using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class SecuritySettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int MinPasswordLength { get; set; } = 8;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public bool RequireNumbers { get; set; } = true;
    public bool RequireSpecialChars { get; set; } = true;
    public int PasswordExpiryDays { get; set; } = 90;
    public string EnableMfaFor { get; set; } = "All Users"; // All Users, Administrators Only, None
    public bool MfaAuthenticatorApp { get; set; } = true;
    public bool MfaSmsVerification { get; set; } = true;
    public bool MfaEmailVerification { get; set; } = false;
    public int RememberMfaDays { get; set; } = 7;
    public int SessionTimeoutMinutes { get; set; } = 30;
    public int IdleTimeoutMinutes { get; set; } = 15;
    public bool ForceLogoutOnPasswordChange { get; set; } = true;
    public bool AllowMultipleActiveSessions { get; set; } = false;
    public int LockoutThreshold { get; set; } = 5;
    public int LockoutDurationMinutes { get; set; } = 15;
    public bool PreventUserEnumeration { get; set; } = true;
    public bool RequireEmailVerification { get; set; } = true;
    public bool RestrictLoginToRegisteredDevices { get; set; } = false;
    public bool AllowPasswordReset { get; set; } = true;
    public bool RestrictSpecificIps { get; set; } = true;
    public string AllowedIpsJson { get; set; } = "[\"203.0.113.10\", \"203.0.113.0/24\", \"198.51.100.15\"]";
}
