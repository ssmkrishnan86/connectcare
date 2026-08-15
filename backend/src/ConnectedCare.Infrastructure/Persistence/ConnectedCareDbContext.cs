using Microsoft.EntityFrameworkCore;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Infrastructure.Persistence;

public class ConnectedCareDbContext : DbContext
{
    public ConnectedCareDbContext(DbContextOptions<ConnectedCareDbContext> options)
        : base(options)
    {
    }

    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Nurse> Nurses => Set<Nurse>();
    public DbSet<CareTeamMember> CareTeamMembers => Set<CareTeamMember>();
    public DbSet<LocationUnit> LocationUnits => Set<LocationUnit>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<MedicationRecord> MedicationRecords => Set<MedicationRecord>();
    public DbSet<MedicationReminder> MedicationReminders => Set<MedicationReminder>();
    public DbSet<DrugInteractionAlert> DrugInteractionAlerts => Set<DrugInteractionAlert>();
    public DbSet<ActivitySummaryLog> ActivitySummaryLogs => Set<ActivitySummaryLog>();
    public DbSet<ClinicalEncounterRecord> ClinicalEncounterRecords => Set<ClinicalEncounterRecord>();
    public DbSet<FinancialTransactionRecord> FinancialTransactionRecords => Set<FinancialTransactionRecord>();
    public DbSet<CustomReportRecord> CustomReportRecords => Set<CustomReportRecord>();
    public DbSet<IntegrationItemRecord> IntegrationItemRecords => Set<IntegrationItemRecord>();
    public DbSet<IntegrationActivityLogRecord> IntegrationActivityLogRecords => Set<IntegrationActivityLogRecord>();
    public DbSet<AuditLogEntryRecord> AuditLogEntryRecords => Set<AuditLogEntryRecord>();
    public DbSet<AiServiceStatusRecord> AiServiceStatusRecords => Set<AiServiceStatusRecord>();
    public DbSet<AiWorkflowMetricRecord> AiWorkflowMetricRecords => Set<AiWorkflowMetricRecord>();
    public DbSet<AiActivityLogRecord> AiActivityLogRecords => Set<AiActivityLogRecord>();
    public DbSet<UserSettingsRecord> UserSettingsRecords => Set<UserSettingsRecord>();
    public DbSet<OrganizationSettingsRecord> OrganizationSettingsRecords => Set<OrganizationSettingsRecord>();
    public DbSet<GeneralAppSettingsRecord> GeneralAppSettingsRecords => Set<GeneralAppSettingsRecord>();
    public DbSet<LocalizationSettingsRecord> LocalizationSettingsRecords => Set<LocalizationSettingsRecord>();
    public DbSet<SecuritySettingsRecord> SecuritySettingsRecords => Set<SecuritySettingsRecord>();
    public DbSet<BackupHistoryRecord> BackupHistoryRecords => Set<BackupHistoryRecord>();
    public DbSet<SubscriptionPlanRecord> SubscriptionPlanRecords => Set<SubscriptionPlanRecord>();
    public DbSet<BillingInvoiceRecord> BillingInvoiceRecords => Set<BillingInvoiceRecord>();
    public DbSet<UserAccountItemRecord> UserAccountItemRecords => Set<UserAccountItemRecord>();
    public DbSet<RoleDefinitionItemRecord> RoleDefinitionItemRecords => Set<RoleDefinitionItemRecord>();
    public DbSet<NotificationTemplateItemRecord> NotificationTemplateItemRecords => Set<NotificationTemplateItemRecord>();
    public DbSet<SystemConfigToggleRecord> SystemConfigToggleRecords => Set<SystemConfigToggleRecord>();
    public DbSet<SystemIntegration> SystemIntegrations => Set<SystemIntegration>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AppRole> AppRoles => Set<AppRole>();
    public DbSet<AppPermission> AppPermissions => Set<AppPermission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<DoctorConsultation> DoctorConsultations => Set<DoctorConsultation>();
    public DbSet<PatientCarePlanRecord> PatientCarePlanRecords => Set<PatientCarePlanRecord>();
    public DbSet<PatientDocumentRecord> PatientDocumentRecords => Set<PatientDocumentRecord>();
    public DbSet<DoctorAiConversation> DoctorAiConversations => Set<DoctorAiConversation>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries<AuditableEntity>();
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedDate = DateTime.UtcNow;
                entry.Entity.UpdatedDate = DateTime.UtcNow;
                if (string.IsNullOrEmpty(entry.Entity.CreatedBy))
                    entry.Entity.CreatedBy = "System";
                if (string.IsNullOrEmpty(entry.Entity.UpdatedBy))
                    entry.Entity.UpdatedBy = "System";
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedDate = DateTime.UtcNow;
                if (string.IsNullOrEmpty(entry.Entity.UpdatedBy))
                    entry.Entity.UpdatedBy = "System";
            }
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Doctors
        modelBuilder.Entity<Doctor>(b =>
        {
            b.ToTable("doctors");
            b.HasKey(d => d.Id);
            b.Property(d => d.Id).HasColumnName("id");
            b.Property(d => d.DoctorIdCode).HasColumnName("doctor_id_code").HasMaxLength(50).IsRequired();
            b.HasIndex(d => d.DoctorIdCode).IsUnique();
            b.Property(d => d.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            b.Property(d => d.Avatar).HasColumnName("avatar");
            b.Property(d => d.Specialty).HasColumnName("specialty").HasMaxLength(100).IsRequired();
            b.Property(d => d.SpecialtyIcon).HasColumnName("specialty_icon").HasMaxLength(20);
            b.Property(d => d.Department).HasColumnName("department").HasMaxLength(100).IsRequired();
            b.Property(d => d.Location).HasColumnName("location").HasMaxLength(150);
            b.Property(d => d.Phone).HasColumnName("phone").HasMaxLength(30);
            b.Property(d => d.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
            b.HasIndex(d => d.Email).IsUnique();
            b.Property(d => d.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(d => d.Experience).HasColumnName("experience").HasMaxLength(50);
            b.Property(d => d.TeleconsultationEnabled).HasColumnName("teleconsultation_enabled").IsRequired();
            b.Property(d => d.CreatedDate).HasColumnName("created_date");
            b.Property(d => d.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(d => d.UpdatedDate).HasColumnName("updated_date");
            b.Property(d => d.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(d => d.CreatedAtUtc);
        });

        // Nurses
        modelBuilder.Entity<Nurse>(b =>
        {
            b.ToTable("nurses");
            b.HasKey(n => n.Id);
            b.Property(n => n.Id).HasColumnName("id");
            b.Property(n => n.NurseIdCode).HasColumnName("nurse_id_code").HasMaxLength(50).IsRequired();
            b.HasIndex(n => n.NurseIdCode).IsUnique();
            b.Property(n => n.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            b.Property(n => n.Avatar).HasColumnName("avatar");
            b.Property(n => n.Department).HasColumnName("department").HasMaxLength(100);
            b.Property(n => n.SubUnit).HasColumnName("sub_unit").HasMaxLength(100);
            b.Property(n => n.Location).HasColumnName("location").HasMaxLength(150);
            b.Property(n => n.Shift).HasColumnName("shift").HasMaxLength(100).IsRequired();
            b.Property(n => n.AssignedUnit).HasColumnName("assigned_unit").HasMaxLength(100);
            b.Property(n => n.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(n => n.Phone).HasColumnName("phone").HasMaxLength(30);
            b.Property(n => n.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
            b.HasIndex(n => n.Email).IsUnique();
            b.Property(n => n.Experience).HasColumnName("experience").HasMaxLength(50);
            b.Property(n => n.CreatedDate).HasColumnName("created_date");
            b.Property(n => n.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(n => n.UpdatedDate).HasColumnName("updated_date");
            b.Property(n => n.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(n => n.CreatedAtUtc);
        });

        // Patients
        modelBuilder.Entity<Patient>(b =>
        {
            b.ToTable("patients");
            b.HasKey(p => p.Id);
            b.Property(p => p.Id).HasColumnName("id");
            b.Property(p => p.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50).IsRequired();
            b.HasIndex(p => p.PatientIdCode).IsUnique();
            b.Property(p => p.Mrn).HasColumnName("mrn").HasMaxLength(50).IsRequired();
            b.HasIndex(p => p.Mrn).IsUnique();
            b.Property(p => p.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            b.Property(p => p.Avatar).HasColumnName("avatar");
            b.Property(p => p.Dob).HasColumnName("dob").HasMaxLength(50);
            b.Property(p => p.AgeGender).HasColumnName("age_gender").HasMaxLength(50);
            b.Property(p => p.Phone).HasColumnName("phone").HasMaxLength(30);
            b.Property(p => p.Email).HasColumnName("email").HasMaxLength(150);
            b.Property(p => p.Address).HasColumnName("address").HasMaxLength(250);
            b.Property(p => p.CareUnit).HasColumnName("care_unit").HasMaxLength(100).IsRequired();
            b.Property(p => p.FloorRoom).HasColumnName("floor_room").HasMaxLength(100);
            
            b.Property(p => p.PrimaryDoctorId).HasColumnName("primary_doctor_id");
            b.HasOne(p => p.PrimaryDoctor)
             .WithMany(d => d.PrimaryPatients)
             .HasForeignKey(p => p.PrimaryDoctorId)
             .OnDelete(DeleteBehavior.SetNull);

            b.Property(p => p.PrimaryDoctorName).HasColumnName("primary_doctor_name").HasMaxLength(200);
            b.Property(p => p.PrimaryDoctorSpecialty).HasColumnName("primary_doctor_specialty").HasMaxLength(100);
            b.Property(p => p.PrimaryDoctorAvatar).HasColumnName("primary_doctor_avatar");

            b.Property(p => p.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(p => p.RiskLevel).HasColumnName("risk_level").HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(p => p.LastVisit).HasColumnName("last_visit").HasMaxLength(100);
            b.Property(p => p.AdmissionDate).HasColumnName("admission_date").HasMaxLength(50);
            b.Property(p => p.CareDays).HasColumnName("care_days");
            b.Property(p => p.DischargePlan).HasColumnName("discharge_plan").HasMaxLength(150);
            
            b.Property(p => p.BloodPressure).HasColumnName("blood_pressure").HasMaxLength(30);
            b.Property(p => p.HeartRate).HasColumnName("heart_rate").HasMaxLength(30);
            b.Property(p => p.BloodSugar).HasColumnName("blood_sugar").HasMaxLength(30);
            b.Property(p => p.Temperature).HasColumnName("temperature").HasMaxLength(30);
            b.Property(p => p.SpO2).HasColumnName("spo2").HasMaxLength(30);

            b.Property(p => p.CreatedDate).HasColumnName("created_date");
            b.Property(p => p.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(p => p.UpdatedDate).HasColumnName("updated_date");
            b.Property(p => p.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(p => p.CreatedAtUtc);
        });

        // CareTeamMembers
        modelBuilder.Entity<CareTeamMember>(b =>
        {
            b.ToTable("care_team_members");
            b.HasKey(c => c.Id);
            b.Property(c => c.Id).HasColumnName("id");
            b.Property(c => c.MemberIdCode).HasColumnName("member_id_code").HasMaxLength(50).IsRequired();
            b.HasIndex(c => c.MemberIdCode).IsUnique();
            b.Property(c => c.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            b.Property(c => c.Avatar).HasColumnName("avatar");
            b.Property(c => c.Role).HasColumnName("role").HasConversion<string>().HasMaxLength(50).IsRequired();
            b.Property(c => c.Department).HasColumnName("department").HasMaxLength(100);
            b.Property(c => c.Location).HasColumnName("location").HasMaxLength(150);
            b.Property(c => c.Phone).HasColumnName("phone").HasMaxLength(30);
            b.Property(c => c.Email).HasColumnName("email").HasMaxLength(150);
            b.Property(c => c.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(c => c.Shift).HasColumnName("shift").HasMaxLength(100);

            b.Property(c => c.DoctorId).HasColumnName("doctor_id");
            b.HasOne(c => c.Doctor)
             .WithMany(d => d.CareTeamAssignments)
             .HasForeignKey(c => c.DoctorId)
             .OnDelete(DeleteBehavior.SetNull);

            b.Property(c => c.NurseId).HasColumnName("nurse_id");
            b.HasOne(c => c.Nurse)
             .WithMany(n => n.CareTeamAssignments)
             .HasForeignKey(c => c.NurseId)
             .OnDelete(DeleteBehavior.SetNull);

            b.Property(c => c.PatientId).HasColumnName("patient_id");
            b.HasOne(c => c.Patient)
             .WithMany(p => p.CareTeamMembers)
             .HasForeignKey(c => c.PatientId)
             .OnDelete(DeleteBehavior.SetNull);

            b.Property(c => c.CreatedDate).HasColumnName("created_date");
            b.Property(c => c.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(c => c.UpdatedDate).HasColumnName("updated_date");
            b.Property(c => c.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(c => c.CreatedAtUtc);
        });

        // LocationUnits
        modelBuilder.Entity<LocationUnit>(b =>
        {
            b.ToTable("location_units");
            b.HasKey(l => l.Id);
            b.Property(l => l.Id).HasColumnName("id");
            b.Property(l => l.Code).HasColumnName("code").HasMaxLength(50);
            b.Property(l => l.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
            b.HasIndex(l => l.Name).IsUnique();
            b.Property(l => l.Avatar).HasColumnName("avatar");
            b.Property(l => l.Type).HasColumnName("type").HasMaxLength(50);
            b.Property(l => l.Facility).HasColumnName("facility").HasMaxLength(150);
            b.Property(l => l.FacilityLocation).HasColumnName("facility_location").HasMaxLength(150);
            b.Property(l => l.UnitsCount).HasColumnName("units_count");
            b.Property(l => l.Beds).HasColumnName("beds");
            b.Property(l => l.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(30);
            b.Property(l => l.Floor).HasColumnName("floor").HasMaxLength(50);
            b.Property(l => l.Capacity).HasColumnName("capacity").HasMaxLength(50);
            b.Property(l => l.Occupied).HasColumnName("occupied").HasMaxLength(50);
            b.Property(l => l.OccupancyRate).HasColumnName("occupancy_rate").HasMaxLength(50);
            b.Property(l => l.AttentionPriority).HasColumnName("attention_priority").HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(l => l.CreatedDate).HasColumnName("created_date");
            b.Property(l => l.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(l => l.UpdatedDate).HasColumnName("updated_date");
            b.Property(l => l.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(l => l.CreatedAtUtc);
        });

        // Alerts
        modelBuilder.Entity<Alert>(b =>
        {
            b.ToTable("alerts");
            b.HasKey(a => a.Id);
            b.Property(a => a.Id).HasColumnName("id");
            b.Property(a => a.AlertIdCode).HasColumnName("alert_id_code").HasMaxLength(50).IsRequired();
            b.HasIndex(a => a.AlertIdCode).IsUnique();
            b.Property(a => a.Title).HasColumnName("title").HasMaxLength(250);
            b.Property(a => a.Description).HasColumnName("description");

            b.Property(a => a.PatientId).HasColumnName("patient_id");
            b.HasOne(a => a.Patient)
             .WithMany(p => p.Alerts)
             .HasForeignKey(a => a.PatientId)
             .OnDelete(DeleteBehavior.SetNull);

            b.Property(a => a.PatientName).HasColumnName("patient_name").HasMaxLength(200).IsRequired();
            b.Property(a => a.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(a => a.PatientAvatar).HasColumnName("patient_avatar");
            b.Property(a => a.Type).HasColumnName("type").HasMaxLength(50);
            b.Property(a => a.RoomLocation).HasColumnName("room_location").HasMaxLength(150);
            b.Property(a => a.Severity).HasColumnName("severity").HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(a => a.ReportedBy).HasColumnName("reported_by").HasMaxLength(150);
            b.Property(a => a.ReportedByRole).HasColumnName("reported_by_role").HasMaxLength(100);
            b.Property(a => a.TriggerCondition).HasColumnName("trigger_condition").HasMaxLength(250).IsRequired();
            b.Property(a => a.TimestampText).HasColumnName("timestamp_text").HasMaxLength(50);
            b.Property(a => a.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(a => a.IsAcknowledged).HasColumnName("is_acknowledged").IsRequired();
            b.Property(a => a.CreatedDate).HasColumnName("created_date");
            b.Property(a => a.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(a => a.UpdatedDate).HasColumnName("updated_date");
            b.Property(a => a.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(a => a.CreatedAtUtc);
        });

        // Tasks
        modelBuilder.Entity<TaskItem>(b =>
        {
            b.ToTable("tasks");
            b.HasKey(t => t.Id);
            b.Property(t => t.Id).HasColumnName("id");
            b.Property(t => t.TaskIdCode).HasColumnName("task_id_code").HasMaxLength(50).IsRequired();
            b.HasIndex(t => t.TaskIdCode).IsUnique();

            b.Property(t => t.PatientId).HasColumnName("patient_id");
            b.HasOne(t => t.Patient)
             .WithMany(p => p.Tasks)
             .HasForeignKey(t => t.PatientId)
             .OnDelete(DeleteBehavior.SetNull);

            b.Property(t => t.Title).HasColumnName("title").HasMaxLength(250).IsRequired();
            b.Property(t => t.Description).HasColumnName("description");
            b.Property(t => t.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(t => t.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(t => t.PatientAvatar).HasColumnName("patient_avatar");
            b.Property(t => t.TaskType).HasColumnName("task_type").HasMaxLength(100);
            b.Property(t => t.AssignedCaregiver).HasColumnName("assigned_caregiver").HasMaxLength(200);
            b.Property(t => t.AssigneeRole).HasColumnName("assignee_role").HasMaxLength(100);
            b.Property(t => t.AssigneeAvatar).HasColumnName("assignee_avatar");
            b.Property(t => t.Priority).HasColumnName("priority").HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(t => t.DueTime).HasColumnName("due_time").HasMaxLength(50);
            b.Property(t => t.IsOverdue).HasColumnName("is_overdue");
            b.Property(t => t.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(t => t.StatusStr).HasColumnName("status_str").HasMaxLength(50);
            b.Property(t => t.CreatedDate).HasColumnName("created_date");
            b.Property(t => t.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(t => t.UpdatedDate).HasColumnName("updated_date");
            b.Property(t => t.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(t => t.CreatedAtUtc);
        });

        // OrganizationSettingsRecord
        modelBuilder.Entity<OrganizationSettingsRecord>(b =>
        {
            b.ToTable("organization_settings_records");
            b.HasKey(o => o.Id);
            b.Property(o => o.Id).HasColumnName("id");
            b.Property(o => o.OrganizationName).HasColumnName("organization_name").HasMaxLength(200);
            b.Property(o => o.LogoUrl).HasColumnName("logo_url");
            b.Property(o => o.Tagline).HasColumnName("tagline");
            b.Property(o => o.PrimaryColor).HasColumnName("primary_color").HasMaxLength(50);
            b.Property(o => o.Phone).HasColumnName("phone").HasMaxLength(50);
            b.Property(o => o.Address).HasColumnName("address");
            b.Property(o => o.Email).HasColumnName("email").HasMaxLength(150);
            b.Property(o => o.OrganizationType).HasColumnName("organization_type").HasMaxLength(100);
            b.Property(o => o.RegistrationNumber).HasColumnName("registration_number").HasMaxLength(100);
            b.Property(o => o.EstablishedYear).HasColumnName("established_year").HasMaxLength(50);
            b.Property(o => o.Website).HasColumnName("website").HasMaxLength(200);
            b.Property(o => o.PrimaryContactPerson).HasColumnName("primary_contact_person").HasMaxLength(150);
            b.Property(o => o.PrimaryContactDesignation).HasColumnName("primary_contact_designation").HasMaxLength(100);
            b.Property(o => o.PrimaryContactEmail).HasColumnName("primary_contact_email").HasMaxLength(150);
            b.Property(o => o.PrimaryContactPhone).HasColumnName("primary_contact_phone").HasMaxLength(50);
            b.Property(o => o.PrimaryContactAlternatePhone).HasColumnName("primary_contact_alternate_phone").HasMaxLength(50);
            b.Property(o => o.AddressLine1).HasColumnName("address_line_1");
            b.Property(o => o.AddressLine2).HasColumnName("address_line_2");
            b.Property(o => o.City).HasColumnName("city").HasMaxLength(100);
            b.Property(o => o.State).HasColumnName("state").HasMaxLength(100);
            b.Property(o => o.PinCode).HasColumnName("pin_code").HasMaxLength(50);
            b.Property(o => o.Country).HasColumnName("country").HasMaxLength(100);
            b.Property(o => o.DefaultTimeZone).HasColumnName("default_time_zone").HasMaxLength(150);
            b.Property(o => o.DefaultLanguage).HasColumnName("default_language").HasMaxLength(50);
            b.Property(o => o.DefaultDateFormat).HasColumnName("default_date_format").HasMaxLength(50);
            b.Property(o => o.DefaultTimeFormat).HasColumnName("default_time_format").HasMaxLength(50);
            b.Property(o => o.Currency).HasColumnName("currency").HasMaxLength(50);
            b.Property(o => o.WeekStartsOn).HasColumnName("week_starts_on").HasMaxLength(50);
            b.Property(o => o.EnableMultiLocation).HasColumnName("enable_multi_location");
            b.Property(o => o.EnabledModulesJson).HasColumnName("enabled_modules_json");
            b.Property(o => o.CreatedDate).HasColumnName("created_date");
            b.Property(o => o.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(o => o.UpdatedDate).HasColumnName("updated_date");
            b.Property(o => o.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(o => o.CreatedAtUtc);
        });

        // GeneralAppSettingsRecord
        modelBuilder.Entity<GeneralAppSettingsRecord>(b =>
        {
            b.ToTable("general_app_settings_records");
            b.HasKey(g => g.Id);
            b.Property(g => g.Id).HasColumnName("id");
            b.Property(g => g.OrganizationName).HasColumnName("organization_name").HasMaxLength(200);
            b.Property(g => g.Tagline).HasColumnName("tagline");
            b.Property(g => g.LogoUrl).HasColumnName("logo_url");
            b.Property(g => g.PrimaryColor).HasColumnName("primary_color").HasMaxLength(50);
            b.Property(g => g.Phone).HasColumnName("phone").HasMaxLength(50);
            b.Property(g => g.Email).HasColumnName("email").HasMaxLength(150);
            b.Property(g => g.Address).HasColumnName("address");
            b.Property(g => g.DateFormat).HasColumnName("date_format").HasMaxLength(50);
            b.Property(g => g.ShortDateFormat).HasColumnName("short_date_format").HasMaxLength(50);
            b.Property(g => g.DefaultLanguage).HasColumnName("default_language").HasMaxLength(50);
            b.Property(g => g.TimeFormat).HasColumnName("time_format").HasMaxLength(50);
            b.Property(g => g.ItemsPerPage).HasColumnName("items_per_page");
            b.Property(g => g.WeekStartsOn).HasColumnName("week_starts_on").HasMaxLength(50);
            b.Property(g => g.DefaultDashboard).HasColumnName("default_dashboard").HasMaxLength(100);
            b.Property(g => g.AllowPublicRegistration).HasColumnName("allow_public_registration");
            b.Property(g => g.SessionTimeoutMinutes).HasColumnName("session_timeout_minutes");
            b.Property(g => g.EnableAuditLogs).HasColumnName("enable_audit_logs");
            b.Property(g => g.PasswordExpiryDays).HasColumnName("password_expiry_days");
            b.Property(g => g.EnableTwoFactorAuth).HasColumnName("enable_two_factor_auth");
            b.Property(g => g.MaintenanceMode).HasColumnName("maintenance_mode");
            b.Property(g => g.WeightUnit).HasColumnName("weight_unit").HasMaxLength(50);
            b.Property(g => g.HeightUnit).HasColumnName("height_unit").HasMaxLength(50);
            b.Property(g => g.TemperatureUnit).HasColumnName("temperature_unit").HasMaxLength(50);
            b.Property(g => g.Currency).HasColumnName("currency").HasMaxLength(50);
            b.Property(g => g.CreatedDate).HasColumnName("created_date");
            b.Property(g => g.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(g => g.UpdatedDate).HasColumnName("updated_date");
            b.Property(g => g.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(g => g.CreatedAtUtc);
        });

        // LocalizationSettingsRecord
        modelBuilder.Entity<LocalizationSettingsRecord>(b =>
        {
            b.ToTable("localization_settings_records");
            b.HasKey(l => l.Id);
            b.Property(l => l.Id).HasColumnName("id");
            b.Property(l => l.DefaultLanguage).HasColumnName("default_language").HasMaxLength(100);
            b.Property(l => l.FallbackLanguage).HasColumnName("fallback_language").HasMaxLength(100);
            b.Property(l => l.DateFormat).HasColumnName("date_format").HasMaxLength(50);
            b.Property(l => l.ShortDateFormat).HasColumnName("short_date_format").HasMaxLength(50);
            b.Property(l => l.TimeFormat).HasColumnName("time_format").HasMaxLength(50);
            b.Property(l => l.WeekStartsOn).HasColumnName("week_starts_on").HasMaxLength(50);
            b.Property(l => l.TimeZone).HasColumnName("time_zone").HasMaxLength(150);
            b.Property(l => l.PreviewRegion).HasColumnName("preview_region").HasMaxLength(100);
            b.Property(l => l.CalendarType).HasColumnName("calendar_type").HasMaxLength(100);
            b.Property(l => l.SupportedLanguagesJson).HasColumnName("supported_languages_json");
            b.Property(l => l.CreatedDate).HasColumnName("created_date");
            b.Property(l => l.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(l => l.UpdatedDate).HasColumnName("updated_date");
            b.Property(l => l.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(l => l.CreatedAtUtc);
        });

        // SecuritySettingsRecord
        modelBuilder.Entity<SecuritySettingsRecord>(b =>
        {
            b.ToTable("security_settings_records");
            b.HasKey(s => s.Id);
            b.Property(s => s.Id).HasColumnName("id");
            b.Property(s => s.MinPasswordLength).HasColumnName("min_password_length");
            b.Property(s => s.RequireUppercase).HasColumnName("require_uppercase");
            b.Property(s => s.RequireLowercase).HasColumnName("require_lowercase");
            b.Property(s => s.RequireNumbers).HasColumnName("require_numbers");
            b.Property(s => s.RequireSpecialChars).HasColumnName("require_special_chars");
            b.Property(s => s.PasswordExpiryDays).HasColumnName("password_expiry_days");
            b.Property(s => s.EnableMfaFor).HasColumnName("enable_mfa_for").HasMaxLength(50);
            b.Property(s => s.MfaAuthenticatorApp).HasColumnName("mfa_authenticator_app");
            b.Property(s => s.MfaSmsVerification).HasColumnName("mfa_sms_verification");
            b.Property(s => s.MfaEmailVerification).HasColumnName("mfa_email_verification");
            b.Property(s => s.RememberMfaDays).HasColumnName("remember_mfa_days");
            b.Property(s => s.SessionTimeoutMinutes).HasColumnName("session_timeout_minutes");
            b.Property(s => s.IdleTimeoutMinutes).HasColumnName("idle_timeout_minutes");
            b.Property(s => s.ForceLogoutOnPasswordChange).HasColumnName("force_logout_on_password_change");
            b.Property(s => s.AllowMultipleActiveSessions).HasColumnName("allow_multiple_active_sessions");
            b.Property(s => s.LockoutThreshold).HasColumnName("lockout_threshold");
            b.Property(s => s.LockoutDurationMinutes).HasColumnName("lockout_duration_minutes");
            b.Property(s => s.PreventUserEnumeration).HasColumnName("prevent_user_enumeration");
            b.Property(s => s.RequireEmailVerification).HasColumnName("require_email_verification");
            b.Property(s => s.RestrictLoginToRegisteredDevices).HasColumnName("restrict_login_to_registered_devices");
            b.Property(s => s.AllowPasswordReset).HasColumnName("allow_password_reset");
            b.Property(s => s.RestrictSpecificIps).HasColumnName("restrict_specific_ips");
            b.Property(s => s.AllowedIpsJson).HasColumnName("allowed_ips_json");
            b.Property(s => s.CreatedDate).HasColumnName("created_date");
            b.Property(s => s.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(s => s.UpdatedDate).HasColumnName("updated_date");
            b.Property(s => s.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(s => s.CreatedAtUtc);
        });

        // BackupHistoryRecord
        modelBuilder.Entity<BackupHistoryRecord>(b =>
        {
            b.ToTable("backup_history_records");
            b.HasKey(b_rec => b_rec.Id);
            b.Property(b_rec => b_rec.Id).HasColumnName("id");
            b.Property(b_rec => b_rec.BackupName).HasColumnName("backup_name").HasMaxLength(200);
            b.Property(b_rec => b_rec.Type).HasColumnName("type").HasMaxLength(50);
            b.Property(b_rec => b_rec.Description).HasColumnName("description");
            b.Property(b_rec => b_rec.SizeText).HasColumnName("size_text").HasMaxLength(50);
            b.Property(b_rec => b_rec.CreatedOnText).HasColumnName("created_on_text").HasMaxLength(100);
            b.Property(b_rec => b_rec.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(b_rec => b_rec.CreatedDate).HasColumnName("created_date");
            b.Property(b_rec => b_rec.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(b_rec => b_rec.UpdatedDate).HasColumnName("updated_date");
            b.Property(b_rec => b_rec.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(b_rec => b_rec.CreatedAtUtc);
        });

        // SubscriptionPlanRecord
        modelBuilder.Entity<SubscriptionPlanRecord>(b =>
        {
            b.ToTable("subscription_plan_records");
            b.HasKey(s => s.Id);
            b.Property(s => s.Id).HasColumnName("id");
            b.Property(s => s.CurrentPlanName).HasColumnName("current_plan_name").HasMaxLength(100);
            b.Property(s => s.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(s => s.RenewalDateText).HasColumnName("renewal_date_text").HasMaxLength(50);
            b.Property(s => s.AmountText).HasColumnName("amount_text").HasMaxLength(50);
            b.Property(s => s.PaymentMethod).HasColumnName("payment_method").HasMaxLength(100);
            b.Property(s => s.ResidentsCurrent).HasColumnName("residents_current");
            b.Property(s => s.ResidentsLimit).HasColumnName("residents_limit");
            b.Property(s => s.StaffCurrent).HasColumnName("staff_current");
            b.Property(s => s.StorageCurrentGb).HasColumnName("storage_current_gb").HasMaxLength(20);
            b.Property(s => s.StorageLimitGb).HasColumnName("storage_limit_gb");
            b.Property(s => s.SmsCurrent).HasColumnName("sms_current");
            b.Property(s => s.SmsLimit).HasColumnName("sms_limit");
            b.Property(s => s.ApiCurrent).HasColumnName("api_current");
            b.Property(s => s.ApiLimit).HasColumnName("api_limit");
            b.Property(s => s.CreatedDate).HasColumnName("created_date");
            b.Property(s => s.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(s => s.UpdatedDate).HasColumnName("updated_date");
            b.Property(s => s.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(s => s.CreatedAtUtc);
        });

        // ActivitySummaryLog
        modelBuilder.Entity<ActivitySummaryLog>(b =>
        {
            b.ToTable("activity_summary_logs");
            b.HasKey(a => a.Id);
            b.Property(a => a.Id).HasColumnName("id");
            b.Property(a => a.ActivityType).HasColumnName("activity_type").HasMaxLength(150);
            b.Property(a => a.Details).HasColumnName("details");
            b.Property(a => a.RelatedTo).HasColumnName("related_to").HasMaxLength(150);
            b.Property(a => a.LocationUnit).HasColumnName("location_unit").HasMaxLength(150);
            b.Property(a => a.DateTimeText).HasColumnName("date_time_text").HasMaxLength(100);
            b.Property(a => a.PerformedBy).HasColumnName("performed_by").HasMaxLength(150);
            b.Property(a => a.CreatedDate).HasColumnName("created_date");
            b.Property(a => a.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(a => a.UpdatedDate).HasColumnName("updated_date");
            b.Property(a => a.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(a => a.CreatedAtUtc);
        });

        // ClinicalEncounterRecord
        modelBuilder.Entity<ClinicalEncounterRecord>(b =>
        {
            b.ToTable("clinical_encounter_records");
            b.HasKey(c => c.Id);
            b.Property(c => c.Id).HasColumnName("id");
            b.Property(c => c.DateText).HasColumnName("date_text").HasMaxLength(100);
            b.Property(c => c.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(c => c.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(c => c.EncounterType).HasColumnName("encounter_type").HasMaxLength(100);
            b.Property(c => c.ProviderName).HasColumnName("provider_name").HasMaxLength(150);
            b.Property(c => c.ReasonDiagnosis).HasColumnName("reason_diagnosis");
            b.Property(c => c.CreatedDate).HasColumnName("created_date");
            b.Property(c => c.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(c => c.UpdatedDate).HasColumnName("updated_date");
            b.Property(c => c.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(c => c.CreatedAtUtc);
        });

        // FinancialTransactionRecord
        modelBuilder.Entity<FinancialTransactionRecord>(b =>
        {
            b.ToTable("financial_transaction_records");
            b.HasKey(f => f.Id);
            b.Property(f => f.Id).HasColumnName("id");
            b.Property(f => f.DateText).HasColumnName("date_text").HasMaxLength(100);
            b.Property(f => f.Type).HasColumnName("type").HasMaxLength(100);
            b.Property(f => f.Reference).HasColumnName("reference").HasMaxLength(100);
            b.Property(f => f.CustomerVendor).HasColumnName("customer_vendor").HasMaxLength(200);
            b.Property(f => f.AmountText).HasColumnName("amount_text").HasMaxLength(100);
            b.Property(f => f.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(f => f.CreatedDate).HasColumnName("created_date");
            b.Property(f => f.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(f => f.UpdatedDate).HasColumnName("updated_date");
            b.Property(f => f.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(f => f.CreatedAtUtc);
        });

        // BillingInvoiceRecord
        modelBuilder.Entity<BillingInvoiceRecord>(b =>
        {
            b.ToTable("billing_invoice_records");
            b.HasKey(bi => bi.Id);
            b.Property(bi => bi.Id).HasColumnName("id");
            b.Property(bi => bi.InvoiceNumber).HasColumnName("invoice_number").HasMaxLength(100);
            b.Property(bi => bi.DateText).HasColumnName("date_text").HasMaxLength(50);
            b.Property(bi => bi.AmountText).HasColumnName("amount_text").HasMaxLength(50);
            b.Property(bi => bi.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(bi => bi.CreatedDate).HasColumnName("created_date");
            b.Property(bi => bi.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(bi => bi.UpdatedDate).HasColumnName("updated_date");
            b.Property(bi => bi.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(bi => bi.CreatedAtUtc);
        });

        // CustomReportRecord
        modelBuilder.Entity<CustomReportRecord>(b =>
        {
            b.ToTable("custom_report_records");
            b.HasKey(c => c.Id);
            b.Property(c => c.Id).HasColumnName("id");
            b.Property(c => c.ReportName).HasColumnName("report_name").HasMaxLength(200);
            b.Property(c => c.Description).HasColumnName("description");
            b.Property(c => c.Category).HasColumnName("category").HasMaxLength(100);
            b.Property(c => c.Frequency).HasColumnName("frequency").HasMaxLength(50);
            b.Property(c => c.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(c => c.LastModifiedText).HasColumnName("last_modified_text").HasMaxLength(100);
            b.Property(c => c.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(c => c.CreatedDate).HasColumnName("created_date");
            b.Property(c => c.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Property(c => c.UpdatedDate).HasColumnName("updated_date");
            b.Ignore(c => c.CreatedAtUtc);
        });

        // IntegrationItemRecord
        modelBuilder.Entity<IntegrationItemRecord>(b =>
        {
            b.ToTable("integration_item_records");
            b.HasKey(i => i.Id);
            b.Property(i => i.Id).HasColumnName("id");
            b.Property(i => i.Name).HasColumnName("name").HasMaxLength(200);
            b.Property(i => i.SystemApplication).HasColumnName("system_application").HasMaxLength(150);
            b.Property(i => i.Category).HasColumnName("category").HasMaxLength(100);
            b.Property(i => i.ConnectionType).HasColumnName("connection_type").HasMaxLength(100);
            b.Property(i => i.Description).HasColumnName("description");
            b.Property(i => i.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(i => i.IconLogo).HasColumnName("icon_logo").HasMaxLength(50);
            b.Property(i => i.LastSyncText).HasColumnName("last_sync_text").HasMaxLength(100);
            b.Property(i => i.ConnectedOnText).HasColumnName("connected_on_text").HasMaxLength(100);
            b.Property(i => i.DataSyncRateText).HasColumnName("data_sync_rate_text").HasMaxLength(50);
            b.Property(i => i.DataLastSyncCount).HasColumnName("data_last_sync_count");
            b.Property(i => i.DataLastSyncText).HasColumnName("data_last_sync_text").HasMaxLength(100);
            b.Property(i => i.NextSyncText).HasColumnName("next_sync_text").HasMaxLength(100);
            b.Property(i => i.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(i => i.CreatedDate).HasColumnName("created_date");
            b.Property(i => i.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Property(i => i.UpdatedDate).HasColumnName("updated_date");
            b.Ignore(i => i.CreatedAtUtc);
        });

        // IntegrationActivityLogRecord
        modelBuilder.Entity<IntegrationActivityLogRecord>(b =>
        {
            b.ToTable("integration_activity_log_records");
            b.HasKey(l => l.Id);
            b.Property(l => l.Id).HasColumnName("id");
            b.Property(l => l.DateTimeText).HasColumnName("date_time_text").HasMaxLength(100);
            b.Property(l => l.IntegrationName).HasColumnName("integration_name").HasMaxLength(200);
            b.Property(l => l.Event).HasColumnName("event").HasMaxLength(150);
            b.Property(l => l.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(l => l.Details).HasColumnName("details");
            b.Property(l => l.TriggeredBy).HasColumnName("triggered_by").HasMaxLength(100);
            b.Property(l => l.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(l => l.CreatedDate).HasColumnName("created_date");
            b.Property(l => l.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Property(l => l.UpdatedDate).HasColumnName("updated_date");
            b.Ignore(l => l.CreatedAtUtc);
        });

        // UserAccountItemRecord
        modelBuilder.Entity<UserAccountItemRecord>(b =>
        {
            b.ToTable("user_account_item_records");
            b.HasKey(u => u.Id);
            b.Property(u => u.Id).HasColumnName("id");
            b.Property(u => u.UserName).HasColumnName("user_name").HasMaxLength(150);
            b.Property(u => u.Email).HasColumnName("email").HasMaxLength(150);
            b.Property(u => u.Role).HasColumnName("role").HasMaxLength(100);
            b.Property(u => u.Department).HasColumnName("department").HasMaxLength(100);
            b.Property(u => u.Location).HasColumnName("location").HasMaxLength(150);
            b.Property(u => u.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(u => u.Avatar).HasColumnName("avatar");
            b.Property(u => u.LastSignInText).HasColumnName("last_sign_in_text").HasMaxLength(100);
            b.Property(u => u.CreatedDate).HasColumnName("created_date");
            b.Property(u => u.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(u => u.UpdatedDate).HasColumnName("updated_date");
            b.Property(u => u.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(u => u.CreatedAtUtc);
        });

        // RoleDefinitionItemRecord
        modelBuilder.Entity<RoleDefinitionItemRecord>(b =>
        {
            b.ToTable("role_definition_item_records");
            b.HasKey(r => r.Id);
            b.Property(r => r.Id).HasColumnName("id");
            b.Property(r => r.RoleName).HasColumnName("role_name").HasMaxLength(100);
            b.Property(r => r.Description).HasColumnName("description");
            b.Property(r => r.UsersCount).HasColumnName("users_count");
            b.Property(r => r.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(r => r.CategoryBadge).HasColumnName("category_badge").HasMaxLength(50);
            b.Property(r => r.PermissionsMatrixJson).HasColumnName("permissions_matrix_json");
            b.Property(r => r.CreatedDate).HasColumnName("created_date");
            b.Property(r => r.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(r => r.UpdatedDate).HasColumnName("updated_date");
            b.Property(r => r.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(r => r.CreatedAtUtc);
        });

        // NotificationTemplateItemRecord
        modelBuilder.Entity<NotificationTemplateItemRecord>(b =>
        {
            b.ToTable("notification_template_item_records");
            b.HasKey(n => n.Id);
            b.Property(n => n.Id).HasColumnName("id");
            b.Property(n => n.TemplateName).HasColumnName("template_name").HasMaxLength(150);
            b.Property(n => n.Description).HasColumnName("description");
            b.Property(n => n.Category).HasColumnName("category").HasMaxLength(100);
            b.Property(n => n.Channel).HasColumnName("channel").HasMaxLength(100);
            b.Property(n => n.TriggerEvent).HasColumnName("trigger_event").HasMaxLength(150);
            b.Property(n => n.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(n => n.IsEnabled).HasColumnName("is_enabled");
            b.Property(n => n.CreatedDate).HasColumnName("created_date");
            b.Property(n => n.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(n => n.UpdatedDate).HasColumnName("updated_date");
            b.Property(n => n.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(n => n.CreatedAtUtc);
        });

        // SystemConfigToggleRecord
        modelBuilder.Entity<SystemConfigToggleRecord>(b =>
        {
            b.ToTable("system_config_toggle_records");
            b.HasKey(s => s.Id);
            b.Property(s => s.Id).HasColumnName("id");
            b.Property(s => s.ConfigKey).HasColumnName("config_key").HasMaxLength(100);
            b.Property(s => s.ConfigLabel).HasColumnName("config_label").HasMaxLength(200);
            b.Property(s => s.IsEnabled).HasColumnName("is_enabled");
            b.Property(s => s.CreatedDate).HasColumnName("created_date");
            b.Property(s => s.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(s => s.UpdatedDate).HasColumnName("updated_date");
            b.Property(s => s.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(s => s.CreatedAtUtc);
        });

        // User
        modelBuilder.Entity<User>(b =>
        {
            b.ToTable("users");
            b.HasKey(u => u.Id);
            b.Property(u => u.Id).HasColumnName("id");
            b.Property(u => u.Username).HasColumnName("username").HasMaxLength(100);
            b.Property(u => u.Email).HasColumnName("email").HasMaxLength(150);
            b.Property(u => u.PasswordHash).HasColumnName("password_hash");
            b.Property(u => u.PasswordSalt).HasColumnName("password_salt");
            b.Property(u => u.Role).HasColumnName("role").HasMaxLength(50);
            b.Property(u => u.IsActive).HasColumnName("is_active");
            b.Property(u => u.CreatedDate).HasColumnName("created_date");
            b.Property(u => u.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(u => u.UpdatedDate).HasColumnName("updated_date");
            b.Property(u => u.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(u => u.CreatedAtUtc);
        });

        // AppRole
        modelBuilder.Entity<AppRole>(b =>
        {
            b.ToTable("app_roles");
            b.HasKey(r => r.Id);
            b.Property(r => r.Id).HasColumnName("id");
            b.Property(r => r.RoleName).HasColumnName("role_name").HasMaxLength(50);
            b.Property(r => r.DisplayName).HasColumnName("display_name").HasMaxLength(100);
            b.Property(r => r.Description).HasColumnName("description");
            b.Property(r => r.IsSystemRole).HasColumnName("is_system_role");
            b.Property(r => r.CreatedDate).HasColumnName("created_date");
            b.Property(r => r.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(r => r.UpdatedDate).HasColumnName("updated_date");
            b.Property(r => r.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(r => r.CreatedAtUtc);
        });

        // AppPermission
        modelBuilder.Entity<AppPermission>(b =>
        {
            b.ToTable("app_permissions");
            b.HasKey(p => p.Id);
            b.Property(p => p.Id).HasColumnName("id");
            b.Property(p => p.PermissionKey).HasColumnName("permission_key").HasMaxLength(100);
            b.Property(p => p.Name).HasColumnName("name").HasMaxLength(150);
            b.Property(p => p.Module).HasColumnName("module").HasMaxLength(100);
            b.Property(p => p.Description).HasColumnName("description");
            b.Property(p => p.CreatedDate).HasColumnName("created_date");
            b.Property(p => p.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(p => p.UpdatedDate).HasColumnName("updated_date");
            b.Property(p => p.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(p => p.CreatedAtUtc);
        });

        // RolePermission
        modelBuilder.Entity<RolePermission>(b =>
        {
            b.ToTable("role_permissions");
            b.HasKey(rp => rp.Id);
            b.Property(rp => rp.Id).HasColumnName("id");
            b.Property(rp => rp.RoleId).HasColumnName("role_id");
            b.Property(rp => rp.PermissionId).HasColumnName("permission_id");
            b.Property(rp => rp.CreatedDate).HasColumnName("created_date");
            b.Property(rp => rp.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(rp => rp.UpdatedDate).HasColumnName("updated_date");
            b.Property(rp => rp.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(rp => rp.CreatedAtUtc);
        });

        // MenuItem
        modelBuilder.Entity<MenuItem>(b =>
        {
            b.ToTable("app_menu_items");
            b.HasKey(m => m.Id);
            b.Property(m => m.Id).HasColumnName("id");
            b.Property(m => m.MenuKey).HasColumnName("menu_key").HasMaxLength(100);
            b.Property(m => m.Title).HasColumnName("title").HasMaxLength(150);
            b.Property(m => m.Path).HasColumnName("path").HasMaxLength(200);
            b.Property(m => m.Icon).HasColumnName("icon").HasMaxLength(100);
            b.Property(m => m.SortOrder).HasColumnName("sort_order");
            b.Property(m => m.RequiredPermission).HasColumnName("required_permission").HasMaxLength(100);
            b.Property(m => m.RolesAllowedJson).HasColumnName("roles_allowed_json");
            b.Property(m => m.BadgeType).HasColumnName("badge_type").HasMaxLength(50);
            b.Property(m => m.BadgeValue).HasColumnName("badge_value").HasMaxLength(50);
            b.Property(m => m.CreatedDate).HasColumnName("created_date");
            b.Property(m => m.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(m => m.UpdatedDate).HasColumnName("updated_date");
            b.Property(m => m.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(m => m.CreatedAtUtc);
        });

        // DoctorConsultation
        modelBuilder.Entity<DoctorConsultation>(b =>
        {
            b.ToTable("doctor_consultations");
            b.HasKey(c => c.Id);
            b.Property(c => c.Id).HasColumnName("id");
            b.Property(c => c.DoctorId).HasColumnName("doctor_id");
            b.Property(c => c.DoctorName).HasColumnName("doctor_name").HasMaxLength(150);
            b.Property(c => c.PatientId).HasColumnName("patient_id");
            b.Property(c => c.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(c => c.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(c => c.DateText).HasColumnName("date_text").HasMaxLength(100);
            b.Property(c => c.ConsultationType).HasColumnName("consultation_type").HasMaxLength(100);
            b.Property(c => c.ChiefComplaint).HasColumnName("chief_complaint");
            b.Property(c => c.Diagnosis).HasColumnName("diagnosis");
            b.Property(c => c.ClinicalNotes).HasColumnName("clinical_notes");
            b.Property(c => c.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(c => c.CreatedDate).HasColumnName("created_date");
            b.Property(c => c.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(c => c.UpdatedDate).HasColumnName("updated_date");
            b.Property(c => c.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(c => c.CreatedAtUtc);
        });

        // PatientCarePlanRecord
        modelBuilder.Entity<PatientCarePlanRecord>(b =>
        {
            b.ToTable("patient_care_plan_records");
            b.HasKey(cp => cp.Id);
            b.Property(cp => cp.Id).HasColumnName("id");
            b.Property(cp => cp.PatientId).HasColumnName("patient_id");
            b.Property(cp => cp.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(cp => cp.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(cp => cp.PlanName).HasColumnName("plan_name").HasMaxLength(200);
            b.Property(cp => cp.StartDate).HasColumnName("start_date").HasMaxLength(100);
            b.Property(cp => cp.ReviewDate).HasColumnName("review_date").HasMaxLength(100);
            b.Property(cp => cp.ProgressPercentage).HasColumnName("progress_percentage");
            b.Property(cp => cp.GoalsText).HasColumnName("goals_text");
            b.Property(cp => cp.NotesText).HasColumnName("notes_text");
            b.Property(cp => cp.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(cp => cp.PrescribedBy).HasColumnName("prescribed_by").HasMaxLength(150);
            b.Property(cp => cp.CreatedDate).HasColumnName("created_date");
            b.Property(cp => cp.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(cp => cp.UpdatedDate).HasColumnName("updated_date");
            b.Property(cp => cp.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(cp => cp.CreatedAtUtc);
        });

        // PatientDocumentRecord
        modelBuilder.Entity<PatientDocumentRecord>(b =>
        {
            b.ToTable("patient_document_records");
            b.HasKey(d => d.Id);
            b.Property(d => d.Id).HasColumnName("id");
            b.Property(d => d.PatientId).HasColumnName("patient_id");
            b.Property(d => d.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(d => d.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(d => d.DocumentName).HasColumnName("document_name").HasMaxLength(200);
            b.Property(d => d.DocumentType).HasColumnName("document_type").HasMaxLength(100);
            b.Property(d => d.Category).HasColumnName("category").HasMaxLength(100);
            b.Property(d => d.UploadedDate).HasColumnName("uploaded_date").HasMaxLength(100);
            b.Property(d => d.FileSizeText).HasColumnName("file_size_text").HasMaxLength(50);
            b.Property(d => d.UploadedBy).HasColumnName("uploaded_by").HasMaxLength(150);
            b.Property(d => d.CreatedDate).HasColumnName("created_date");
            b.Property(d => d.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(d => d.UpdatedDate).HasColumnName("updated_date");
            b.Property(d => d.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(d => d.CreatedAtUtc);
        });

        // DoctorAiConversation
        modelBuilder.Entity<DoctorAiConversation>(b =>
        {
            b.ToTable("doctor_ai_conversations");
            b.HasKey(ai => ai.Id);
            b.Property(ai => ai.Id).HasColumnName("id");
            b.Property(ai => ai.DoctorName).HasColumnName("doctor_name").HasMaxLength(150);
            b.Property(ai => ai.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(ai => ai.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(ai => ai.PromptQuery).HasColumnName("prompt_query");
            b.Property(ai => ai.AiResponse).HasColumnName("ai_response");
            b.Property(ai => ai.Category).HasColumnName("category").HasMaxLength(100);
            b.Property(ai => ai.CreatedDate).HasColumnName("created_date");
            b.Property(ai => ai.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(ai => ai.UpdatedDate).HasColumnName("updated_date");
            b.Property(ai => ai.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(ai => ai.CreatedAtUtc);
        });
    }

    public async Task<bool> AcknowledgeAlertAsync(Guid alertId)
    {
        var alert = await Alerts.FindAsync(alertId);
        if (alert == null) return false;

        alert.IsAcknowledged = true;
        alert.Status = "Resolved";
        alert.UpdatedDate = DateTime.UtcNow;
        await SaveChangesAsync();
        return true;
    }
}
