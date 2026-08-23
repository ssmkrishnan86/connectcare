namespace ConnectedCare.Application.Features.Nurses.DTOs;

public class UpdateNurseRequest
{
    public string? Name { get; set; }
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? Gender { get; set; }
    public string? Dob { get; set; }
    public string? MaritalStatus { get; set; }
    public string? BloodGroup { get; set; }
    public string? Languages { get; set; }
    public string? Department { get; set; }
    public string? SubUnit { get; set; }
    public string? Role { get; set; }
    public string? EmploymentType { get; set; }
    public string? ReportingTo { get; set; }
    public string? DateOfJoining { get; set; }
    public string? Location { get; set; }
    public string? Shift { get; set; }
    public string? AssignedUnit { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? StreetAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? LicenseNumber { get; set; }
    public string? LicenseState { get; set; }
    public string? LicenseExpiry { get; set; }
    public string? Certifications { get; set; }
    public string? Experience { get; set; }
    public bool? CarePlanUpdates { get; set; }
    public bool? VitalMonitoring { get; set; }
    public bool? MedicationAdministration { get; set; }
    public bool? ShiftHandover { get; set; }
    public string? Status { get; set; }
    public string? Avatar { get; set; }
}
