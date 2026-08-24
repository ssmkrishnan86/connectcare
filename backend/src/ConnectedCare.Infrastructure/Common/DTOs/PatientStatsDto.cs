namespace ConnectedCare.Infrastructure.Common.DTOs;

public class PatientStatsDto
{
    public int AllPatients { get; set; }
    public int InCare { get; set; }
    public int Admitted { get; set; }
    public int Discharged { get; set; }
    public int Inactive { get; set; }
    public int NewThisMonth { get; set; }
}
