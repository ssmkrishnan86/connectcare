namespace ConnectCare.AutomationTests.Helpers;

public static class TestSettings
{
    public static string Get(string name, string fallback)
    {
        // Keep configuration simple and compatible with the installed MSTest version.
        // Environment variables can override the defaults without depending on
        // MSTest TestContext.Parameters support.
        var value = Environment.GetEnvironmentVariable($"CONNECTCARE_{name}");
        return string.IsNullOrWhiteSpace(value) ? fallback : value;
    }
}
