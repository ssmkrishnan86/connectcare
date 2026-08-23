using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class OrganizationSettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrganizationName { get; set; } = "Connected Care Senior Living";
    public string LogoUrl { get; set; } = string.Empty;
    public string Tagline { get; set; } = "Compassionate Care, Connected Life";
    public string PrimaryColor { get; set; } = "#6B46C1";
    public string Phone { get; set; } = "+1 (512) 555-0100";
    public string Address { get; set; } = "100 Hospital Drive, Suite 400, Austin, TX 78705, USA";
    public string Email { get; set; } = "info@connectedcare.com";
    public string OrganizationType { get; set; } = "Senior Living / Assisted Living";
    public string RegistrationNumber { get; set; } = "TX-HSP-2018-55671";
    public string EstablishedYear { get; set; } = "2018";
    public string Website { get; set; } = "https://www.connectedcare.com";
    public string PrimaryContactPerson { get; set; } = "John Admin";
    public string PrimaryContactDesignation { get; set; } = "Administrator";
    public string PrimaryContactEmail { get; set; } = "admin@connectedcare.com";
    public string PrimaryContactPhone { get; set; } = "(512) 555-0100";
    public string PrimaryContactAlternatePhone { get; set; } = "(512) 555-0199";
    public string AddressLine1 { get; set; } = "100 Hospital Drive";
    public string AddressLine2 { get; set; } = "Suite 400";
    public string City { get; set; } = "Austin";
    public string State { get; set; } = "Texas";
    public string PinCode { get; set; } = "78705";
    public string Country { get; set; } = "United States";
    public string DefaultTimeZone { get; set; } = "(UTC-06:00) Central Time (US & Canada)";
    public string DefaultLanguage { get; set; } = "English (United States)";
    public string DefaultDateFormat { get; set; } = "MM/DD/YYYY (05/19/2025)";
    public string DefaultTimeFormat { get; set; } = "12 Hour (05:30 PM)";
    public string Currency { get; set; } = "USD ($) - US Dollar";
    public string WeekStartsOn { get; set; } = "Sunday";
    public bool EnableMultiLocation { get; set; } = true;
    public string EnabledModulesJson { get; set; } = "[]";
    public double Latitude { get; set; } = 30.2672;
    public double Longitude { get; set; } = -97.7431;
}
