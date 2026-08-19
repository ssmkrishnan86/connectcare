using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Security;
using Microsoft.EntityFrameworkCore;

namespace ConnectedCare.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ConnectedCareDbContext context)
    {
        // 1. Seed Doctors
        if (!await context.Doctors.AnyAsync())
        {
            var doctors = new List<Doctor>
            {
                new Doctor { DoctorIdCode = "DOC-1001", Name = "Dr. Michael Brown", Avatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80", Specialty = "Cardiology", SpecialtyIcon = "💙", Department = "Cardiology Unit", Location = "Med-Surg Unit 2 (3rd Floor)", Phone = "(512) 555-1234", Email = "michael.brown@ccare.com", Status = DoctorStatus.Active, Experience = "15 Years", TeleconsultationEnabled = true },
                new Doctor { DoctorIdCode = "DOC-1002", Name = "Dr. Sarah Wilson", Avatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", Specialty = "Emergency Medicine", SpecialtyIcon = "➕", Department = "Emergency Department", Location = "ER Unit (Ground Floor)", Phone = "(512) 555-2345", Email = "sarah.wilson@ccare.com", Status = DoctorStatus.Active, Experience = "10 Years", TeleconsultationEnabled = true },
                new Doctor { DoctorIdCode = "DOC-1003", Name = "Dr. James Lee", Avatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80", Specialty = "Orthopedics", SpecialtyIcon = "🦴", Department = "Orthopedics Unit", Location = "Ortho Unit (4th Floor)", Phone = "(512) 555-3456", Email = "james.lee@ccare.com", Status = DoctorStatus.Active, Experience = "12 Years", TeleconsultationEnabled = true },
                new Doctor { DoctorIdCode = "DOC-1004", Name = "Dr. Emily Clark", Avatar = "https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80", Specialty = "Endocrinology", SpecialtyIcon = "🩺", Department = "Endocrine Unit", Location = "Outpatient Clinic 1 (2nd Floor)", Phone = "(512) 555-4567", Email = "emily.clark@ccare.com", Status = DoctorStatus.Active, Experience = "8 Years", TeleconsultationEnabled = false },
                new Doctor { DoctorIdCode = "DOC-1005", Name = "Dr. David Patel", Avatar = "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80", Specialty = "Neurology", SpecialtyIcon = "🧠", Department = "Neurology Unit", Location = "Neuro Unit (3rd Floor)", Phone = "(512) 555-5678", Email = "david.patel@ccare.com", Status = DoctorStatus.OnLeave, Experience = "14 Years", TeleconsultationEnabled = true },
                new Doctor { DoctorIdCode = "DOC-1006", Name = "Dr. Linda Martinez", Avatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", Specialty = "Internal Medicine", SpecialtyIcon = "📱", Department = "General Medicine", Location = "Med-Surg Unit 1 (2nd Floor)", Phone = "(512) 555-6789", Email = "linda.martinez@ccare.com", Status = DoctorStatus.Active, Experience = "9 Years", TeleconsultationEnabled = true },
                new Doctor { DoctorIdCode = "DOC-1007", Name = "Dr. Robert Johnson", Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", Specialty = "Pulmonology", SpecialtyIcon = "🫁", Department = "Respiratory Unit", Location = "Respiratory Unit (1st Floor)", Phone = "(512) 555-7890", Email = "robert.johnson@ccare.com", Status = DoctorStatus.Inactive, Experience = "11 Years", TeleconsultationEnabled = false },
                new Doctor { DoctorIdCode = "DOC-1008", Name = "Dr. Anita Sharma", Avatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", Specialty = "Pediatrics", SpecialtyIcon = "🧸", Department = "Pediatrics Unit", Location = "Pediatrics Unit (1st Floor)", Phone = "(512) 555-8901", Email = "anita.sharma@ccare.com", Status = DoctorStatus.Active, Experience = "7 Years", TeleconsultationEnabled = true }
            };
            context.Doctors.AddRange(doctors);
            await context.SaveChangesAsync();
        }

        // 2. Seed Location Units / Care Units
        if (!await context.LocationUnits.AnyAsync())
        {
            var locationUnits = new List<LocationUnit>
            {
                new LocationUnit { Code = "LOC-001", Name = "Diabetes Care", Floor = "1st Floor - 104", Type = "Wing", Facility = "Connected Care Hospital", FacilityLocation = "Chennai, Tamil Nadu", UnitsCount = 12, Beds = 30, Status = DoctorStatus.Active, Capacity = "30 Beds", Occupied = "24 Beds", OccupancyRate = "80%", AttentionPriority = AlertSeverity.Medium },
                new LocationUnit { Code = "LOC-002", Name = "Med-Surg Unit 2", Floor = "2nd Floor - 205", Type = "Wing", Facility = "Connected Care Hospital", FacilityLocation = "Chennai, Tamil Nadu", UnitsCount = 18, Beds = 45, Status = DoctorStatus.Active, Capacity = "45 Beds", Occupied = "38 Beds", OccupancyRate = "84%", AttentionPriority = AlertSeverity.Low },
                new LocationUnit { Code = "LOC-003", Name = "Cardiology Unit", Floor = "3rd Floor - 301", Type = "Specialty Center", Facility = "Connected Care Hospital", FacilityLocation = "Chennai, Tamil Nadu", UnitsCount = 20, Beds = 50, Status = DoctorStatus.Active, Capacity = "50 Beds", Occupied = "42 Beds", OccupancyRate = "84%", AttentionPriority = AlertSeverity.High },
                new LocationUnit { Code = "LOC-004", Name = "Orthopedics Unit", Floor = "4th Floor - 402", Type = "Wing", Facility = "Connected Care Hospital", FacilityLocation = "Chennai, Tamil Nadu", UnitsCount = 15, Beds = 35, Status = DoctorStatus.Active, Capacity = "35 Beds", Occupied = "28 Beds", OccupancyRate = "80%", AttentionPriority = AlertSeverity.Low },
                new LocationUnit { Code = "LOC-005", Name = "Emergency Department", Floor = "Ground Floor - ER1", Type = "Emergency", Facility = "Connected Care Hospital", FacilityLocation = "Chennai, Tamil Nadu", UnitsCount = 10, Beds = 25, Status = DoctorStatus.Active, Capacity = "25 Beds", Occupied = "22 Beds", OccupancyRate = "88%", AttentionPriority = AlertSeverity.Critical },
                new LocationUnit { Code = "LOC-006", Name = "Neurology Unit", Floor = "3rd Floor - 308", Type = "Specialty Center", Facility = "Connected Care Hospital", FacilityLocation = "Chennai, Tamil Nadu", UnitsCount = 14, Beds = 30, Status = DoctorStatus.Active, Capacity = "30 Beds", Occupied = "25 Beds", OccupancyRate = "83%", AttentionPriority = AlertSeverity.Medium },
                new LocationUnit { Code = "LOC-007", Name = "Pediatrics Unit", Floor = "1st Floor - 112", Type = "Wing", Facility = "Connected Care Hospital", FacilityLocation = "Chennai, Tamil Nadu", UnitsCount = 16, Beds = 40, Status = DoctorStatus.Active, Capacity = "40 Beds", Occupied = "30 Beds", OccupancyRate = "75%", AttentionPriority = AlertSeverity.Low },
                new LocationUnit { Code = "LOC-008", Name = "Intensive Care Unit (ICU)", Floor = "2nd Floor - 210", Type = "ICU", Facility = "Connected Care Hospital", FacilityLocation = "Chennai, Tamil Nadu", UnitsCount = 12, Beds = 20, Status = DoctorStatus.Active, Capacity = "20 Beds", Occupied = "18 Beds", OccupancyRate = "90%", AttentionPriority = AlertSeverity.Critical }
            };
            context.LocationUnits.AddRange(locationUnits);
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

        // 9. Seed User Account Item Records (Matching Image 3)
        if (!await context.UserAccountItemRecords.AnyAsync())
        {
            var userAccounts = new List<UserAccountItemRecord>
            {
                new UserAccountItemRecord { UserName = "John Admin", Email = "john.admin@connectedcare.com", Role = "System Administrator", Department = "Administration", Location = "Main Campus", Status = "Active", LastSignInText = "May 19, 2025 10:15 AM" },
                new UserAccountItemRecord { UserName = "Priya Nurse", Email = "priya.nurse@connectedcare.com", Role = "Nurse", Department = "Nursing", Location = "West Wing", Status = "Active", LastSignInText = "May 19, 2025 09:42 AM" },
                new UserAccountItemRecord { UserName = "Dr. David Allen", Email = "david.allen@connectedcare.com", Role = "Doctor", Department = "Medical", Location = "Main Campus", Status = "Active", LastSignInText = "May 19, 2025 08:30 AM" },
                new UserAccountItemRecord { UserName = "Anita Sharma", Email = "anita.sharma@connectedcare.com", Role = "Care Manager", Department = "Care Management", Location = "North Wing", Status = "Active", LastSignInText = "May 18, 2025 06:20 PM" },
                new UserAccountItemRecord { UserName = "Robert Brown", Email = "robert.brown@connectedcare.com", Role = "Billing Staff", Department = "Billing & Finance", Location = "Main Campus", Status = "Inactive", LastSignInText = "May 15, 2025 11:05 AM" },
                new UserAccountItemRecord { UserName = "Sarah Young", Email = "sarah.young@connectedcare.com", Role = "Nurse", Department = "Nursing", Location = "East Wing", Status = "Active", LastSignInText = "May 19, 2025 07:50 AM" },
                new UserAccountItemRecord { UserName = "Tom George", Email = "tom.george@connectedcare.com", Role = "IT Support", Department = "Information Technology", Location = "Main Campus", Status = "Locked", LastSignInText = "May 14, 2025 -" },
                new UserAccountItemRecord { UserName = "Mary Johnson", Email = "mary.johnson@connectedcare.com", Role = "Receptionist", Department = "Administration", Location = "Main Campus", Status = "Active", LastSignInText = "May 19, 2025 09:10 AM" }
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
                new CustomReportRecord { ReportName = "Financial Revenue Summary", Description = "Monthly billing, payments, and outstanding receivables report", Category = "Financial", Frequency = "Monthly", Status = "Active", LastModifiedText = "May 10, 2025" }
            };
            context.CustomReportRecords.AddRange(reports);
            await context.SaveChangesAsync();
        }

        // 13. Seed Integrations
        if (!await context.IntegrationItemRecords.AnyAsync())
        {
            var integrations = new List<IntegrationItemRecord>
            {
                new IntegrationItemRecord { Name = "Epic EHR System", SystemApplication = "Epic Systems", Category = "EHR / EMR", ConnectionType = "HL7 / FHIR API", Description = "Real-time bidirectional resident health record synchronization", Status = "Active", IconLogo = "database", LastSyncText = "5 mins ago", ConnectedOnText = "Jan 10, 2024", DataSyncRateText = "Real-Time", DataLastSyncCount = 12500, DataLastSyncText = "12,500 records synced", NextSyncText = "Continuous" },
                new IntegrationItemRecord { Name = "Cerner Health Gateway", SystemApplication = "Oracle Cerner", Category = "EHR / EMR", ConnectionType = "REST API", Description = "Laboratory and pathology diagnostic result sync", Status = "Active", IconLogo = "activity", LastSyncText = "12 mins ago", ConnectedOnText = "Feb 15, 2024", DataSyncRateText = "15 Minutes", DataLastSyncCount = 4800, DataLastSyncText = "4,800 records synced", NextSyncText = "In 3 mins" },
                new IntegrationItemRecord { Name = "Omnicell Medication Dispenser", SystemApplication = "Omnicell", Category = "Pharmacy", ConnectionType = "Direct Integration", Description = "Automated dispensing cabinet inventory and dosage logs", Status = "Active", IconLogo = "pill", LastSyncText = "1 min ago", ConnectedOnText = "Mar 01, 2024", DataSyncRateText = "Real-Time", DataLastSyncCount = 3200, DataLastSyncText = "3,200 records synced", NextSyncText = "Continuous" }
            };
            context.IntegrationItemRecords.AddRange(integrations);
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
                new ClinicalEncounterRecord { DateText = "May 19, 2025 09:15 AM", PatientName = "Jane Doe", PatientIdCode = "P-1001", EncounterType = "Inpatient Review", ProviderName = "Dr. Michael Brown", ReasonDiagnosis = "Hypertension follow-up and dosage adjustment" },
                new ClinicalEncounterRecord { DateText = "May 18, 2025 02:30 PM", PatientName = "Robert Johnson", PatientIdCode = "P-1002", EncounterType = "Outpatient Consultation", ProviderName = "Dr. Sarah Wilson", ReasonDiagnosis = "Routine chest X-ray and cardiac monitoring" }
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
                new FinancialTransactionRecord { DateText = "May 18, 2025 04:10 PM", Type = "Bill Paid", Reference = "BILL-78965", CustomerVendor = "MedSupply Solutions", AmountText = "₹ 32,450", Status = "Paid" }
            };
            context.FinancialTransactionRecords.AddRange(transactions);
            await context.SaveChangesAsync();
        }

        // 17. Seed Users (Admin, Doctor, Nurse)
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == "admin");
        if (adminUser == null)
        {
            var (adminHash, adminSalt) = PasswordHasher.CreatePasswordHash("admin123");
            context.Users.Add(new User { Username = "admin", Email = "admin@connectcare.org", PasswordHash = adminHash, PasswordSalt = adminSalt, Role = "Admin", IsActive = true });
        }
        else if (string.IsNullOrEmpty(adminUser.PasswordSalt) || !PasswordHasher.VerifyPasswordHash("admin123", adminUser.PasswordHash, adminUser.PasswordSalt))
        {
            var (adminHash, adminSalt) = PasswordHasher.CreatePasswordHash("admin123");
            adminUser.PasswordHash = adminHash;
            adminUser.PasswordSalt = adminSalt;
            adminUser.Role = "Admin";
        }

        var doctorUser = await context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == "doctor");
        if (doctorUser == null)
        {
            var (doctorHash, doctorSalt) = PasswordHasher.CreatePasswordHash("doctor123");
            context.Users.Add(new User { Username = "doctor", Email = "doctor@connectcare.org", PasswordHash = doctorHash, PasswordSalt = doctorSalt, Role = "Doctor", IsActive = true });
        }
        else if (string.IsNullOrEmpty(doctorUser.PasswordSalt) || !PasswordHasher.VerifyPasswordHash("doctor123", doctorUser.PasswordHash, doctorUser.PasswordSalt))
        {
            var (doctorHash, doctorSalt) = PasswordHasher.CreatePasswordHash("doctor123");
            doctorUser.PasswordHash = doctorHash;
            doctorUser.PasswordSalt = doctorSalt;
            doctorUser.Role = "Doctor";
        }

        var nurseUser = await context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == "nurse");
        if (nurseUser == null)
        {
            var (nurseHash, nurseSalt) = PasswordHasher.CreatePasswordHash("nurse123");
            context.Users.Add(new User { Username = "nurse", Email = "nurse@connectcare.org", PasswordHash = nurseHash, PasswordSalt = nurseSalt, Role = "Nurse", IsActive = true });
        }
        else if (string.IsNullOrEmpty(nurseUser.PasswordSalt) || !PasswordHasher.VerifyPasswordHash("nurse123", nurseUser.PasswordHash, nurseUser.PasswordSalt))
        {
            var (nurseHash, nurseSalt) = PasswordHasher.CreatePasswordHash("nurse123");
            nurseUser.PasswordHash = nurseHash;
            nurseUser.PasswordSalt = nurseSalt;
            nurseUser.Role = "Nurse";
        }

        await context.SaveChangesAsync();

        // 18. Seed App Roles
        if (!await context.AppRoles.AnyAsync())
        {
            var roles = new List<AppRole>
            {
                new AppRole { RoleName = "Admin", DisplayName = "System Administrator", Description = "Full unrestricted administrative access to all modules and system settings", IsSystemRole = true },
                new AppRole { RoleName = "Doctor", DisplayName = "Physician / Specialist", Description = "Access to Doctor Portal, patient care plans, consultations, vitals, and clinical AI", IsSystemRole = true },
                new AppRole { RoleName = "Nurse", DisplayName = "Staff Nurse", Description = "Access to Nurse App, shift handover, vital rounds, medication tracking, and care documentation", IsSystemRole = true }
            };
            context.AppRoles.AddRange(roles);
            await context.SaveChangesAsync();
        }

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

        // 25. Seed Medication Records (Matching Image 7)
        if (!await context.MedicationRecords.AnyAsync())
        {
            var medicationRecords = new List<MedicationRecord>
            {
                new MedicationRecord { PatientName = "Patricia Smith", PatientIdCode = "PT-10001", PatientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", Name = "Metoprolol 50 mg", Form = "Tablet", Dosage = "50 mg", Route = "Oral", Frequency = "08:00 AM", NextDoseTime = "08:00 AM", RelativeTimeText = "Due in 15 min", Status = "Pending", PrescribedBy = "Dr. Sarah Wilson", PrescribedBySpecialty = "Cardiologist", Batch = "Batch: MTP1001", ExpiryDateText = "Dec 2025", DaysLeftText = "180 days left", Category = "Cardiovascular" },
                new MedicationRecord { PatientName = "Michael Davis", PatientIdCode = "PT-10002", PatientAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", Name = "Aspirin 81 mg", Form = "Tablet", Dosage = "81 mg", Route = "Oral", Frequency = "08:00 AM", NextDoseTime = "08:00 AM", RelativeTimeText = "Due in 15 min", Status = "Pending", PrescribedBy = "Dr. Michael Brown", PrescribedBySpecialty = "General Physician", Batch = "Batch: ASP2002", ExpiryDateText = "Jan 2026", DaysLeftText = "210 days left", Category = "Antiplatelet" },
                new MedicationRecord { PatientName = "Linda Martinez", PatientIdCode = "PT-10003", PatientAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", Name = "Lisinopril 10 mg", Form = "Tablet", Dosage = "10 mg", Route = "Oral", Frequency = "08:00 AM", NextDoseTime = "08:00 AM", RelativeTimeText = "Given", Status = "Given", PrescribedBy = "Dr. Emily Clark", PrescribedBySpecialty = "Internist", Batch = "Batch: LIS3003", ExpiryDateText = "Nov 2025", DaysLeftText = "150 days left", Category = "ACE Inhibitor" },
                new MedicationRecord { PatientName = "James Brown", PatientIdCode = "PT-10004", PatientAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", Name = "Furosemide 20 mg", Form = "Tablet", Dosage = "20 mg", Route = "Oral", Frequency = "08:00 AM", NextDoseTime = "08:00 AM", RelativeTimeText = "15 min late", Status = "Overdue", PrescribedBy = "Dr. James Lee", PrescribedBySpecialty = "Nephrologist", Batch = "Batch: FUR4004", ExpiryDateText = "Oct 2025", DaysLeftText = "120 days left", Category = "Diuretic" },
                new MedicationRecord { PatientName = "Mary Williams", PatientIdCode = "PT-10005", PatientAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", Name = "Paracetamol 650 mg", Form = "Tablet", Dosage = "650 mg", Route = "Oral", Frequency = "08:00 AM", NextDoseTime = "08:00 AM", RelativeTimeText = "Due in 15 min", Status = "Pending", PrescribedBy = "Dr. Anita Sharma", PrescribedBySpecialty = "Obstetrician", Batch = "Batch: PAR5005", ExpiryDateText = "Aug 2026", DaysLeftText = "360 days left", Category = "Analgesic" },
                new MedicationRecord { PatientName = "Robert Johnson", PatientIdCode = "PT-10006", PatientAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80", Name = "Atorvastatin 20 mg", Form = "Tablet", Dosage = "20 mg", Route = "Oral", Frequency = "08:00 AM", NextDoseTime = "08:00 AM", RelativeTimeText = "Given", Status = "Given", PrescribedBy = "Dr. David Patel", PrescribedBySpecialty = "Neurologist", Batch = "Batch: ATO6006", ExpiryDateText = "Feb 2026", DaysLeftText = "240 days left", Category = "Statin" },
                new MedicationRecord { PatientName = "Sarah Wilson", PatientIdCode = "PT-10007", PatientAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", Name = "Amoxicillin 500 mg", Form = "Capsule", Dosage = "500 mg", Route = "Oral", Frequency = "08:00 AM", NextDoseTime = "08:00 AM", RelativeTimeText = "Due in 15 min", Status = "Pending", PrescribedBy = "Dr. Linda Martinez", PrescribedBySpecialty = "Physician", Batch = "Batch: AMX7007", ExpiryDateText = "Sep 2025", DaysLeftText = "90 days left", Category = "Antibiotic" },
                new MedicationRecord { PatientName = "William Taylor", PatientIdCode = "PT-10008", PatientAvatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80", Name = "Vitamin D3 60K", Form = "Capsule", Dosage = "60K", Route = "Oral", Frequency = "08:00 AM", NextDoseTime = "08:00 AM", RelativeTimeText = "Due in 15 min", Status = "Pending", PrescribedBy = "Dr. Robert Johnson", PrescribedBySpecialty = "Endocrinologist", Batch = "Batch: VIT8008", ExpiryDateText = "Dec 2026", DaysLeftText = "480 days left", Category = "Supplement" }
            };
            context.MedicationRecords.AddRange(medicationRecords);
            await context.SaveChangesAsync();
        }

        // 26. Seed Alerts (Matching Image 8)
        if (!await context.Alerts.AnyAsync())
        {
            var alerts = new List<Alert>
            {
                new Alert { Title = "High Blood Pressure", Description = "BP: 180/110 mmHg", TriggerCondition = "BP: 180/110 mmHg", PatientName = "Patricia Smith", PatientIdCode = "PT-10001", PatientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", RoomLocation = "302", CareUnit = "Cardiology Unit", AgeGender = "68 Y • Female", BloodGroup = "A+", PatientType = "Inpatient", Type = "Vital Signs", Severity = AlertSeverity.Critical, TimestampText = "May 22, 2024 08:05 AM", Status = "New", DetectedBy = "Monitor System", Source = "Bedside Monitor", Notes = "Patient complained of headache and dizziness." },
                new Alert { Title = "Low SpO₂ Level", Description = "SpO₂: 88%", TriggerCondition = "SpO₂: 88%", PatientName = "Michael Davis", PatientIdCode = "PT-10002", PatientAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", RoomLocation = "201", CareUnit = "Medical Unit", AgeGender = "72 Y • Male", BloodGroup = "O+", PatientType = "Inpatient", Type = "Vital Signs", Severity = AlertSeverity.Critical, TimestampText = "May 22, 2024 07:58 AM", Status = "In Progress", DetectedBy = "Pulse Oximeter", Source = "Continuous Monitor", Notes = "Oxygen therapy started at 2L/min." },
                new Alert { Title = "Medication Overdue", Description = "Aspirin 81 mg", TriggerCondition = "Aspirin 81 mg", PatientName = "Linda Martinez", PatientIdCode = "PT-10003", PatientAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", RoomLocation = "305", CareUnit = "Surgical Unit", AgeGender = "69 Y • Female", BloodGroup = "B+", PatientType = "Inpatient", Type = "Medication", Severity = AlertSeverity.High, TimestampText = "May 22, 2024 07:45 AM", Status = "New", DetectedBy = "MAR System", Source = "Medication Schedule", Notes = "Morning dose pending administration." },
                new Alert { Title = "Pain Score High", Description = "Pain Score: 8/10", TriggerCondition = "Pain Score: 8/10", PatientName = "James Brown", PatientIdCode = "PT-10004", PatientAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", RoomLocation = "102", CareUnit = "General Ward", AgeGender = "65 Y • Male", BloodGroup = "AB+", PatientType = "Inpatient", Type = "Assessment", Severity = AlertSeverity.High, TimestampText = "May 22, 2024 07:30 AM", Status = "In Progress", DetectedBy = "Nurse Assessment", Source = "Nursing Round", Notes = "Severe postoperative abdominal pain reported." },
                new Alert { Title = "IV Site Infiltration", Description = "Left hand IV site", TriggerCondition = "Left hand IV site", PatientName = "Mary Williams", PatientIdCode = "PT-10005", PatientAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", RoomLocation = "401", CareUnit = "Maternity Unit", AgeGender = "34 Y • Female", BloodGroup = "A-", PatientType = "Inpatient", Type = "Nursing Care", Severity = AlertSeverity.High, TimestampText = "May 22, 2024 07:20 AM", Status = "New", DetectedBy = "Physical Exam", Source = "IV Line Inspection", Notes = "Swelling and erythema noted around IV site." },
                new Alert { Title = "Blood Glucose High", Description = "BG: 220 mg/dL", TriggerCondition = "BG: 220 mg/dL", PatientName = "Robert Johnson", PatientIdCode = "PT-10006", PatientAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80", RoomLocation = "502", CareUnit = "Cardiology Unit", AgeGender = "58 Y • Male", BloodGroup = "O-", PatientType = "Inpatient", Type = "Vital Signs", Severity = AlertSeverity.Medium, TimestampText = "May 22, 2024 07:10 AM", Status = "New", DetectedBy = "Glucometer", Source = "Morning Point-of-Care Test", Notes = "Fasting blood sugar level elevated." },
                new Alert { Title = "Care Plan Review Due", Description = "Diabetes Care Plan", TriggerCondition = "Diabetes Care Plan", PatientName = "Sarah Wilson", PatientIdCode = "PT-10007", PatientAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80", RoomLocation = "307", CareUnit = "Medical Unit", AgeGender = "29 Y • Female", BloodGroup = "B-", PatientType = "Inpatient", Type = "Care Plan", Severity = AlertSeverity.Medium, TimestampText = "May 22, 2024 06:50 AM", Status = "Pending", DetectedBy = "EHR Scheduler", Source = "Care Plan Module", Notes = "Multidisciplinary review due today." },
                new Alert { Title = "New Lab Result", Description = "Hemoglobin Reported", TriggerCondition = "Hemoglobin Reported", PatientName = "William Taylor", PatientIdCode = "PT-10008", PatientAvatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80", RoomLocation = "101", CareUnit = "General Ward", AgeGender = "40 Y • Male", BloodGroup = "A+", PatientType = "Inpatient", Type = "Lab Result", Severity = AlertSeverity.Low, TimestampText = "May 22, 2024 06:40 AM", Status = "New", DetectedBy = "LIS System", Source = "Central Lab", Notes = "Complete blood count lab report ready." }
            };
            context.Alerts.AddRange(alerts);
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
                new NurseReportRecord { ReportName = "Patient Care Summary", ReportType = "Patient Report", Description = "Summary of patient care activities and outcomes", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 22, 2024 10:30 AM", Format = "PDF", CategoryTab = "Overview" },
                new NurseReportRecord { ReportName = "Vital Signs Trends", ReportType = "Clinical Report", Description = "Average and trends of vital signs by patient", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 22, 2024 09:15 AM", Format = "PDF", CategoryTab = "Overview" },
                new NurseReportRecord { ReportName = "Medication Administration Report", ReportType = "Medication Report", Description = "Summary of medications administered", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 22, 2024 08:45 AM", Format = "Excel", CategoryTab = "Overview" },
                new NurseReportRecord { ReportName = "Task Completion Summary", ReportType = "Operational Report", Description = "Overview of tasks completed by shift", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 21, 2024 08:00 PM", Format = "PDF", CategoryTab = "Overview" },
                new NurseReportRecord { ReportName = "Incident Report Summary", ReportType = "Quality & Safety", Description = "Summary of incidents and near misses", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 21, 2024 05:00 PM", Format = "PDF", CategoryTab = "Overview" },
                new NurseReportRecord { ReportName = "Patient Discharge Summary", ReportType = "Patient Report", Description = "Discharged patients summary by date", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 21, 2024 03:30 PM", Format = "Excel", CategoryTab = "Overview" },
                new NurseReportRecord { ReportName = "Care Plan Compliance", ReportType = "Clinical Report", Description = "Care plan adherence and compliance report", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 21, 2024 11:20 AM", Format = "PDF", CategoryTab = "Overview" },
                new NurseReportRecord { ReportName = "Alerts & Response Report", ReportType = "Operational Report", Description = "Alerts raised and response time summary", GeneratedByName = "Emma Johnson", GeneratedByRole = "Staff Nurse", GeneratedOnText = "May 21, 2024 09:10 AM", Format = "Excel", CategoryTab = "Overview" }
            };
            context.NurseReports.AddRange(reports);
            await context.SaveChangesAsync();
        }
    }
}

