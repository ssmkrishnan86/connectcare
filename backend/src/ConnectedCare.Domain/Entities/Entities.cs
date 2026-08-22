using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public abstract class AuditableEntity
{
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; } = "System";
    public DateTime? UpdatedDate { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; } = "System";

    // Backward compatibility property
    public DateTime CreatedAtUtc
    {
        get => CreatedDate;
        set => CreatedDate = value;
    }
}

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

    // Assigned Nurse properties
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
    public string Temperature { get; set; } = "98.6 °F";
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

public class Doctor : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string DoctorIdCode { get; set; } = string.Empty; // e.g. DOC-1001
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string SpecialtyIcon { get; set; } = "🩺";
    public string Department { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DoctorStatus Status { get; set; } = DoctorStatus.Active;
    public string Experience { get; set; } = string.Empty;
    public bool TeleconsultationEnabled { get; set; } = true;

    // Navigations
    [JsonIgnore]
    public ICollection<Patient> PrimaryPatients { get; set; } = new List<Patient>();
    [JsonIgnore]
    public ICollection<CareTeamMember> CareTeamAssignments { get; set; } = new List<CareTeamMember>();
    [JsonIgnore]
    public ICollection<PatientDoctor> PatientDoctors { get; set; } = new List<PatientDoctor>();
}

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

    // Navigations
    [JsonIgnore]
    public ICollection<CareTeamMember> CareTeamAssignments { get; set; } = new List<CareTeamMember>();
    [JsonIgnore]
    public ICollection<PatientNurse> PatientNurses { get; set; } = new List<PatientNurse>();
}

public class PatientDoctor : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }
    public Guid DoctorId { get; set; }
    public Doctor? Doctor { get; set; }
    public bool IsPrimary { get; set; } = true;
    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    public string Notes { get; set; } = string.Empty;
}

public class PatientNurse : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }
    public Guid NurseId { get; set; }
    public Nurse? Nurse { get; set; }
    public bool IsPrimary { get; set; } = false;
    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    public string Shift { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public class CareTeamMember : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string MemberIdCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public CareTeamRole Role { get; set; } = CareTeamRole.Doctor;
    public string Department { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DoctorStatus Status { get; set; } = DoctorStatus.Active;
    public string Shift { get; set; } = string.Empty;

    // Foreign Keys
    public Guid? DoctorId { get; set; }
    public Doctor? Doctor { get; set; }
    public Guid? NurseId { get; set; }
    public Nurse? Nurse { get; set; }
    public Guid? PatientId { get; set; }
    public Patient? Patient { get; set; }
}

public class LocationUnit : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty; // e.g. LOC-001
    public string Name { get; set; } = string.Empty; // e.g. Main Hospital
    public string Avatar { get; set; } = string.Empty;
    public string Type { get; set; } = "Hospital"; // e.g. Hospital, Wing, Block, Specialty Center, Center, Clinic
    public string Facility { get; set; } = "Connected Care Hospital";
    public string FacilityLocation { get; set; } = "Chennai, Tamil Nadu";
    public int UnitsCount { get; set; } = 18;
    public int Beds { get; set; } = 220;
    public DoctorStatus Status { get; set; } = DoctorStatus.Active;
    public string Floor { get; set; } = "Ground Floor";
    public string Capacity { get; set; } = "220 Beds";
    public string Occupied { get; set; } = "180 Beds";
    public string OccupancyRate { get; set; } = "81.8%";
    public AlertSeverity AttentionPriority { get; set; } = AlertSeverity.Low;
}

