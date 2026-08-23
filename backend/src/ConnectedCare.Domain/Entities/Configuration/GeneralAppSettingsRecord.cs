using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class GeneralAppSettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrganizationName { get; set; } = "Connected Care Senior Living";
    public string Tagline { get; set; } = "Compassionate Care, Connected Life";
    public string LogoUrl { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = "#6B46C1";
    public string Phone { get; set; } = "+1 (512) 555-0100";
    public string Email { get; set; } = "info@connectedcare.com";
    public string Address { get; set; } = "100 Hospital Drive, Suite 400, Austin, TX 78705, USA";
    public string DateFormat { get; set; } = "MM/DD/YYYY (05/19/2025)";
    public string ShortDateFormat { get; set; } = "MM/DD/YYYY (05/19/2025)";
    public string DefaultLanguage { get; set; } = "English (United States)";
    public string TimeFormat { get; set; } = "12 Hour (05:30 PM)";
    public int ItemsPerPage { get; set; } = 20;
    public string WeekStartsOn { get; set; } = "Sunday";
    public string DefaultDashboard { get; set; } = "Overview";
    public bool AllowPublicRegistration { get; set; } = true;
    public int SessionTimeoutMinutes { get; set; } = 30;
    public bool EnableAuditLogs { get; set; } = true;
    public int PasswordExpiryDays { get; set; } = 90;
    public bool EnableTwoFactorAuth { get; set; } = true;
    public bool MaintenanceMode { get; set; } = false;
    public string WeightUnit { get; set; } = "Pounds (lbs)";
    public string HeightUnit { get; set; } = "Feet / Inches";
    public string TemperatureUnit { get; set; } = "Fahrenheit (°F)";
    public string Currency { get; set; } = "USD ($) - US Dollar";
}
