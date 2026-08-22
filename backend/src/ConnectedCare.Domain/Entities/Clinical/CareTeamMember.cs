using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

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
