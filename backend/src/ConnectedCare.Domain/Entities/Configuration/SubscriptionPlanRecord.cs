using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

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
