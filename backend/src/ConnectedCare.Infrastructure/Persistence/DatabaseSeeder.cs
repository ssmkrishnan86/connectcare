using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Security;
using Microsoft.EntityFrameworkCore;

namespace ConnectedCare.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ConnectedCareDbContext context)
    {
        // 1. Seed Default Location Units if table is empty
        if (!await context.LocationUnits.AnyAsync())
        {
            var defaultLocations = new List<LocationUnit>
            {
                new LocationUnit { Code = "LOC-001", Name = "Main Hospital", Type = "Hospital", Facility = "Connected Care Hospital", FacilityLocation = "Austin, TX", UnitsCount = 18, Beds = 220, Status = DoctorStatus.Active, Floor = "Ground Floor", Capacity = "220 Beds", Occupied = "180 Beds", OccupancyRate = "81.8%", AttentionPriority = AlertSeverity.Low },
                new LocationUnit { Code = "LOC-002", Name = "West Wing Clinic", Type = "Wing", Facility = "Connected Care Hospital", FacilityLocation = "Austin, TX", UnitsCount = 8, Beds = 95, Status = DoctorStatus.Active, Floor = "1st Floor", Capacity = "95 Beds", Occupied = "72 Beds", OccupancyRate = "75.8%", AttentionPriority = AlertSeverity.Low },
                new LocationUnit { Code = "LOC-003", Name = "Care Center – North", Type = "Specialty Center", Facility = "North Campus", FacilityLocation = "Round Rock, TX", UnitsCount = 12, Beds = 150, Status = DoctorStatus.Active, Floor = "Ground Floor", Capacity = "150 Beds", Occupied = "118 Beds", OccupancyRate = "78.7%", AttentionPriority = AlertSeverity.Low },
                new LocationUnit { Code = "LOC-004", Name = "Downtown Medical Plaza", Type = "Clinic", Facility = "Metro Center", FacilityLocation = "Austin, TX", UnitsCount = 6, Beds = 50, Status = DoctorStatus.Active, Floor = "2nd Floor", Capacity = "50 Beds", Occupied = "35 Beds", OccupancyRate = "70.0%", AttentionPriority = AlertSeverity.Low },
                new LocationUnit { Code = "LOC-005", Name = "Rehabilitation Center", Type = "Center", Facility = "Rehab Pavilion", FacilityLocation = "Cedar Park, TX", UnitsCount = 10, Beds = 80, Status = DoctorStatus.Active, Floor = "Ground Floor", Capacity = "80 Beds", Occupied = "64 Beds", OccupancyRate = "80.0%", AttentionPriority = AlertSeverity.Low }
            };
            context.LocationUnits.AddRange(defaultLocations);
            await context.SaveChangesAsync();
        }

        // 2. Seed Default Care Units if table is empty
        if (!await context.CareUnits.AnyAsync())
        {
            var defaultCareUnits = new List<CareUnit>
            {
                new CareUnit { Code = "CU-101", Name = "Cardiology Unit", Department = "Cardiology", Type = "Inpatient", Floor = "4th Floor", IsActive = true, DisplayOrder = 1 },
                new CareUnit { Code = "CU-102", Name = "Emergency Unit", Department = "Emergency Medicine", Type = "Emergency", Floor = "1st Floor", IsActive = true, DisplayOrder = 2 },
                new CareUnit { Code = "CU-103", Name = "ICU - Intensive Care", Department = "Critical Care", Type = "ICU", Floor = "3rd Floor", IsActive = true, DisplayOrder = 3 },
                new CareUnit { Code = "CU-104", Name = "Neurology Unit", Department = "Neurology", Type = "Inpatient", Floor = "5th Floor", IsActive = true, DisplayOrder = 4 },
                new CareUnit { Code = "CU-105", Name = "Pediatric Ward", Department = "Pediatrics", Type = "Inpatient", Floor = "2nd Floor", IsActive = true, DisplayOrder = 5 },
                new CareUnit { Code = "CU-106", Name = "Orthopedic Unit", Department = "Orthopedics", Type = "Inpatient", Floor = "4th Floor", IsActive = true, DisplayOrder = 6 },
                new CareUnit { Code = "CU-107", Name = "General Medicine", Department = "Internal Medicine", Type = "Inpatient", Floor = "2nd Floor", IsActive = true, DisplayOrder = 7 },
                new CareUnit { Code = "CU-108", Name = "Surgical Unit", Department = "General Surgery", Type = "Surgical", Floor = "3rd Floor", IsActive = true, DisplayOrder = 8 },
                new CareUnit { Code = "CU-109", Name = "Maternity Unit", Department = "Obstetrics & Gynecology", Type = "Maternity", Floor = "2nd Floor", IsActive = true, DisplayOrder = 9 },
                new CareUnit { Code = "CU-110", Name = "Outpatient Clinic", Department = "Ambulatory Care", Type = "Outpatient", Floor = "1st Floor", IsActive = true, DisplayOrder = 10 }
            };
            context.CareUnits.AddRange(defaultCareUnits);
            await context.SaveChangesAsync();
        }

        // 3. Seed Organization Settings if table is empty
        if (!await context.OrganizationSettingsRecords.AnyAsync())
        {
            context.OrganizationSettingsRecords.Add(new OrganizationSettingsRecord
            {
                OrganizationName = "Connected Care Senior Living",
                LogoUrl = "",
                Tagline = "Compassionate Care, Connected Life",
                PrimaryColor = "#6B46C1",
                Phone = "+1 (512) 555-0100",
                Address = "100 Hospital Drive, Suite 400, Austin, TX 78705, USA",
                Email = "info@connectedcare.com",
                OrganizationType = "Senior Living / Assisted Living",
                RegistrationNumber = "TX-HSP-2018-55671",
                EstablishedYear = "2018",
                Website = "https://www.connectedcare.com",
                PrimaryContactPerson = "John Admin",
                PrimaryContactDesignation = "Administrator",
                PrimaryContactEmail = "admin@connectedcare.com",
                PrimaryContactPhone = "(512) 555-0100",
                PrimaryContactAlternatePhone = "(512) 555-0199",
                AddressLine1 = "100 Hospital Drive",
                AddressLine2 = "Suite 400",
                City = "Austin",
                State = "Texas",
                PinCode = "78705",
                Country = "United States",
                DefaultTimeZone = "(UTC-06:00) Central Time (US & Canada)",
                DefaultLanguage = "English (United States)",
                DefaultDateFormat = "MM/DD/YYYY",
                DefaultTimeFormat = "12 Hour (AM/PM)",
                Currency = "USD ($) - US Dollar",
                WeekStartsOn = "Sunday",
                EnableMultiLocation = true,
                EnabledModulesJson = "[\"Residents\", \"Care & Clinical\", \"Medication\", \"Billing & Finance\", \"Reports & Analytics\", \"Alerts & Incidents\", \"Tasks & Activities\", \"Document Management\"]",
                Latitude = 30.2672,
                Longitude = -97.7431
            });
            await context.SaveChangesAsync();
        }

        // 4. Seed General App Settings if table is empty
        if (!await context.GeneralAppSettingsRecords.AnyAsync())
        {
            context.GeneralAppSettingsRecords.Add(new GeneralAppSettingsRecord
            {
                OrganizationName = "Connected Care Senior Living",
                Tagline = "Compassionate Care, Connected Life",
                PrimaryColor = "#6B46C1",
                Phone = "+1 (512) 555-0100",
                Email = "info@connectedcare.com",
                Address = "100 Hospital Drive, Suite 400, Austin, TX 78705, USA",
                DateFormat = "MM/DD/YYYY",
                ShortDateFormat = "MM/DD/YYYY",
                DefaultLanguage = "English (United States)",
                TimeFormat = "12 Hour (AM/PM)",
                ItemsPerPage = 20,
                WeekStartsOn = "Sunday",
                DefaultDashboard = "Overview",
                AllowPublicRegistration = false,
                SessionTimeoutMinutes = 30,
                EnableAuditLogs = true,
                PasswordExpiryDays = 90,
                EnableTwoFactorAuth = false,
                MaintenanceMode = false,
                WeightUnit = "Pounds (lbs)",
                HeightUnit = "Feet / Inches",
                TemperatureUnit = "Fahrenheit (°F)",
                Currency = "USD ($) - US Dollar"
            });
            await context.SaveChangesAsync();
        }

        // 5. Seed Localization Settings if table is empty
        if (!await context.LocalizationSettingsRecords.AnyAsync())
        {
            context.LocalizationSettingsRecords.Add(new LocalizationSettingsRecord
            {
                DefaultLanguage = "English (United States)",
                FallbackLanguage = "Spanish (United States)",
                DateFormat = "MM/DD/YYYY",
                ShortDateFormat = "MM/DD/YYYY",
                TimeFormat = "12 Hour (AM/PM)",
                WeekStartsOn = "Sunday",
                TimeZone = "(UTC-06:00) Central Time (US & Canada)",
                PreviewRegion = "United States (en-US)",
                CalendarType = "Gregorian Calendar",
                SupportedLanguagesJson = "[{\"name\":\"English (United States)\",\"code\":\"en-US\",\"isDefault\":true},{\"name\":\"Spanish (United States)\",\"code\":\"es-US\"},{\"name\":\"French\",\"code\":\"fr-FR\"},{\"name\":\"Chinese (Simplified)\",\"code\":\"zh-CN\"}]"
            });
            await context.SaveChangesAsync();
        }

        // 6. Seed Security Settings if table is empty
        if (!await context.SecuritySettingsRecords.AnyAsync())
        {
            context.SecuritySettingsRecords.Add(new SecuritySettingsRecord
            {
                MinPasswordLength = 8,
                RequireUppercase = true,
                RequireLowercase = true,
                RequireNumbers = true,
                RequireSpecialChars = true,
                PasswordExpiryDays = 90,
                EnableMfaFor = "Optional for all users",
                MfaAuthenticatorApp = true,
                MfaSmsVerification = true,
                MfaEmailVerification = false,
                RememberMfaDays = 30,
                SessionTimeoutMinutes = 30,
                IdleTimeoutMinutes = 15,
                ForceLogoutOnPasswordChange = true,
                AllowMultipleActiveSessions = true,
                LockoutThreshold = 5,
                LockoutDurationMinutes = 15,
                PreventUserEnumeration = true,
                RequireEmailVerification = false,
                RestrictLoginToRegisteredDevices = false,
                AllowPasswordReset = true,
                RestrictSpecificIps = false,
                AllowedIpsJson = "[]"
            });
            await context.SaveChangesAsync();
        }

        // 7. Seed Subscription Plan if table is empty
        if (!await context.SubscriptionPlanRecords.AnyAsync())
        {
            context.SubscriptionPlanRecords.Add(new SubscriptionPlanRecord
            {
                CurrentPlanName = "Enterprise Healthcare Plan",
                Status = "Active",
                RenewalDateText = "December 31, 2026",
                AmountText = "$ 2,499.00 / month",
                PaymentMethod = "Corporate Visa ending in 4421",
                ResidentsCurrent = 0,
                ResidentsLimit = 500,
                StaffCurrent = 0,
                StorageCurrentGb = "0 GB",
                StorageLimitGb = 200,
                SmsCurrent = 0,
                SmsLimit = 5000,
                ApiCurrent = 0,
                ApiLimit = 500000
            });
            await context.SaveChangesAsync();
        }

        // 8. Seed Default System Admin Account item if not exists
        if (!await context.UserAccountItemRecords.AnyAsync(u => u.Email.ToLower() == "admin@connectcare.org"))
        {
            context.UserAccountItemRecords.Add(new UserAccountItemRecord
            {
                UserName = "System Administrator",
                Email = "admin@connectcare.org",
                Role = "System Administrator",
                Department = "Administration",
                Location = "Main Campus",
                Status = "Active",
                LastSignInText = "Just now"
            });
            await context.SaveChangesAsync();
        }

        // 9. Seed Role Definition Records if table is empty
        if (!await context.RoleDefinitionItemRecords.AnyAsync())
        {
            var roles = new List<RoleDefinitionItemRecord>
            {
                new RoleDefinitionItemRecord { RoleName = "System Administrator", Description = "Full access to all modules and settings. Can manage users, roles and system configurations.", UsersCount = 1, Status = "Active", CategoryBadge = "System Role" },
                new RoleDefinitionItemRecord { RoleName = "Administrator", Description = "Manage system and configuration", UsersCount = 0, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Care Manager", Description = "Manage care operations and care plans", UsersCount = 0, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Doctor", Description = "Access clinical and patient information", UsersCount = 0, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Nurse", Description = "Manage patient care and daily activities", UsersCount = 0, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Receptionist", Description = "Front desk and resident management", UsersCount = 0, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Billing Staff", Description = "Manage billing and financial operations", UsersCount = 0, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Pharmacist", Description = "Manage medication and prescriptions", UsersCount = 0, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Lab Technician", Description = "Manage lab tests and results", UsersCount = 0, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Viewer", Description = "View only access", UsersCount = 0, Status = "Active", CategoryBadge = "Custom Role" }
            };
            context.RoleDefinitionItemRecords.AddRange(roles);
            await context.SaveChangesAsync();
        }

        // 10. Seed Notification Templates if table is empty
        if (!await context.NotificationTemplateItemRecords.AnyAsync())
        {
            var templates = new List<NotificationTemplateItemRecord>
            {
                new NotificationTemplateItemRecord { TemplateName = "Welcome Email", Description = "Sent to new users during registration", Category = "User Management", Channel = "Email", TriggerEvent = "User Registration", Status = "Active", IsEnabled = true },
                new NotificationTemplateItemRecord { TemplateName = "Password Reset", Description = "Sent when user requests password reset", Category = "Authentication", Channel = "Email", TriggerEvent = "Password Reset Request", Status = "Active", IsEnabled = true },
                new NotificationTemplateItemRecord { TemplateName = "Appointment Confirmation", Description = "Sent to confirm new appointment", Category = "Appointments", Channel = "Email", TriggerEvent = "Appointment Created", Status = "Active", IsEnabled = true },
                new NotificationTemplateItemRecord { TemplateName = "Appointment Reminder", Description = "Reminder before upcoming appointment", Category = "Appointments", Channel = "Email", TriggerEvent = "Appointment Reminder", Status = "Active", IsEnabled = true },
                new NotificationTemplateItemRecord { TemplateName = "Medication Reminder", Description = "Reminder for medication schedule", Category = "Medications", Channel = "Email", TriggerEvent = "Medication Reminder", Status = "Active", IsEnabled = true },
                new NotificationTemplateItemRecord { TemplateName = "Alert - High Priority", Description = "Sent for high priority alerts", Category = "Alerts", Channel = "Email", TriggerEvent = "High Priority Alert", Status = "Active", IsEnabled = true },
                new NotificationTemplateItemRecord { TemplateName = "Task Assignment", Description = "Sent when task is assigned", Category = "Tasks", Channel = "Email", TriggerEvent = "Task Assigned", Status = "Active", IsEnabled = true },
                new NotificationTemplateItemRecord { TemplateName = "Incident Reported", Description = "Notification for new incident", Category = "Incidents", Channel = "Email", TriggerEvent = "Incident Reported", Status = "Inactive", IsEnabled = false },
                new NotificationTemplateItemRecord { TemplateName = "Lab Results Available", Description = "Notification for available lab results", Category = "Clinical", Channel = "Email", TriggerEvent = "Lab Results Available", Status = "Active", IsEnabled = true },
                new NotificationTemplateItemRecord { TemplateName = "Discharge Summary", Description = "Sent when discharge summary is ready", Category = "Discharge", Channel = "Email", TriggerEvent = "Discharge Summary Ready", Status = "Inactive", IsEnabled = false }
            };
            context.NotificationTemplateItemRecords.AddRange(templates);
            await context.SaveChangesAsync();
        }

        // 11. Seed Custom Report Templates if table is empty
        if (!await context.CustomReportRecords.AnyAsync())
        {
            var reports = new List<CustomReportRecord>
            {
                new CustomReportRecord { ReportName = "Monthly Patient Census", Description = "Comprehensive overview of resident admissions and discharges", Category = "Operational", Frequency = "Monthly", Status = "Active", LastModifiedText = "May 15, 2026" },
                new CustomReportRecord { ReportName = "Medication Adherence Quality", Description = "Tracking medication administration adherence percentage across care units", Category = "Clinical", Frequency = "Weekly", Status = "Active", LastModifiedText = "May 18, 2026" },
                new CustomReportRecord { ReportName = "Financial Revenue Summary", Description = "Monthly billing, payments, and outstanding receivables report", Category = "Financial", Frequency = "Monthly", Status = "Active", LastModifiedText = "May 10, 2026" },
                new CustomReportRecord { ReportName = "ICU Occupancy & Vitals Audit", Description = "Detailed audit of ICU bed utilization and critical vitals", Category = "Operational", Frequency = "Daily", Status = "Active", LastModifiedText = "May 20, 2026" },
                new CustomReportRecord { ReportName = "Antibiotic Stewardship Metrics", Description = "Surveillance of high-spectrum antibiotic prescriptions and resistance", Category = "Clinical", Frequency = "Monthly", Status = "Active", LastModifiedText = "May 12, 2026" },
                new CustomReportRecord { ReportName = "Insurance Claim Settlement Ratio", Description = "Analysis of claim submissions, approvals, and pending aging claims", Category = "Financial", Frequency = "Quarterly", Status = "Active", LastModifiedText = "May 08, 2026" }
            };
            context.CustomReportRecords.AddRange(reports);
            await context.SaveChangesAsync();
        }

        // 12. Seed Integration Definitions if table is empty
        if (!await context.IntegrationItemRecords.AnyAsync())
        {
            var integrations = new List<IntegrationItemRecord>
            {
                new IntegrationItemRecord
                {
                    Name = "Epic EHR System",
                    SystemApplication = "Epic Systems",
                    Category = "EHR",
                    ConnectionType = "HL7 v2 / FHIR Interface",
                    Description = "Bidirectional resident health record synchronization",
                    Status = "Active",
                    IconLogo = "database",
                    LastSyncText = "5 mins ago",
                    ConnectedOnText = "Jan 10, 2026",
                    DataSyncRateText = "99.8%",
                    DataLastSyncCount = 0,
                    DataLastSyncText = "Connected",
                    NextSyncText = "Continuous",
                    EndpointUrl = "https://fhir.epic.com/interconnect-fhir/api/FHIR/R4",
                    AuthType = "OAuth 2.0",
                    SyncInterval = "Real-Time",
                    Environment = "Production",
                    SettingsJson = "{\"webhookUrl\":\"https://api.connectcare.org/hooks/epic\",\"retryCount\":3,\"autoSync\":true}"
                },
                new IntegrationItemRecord
                {
                    Name = "Document Storage",
                    SystemApplication = "AWS S3 / Azure Blob",
                    Category = "Communication",
                    ConnectionType = "REST API (OAuth 2.0)",
                    Description = "Secure cloud document storage for patient records, medical scans, and attachments",
                    Status = "Active",
                    IconLogo = "folder",
                    LastSyncText = "10 mins ago",
                    ConnectedOnText = "Feb 01, 2026",
                    DataSyncRateText = "99.9%",
                    DataLastSyncCount = 0,
                    DataLastSyncText = "Connected",
                    NextSyncText = "In 5 mins",
                    EndpointUrl = "https://s3.us-east-1.amazonaws.com/connectcare-medical-docs",
                    AuthType = "API Key",
                    SyncInterval = "15 Minutes",
                    Environment = "Production",
                    SettingsJson = "{\"bucketName\":\"connectcare-medical-docs\",\"region\":\"us-east-1\",\"kmsEncrypted\":true}"
                },
                new IntegrationItemRecord
                {
                    Name = "Cerner Health Gateway",
                    SystemApplication = "Oracle Cerner",
                    Category = "EHR",
                    ConnectionType = "REST API (OAuth 2.0)",
                    Description = "Laboratory and pathology diagnostic result sync",
                    Status = "Active",
                    IconLogo = "activity",
                    LastSyncText = "12 mins ago",
                    ConnectedOnText = "Feb 15, 2026",
                    DataSyncRateText = "98.9%",
                    DataLastSyncCount = 0,
                    DataLastSyncText = "Connected",
                    NextSyncText = "In 3 mins",
                    EndpointUrl = "https://api.cerner.com/v1/health-data",
                    AuthType = "OAuth 2.0",
                    SyncInterval = "15 Minutes",
                    Environment = "Production"
                },
                new IntegrationItemRecord
                {
                    Name = "Twilio Care Messenger",
                    SystemApplication = "Twilio API",
                    Category = "Communication",
                    ConnectionType = "REST API (OAuth 2.0)",
                    Description = "Automated SMS appointment reminders, emergency caregiver alerts",
                    Status = "Active",
                    IconLogo = "message",
                    LastSyncText = "2 mins ago",
                    ConnectedOnText = "May 01, 2026",
                    DataSyncRateText = "99.5%",
                    DataLastSyncCount = 0,
                    DataLastSyncText = "Connected",
                    NextSyncText = "Continuous",
                    EndpointUrl = "https://api.twilio.com/2010-04-01/Accounts",
                    AuthType = "API Key",
                    SyncInterval = "Real-Time",
                    Environment = "Production"
                }
            };
            context.IntegrationItemRecords.AddRange(integrations);
            await context.SaveChangesAsync();
        }

        // 13. Seed AI Service Status & Workflows if table is empty
        if (!await context.AiServiceStatusRecords.AnyAsync())
        {
            var services = new List<AiServiceStatusRecord>
            {
                new AiServiceStatusRecord { ServiceName = "Clinical Note Assistant", Status = "Healthy", ModelVersion = "gpt-4o", UptimePercentage = "99.9%" },
                new AiServiceStatusRecord { ServiceName = "Medication Assistant", Status = "Healthy", ModelVersion = "gpt-4o-mini", UptimePercentage = "99.8%" },
                new AiServiceStatusRecord { ServiceName = "Care Plan Generator", Status = "Healthy", ModelVersion = "claude-3-haiku", UptimePercentage = "99.7%" },
                new AiServiceStatusRecord { ServiceName = "Document Summarizer", Status = "Healthy", ModelVersion = "gpt-4o", UptimePercentage = "99.9%" },
                new AiServiceStatusRecord { ServiceName = "Insights & Analytics", Status = "Healthy", ModelVersion = "gpt-4o", UptimePercentage = "99.6%" }
            };
            context.AiServiceStatusRecords.AddRange(services);
            await context.SaveChangesAsync();
        }

        if (!await context.AiWorkflowMetricRecords.AnyAsync())
        {
            var workflows = new List<AiWorkflowMetricRecord>
            {
                new AiWorkflowMetricRecord { WorkflowName = "Clinical Note Assistant", RequestsCount = 0, SuccessRate = "99.0%", AvgResponseTimeSeconds = "1.21 sec" },
                new AiWorkflowMetricRecord { WorkflowName = "Medication Interaction Check", RequestsCount = 0, SuccessRate = "99.0%", AvgResponseTimeSeconds = "1.18 sec" },
                new AiWorkflowMetricRecord { WorkflowName = "Care Plan Recommendation", RequestsCount = 0, SuccessRate = "99.0%", AvgResponseTimeSeconds = "1.56 sec" },
                new AiWorkflowMetricRecord { WorkflowName = "Document Summarization", RequestsCount = 0, SuccessRate = "99.0%", AvgResponseTimeSeconds = "1.33 sec" },
                new AiWorkflowMetricRecord { WorkflowName = "Patient Risk Analysis", RequestsCount = 0, SuccessRate = "99.0%", AvgResponseTimeSeconds = "1.78 sec" }
            };
            context.AiWorkflowMetricRecords.AddRange(workflows);
            await context.SaveChangesAsync();
        }

        // 14. Seed System App Roles
        var adminRole = await context.AppRoles.FirstOrDefaultAsync(r => r.RoleName == "Admin");
        if (adminRole == null)
        {
            adminRole = new AppRole { RoleName = "Admin", DisplayName = "System Administrator", Description = "Full unrestricted administrative access to all modules and system settings", IsSystemRole = true };
            context.AppRoles.Add(adminRole);
        }

        var doctorRole = await context.AppRoles.FirstOrDefaultAsync(r => r.RoleName == "Doctor");
        if (doctorRole == null)
        {
            doctorRole = new AppRole { RoleName = "Doctor", DisplayName = "Physician / Specialist", Description = "Access to Doctor Portal, patient care plans, consultations, vitals, and clinical AI", IsSystemRole = true };
            context.AppRoles.Add(doctorRole);
        }

        var nurseRole = await context.AppRoles.FirstOrDefaultAsync(r => r.RoleName == "Nurse");
        if (nurseRole == null)
        {
            nurseRole = new AppRole { RoleName = "Nurse", DisplayName = "Staff Nurse", Description = "Access to Nurse App, shift handover, vital rounds, medication tracking, and care documentation", IsSystemRole = true };
            context.AppRoles.Add(nurseRole);
        }
        await context.SaveChangesAsync();

        // 15. Seed Default System Admin User if not exists
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == "admin");
        if (adminUser == null)
        {
            var (adminHash, adminSalt) = PasswordHasher.CreatePasswordHash("admin123");
            adminUser = new User
            {
                Username = "admin",
                Email = "admin@connectcare.org",
                FullName = "System Administrator",
                Phone = "(512) 555-0100",
                Avatar = "",
                PasswordHash = adminHash,
                PasswordSalt = adminSalt,
                Role = "Admin",
                IsActive = true,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
        else if (string.IsNullOrEmpty(adminUser.PasswordSalt) || !PasswordHasher.VerifyPasswordHash("admin123", adminUser.PasswordHash, adminUser.PasswordSalt))
        {
            var (adminHash, adminSalt) = PasswordHasher.CreatePasswordHash("admin123");
            adminUser.PasswordHash = adminHash;
            adminUser.PasswordSalt = adminSalt;
            adminUser.Role = "Admin";
            adminUser.IsActive = true;
            adminUser.UpdatedDate = DateTime.UtcNow;
            await context.SaveChangesAsync();
        }

        // 16. Assign Admin Role to default Admin User
        if (adminRole != null && !await context.UserRoles.AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == adminRole.Id))
        {
            context.UserRoles.Add(new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id });
            await context.SaveChangesAsync();
        }

        // 17. Seed AppPermissions Catalog and RolePermissions (Ensuring Admin role has ALL permissions)
        var systemPermissions = new List<(string Key, string Name, string Module, string Description)>
        {
            // Dashboard
            ("dashboard.view", "View Dashboard", "Dashboard", "View core analytics and live dashboard"),
            ("dashboard.export", "Export Dashboard", "Dashboard", "Export dashboard data and statistics"),

            // Patients
            ("patients.view", "View Patients", "Patients", "View resident and patient records"),
            ("patients.create", "Create Patient", "Patients", "Register new patients"),
            ("patients.edit", "Edit Patient", "Patients", "Update patient demographic and medical records"),
            ("patients.delete", "Delete Patient", "Patients", "Remove patient records from system"),
            ("patients.export", "Export Patients", "Patients", "Export patient data files"),
            ("patients.import", "Import Patients", "Patients", "Import patient data files"),

            // Care Teams & Assignments
            ("careteams.view", "View Care Teams", "Care Team", "View care teams and member rosters"),
            ("careteams.create", "Create Care Team", "Care Team", "Create new care team records"),
            ("careteams.edit", "Edit Care Team", "Care Team", "Update care team configurations"),
            ("careteams.delete", "Delete Care Team", "Care Team", "Remove care team records"),
            ("careteams.assign", "Assign Care Providers", "Care Team", "Assign doctors and nurses to patients"),

            // Doctors
            ("doctors.view", "View Doctors", "Doctors", "View physician and specialist profiles"),
            ("doctors.create", "Create Doctor", "Doctors", "Register new physician and create portal account"),
            ("doctors.edit", "Edit Doctor", "Doctors", "Update physician details and credentials"),
            ("doctors.delete", "Delete Doctor", "Doctors", "Remove physician and user account"),
            ("doctors.assign", "Assign Doctor", "Doctors", "Assign attending doctor to patient"),

            // Nurses
            ("nurses.view", "View Nurses", "Nurses", "View staff nurse profiles and rosters"),
            ("nurses.create", "Create Nurse", "Nurses", "Register new nurse and create portal account"),
            ("nurses.edit", "Edit Nurse", "Nurses", "Update nursing staff details"),
            ("nurses.delete", "Delete Nurse", "Nurses", "Remove nurse and user account"),
            ("nurses.assign", "Assign Nurse", "Nurses", "Assign nurse to patient care"),

            // Locations / Units
            ("locations.view", "View Locations", "Locations", "View hospital units and ward beds"),
            ("locations.create", "Create Location", "Locations", "Create facility locations and wards"),
            ("locations.edit", "Edit Location", "Locations", "Update facility locations and bed counts"),
            ("locations.delete", "Delete Location", "Locations", "Remove locations"),

            // Alerts & Incidents
            ("alerts.view", "View Alerts", "Alerts", "View clinical alerts and vital warnings"),
            ("alerts.create", "Create Alert", "Alerts", "Trigger clinical alert"),
            ("alerts.edit", "Edit Alert", "Alerts", "Update alert details"),
            ("alerts.delete", "Delete Alert", "Alerts", "Delete alert records"),
            ("alerts.acknowledge", "Acknowledge Alert", "Alerts", "Resolve and acknowledge active alerts"),

            // Tasks
            ("tasks.view", "View Tasks", "Tasks", "View nursing and caregiver tasks"),
            ("tasks.create", "Create Task", "Tasks", "Create new care task"),
            ("tasks.edit", "Edit Task", "Tasks", "Update task details and due date"),
            ("tasks.delete", "Delete Task", "Tasks", "Remove task"),
            ("tasks.toggle", "Toggle Task Status", "Tasks", "Mark tasks completed or pending"),

            // Medications & Prescriptions
            ("medications.view", "View Medications", "Medications", "View medication administration and pharmacy catalog"),
            ("medications.create", "Create Prescription", "Medications", "Prescribe medications"),
            ("medications.edit", "Edit Prescription", "Medications", "Update prescription and dosage"),
            ("medications.delete", "Delete Prescription", "Medications", "Cancel and remove prescriptions"),

            // Consultations
            ("consultations.view", "View Consultations", "Consultations", "View physician consultations"),
            ("consultations.create", "Create Consultation", "Consultations", "Schedule and record new consultation"),
            ("consultations.edit", "Edit Consultation", "Consultations", "Update consultation and notes"),
            ("consultations.delete", "Delete Consultation", "Consultations", "Delete consultation records"),

            // Care Plans
            ("careplans.view", "View Care Plans", "Care Plans", "View active care plans and goals"),
            ("careplans.create", "Create Care Plan", "Care Plans", "Design new patient care plans"),
            ("careplans.edit", "Edit Care Plan", "Care Plans", "Update care goals and milestones"),
            ("careplans.delete", "Delete Care Plan", "Care Plans", "Remove care plan records"),

            // Vitals & Trends
            ("vitals.view", "View Vitals", "Vitals", "View vital rounds, trends, and charts"),
            ("vitals.create", "Record Vitals", "Vitals", "Record new vital signs"),
            ("vitals.edit", "Edit Vitals", "Vitals", "Update vital signs"),
            ("vitals.delete", "Delete Vitals", "Vitals", "Delete vital records"),

            // Reports & Analytics
            ("reports.view", "View Reports", "Reports", "View clinical and operational analytics"),
            ("reports.create", "Create Custom Report", "Reports", "Generate new reports"),
            ("reports.export", "Export Reports", "Reports", "Export reports as PDF or Excel"),
            ("reports.financial", "View Financial Reports", "Reports", "View financial transactions and invoices"),

            // AI Operations
            ("ai.view", "View AI Operations", "AI Operations", "Access clinical AI copilot and workflows"),
            ("ai.execute", "Execute AI Tools", "AI Operations", "Run AI clinical summarization and risk analysis"),
            ("ai.settings", "Configure AI", "AI Operations", "Configure AI models and safety guardrails"),

            // Integrations
            ("integrations.view", "View Integrations", "Integrations", "View connected third-party systems"),
            ("integrations.manage", "Manage Integrations", "Integrations", "Configure API endpoints and webhooks"),
            ("integrations.sync", "Sync Integrations", "Integrations", "Trigger real-time synchronization"),

            // Audit Logs
            ("audit.view", "View Audit Logs", "Audit Logs", "View system security and data audit trail"),
            ("audit.export", "Export Audit Logs", "Audit Logs", "Export compliance audit trail"),

            // System Settings & Administration
            ("settings.general", "General Settings", "Settings", "Manage organization info and branding"),
            ("settings.users.view", "View Users", "Settings", "View portal user accounts"),
            ("settings.users.create", "Create User", "Settings", "Provision new user accounts"),
            ("settings.users.edit", "Edit User", "Settings", "Update user details and status"),
            ("settings.users.delete", "Delete User", "Settings", "Remove user accounts"),
            ("settings.roles.view", "View Roles", "Settings", "View system and custom roles"),
            ("settings.roles.create", "Create Role", "Settings", "Define new security roles"),
            ("settings.roles.edit", "Edit Role", "Settings", "Update roles and permission matrix"),
            ("settings.roles.delete", "Delete Role", "Settings", "Delete custom roles"),
            ("settings.permissions.manage", "Manage Permissions", "Settings", "Assign role permissions"),
            ("settings.security", "Security Settings", "Settings", "Configure authentication, lockout, and password rules"),
            ("settings.backup", "Backup & Restore", "Settings", "Trigger database backups and recovery"),
            ("settings.localization", "Localization Settings", "Settings", "Configure date, time, and language settings")
        };

        foreach (var p in systemPermissions)
        {
            var perm = await context.AppPermissions.FirstOrDefaultAsync(ap => ap.PermissionKey == p.Key);
            if (perm == null)
            {
                perm = new AppPermission
                {
                    PermissionKey = p.Key,
                    Name = p.Name,
                    Module = p.Module,
                    Description = p.Description,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };
                context.AppPermissions.Add(perm);
            }
        }
        await context.SaveChangesAsync();

        // Ensure Admin role has ALL permissions in role_permission
        if (adminRole != null)
        {
            var allPerms = await context.AppPermissions.ToListAsync();
            var existingAdminPermKeys = await context.RolePermissions
                .Where(rp => rp.RoleId == adminRole.Id)
                .Select(rp => rp.PermissionKey)
                .ToListAsync();

            var missingAdminPerms = allPerms.Where(p => !existingAdminPermKeys.Contains(p.PermissionKey)).ToList();
            foreach (var mp in missingAdminPerms)
            {
                context.RolePermissions.Add(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = mp.Id,
                    PermissionKey = mp.PermissionKey,
                    PermissionName = mp.Name,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                });
            }
            await context.SaveChangesAsync();
        }

        // Ensure Doctor role has clinical permissions
        if (doctorRole != null)
        {
            var doctorPermKeys = new HashSet<string>
            {
                "dashboard.view", "patients.view", "patients.create", "patients.edit",
                "consultations.view", "consultations.create", "consultations.edit",
                "careplans.view", "careplans.create", "careplans.edit",
                "vitals.view", "vitals.create", "vitals.edit",
                "medications.view", "medications.create", "medications.edit",
                "alerts.view", "alerts.create", "alerts.acknowledge",
                "tasks.view", "tasks.create", "tasks.toggle",
                "reports.view", "ai.view", "ai.execute"
            };

            var existingDocPermKeys = await context.RolePermissions
                .Where(rp => rp.RoleId == doctorRole.Id)
                .Select(rp => rp.PermissionKey)
                .ToListAsync();

            var docPermsToAdd = await context.AppPermissions
                .Where(p => doctorPermKeys.Contains(p.PermissionKey) && !existingDocPermKeys.Contains(p.PermissionKey))
                .ToListAsync();

            foreach (var dp in docPermsToAdd)
            {
                context.RolePermissions.Add(new RolePermission
                {
                    RoleId = doctorRole.Id,
                    PermissionId = dp.Id,
                    PermissionKey = dp.PermissionKey,
                    PermissionName = dp.Name,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                });
            }
            await context.SaveChangesAsync();
        }

        // Ensure Nurse role has nursing permissions
        if (nurseRole != null)
        {
            var nursePermKeys = new HashSet<string>
            {
                "dashboard.view", "patients.view",
                "vitals.view", "vitals.create", "vitals.edit",
                "tasks.view", "tasks.create", "tasks.edit", "tasks.toggle",
                "alerts.view", "alerts.create", "alerts.acknowledge",
                "medications.view", "careplans.view", "reports.view"
            };

            var existingNursePermKeys = await context.RolePermissions
                .Where(rp => rp.RoleId == nurseRole.Id)
                .Select(rp => rp.PermissionKey)
                .ToListAsync();

            var nursePermsToAdd = await context.AppPermissions
                .Where(p => nursePermKeys.Contains(p.PermissionKey) && !existingNursePermKeys.Contains(p.PermissionKey))
                .ToListAsync();

            foreach (var np in nursePermsToAdd)
            {
                context.RolePermissions.Add(new RolePermission
                {
                    RoleId = nurseRole.Id,
                    PermissionId = np.Id,
                    PermissionKey = np.PermissionKey,
                    PermissionName = np.Name,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                });
            }
            await context.SaveChangesAsync();
        }

        // 18. Seed App Menu Items if table is empty
        if (!await context.MenuItems.AnyAsync())
        {
            var menuItems = new List<MenuItem>
            {
                // Admin Menus
                new MenuItem { MenuKey = "admin_dashboard", Title = "Dashboard", Path = "/dashboard", Icon = "LayoutDashboard", SortOrder = 1, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_patients", Title = "Patients", Path = "/patients", Icon = "Users", SortOrder = 2, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_care_teams", Title = "Care Teams", Path = "/care-teams", Icon = "UserCheck", SortOrder = 3, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_doctors", Title = "Doctors", Path = "/doctors", Icon = "Stethoscope", SortOrder = 4, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_nurses", Title = "Nurses", Path = "/nurses", Icon = "HeartPulse", SortOrder = 5, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_locations", Title = "Locations / Units", Path = "/locations", Icon = "Building2", SortOrder = 6, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_alerts", Title = "Alerts", Path = "/alerts", Icon = "Bell", SortOrder = 7, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_tasks", Title = "Tasks", Path = "/tasks", Icon = "CheckSquare", SortOrder = 8, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_medications", Title = "Medications", Path = "/medications", Icon = "Pill", SortOrder = 9, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_reports", Title = "Reports", Path = "/reports", Icon = "BarChart2", SortOrder = 10, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_ai", Title = "AI Operations", Path = "/ai-operations", Icon = "Sparkles", SortOrder = 11, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_integrations", Title = "Integrations", Path = "/integrations", Icon = "Zap", SortOrder = 12, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_audit", Title = "Audit Logs", Path = "/audit-logs", Icon = "Shield", SortOrder = 13, RolesAllowedJson = "[\"Admin\"]" },
                new MenuItem { MenuKey = "admin_settings", Title = "Settings", Path = "/settings", Icon = "Settings", SortOrder = 14, RolesAllowedJson = "[\"Admin\"]" },

                // Doctor Menus
                new MenuItem { MenuKey = "doc_dashboard", Title = "Dashboard", Path = "/dashboard", Icon = "LayoutDashboard", SortOrder = 1, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_patients", Title = "My Patients", Path = "/patients", Icon = "Users", SortOrder = 2, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_schedule", Title = "Schedule", Path = "/care-teams", Icon = "Calendar", SortOrder = 3, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_consultations", Title = "Consultations", Path = "/consultations", Icon = "Stethoscope", SortOrder = 4, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_care_plans", Title = "Care Plans", Path = "/care-plans", Icon = "HeartPulse", SortOrder = 5, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_tasks", Title = "Tasks", Path = "/tasks", Icon = "CheckSquare", SortOrder = 6, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_alerts", Title = "Alerts", Path = "/alerts", Icon = "Bell", SortOrder = 7, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_messages", Title = "Messages", Path = "/messages", Icon = "MessageSquare", SortOrder = 8, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_documents", Title = "Documents", Path = "/documentations", Icon = "FileText", SortOrder = 9, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_reports", Title = "Reports", Path = "/reports", Icon = "BarChart2", SortOrder = 10, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_ai", Title = "AI Assistant", Path = "/ai-operations", Icon = "Sparkles", SortOrder = 11, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_settings", Title = "Settings", Path = "/settings", Icon = "Settings", SortOrder = 12, RolesAllowedJson = "[\"Doctor\"]" },

                // Nurse Menus
                new MenuItem { MenuKey = "nurse_dashboard", Title = "Dashboard", Path = "/dashboard", Icon = "LayoutDashboard", SortOrder = 1, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_patients", Title = "My Patients", Path = "/patients", Icon = "Users", SortOrder = 2, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_vitals", Title = "Vital Rounds", Path = "/vital-rounds", Icon = "Activity", SortOrder = 3, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_medications", Title = "Medications", Path = "/medications", Icon = "Pill", SortOrder = 4, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_tasks", Title = "Tasks", Path = "/tasks", Icon = "CheckSquare", SortOrder = 5, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_alerts", Title = "Alerts", Path = "/alerts", Icon = "Bell", SortOrder = 6, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_handover", Title = "Shift Handover", Path = "/shift-handover", Icon = "Repeat", SortOrder = 7, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_doc", Title = "Documentation", Path = "/documentations", Icon = "FileEdit", SortOrder = 8, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_care_plans", Title = "Care Plans", Path = "/care-plans", Icon = "HeartPulse", SortOrder = 9, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_consult", Title = "Consultations", Path = "/consultations", Icon = "UserCheck", SortOrder = 10, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_discharge", Title = "Discharge Checklist", Path = "/discharge-checklist", Icon = "ClipboardCheck", SortOrder = 11, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_reports", Title = "Reports", Path = "/reports", Icon = "BarChart2", SortOrder = 12, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_messages", Title = "Messages", Path = "/messages", Icon = "MessageSquare", SortOrder = 13, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_settings", Title = "Settings & Profile", Path = "/settings-profile", Icon = "Settings", SortOrder = 14, RolesAllowedJson = "[\"Nurse\"]" }
            };
            context.MenuItems.AddRange(menuItems);
            await context.SaveChangesAsync();
        }

        // 19. Auto-reconcile all Nurse and Doctor user accounts with clinical profile tables
        var allUsers = await context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ToListAsync();
        foreach (var user in allUsers)
        {
            var userRole = user.UserRoles.Select(ur => ur.Role?.RoleName).FirstOrDefault() ?? user.Role ?? "";
            if (userRole.Equals("Nurse", StringComparison.OrdinalIgnoreCase) || userRole.Contains("Nurse", StringComparison.OrdinalIgnoreCase))
            {
                var nurseRecord = await context.Nurses.FirstOrDefaultAsync(n => n.UserId == user.Id || n.Email.ToLower() == user.Email.ToLower() || n.Name.ToLower() == user.FullName.ToLower() || n.Name.ToLower() == user.Username.ToLower());
                if (nurseRecord == null)
                {
                    nurseRecord = new Nurse
                    {
                        UserId = user.Id,
                        NurseIdCode = $"NRS-{Random.Shared.Next(1000, 9999)}",
                        Name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username,
                        Email = user.Email,
                        Phone = !string.IsNullOrWhiteSpace(user.Phone) ? user.Phone : "(512) 555-0100",
                        Avatar = user.Avatar ?? "",
                        Department = "General Ward",
                        SubUnit = "Floor 2",
                        Location = "Main Campus",
                        Shift = "Day Shift (08:00 AM - 04:00 PM)",
                        Status = DoctorStatus.Active,
                        CreatedDate = DateTime.UtcNow,
                        UpdatedDate = DateTime.UtcNow
                    };
                    context.Nurses.Add(nurseRecord);
                    await context.SaveChangesAsync();
                }
                else if (nurseRecord.UserId != user.Id)
                {
                    nurseRecord.UserId = user.Id;
                    await context.SaveChangesAsync();
                }
            }
            else if (userRole.Equals("Doctor", StringComparison.OrdinalIgnoreCase) || userRole.Contains("Doctor", StringComparison.OrdinalIgnoreCase))
            {
                var docRecord = await context.Doctors.FirstOrDefaultAsync(d => d.UserId == user.Id || d.Email.ToLower() == user.Email.ToLower() || d.Name.ToLower() == user.FullName.ToLower() || d.Name.ToLower() == user.Username.ToLower());
                if (docRecord == null)
                {
                    docRecord = new Doctor
                    {
                        UserId = user.Id,
                        DoctorIdCode = $"DOC-{Random.Shared.Next(1000, 9999)}",
                        Name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username,
                        Email = user.Email,
                        Phone = !string.IsNullOrWhiteSpace(user.Phone) ? user.Phone : "(512) 555-0100",
                        Avatar = user.Avatar ?? "",
                        Specialty = "General Medicine",
                        Department = "Internal Medicine",
                        Location = "Main Campus",
                        Status = DoctorStatus.Active,
                        CreatedDate = DateTime.UtcNow,
                        UpdatedDate = DateTime.UtcNow
                    };
                    context.Doctors.Add(docRecord);
                    await context.SaveChangesAsync();
                }
                else if (docRecord.UserId != user.Id)
                {
                    docRecord.UserId = user.Id;
                    await context.SaveChangesAsync();
                }
            }
        }

        // Seed Clinical Alerts if empty
        if (!await context.Alerts.AnyAsync())
        {
            var patients = await context.Patients.Take(5).ToListAsync();
            var p1 = patients.ElementAtOrDefault(0);
            var p2 = patients.ElementAtOrDefault(1);
            var p3 = patients.ElementAtOrDefault(2);
            var p4 = patients.ElementAtOrDefault(3);

            var defaultAlerts = new List<Alert>
            {
                new Alert
                {
                    AlertIdCode = "ALT-1001",
                    Title = "Critical Tachycardia Event (HR > 135 bpm)",
                    Description = "Continuous telemetry detected sudden heart rate spike exceeding critical threshold.",
                    PatientId = p1?.Id,
                    PatientName = p1?.Name ?? "Eleanor Vance",
                    PatientIdCode = p1?.PatientIdCode ?? "PT-1001",
                    PatientAvatar = p1?.Avatar ?? "",
                    Type = "Vital Signs",
                    Severity = AlertSeverity.Critical,
                    RoomLocation = p1?.FloorRoom ?? "Room 302 • 3rd Floor",
                    CareUnit = p1?.CareUnit ?? "Cardiology Unit",
                    AgeGender = p1?.AgeGender ?? "72 Y • Female",
                    BloodGroup = p1?.BloodType ?? "O+",
                    PatientType = "Inpatient",
                    ReportedBy = "Telemetry Monitor 3A",
                    ReportedByRole = "Continuous ECG Telemetry",
                    DetectedBy = "Bedside Monitor System",
                    Source = "Telemetry Sensor",
                    TriggerCondition = "Heart Rate: 138 bpm (Threshold: > 120 bpm)",
                    TimestampText = "Just now",
                    Status = "New",
                    IsAcknowledged = false,
                    Notes = "Patient has history of atrial fibrillation. Attending cardiologist notified.",
                    CreatedDate = DateTime.UtcNow.AddMinutes(-5),
                    UpdatedDate = DateTime.UtcNow.AddMinutes(-5)
                },
                new Alert
                {
                    AlertIdCode = "ALT-1002",
                    Title = "Bed-Exit Fall Risk Sensor Triggered",
                    Description = "Smart bed pressure sensor detected patient unassisted egress attempt.",
                    PatientId = p2?.Id,
                    PatientName = p2?.Name ?? "Arthur Pendelton",
                    PatientIdCode = p2?.PatientIdCode ?? "PT-1002",
                    PatientAvatar = p2?.Avatar ?? "",
                    Type = "Patient Safety",
                    Severity = AlertSeverity.High,
                    RoomLocation = p2?.FloorRoom ?? "Room 205 • 2nd Floor",
                    CareUnit = p2?.CareUnit ?? "Med-Surg Unit 1",
                    AgeGender = p2?.AgeGender ?? "81 Y • Male",
                    BloodGroup = p2?.BloodType ?? "A+",
                    PatientType = "Inpatient",
                    ReportedBy = "Nurse Sarah Jenkins",
                    ReportedByRole = "Floor Nurse",
                    DetectedBy = "Smart Bed Sensor",
                    Source = "Bed Weight Mat",
                    TriggerCondition = "Bed Exit Alarm Triggered",
                    TimestampText = "12 mins ago",
                    Status = "In Progress",
                    IsAcknowledged = true,
                    AcknowledgedBy = "Nurse Sarah Jenkins",
                    AcknowledgedDate = DateTime.UtcNow.AddMinutes(-10),
                    Notes = "Staff responded immediately. Patient safely assisted back to bed with call light in hand.",
                    CreatedDate = DateTime.UtcNow.AddMinutes(-15),
                    UpdatedDate = DateTime.UtcNow.AddMinutes(-10)
                },
                new Alert
                {
                    AlertIdCode = "ALT-1003",
                    Title = "Oxygen Desaturation Below 90% (SpO2: 88%)",
                    Description = "Pulse oximeter reading dropped below acceptable safety threshold.",
                    PatientId = p3?.Id,
                    PatientName = p3?.Name ?? "Maria Gonzalez",
                    PatientIdCode = p3?.PatientIdCode ?? "PT-1003",
                    PatientAvatar = p3?.Avatar ?? "",
                    Type = "Vital Signs",
                    Severity = AlertSeverity.Critical,
                    RoomLocation = p3?.FloorRoom ?? "Room 108 • 1st Floor",
                    CareUnit = p3?.CareUnit ?? "Pulmonology Unit",
                    AgeGender = p3?.AgeGender ?? "66 Y • Female",
                    BloodGroup = p3?.BloodType ?? "B+",
                    PatientType = "Inpatient",
                    ReportedBy = "Automated Oximetry Alarm",
                    ReportedByRole = "Pulse Oximeter",
                    DetectedBy = "Pulse Oximetry Monitor",
                    Source = "Finger Clip Sensor",
                    TriggerCondition = "SpO2: 88% (Baseline: 95%)",
                    TimestampText = "25 mins ago",
                    Status = "New",
                    IsAcknowledged = false,
                    Notes = "Nasal cannula repositioning required. Supplemental O2 flow check pending.",
                    CreatedDate = DateTime.UtcNow.AddMinutes(-25),
                    UpdatedDate = DateTime.UtcNow.AddMinutes(-25)
                },
                new Alert
                {
                    AlertIdCode = "ALT-1004",
                    Title = "Missed Scheduled Anticoagulant Dose (Eliquis)",
                    Description = "Medication administration record shows 10:00 AM Apixaban 5mg dose unconfirmed.",
                    PatientId = p4?.Id,
                    PatientName = p4?.Name ?? "Robert Chen",
                    PatientIdCode = p4?.PatientIdCode ?? "PT-1004",
                    PatientAvatar = p4?.Avatar ?? "",
                    Type = "Medication",
                    Severity = AlertSeverity.Medium,
                    RoomLocation = p4?.FloorRoom ?? "Room 404 • 4th Floor",
                    CareUnit = p4?.CareUnit ?? "Cardiology Unit",
                    AgeGender = p4?.AgeGender ?? "59 Y • Male",
                    BloodGroup = p4?.BloodType ?? "AB+",
                    PatientType = "Inpatient",
                    ReportedBy = "eMAR Medication System",
                    ReportedByRole = "Pharmacy System",
                    DetectedBy = "Medication Administration System",
                    Source = "eMAR Telemetry",
                    TriggerCondition = "Scheduled Dose Overdue > 45 mins",
                    TimestampText = "45 mins ago",
                    Status = "Pending",
                    IsAcknowledged = false,
                    Notes = "Patient was in radiology for CT scan during scheduled dose window. Dose pending administration.",
                    CreatedDate = DateTime.UtcNow.AddMinutes(-45),
                    UpdatedDate = DateTime.UtcNow.AddMinutes(-45)
                },
                new Alert
                {
                    AlertIdCode = "ALT-1005",
                    Title = "Telemetry Lead II Disconnected",
                    Description = "Electrode contact lost on Lead II. Signal noise detected.",
                    PatientId = p1?.Id,
                    PatientName = p1?.Name ?? "Eleanor Vance",
                    PatientIdCode = p1?.PatientIdCode ?? "PT-1001",
                    PatientAvatar = p1?.Avatar ?? "",
                    Type = "Equipment",
                    Severity = AlertSeverity.Low,
                    RoomLocation = p1?.FloorRoom ?? "Room 302 • 3rd Floor",
                    CareUnit = p1?.CareUnit ?? "Cardiology Unit",
                    AgeGender = p1?.AgeGender ?? "72 Y • Female",
                    BloodGroup = p1?.BloodType ?? "O+",
                    PatientType = "Inpatient",
                    ReportedBy = "Telemetry Central Station",
                    ReportedByRole = "Central Monitoring",
                    DetectedBy = "Telemetry Gateway",
                    Source = "ECG Leads",
                    TriggerCondition = "Lead Off Impedance High",
                    TimestampText = "1 hour ago",
                    Status = "Resolved",
                    IsAcknowledged = true,
                    AcknowledgedBy = "Nurse Michael Davis",
                    AcknowledgedDate = DateTime.UtcNow.AddMinutes(-50),
                    ResolvedBy = "Nurse Michael Davis",
                    ResolvedDate = DateTime.UtcNow.AddMinutes(-45),
                    ResolutionNotes = "Electrodes replaced and skin prep redone. Strong clean waveform restored.",
                    Notes = "Resolved successfully.",
                    CreatedDate = DateTime.UtcNow.AddHours(-1),
                    UpdatedDate = DateTime.UtcNow.AddMinutes(-45)
                }
            };

            context.Alerts.AddRange(defaultAlerts);
            await context.SaveChangesAsync();
        }

        // Seed Care Team Members with designated Team Names if empty
        if (!await context.CareTeamMembers.AnyAsync())
        {
            var doctors = await context.Doctors.ToListAsync();
            var nurses = await context.Nurses.ToListAsync();
            var patients = await context.Patients.ToListAsync();

            var d1 = doctors.ElementAtOrDefault(0);
            var d2 = doctors.ElementAtOrDefault(1);
            var d3 = doctors.ElementAtOrDefault(2);

            var n1 = nurses.ElementAtOrDefault(0);
            var n2 = nurses.ElementAtOrDefault(1);
            var n3 = nurses.ElementAtOrDefault(2);

            var p1 = patients.ElementAtOrDefault(0);
            var p2 = patients.ElementAtOrDefault(1);

            var initialTeamMembers = new List<CareTeamMember>
            {
                new CareTeamMember
                {
                    MemberIdCode = "CTM-101",
                    Name = d1?.Name ?? "Dr. Sarah Wilson",
                    Avatar = d1?.Avatar ?? "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
                    Role = CareTeamRole.Doctor,
                    TeamName = "Cardiology Alpha Team",
                    Specialty = "Cardiology",
                    Department = "Cardiology Unit",
                    Location = "Main Campus (3rd Floor)",
                    Phone = d1?.Phone ?? "(512) 555-0101",
                    Email = d1?.Email ?? "sarah.wilson@connectedcare.com",
                    Status = DoctorStatus.Active,
                    Shift = "Day Shift (07:00 AM - 03:00 PM)",
                    DoctorId = d1?.Id,
                    PatientId = p1?.Id,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                },
                new CareTeamMember
                {
                    MemberIdCode = "CTM-102",
                    Name = n1?.Name ?? "Emma Watson, RN",
                    Avatar = n1?.Avatar ?? "https://images.unsplash.com/photo-1594824813598-6395b0ff72e5?w=150&auto=format&fit=crop&q=80",
                    Role = CareTeamRole.Nurse,
                    TeamName = "Cardiology Alpha Team",
                    Specialty = "Cardiac Critical Care",
                    Department = "Cardiology Unit",
                    Location = "Main Campus (3rd Floor)",
                    Phone = n1?.Phone ?? "(512) 555-0102",
                    Email = n1?.Email ?? "emma.watson@connectedcare.com",
                    Status = DoctorStatus.Active,
                    Shift = "Day Shift (07:00 AM - 03:00 PM)",
                    NurseId = n1?.Id,
                    PatientId = p1?.Id,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                },
                new CareTeamMember
                {
                    MemberIdCode = "CTM-103",
                    Name = d2?.Name ?? "Dr. James Miller",
                    Avatar = d2?.Avatar ?? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
                    Role = CareTeamRole.Doctor,
                    TeamName = "ICU Critical Care Team 1",
                    Specialty = "Intensive Care",
                    Department = "Intensive Care Unit (ICU)",
                    Location = "North Wing (2nd Floor)",
                    Phone = d2?.Phone ?? "(512) 555-0103",
                    Email = d2?.Email ?? "james.miller@connectedcare.com",
                    Status = DoctorStatus.Active,
                    Shift = "Day Shift (07:00 AM - 03:00 PM)",
                    DoctorId = d2?.Id,
                    PatientId = p2?.Id,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                },
                new CareTeamMember
                {
                    MemberIdCode = "CTM-104",
                    Name = n2?.Name ?? "Liam Smith, RN",
                    Avatar = n2?.Avatar ?? "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80",
                    Role = CareTeamRole.Nurse,
                    TeamName = "ICU Critical Care Team 1",
                    Specialty = "Trauma & ICU",
                    Department = "Intensive Care Unit (ICU)",
                    Location = "North Wing (2nd Floor)",
                    Phone = n2?.Phone ?? "(512) 555-0104",
                    Email = n2?.Email ?? "liam.smith@connectedcare.com",
                    Status = DoctorStatus.Active,
                    Shift = "Night Shift (11:00 PM - 07:00 AM)",
                    NurseId = n2?.Id,
                    PatientId = p2?.Id,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                },
                new CareTeamMember
                {
                    MemberIdCode = "CTM-105",
                    Name = d3?.Name ?? "Dr. Michael Chang",
                    Avatar = d3?.Avatar ?? "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
                    Role = CareTeamRole.Doctor,
                    TeamName = "Emergency Trauma Team",
                    Specialty = "Emergency Medicine",
                    Department = "Emergency Department",
                    Location = "Emergency Wing (Ground Floor)",
                    Phone = d3?.Phone ?? "(512) 555-0105",
                    Email = d3?.Email ?? "michael.chang@connectedcare.com",
                    Status = DoctorStatus.Active,
                    Shift = "Rotating Shift",
                    DoctorId = d3?.Id,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                },
                new CareTeamMember
                {
                    MemberIdCode = "CTM-106",
                    Name = "Rachel Green, PT",
                    Avatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                    Role = CareTeamRole.AlliedHealth,
                    TeamName = "Cardiology Alpha Team",
                    Specialty = "Physical Therapy",
                    Department = "Cardiology Unit",
                    Location = "Main Campus (3rd Floor)",
                    Phone = "(512) 555-0106",
                    Email = "rachel.green@connectedcare.com",
                    Status = DoctorStatus.Active,
                    Shift = "Day Shift (07:00 AM - 03:00 PM)",
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                }
            };

            context.CareTeamMembers.AddRange(initialTeamMembers);
            await context.SaveChangesAsync();
        }
    }
}


