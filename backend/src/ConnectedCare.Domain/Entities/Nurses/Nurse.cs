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

    // Navigations
    [JsonIgnore]
    public ICollection<CareTeamMember> CareTeamAssignments { get; set; } = new List<CareTeamMember>();
    [JsonIgnore]
    public ICollection<PatientNurse> PatientNurses { get; set; } = new List<PatientNurse>();
}
