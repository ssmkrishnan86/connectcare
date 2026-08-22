using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Security;
using Microsoft.EntityFrameworkCore;

namespace ConnectedCare.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ConnectedCareDbContext context)
    {
        // 0. Ensure no default care team members exist - Care team members must be created manually by Admin only
        if (await context.CareTeamMembers.AnyAsync())
        {
            context.CareTeamMembers.RemoveRange(context.CareTeamMembers);
            await context.SaveChangesAsync();
        }

        // 1. Ensure no default doctors exist - Doctors must be created manually by Admin only
        if (await context.Doctors.AnyAsync())
        {
            context.Doctors.RemoveRange(context.Doctors);
            await context.SaveChangesAsync();
        }

        // 1b. Ensure no default nurses exist - Nurses must be created manually by Admin only
        if (await context.Nurses.AnyAsync())
        {
            context.Nurses.RemoveRange(context.Nurses);
            await context.SaveChangesAsync();
        }

        // 2. Ensure no default location units exist - Locations must be created manually by Admin only
        if (await context.LocationUnits.AnyAsync())
        {
            context.LocationUnits.RemoveRange(context.LocationUnits);
            await context.SaveChangesAsync();
        }

        // 2b. Patient seeding disabled - patients must be created manually by users


        // 3. Seed Organization Settings
        if (!await context.OrganizationSettingsRecords.AnyAsync())
        {
            context.OrganizationSettingsRecords.Add(new OrganizationSettingsRecord
            {
                OrganizationName = "Connected Care Senior Living",
                LogoUrl = "",
                Tagline = "Compassionate Care, Connected Life",
                PrimaryColor = "#6B46C1",
                Phone = "+91 98765 43210",
                Address = "123, Care Street, Healthy City, Chennai - 600001, Tamil Nadu, India",
                Email = "info@connectedcare.com",
                OrganizationType = "Senior Living / Assisted Living",
                RegistrationNumber = "CCSL/2018/55671",
                EstablishedYear = "2018",
                Website = "https://www.connectedcare.com",
                PrimaryContactPerson = "John Admin",
                PrimaryContactDesignation = "Administrator",
                PrimaryContactEmail = "admin@connectedcare.com",
                PrimaryContactPhone = "+91 98765 43210",
                PrimaryContactAlternatePhone = "+91 91234 56789",
                AddressLine1 = "123, Care Street, Healthy City",
                AddressLine2 = "Near Green Park",
                City = "Chennai",
                State = "Tamil Nadu",
                PinCode = "600001",
                Country = "India",
                DefaultTimeZone = "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
                DefaultLanguage = "English",
                DefaultDateFormat = "DD MMM YYYY (19 May 2025)",
                DefaultTimeFormat = "12 Hour (05:30 PM)",
                Currency = "INR (₹) - Indian Rupee",
                WeekStartsOn = "Monday",
                EnableMultiLocation = true,
                EnabledModulesJson = "[\"Residents\", \"Care & Clinical\", \"Medication\", \"Billing & Finance\", \"Reports & Analytics\", \"Alerts & Incidents\", \"Tasks & Activities\", \"Document Management\"]"
            });
            await context.SaveChangesAsync();
        }

        // 4. Seed General App Settings
        if (!await context.GeneralAppSettingsRecords.AnyAsync())
        {
            context.GeneralAppSettingsRecords.Add(new GeneralAppSettingsRecord
            {
                OrganizationName = "Connected Care Senior Living",
                Tagline = "Compassionate Care, Connected Life",
                PrimaryColor = "#6B46C1",
                Phone = "+91 98765 43210",
                Email = "info@connectedcare.com",
                Address = "123, Care Street, Healthy City, Chennai - 600001, Tamil Nadu, India",
                DateFormat = "DD MMM YYYY (19 May 2025)",
                ShortDateFormat = "DD/MM/YYYY (19/05/2025)",
                DefaultLanguage = "English",
                TimeFormat = "12 Hour (05:30 PM)",
                ItemsPerPage = 20,
                WeekStartsOn = "Monday",
                DefaultDashboard = "Overview",
                AllowPublicRegistration = true,
                SessionTimeoutMinutes = 30,
                EnableAuditLogs = true,
                PasswordExpiryDays = 90,
                EnableTwoFactorAuth = true,
                MaintenanceMode = false,
                WeightUnit = "Kilograms (kg)",
                HeightUnit = "Centimeters (cm)",
                TemperatureUnit = "Celsius (°C)",
                Currency = "INR (₹) - Indian Rupee"
            });
            await context.SaveChangesAsync();
        }

        // 5. Seed Localization Settings
        if (!await context.LocalizationSettingsRecords.AnyAsync())
        {
            context.LocalizationSettingsRecords.Add(new LocalizationSettingsRecord
            {
                DefaultLanguage = "English (United States)",
                FallbackLanguage = "English (India)",
                DateFormat = "DD MMM YYYY (19 May 2025)",
                ShortDateFormat = "DD/MM/YYYY (19/05/2025)",
                TimeFormat = "12 Hour (05:30 PM)",
                WeekStartsOn = "Monday",
                TimeZone = "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
                PreviewRegion = "India",
                CalendarType = "Gregorian Calendar",
                SupportedLanguagesJson = "[{\"name\":\"English (United States)\",\"code\":\"en-US\",\"isDefault\":true},{\"name\":\"English (India)\",\"code\":\"en-IN\"},{\"name\":\"தமிழ் (Tamil)\",\"code\":\"ta-IN\"},{\"name\":\"हिंदी (Hindi)\",\"code\":\"hi-IN\"},{\"name\":\"తెలుగు (Telugu)\",\"code\":\"te-IN\"},{\"name\":\"ಕನ್ನಡ (Kannada)\",\"code\":\"kn-IN\"},{\"name\":\"বাংলা (Bengali)\",\"code\":\"bn-IN\"}]"
            });
            await context.SaveChangesAsync();
        }

        // 6. Seed Security Settings
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
                EnableMfaFor = "All Users",
                MfaAuthenticatorApp = true,
                MfaSmsVerification = true,
                MfaEmailVerification = false,
                RememberMfaDays = 7,
                SessionTimeoutMinutes = 30,
                IdleTimeoutMinutes = 15,
                ForceLogoutOnPasswordChange = true,
                AllowMultipleActiveSessions = false,
                LockoutThreshold = 5,
                LockoutDurationMinutes = 15,
                PreventUserEnumeration = true,
                RequireEmailVerification = true,
                RestrictLoginToRegisteredDevices = false,
                AllowPasswordReset = true,
                RestrictSpecificIps = true,
                AllowedIpsJson = "[\"203.0.113.10\", \"203.0.113.0/24\", \"198.51.100.15\"]"
            });
            await context.SaveChangesAsync();
        }

        // 7. Seed Backup History
        if (!await context.BackupHistoryRecords.AnyAsync())
        {
            var backups = new List<BackupHistoryRecord>
            {
                new BackupHistoryRecord { BackupName = "Full Backup - May 19, 2025", Type = "Full Backup", Description = "Automated daily backup", SizeText = "24.6 GB", CreatedOnText = "May 19, 2025 02:30 AM (UTC+05:30)", Status = "Success" },
                new BackupHistoryRecord { BackupName = "Full Backup - May 18, 2025", Type = "Full Backup", Description = "Automated daily backup", SizeText = "24.1 GB", CreatedOnText = "May 18, 2025 02:30 AM (UTC+05:30)", Status = "Success" },
                new BackupHistoryRecord { BackupName = "Database Backup - May 17, 2025", Type = "Database Only", Description = "Weekly database backup", SizeText = "8.7 GB", CreatedOnText = "May 17, 2025 02:30 AM (UTC+05:30)", Status = "Success" },
                new BackupHistoryRecord { BackupName = "Full Backup - May 16, 2025", Type = "Full Backup", Description = "Automated daily backup", SizeText = "23.9 GB", CreatedOnText = "May 16, 2025 02:30 AM (UTC+05:30)", Status = "Failed" },
                new BackupHistoryRecord { BackupName = "Files Backup - May 15, 2025", Type = "Files Only", Description = "Files and attachments backup", SizeText = "15.2 GB", CreatedOnText = "May 15, 2025 02:30 AM (UTC+05:30)", Status = "Success" }
            };
            context.BackupHistoryRecords.AddRange(backups);
            await context.SaveChangesAsync();
        }

        // 8. Seed Subscription & Billing
        if (!await context.SubscriptionPlanRecords.AnyAsync())
        {
            context.SubscriptionPlanRecords.Add(new SubscriptionPlanRecord
            {
                CurrentPlanName = "Professional Plan",
                Status = "Active",
                RenewalDateText = "Jun 19, 2025",
                AmountText = "$199.00 / month",
                PaymentMethod = "VISA **** **** 4242",
                ResidentsCurrent = 312,
                ResidentsLimit = 500,
                StaffCurrent = 48,
                StorageCurrentGb = "42.6",
                StorageLimitGb = 100,
                SmsCurrent = 1240,
                SmsLimit = 5000,
                ApiCurrent = 32500,
                ApiLimit = 100000
            });
            await context.SaveChangesAsync();
        }

        if (!await context.BillingInvoiceRecords.AnyAsync())
        {
            var invoices = new List<BillingInvoiceRecord>
            {
                new BillingInvoiceRecord { InvoiceNumber = "INV-2025-0519", DateText = "May 19, 2025", AmountText = "$199.00", Status = "Paid" },
                new BillingInvoiceRecord { InvoiceNumber = "INV-2025-0419", DateText = "Apr 19, 2025", AmountText = "$199.00", Status = "Paid" },
                new BillingInvoiceRecord { InvoiceNumber = "INV-2025-0319", DateText = "Mar 19, 2025", AmountText = "$199.00", Status = "Paid" },
                new BillingInvoiceRecord { InvoiceNumber = "INV-2025-0219", DateText = "Feb 19, 2025", AmountText = "$199.00", Status = "Paid" },
                new BillingInvoiceRecord { InvoiceNumber = "INV-2025-0119", DateText = "Jan 19, 2025", AmountText = "$199.00", Status = "Paid" }
            };
            context.BillingInvoiceRecords.AddRange(invoices);
            await context.SaveChangesAsync();
        }

        // 9. Seed Default System Admin User and clean up legacy dummy accounts
        var legacyAccounts = await context.UserAccountItemRecords
            .Where(u => u.Email.ToLower() != "admin@connectcare.org")
            .ToListAsync();
        if (legacyAccounts.Count > 0)
        {
            context.UserAccountItemRecords.RemoveRange(legacyAccounts);
            await context.SaveChangesAsync();
        }

        if (!await context.UserAccountItemRecords.AnyAsync(u => u.Email.ToLower() == "admin@connectcare.org"))
        {
            var userAccounts = new List<UserAccountItemRecord>
            {
                new UserAccountItemRecord { UserName = "System Administrator", Email = "admin@connectcare.org", Role = "System Administrator", Department = "Administration", Location = "Main Campus", Status = "Active", LastSignInText = "Just now" }
            };
            context.UserAccountItemRecords.AddRange(userAccounts);
            await context.SaveChangesAsync();
        }

        // 10. Seed Role Definition Item Records (Matching Image 4)
        if (!await context.RoleDefinitionItemRecords.AnyAsync())
        {
            var roles = new List<RoleDefinitionItemRecord>
            {
                new RoleDefinitionItemRecord { RoleName = "System Administrator", Description = "Full access to all modules and settings. Can manage users, roles and system configurations.", UsersCount = 12, Status = "Active", CategoryBadge = "System Role" },
                new RoleDefinitionItemRecord { RoleName = "Administrator", Description = "Manage system and configuration", UsersCount = 8, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Care Manager", Description = "Manage care operations and care plans", UsersCount = 15, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Doctor", Description = "Access clinical and patient information", UsersCount = 24, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Nurse", Description = "Manage patient care and daily activities", UsersCount = 38, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Receptionist", Description = "Front desk and resident management", UsersCount = 6, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Billing Staff", Description = "Manage billing and financial operations", UsersCount = 5, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Pharmacist", Description = "Manage medication and prescriptions", UsersCount = 4, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Lab Technician", Description = "Manage lab tests and results", UsersCount = 3, Status = "Active", CategoryBadge = "Custom Role" },
                new RoleDefinitionItemRecord { RoleName = "Viewer", Description = "View only access", UsersCount = 10, Status = "Active", CategoryBadge = "Custom Role" }
            };
            context.RoleDefinitionItemRecords.AddRange(roles);
            await context.SaveChangesAsync();
        }

        // 11. Seed Notification Templates (Matching Image 5)
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

        // 12. Seed Custom Reports
        if (!await context.CustomReportRecords.AnyAsync())
        {
            var reports = new List<CustomReportRecord>
            {
                new CustomReportRecord { ReportName = "Monthly Patient Census", Description = "Comprehensive overview of resident admissions and discharges", Category = "Operational", Frequency = "Monthly", Status = "Active", LastModifiedText = "May 15, 2025" },
                new CustomReportRecord { ReportName = "Medication Adherence Quality", Description = "Tracking medication administration adherence percentage across care units", Category = "Clinical", Frequency = "Weekly", Status = "Active", LastModifiedText = "May 18, 2025" },
                new CustomReportRecord { ReportName = "Financial Revenue Summary", Description = "Monthly billing, payments, and outstanding receivables report", Category = "Financial", Frequency = "Monthly", Status = "Active", LastModifiedText = "May 10, 2025" },
                new CustomReportRecord { ReportName = "ICU Occupancy & Vitals Audit", Description = "Detailed audit of ICU bed utilization and critical vitals", Category = "Operational", Frequency = "Daily", Status = "Active", LastModifiedText = "May 20, 2025" },
                new CustomReportRecord { ReportName = "Antibiotic Stewardship Metrics", Description = "Surveillance of high-spectrum antibiotic prescriptions and resistance", Category = "Clinical", Frequency = "Monthly", Status = "Active", LastModifiedText = "May 12, 2025" },
                new CustomReportRecord { ReportName = "Insurance Claim Settlement Ratio", Description = "Analysis of claim submissions, approvals, and pending aging claims", Category = "Financial", Frequency = "Quarterly", Status = "Active", LastModifiedText = "May 08, 2025" }
            };
            context.CustomReportRecords.AddRange(reports);
            await context.SaveChangesAsync();
        }

        // 13. Seed Integrations
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
                    Description = "Real-time bidirectional resident health record synchronization",
                    Status = "Active",
                    IconLogo = "database",
                    LastSyncText = "5 mins ago",
                    ConnectedOnText = "Jan 10, 2024",
                    DataSyncRateText = "99.8%",
                    DataLastSyncCount = 12500,
                    DataLastSyncText = "12,500 records synced",
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
                    ConnectedOnText = "Feb 01, 2024",
                    DataSyncRateText = "99.9%",
                    DataLastSyncCount = 8420,
                    DataLastSyncText = "8,420 files synchronized",
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
                    ConnectedOnText = "Feb 15, 2024",
                    DataSyncRateText = "98.9%",
                    DataLastSyncCount = 4800,
                    DataLastSyncText = "4,800 records synced",
                    NextSyncText = "In 3 mins",
                    EndpointUrl = "https://api.cerner.com/v1/health-data",
                    AuthType = "OAuth 2.0",
                    SyncInterval = "15 Minutes",
                    Environment = "Production"
                },
                new IntegrationItemRecord
                {
                    Name = "Omnicell Medication Dispenser",
                    SystemApplication = "Omnicell Pharmacy",
                    Category = "Pharmacy",
                    ConnectionType = "SFTP / Direct File Import",
                    Description = "Automated dispensing cabinet inventory and dosage logs",
                    Status = "Active",
                    IconLogo = "pill",
                    LastSyncText = "1 min ago",
                    ConnectedOnText = "Mar 01, 2024",
                    DataSyncRateText = "100.0%",
                    DataLastSyncCount = 3200,
                    DataLastSyncText = "3,200 records synced",
                    NextSyncText = "Continuous",
                    EndpointUrl = "sftp://omnicell.internal.net/dispense-logs",
                    AuthType = "Basic Auth",
                    SyncInterval = "Real-Time",
                    Environment = "Production"
                },
                new IntegrationItemRecord
                {
                    Name = "LabCorp Diagnostic Gateway",
                    SystemApplication = "LabCorp",
                    Category = "Laboratory",
                    ConnectionType = "HL7 v2 / FHIR Interface",
                    Description = "Automated lab results, pathology reports, and vital panel processing",
                    Status = "Active",
                    IconLogo = "flask",
                    LastSyncText = "20 mins ago",
                    ConnectedOnText = "Mar 12, 2024",
                    DataSyncRateText = "97.5%",
                    DataLastSyncCount = 2150,
                    DataLastSyncText = "2,150 lab reports processed",
                    NextSyncText = "In 10 mins",
                    EndpointUrl = "https://interface.labcorp.com/hl7/v2",
                    AuthType = "Mutual TLS",
                    SyncInterval = "30 Minutes",
                    Environment = "Production"
                },
                new IntegrationItemRecord
                {
                    Name = "CoverMyMeds Prior Auth",
                    SystemApplication = "CoverMyMeds",
                    Category = "Insurance",
                    ConnectionType = "REST API (OAuth 2.0)",
                    Description = "Real-time insurance eligibility checks and prior authorization requests",
                    Status = "Active",
                    IconLogo = "shield",
                    LastSyncText = "1 hour ago",
                    ConnectedOnText = "Apr 05, 2024",
                    DataSyncRateText = "96.4%",
                    DataLastSyncCount = 940,
                    DataLastSyncText = "940 claims verified",
                    NextSyncText = "In 2 hours",
                    EndpointUrl = "https://api.covermymeds.com/v2/pa-requests",
                    AuthType = "OAuth 2.0",
                    SyncInterval = "Hourly",
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
                    ConnectedOnText = "May 01, 2024",
                    DataSyncRateText = "99.5%",
                    DataLastSyncCount = 14200,
                    DataLastSyncText = "14,200 messages dispatched",
                    NextSyncText = "Continuous",
                    EndpointUrl = "https://api.twilio.com/2010-04-01/Accounts",
                    AuthType = "API Key",
                    SyncInterval = "Real-Time",
                    Environment = "Production"
                },
                new IntegrationItemRecord
                {
                    Name = "QuickBooks Healthcare Billing",
                    SystemApplication = "QuickBooks Finance",
                    Category = "Insurance",
                    ConnectionType = "Database Replication Sync",
                    Description = "Patient copay, invoice ledger, and financial statement synchronization",
                    Status = "Inactive",
                    IconLogo = "dollar",
                    LastSyncText = "Yesterday",
                    ConnectedOnText = "Jun 15, 2024",
                    DataSyncRateText = "0.0%",
                    DataLastSyncCount = 0,
                    DataLastSyncText = "Paused",
                    NextSyncText = "Manual Only",
                    EndpointUrl = "https://quickbooks.api.intuit.com/v3/company",
                    AuthType = "OAuth 2.0",
                    SyncInterval = "Daily",
                    Environment = "Sandbox"
                },
                new IntegrationItemRecord
                {
                    Name = "Legacy Claims Gateway",
                    SystemApplication = "Clearinghouse v1",
                    Category = "Insurance",
                    ConnectionType = "SFTP / Direct File Import",
                    Description = "Legacy batch insurance claim exports (deprecated)",
                    Status = "Inactive",
                    IconLogo = "archive",
                    LastSyncText = "3 days ago",
                    ConnectedOnText = "Jan 01, 2023",
                    DataSyncRateText = "0.0%",
                    DataLastSyncCount = 0,
                    DataLastSyncText = "Disabled",
                    NextSyncText = "Disabled",
                    EndpointUrl = "sftp://claims-legacy.internal.org/exports",
                    AuthType = "Basic Auth",
                    SyncInterval = "Manual",
                    Environment = "Sandbox"
                },
                new IntegrationItemRecord
                {
                    Name = "PACS Imaging Node",
                    SystemApplication = "GE Healthcare PACS",
                    Category = "Laboratory",
                    ConnectionType = "HL7 v2 / FHIR Interface",
                    Description = "DICOM medical imaging archive and X-ray radiology sync",
                    Status = "Failed",
                    IconLogo = "film",
                    LastSyncText = "45 mins ago",
                    ConnectedOnText = "Jul 20, 2024",
                    DataSyncRateText = "45.0%",
                    DataLastSyncCount = 120,
                    DataLastSyncText = "Connection timeout error",
                    NextSyncText = "Retry scheduled",
                    EndpointUrl = "https://pacs.radiology.internal:8443/dicom-web",
                    AuthType = "Mutual TLS",
                    SyncInterval = "Real-Time",
                    Environment = "Production"
                }
            };
            context.IntegrationItemRecords.AddRange(integrations);
            await context.SaveChangesAsync();
        }

        // 13b. Seed Integration Activity Logs
        if (!await context.IntegrationActivityLogRecords.AnyAsync())
        {
            var logs = new List<IntegrationActivityLogRecord>
            {
                new IntegrationActivityLogRecord { DateTimeText = "May 20, 2026 07:10 AM", IntegrationName = "Document Storage", Event = "File Sync Completed", Status = "Success", Details = "Synchronized 142 medical attachment PDFs to S3 bucket", TriggeredBy = "System Schedule" },
                new IntegrationActivityLogRecord { DateTimeText = "May 20, 2026 07:05 AM", IntegrationName = "Epic EHR System", Event = "Patient Demographics Sync", Status = "Success", Details = "Updated 45 resident profiles via FHIR API", TriggeredBy = "System Schedule" },
                new IntegrationActivityLogRecord { DateTimeText = "May 20, 2026 06:50 AM", IntegrationName = "Omnicell Medication Dispenser", Event = "Inventory Audit Log Import", Status = "Success", Details = "Synced 3,200 medication dosage records", TriggeredBy = "Automated Dispatch" },
                new IntegrationActivityLogRecord { DateTimeText = "May 20, 2026 06:30 AM", IntegrationName = "PACS Imaging Node", Event = "DICOM Sync Failed", Status = "Failed", Details = "Connection reset by peer at pacs.radiology.internal", TriggeredBy = "System Schedule" },
                new IntegrationActivityLogRecord { DateTimeText = "May 20, 2026 06:00 AM", IntegrationName = "LabCorp Diagnostic Gateway", Event = "Lab Results Processed", Status = "Success", Details = "Ingested 128 lab panel HL7 messages", TriggeredBy = "Webhook Handler" },
                new IntegrationActivityLogRecord { DateTimeText = "May 20, 2026 05:15 AM", IntegrationName = "Twilio Care Messenger", Event = "Batch SMS Delivery", Status = "Success", Details = "Dispatched 350 shift reminder notifications", TriggeredBy = "System Cron" },
                new IntegrationActivityLogRecord { DateTimeText = "May 19, 2026 11:45 PM", IntegrationName = "CoverMyMeds Prior Auth", Event = "Eligibility Check", Status = "Success", Details = "Verified prior auth for 12 inpatient prescriptions", TriggeredBy = "Dr. Sarah Wilson" },
                new IntegrationActivityLogRecord { DateTimeText = "May 19, 2026 09:30 PM", IntegrationName = "Cerner Health Gateway", Event = "Scheduled Pathology Sync", Status = "Success", Details = "Imported 65 pathology reports", TriggeredBy = "System Schedule" }
            };
            context.IntegrationActivityLogRecords.AddRange(logs);
            await context.SaveChangesAsync();
        }

        // 13c. Seed Audit Log Entry Records
        if (!await context.AuditLogEntryRecords.AnyAsync())
        {
            var auditEntries = new List<AuditLogEntryRecord>
            {
                new AuditLogEntryRecord { DateTimeText = "May 20, 2026 07:15:30 AM", UserName = "John Admin", UserRole = "System Administrator", Action = "CREATE", Module = "Resident", RecordDescription = "Created new resident record Mary Johnson (RID-10023)", IpAddress = "192.168.1.25", Status = "Success" },
                new AuditLogEntryRecord { DateTimeText = "May 20, 2026 07:02:12 AM", UserName = "Priya Nurse", UserRole = "Charge Nurse", Action = "UPDATE", Module = "Medication", RecordDescription = "Administered Lisinopril 10mg dosage for Robert Johnson", IpAddress = "192.168.1.42", Status = "Success" },
                new AuditLogEntryRecord { DateTimeText = "May 20, 2026 06:45:00 AM", UserName = "Dr. David Allen", UserRole = "Attending Physician", Action = "LOGIN", Module = "Authentication", RecordDescription = "User authentication successful via Portal SSO", IpAddress = "192.168.1.88", Status = "Success" },
                new AuditLogEntryRecord { DateTimeText = "May 20, 2026 06:30:15 AM", UserName = "Unknown User", UserRole = "Guest", Action = "LOGIN_FAIL", Module = "Authentication", RecordDescription = "Failed login attempt from IP 185.220.101.5 (Invalid credentials)", IpAddress = "185.220.101.5", Status = "Failed" },
                new AuditLogEntryRecord { DateTimeText = "May 20, 2026 06:10:44 AM", UserName = "Dr. Sarah Wilson", UserRole = "Chief Medical Officer", Action = "UPDATE", Module = "Clinical Note", RecordDescription = "Updated SOAP clinical encounter notes for Jane Doe (P-1001)", IpAddress = "192.168.1.15", Status = "Success" },
                new AuditLogEntryRecord { DateTimeText = "May 20, 2026 05:50:20 AM", UserName = "John Admin", UserRole = "System Administrator", Action = "EXPORT", Module = "Resident", RecordDescription = "Exported monthly resident census report to PDF", IpAddress = "192.168.1.25", Status = "Success" },
                new AuditLogEntryRecord { DateTimeText = "May 19, 2026 11:30:10 PM", UserName = "Priya Nurse", UserRole = "Charge Nurse", Action = "CREATE", Module = "Task", RecordDescription = "Assigned vital round check task for Emily Davis (Room 305)", IpAddress = "192.168.1.42", Status = "Success" },
                new AuditLogEntryRecord { DateTimeText = "May 19, 2026 10:15:05 PM", UserName = "Dr. David Allen", UserRole = "Attending Physician", Action = "UPDATE", Module = "Medication", RecordDescription = "Modified prescription dosage for Metformin 500mg", IpAddress = "192.168.1.88", Status = "Success" },
                new AuditLogEntryRecord { DateTimeText = "May 19, 2026 09:40:50 PM", UserName = "John Admin", UserRole = "System Administrator", Action = "DELETE", Module = "Task", RecordDescription = "Deleted duplicate shift handover task TSK-904", IpAddress = "192.168.1.25", Status = "Success" },
                new AuditLogEntryRecord { DateTimeText = "May 19, 2026 08:22:18 PM", UserName = "Priya Nurse", UserRole = "Charge Nurse", Action = "LOGIN", Module = "Authentication", RecordDescription = "Night shift session started", IpAddress = "192.168.1.42", Status = "Success" },
                new AuditLogEntryRecord { DateTimeText = "May 19, 2026 07:05:00 PM", UserName = "Dr. Sarah Wilson", UserRole = "Chief Medical Officer", Action = "LOGIN_FAIL", Module = "Authentication", RecordDescription = "Incorrect MFA security code provided", IpAddress = "192.168.1.15", Status = "Failed" },
                new AuditLogEntryRecord { DateTimeText = "May 19, 2026 05:15:33 PM", UserName = "John Admin", UserRole = "System Administrator", Action = "UPDATE", Module = "System", RecordDescription = "Updated OAuth 2.0 connection credentials for Epic EHR Integration", IpAddress = "192.168.1.25", Status = "Success" }
            };
            context.AuditLogEntryRecords.AddRange(auditEntries);
            await context.SaveChangesAsync();
        }

        // 13d. Seed AI Service Status Records
        if (!await context.AiServiceStatusRecords.AnyAsync())
        {
            var services = new List<AiServiceStatusRecord>
            {
                new AiServiceStatusRecord { ServiceName = "Clinical Note Assistant", Status = "Healthy", ModelVersion = "gpt-4o", UptimePercentage = "99.9%" },
                new AiServiceStatusRecord { ServiceName = "Medication Assistant", Status = "Healthy", ModelVersion = "gpt-4o-mini", UptimePercentage = "99.8%" },
                new AiServiceStatusRecord { ServiceName = "Care Plan Generator", Status = "Healthy", ModelVersion = "claude-3-haiku", UptimePercentage = "99.7%" },
                new AiServiceStatusRecord { ServiceName = "Document Summarizer", Status = "Healthy", ModelVersion = "gpt-4o", UptimePercentage = "99.9%" },
                new AiServiceStatusRecord { ServiceName = "Insights & Analytics", Status = "Healthy", ModelVersion = "gpt-4o", UptimePercentage = "99.6%" },
                new AiServiceStatusRecord { ServiceName = "Conversation Assistant", Status = "Degraded", ModelVersion = "gpt-3.5-turbo", UptimePercentage = "98.2%" },
                new AiServiceStatusRecord { ServiceName = "Image Analysis", Status = "Healthy", ModelVersion = "gemini-1.5-pro", UptimePercentage = "99.5%" }
            };
            context.AiServiceStatusRecords.AddRange(services);
            await context.SaveChangesAsync();
        }

        // 13e. Seed AI Workflow Metric Records
        if (!await context.AiWorkflowMetricRecords.AnyAsync())
        {
            var workflows = new List<AiWorkflowMetricRecord>
            {
                new AiWorkflowMetricRecord { WorkflowName = "Clinical Note Assistant", RequestsCount = 4562, SuccessRate = "96.3%", AvgResponseTimeSeconds = "1.21 sec" },
                new AiWorkflowMetricRecord { WorkflowName = "Medication Interaction Check", RequestsCount = 3842, SuccessRate = "97.1%", AvgResponseTimeSeconds = "1.18 sec" },
                new AiWorkflowMetricRecord { WorkflowName = "Care Plan Recommendation", RequestsCount = 2984, SuccessRate = "94.7%", AvgResponseTimeSeconds = "1.56 sec" },
                new AiWorkflowMetricRecord { WorkflowName = "Document Summarization", RequestsCount = 2156, SuccessRate = "95.9%", AvgResponseTimeSeconds = "1.33 sec" },
                new AiWorkflowMetricRecord { WorkflowName = "Patient Risk Analysis", RequestsCount = 1854, SuccessRate = "93.8%", AvgResponseTimeSeconds = "1.78 sec" }
            };
            context.AiWorkflowMetricRecords.AddRange(workflows);
            await context.SaveChangesAsync();
        }

        // 13f. Seed AI Activity Log Records
        if (!await context.AiActivityLogRecords.AnyAsync())
        {
            var aiActivities = new List<AiActivityLogRecord>
            {
                new AiActivityLogRecord { TimeText = "10:15 AM", Title = "Clinical Note generated successfully", ResidentInfo = "Resident: Mary Johnson (RID-10023)", Type = "Success", Service = "Clinical Note Assistant" },
                new AiActivityLogRecord { TimeText = "10:12 AM", Title = "Medication interaction checked", ResidentInfo = "Resident: Robert Brown (RID-10045)", Type = "Success", Service = "Medication Assistant" },
                new AiActivityLogRecord { TimeText = "10:10 AM", Title = "Care plan recommendations generated", ResidentInfo = "Resident: Anita Sharma (RID-10011)", Type = "Success", Service = "Care Plan Generator" },
                new AiActivityLogRecord { TimeText = "10:08 AM", Title = "Document summarized", ResidentInfo = "File: Lab Results - May 19, 2025", Type = "Info", Service = "Document Summarizer" },
                new AiActivityLogRecord { TimeText = "10:05 AM", Title = "High priority alert summary generated", ResidentInfo = "Incident: Fall Alert - RID-10032", Type = "Success", Service = "Insights & Analytics" },
                new AiActivityLogRecord { TimeText = "10:02 AM", Title = "Image analysis completed", ResidentInfo = "Type: Skin Assessment", Type = "Success", Service = "Image Analysis" },
                new AiActivityLogRecord { TimeText = "10:01 AM", Title = "AI request failed", ResidentInfo = "Service: Conversation Assistant", Type = "Error", Service = "Conversation Assistant" },
                new AiActivityLogRecord { TimeText = "09:55 AM", Title = "Discharge summary draft created", ResidentInfo = "Resident: James Wilson (RID-10019)", Type = "Success", Service = "Clinical Note Assistant" },
                new AiActivityLogRecord { TimeText = "09:48 AM", Title = "Dosage safety analysis completed", ResidentInfo = "Resident: Patricia Taylor (RID-10088)", Type = "Success", Service = "Medication Assistant" },
                new AiActivityLogRecord { TimeText = "09:35 AM", Title = "Lab report PDF parsed", ResidentInfo = "File: Blood Panel - May 20, 2026", Type = "Info", Service = "Document Summarizer" },
                new AiActivityLogRecord { TimeText = "09:20 AM", Title = "High risk fall risk flag triggered", ResidentInfo = "Resident: Charles Davis (RID-10052)", Type = "Warning", Service = "Insights & Analytics" },
                new AiActivityLogRecord { TimeText = "09:05 AM", Title = "Wound healing progress score calculated", ResidentInfo = "Resident: Margaret Miller (RID-10064)", Type = "Success", Service = "Image Analysis" },
                new AiActivityLogRecord { TimeText = "08:50 AM", Title = "Daily shift summary generated", ResidentInfo = "Unit: Assisted Living Wing A", Type = "Success", Service = "Clinical Note Assistant" },
                new AiActivityLogRecord { TimeText = "08:30 AM", Title = "Allergy cross-reference timeout", ResidentInfo = "Service: Medication Assistant", Type = "Error", Service = "Medication Assistant" },
                new AiActivityLogRecord { TimeText = "08:15 AM", Title = "Care goal progress updated", ResidentInfo = "Resident: Dorothy Anderson (RID-10077)", Type = "Success", Service = "Care Plan Generator" }
            };
            context.AiActivityLogRecords.AddRange(aiActivities);
            await context.SaveChangesAsync();
        }

        // 14. Seed Activity Summary Logs
        if (!await context.ActivitySummaryLogs.AnyAsync())
        {
            var activityLogs = new List<ActivitySummaryLog>
            {
                new ActivitySummaryLog { ActivityType = "Patient Admission", Details = "Patient Jane Doe admitted to Med-Surg Unit 2 (Room 205)", RelatedTo = "Jane Doe (P-1001)", LocationUnit = "Med-Surg Unit 2", DateTimeText = "May 19, 2025 09:30 AM", PerformedBy = "Dr. Michael Brown" },
                new ActivitySummaryLog { ActivityType = "Medication Administered", Details = "Administered Lisinopril 10mg to Robert Johnson", RelatedTo = "Robert Johnson (P-1002)", LocationUnit = "Cardiology Unit", DateTimeText = "May 19, 2025 10:15 AM", PerformedBy = "Priya Nurse" },
                new ActivitySummaryLog { ActivityType = "Critical Alert Cleared", Details = "High heart rate alarm resolved for Emily Davis", RelatedTo = "Emily Davis (P-1003)", LocationUnit = "ICU", DateTimeText = "May 19, 2025 10:45 AM", PerformedBy = "Dr. Sarah Wilson" }
            };
            context.ActivitySummaryLogs.AddRange(activityLogs);
            await context.SaveChangesAsync();
        }

        // 15. Seed Clinical Encounters
        if (!await context.ClinicalEncounterRecords.AnyAsync())
        {
            var encounters = new List<ClinicalEncounterRecord>
            {
                new ClinicalEncounterRecord { DateText = "May 19, 2025 09:15 AM", PatientName = "Jane Doe", PatientIdCode = "P-1001", EncounterType = "Inpatient Review", ProviderName = "Dr. Michael Brown", ReasonDiagnosis = "Hypertension (I10) follow-up and dosage adjustment" },
                new ClinicalEncounterRecord { DateText = "May 18, 2025 02:30 PM", PatientName = "Robert Johnson", PatientIdCode = "P-1002", EncounterType = "Outpatient Consultation", ProviderName = "Dr. Sarah Wilson", ReasonDiagnosis = "Routine chest X-ray and cardiac monitoring" },
                new ClinicalEncounterRecord { DateText = "May 18, 2025 11:00 AM", PatientName = "Patricia Smith", PatientIdCode = "PT-10001", EncounterType = "Outpatient Consultation", ProviderName = "Dr. Michael Brown", ReasonDiagnosis = "Type 2 Diabetes Mellitus (E11) management" },
                new ClinicalEncounterRecord { DateText = "May 17, 2025 04:45 PM", PatientName = "Michael Davis", PatientIdCode = "PT-10002", EncounterType = "Emergency Encounter", ProviderName = "Dr. Sarah Wilson", ReasonDiagnosis = "COPD Exacerbation (J44.1) acute care" },
                new ClinicalEncounterRecord { DateText = "May 17, 2025 01:20 PM", PatientName = "Linda Martinez", PatientIdCode = "PT-10003", EncounterType = "Telehealth Review", ProviderName = "Dr. Michael Brown", ReasonDiagnosis = "Asthma (J45.9) medication review" },
                new ClinicalEncounterRecord { DateText = "May 16, 2025 10:00 AM", PatientName = "Emily Davis", PatientIdCode = "P-1003", EncounterType = "Inpatient Review", ProviderName = "Dr. Sarah Wilson", ReasonDiagnosis = "Post-surgical Osteoarthritis (M17.9) monitoring" }
            };
            context.ClinicalEncounterRecords.AddRange(encounters);
            await context.SaveChangesAsync();
        }

        // 16. Seed Financial Transactions
        if (!await context.FinancialTransactionRecords.AnyAsync())
        {
            var transactions = new List<FinancialTransactionRecord>
            {
                new FinancialTransactionRecord { DateText = "May 19, 2025 10:32 AM", Type = "Payment Received", Reference = "RCPT-12548", CustomerVendor = "Star Health Insurance", AmountText = "₹ 54,320", Status = "Received" },
                new FinancialTransactionRecord { DateText = "May 18, 2025 11:20 AM", Type = "Invoice Generated", Reference = "INV-45878", CustomerVendor = "Robert Brown", AmountText = "₹ 17,300", Status = "Sent" },
                new FinancialTransactionRecord { DateText = "May 18, 2025 04:10 PM", Type = "Bill Paid", Reference = "BILL-78965", CustomerVendor = "MedSupply Solutions", AmountText = "₹ 32,450", Status = "Paid" },
                new FinancialTransactionRecord { DateText = "May 17, 2025 03:15 PM", Type = "Payment Received", Reference = "RCPT-12549", CustomerVendor = "CareFirst Corporate", AmountText = "₹ 1,02,520", Status = "Received" },
                new FinancialTransactionRecord { DateText = "May 17, 2025 09:40 AM", Type = "Bill Paid", Reference = "BILL-78966", CustomerVendor = "City Power & Utilities", AmountText = "₹ 2,10,560", Status = "Paid" },
                new FinancialTransactionRecord { DateText = "May 16, 2025 02:00 PM", Type = "Invoice Generated", Reference = "INV-45879", CustomerVendor = "National Health Scheme", AmountText = "₹ 2,45,600", Status = "Sent" }
            };
            context.FinancialTransactionRecords.AddRange(transactions);
            await context.SaveChangesAsync();
        }

        // 17. Seed App Roles
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

        // 18. Seed ONLY Default Admin User (Prevent duplicate Admin accounts on startup)
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
                Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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

        // 19. Assign Admin Role to default Admin User
        if (adminRole != null && !await context.UserRoles.AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == adminRole.Id))
        {
            context.UserRoles.Add(new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id });
            await context.SaveChangesAsync();
        }

        // 20. Clean up any previously seeded default non-admin and legacy demo users (Ensures system is Admin-only by default)
        var defaultNonAdminUsers = await context.Users
            .Where(u => (u.Username.ToLower() == "doctor" || u.Username.ToLower() == "nurse" || u.Username.ToLower() == "john.admin" || u.Email.ToLower() == "doctor@connectcare.org" || u.Email.ToLower() == "nurse@connectcare.org" || u.Email.ToLower() == "john.admin@ccare.com") && u.Username.ToLower() != "admin")
            .ToListAsync();

        if (defaultNonAdminUsers.Count > 0)
        {
            var defaultUserIds = defaultNonAdminUsers.Select(u => u.Id).ToList();
            var userRolesToRemove = await context.UserRoles.Where(ur => defaultUserIds.Contains(ur.UserId)).ToListAsync();
            context.UserRoles.RemoveRange(userRolesToRemove);
            context.Users.RemoveRange(defaultNonAdminUsers);
            await context.SaveChangesAsync();
        }

        // 21. Seed AppPermissions Catalog and RolePermissions (Ensuring Admin role has ALL permissions)
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

        // 22. Auto-migrate existing Patients with PrimaryDoctorId to patient_doctors
        var patientsWithDoc = await context.Patients.Where(p => p.PrimaryDoctorId != null).ToListAsync();
        foreach (var p in patientsWithDoc)
        {
            if (!await context.PatientDoctors.AnyAsync(pd => pd.PatientId == p.Id && pd.DoctorId == p.PrimaryDoctorId!.Value))
            {
                context.PatientDoctors.Add(new PatientDoctor
                {
                    PatientId = p.Id,
                    DoctorId = p.PrimaryDoctorId!.Value,
                    IsPrimary = true,
                    AssignedDate = DateTime.UtcNow,
                    Notes = "Primary attending physician assignment"
                });
            }
        }
        await context.SaveChangesAsync();

        // 23. Auto-migrate existing CareTeamMembers nurses to patient_nurses
        var careTeamNurses = await context.CareTeamMembers
            .Where(ct => ct.PatientId != null && ct.NurseId != null)
            .ToListAsync();
        foreach (var ctm in careTeamNurses)
        {
            if (!await context.PatientNurses.AnyAsync(pn => pn.PatientId == ctm.PatientId!.Value && pn.NurseId == ctm.NurseId!.Value))
            {
                context.PatientNurses.Add(new PatientNurse
                {
                    PatientId = ctm.PatientId!.Value,
                    NurseId = ctm.NurseId!.Value,
                    IsPrimary = false,
                    Shift = ctm.Shift,
                    AssignedDate = DateTime.UtcNow,
                    Notes = "Care team nurse assignment"
                });
            }
        }
        await context.SaveChangesAsync();

        // 19. Seed App Menu Items
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

                // Doctor Menus (Image 1)
                new MenuItem { MenuKey = "doc_dashboard", Title = "Dashboard", Path = "/dashboard", Icon = "LayoutDashboard", SortOrder = 1, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_patients", Title = "My Patients", Path = "/patients", Icon = "Users", SortOrder = 2, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_schedule", Title = "Schedule", Path = "/care-teams", Icon = "Calendar", SortOrder = 3, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_consultations", Title = "Consultations", Path = "/reports/clinical", Icon = "Stethoscope", SortOrder = 4, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_care_plans", Title = "Care Plans", Path = "/reports/operational", Icon = "HeartPulse", SortOrder = 5, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_tasks", Title = "Tasks", Path = "/tasks", Icon = "CheckSquare", SortOrder = 6, RolesAllowedJson = "[\"Doctor\"]", BadgeType = "count", BadgeValue = "6" },
                new MenuItem { MenuKey = "doc_alerts", Title = "Alerts", Path = "/alerts", Icon = "Bell", SortOrder = 7, RolesAllowedJson = "[\"Doctor\"]", BadgeType = "count", BadgeValue = "3" },
                new MenuItem { MenuKey = "doc_messages", Title = "Messages", Path = "/integrations", Icon = "MessageSquare", SortOrder = 8, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_documents", Title = "Documents", Path = "/custom-reports", Icon = "FileText", SortOrder = 9, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_reports", Title = "Reports", Path = "/reports", Icon = "BarChart2", SortOrder = 10, RolesAllowedJson = "[\"Doctor\"]" },
                new MenuItem { MenuKey = "doc_ai", Title = "AI Assistant", Path = "/ai-operations", Icon = "Sparkles", SortOrder = 11, RolesAllowedJson = "[\"Doctor\"]", BadgeType = "new", BadgeValue = "New" },
                new MenuItem { MenuKey = "doc_settings", Title = "Settings", Path = "/settings", Icon = "Settings", SortOrder = 12, RolesAllowedJson = "[\"Doctor\"]" },

                // Nurse Menus (Image 2)
                new MenuItem { MenuKey = "nurse_dashboard", Title = "Dashboard", Path = "/dashboard", Icon = "LayoutDashboard", SortOrder = 1, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_patients", Title = "My Patients", Path = "/patients", Icon = "Users", SortOrder = 2, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_vitals", Title = "Vital Rounds", Path = "/vital-rounds", Icon = "Activity", SortOrder = 3, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_medications", Title = "Medications", Path = "/medications", Icon = "Pill", SortOrder = 4, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_tasks", Title = "Tasks", Path = "/tasks", Icon = "CheckSquare", SortOrder = 5, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_alerts", Title = "Alerts", Path = "/alerts", Icon = "Bell", SortOrder = 6, RolesAllowedJson = "[\"Nurse\"]", BadgeType = "count", BadgeValue = "6" },
                new MenuItem { MenuKey = "nurse_handover", Title = "Shift Handover", Path = "/care-teams", Icon = "Repeat", SortOrder = 7, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_doc", Title = "Documentation", Path = "/custom-reports", Icon = "FileEdit", SortOrder = 8, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_care_plans", Title = "Care Plans", Path = "/care-plans", Icon = "HeartPulse", SortOrder = 9, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_consult", Title = "Consultations", Path = "/consultations", Icon = "UserCheck", SortOrder = 10, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_discharge", Title = "Discharge Checklist", Path = "/discharge-checklist", Icon = "ClipboardCheck", SortOrder = 11, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_reports", Title = "Reports", Path = "/reports", Icon = "BarChart2", SortOrder = 12, RolesAllowedJson = "[\"Nurse\"]" },
                new MenuItem { MenuKey = "nurse_messages", Title = "Messages", Path = "/integrations", Icon = "MessageSquare", SortOrder = 13, RolesAllowedJson = "[\"Nurse\"]", BadgeType = "count", BadgeValue = "8" },
                new MenuItem { MenuKey = "nurse_settings", Title = "Settings & Profile", Path = "/settings", Icon = "Settings", SortOrder = 14, RolesAllowedJson = "[\"Nurse\"]" }
            };
            context.MenuItems.AddRange(menuItems);
            await context.SaveChangesAsync();
        }

        // 17. Seed Doctor Consultations
        if (!await context.DoctorConsultations.AnyAsync())
        {
            var doctorConsultations = new List<DoctorConsultation>
            {
                new DoctorConsultation
                {
                    DoctorName = "Dr. Sarah Wilson",
                    PatientName = "Robert Johnson",
                    PatientIdCode = "PT-10001",
                    DateText = "May 21, 2024 09:30 AM",
                    ConsultationType = "Follow-up Consultation",
                    ChiefComplaint = "Slight shortness of breath on exertion and mild ankle swelling.",
                    Diagnosis = "Hypertension & Controlled Type 2 Diabetes Mellitus",
                    ClinicalNotes = "Patient presents for regular follow-up. Blood pressure slightly elevated at 146/88. Continue Lisinopril 10mg once daily and Metformin 500mg twice daily. Advised low sodium diet.",
                    Status = "Completed"
                },
                new DoctorConsultation
                {
                    DoctorName = "Dr. Sarah Wilson",
                    PatientName = "Mary Williams",
                    PatientIdCode = "PT-10002",
                    DateText = "May 21, 2024 10:30 AM",
                    ConsultationType = "Routine Check-up",
                    ChiefComplaint = "Annual wellness exam and medication review.",
                    Diagnosis = "Essential Hypertension - Stable",
                    ClinicalNotes = "Routine physical exam unremarkable. Heart rate 78 bpm. Vital signs stable. Patient compliant with daily exercise routine.",
                    Status = "Completed"
                },
                new DoctorConsultation
                {
                    DoctorName = "Dr. Sarah Wilson",
                    PatientName = "Michael Brown",
                    PatientIdCode = "PT-10003",
                    DateText = "May 21, 2024 11:30 AM",
                    ConsultationType = "Blood Pressure Check",
                    ChiefComplaint = "Headaches in morning and elevated home BP readings.",
                    Diagnosis = "Stage 2 Hypertension",
                    ClinicalNotes = "BP recorded at 158/94 mmHg. Adjusted Amlodipine dosage and scheduled follow-up in 14 days. Ordered comprehensive metabolic panel.",
                    Status = "Pending"
                }
            };
            context.DoctorConsultations.AddRange(doctorConsultations);
            await context.SaveChangesAsync();
        }

        // 18. Seed Patient Care Plans
        if (!await context.PatientCarePlanRecords.AnyAsync())
        {
            var carePlans = new List<PatientCarePlanRecord>
            {
                new PatientCarePlanRecord
                {
                    PatientName = "Robert Johnson",
                    PatientIdCode = "PT-10001",
                    PlanName = "Hypertension Management Plan",
                    StartDate = "May 01, 2024",
                    ReviewDate = "Jun 01, 2024",
                    ProgressPercentage = 75,
                    GoalsText = "Maintain BP below 130/80 mmHg; Follow low-sodium diet; Exercise 30 minutes daily; Take medications as prescribed",
                    NotesText = "Patient is responding well to current treatment. Continue monitoring and lifestyle modification.",
                    Status = "Active",
                    PrescribedBy = "Dr. Sarah Wilson"
                },
                new PatientCarePlanRecord
                {
                    PatientName = "Mary Williams",
                    PatientIdCode = "PT-10002",
                    PlanName = "Diabetes Type 2 Care Management",
                    StartDate = "Apr 15, 2024",
                    ReviewDate = "Jul 15, 2024",
                    ProgressPercentage = 85,
                    GoalsText = "Maintain HbA1c < 7.0%; Monitor blood glucose twice daily; Foot exam every 6 months",
                    NotesText = "Glucose levels well controlled. Patient completed diabetic education program.",
                    Status = "Active",
                    PrescribedBy = "Dr. Sarah Wilson"
                }
            };
            context.PatientCarePlanRecords.AddRange(carePlans);
            await context.SaveChangesAsync();
        }

        // 19. Seed Patient Documents
        if (!await context.PatientDocumentRecords.AnyAsync())
        {
            var docs = new List<PatientDocumentRecord>
            {
                new PatientDocumentRecord
                {
                    PatientName = "Robert Johnson",
                    PatientIdCode = "PT-10001",
                    DocumentName = "Consultation Note - May 20, 2024",
                    DocumentType = "Consultation Note",
                    Category = "Notes",
                    UploadedDate = "May 20, 2024",
                    FileSizeText = "450 KB",
                    UploadedBy = "Dr. Sarah Wilson"
                },
                new PatientDocumentRecord
                {
                    PatientName = "Robert Johnson",
                    PatientIdCode = "PT-10001",
                    DocumentName = "Lab Report - May 18, 2024",
                    DocumentType = "Lab Report",
                    Category = "Lab Results",
                    UploadedDate = "May 18, 2024",
                    FileSizeText = "1.8 MB",
                    UploadedBy = "Pathology Lab"
                },
                new PatientDocumentRecord
                {
                    PatientName = "Robert Johnson",
                    PatientIdCode = "PT-10001",
                    DocumentName = "X-Ray Chest Report",
                    DocumentType = "Imaging Report",
                    Category = "Imaging",
                    UploadedDate = "May 17, 2024",
                    FileSizeText = "4.2 MB",
                    UploadedBy = "Radiology Dept"
                },
                new PatientDocumentRecord
                {
                    PatientName = "Robert Johnson",
                    PatientIdCode = "PT-10001",
                    DocumentName = "ECG Report",
                    DocumentType = "Diagnostic",
                    Category = "Cardiology",
                    UploadedDate = "May 17, 2024",
                    FileSizeText = "980 KB",
                    UploadedBy = "Dr. Sarah Wilson"
                }
            };
            context.PatientDocumentRecords.AddRange(docs);
            await context.SaveChangesAsync();
        }

        // 20. Seed Doctor AI Conversations
        if (!await context.DoctorAiConversations.AnyAsync())
        {
            var aiConvos = new List<DoctorAiConversation>
            {
                new DoctorAiConversation
                {
                    DoctorName = "Dr. Sarah Wilson",
                    PatientName = "Robert Johnson",
                    PatientIdCode = "PT-10001",
                    PromptQuery = "Summarize Robert Johnson's health status and recent concerns.",
                    AiResponse = "**Patient Summary:** Robert Johnson is a 68-year-old male with a history of hypertension, type 2 diabetes mellitus, and hyperlipidemia. He is under regular follow-up for cardiovascular risk management.\n\n**Recent Concerns:**\n• Blood pressure has been slightly elevated in recent visits (avg 146/88 mmHg).\n• HbA1c improved to 7.2% (Apr 28, 2024) from 7.8%.\n• Reports occasional chest discomfort on exertion.\n• Mild ankle swelling noted in last visit.\n\n**Current Medications:**\n• Lisinopril 10 mg once daily\n• Metformin 500 mg twice daily\n• Atorvastatin 20 mg once daily\n• Aspirin 81 mg once daily",
                    Category = "SOAP Note"
                },
                new DoctorAiConversation
                {
                    DoctorName = "Dr. Sarah Wilson",
                    PatientName = "Robert Johnson",
                    PatientIdCode = "PT-10001",
                    PromptQuery = "Any potential drug interactions with his current medications?",
                    AiResponse = "No major drug interactions found among current medications. However, consider the following:\n\n• **Aspirin** may increase the risk of bleeding if taken with NSAIDs.\n• **Atorvastatin** may interact with certain antibiotics (e.g., clarithromycin) or antifungals.\n• Monitor kidney function periodically due to Metformin and Lisinopril combination.",
                    Category = "Drug Interactions"
                }
            };
            context.DoctorAiConversations.AddRange(aiConvos);
            await context.SaveChangesAsync();
        }

        // 21. Seed Discharge Checklists (Matching Image 1)
        if (!await context.DischargeChecklists.AnyAsync())
        {
            var checklists = new List<DischargeChecklistRecord>
            {
                new DischargeChecklistRecord { PatientName = "Patricia Smith", PatientIdCode = "PT-10001", PatientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", AgeGender = "68 Y • Female", BloodGroup = "A+", RoomNumber = "302", CareUnit = "Cardiology Unit", AdmitDateText = "May 18, 2024", AdmitDaysText = "4 days", ChecklistStatus = DischargeStatus.InProgress, ProgressPercentage = 70, PendingItemsCount = 2, TotalItemsCount = 14, CompletedItemsCount = 7, InProgressItemsCount = 4, NotStartedItemsCount = 1, ExpectedDischargeText = "May 22, 2024", ExpectedDischargeRelative = "Today", AttendingDoctorName = "Dr. Sarah Wilson", CareTeamMembersCount = 3 },
                new DischargeChecklistRecord { PatientName = "Michael Davis", PatientIdCode = "PT-10002", PatientAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", AgeGender = "72 Y • Male", BloodGroup = "O+", RoomNumber = "201", CareUnit = "Medical Unit", AdmitDateText = "May 16, 2024", AdmitDaysText = "6 days", ChecklistStatus = DischargeStatus.Ready, ProgressPercentage = 100, PendingItemsCount = 0, TotalItemsCount = 14, CompletedItemsCount = 14, InProgressItemsCount = 0, NotStartedItemsCount = 0, ExpectedDischargeText = "May 22, 2024", ExpectedDischargeRelative = "Today", AttendingDoctorName = "Dr. Michael Brown", CareTeamMembersCount = 4 },
                new DischargeChecklistRecord { PatientName = "Linda Martinez", PatientIdCode = "PT-10003", PatientAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", AgeGender = "69 Y • Female", BloodGroup = "B+", RoomNumber = "305", CareUnit = "Surgical Unit", AdmitDateText = "May 14, 2024", AdmitDaysText = "8 days", ChecklistStatus = DischargeStatus.InProgress, ProgressPercentage = 60, PendingItemsCount = 3, TotalItemsCount = 14, CompletedItemsCount = 6, InProgressItemsCount = 5, NotStartedItemsCount = 0, ExpectedDischargeText = "May 23, 2024", ExpectedDischargeRelative = "Tomorrow", AttendingDoctorName = "Dr. Emily Clark", CareTeamMembersCount = 3 },
                new DischargeChecklistRecord { PatientName = "James Brown", PatientIdCode = "PT-10004", PatientAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", AgeGender = "65 Y • Male", BloodGroup = "AB+", RoomNumber = "102", CareUnit = "General Ward", AdmitDateText = "May 15, 2024", AdmitDaysText = "7 days", ChecklistStatus = DischargeStatus.PendingItems, ProgressPercentage = 85, PendingItemsCount = 1, TotalItemsCount = 14, CompletedItemsCount = 10, InProgressItemsCount = 3, NotStartedItemsCount = 0, ExpectedDischargeText = "May 24, 2024", ExpectedDischargeRelative = "In 2 days", AttendingDoctorName = "Dr. James Lee", CareTeamMembersCount = 2 },
                new DischargeChecklistRecord { PatientName = "Mary Williams", PatientIdCode = "PT-10005", PatientAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", AgeGender = "34 Y • Female", BloodGroup = "A-", RoomNumber = "401", CareUnit = "Maternity Unit", AdmitDateText = "May 17, 2024", AdmitDaysText = "5 days", ChecklistStatus = DischargeStatus.Ready, ProgressPercentage = 100, PendingItemsCount = 0, TotalItemsCount = 14, CompletedItemsCount = 14, InProgressItemsCount = 0, NotStartedItemsCount = 0, ExpectedDischargeText = "May 21, 2024", ExpectedDischargeRelative = "Yesterday", AttendingDoctorName = "Dr. Anita Sharma", CareTeamMembersCount = 5 },
                new DischargeChecklistRecord { PatientName = "Robert Johnson", PatientIdCode = "PT-10006", PatientAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80", AgeGender = "58 Y • Male", BloodGroup = "O-", RoomNumber = "502", CareUnit = "Neurology Unit", AdmitDateText = "May 10, 2024", AdmitDaysText = "12 days", ChecklistStatus = DischargeStatus.InProgress, ProgressPercentage = 40, PendingItemsCount = 4, TotalItemsCount = 14, CompletedItemsCount = 4, InProgressItemsCount = 6, NotStartedItemsCount = 0, ExpectedDischargeText = "May 25, 2024", ExpectedDischargeRelative = "In 3 days", AttendingDoctorName = "Dr. David Patel", CareTeamMembersCount = 4 },
                new DischargeChecklistRecord { PatientName = "Sarah Wilson", PatientIdCode = "PT-10007", PatientAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", AgeGender = "29 Y • Female", BloodGroup = "B-", RoomNumber = "307", CareUnit = "Medical Unit", AdmitDateText = "May 11, 2024", AdmitDaysText = "11 days", ChecklistStatus = DischargeStatus.Cancelled, ProgressPercentage = 0, PendingItemsCount = 0, TotalItemsCount = 14, CompletedItemsCount = 0, InProgressItemsCount = 0, NotStartedItemsCount = 14, ExpectedDischargeText = "-", ExpectedDischargeRelative = "-", AttendingDoctorName = "Dr. Linda Martinez", CareTeamMembersCount = 2 },
                new DischargeChecklistRecord { PatientName = "William Taylor", PatientIdCode = "PT-10008", PatientAvatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80", AgeGender = "40 Y • Male", BloodGroup = "A+", RoomNumber = "101", CareUnit = "General Ward", AdmitDateText = "May 19, 2024", AdmitDaysText = "3 days", ChecklistStatus = DischargeStatus.Ready, ProgressPercentage = 100, PendingItemsCount = 0, TotalItemsCount = 14, CompletedItemsCount = 14, InProgressItemsCount = 0, NotStartedItemsCount = 0, ExpectedDischargeText = "May 23, 2024", ExpectedDischargeRelative = "Tomorrow", AttendingDoctorName = "Dr. Robert Johnson", CareTeamMembersCount = 3 }
            };
            context.DischargeChecklists.AddRange(checklists);
            await context.SaveChangesAsync();
        }

        // 22. Seed Consultations (Matching Image 2)
        if (!await context.Consultations.AnyAsync())
        {
            var consultations = new List<ConsultationRecord>
            {
                new ConsultationRecord { PatientName = "Patricia Smith", PatientIdCode = "PT-10001", PatientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", RoomNumber = "302", CareUnit = "Cardiology Unit", AgeGender = "68 Y • Female", BloodGroup = "A+", ConsultationType = "Cardiology Consult", ConsultationSubtitle = "Heart Failure", ConsultationIcon = "HeartPulse", PhysicianName = "Dr. Sarah Wilson", PhysicianRole = "Cardiologist", PhysicianAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", DateTimeText = "May 22, 2024 09:45 AM", Location = "Cardiology OPD", Reason = "Shortness of breath, fatigue", Status = ConsultationStatus.InProgress, FollowUpDateText = "May 29, 2024", ClinicalNotes = "Patient presents with mild ankle swelling and dyspnea." },
                new ConsultationRecord { PatientName = "Michael Davis", PatientIdCode = "PT-10002", PatientAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", RoomNumber = "201", CareUnit = "Medical Unit", AgeGender = "72 Y • Male", BloodGroup = "O+", ConsultationType = "Medical Consult", ConsultationSubtitle = "COPD", ConsultationIcon = "Stethoscope", PhysicianName = "Dr. Michael Brown", PhysicianRole = "General Physician", PhysicianAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80", DateTimeText = "May 22, 2024 10:30 AM", Location = "Room 201", Reason = "Routine respiratory check", Status = ConsultationStatus.Completed, FollowUpDateText = "May 30, 2024", ClinicalNotes = "Lungs clear to auscultation bilaterally." },
                new ConsultationRecord { PatientName = "Linda Martinez", PatientIdCode = "PT-10003", PatientAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", RoomNumber = "305", CareUnit = "Surgical Unit", AgeGender = "69 Y • Female", BloodGroup = "B+", ConsultationType = "Surgical Consult", ConsultationSubtitle = "Post Op Review", ConsultationIcon = "UserCheck", PhysicianName = "Dr. Emily Clark", PhysicianRole = "Surgeon", PhysicianAvatar = "https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80", DateTimeText = "May 22, 2024 11:15 AM", Location = "Surgical OPD", Reason = "Post-operative incision check", Status = ConsultationStatus.Scheduled, FollowUpDateText = "-", ClinicalNotes = "Incision healing cleanly without edema." },
                new ConsultationRecord { PatientName = "James Brown", PatientIdCode = "PT-10004", PatientAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", RoomNumber = "102", CareUnit = "General Ward", AgeGender = "65 Y • Male", BloodGroup = "AB+", ConsultationType = "Nutrition Consult", ConsultationSubtitle = "Diabetes Management", ConsultationIcon = "Activity", PhysicianName = "Dr. Robert Lee", PhysicianRole = "Nutritionist", PhysicianAvatar = "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80", DateTimeText = "May 22, 2024 01:00 PM", Location = "Clinical Nutrition Unit", Reason = "Dietary plan optimization", Status = ConsultationStatus.InProgress, FollowUpDateText = "May 28, 2024", ClinicalNotes = "Caloric restriction and carbohydrate counting initiated." },
                new ConsultationRecord { PatientName = "Mary Williams", PatientIdCode = "PT-10005", PatientAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", RoomNumber = "401", CareUnit = "Maternity Unit", AgeGender = "34 Y • Female", BloodGroup = "A-", ConsultationType = "Physiotherapy Consult", ConsultationSubtitle = "Mobility Improvement", ConsultationIcon = "Activity", PhysicianName = "Dr. Daniel Kim", PhysicianRole = "Physiotherapist", PhysicianAvatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80", DateTimeText = "May 22, 2024 02:00 PM", Location = "Rehab Gym", Reason = "Postnatal mobility assessment", Status = ConsultationStatus.Scheduled, FollowUpDateText = "-", ClinicalNotes = "Pelvic floor and core stabilization exercises prescribed." },
                new ConsultationRecord { PatientName = "Robert Johnson", PatientIdCode = "PT-10006", PatientAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80", RoomNumber = "502", CareUnit = "Neurology Unit", AgeGender = "58 Y • Male", BloodGroup = "O-", ConsultationType = "Neurology Consult", ConsultationSubtitle = "Stroke Follow-up", ConsultationIcon = "Activity", PhysicianName = "Dr. Lisa Patel", PhysicianRole = "Neurologist", PhysicianAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", DateTimeText = "May 22, 2024 02:30 PM", Location = "Neuro OPD", Reason = "Motor function evaluation", Status = ConsultationStatus.Completed, FollowUpDateText = "Jun 05, 2024", ClinicalNotes = "Gait improving steadily." },
                new ConsultationRecord { PatientName = "Sarah Wilson", PatientIdCode = "PT-10007", PatientAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", RoomNumber = "307", CareUnit = "Medical Unit", AgeGender = "29 Y • Female", BloodGroup = "B-", ConsultationType = "Psychology Consult", ConsultationSubtitle = "Anxiety Management", ConsultationIcon = "HeartPulse", PhysicianName = "Dr. Amanda Clark", PhysicianRole = "Psychologist", PhysicianAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", DateTimeText = "May 22, 2024 03:00 PM", Location = "Counseling Room 2", Reason = "Hospital stay anxiety", Status = ConsultationStatus.Completed, FollowUpDateText = "Jun 02, 2024", ClinicalNotes = "Mindfulness techniques taught." },
                new ConsultationRecord { PatientName = "William Taylor", PatientIdCode = "PT-10008", PatientAvatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80", RoomNumber = "101", CareUnit = "General Ward", AgeGender = "40 Y • Male", BloodGroup = "A+", ConsultationType = "Geriatric Consult", ConsultationSubtitle = "General Assessment", ConsultationIcon = "UserCheck", PhysicianName = "Dr. James Allen", PhysicianRole = "Geriatrician", PhysicianAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", DateTimeText = "May 22, 2024 03:15 PM", Location = "Outpatient Clinic 1", Reason = "Multimorbidity evaluation", Status = ConsultationStatus.FollowUpDue, FollowUpDateText = "May 24, 2024", ClinicalNotes = "Follow-up due for medication reconciliation." }
            };
            context.Consultations.AddRange(consultations);
            await context.SaveChangesAsync();
        }

        // 23. Seed Care Plans (Matching Image 3)
        if (!await context.CarePlans.AnyAsync())
        {
            var carePlans = new List<CarePlanRecord>
            {
                new CarePlanRecord { PatientName = "Patricia Smith", PatientIdCode = "PT-10001", PatientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", RoomNumber = "302", CareUnit = "Cardiology Unit", AgeGender = "68 Y • Female", BloodGroup = "A+", AttendingDoctorName = "Dr. Sarah Wilson", CareTeamMembersCount = 3, LengthOfStayText = "4 Days", PrimaryCondition = "Heart Failure", ConditionIcon = "HeartPulse", PlanTitle = "Heart Failure Management", GoalCount = 6, Status = CarePlanStatus.Active, StartDateText = "May 20, 2024", ReviewDateText = "May 27, 2024", ReviewDueBadge = "5 days left", AssignedNurseName = "Emma Johnson", AssignedNurseAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", OverallProgressPercentage = 78, CompletedTasksCount = 14, InProgressTasksCount = 8, NotStartedTasksCount = 4, OverdueTasksCount = 2, LastUpdatedText = "May 22, 2024 10:30 AM", NotesJson = "[{\"id\":\"n1\",\"text\":\"Patient showing improvement in mobility with assistance.\",\"date\":\"May 22, 2024 • 09:45 AM\"},{\"id\":\"n2\",\"text\":\"Medication adjusted as per doctor's instructions.\",\"date\":\"May 21, 2024 • 04:30 PM\"}]" },
                new CarePlanRecord { PatientName = "Michael Davis", PatientIdCode = "PT-10002", PatientAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", RoomNumber = "201", CareUnit = "Medical Unit", AgeGender = "72 Y • Male", BloodGroup = "O+", AttendingDoctorName = "Dr. Michael Brown", CareTeamMembersCount = 4, LengthOfStayText = "6 Days", PrimaryCondition = "COPD", ConditionIcon = "Wind", PlanTitle = "Respiratory Care Plan", GoalCount = 5, Status = CarePlanStatus.Active, StartDateText = "May 19, 2024", ReviewDateText = "May 26, 2024", ReviewDueBadge = "4 days left", AssignedNurseName = "Emma Johnson", AssignedNurseAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", OverallProgressPercentage = 65, CompletedTasksCount = 10, InProgressTasksCount = 6, NotStartedTasksCount = 3, OverdueTasksCount = 1, LastUpdatedText = "May 22, 2024 08:15 AM", NotesJson = "[]" },
                new CarePlanRecord { PatientName = "Linda Martinez", PatientIdCode = "PT-10003", PatientAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", RoomNumber = "305", CareUnit = "Surgical Unit", AgeGender = "69 Y • Female", BloodGroup = "B+", AttendingDoctorName = "Dr. Emily Clark", CareTeamMembersCount = 3, LengthOfStayText = "8 Days", PrimaryCondition = "Post Surgery", ConditionIcon = "Scissors", PlanTitle = "Post Operative Recovery", GoalCount = 7, Status = CarePlanStatus.Active, StartDateText = "May 18, 2024", ReviewDateText = "May 25, 2024", ReviewDueBadge = "3 days left", AssignedNurseName = "Sophia Williams", AssignedNurseAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", OverallProgressPercentage = 80, CompletedTasksCount = 16, InProgressTasksCount = 4, NotStartedTasksCount = 2, OverdueTasksCount = 0, LastUpdatedText = "May 21, 2024 05:00 PM", NotesJson = "[]" },
                new CarePlanRecord { PatientName = "James Brown", PatientIdCode = "PT-10004", PatientAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", RoomNumber = "102", CareUnit = "General Ward", AgeGender = "65 Y • Male", BloodGroup = "AB+", AttendingDoctorName = "Dr. James Lee", CareTeamMembersCount = 2, LengthOfStayText = "7 Days", PrimaryCondition = "Mobility Impairment", ConditionIcon = "Activity", PlanTitle = "Mobility Improvement Plan", GoalCount = 4, Status = CarePlanStatus.ReviewDue, StartDateText = "May 10, 2024", ReviewDateText = "May 22, 2024", ReviewDueBadge = "Due today", AssignedNurseName = "Emma Johnson", AssignedNurseAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", OverallProgressPercentage = 50, CompletedTasksCount = 8, InProgressTasksCount = 6, NotStartedTasksCount = 2, OverdueTasksCount = 4, LastUpdatedText = "May 22, 2024 07:30 AM", NotesJson = "[]" },
                new CarePlanRecord { PatientName = "Mary Williams", PatientIdCode = "PT-10005", PatientAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", RoomNumber = "401", CareUnit = "Maternity Unit", AgeGender = "34 Y • Female", BloodGroup = "A-", AttendingDoctorName = "Dr. Anita Sharma", CareTeamMembersCount = 5, LengthOfStayText = "5 Days", PrimaryCondition = "Diabetes Type 2", ConditionIcon = "Activity", PlanTitle = "Diabetes Management Plan", GoalCount = 6, Status = CarePlanStatus.Active, StartDateText = "May 15, 2024", ReviewDateText = "May 29, 2024", ReviewDueBadge = "7 days left", AssignedNurseName = "Sophia Williams", AssignedNurseAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", OverallProgressPercentage = 90, CompletedTasksCount = 18, InProgressTasksCount = 2, NotStartedTasksCount = 0, OverdueTasksCount = 0, LastUpdatedText = "May 20, 2024 02:20 PM", NotesJson = "[]" },
                new CarePlanRecord { PatientName = "Robert Johnson", PatientIdCode = "PT-10006", PatientAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80", RoomNumber = "502", CareUnit = "Neurology Unit", AgeGender = "58 Y • Male", BloodGroup = "O-", AttendingDoctorName = "Dr. David Patel", CareTeamMembersCount = 4, LengthOfStayText = "12 Days", PrimaryCondition = "Stroke Recovery", ConditionIcon = "Activity", PlanTitle = "Stroke Rehabilitation Plan", GoalCount = 6, Status = CarePlanStatus.Completed, StartDateText = "Apr 25, 2024", ReviewDateText = "May 20, 2024", ReviewDueBadge = "Completed", AssignedNurseName = "Emma Johnson", AssignedNurseAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", OverallProgressPercentage = 100, CompletedTasksCount = 24, InProgressTasksCount = 0, NotStartedTasksCount = 0, OverdueTasksCount = 0, LastUpdatedText = "May 20, 2024 11:00 AM", NotesJson = "[]" },
                new CarePlanRecord { PatientName = "Sarah Wilson", PatientIdCode = "PT-10007", PatientAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", RoomNumber = "307", CareUnit = "Medical Unit", AgeGender = "29 Y • Female", BloodGroup = "B-", AttendingDoctorName = "Dr. Linda Martinez", CareTeamMembersCount = 2, LengthOfStayText = "11 Days", PrimaryCondition = "Arthritis", ConditionIcon = "Activity", PlanTitle = "Pain Management Plan", GoalCount = 5, Status = CarePlanStatus.Draft, StartDateText = "May 21, 2024", ReviewDateText = "-", ReviewDueBadge = "Draft", AssignedNurseName = "Emma Johnson", AssignedNurseAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", OverallProgressPercentage = 10, CompletedTasksCount = 1, InProgressTasksCount = 2, NotStartedTasksCount = 7, OverdueTasksCount = 0, LastUpdatedText = "May 21, 2024 04:00 PM", NotesJson = "[]" },
                new CarePlanRecord { PatientName = "William Taylor", PatientIdCode = "PT-10008", PatientAvatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80", RoomNumber = "101", CareUnit = "General Ward", AgeGender = "40 Y • Male", BloodGroup = "A+", AttendingDoctorName = "Dr. Robert Johnson", CareTeamMembersCount = 3, LengthOfStayText = "3 Days", PrimaryCondition = "Malnutrition", ConditionIcon = "Activity", PlanTitle = "Nutritional Support Plan", GoalCount = 4, Status = CarePlanStatus.Active, StartDateText = "May 16, 2024", ReviewDateText = "May 30, 2024", ReviewDueBadge = "8 days left", AssignedNurseName = "Sophia Williams", AssignedNurseAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", OverallProgressPercentage = 70, CompletedTasksCount = 14, InProgressTasksCount = 4, NotStartedTasksCount = 2, OverdueTasksCount = 0, LastUpdatedText = "May 22, 2024 09:00 AM", NotesJson = "[]" }
            };
            context.CarePlans.AddRange(carePlans);
            await context.SaveChangesAsync();
        }

        // 24. Seed Vital Rounds (Matching Image 5)
        if (!await context.VitalRounds.AnyAsync())
        {
            var vitalRounds = new List<VitalRoundRecord>
            {
                new VitalRoundRecord { PatientName = "Patricia Smith", PatientIdCode = "PT-10001", PatientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", AgeGender = "68 Y • Female", BloodGroup = "A+", RoomBed = "302", CareUnit = "Cardiology Unit", PatientType = PatientType.Inpatient, AttendingDoctorName = "Dr. Sarah Wilson", CareTeamMembersCount = 3, LengthOfStayText = "4 Days", LastRoundTimeText = "08:00 AM", LastRoundDateText = "May 22, 2024", RecordedByNurseName = "Emma Johnson", NextDueTimeText = "12:00 PM", NextDueRelativeText = "Due in 1h 15m", Status = VitalRoundStatus.Pending, BloodPressure = "120/80 mmHg", HeartRate = "82 bpm", Temperature = "98.6 °F", SpO2 = "98 %", RespiratoryRate = "18 /min", PainScore = "2/10" },
                new VitalRoundRecord { PatientName = "Michael Davis", PatientIdCode = "PT-10002", PatientAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", AgeGender = "72 Y • Male", BloodGroup = "O+", RoomBed = "201", CareUnit = "Medical Unit", PatientType = PatientType.Inpatient, AttendingDoctorName = "Dr. Michael Brown", CareTeamMembersCount = 4, LengthOfStayText = "6 Days", LastRoundTimeText = "07:45 AM", LastRoundDateText = "May 22, 2024", RecordedByNurseName = "Emma Johnson", NextDueTimeText = "11:45 AM", NextDueRelativeText = "Due in 1h", Status = VitalRoundStatus.Pending, BloodPressure = "135/85 mmHg", HeartRate = "76 bpm", Temperature = "98.4 °F", SpO2 = "96 %", RespiratoryRate = "20 /min", PainScore = "3/10" },
                new VitalRoundRecord { PatientName = "Linda Martinez", PatientIdCode = "PT-10003", PatientAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", AgeGender = "45 Y • Female", BloodGroup = "B+", RoomBed = "305", CareUnit = "Surgical Unit", PatientType = PatientType.Inpatient, AttendingDoctorName = "Dr. Emily Clark", CareTeamMembersCount = 3, LengthOfStayText = "8 Days", LastRoundTimeText = "08:10 AM", LastRoundDateText = "May 22, 2024", RecordedByNurseName = "Sophia Williams", NextDueTimeText = "12:10 PM", NextDueRelativeText = "Due in 1h 25m", Status = VitalRoundStatus.Pending, BloodPressure = "118/76 mmHg", HeartRate = "70 bpm", Temperature = "98.7 °F", SpO2 = "99 %", RespiratoryRate = "16 /min", PainScore = "1/10" },
                new VitalRoundRecord { PatientName = "James Brown", PatientIdCode = "PT-10004", PatientAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", AgeGender = "65 Y • Male", BloodGroup = "AB+", RoomBed = "102", CareUnit = "General Ward", PatientType = PatientType.Inpatient, AttendingDoctorName = "Dr. James Lee", CareTeamMembersCount = 2, LengthOfStayText = "7 Days", LastRoundTimeText = "08:30 AM", LastRoundDateText = "May 22, 2024", RecordedByNurseName = "Emma Johnson", NextDueTimeText = "12:30 PM", NextDueRelativeText = "Due in 1h 45m", Status = VitalRoundStatus.Pending, BloodPressure = "140/90 mmHg", HeartRate = "88 bpm", Temperature = "99.1 °F", SpO2 = "95 %", RespiratoryRate = "22 /min", PainScore = "4/10" },
                new VitalRoundRecord { PatientName = "Mary Williams", PatientIdCode = "PT-10005", PatientAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", AgeGender = "34 Y • Female", BloodGroup = "A-", RoomBed = "401", CareUnit = "Maternity Unit", PatientType = PatientType.Inpatient, AttendingDoctorName = "Dr. Anita Sharma", CareTeamMembersCount = 5, LengthOfStayText = "5 Days", LastRoundTimeText = "08:05 AM", LastRoundDateText = "May 22, 2024", RecordedByNurseName = "Sophia Williams", NextDueTimeText = "12:05 PM", NextDueRelativeText = "Due in 1h 20m", Status = VitalRoundStatus.Pending, BloodPressure = "115/75 mmHg", HeartRate = "74 bpm", Temperature = "98.5 °F", SpO2 = "99 %", RespiratoryRate = "17 /min", PainScore = "0/10" },
                new VitalRoundRecord { PatientName = "Robert Johnson", PatientIdCode = "PT-10006", PatientAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80", AgeGender = "58 Y • Male", BloodGroup = "O-", RoomBed = "502", CareUnit = "Cardiology Unit", PatientType = PatientType.Inpatient, AttendingDoctorName = "Dr. David Patel", CareTeamMembersCount = 4, LengthOfStayText = "12 Days", LastRoundTimeText = "07:30 AM", LastRoundDateText = "May 22, 2024", RecordedByNurseName = "Emma Johnson", NextDueTimeText = "11:30 AM", NextDueRelativeText = "Overdue 15 mins", Status = VitalRoundStatus.Overdue, BloodPressure = "160/100 mmHg", HeartRate = "95 bpm", Temperature = "99.5 °F", SpO2 = "94 %", RespiratoryRate = "24 /min", PainScore = "6/10" },
                new VitalRoundRecord { PatientName = "Sarah Wilson", PatientIdCode = "PT-10007", PatientAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", AgeGender = "29 Y • Female", BloodGroup = "B-", RoomBed = "OP-07", CareUnit = "Outpatient", PatientType = PatientType.Outpatient, AttendingDoctorName = "Dr. Linda Martinez", CareTeamMembersCount = 2, LengthOfStayText = "Outpatient", LastRoundTimeText = "09:00 AM", LastRoundDateText = "May 22, 2024", RecordedByNurseName = "Sophia Williams", NextDueTimeText = "01:00 PM", NextDueRelativeText = "Due in 2h 15m", Status = VitalRoundStatus.Pending, BloodPressure = "122/80 mmHg", HeartRate = "78 bpm", Temperature = "98.6 °F", SpO2 = "98 %", RespiratoryRate = "18 /min", PainScore = "2/10" },
                new VitalRoundRecord { PatientName = "William Taylor", PatientIdCode = "PT-10008", PatientAvatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80", AgeGender = "40 Y • Male", BloodGroup = "A+", RoomBed = "OP-12", CareUnit = "Outpatient", PatientType = PatientType.Outpatient, AttendingDoctorName = "Dr. Robert Johnson", CareTeamMembersCount = 3, LengthOfStayText = "Outpatient", LastRoundTimeText = "09:05 AM", LastRoundDateText = "May 22, 2024", RecordedByNurseName = "Emma Johnson", NextDueTimeText = "01:05 PM", NextDueRelativeText = "Due in 2h 20m", Status = VitalRoundStatus.Pending, BloodPressure = "128/82 mmHg", HeartRate = "80 bpm", Temperature = "98.4 °F", SpO2 = "97 %", RespiratoryRate = "19 /min", PainScore = "1/10" }
            };
            context.VitalRounds.AddRange(vitalRounds);
            await context.SaveChangesAsync();
        }

        // 24. Ensure no default tasks exist - Tasks must be created manually by Admin/Users only
        if (await context.Tasks.AnyAsync())
        {
            context.Tasks.RemoveRange(context.Tasks);
            await context.SaveChangesAsync();
        }

        // 25. Ensure no default medication records exist - Medications must be created manually by Admin/Users only
        // Do NOT delete them during application startup.
        //if (await context.MedicationRecords.AnyAsync())
        //{
        //    context.MedicationRecords.RemoveRange(context.MedicationRecords);
        //    await context.SaveChangesAsync();
        //}

        // 26. Ensure no default alerts exist - Alerts must be created manually by users or system monitors
        if (await context.Alerts.AnyAsync())
        {
            context.Alerts.RemoveRange(context.Alerts);
            await context.SaveChangesAsync();
        }

        // 27. Seed Shift Handover (Matching Image 9)
        if (!await context.ShiftHandovers.AnyAsync())
        {
            var handover = new ShiftHandoverRecord
            {
                HandoverIdCode = "SHO-1001",
                CurrentShift = "Day Shift (07:00 AM - 03:00 PM)",
                HandoverToShift = "Evening Shift (03:00 PM - 11:00 PM)",
                OutgoingNurseName = "Emma Johnson",
                OutgoingNurseRole = "Staff Nurse",
                OutgoingNurseAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
                IncomingNurseName = "Sophia Williams",
                IncomingNurseRole = "Staff Nurse",
                IncomingNurseAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                PatientsAssignedCount = 24,
                HighPriorityPatientsCount = 5,
                PendingTasksCount = 6,
                NewAlertsCount = 4,
                CompletedSectionsCount = 18,
                TotalSectionsCount = 24,
                CompletionPercentage = 75,
                HandoverNotes = "• Patricia's BP was high in the morning, medication adjusted.\n• Linda is experiencing mild pain, pain meds given.\n• James needs assistance while walking.\n• Room 502 patient (Robert Johnson) awaiting lab results.\n• All medications up to date.",
                Status = "Draft",
                HandoverDateText = "May 22, 2024",
                HandoverTimeText = "02:45 PM"
            };
            context.ShiftHandovers.Add(handover);
            await context.SaveChangesAsync();

            var patientSummaries = new List<ShiftHandoverPatientRecord>
            {
                new ShiftHandoverPatientRecord { HandoverId = handover.Id, PatientName = "Patricia Smith", PatientIdCode = "PT-10001", PatientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", AgeGender = "68 Y • F", RoomNumber = "302", CareUnit = "Cardiology Unit", ConditionStatus = "Stable", ConditionSubtitle = "BP controlled", PendingTasksCount = 2, SpecialInstructions = "Monitor BP every 4 hrs", Priority = "High" },
                new ShiftHandoverPatientRecord { HandoverId = handover.Id, PatientName = "Michael Davis", PatientIdCode = "PT-10002", PatientAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", AgeGender = "72 Y • M", RoomNumber = "201", CareUnit = "Medical Unit", ConditionStatus = "Improving", ConditionSubtitle = "Breathing better", PendingTasksCount = 1, SpecialInstructions = "Encourage deep breathing", Priority = "Medium" },
                new ShiftHandoverPatientRecord { HandoverId = handover.Id, PatientName = "Linda Martinez", PatientIdCode = "PT-10003", PatientAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", AgeGender = "45 Y • F", RoomNumber = "305", CareUnit = "Surgical Unit", ConditionStatus = "Post Op Day 2", ConditionSubtitle = "Knee replacement", PendingTasksCount = 3, SpecialInstructions = "Pain management", Priority = "High" },
                new ShiftHandoverPatientRecord { HandoverId = handover.Id, PatientName = "James Brown", PatientIdCode = "PT-10004", PatientAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", AgeGender = "65 Y • M", RoomNumber = "102", CareUnit = "General Ward", ConditionStatus = "Stable", ConditionSubtitle = "Vitals normal", PendingTasksCount = 1, SpecialInstructions = "Assist with mobility", Priority = "Medium" },
                new ShiftHandoverPatientRecord { HandoverId = handover.Id, PatientName = "Mary Williams", PatientIdCode = "PT-10005", PatientAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", AgeGender = "34 Y • F", RoomNumber = "401", CareUnit = "Maternity Unit", ConditionStatus = "Stable", ConditionSubtitle = "Post delivery care", PendingTasksCount = 0, SpecialInstructions = "Breastfeeding support", Priority = "Low" }
            };
            context.ShiftHandoverPatientRecords.AddRange(patientSummaries);
            await context.SaveChangesAsync();
        }

        // 28. Seed Nurse Profile (Matching Image 10)
        if (!await context.NurseProfiles.AnyAsync())
        {
            context.NurseProfiles.Add(new NurseProfileRecord
            {
                FullName = "Emma Johnson",
                EmployeeIdCode = "NUR-10245",
                Email = "emma.johnson@connectcare.com",
                Phone = "+1 234 567 8900",
                Role = "Staff Nurse",
                Department = "Nursing",
                UnitWard = "Cardiology Unit",
                DateOfJoining = "Jan 15, 2023",
                AboutMe = "Compassionate and dedicated nurse with 5+ years of experience in patient care.",
                Avatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
                DefaultUnitWard = "Cardiology Unit",
                DefaultShift = "07:00 AM - 03:00 PM (Day Shift)",
                Theme = "Light",
                DateFormat = "May 22, 2024 (MM/DD/YYYY)",
                TimeFormat = "12 Hour (hh:mm A)",
                LicenseNumber = "RN-778899",
                Qualification = "B.Sc Nursing",
                ExperienceText = "5 Years 3 Months",
                Specialization = "Critical Care Nursing",
                Certifications = "BLS, ACLS, PALS",
                EmergencyContactName = "Michael Johnson (Brother)",
                EmergencyContactPhone = "+1 987 654 3210",
                HomeAddress = "123 Maple Street, Springfield, IL 62704, USA",
                PersonalEmail = "emma.johnson@gmail.com"
            });
            await context.SaveChangesAsync();
        }

        // 29. Seed Nurse Documentation Records (Matching Image 11)
        if (!await context.NurseDocumentations.AnyAsync())
        {
            var docs = new List<NurseDocumentationRecord>
            {
                new NurseDocumentationRecord { DocumentCode = "DOC-2024-0056", DocumentName = "Nursing Care Note", PatientName = "Patricia Smith", PatientIdCode = "PT-10001", PatientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", RoomLocation = "Room 302", CareUnit = "Cardiology Unit", AgeGender = "68 Y • Female", BloodGroup = "A+", PatientType = "Inpatient", DocumentType = "Care Note", DateTimeText = "May 22, 2024 10:30 AM", CreatedByName = "Emma Johnson", CreatedByRole = "Staff Nurse", Status = "Completed", IsDraft = false },
                new NurseDocumentationRecord { DocumentCode = "DOC-2024-0055", DocumentName = "Vital Signs Flow Sheet", PatientName = "Michael Davis", PatientIdCode = "PT-10002", PatientAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", RoomLocation = "Room 201", CareUnit = "Medical Unit", AgeGender = "72 Y • Male", BloodGroup = "O+", PatientType = "Inpatient", DocumentType = "Assessment", DateTimeText = "May 22, 2024 09:45 AM", CreatedByName = "Emma Johnson", CreatedByRole = "Staff Nurse", Status = "Completed", IsDraft = false },
                new NurseDocumentationRecord { DocumentCode = "DOC-2024-0054", DocumentName = "Medication Administration Record", PatientName = "Linda Martinez", PatientIdCode = "PT-10003", PatientAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", RoomLocation = "Room 305", CareUnit = "Surgical Unit", AgeGender = "45 Y • Female", BloodGroup = "B+", PatientType = "Inpatient", DocumentType = "Medication", DateTimeText = "May 22, 2024 09:30 AM", CreatedByName = "Emma Johnson", CreatedByRole = "Staff Nurse", Status = "Pending", IsDraft = false },
                new NurseDocumentationRecord { DocumentCode = "DOC-2024-0053", DocumentName = "Wound Assessment", PatientName = "James Brown", PatientIdCode = "PT-10004", PatientAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", RoomLocation = "Room 102", CareUnit = "General Ward", AgeGender = "65 Y • Male", BloodGroup = "AB+", PatientType = "Inpatient", DocumentType = "Assessment", DateTimeText = "May 22, 2024 08:50 AM", CreatedByName = "Emma Johnson", CreatedByRole = "Staff Nurse", Status = "Completed", IsDraft = false },
                new NurseDocumentationRecord { DocumentCode = "DOC-2024-0052", DocumentName = "Pain Assessment Note", PatientName = "Mary Williams", PatientIdCode = "PT-10005", PatientAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", RoomLocation = "Room 401", CareUnit = "Maternity Unit", AgeGender = "34 Y • Female", BloodGroup = "A-", PatientType = "Inpatient", DocumentType = "Care Note", DateTimeText = "May 22, 2024 08:15 AM", CreatedByName = "Emma Johnson", CreatedByRole = "Staff Nurse", Status = "Pending", IsDraft = false },
                new NurseDocumentationRecord { DocumentCode = "DOC-2024-0051", DocumentName = "Patient Education Record", PatientName = "Robert Johnson", PatientIdCode = "PT-10006", PatientAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80", RoomLocation = "Room 502", CareUnit = "Cardiology Unit", AgeGender = "58 Y • Male", BloodGroup = "O-", PatientType = "Inpatient", DocumentType = "Education", DateTimeText = "May 22, 2024 07:45 AM", CreatedByName = "Emma Johnson", CreatedByRole = "Staff Nurse", Status = "Completed", IsDraft = false },
                new NurseDocumentationRecord { DocumentCode = "DOC-2024-0050", DocumentName = "Incident Report", PatientName = "Sarah Wilson", PatientIdCode = "PT-10007", PatientAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", RoomLocation = "Room 307", CareUnit = "Medical Unit", AgeGender = "29 Y • Female", BloodGroup = "B-", PatientType = "Inpatient", DocumentType = "Report", DateTimeText = "May 22, 2024 07:20 AM", CreatedByName = "Emma Johnson", CreatedByRole = "Staff Nurse", Status = "Needs Review", IsDraft = false },
                new NurseDocumentationRecord { DocumentCode = "DOC-2024-0049", DocumentName = "Care Plan Update", PatientName = "William Taylor", PatientIdCode = "PT-10008", PatientAvatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80", RoomLocation = "Room 101", CareUnit = "General Ward", AgeGender = "40 Y • Male", BloodGroup = "A+", PatientType = "Inpatient", DocumentType = "Care Plan", DateTimeText = "May 22, 2024 06:50 AM", CreatedByName = "Emma Johnson", CreatedByRole = "Staff Nurse", Status = "Draft", IsDraft = true }
            };
            context.NurseDocumentations.AddRange(docs);
            await context.SaveChangesAsync();
        }

        // 30. Seed Chat Conversations & Messages (Matching Image 12)
        if (!await context.ChatConversations.AnyAsync())
        {
            var conv1 = new ChatConversationRecord
            {
                ParticipantName = "Dr. Sarah Wilson",
                ParticipantRole = "Cardiologist • Attending Doctor",
                ParticipantAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
                IsOnline = true,
                LastMessageText = "Please update the vital signs before lunch.",
                LastMessageTimeText = "10:30 AM",
                UnreadCount = 2,
                IsGroup = false,
                Category = "All",
                SharedPatientName = "Patricia Smith",
                SharedPatientIdCode = "PT-10001",
                SharedPatientRoom = "Room 302",
                SharedPatientCareUnit = "Cardiology Unit",
                SharedPatientStatus = "In Progress",
                SharedPatientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
            };

            var conv2 = new ChatConversationRecord
            {
                ParticipantName = "Michael Davis",
                ParticipantRole = "Medical Unit Patient",
                ParticipantAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                IsOnline = false,
                LastMessageText = "Thanks for the update.",
                LastMessageTimeText = "09:45 AM",
                UnreadCount = 1,
                IsGroup = false,
                Category = "All",
                SharedPatientName = "Michael Davis",
                SharedPatientIdCode = "PT-10002",
                SharedPatientRoom = "Room 201",
                SharedPatientCareUnit = "Medical Unit",
                SharedPatientStatus = "Improving",
                SharedPatientAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
            };

            var conv3 = new ChatConversationRecord
            {
                ParticipantName = "Care Team Group",
                ParticipantRole = "Multidisciplinary Team",
                ParticipantAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                IsOnline = true,
                LastMessageText = "Linda Martinez: Patient in room 305 is ready for discharge.",
                LastMessageTimeText = "09:15 AM",
                UnreadCount = 3,
                IsGroup = true,
                Category = "All"
            };

            var conv4 = new ChatConversationRecord
            {
                ParticipantName = "Pharmacy Team",
                ParticipantRole = "Central Pharmacy",
                ParticipantAvatar = "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80",
                IsOnline = true,
                LastMessageText = "Medication for room 201 is dispatched.",
                LastMessageTimeText = "08:50 AM",
                UnreadCount = 0,
                IsGroup = true,
                Category = "All"
            };

            var conv5 = new ChatConversationRecord
            {
                ParticipantName = "Linda Martinez",
                ParticipantRole = "Staff Nurse",
                ParticipantAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                IsOnline = false,
                LastMessageText = "Please review the care plan for Mr. Brown.",
                LastMessageTimeText = "Yesterday",
                UnreadCount = 0,
                IsGroup = false,
                Category = "All"
            };

            var conv6 = new ChatConversationRecord
            {
                ParticipantName = "Dr. Emily Davis",
                ParticipantRole = "Surgeon",
                ParticipantAvatar = "https://images.unsplash.com/photo-1594824813566-88855ce78907?w=150&auto=format&fit=crop&q=80",
                IsOnline = true,
                LastMessageText = "Let's discuss the lab results during rounds.",
                LastMessageTimeText = "Yesterday",
                UnreadCount = 0,
                IsGroup = false,
                Category = "All"
            };

            var conv7 = new ChatConversationRecord
            {
                ParticipantName = "Night Shift Handover",
                ParticipantRole = "Shift Team",
                ParticipantAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                IsOnline = false,
                LastMessageText = "James Brown: No issues during the night.",
                LastMessageTimeText = "Yesterday",
                UnreadCount = 0,
                IsGroup = true,
                Category = "All"
            };

            var conv8 = new ChatConversationRecord
            {
                ParticipantName = "Admin Team",
                ParticipantRole = "System Administration",
                ParticipantAvatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80",
                IsOnline = true,
                LastMessageText = "Reminder: Training session on infection control tomorrow.",
                LastMessageTimeText = "May 20",
                UnreadCount = 0,
                IsGroup = true,
                Category = "All"
            };

            context.ChatConversations.AddRange(new[] { conv1, conv2, conv3, conv4, conv5, conv6, conv7, conv8 });
            await context.SaveChangesAsync();

            // Message history for Dr. Sarah Wilson (Matching Image 12 chat stream)
            var messages = new List<ChatMessageRecord>
            {
                new ChatMessageRecord { ConversationId = conv1.Id, SenderName = "Dr. Sarah Wilson", SenderRole = "Cardiologist", SenderAvatar = conv1.ParticipantAvatar, MessageText = "Good morning, Emma. How is our patient in room 302 doing today?", TimeText = "10:20 AM", IsMe = false, IsUnread = false },
                new ChatMessageRecord { ConversationId = conv1.Id, SenderName = "Emma Johnson", SenderRole = "Staff Nurse", SenderAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", MessageText = "Good morning, Dr. Wilson. Ms. Patricia Smith is stable. Vital signs are normal and she had her breakfast.", TimeText = "10:22 AM", IsMe = true, IsUnread = false },
                new ChatMessageRecord { ConversationId = conv1.Id, SenderName = "Dr. Sarah Wilson", SenderRole = "Cardiologist", SenderAvatar = conv1.ParticipantAvatar, MessageText = "That's great to hear. Please remind her about the physiotherapy session at 11 AM.", TimeText = "10:23 AM", IsMe = false, IsUnread = false },
                new ChatMessageRecord { ConversationId = conv1.Id, SenderName = "Emma Johnson", SenderRole = "Staff Nurse", SenderAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", MessageText = "Sure, I will inform her.", TimeText = "10:24 AM", IsMe = true, IsUnread = false },
                new ChatMessageRecord { ConversationId = conv1.Id, SenderName = "Dr. Sarah Wilson", SenderRole = "Cardiologist", SenderAvatar = conv1.ParticipantAvatar, MessageText = "Please update the vital signs before lunch.", TimeText = "10:30 AM", IsMe = false, IsUnread = true }
            };

            context.ChatMessages.AddRange(messages);
            await context.SaveChangesAsync();
        }

        // 31. Seed Nurse Reports (Matching Image 13)
        if (!await context.NurseReports.AnyAsync())
        {
            var reports = new List<NurseReportRecord>
            {
                new NurseReportRecord { ReportName = "Patient Care Summary", ReportType = "Patient Report", Description = "Summary of patient care activities and outcomes", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 22, 2024 10:30 AM", Format = "PDF", CategoryTab = "Overview", CareUnit = "Cardiology Unit", PatientName = "Patricia Smith (PT-10001)", Shift = "Day Shift" },
                new NurseReportRecord { ReportName = "Vital Signs Trends", ReportType = "Clinical Report", Description = "Average and trends of vital signs by patient", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 22, 2024 09:15 AM", Format = "PDF", CategoryTab = "Overview", CareUnit = "Medical Unit", PatientName = "Michael Davis (PT-10002)", Shift = "Day Shift" },
                new NurseReportRecord { ReportName = "Medication Administration Report", ReportType = "Medication Report", Description = "Summary of medications administered", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 22, 2024 08:45 AM", Format = "Excel", CategoryTab = "Overview", CareUnit = "Cardiology Unit", PatientName = "Patricia Smith (PT-10001)", Shift = "Day Shift" },
                new NurseReportRecord { ReportName = "Controlled Substances Audit Log", ReportType = "Medication Report", Description = "Log of high-alert and controlled medications dispensed", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 22, 2024 07:30 AM", Format = "PDF", CategoryTab = "Overview", CareUnit = "ICU", PatientName = "Linda Martinez (PT-10003)", Shift = "Night Shift" },
                new NurseReportRecord { ReportName = "Task Completion Summary", ReportType = "Operational Report", Description = "Overview of tasks completed by shift", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 21, 2024 08:00 PM", Format = "PDF", CategoryTab = "Overview", CareUnit = "Surgical Unit", Shift = "Evening Shift" },
                new NurseReportRecord { ReportName = "Incident Report Summary", ReportType = "Quality & Safety", Description = "Summary of incidents and near misses", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 21, 2024 05:00 PM", Format = "PDF", CategoryTab = "Overview", CareUnit = "ICU", Shift = "Day Shift" },
                new NurseReportRecord { ReportName = "Patient Discharge Summary", ReportType = "Patient Report", Description = "Discharged patients summary by date", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 21, 2024 03:30 PM", Format = "Excel", CategoryTab = "Overview", CareUnit = "Medical Unit", PatientName = "Michael Davis (PT-10002)", Shift = "Day Shift" },
                new NurseReportRecord { ReportName = "Care Plan Compliance", ReportType = "Clinical Report", Description = "Care plan adherence and compliance report", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 21, 2024 11:20 AM", Format = "PDF", CategoryTab = "Overview", CareUnit = "Cardiology Unit", PatientName = "Patricia Smith (PT-10001)", Shift = "Day Shift" },
                new NurseReportRecord { ReportName = "Alerts & Response Report", ReportType = "Operational Report", Description = "Alerts raised and response time summary", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 21, 2024 09:10 AM", Format = "Excel", CategoryTab = "Overview", CareUnit = "ICU", Shift = "Night Shift" },
                new NurseReportRecord { ReportName = "Infection Control & Safety Audit", ReportType = "Quality & Safety", Description = "Surveillance report on hospital-acquired infection risks", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 20, 2024 04:15 PM", Format = "PDF", CategoryTab = "Overview", CareUnit = "Surgical Unit", Shift = "Day Shift" }
            };
            context.NurseReports.AddRange(reports);
            await context.SaveChangesAsync();
        }
    }
}

