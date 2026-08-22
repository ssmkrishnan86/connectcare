namespace ConnectedCare.Application.Features.Diagnoses.DTOs;

public sealed class CreateDiagnosisRequest
{
    public Guid PatientId { get; set; }

    public Guid DoctorId { get; set; }

    public string Diagnosis { get; set; } = string.Empty;

    public string? ClinicalNotes { get; set; }
}
