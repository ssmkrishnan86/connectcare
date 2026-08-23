using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Domain.Entities;

public class CareUnit : AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Type { get; set; } = "Inpatient";

    public string Floor { get; set; } = string.Empty;

    public Guid? LocationUnitId { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; } = 0;
}
