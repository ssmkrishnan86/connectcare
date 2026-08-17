using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Infrastructure.Repositories;
using ConnectedCare.Application.Common.Interfaces;
using ConnectedCare.Application.Services;
using ConnectedCare.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add Services & Configure Json Options to Ignore Cycles
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
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure EF Core Context for PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ConnectedCareDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseInMemoryDatabase("ConnectedCareDb");
    }
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
app.UseAuthorization();
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger"));

// Automated Database Setup & Seeding on Startup
var logger = app.Services.GetRequiredService<ILogger<Program>>();
await DatabaseInitializer.InitializeDatabaseAsync(app.Services, connectionString ?? "", logger);

app.Run();