public class Alert : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string AlertIdCode { get; set; } = string.Empty; // e.g. ALT-1001
    public string Title { get; set; } = string.Empty; // e.g. Fall Detected
    public string Description { get; set; } = string.Empty; // e.g. Patient fall detected in Room 305
    public Guid? PatientId { get; set; }
    public Patient? Patient { get; set; }
    public Guid? RecipientId { get; set; }
    public string RecipientRole { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string Type { get; set; } = "Patient Safety"; // e.g. Patient Safety, Vital Signs, Medication, Equipment, Admission, Care Plan, Lab Result
    public AlertSeverity Severity { get; set; } = AlertSeverity.Medium; // Critical, High, Medium, Low
    public string RoomLocation { get; set; } = string.Empty; // e.g. Room 302 • Cardiology
    public string ReportedBy { get; set; } = string.Empty; // e.g. Nurse Sarah Wilson
    public string ReportedByRole { get; set; } = string.Empty; // e.g. Nurse Sarah
    public string TriggerCondition { get; set; } = string.Empty;
    public string TimestampText { get; set; } = string.Empty; // e.g. May 22, 2024 08:05 AM
    public string Status { get; set; } = "New"; // New, In Progress, Pending, Resolved, Dismissed
    public bool IsAcknowledged { get; set; } = false;

    // Extra Details for Alert Detail Panel
    public string CareUnit { get; set; } = "Cardiology Unit";
    public string AgeGender { get; set; } = "68 Y • Female";
    public string BloodGroup { get; set; } = "A+";
    public string PatientType { get; set; } = "Inpatient";
    public string DetectedBy { get; set; } = "Monitor System";
    public string Source { get; set; } = "Bedside Monitor";
    public string Notes { get; set; } = "Patient complained of headache and dizziness.";
}

public class TaskItem : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TaskIdCode { get; set; } = string.Empty; // e.g. TSK-1001
    public string Title { get; set; } = string.Empty; // e.g. Review Admission Form
    public string Description { get; set; } = string.Empty; // e.g. Review and verify admission details
    public Guid? PatientId { get; set; }
    public Patient? Patient { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string TaskType { get; set; } = "Documentation"; // Documentation, Medication, Clinical Care, Care Activity, Care Coordination, Follow-up, Care Planning
    public TaskPriority Priority { get; set; } = TaskPriority.Medium; // High, Medium, Low
    public string AssignedCaregiver { get; set; } = string.Empty; // e.g. Nurse Sarah
    public string AssigneeRole { get; set; } = string.Empty; // e.g. Nursing
    public string AssigneeAvatar { get; set; } = string.Empty;
    public string DueTime { get; set; } = string.Empty; // e.g. May 19, 2025 10:00 AM
    public bool IsOverdue { get; set; } = false;
    public TaskStatusItem Status { get; set; } = TaskStatusItem.Pending; // Pending / Open, In Progress, Completed
    public string StatusStr { get; set; } = "Open"; // Open, In Progress, Completed
}

public class MedicationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string MedicationIdCode { get; set; } = string.Empty; // e.g. MED-1001
    public string Name { get; set; } = string.Empty; // e.g. Paracetamol 500mg
    public string Form { get; set; } = "Tablet"; // Tablet, Inhaler, Capsule, Solution
    public Guid? PatientId { get; set; }
    public Patient? Patient { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string Dosage { get; set; } = "500 mg";
    public string Route { get; set; } = "Oral"; // Oral, Inhalation, Intravenous
    public string Frequency { get; set; } = "Every 6 hours";
    public string NextDoseTime { get; set; } = "May 19, 2025 10:00 AM";
    public string RelativeTimeText { get; set; } = "in 1h 20m";
    public string Status { get; set; } = "Active"; // Active, Discontinued, On Hold
    public string PrescribedBy { get; set; } = "Dr. Michael Brown";
    public string PrescribedBySpecialty { get; set; } = "Physician";
    public string Batch { get; set; } = "Batch: AMX1256";
    public string ExpiryDateText { get; set; } = "May 22, 2025";
    public string DaysLeftText { get; set; } = "3 days left";
    public string Category { get; set; } = "Analgesic";
    public string AdherencePercentage { get; set; } = "95%";
    public int ActivePrescriptions { get; set; } = 156;
}

public class MedicationAdministrationRequest : AuditableEntity
{
    public Guid NurseId { get; set; }

    public string Status { get; set; } = "Given";

    public string? Notes { get; set; }
}

public class MedicationAdministration : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MedicationId { get; set; }
    public MedicationRecord? Medication { get; set; }

    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }

    public Guid NurseId { get; set; }
    public Nurse? Nurse { get; set; }

    public string Status { get; set; } = "Given";

    public string Notes { get; set; } = string.Empty;

    public DateTime AdministeredAt { get; set; } = DateTime.UtcNow;
}

