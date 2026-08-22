using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class Patient : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PatientIdCode { get; set; } = string.Empty; // e.g. P-0002
    public string Mrn { get; set; } = string.Empty; // e.g. MRN-002345
    public string Name { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Dob { get; set; } = string.Empty;
    public string Gender { get; set; } = "Female";
    public string AgeGender { get; set; } = string.Empty;
    public string BloodType { get; set; } = "O+";
    public string MaritalStatus { get; set; } = "Married";
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string FloorRoom { get; set; } = string.Empty;
    
    // Emergency Contact
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactRelationship { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
    public bool EmergencyContactIsPrimary { get; set; } = true;

    // Medical Info
    public string MedicalConditions { get; set; } = string.Empty;
    public string Allergies { get; set; } = string.Empty;
    public string CurrentMedications { get; set; } = string.Empty;
    public string PastMedicalHistory { get; set; } = string.Empty;

    // Insurance
    public string InsuranceProvider { get; set; } = string.Empty;
    public string InsurancePolicyNumber { get; set; } = string.Empty;
    public string InsuranceGroupNumber { get; set; } = string.Empty;
    public string InsuranceValidUntil { get; set; } = string.Empty;

    // Notes
    public string AdditionalNotes { get; set; } = string.Empty;
    
    // Primary Doctor FK
    public Guid? PrimaryDoctorId { get; set; }
    public Doctor? PrimaryDoctor { get; set; }
    public string PrimaryDoctorName { get; set; } = string.Empty;
    public string PrimaryDoctorSpecialty { get; set; } = string.Empty;
    public string PrimaryDoctorAvatar { get; set; } = string.Empty;

    // Assigned Nurse
    public Guid? AssignedNurseId { get; set; }
    public string AssignedNurseName { get; set; } = string.Empty;

    public PatientStatus Status { get; set; } = PatientStatus.InCare;
    public AlertSeverity RiskLevel { get; set; } = AlertSeverity.Medium;
    public string LastVisit { get; set; } = string.Empty;
    public string AdmissionDate { get; set; } = string.Empty;
    public int CareDays { get; set; } = 1;
    public string DischargePlan { get; set; } = "Not Scheduled";
    
    // Vitals
    public string BloodPressure { get; set; } = "120/80 mmHg";
    public string HeartRate { get; set; } = "72 bpm";
    public string BloodSugar { get; set; } = "110 mg/dL";
    public string Temperature { get; set; } = "98.6 Â°F";
    public string SpO2 { get; set; } = "98 %";
    
    // Navigations
    [JsonIgnore]
    public ICollection<Alert> Alerts { get; set; } = new List<Alert>();
    [JsonIgnore]
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    [JsonIgnore]
    public ICollection<MedicationRecord> Medications { get; set; } = new List<MedicationRecord>();
    [JsonIgnore]
    public ICollection<CareTeamMember> CareTeamMembers { get; set; } = new List<CareTeamMember>();
    [JsonIgnore]
    public ICollection<PatientDoctor> PatientDoctors { get; set; } = new List<PatientDoctor>();
    [JsonIgnore]
    public ICollection<PatientNurse> PatientNurses { get; set; } = new List<PatientNurse>();
}
