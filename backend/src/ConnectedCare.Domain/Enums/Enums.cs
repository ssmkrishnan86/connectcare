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

public enum DischargeStatus
{
    InProgress,
    Ready,
    PendingItems,
    Discharged,
    Cancelled
}

public enum ConsultationStatus
{
    InProgress,
    Completed,
    Scheduled,
    FollowUpDue
}

public enum CarePlanStatus
{
    Active,
    ReviewDue,
    Completed,
    Draft
}

public enum VitalRoundStatus
{
    Completed,
    Pending,
    Overdue
}

public enum PatientType
{
    Inpatient,
    Outpatient
}
