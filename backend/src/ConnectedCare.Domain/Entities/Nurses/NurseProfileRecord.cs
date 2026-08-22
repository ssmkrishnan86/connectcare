using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class NurseProfileRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = "Emma Johnson";
    public string EmployeeIdCode { get; set; } = "NUR-10245";
    public string Email { get; set; } = "emma.johnson@connectcare.com";
    public string Phone { get; set; } = "+1 234 567 8900";
    public string Role { get; set; } = "Staff Nurse";
    public string Department { get; set; } = "Nursing";
    public string UnitWard { get; set; } = "Cardiology Unit";
    public string DateOfJoining { get; set; } = "Jan 15, 2023";
    public string AboutMe { get; set; } = "Compassionate and dedicated nurse with 5+ years of experience in patient care.";
    public string Avatar { get; set; } = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80";

    // Quick Settings
    public string DefaultUnitWard { get; set; } = "Cardiology Unit";
    public string DefaultShift { get; set; } = "07:00 AM - 03:00 PM (Day Shift)";
    public string Theme { get; set; } = "Light";
    public string DateFormat { get; set; } = "May 22, 2024 (MM/DD/YYYY)";
    public string TimeFormat { get; set; } = "12 Hour (hh:mm A)";

    // Professional Information
    public string LicenseNumber { get; set; } = "RN-778899";
    public string Qualification { get; set; } = "B.Sc Nursing";
    public string ExperienceText { get; set; } = "5 Years 3 Months";
    public string Specialization { get; set; } = "Critical Care Nursing";
    public string Certifications { get; set; } = "BLS, ACLS, PALS";

    // Contact Information
    public string EmergencyContactName { get; set; } = "Michael Johnson (Brother)";
    public string EmergencyContactPhone { get; set; } = "+1 987 654 3210";
    public string HomeAddress { get; set; } = "123 Maple Street, Springfield, IL 62704, USA";
    public string PersonalEmail { get; set; } = "emma.johnson@gmail.com";
}
