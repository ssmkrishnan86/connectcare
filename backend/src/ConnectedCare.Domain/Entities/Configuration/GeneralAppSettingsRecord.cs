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
    public string Phone { get; set; } = "+91 98765 43210";
    public string Email { get; set; } = "info@connectedcare.com";
    public string Address { get; set; } = "123, Care Street, Healthy City, Chennai - 600001, Tamil Nadu, India";
    public string DateFormat { get; set; } = "DD MMM YYYY (19 May 2025)";
    public string ShortDateFormat { get; set; } = "DD/MM/YYYY (19/05/2025)";
    public string DefaultLanguage { get; set; } = "English";
    public string TimeFormat { get; set; } = "12 Hour (05:30 PM)";
    public int ItemsPerPage { get; set; } = 20;
    public string WeekStartsOn { get; set; } = "Monday";
    public string DefaultDashboard { get; set; } = "Overview";
    public bool AllowPublicRegistration { get; set; } = true;
    public int SessionTimeoutMinutes { get; set; } = 30;
    public bool EnableAuditLogs { get; set; } = true;
    public int PasswordExpiryDays { get; set; } = 90;
    public bool EnableTwoFactorAuth { get; set; } = true;
    public bool MaintenanceMode { get; set; } = false;
    public string WeightUnit { get; set; } = "Kilograms (kg)";
    public string HeightUnit { get; set; } = "Centimeters (cm)";
    public string TemperatureUnit { get; set; } = "Celsius (Â°C)";
    public string Currency { get; set; } = "INR (â‚¹) - Indian Rupee";
}
