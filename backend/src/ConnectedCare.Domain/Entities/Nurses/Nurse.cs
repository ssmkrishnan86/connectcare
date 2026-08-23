using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class Nurse : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string NurseIdCode { get; set; } = string.Empty; // e.g. NUR-2001
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty; // e.g. Emergency Care
    public string SubUnit { get; set; } = string.Empty; // e.g. ER Unit
    public string Location { get; set; } = string.Empty; // e.g. Emergency Department (Ground Floor)
    public string Shift { get; set; } = string.Empty; // e.g. Night Shift (08:00 PM - 08:00 AM)
    public string AssignedUnit { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DoctorStatus Status { get; set; } = DoctorStatus.Active;
    public string Experience { get; set; } = "5 Years";

    // Personal Details
    public string FirstName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string Dob { get; set; } = string.Empty;
    public string MaritalStatus { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = string.Empty;
    public string Languages { get; set; } = string.Empty;

    // Employment Details
    public string Role { get; set; } = "Nurse";
    public string EmploymentType { get; set; } = string.Empty;
    public string ReportingTo { get; set; } = string.Empty;
    public string DateOfJoining { get; set; } = string.Empty;

    // Address Details
    public string StreetAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;

    // Professional & Licensing Details
    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseState { get; set; } = string.Empty;
    public string LicenseExpiry { get; set; } = string.Empty;
    public string Certifications { get; set; } = "BLS, ACLS";

    // EHR Permissions & Access Rights
    public bool CarePlanUpdates { get; set; } = true;
    public bool VitalMonitoring { get; set; } = true;
    public bool MedicationAdministration { get; set; } = true;
    public bool ShiftHandover { get; set; } = true;

    // Navigations
    [JsonIgnore]
    public ICollection<CareTeamMember> CareTeamAssignments { get; set; } = new List<CareTeamMember>();
    [JsonIgnore]
    public ICollection<PatientNurse> PatientNurses { get; set; } = new List<PatientNurse>();
}
