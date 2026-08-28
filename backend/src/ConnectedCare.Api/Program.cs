using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Infrastructure.Repositories;
using ConnectedCare.Infrastructure.Common.Interfaces;
using ConnectedCare.Application.Features.VitalRounds.Services;
using ConnectedCare.Application.Features.CarePlans.Services;
using ConnectedCare.Application.Features.Consultations.Services;
using ConnectedCare.Application.Features.DischargeChecklists.Services;
using ConnectedCare.Application.Features.Dashboard.Services;
using ConnectedCare.Application.Features.Tasks.Services;
using ConnectedCare.Application.Features.Alerts.Services;
using ConnectedCare.Application.Features.CareTeams.Services;
using ConnectedCare.Application.Features.Doctors.Services;
using ConnectedCare.Application.Features.Patients.Services;
using ConnectedCare.Application.Features.CustomReports.Services;
using ConnectedCare.Application.Features.Notifications.Services;
using ConnectedCare.Api.Middleware;

// Prevent Linux inotify limit crashes in cloud container runtimes (Render, AWS, Kubernetes)
Environment.SetEnvironmentVariable("DOTNET_USE_POLLING_FILE_WATCHER", "true");
Environment.SetEnvironmentVariable("ASPNETCORE_USE_POLLING_FILE_WATCHER", "true");

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory
});

// Configure Dynamic Cloud Port (e.g. Render / Koyeb / Railway)
var envPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(envPort))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{envPort}");
}

// Add Services & Configure Json Options to Ignore Cycles
builder.Services.AddHttpContextAccessor();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS Configuration for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ============================================================
// JWT Authentication
// ============================================================

var jwtSecret = builder.Configuration["Jwt:SecretKey"]
    ?? "SuperSecretKeyForConnectedCareAdminPortalHospitalSystem2026";

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? "ConnectedCare";

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? "ConnectedCare.Web";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret.PadRight(64, '0'))
            ),

            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateLifetime = true,

            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// Configure EF Core Context for PostgreSQL (Support cloud DATABASE_URL or ConnectionStrings:DefaultConnection)
var rawConnectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "postgresql://admin:2KUCdnEH3UlA5mbzFdEmg7QBnog8UvlP@dpg-da7hf16417fc7391lpsg-a/connect_care";

var connectionString = ParsePostgreSqlConnectionString(rawConnectionString);

Console.WriteLine($"[DB_STARTUP] Using PostgreSQL Host: {new Npgsql.NpgsqlConnectionStringBuilder(connectionString).Host}");

builder.Services.AddDbContext<ConnectedCareDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// Dependency Injection - Repositories
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<ICareTeamRepository, CareTeamRepository>();
builder.Services.AddScoped<IAlertRepository, AlertRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<IDischargeChecklistRepository, DischargeChecklistRepository>();
builder.Services.AddScoped<IConsultationRepository, ConsultationRepository>();
builder.Services.AddScoped<ICarePlanRepository, CarePlanRepository>();
builder.Services.AddScoped<IVitalRoundRepository, VitalRoundRepository>();
builder.Services.AddScoped<ICustomReportRepository, CustomReportRepository>();

// Dependency Injection - Services
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<ICareTeamService, CareTeamService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IDischargeChecklistService, DischargeChecklistService>();
builder.Services.AddScoped<IConsultationService, ConsultationService>();
builder.Services.AddScoped<ICarePlanService, CarePlanService>();
builder.Services.AddScoped<IVitalRoundService, VitalRoundService>();
builder.Services.AddScoped<ICustomReportService, CustomReportService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

var app = builder.Build();

// Enable Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Enable Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Connected Care API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowReactApp");

// Enable Static Files for Production React SPA
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback to React SPA index.html for client routing
app.MapFallbackToFile("index.html");

// Automated Database Setup & Seeding on Startup
var logger = app.Services.GetRequiredService<ILogger<Program>>();
await DatabaseInitializer.InitializeDatabaseAsync(app.Services, connectionString ?? "", logger);

app.Run();

// Helper method to convert postgres:// URI from cloud providers to Npgsql connection string
static string ParsePostgreSqlConnectionString(string input)
{
    if (string.IsNullOrWhiteSpace(input)) return input;
    if (input.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
        input.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        try
        {
            var uri = new Uri(input);
            var userInfo = uri.UserInfo.Split(':');
            var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.AbsolutePath.TrimStart('/');

            var builder = new Npgsql.NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = port,
                Database = database,
                Username = username,
                Password = password,
                SslMode = Npgsql.SslMode.Prefer
            };
            return builder.ConnectionString;
        }
        catch
        {
            return input;
        }
    }
    return input;
}
