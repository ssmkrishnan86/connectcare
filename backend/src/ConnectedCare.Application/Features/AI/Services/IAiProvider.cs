using System.Threading;
using System.Threading.Tasks;

namespace ConnectedCare.Application.Features.AI.Services;

public class AiPromptRequest
{
    public string SystemPrompt { get; set; } = string.Empty;
    public string UserPrompt { get; set; } = string.Empty;
    public string? ResponseFormatJsonSchema { get; set; }
    public double Temperature { get; set; } = 0.2; // Low temperature for clinical accuracy
    public int MaxTokens { get; set; } = 2000;
    public string? PreferredModel { get; set; }
}

public class AiPromptResponse
{
    public string Content { get; set; } = string.Empty;
    public string ModelUsed { get; set; } = "gpt-4o";
    public string ProviderUsed { get; set; } = "OpenAI";
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
    public int TotalTokens { get; set; }
    public long LatencyMs { get; set; }
    public bool IsSuccess { get; set; } = true;
    public string? ErrorMessage { get; set; }
    public bool IsFallback { get; set; }
}

public interface IAiProvider
{
    Task<AiPromptResponse> ExecutePromptAsync(AiPromptRequest request, CancellationToken cancellationToken = default);
}