public class MedicationReminder : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PatientName { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string MedicationName { get; set; } = string.Empty;
    public string DoseTimeText { get; set; } = string.Empty; // e.g. 10:00 AM
    public string RelativeTimeText { get; set; } = string.Empty; // e.g. in 1h 20m
}

public class DrugInteractionAlert : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Severity { get; set; } = "High";
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Count { get; set; } = 5;
    public string Status { get; set; } = "Requires review";
}

public class ActivitySummaryLog : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ActivityType { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string RelatedTo { get; set; } = string.Empty;
    public string LocationUnit { get; set; } = string.Empty;
    public string DateTimeText { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = string.Empty;
}

public class ClinicalEncounterRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DateText { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string EncounterType { get; set; } = "Outpatient";
    public string ProviderName { get; set; } = string.Empty;
    public string ReasonDiagnosis { get; set; } = string.Empty;
}

public class FinancialTransactionRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DateText { get; set; } = string.Empty;
    public string Type { get; set; } = "Payment Received";
    public string Reference { get; set; } = string.Empty;
    public string CustomerVendor { get; set; } = string.Empty;
    public string AmountText { get; set; } = string.Empty;
    public string Status { get; set; } = "Received";
}

public class CustomReportRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ReportName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string LastModifiedText { get; set; } = string.Empty;
    public string Frequency { get; set; } = "Daily"; // Daily, Weekly, Monthly
    public string Category { get; set; } = "General";
    public string Status { get; set; } = "Active";
}

public class IntegrationItemRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string SystemApplication { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // EHR, Laboratory, Pharmacy, Insurance, Communication, Payments, Finance, HR, Storage, Other
    public string Status { get; set; } = "Active"; // Active, Inactive, Failed
    public string LastSyncText { get; set; } = string.Empty;
    public string DataSyncRateText { get; set; } = string.Empty; // e.g. 99.8%
    public string Description { get; set; } = string.Empty;
    public string ConnectionType { get; set; } = "API";
    public string ConnectedOnText { get; set; } = string.Empty;
    public int DataLastSyncCount { get; set; } = 1245;
    public string DataLastSyncText { get; set; } = string.Empty;
    public string NextSyncText { get; set; } = string.Empty;
    public string IconLogo { get; set; } = "⚡";
    public string EndpointUrl { get; set; } = string.Empty;
    public string AuthType { get; set; } = "OAuth 2.0";
    public string SyncInterval { get; set; } = "Real-Time";
    public string Environment { get; set; } = "Production";
    public string SettingsJson { get; set; } = "{}";
}

public class IntegrationActivityLogRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DateTimeText { get; set; } = string.Empty;
    public string IntegrationName { get; set; } = string.Empty;
    public string Event { get; set; } = string.Empty;
    public string Status { get; set; } = "Success"; // Success, Failed
    public string Details { get; set; } = string.Empty;
    public string TriggeredBy { get; set; } = "System";
}

public class AuditLogEntryRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DateTimeText { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string Action { get; set; } = "CREATE"; // CREATE, UPDATE, DELETE, LOGIN, LOGIN_FAIL, EXPORT
    public string Module { get; set; } = "Resident";
    public string RecordDescription { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string Status { get; set; } = "Success"; // Success, Failed
    public string UserDetailsJson { get; set; } = "{}";
    public string ActionDetailsJson { get; set; } = "{}";
    public string TechDetailsJson { get; set; } = "{}";
    public string ChangesJson { get; set; } = "{}";
}

public class AiServiceStatusRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ServiceName { get; set; } = string.Empty;
    public string Status { get; set; } = "Healthy"; // Healthy, Degraded, Unhealthy
    public string ModelVersion { get; set; } = "gpt-4o";
    public string UptimePercentage { get; set; } = "99.9%";
}

public class AiWorkflowMetricRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string WorkflowName { get; set; } = string.Empty;
    public int RequestsCount { get; set; } = 4562;
    public string SuccessRate { get; set; } = "96.3%";
    public string AvgResponseTimeSeconds { get; set; } = "1.21 sec";
    public string TrendDataJson { get; set; } = "[]";
}

