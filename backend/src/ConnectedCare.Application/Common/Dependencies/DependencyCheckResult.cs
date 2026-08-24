namespace ConnectedCare.Application.Common.Dependencies;

public class DependencyCheckResult
{
    public bool HasDependencies => Dependencies.Count > 0;

    public List<string> Dependencies { get; set; } = new();

    public string Message =>
        HasDependencies
            ? $"This record cannot be deleted because it has the following dependencies: {string.Join(", ", Dependencies)}."
            : string.Empty;
}
