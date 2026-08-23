using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class Doctor : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string DoctorIdCode { get; set; } = string.Empty; // e.g. DOC-1001
    public string Name { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string SpecialtyIcon { get; set; } = "🩺";
    public string Department { get; set; } = string.Empty;
    public string Role { get; set; } = "Physician";
    public string EmploymentType { get; set; } = "Full-Time Staff";
    public string ReportingTo { get; set; } = "Medical Director";
    public string DateOfJoining { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string Dob { get; set; } = string.Empty;
    public string MaritalStatus { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = string.Empty;
    public string Languages { get; set; } = string.Empty;

    // Contact & Address
    public string StreetAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
    public string EmergencyContactRelation { get; set; } = string.Empty;

    // Professional & Credentials
    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseState { get; set; } = string.Empty;
    public string LicenseExpiry { get; set; } = string.Empty;
    public string NpiNumber { get; set; } = string.Empty;
    public string MedicalDegree { get; set; } = string.Empty;
    public string Experience { get; set; } = string.Empty;
    public bool TeleconsultationEnabled { get; set; } = true;

    // Permissions & Access
    public string AccessLevel { get; set; } = "Full Clinical Access";
    public bool PatientRecordsAccess { get; set; } = true;
    public bool PrescriptionRights { get; set; } = true;
    public bool CarePlanManagement { get; set; } = true;
    public bool AiOperations { get; set; } = true;

    public DoctorStatus Status { get; set; } = DoctorStatus.Active;

    // Navigations
    [JsonIgnore]
    public ICollection<Patient> PrimaryPatients { get; set; } = new List<Patient>();
    [JsonIgnore]
    public ICollection<CareTeamMember> CareTeamAssignments { get; set; } = new List<CareTeamMember>();
    [JsonIgnore]
    public ICollection<PatientDoctor> PatientDoctors { get; set; } = new List<PatientDoctor>();
}