public class AiActivityLogRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TimeText { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string ResidentInfo { get; set; } = string.Empty;
    public string Type { get; set; } = "Success"; // Success, Warning, Error, Info
    public string Service { get; set; } = string.Empty;
}

public class UserSettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrganizationName { get; set; } = "Connected Care Senior Living";
    public string TimeZone { get; set; } = "(UTC-06:00) Central Time (US & Canada)";
    public string DateFormat { get; set; } = "MM/DD/YYYY";
    public string TimeFormat { get; set; } = "12 Hour (AM/PM)";
    public string Language { get; set; } = "English (US)";
    public int ItemsPerPage { get; set; } = 10;
}

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
    public string Currency { get; set; } = "INR (₹) - Indian Rupee";
    public string WeekStartsOn { get; set; } = "Monday";
    public bool EnableMultiLocation { get; set; } = true;
    public string EnabledModulesJson { get; set; } = "[]";
    public double Latitude { get; set; } = 13.0827;
    public double Longitude { get; set; } = 80.2707;
}

public class GeneralAppSettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrganizationName { get; set; } = "Connected Care Senior Living";
    public string Tagline { get; set; } = "Compassionate Care, Connected Life";
    public string LogoUrl { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = "#6B46C1";
    public string Phone { get; set; } = "+91 98765 43210";
    public string Email { get; set; } = "info@connectedcare.com";
    public string Address { get; set; } = "123, Care Street, Healthy City, Chennai - 600001, Tamil Nadu, India";
    public string DateFormat { get; set; } = "DD MMM YYYY (19 May 2025)";
    public string ShortDateFormat { get; set; } = "DD/MM/YYYY (19/05/2025)";
    public string DefaultLanguage { get; set; } = "English";
    public string TimeFormat { get; set; } = "12 Hour (05:30 PM)";
    public int ItemsPerPage { get; set; } = 20;
    public string WeekStartsOn { get; set; } = "Monday";
    public string DefaultDashboard { get; set; } = "Overview";
    public bool AllowPublicRegistration { get; set; } = true;
    public int SessionTimeoutMinutes { get; set; } = 30;
    public bool EnableAuditLogs { get; set; } = true;
    public int PasswordExpiryDays { get; set; } = 90;
    public bool EnableTwoFactorAuth { get; set; } = true;
    public bool MaintenanceMode { get; set; } = false;
    public string WeightUnit { get; set; } = "Kilograms (kg)";
    public string HeightUnit { get; set; } = "Centimeters (cm)";
    public string TemperatureUnit { get; set; } = "Celsius (°C)";
    public string Currency { get; set; } = "INR (₹) - Indian Rupee";
}

public class LocalizationSettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DefaultLanguage { get; set; } = "English (United States)";
    public string FallbackLanguage { get; set; } = "English (India)";
    public string DateFormat { get; set; } = "DD MMM YYYY (19 May 2025)";
    public string ShortDateFormat { get; set; } = "DD/MM/YYYY (19/05/2025)";
    public string TimeFormat { get; set; } = "12 Hour (05:30 PM)";
    public string WeekStartsOn { get; set; } = "Monday";
    public string TimeZone { get; set; } = "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi";
    public string PreviewRegion { get; set; } = "India";
    public string CalendarType { get; set; } = "Gregorian Calendar";
    public string SupportedLanguagesJson { get; set; } = "[]";
}

public class SecuritySettingsRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int MinPasswordLength { get; set; } = 8;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public bool RequireNumbers { get; set; } = true;
    public bool RequireSpecialChars { get; set; } = true;
    public int PasswordExpiryDays { get; set; } = 90;
    public string EnableMfaFor { get; set; } = "All Users"; // All Users, Administrators Only, None
    public bool MfaAuthenticatorApp { get; set; } = true;
    public bool MfaSmsVerification { get; set; } = true;
    public bool MfaEmailVerification { get; set; } = false;
    public int RememberMfaDays { get; set; } = 7;
    public int SessionTimeoutMinutes { get; set; } = 30;
    public int IdleTimeoutMinutes { get; set; } = 15;
    public bool ForceLogoutOnPasswordChange { get; set; } = true;
    public bool AllowMultipleActiveSessions { get; set; } = false;
    public int LockoutThreshold { get; set; } = 5;
    public int LockoutDurationMinutes { get; set; } = 15;
    public bool PreventUserEnumeration { get; set; } = true;
    public bool RequireEmailVerification { get; set; } = true;
    public bool RestrictLoginToRegisteredDevices { get; set; } = false;
    public bool AllowPasswordReset { get; set; } = true;
    public bool RestrictSpecificIps { get; set; } = true;
    public string AllowedIpsJson { get; set; } = "[\"203.0.113.10\", \"203.0.113.0/24\", \"198.51.100.15\"]";
}

