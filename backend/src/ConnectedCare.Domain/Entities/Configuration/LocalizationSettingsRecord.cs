using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class LocalizationSettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DefaultLanguage { get; set; } = "English (United States)";
    public string FallbackLanguage { get; set; } = "Spanish (United States)";
    public string DateFormat { get; set; } = "MM/DD/YYYY (05/19/2025)";
    public string ShortDateFormat { get; set; } = "MM/DD/YYYY (05/19/2025)";
    public string TimeFormat { get; set; } = "12 Hour (05:30 PM)";
    public string WeekStartsOn { get; set; } = "Sunday";
    public string TimeZone { get; set; } = "(UTC-05:00) Eastern Time (US & Canada)";
    public string PreviewRegion { get; set; } = "United States";
    public string CalendarType { get; set; } = "Gregorian Calendar";
    public string SupportedLanguagesJson { get; set; } = "[{\"name\":\"English (United States)\",\"code\":\"en-US\",\"isDefault\":true},{\"name\":\"Spanish (United States)\",\"code\":\"es-US\"},{\"name\":\"French\",\"code\":\"fr-FR\"},{\"name\":\"Chinese (Simplified)\",\"code\":\"zh-CN\"}]";
}
