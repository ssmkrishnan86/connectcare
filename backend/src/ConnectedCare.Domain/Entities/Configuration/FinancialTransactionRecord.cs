using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

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
