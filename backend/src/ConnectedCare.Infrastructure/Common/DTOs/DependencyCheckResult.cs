namespace ConnectedCare.Infrastructure.Common.DTOs;

public class DependencyCheckResult
{
    public bool HasDependencies => Dependencies.Count > 0;

    public List<string> Dependencies { get; set; } = new();
}
