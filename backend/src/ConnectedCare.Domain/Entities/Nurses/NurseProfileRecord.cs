using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class NurseProfileRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string EmployeeIdCode { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = "Staff Nurse";
    public string Department { get; set; } = "Nursing";
    public string UnitWard { get; set; } = string.Empty;
    public string DateOfJoining { get; set; } = string.Empty;
    public string AboutMe { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;

    // Quick Settings
    public string DefaultUnitWard { get; set; } = string.Empty;
    public string DefaultShift { get; set; } = "Day Shift (07:00 AM - 03:00 PM)";
    public string Theme { get; set; } = "Light";
    public string DateFormat { get; set; } = "MM/DD/YYYY";
    public string TimeFormat { get; set; } = "12 Hour (hh:mm A)";

    // Professional Information
    public string LicenseNumber { get; set; } = string.Empty;
    public string Qualification { get; set; } = string.Empty;
    public string ExperienceText { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Certifications { get; set; } = string.Empty;

    // Contact Information
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
    public string HomeAddress { get; set; } = string.Empty;
    public string PersonalEmail { get; set; } = string.Empty;
}
