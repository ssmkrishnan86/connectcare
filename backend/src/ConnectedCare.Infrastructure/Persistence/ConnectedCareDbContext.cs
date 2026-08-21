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
    public DbSet<MedicationAdministration> MedicationAdministrations =>
    Set<MedicationAdministration>();
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
    public DbSet<DischargeChecklistRecord> DischargeChecklists => Set<DischargeChecklistRecord>();
    public DbSet<ConsultationRecord> Consultations => Set<ConsultationRecord>();
    public DbSet<CarePlanRecord> CarePlans => Set<CarePlanRecord>();
    public DbSet<VitalRoundRecord> VitalRounds => Set<VitalRoundRecord>();
    public DbSet<ShiftHandoverRecord> ShiftHandovers => Set<ShiftHandoverRecord>();
    public DbSet<ShiftHandoverPatientRecord> ShiftHandoverPatientRecords => Set<ShiftHandoverPatientRecord>();
    public DbSet<NurseProfileRecord> NurseProfiles => Set<NurseProfileRecord>();
    public DbSet<NurseDocumentationRecord> NurseDocumentations => Set<NurseDocumentationRecord>();
    public DbSet<ChatConversationRecord> ChatConversations => Set<ChatConversationRecord>();
    public DbSet<ChatMessageRecord> ChatMessages => Set<ChatMessageRecord>();
    public DbSet<NurseReportRecord> NurseReports => Set<NurseReportRecord>();

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
            b.Property(p => p.FirstName).HasColumnName("first_name").HasMaxLength(100);
            b.Property(p => p.LastName).HasColumnName("last_name").HasMaxLength(100);
            b.Property(p => p.Avatar).HasColumnName("avatar");
            b.Property(p => p.Dob).HasColumnName("dob").HasMaxLength(50);
            b.Property(p => p.Gender).HasColumnName("gender").HasMaxLength(30);
            b.Property(p => p.AgeGender).HasColumnName("age_gender").HasMaxLength(50);
            b.Property(p => p.BloodType).HasColumnName("blood_type").HasMaxLength(20);
            b.Property(p => p.MaritalStatus).HasColumnName("marital_status").HasMaxLength(50);
            b.Property(p => p.Phone).HasColumnName("phone").HasMaxLength(30);
            b.Property(p => p.Email).HasColumnName("email").HasMaxLength(150);
            b.Property(p => p.Address).HasColumnName("address").HasMaxLength(250);
            b.Property(p => p.City).HasColumnName("city").HasMaxLength(100);
            b.Property(p => p.State).HasColumnName("state").HasMaxLength(100);
            b.Property(p => p.ZipCode).HasColumnName("zip_code").HasMaxLength(30);
            b.Property(p => p.Country).HasColumnName("country").HasMaxLength(100);
            b.Property(p => p.CareUnit).HasColumnName("care_unit").HasMaxLength(100).IsRequired();
            b.Property(p => p.FloorRoom).HasColumnName("floor_room").HasMaxLength(100);
            
            b.Property(p => p.EmergencyContactName).HasColumnName("emergency_contact_name").HasMaxLength(150);
            b.Property(p => p.EmergencyContactRelationship).HasColumnName("emergency_contact_relationship").HasMaxLength(100);
            b.Property(p => p.EmergencyContactPhone).HasColumnName("emergency_contact_phone").HasMaxLength(50);
            b.Property(p => p.EmergencyContactIsPrimary).HasColumnName("emergency_contact_is_primary");

            b.Property(p => p.MedicalConditions).HasColumnName("medical_conditions");
            b.Property(p => p.Allergies).HasColumnName("allergies");
            b.Property(p => p.CurrentMedications).HasColumnName("current_medications");
            b.Property(p => p.PastMedicalHistory).HasColumnName("past_medical_history");

            b.Property(p => p.InsuranceProvider).HasColumnName("insurance_provider").HasMaxLength(150);
            b.Property(p => p.InsurancePolicyNumber).HasColumnName("insurance_policy_number").HasMaxLength(100);
            b.Property(p => p.InsuranceGroupNumber).HasColumnName("insurance_group_number").HasMaxLength(100);
            b.Property(p => p.InsuranceValidUntil).HasColumnName("insurance_valid_until").HasMaxLength(50);

            b.Property(p => p.AdditionalNotes).HasColumnName("additional_notes");

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

            b.Property(a => a.RecipientId)
             .HasColumnName("recipient_id");

            b.Property(a => a.RecipientRole)
                .HasColumnName("recipient_role")
                .HasMaxLength(50);

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
            b.Property(a => a.CareUnit).HasColumnName("care_unit").HasMaxLength(100);
            b.Property(a => a.AgeGender).HasColumnName("age_gender").HasMaxLength(50);
            b.Property(a => a.BloodGroup).HasColumnName("blood_group").HasMaxLength(20);
            b.Property(a => a.PatientType).HasColumnName("patient_type").HasMaxLength(50);
            b.Property(a => a.DetectedBy).HasColumnName("detected_by").HasMaxLength(100);
            b.Property(a => a.Source).HasColumnName("source").HasMaxLength(100);
            b.Property(a => a.Notes).HasColumnName("notes");
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

        // MedicationRecord
        modelBuilder.Entity<MedicationRecord>(b =>
        {
            b.ToTable("medication_records");
            b.HasKey(m => m.Id);
            b.Property(m => m.Id).HasColumnName("id");
            b.Property(m => m.MedicationIdCode).HasColumnName("medication_id_code").HasMaxLength(50);
            b.Property(m => m.Name).HasColumnName("name").HasMaxLength(200);
            b.Property(m => m.Form).HasColumnName("form").HasMaxLength(50);
            b.Property(m => m.PatientId).HasColumnName("patient_id");
            b.Property(m => m.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(m => m.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(m => m.PatientAvatar).HasColumnName("patient_avatar");
            b.Property(m => m.Dosage).HasColumnName("dosage").HasMaxLength(100);
            b.Property(m => m.Route).HasColumnName("route").HasMaxLength(50);
            b.Property(m => m.Frequency).HasColumnName("frequency").HasMaxLength(100);
            b.Property(m => m.NextDoseTime).HasColumnName("next_dose_time").HasMaxLength(100);
            b.Property(m => m.RelativeTimeText).HasColumnName("relative_time_text").HasMaxLength(100);
            b.Property(m => m.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(m => m.PrescribedBy).HasColumnName("prescribed_by").HasMaxLength(150);
            b.Property(m => m.PrescribedBySpecialty).HasColumnName("prescribed_by_specialty").HasMaxLength(100);
            b.Property(m => m.Batch).HasColumnName("batch").HasMaxLength(100);
            b.Property(m => m.ExpiryDateText).HasColumnName("expiry_date_text").HasMaxLength(100);
            b.Property(m => m.DaysLeftText).HasColumnName("days_left_text").HasMaxLength(100);
            b.Property(m => m.Category).HasColumnName("category").HasMaxLength(100);
            b.Property(m => m.AdherencePercentage).HasColumnName("adherence_percentage").HasMaxLength(50);
            b.Property(m => m.ActivePrescriptions).HasColumnName("active_prescriptions");
            b.Property(m => m.CreatedDate).HasColumnName("created_date");
            b.Property(m => m.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(m => m.UpdatedDate).HasColumnName("updated_date");
            b.Property(m => m.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(m => m.CreatedAtUtc);
        });

        // MedicationAdministration
        modelBuilder.Entity<MedicationAdministration>(b =>
        {
            b.ToTable("medication_administrations");

            b.HasKey(x => x.Id);

            b.Property(x => x.Id)
                .HasColumnName("id");

            b.Property(x => x.MedicationId)
                .HasColumnName("medication_id")
                .IsRequired();

            b.Property(x => x.PatientId)
                .HasColumnName("patient_id")
                .IsRequired();

            b.Property(x => x.NurseId)
                .HasColumnName("nurse_id")
                .IsRequired();

            b.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired();

            b.Property(x => x.Notes)
                .HasColumnName("notes");

            b.Property(x => x.AdministeredAt)
                .HasColumnName("administered_at");

            b.Property(x => x.CreatedDate)
                .HasColumnName("created_date");

            b.Property(x => x.CreatedBy)
                .HasColumnName("created_by")
                .HasMaxLength(100);

            b.Property(x => x.UpdatedDate)
                .HasColumnName("updated_date");

            b.Property(x => x.UpdatedBy)
                .HasColumnName("updated_by")
                .HasMaxLength(100);

            b.Ignore(x => x.CreatedAtUtc);

            b.HasOne(x => x.Medication)
                .WithMany()
                .HasForeignKey(x => x.MedicationId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.Patient)
                .WithMany()
                .HasForeignKey(x => x.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.Nurse)
                .WithMany()
                .HasForeignKey(x => x.NurseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ShiftHandoverRecord
        modelBuilder.Entity<ShiftHandoverRecord>(b =>
        {
            b.ToTable("shift_handovers");
            b.HasKey(s => s.Id);
            b.Property(s => s.Id).HasColumnName("id");
            b.Property(s => s.HandoverIdCode).HasColumnName("handover_id_code").HasMaxLength(50);
            b.Property(s => s.CurrentShift).HasColumnName("current_shift").HasMaxLength(100);
            b.Property(s => s.HandoverToShift).HasColumnName("handover_to_shift").HasMaxLength(100);
            b.Property(s => s.OutgoingNurseName).HasColumnName("outgoing_nurse_name").HasMaxLength(150);
            b.Property(s => s.OutgoingNurseRole).HasColumnName("outgoing_nurse_role").HasMaxLength(100);
            b.Property(s => s.OutgoingNurseAvatar).HasColumnName("outgoing_nurse_avatar");
            b.Property(s => s.IncomingNurseName).HasColumnName("incoming_nurse_name").HasMaxLength(150);
            b.Property(s => s.IncomingNurseRole).HasColumnName("incoming_nurse_role").HasMaxLength(100);
            b.Property(s => s.IncomingNurseAvatar).HasColumnName("incoming_nurse_avatar");
            b.Property(s => s.PatientsAssignedCount).HasColumnName("patients_assigned_count");
            b.Property(s => s.HighPriorityPatientsCount).HasColumnName("high_priority_patients_count");
            b.Property(s => s.PendingTasksCount).HasColumnName("pending_tasks_count");
            b.Property(s => s.NewAlertsCount).HasColumnName("new_alerts_count");
            b.Property(s => s.CompletedSectionsCount).HasColumnName("completed_sections_count");
            b.Property(s => s.TotalSectionsCount).HasColumnName("total_sections_count");
            b.Property(s => s.CompletionPercentage).HasColumnName("completion_percentage");
            b.Property(s => s.HandoverNotes).HasColumnName("handover_notes");
            b.Property(s => s.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(s => s.HandoverDateText).HasColumnName("handover_date_text").HasMaxLength(50);
            b.Property(s => s.HandoverTimeText).HasColumnName("handover_time_text").HasMaxLength(50);
            b.Property(s => s.CreatedDate).HasColumnName("created_date");
            b.Property(s => s.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(s => s.UpdatedDate).HasColumnName("updated_date");
            b.Property(s => s.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(s => s.CreatedAtUtc);
        });

        // ShiftHandoverPatientRecord
        modelBuilder.Entity<ShiftHandoverPatientRecord>(b =>
        {
            b.ToTable("shift_handover_patient_records");
            b.HasKey(sp => sp.Id);
            b.Property(sp => sp.Id).HasColumnName("id");
            b.Property(sp => sp.HandoverId).HasColumnName("handover_id");
            b.Property(sp => sp.PatientId).HasColumnName("patient_id");
            b.Property(sp => sp.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(sp => sp.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(sp => sp.PatientAvatar).HasColumnName("patient_avatar");
            b.Property(sp => sp.AgeGender).HasColumnName("age_gender").HasMaxLength(50);
            b.Property(sp => sp.RoomNumber).HasColumnName("room_number").HasMaxLength(50);
            b.Property(sp => sp.CareUnit).HasColumnName("care_unit").HasMaxLength(100);
            b.Property(sp => sp.ConditionStatus).HasColumnName("condition_status").HasMaxLength(100);
            b.Property(sp => sp.ConditionSubtitle).HasColumnName("condition_subtitle").HasMaxLength(150);
            b.Property(sp => sp.PendingTasksCount).HasColumnName("pending_tasks_count");
            b.Property(sp => sp.SpecialInstructions).HasColumnName("special_instructions");
            b.Property(sp => sp.Priority).HasColumnName("priority").HasMaxLength(50);
            b.Property(sp => sp.CreatedDate).HasColumnName("created_date");
            b.Property(sp => sp.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(sp => sp.UpdatedDate).HasColumnName("updated_date");
            b.Property(sp => sp.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(sp => sp.CreatedAtUtc);
        });

        // NurseProfileRecord
        modelBuilder.Entity<NurseProfileRecord>(b =>
        {
            b.ToTable("nurse_profiles");
            b.HasKey(np => np.Id);
            b.Property(np => np.Id).HasColumnName("id");
            b.Property(np => np.FullName).HasColumnName("full_name").HasMaxLength(150);
            b.Property(np => np.EmployeeIdCode).HasColumnName("employee_id_code").HasMaxLength(50);
            b.Property(np => np.Email).HasColumnName("email").HasMaxLength(150);
            b.Property(np => np.Phone).HasColumnName("phone").HasMaxLength(50);
            b.Property(np => np.Role).HasColumnName("role").HasMaxLength(100);
            b.Property(np => np.Department).HasColumnName("department").HasMaxLength(100);
            b.Property(np => np.UnitWard).HasColumnName("unit_ward").HasMaxLength(100);
            b.Property(np => np.DateOfJoining).HasColumnName("date_of_joining").HasMaxLength(50);
            b.Property(np => np.AboutMe).HasColumnName("about_me");
            b.Property(np => np.Avatar).HasColumnName("avatar");
            b.Property(np => np.DefaultUnitWard).HasColumnName("default_unit_ward").HasMaxLength(100);
            b.Property(np => np.DefaultShift).HasColumnName("default_shift").HasMaxLength(100);
            b.Property(np => np.Theme).HasColumnName("theme").HasMaxLength(50);
            b.Property(np => np.DateFormat).HasColumnName("date_format").HasMaxLength(100);
            b.Property(np => np.TimeFormat).HasColumnName("time_format").HasMaxLength(100);
            b.Property(np => np.LicenseNumber).HasColumnName("license_number").HasMaxLength(100);
            b.Property(np => np.Qualification).HasColumnName("qualification").HasMaxLength(100);
            b.Property(np => np.ExperienceText).HasColumnName("experience_text").HasMaxLength(100);
            b.Property(np => np.Specialization).HasColumnName("specialization").HasMaxLength(100);
            b.Property(np => np.Certifications).HasColumnName("certifications").HasMaxLength(200);
            b.Property(np => np.EmergencyContactName).HasColumnName("emergency_contact_name").HasMaxLength(150);
            b.Property(np => np.EmergencyContactPhone).HasColumnName("emergency_contact_phone").HasMaxLength(50);
            b.Property(np => np.HomeAddress).HasColumnName("home_address");
            b.Property(np => np.PersonalEmail).HasColumnName("personal_email").HasMaxLength(150);
            b.Property(np => np.CreatedDate).HasColumnName("created_date");
            b.Property(np => np.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(np => np.UpdatedDate).HasColumnName("updated_date");
            b.Property(np => np.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(np => np.CreatedAtUtc);
        });

        // NurseDocumentationRecord
        modelBuilder.Entity<NurseDocumentationRecord>(b =>
        {
            b.ToTable("nurse_documentations");
            b.HasKey(nd => nd.Id);
            b.Property(nd => nd.Id).HasColumnName("id");
            b.Property(nd => nd.DocumentCode).HasColumnName("document_code").HasMaxLength(50);
            b.Property(nd => nd.DocumentName).HasColumnName("document_name").HasMaxLength(200);
            b.Property(nd => nd.PatientId).HasColumnName("patient_id");
            b.Property(nd => nd.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(nd => nd.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(nd => nd.PatientAvatar).HasColumnName("patient_avatar");
            b.Property(nd => nd.RoomLocation).HasColumnName("room_location").HasMaxLength(50);
            b.Property(nd => nd.CareUnit).HasColumnName("care_unit").HasMaxLength(100);
            b.Property(nd => nd.AgeGender).HasColumnName("age_gender").HasMaxLength(50);
            b.Property(nd => nd.BloodGroup).HasColumnName("blood_group").HasMaxLength(20);
            b.Property(nd => nd.PatientType).HasColumnName("patient_type").HasMaxLength(50);
            b.Property(nd => nd.DocumentType).HasColumnName("document_type").HasMaxLength(100);
            b.Property(nd => nd.DateTimeText).HasColumnName("date_time_text").HasMaxLength(100);
            b.Property(nd => nd.CreatedByName).HasColumnName("created_by_name").HasMaxLength(150);
            b.Property(nd => nd.CreatedByRole).HasColumnName("created_by_role").HasMaxLength(100);
            b.Property(nd => nd.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(nd => nd.IsDraft).HasColumnName("is_draft");
            b.Property(nd => nd.NotesContent).HasColumnName("notes_content");
            b.Property(nd => nd.CreatedDate).HasColumnName("created_date");
            b.Property(nd => nd.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(nd => nd.UpdatedDate).HasColumnName("updated_date");
            b.Property(nd => nd.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(nd => nd.CreatedAtUtc);
        });

        // ChatConversationRecord
        modelBuilder.Entity<ChatConversationRecord>(b =>
        {
            b.ToTable("chat_conversations");
            b.HasKey(c => c.Id);
            b.Property(c => c.Id).HasColumnName("id");
            b.Property(c => c.ParticipantName).HasColumnName("participant_name").HasMaxLength(150);
            b.Property(c => c.ParticipantRole).HasColumnName("participant_role").HasMaxLength(100);
            b.Property(c => c.ParticipantAvatar).HasColumnName("participant_avatar");
            b.Property(c => c.IsOnline).HasColumnName("is_online");
            b.Property(c => c.LastMessageText).HasColumnName("last_message_text");
            b.Property(c => c.LastMessageTimeText).HasColumnName("last_message_time_text").HasMaxLength(50);
            b.Property(c => c.UnreadCount).HasColumnName("unread_count");
            b.Property(c => c.IsGroup).HasColumnName("is_group");
            b.Property(c => c.Category).HasColumnName("category").HasMaxLength(50);
            b.Property(c => c.SharedPatientName).HasColumnName("shared_patient_name").HasMaxLength(150);
            b.Property(c => c.SharedPatientIdCode).HasColumnName("shared_patient_id_code").HasMaxLength(50);
            b.Property(c => c.SharedPatientRoom).HasColumnName("shared_patient_room").HasMaxLength(50);
            b.Property(c => c.SharedPatientCareUnit).HasColumnName("shared_patient_care_unit").HasMaxLength(100);
            b.Property(c => c.SharedPatientStatus).HasColumnName("shared_patient_status").HasMaxLength(50);
            b.Property(c => c.SharedPatientAvatar).HasColumnName("shared_patient_avatar");
            b.Property(c => c.CreatedDate).HasColumnName("created_date");
            b.Property(c => c.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(c => c.UpdatedDate).HasColumnName("updated_date");
            b.Property(c => c.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(c => c.CreatedAtUtc);
        });

        // ChatMessageRecord
        modelBuilder.Entity<ChatMessageRecord>(b =>
        {
            b.ToTable("chat_messages");
            b.HasKey(m => m.Id);
            b.Property(m => m.Id).HasColumnName("id");
            b.Property(m => m.ConversationId).HasColumnName("conversation_id");
            b.Property(m => m.SenderName).HasColumnName("sender_name").HasMaxLength(150);
            b.Property(m => m.SenderRole).HasColumnName("sender_role").HasMaxLength(100);
            b.Property(m => m.SenderAvatar).HasColumnName("sender_avatar");
            b.Property(m => m.MessageText).HasColumnName("message_text");
            b.Property(m => m.TimeText).HasColumnName("time_text").HasMaxLength(50);
            b.Property(m => m.IsMe).HasColumnName("is_me");
            b.Property(m => m.IsUnread).HasColumnName("is_unread");
            b.Property(m => m.CreatedDate).HasColumnName("created_date");
            b.Property(m => m.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(m => m.UpdatedDate).HasColumnName("updated_date");
            b.Property(m => m.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(m => m.CreatedAtUtc);
        });

        // NurseReportRecord
        modelBuilder.Entity<NurseReportRecord>(b =>
        {
            b.ToTable("nurse_reports");
            b.HasKey(r => r.Id);
            b.Property(r => r.Id).HasColumnName("id");
            b.Property(r => r.ReportName).HasColumnName("report_name").HasMaxLength(200);
            b.Property(r => r.ReportType).HasColumnName("report_type").HasMaxLength(100);
            b.Property(r => r.Description).HasColumnName("description");
            b.Property(r => r.GeneratedByName).HasColumnName("generated_by_name").HasMaxLength(150);
            b.Property(r => r.GeneratedByRole).HasColumnName("generated_by_role").HasMaxLength(100);
            b.Property(r => r.GeneratedOnText).HasColumnName("generated_on_text").HasMaxLength(100);
            b.Property(r => r.Format).HasColumnName("format").HasMaxLength(50);
            b.Property(r => r.CategoryTab).HasColumnName("category_tab").HasMaxLength(100);
            b.Property(r => r.CareUnit).HasColumnName("care_unit").HasMaxLength(100);
            b.Property(r => r.PatientName).HasColumnName("patient_name").HasMaxLength(150);
            b.Property(r => r.Shift).HasColumnName("shift").HasMaxLength(100);
            b.Property(r => r.CreatedDate).HasColumnName("created_date");
            b.Property(r => r.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(r => r.UpdatedDate).HasColumnName("updated_date");
            b.Property(r => r.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(r => r.CreatedAtUtc);
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
            b.Property(o => o.Latitude).HasColumnName("latitude");
            b.Property(o => o.Longitude).HasColumnName("longitude");
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
            b.Property(i => i.EndpointUrl).HasColumnName("endpoint_url").HasMaxLength(500);
            b.Property(i => i.AuthType).HasColumnName("auth_type").HasMaxLength(100);
            b.Property(i => i.SyncInterval).HasColumnName("sync_interval").HasMaxLength(100);
            b.Property(i => i.Environment).HasColumnName("environment").HasMaxLength(50);
            b.Property(i => i.SettingsJson).HasColumnName("settings_json");
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

        // AuditLogEntryRecord
        modelBuilder.Entity<AuditLogEntryRecord>(b =>
        {
            b.ToTable("audit_log_entry_records");
            b.HasKey(a => a.Id);
            b.Property(a => a.Id).HasColumnName("id");
            b.Property(a => a.DateTimeText).HasColumnName("date_time_text").HasMaxLength(100);
            b.Property(a => a.UserName).HasColumnName("user_name").HasMaxLength(150);
            b.Property(a => a.UserRole).HasColumnName("user_role").HasMaxLength(100);
            b.Property(a => a.Action).HasColumnName("action").HasMaxLength(50);
            b.Property(a => a.Module).HasColumnName("module").HasMaxLength(100);
            b.Property(a => a.RecordDescription).HasColumnName("record_description");
            b.Property(a => a.IpAddress).HasColumnName("ip_address").HasMaxLength(50);
            b.Property(a => a.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(a => a.UserDetailsJson).HasColumnName("user_details_json");
            b.Property(a => a.ActionDetailsJson).HasColumnName("action_details_json");
            b.Property(a => a.TechDetailsJson).HasColumnName("tech_details_json");
            b.Property(a => a.ChangesJson).HasColumnName("changes_json");
            b.Property(a => a.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(a => a.CreatedDate).HasColumnName("created_date");
            b.Property(a => a.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Property(a => a.UpdatedDate).HasColumnName("updated_date");
            b.Ignore(a => a.CreatedAtUtc);
        });

        // AiServiceStatusRecord
        modelBuilder.Entity<AiServiceStatusRecord>(b =>
        {
            b.ToTable("ai_service_status_records");
            b.HasKey(s => s.Id);
            b.Property(s => s.Id).HasColumnName("id");
            b.Property(s => s.ServiceName).HasColumnName("service_name").HasMaxLength(150);
            b.Property(s => s.Status).HasColumnName("status").HasMaxLength(50);
            b.Property(s => s.ModelVersion).HasColumnName("model_version").HasMaxLength(100);
            b.Property(s => s.UptimePercentage).HasColumnName("uptime_percentage").HasMaxLength(50);
            b.Property(s => s.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(s => s.CreatedDate).HasColumnName("created_date");
            b.Property(s => s.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Property(s => s.UpdatedDate).HasColumnName("updated_date");
            b.Ignore(s => s.CreatedAtUtc);
        });

        // AiWorkflowMetricRecord
        modelBuilder.Entity<AiWorkflowMetricRecord>(b =>
        {
            b.ToTable("ai_workflow_metric_records");
            b.HasKey(w => w.Id);
            b.Property(w => w.Id).HasColumnName("id");
            b.Property(w => w.WorkflowName).HasColumnName("workflow_name").HasMaxLength(150);
            b.Property(w => w.RequestsCount).HasColumnName("requests_count");
            b.Property(w => w.SuccessRate).HasColumnName("success_rate").HasMaxLength(50);
            b.Property(w => w.AvgResponseTimeSeconds).HasColumnName("avg_response_time_seconds").HasMaxLength(50);
            b.Property(w => w.TrendDataJson).HasColumnName("trend_data_json");
            b.Property(w => w.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(w => w.CreatedDate).HasColumnName("created_date");
            b.Property(w => w.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Property(w => w.UpdatedDate).HasColumnName("updated_date");
            b.Ignore(w => w.CreatedAtUtc);
        });

        // AiActivityLogRecord
        modelBuilder.Entity<AiActivityLogRecord>(b =>
        {
            b.ToTable("ai_activity_log_records");
            b.HasKey(a => a.Id);
            b.Property(a => a.Id).HasColumnName("id");
            b.Property(a => a.TimeText).HasColumnName("time_text").HasMaxLength(100);
            b.Property(a => a.Title).HasColumnName("title").HasMaxLength(200);
            b.Property(a => a.ResidentInfo).HasColumnName("resident_info").HasMaxLength(200);
            b.Property(a => a.Type).HasColumnName("type").HasMaxLength(50);
            b.Property(a => a.Service).HasColumnName("service").HasMaxLength(150);
            b.Property(a => a.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(a => a.CreatedDate).HasColumnName("created_date");
            b.Property(a => a.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Property(a => a.UpdatedDate).HasColumnName("updated_date");
            b.Ignore(a => a.CreatedAtUtc);
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
            b.Property(d => d.FileName).HasColumnName("file_name").HasMaxLength(250);
            b.Property(d => d.DocumentType).HasColumnName("document_type").HasMaxLength(100);
            b.Property(d => d.Category).HasColumnName("category").HasMaxLength(100);
            b.Property(d => d.FilePath).HasColumnName("file_path").HasMaxLength(500);
            b.Property(d => d.ContentType).HasColumnName("content_type").HasMaxLength(100);
            b.Property(d => d.FileSizeBytes).HasColumnName("file_size_bytes");
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

        // DischargeChecklistRecord
        modelBuilder.Entity<DischargeChecklistRecord>(b =>
        {
            b.ToTable("discharge_checklists");
            b.HasKey(c => c.Id);
            b.Property(c => c.Id).HasColumnName("id");
            b.Property(c => c.PatientId).HasColumnName("patient_id");
            b.Property(c => c.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(c => c.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(c => c.PatientAvatar).HasColumnName("patient_avatar");
            b.Property(c => c.AgeGender).HasColumnName("age_gender").HasMaxLength(50);
            b.Property(c => c.BloodGroup).HasColumnName("blood_group").HasMaxLength(20);
            b.Property(c => c.RoomNumber).HasColumnName("room_number").HasMaxLength(50);
            b.Property(c => c.CareUnit).HasColumnName("care_unit").HasMaxLength(100);
            b.Property(c => c.AdmitDateText).HasColumnName("admit_date_text").HasMaxLength(100);
            b.Property(c => c.AdmitDaysText).HasColumnName("admit_days_text").HasMaxLength(50);
            b.Property(c => c.ChecklistStatus).HasColumnName("checklist_status").HasConversion<string>().HasMaxLength(50);
            b.Property(c => c.ProgressPercentage).HasColumnName("progress_percentage");
            b.Property(c => c.PendingItemsCount).HasColumnName("pending_items_count");
            b.Property(c => c.TotalItemsCount).HasColumnName("total_items_count");
            b.Property(c => c.CompletedItemsCount).HasColumnName("completed_items_count");
            b.Property(c => c.InProgressItemsCount).HasColumnName("in_progress_items_count");
            b.Property(c => c.NotStartedItemsCount).HasColumnName("not_started_items_count");
            b.Property(c => c.ExpectedDischargeText).HasColumnName("expected_discharge_text").HasMaxLength(100);
            b.Property(c => c.ExpectedDischargeRelative).HasColumnName("expected_discharge_relative").HasMaxLength(50);
            b.Property(c => c.AttendingDoctorName).HasColumnName("attending_doctor_name").HasMaxLength(200);
            b.Property(c => c.CareTeamMembersCount).HasColumnName("care_team_members_count");
            b.Property(c => c.Notes).HasColumnName("notes");
            b.Property(c => c.CreatedDate).HasColumnName("created_date");
            b.Property(c => c.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(c => c.UpdatedDate).HasColumnName("updated_date");
            b.Property(c => c.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(c => c.CreatedAtUtc);
        });

        // ConsultationRecord
        modelBuilder.Entity<ConsultationRecord>(b =>
        {
            b.ToTable("consultations");
            b.HasKey(c => c.Id);
            b.Property(c => c.Id).HasColumnName("id");
            b.Property(c => c.PatientId).HasColumnName("patient_id");
            b.Property(c => c.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(c => c.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(c => c.PatientAvatar).HasColumnName("patient_avatar");
            b.Property(c => c.RoomNumber).HasColumnName("room_number").HasMaxLength(50);
            b.Property(c => c.CareUnit).HasColumnName("care_unit").HasMaxLength(100);
            b.Property(c => c.AgeGender).HasColumnName("age_gender").HasMaxLength(50);
            b.Property(c => c.BloodGroup).HasColumnName("blood_group").HasMaxLength(20);
            b.Property(c => c.ConsultationType).HasColumnName("consultation_type").HasMaxLength(150);
            b.Property(c => c.ConsultationSubtitle).HasColumnName("consultation_subtitle").HasMaxLength(150);
            b.Property(c => c.ConsultationIcon).HasColumnName("consultation_icon").HasMaxLength(50);
            b.Property(c => c.PhysicianId).HasColumnName("physician_id");
            b.Property(c => c.PhysicianName).HasColumnName("physician_name").HasMaxLength(200);
            b.Property(c => c.PhysicianRole).HasColumnName("physician_role").HasMaxLength(100);
            b.Property(c => c.PhysicianAvatar).HasColumnName("physician_avatar");
            b.Property(c => c.DateTimeText).HasColumnName("date_time_text").HasMaxLength(100);
            b.Property(c => c.Location).HasColumnName("location").HasMaxLength(150);
            b.Property(c => c.Reason).HasColumnName("reason");
            b.Property(c => c.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(50);
            b.Property(c => c.FollowUpDateText).HasColumnName("follow_up_date_text").HasMaxLength(100);
            b.Property(c => c.ClinicalNotes).HasColumnName("clinical_notes");
            b.Property(c => c.CreatedDate).HasColumnName("created_date");
            b.Property(c => c.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(c => c.UpdatedDate).HasColumnName("updated_date");
            b.Property(c => c.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(c => c.CreatedAtUtc);
        });

        // CarePlanRecord
        modelBuilder.Entity<CarePlanRecord>(b =>
        {
            b.ToTable("care_plans");
            b.HasKey(c => c.Id);
            b.Property(c => c.Id).HasColumnName("id");
            b.Property(c => c.PatientId).HasColumnName("patient_id");
            b.Property(c => c.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(c => c.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(c => c.PatientAvatar).HasColumnName("patient_avatar");
            b.Property(c => c.RoomNumber).HasColumnName("room_number").HasMaxLength(50);
            b.Property(c => c.CareUnit).HasColumnName("care_unit").HasMaxLength(100);
            b.Property(c => c.AgeGender).HasColumnName("age_gender").HasMaxLength(50);
            b.Property(c => c.BloodGroup).HasColumnName("blood_group").HasMaxLength(20);
            b.Property(c => c.AttendingDoctorName).HasColumnName("attending_doctor_name").HasMaxLength(200);
            b.Property(c => c.CareTeamMembersCount).HasColumnName("care_team_members_count");
            b.Property(c => c.LengthOfStayText).HasColumnName("length_of_stay_text").HasMaxLength(50);
            b.Property(c => c.PrimaryCondition).HasColumnName("primary_condition").HasMaxLength(150);
            b.Property(c => c.ConditionIcon).HasColumnName("condition_icon").HasMaxLength(50);
            b.Property(c => c.PlanTitle).HasColumnName("plan_title").HasMaxLength(200);
            b.Property(c => c.GoalCount).HasColumnName("goal_count");
            b.Property(c => c.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(50);
            b.Property(c => c.StartDateText).HasColumnName("start_date_text").HasMaxLength(100);
            b.Property(c => c.ReviewDateText).HasColumnName("review_date_text").HasMaxLength(100);
            b.Property(c => c.ReviewDueBadge).HasColumnName("review_due_badge").HasMaxLength(50);
            b.Property(c => c.AssignedNurseName).HasColumnName("assigned_nurse_name").HasMaxLength(200);
            b.Property(c => c.AssignedNurseAvatar).HasColumnName("assigned_nurse_avatar");
            b.Property(c => c.OverallProgressPercentage).HasColumnName("overall_progress_percentage");
            b.Property(c => c.CompletedTasksCount).HasColumnName("completed_tasks_count");
            b.Property(c => c.InProgressTasksCount).HasColumnName("in_progress_tasks_count");
            b.Property(c => c.NotStartedTasksCount).HasColumnName("not_started_tasks_count");
            b.Property(c => c.OverdueTasksCount).HasColumnName("overdue_tasks_count");
            b.Property(c => c.LastUpdatedText).HasColumnName("last_updated_text").HasMaxLength(100);
            b.Property(c => c.NotesJson).HasColumnName("notes_json");
            b.Property(c => c.CreatedDate).HasColumnName("created_date");
            b.Property(c => c.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(c => c.UpdatedDate).HasColumnName("updated_date");
            b.Property(c => c.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(c => c.CreatedAtUtc);
        });

        // VitalRoundRecord
        modelBuilder.Entity<VitalRoundRecord>(b =>
        {
            b.ToTable("vital_rounds");
            b.HasKey(v => v.Id);
            b.Property(v => v.Id).HasColumnName("id");
            b.Property(v => v.PatientId).HasColumnName("patient_id");
            b.Property(v => v.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            b.Property(v => v.PatientIdCode).HasColumnName("patient_id_code").HasMaxLength(50);
            b.Property(v => v.PatientAvatar).HasColumnName("patient_avatar");
            b.Property(v => v.AgeGender).HasColumnName("age_gender").HasMaxLength(50);
            b.Property(v => v.BloodGroup).HasColumnName("blood_group").HasMaxLength(20);
            b.Property(v => v.RoomBed).HasColumnName("room_bed").HasMaxLength(50);
            b.Property(v => v.CareUnit).HasColumnName("care_unit").HasMaxLength(100);
            b.Property(v => v.PatientType).HasColumnName("patient_type").HasConversion<string>().HasMaxLength(50);
            b.Property(v => v.AttendingDoctorName).HasColumnName("attending_doctor_name").HasMaxLength(200);
            b.Property(v => v.CareTeamMembersCount).HasColumnName("care_team_members_count");
            b.Property(v => v.LengthOfStayText).HasColumnName("length_of_stay_text").HasMaxLength(50);
            b.Property(v => v.LastRoundTimeText).HasColumnName("last_round_time_text").HasMaxLength(50);
            b.Property(v => v.LastRoundDateText).HasColumnName("last_round_date_text").HasMaxLength(50);
            b.Property(v => v.RecordedByNurseName).HasColumnName("recorded_by_nurse_name").HasMaxLength(200);
            b.Property(v => v.NextDueTimeText).HasColumnName("next_due_time_text").HasMaxLength(50);
            b.Property(v => v.NextDueRelativeText).HasColumnName("next_due_relative_text").HasMaxLength(50);
            b.Property(v => v.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(50);
            b.Property(v => v.BloodPressure).HasColumnName("blood_pressure").HasMaxLength(50);
            b.Property(v => v.HeartRate).HasColumnName("heart_rate").HasMaxLength(50);
            b.Property(v => v.Temperature).HasColumnName("temperature").HasMaxLength(50);
            b.Property(v => v.SpO2).HasColumnName("spo2").HasMaxLength(50);
            b.Property(v => v.RespiratoryRate).HasColumnName("respiratory_rate").HasMaxLength(50);
            b.Property(v => v.PainScore).HasColumnName("pain_score").HasMaxLength(50);
            b.Property(v => v.CreatedDate).HasColumnName("created_date");
            b.Property(v => v.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            b.Property(v => v.UpdatedDate).HasColumnName("updated_date");
            b.Property(v => v.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
            b.Ignore(v => v.CreatedAtUtc);
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
