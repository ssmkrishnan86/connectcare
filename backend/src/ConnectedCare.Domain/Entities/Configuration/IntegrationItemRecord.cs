using System.Text.Json.Serialization;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class IntegrationItemRecord : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string SystemApplication { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // EHR, Laboratory, Pharmacy, Insurance, Communication, Payments, Finance, HR, Storage, Other
    public string Status { get; set; } = "Active"; // Active, Inactive, Failed
    public string LastSyncText { get; set; } = string.Empty;
    public string DataSyncRateText { get; set; } = string.Empty; // e.g. 99.8%
    public string Description { get; set; } = string.Empty;
    public string ConnectionType { get; set; } = "API";
    public string ConnectedOnText { get; set; } = string.Empty;
    public int DataLastSyncCount { get; set; } = 1245;
    public string DataLastSyncText { get; set; } = string.Empty;
    public string NextSyncText { get; set; } = string.Empty;
    public string IconLogo { get; set; } = "âš¡";
    public string EndpointUrl { get; set; } = string.Empty;
    public string AuthType { get; set; } = "OAuth 2.0";
    public string SyncInterval { get; set; } = "Real-Time";
    public string Environment { get; set; } = "Production";
    public string SettingsJson { get; set; } = "{}";
}
