using System.Net;
using System.Text.Json;
using ConnectedCare.Application.Common.Models;

namespace ConnectedCare.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An unhandled exception occurred: {Message}",
                ex.Message);

            Console.Error.WriteLine("========== UNHANDLED EXCEPTION ==========");
            Console.Error.WriteLine(ex.ToString());
            Console.Error.WriteLine("=========================================");

            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(
        HttpContext context,
        Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var message = _environment.IsDevelopment()
            ? exception.ToString()
            : "An internal server error occurred.";

        var response = ApiResponse<string>.Fail(
            message: message,
            errorCode: "INTERNAL_SERVER_ERROR"
        );

        var json = JsonSerializer.Serialize(
            response,
            new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

        return context.Response.WriteAsync(json);
    }
}
