using System.Net;

namespace ConnectCare.AutomationTests.Helpers;

public sealed class AuthHelper
{
    private readonly ApiClient _api;

    public AuthHelper(ApiClient api) => _api = api;

    public async Task<string> LoginAsync(string username, string password, string role)
    {
        var (status, body) = await _api.PostAsync("api/auth/login", new
        {
            username,
            password,
            role
        });

        if (status != HttpStatusCode.OK)
            throw new InvalidOperationException(
                $"Login failed for {role}/{username}: {(int)status} {status} {body.RootElement}");

        var data = ApiClient.Data(body);
        var token = ApiClient.String(data, "token");

        if (string.IsNullOrWhiteSpace(token))
            throw new InvalidOperationException(
                $"Login response did not contain token: {body.RootElement}");

        _api.SetBearerToken(token);
        return token;
    }
}