public class BackupHistoryRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string BackupName { get; set; } = string.Empty;
    public string Type { get; set; } = "Full Backup"; // Full Backup, Database Only, Files Only
    public string Description { get; set; } = string.Empty;
    public string SizeText { get; set; } = string.Empty;
    public string CreatedOnText { get; set; } = string.Empty;
    public string Status { get; set; } = "Success"; // Success, Failed
}

public class SubscriptionPlanRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CurrentPlanName { get; set; } = "Professional Plan";
    public string Status { get; set; } = "Active";
    public string RenewalDateText { get; set; } = "Jun 19, 2025";
    public string AmountText { get; set; } = "$199.00 / month";
    public string PaymentMethod { get; set; } = "VISA **** **** 4242";
    public int ResidentsCurrent { get; set; } = 312;
    public int ResidentsLimit { get; set; } = 500;
    public int StaffCurrent { get; set; } = 48;
    public string StorageCurrentGb { get; set; } = "42.6";
    public int StorageLimitGb { get; set; } = 100;
    public int SmsCurrent { get; set; } = 1240;
    public int SmsLimit { get; set; } = 5000;
    public int ApiCurrent { get; set; } = 32500;
    public int ApiLimit { get; set; } = 100000;
}

public class BillingInvoiceRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string InvoiceNumber { get; set; } = string.Empty;
    public string DateText { get; set; } = string.Empty;
    public string AmountText { get; set; } = string.Empty;
    public string Status { get; set; } = "Paid";
}

public class UserAccountItemRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "System Administrator";
    public string Department { get; set; } = "Administration";
    public string Location { get; set; } = "Main Campus";
    public string Status { get; set; } = "Active"; // Active, Inactive, Pending, Locked
    public string LastSignInText { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
}

public class RoleDefinitionItemRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RoleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int UsersCount { get; set; } = 1;
    public string Status { get; set; } = "Active";
    public string CategoryBadge { get; set; } = "System Role";
    public string PermissionsMatrixJson { get; set; } = "{}";
}

public class NotificationTemplateItemRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TemplateName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Channel { get; set; } = "Email";
    public string TriggerEvent { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public bool IsEnabled { get; set; } = true;
}

public class SystemConfigToggleRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ConfigKey { get; set; } = string.Empty;
    public string ConfigLabel { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
}

public class SystemIntegration : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string SystemType { get; set; } = string.Empty;
    public string Status { get; set; } = "Connected";
    public string LastSyncTime { get; set; } = "Just now";
}

public class AuditLog : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string LogIdCode { get; set; } = string.Empty;
    public string User { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string TimestampText { get; set; } = string.Empty;
}

public class User : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Role { get; set; } = "Admin";
    public bool IsActive { get; set; } = true;

    // Navigations
    [JsonIgnore]
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    [JsonIgnore]
    public Doctor? Doctor { get; set; }
    [JsonIgnore]
    public Nurse? Nurse { get; set; }
}

public class AppRole : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RoleName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; } = true;

    // Navigations
    [JsonIgnore]
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    [JsonIgnore]
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class UserRole : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid RoleId { get; set; }
    public AppRole? Role { get; set; }
}

public class AppPermission : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PermissionKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class RolePermission : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RoleId { get; set; }
    public AppRole? Role { get; set; }
    public Guid? PermissionId { get; set; }
    public AppPermission? Permission { get; set; }
    public string PermissionKey { get; set; } = string.Empty;
    public string PermissionName { get; set; } = string.Empty;
}

