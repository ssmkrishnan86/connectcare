using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class LocalizationSettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DefaultLanguage { get; set; } = "English (United States)";
    public string FallbackLanguage { get; set; } = "English (India)";
    public string DateFormat { get; set; } = "DD MMM YYYY (19 May 2025)";
    public string ShortDateFormat { get; set; } = "DD/MM/YYYY (19/05/2025)";
    public string TimeFormat { get; set; } = "12 Hour (05:30 PM)";
    public string WeekStartsOn { get; set; } = "Monday";
    public string TimeZone { get; set; } = "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi";
    public string PreviewRegion { get; set; } = "India";
    public string CalendarType { get; set; } = "Gregorian Calendar";
    public string SupportedLanguagesJson { get; set; } = "[]";
}
