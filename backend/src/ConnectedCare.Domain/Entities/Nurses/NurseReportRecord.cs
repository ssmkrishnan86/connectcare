using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

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
