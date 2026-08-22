using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

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
