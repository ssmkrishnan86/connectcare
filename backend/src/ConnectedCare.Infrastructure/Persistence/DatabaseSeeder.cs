using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Infrastructure.Common.Security;
using Microsoft.EntityFrameworkCore;

namespace ConnectedCare.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ConnectedCareDbContext context)
    {


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
        else if (string.IsNullOrEmpty(adminUser.PasswordSalt) || string.IsNullOrEmpty(adminUser.PasswordHash))
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

    }
}