public class MenuItem : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string MenuKey { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public string Icon { get; set; } = "LayoutDashboard";
    public int SortOrder { get; set; } = 0;
    public string RequiredPermission { get; set; } = string.Empty;
    public string RolesAllowedJson { get; set; } = "[\"Admin\"]";
    public string BadgeType { get; set; } = string.Empty; // count, text, new, none
    public string BadgeValue { get; set; } = string.Empty;
}

public class DoctorConsultation : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; } = "Dr. Sarah Wilson";
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string DateText { get; set; } = string.Empty;
    public string ConsultationType { get; set; } = "Follow-up";
    public string ChiefComplaint { get; set; } = string.Empty;
    public string Diagnosis { get; set; } = string.Empty;
    public string ClinicalNotes { get; set; } = string.Empty;
    public string Status { get; set; } = "Completed";
}

public class PatientCarePlanRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string ReviewDate { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; } = 0;
    public string GoalsText { get; set; } = string.Empty;
    public string NotesText { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public string PrescribedBy { get; set; } = "Dr. Sarah Wilson";
}

public class PatientDocumentRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string DocumentType { get; set; } = "MedicalDocuments"; // ProfilePicture, MedicalDocuments, OtherDocuments
    public string Category { get; set; } = "MedicalDocuments";
    public string FilePath { get; set; } = string.Empty; // Patient/{PatientId}/{DocumentType}/{FileName}
    public string ContentType { get; set; } = "application/pdf";
    public long FileSizeBytes { get; set; } = 0;
    public string UploadedDate { get; set; } = string.Empty;
    public string FileSizeText { get; set; } = "1.2 MB";
    public string UploadedBy { get; set; } = "Dr. Sarah Wilson";
}

public class DoctorAiConversation : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DoctorName { get; set; } = "Dr. Sarah Wilson";
    public string PatientName { get; set; } = "Robert Johnson";
    public string PatientIdCode { get; set; } = "PT-10001";
    public string PromptQuery { get; set; } = string.Empty;
    public string AiResponse { get; set; } = string.Empty;
    public string Category { get; set; } = "SOAP Note";
}

public class DischargeChecklistRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AdmitDateText { get; set; } = string.Empty;
    public string AdmitDaysText { get; set; } = string.Empty;
    public DischargeStatus ChecklistStatus { get; set; } = DischargeStatus.InProgress;
    public int ProgressPercentage { get; set; } = 70;
    public int PendingItemsCount { get; set; } = 2;
    public int TotalItemsCount { get; set; } = 14;
    public int CompletedItemsCount { get; set; } = 7;
    public int InProgressItemsCount { get; set; } = 4;
    public int NotStartedItemsCount { get; set; } = 1;
    public string ExpectedDischargeText { get; set; } = string.Empty;
    public string ExpectedDischargeRelative { get; set; } = "Today";
    public string AttendingDoctorName { get; set; } = "Dr. Sarah Wilson";
    public int CareTeamMembersCount { get; set; } = 3;
    public string Notes { get; set; } = string.Empty;
}

public class ConsultationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string ConsultationType { get; set; } = string.Empty; // e.g. Cardiology Consult
    public string ConsultationSubtitle { get; set; } = string.Empty; // e.g. Heart Failure
    public string ConsultationIcon { get; set; } = "HeartPulse";
    public Guid? PhysicianId { get; set; }
    public string PhysicianName { get; set; } = string.Empty;
    public string PhysicianRole { get; set; } = "Cardiologist";
    public string PhysicianAvatar { get; set; } = string.Empty;
    public string DateTimeText { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public ConsultationStatus Status { get; set; } = ConsultationStatus.InProgress;
    public string FollowUpDateText { get; set; } = string.Empty;
    public string ClinicalNotes { get; set; } = string.Empty;
    public bool IsLiked { get; set; } = false;
}

