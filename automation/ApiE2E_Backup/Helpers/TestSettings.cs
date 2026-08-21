using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ConnectCare.AutomationTests.Helpers;

public static class TestSettings
{
    public static string Get(string name, string fallback)
    {
        var value = TestContext.Parameters[name];
        return string.IsNullOrWhiteSpace(value) ? fallback : value;
    }
}
