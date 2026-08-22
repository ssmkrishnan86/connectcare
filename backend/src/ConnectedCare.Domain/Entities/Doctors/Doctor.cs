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
    public string Avatar { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string SpecialtyIcon { get; set; } = "ðŸ©º";
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