public class CarePlanRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string AttendingDoctorName { get; set; } = "Dr. Sarah Wilson";
    public int CareTeamMembersCount { get; set; } = 3;
    public string LengthOfStayText { get; set; } = "4 Days";
    public string PrimaryCondition { get; set; } = string.Empty; // e.g. Heart Failure
    public string ConditionIcon { get; set; } = "Heart";
    public string PlanTitle { get; set; } = string.Empty; // e.g. Heart Failure Management
    public int GoalCount { get; set; } = 6;
    public CarePlanStatus Status { get; set; } = CarePlanStatus.Active;
    public string StartDateText { get; set; } = string.Empty;
    public string ReviewDateText { get; set; } = string.Empty;
    public string ReviewDueBadge { get; set; } = "5 days left";
    public string AssignedNurseName { get; set; } = "Emma Johnson";
    public string AssignedNurseAvatar { get; set; } = string.Empty;
    public int OverallProgressPercentage { get; set; } = 78;
    public int CompletedTasksCount { get; set; } = 14;
    public int InProgressTasksCount { get; set; } = 8;
    public int NotStartedTasksCount { get; set; } = 4;
    public int OverdueTasksCount { get; set; } = 2;
    public string LastUpdatedText { get; set; } = "May 22, 2024 10:30 AM";
    public string NotesJson { get; set; } = "[]";
}

public class VitalRoundRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string RoomBed { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public PatientType PatientType { get; set; } = PatientType.Inpatient;
    public string AttendingDoctorName { get; set; } = "Dr. Sarah Wilson";
    public int CareTeamMembersCount { get; set; } = 3;
    public string LengthOfStayText { get; set; } = "4 Days";
    public string LastRoundTimeText { get; set; } = "08:00 AM";
    public string LastRoundDateText { get; set; } = "May 22, 2024";
    public string RecordedByNurseName { get; set; } = "Emma Johnson";
    public string NextDueTimeText { get; set; } = "12:00 PM";
    public string NextDueRelativeText { get; set; } = "Due in 1h 15m";
    public VitalRoundStatus Status { get; set; } = VitalRoundStatus.Pending;
    public string BloodPressure { get; set; } = "120/80 mmHg";
    public string HeartRate { get; set; } = "82 bpm";
    public string Temperature { get; set; } = "98.6 °F";
    public string SpO2 { get; set; } = "98 %";
    public string RespiratoryRate { get; set; } = "18 /min";
    public string PainScore { get; set; } = "2/10";
}

public class ShiftHandoverRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string HandoverIdCode { get; set; } = "SHO-1001";
    public string CurrentShift { get; set; } = "Day Shift (07:00 AM - 03:00 PM)";
    public string HandoverToShift { get; set; } = "Evening Shift (03:00 PM - 11:00 PM)";
    public string OutgoingNurseName { get; set; } = "Emma Johnson";
    public string OutgoingNurseRole { get; set; } = "Staff Nurse";
    public string OutgoingNurseAvatar { get; set; } = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80";
    public string IncomingNurseName { get; set; } = "Sophia Williams";
    public string IncomingNurseRole { get; set; } = "Staff Nurse";
    public string IncomingNurseAvatar { get; set; } = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";
    public int PatientsAssignedCount { get; set; } = 24;
    public int HighPriorityPatientsCount { get; set; } = 5;
    public int PendingTasksCount { get; set; } = 6;
    public int NewAlertsCount { get; set; } = 4;
    public int CompletedSectionsCount { get; set; } = 18;
    public int TotalSectionsCount { get; set; } = 24;
    public int CompletionPercentage { get; set; } = 75;
    public string HandoverNotes { get; set; } = "• Patricia's BP was high in the morning, medication adjusted.\n• Linda is experiencing mild pain, pain meds given.\n• James needs assistance while walking.\n• Room 502 patient (Robert Johnson) awaiting lab results.\n• All medications up to date.";
    public string Status { get; set; } = "Draft"; // Draft, Completed
    public string HandoverDateText { get; set; } = "May 22, 2024";
    public string HandoverTimeText { get; set; } = "02:45 PM";
}

public class ShiftHandoverPatientRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? HandoverId { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string ConditionStatus { get; set; } = "Stable"; // Stable, Improving, Post Op Day 2
    public string ConditionSubtitle { get; set; } = "BP controlled";
    public int PendingTasksCount { get; set; } = 2;
    public string SpecialInstructions { get; set; } = "Monitor BP every 4 hrs";
    public string Priority { get; set; } = "High"; // High, Medium, Low
}

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

