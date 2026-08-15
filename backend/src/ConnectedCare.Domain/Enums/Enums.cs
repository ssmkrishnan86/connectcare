namespace ConnectedCare.Domain.Enums;

public enum PatientStatus
{
    InCare,
    Admitted,
    Discharged,
    Inactive
}

public enum AlertSeverity
{
    Critical,
    High,
    Medium,
    Low
}

public enum TaskPriority
{
    High,
    Medium,
    Low
}

public enum TaskStatusItem
{
    Pending,
    InProgress,
    Completed
}

public enum CareTeamRole
{
    Doctor,
    Nurse,
    AlliedHealth,
    SupportStaff
}

public enum DoctorStatus
{
    Active,
    OnLeave,
    Inactive
}
