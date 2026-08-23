namespace ConnectedCare.Application.Features.Doctors.DTOs;

public class UpdateDoctorRequest
{
    public string? Name { get; set; }
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? Specialty { get; set; }
    public string? SpecialtyIcon { get; set; }
    public string? Department { get; set; }
    public string? Role { get; set; }
    public string? EmploymentType { get; set; }
    public string? ReportingTo { get; set; }
    public string? DateOfJoining { get; set; }
    public string? Location { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Gender { get; set; }
    public string? Dob { get; set; }
    public string? MaritalStatus { get; set; }
    public string? BloodGroup { get; set; }
    public string? Languages { get; set; }
    public string? StreetAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelation { get; set; }
    public string? LicenseNumber { get; set; }
    public string? LicenseState { get; set; }
    public string? LicenseExpiry { get; set; }
    public string? NpiNumber { get; set; }
    public string? MedicalDegree { get; set; }
    public string? Experience { get; set; }
    public string? AccessLevel { get; set; }
    public bool? PatientRecordsAccess { get; set; }
    public bool? PrescriptionRights { get; set; }
    public bool? CarePlanManagement { get; set; }
    public bool? AiOperations { get; set; }
    public string? Status { get; set; }
    public bool? TeleconsultationEnabled { get; set; }
    public string? Avatar { get; set; }
}