public class NurseDocumentationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DocumentCode { get; set; } = string.Empty; // e.g. DOC-2024-0056
    public string DocumentName { get; set; } = string.Empty; // e.g. Nursing Care Note
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty; // e.g. Patricia Smith
    public string PatientIdCode { get; set; } = string.Empty; // e.g. PT-10001
    public string PatientAvatar { get; set; } = string.Empty;
    public string RoomLocation { get; set; } = string.Empty; // e.g. Room 302
    public string CareUnit { get; set; } = string.Empty; // e.g. Cardiology Unit
    public string AgeGender { get; set; } = string.Empty; // e.g. 68 Y • Female
    public string BloodGroup { get; set; } = string.Empty; // e.g. A+
    public string PatientType { get; set; } = "Inpatient";
    public string DocumentType { get; set; } = string.Empty; // Care Note, Assessment, Medication, Education, Report, Care Plan, Discharge Summary
    public string DateTimeText { get; set; } = string.Empty; // May 22, 2024 10:30 AM
    public string CreatedByName { get; set; } = "Emma Johnson";
    public string CreatedByRole { get; set; } = "Staff Nurse";
    public string Status { get; set; } = "Completed"; // Completed, Pending, Needs Review, Draft
    public bool IsDraft { get; set; } = false;
    public string NotesContent { get; set; } = string.Empty;
}

public class ChatConversationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ParticipantName { get; set; } = string.Empty; // e.g. Dr. Sarah Wilson
    public string ParticipantRole { get; set; } = string.Empty; // e.g. Cardiologist / Attending Doctor
    public string ParticipantAvatar { get; set; } = string.Empty;
    public bool IsOnline { get; set; } = true;
    public string LastMessageText { get; set; } = string.Empty;
    public string LastMessageTimeText { get; set; } = string.Empty; // e.g. 10:30 AM
    public int UnreadCount { get; set; } = 0;
    public bool IsGroup { get; set; } = false;
    public string Category { get; set; } = "All"; // All, Unread, Mentions

    // Shared Patient Details
    public string SharedPatientName { get; set; } = "Patricia Smith";
    public string SharedPatientIdCode { get; set; } = "PT-10001";
    public string SharedPatientRoom { get; set; } = "Room 302";
    public string SharedPatientCareUnit { get; set; } = "Cardiology Unit";
    public string SharedPatientStatus { get; set; } = "In Progress";
    public string SharedPatientAvatar { get; set; } = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80";
}

public class ChatMessageRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public string SenderName { get; set; } = string.Empty; // e.g. Dr. Sarah Wilson or Emma Johnson
    public string SenderRole { get; set; } = string.Empty;
    public string SenderAvatar { get; set; } = string.Empty;
    public string MessageText { get; set; } = string.Empty;
    public string TimeText { get; set; } = string.Empty; // e.g. 10:20 AM
    public bool IsMe { get; set; } = false;
    public bool IsUnread { get; set; } = false;
}

public class NurseReportRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ReportName { get; set; } = string.Empty; // e.g. Patient Care Summary
    public string ReportType { get; set; } = string.Empty; // Patient Report, Clinical Report, Medication Report, Operational Report, Quality & Safety
    public string Description { get; set; } = string.Empty; // Summary of patient care activities and outcomes
    public string GeneratedByName { get; set; } = "Emma Johnson";
    public string GeneratedByRole { get; set; } = "Staff Nurse";
    public string GeneratedOnText { get; set; } = "May 22, 2024 10:30 AM";
    public string Format { get; set; } = "PDF"; // PDF, Excel
    public string CategoryTab { get; set; } = "Overview";
    public string CareUnit { get; set; } = "All Units / Floors";
    public string PatientName { get; set; } = "All Patients";
    public string Shift { get; set; } = "All Shift";
}
public class MedicationAdministrationRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MedicationId { get; set; }
    public MedicationRecord? Medication { get; set; }

    public Guid? NurseId { get; set; }

    public string Status { get; set; } = "Given";

    public string Notes { get; set; } = string.Empty;

    public string AdministeredAtText { get; set; } = string.Empty;

    public string NurseName { get; set; } = string.Empty;
}


