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
    public string Phone { get; set; } = "+91 98765 43210";
    public string Address { get; set; } = "123, Care Street, Healthy City, Chennai - 600001, Tamil Nadu, India";
    public string Email { get; set; } = "info@connectedcare.com";
    public string OrganizationType { get; set; } = "Senior Living / Assisted Living";
    public string RegistrationNumber { get; set; } = "CCSL/2018/55671";
    public string EstablishedYear { get; set; } = "2018";
    public string Website { get; set; } = "https://www.connectedcare.com";
    public string PrimaryContactPerson { get; set; } = "John Admin";
    public string PrimaryContactDesignation { get; set; } = "Administrator";
    public string PrimaryContactEmail { get; set; } = "admin@connectedcare.com";
    public string PrimaryContactPhone { get; set; } = "+91 98765 43210";
    public string PrimaryContactAlternatePhone { get; set; } = "+91 91234 56789";
    public string AddressLine1 { get; set; } = "123, Care Street, Healthy City";
    public string AddressLine2 { get; set; } = "Near Green Park";
    public string City { get; set; } = "Chennai";
    public string State { get; set; } = "Tamil Nadu";
    public string PinCode { get; set; } = "600001";
    public string Country { get; set; } = "India";
    public string DefaultTimeZone { get; set; } = "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi";
    public string DefaultLanguage { get; set; } = "English";
    public string DefaultDateFormat { get; set; } = "DD MMM YYYY (19 May 2025)";
    public string DefaultTimeFormat { get; set; } = "12 Hour (05:30 PM)";
    public string Currency { get; set; } = "INR (â‚¹) - Indian Rupee";
    public string WeekStartsOn { get; set; } = "Monday";
    public bool EnableMultiLocation { get; set; } = true;
    public string EnabledModulesJson { get; set; } = "[]";
    public double Latitude { get; set; } = 13.0827;
    public double Longitude { get; set; } = 80.2707;
}
