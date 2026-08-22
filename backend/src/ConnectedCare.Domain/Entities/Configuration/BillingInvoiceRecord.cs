using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class BillingInvoiceRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string InvoiceNumber { get; set; } = string.Empty;
    public string DateText { get; set; } = string.Empty;
    public string AmountText { get; set; } = string.Empty;
    public string Status { get; set; } = "Paid";
}
