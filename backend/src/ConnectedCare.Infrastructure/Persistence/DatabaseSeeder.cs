using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
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
    }
}
