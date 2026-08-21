using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ConnectCare.AutomationTests.Helpers;

public sealed class ApiClient
{
    private readonly HttpClient _http;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    public ApiClient(string baseUrl)
    {
        _http = new HttpClient
        {
            BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/")
        };
    }

    public void SetBearerToken(string token)
        => _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

    public async Task<(HttpStatusCode Status, JsonDocument Body)> SendAsync(
        HttpMethod method, string route, object? payload = null)
    {
        using var request = new HttpRequestMessage(method, route);

        if (payload is not null)
        {
            request.Content = new StringContent(
                JsonSerializer.Serialize(payload, JsonOptions),
                Encoding.UTF8,
                "application/json");
        }

        using var response = await _http.SendAsync(request);
        var text = await response.Content.ReadAsStringAsync();

        JsonDocument body;
        try
        {
            body = JsonDocument.Parse(string.IsNullOrWhiteSpace(text) ? "{}" : text);
        }
        catch
        {
            body = JsonDocument.Parse(JsonSerializer.Serialize(new { raw = text }));
        }

        return (response.StatusCode, body);
    }

    public Task<(HttpStatusCode, JsonDocument)> GetAsync(string route)
        => SendAsync(HttpMethod.Get, route);

    public Task<(HttpStatusCode, JsonDocument)> PostAsync(string route, object? payload = null)
        => SendAsync(HttpMethod.Post, route, payload);

    public static JsonElement Data(JsonDocument body)
        => body.RootElement.TryGetProperty("data", out var data) ? data : body.RootElement;

    public static string? String(JsonElement element, string property)
        => element.TryGetProperty(property, out var p) && p.ValueKind != JsonValueKind.Null
            ? p.ToString()
            : null;
}
