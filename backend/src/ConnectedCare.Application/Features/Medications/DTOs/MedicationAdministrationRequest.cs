namespace ConnectedCare.Application.Features.Medications.DTOs;

public class MedicationAdministrationRequest
{
    public Guid NurseId { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}
