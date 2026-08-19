using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace ConnectedCare.Infrastructure.Persistence;

public static class DatabaseInitializer
{
    public static async Task InitializeDatabaseAsync(IServiceProvider serviceProvider, string connectionString, ILogger logger)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            logger.LogInformation("No database connection string provided. Using In-Memory database.");
            using var memoryScope = serviceProvider.CreateScope();
            var memContext = memoryScope.ServiceProvider.GetRequiredService<ConnectedCareDbContext>();
            memContext.Database.EnsureCreated();
            await DatabaseSeeder.SeedAsync(memContext);
            return;
        }

        try
        {
            // 1. Ensure Target PostgreSQL Database Exists
            await EnsurePostgreSqlDatabaseExistsAsync(connectionString, logger);

            // 2. Initialize Schema, Extensions, and Tables via EF Core Context
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ConnectedCareDbContext>();

            // Enable uuid-ossp extension
            try
            {
                await context.Database.ExecuteSqlRawAsync("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not enable uuid-ossp extension automatically. Continuing.");
            }

            // Ensure EF Core created base schema
            context.Database.EnsureCreated();

            // 3. Run Automated DDL migrations for missing columns/tables
            await RunAutoMigrationsAsync(context, logger);

            // 4. Seed complete initial data
            await DatabaseSeeder.SeedAsync(context);

            logger.LogInformation("Database setup and seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing and seeding the database.");
            throw;
        }
    }

    private static async Task EnsurePostgreSqlDatabaseExistsAsync(string connectionString, ILogger logger)
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        var targetDatabase = string.IsNullOrEmpty(builder.Database) ? "ConnectCare" : builder.Database;

        // Temporarily connect to default 'postgres' database to check/create target database
        builder.Database = "postgres";
        var systemConnString = builder.ConnectionString;

        using var conn = new NpgsqlConnection(systemConnString);
        try
        {
            await conn.OpenAsync();

            using var checkCmd = conn.CreateCommand();
            checkCmd.CommandText = $"SELECT 1 FROM pg_database WHERE datname = '{targetDatabase}';";
            var result = await checkCmd.ExecuteScalarAsync();

            if (result == null || result == DBNull.Value)
            {
                logger.LogInformation("Database '{Database}' does not exist. Creating database automatically...", targetDatabase);
                using var createCmd = conn.CreateCommand();
                createCmd.CommandText = $"CREATE DATABASE \"{targetDatabase}\";";
                await createCmd.ExecuteNonQueryAsync();
                logger.LogInformation("Database '{Database}' created successfully.", targetDatabase);
            }
            else
            {
                logger.LogInformation("Database '{Database}' already exists.", targetDatabase);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to connect to master 'postgres' database. Assuming target database '{Database}' already exists or connection is ready.", targetDatabase);
        }
    }

    private static async Task RunAutoMigrationsAsync(ConnectedCareDbContext context, ILogger logger)
    {
        var sql = @"
            CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";

            -- Table Columns Auto-Migrations
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS gender VARCHAR(30) DEFAULT 'Female';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_type VARCHAR(20) DEFAULT 'O+';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50) DEFAULT 'Married';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS zip_code VARCHAR(30) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'USA';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(150) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_is_primary BOOLEAN DEFAULT TRUE;
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_conditions TEXT DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS allergies TEXT DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_medications TEXT DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS past_medical_history TEXT DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(150) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(100) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_group_number VARCHAR(100) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_valid_until VARCHAR(50) DEFAULT '';
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS additional_notes TEXT DEFAULT '';

            ALTER TABLE patient_document_records ADD COLUMN IF NOT EXISTS file_name VARCHAR(250) DEFAULT '';
            ALTER TABLE patient_document_records ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) DEFAULT '';
            ALTER TABLE patient_document_records ADD COLUMN IF NOT EXISTS content_type VARCHAR(100) DEFAULT 'application/pdf';
            ALTER TABLE patient_document_records ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT DEFAULT 0;

            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS sub_unit VARCHAR(100) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS location VARCHAR(150) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS experience VARCHAR(50) DEFAULT '5 Years';

            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS code VARCHAR(50) DEFAULT '';
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Hospital';
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS facility VARCHAR(150) DEFAULT 'Connected Care Hospital';
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS facility_location VARCHAR(150) DEFAULT 'Chennai, Tamil Nadu';
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS units_count INT DEFAULT 18;
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS beds INT DEFAULT 220;
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Active';

            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS title VARCHAR(250) DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS patient_id_code VARCHAR(50) DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS patient_avatar TEXT DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Patient Safety';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS reported_by VARCHAR(150) DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS reported_by_role VARCHAR(100) DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Open';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS care_unit VARCHAR(100) DEFAULT 'Cardiology Unit';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS age_gender VARCHAR(50) DEFAULT '68 Y • Female';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS blood_group VARCHAR(20) DEFAULT 'A+';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS patient_type VARCHAR(50) DEFAULT 'Inpatient';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS detected_by VARCHAR(100) DEFAULT 'Monitor System';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'Bedside Monitor';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS patient_id_code VARCHAR(50) DEFAULT '';
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS patient_avatar TEXT DEFAULT '';
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(100) DEFAULT 'Documentation';
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_role VARCHAR(100) DEFAULT '';
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_avatar TEXT DEFAULT '';
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT FALSE;
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status_str VARCHAR(50) DEFAULT 'Open';

            ALTER TABLE user_account_item_records ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';
            ALTER TABLE user_account_item_records ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT '';
            ALTER TABLE user_account_item_records ADD COLUMN IF NOT EXISTS location VARCHAR(150) DEFAULT '';

            ALTER TABLE users ADD COLUMN IF NOT EXISTS password_salt TEXT DEFAULT '';

            ALTER TABLE role_definition_item_records ADD COLUMN IF NOT EXISTS category_badge VARCHAR(50) DEFAULT 'Custom Role';
            ALTER TABLE role_definition_item_records ADD COLUMN IF NOT EXISTS permissions_matrix_json TEXT DEFAULT '';

            ALTER TABLE custom_report_records ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';

            ALTER TABLE integration_item_records ADD COLUMN IF NOT EXISTS icon_logo VARCHAR(50) DEFAULT 'zap';
            ALTER TABLE integration_item_records ADD COLUMN IF NOT EXISTS data_last_sync_text VARCHAR(100) DEFAULT '';

            -- Auto-Create Missing Tables
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                username VARCHAR(100) NOT NULL UNIQUE,
                email VARCHAR(150) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'Admin',
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS app_roles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                role_name VARCHAR(50) NOT NULL UNIQUE,
                display_name VARCHAR(100),
                description TEXT,
                is_system_role BOOLEAN DEFAULT TRUE,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS app_permissions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                permission_key VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(150),
                module VARCHAR(100),
                description TEXT,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS role_permissions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                role_id UUID NOT NULL,
                permission_id UUID NOT NULL,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS app_menu_items (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                menu_key VARCHAR(100) NOT NULL UNIQUE,
                title VARCHAR(150) NOT NULL,
                path VARCHAR(200) NOT NULL,
                icon VARCHAR(100) DEFAULT 'LayoutDashboard',
                sort_order INT DEFAULT 0,
                required_permission VARCHAR(100) DEFAULT '',
                roles_allowed_json TEXT DEFAULT '[''Admin'']',
                badge_type VARCHAR(50) DEFAULT '',
                badge_value VARCHAR(50) DEFAULT '',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS doctor_consultations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                doctor_id UUID,
                doctor_name VARCHAR(150) DEFAULT 'Dr. Sarah Wilson',
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                date_text VARCHAR(100),
                consultation_type VARCHAR(100) DEFAULT 'Follow-up',
                chief_complaint TEXT,
                diagnosis TEXT,
                clinical_notes TEXT,
                status VARCHAR(50) DEFAULT 'Completed',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS patient_care_plan_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                plan_name VARCHAR(200),
                start_date VARCHAR(100),
                review_date VARCHAR(100),
                progress_percentage INT DEFAULT 0,
                goals_text TEXT,
                notes_text TEXT,
                status VARCHAR(50) DEFAULT 'Active',
                prescribed_by VARCHAR(150) DEFAULT 'Dr. Sarah Wilson',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS patient_document_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                document_name VARCHAR(200),
                document_type VARCHAR(100) DEFAULT 'Lab Result',
                category VARCHAR(100) DEFAULT 'Clinical',
                uploaded_date VARCHAR(100),
                file_size_text VARCHAR(50) DEFAULT '1.2 MB',
                uploaded_by VARCHAR(150) DEFAULT 'Dr. Sarah Wilson',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS doctor_ai_conversations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                doctor_name VARCHAR(150) DEFAULT 'Dr. Sarah Wilson',
                patient_name VARCHAR(200) DEFAULT 'Robert Johnson',
                patient_id_code VARCHAR(50) DEFAULT 'PT-10001',
                prompt_query TEXT,
                ai_response TEXT,
                category VARCHAR(100) DEFAULT 'SOAP Note',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            CREATE TABLE IF NOT EXISTS custom_report_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                report_name VARCHAR(200),
                description TEXT,
                category VARCHAR(100),
                frequency VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Active',
                last_modified_text VARCHAR(100),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS integration_item_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(200),
                system_application VARCHAR(150),
                category VARCHAR(100),
                connection_type VARCHAR(100),
                description TEXT,
                status VARCHAR(50) DEFAULT 'Active',
                icon_logo VARCHAR(50) DEFAULT 'zap',
                last_sync_text VARCHAR(100),
                connected_on_text VARCHAR(100),
                data_sync_rate_text VARCHAR(50),
                data_last_sync_count INT DEFAULT 0,
                data_last_sync_text VARCHAR(100),
                next_sync_text VARCHAR(100),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS integration_activity_log_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                date_time_text VARCHAR(100),
                integration_name VARCHAR(200),
                event VARCHAR(150),
                status VARCHAR(50),
                details TEXT,
                triggered_by VARCHAR(100),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS activity_summary_logs (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                activity_type VARCHAR(150),
                details TEXT,
                related_to VARCHAR(150),
                location_unit VARCHAR(150),
                date_time_text VARCHAR(100),
                performed_by VARCHAR(150),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS clinical_encounter_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                date_text VARCHAR(100),
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                encounter_type VARCHAR(100),
                provider_name VARCHAR(150),
                reason_diagnosis TEXT,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS financial_transaction_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                date_text VARCHAR(100),
                type VARCHAR(100),
                reference VARCHAR(100),
                customer_vendor VARCHAR(200),
                amount_text VARCHAR(100),
                status VARCHAR(50),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            UPDATE app_menu_items SET path = '/vital-rounds' WHERE menu_key = 'nurse_vitals';
            UPDATE app_menu_items SET path = '/care-plans' WHERE menu_key = 'nurse_care_plans';
            UPDATE app_menu_items SET path = '/consultations' WHERE menu_key = 'nurse_consult';
            UPDATE app_menu_items SET path = '/discharge-checklist' WHERE menu_key = 'nurse_discharge';
            UPDATE app_menu_items SET path = '/alerts' WHERE menu_key = 'nurse_alerts';

            CREATE TABLE IF NOT EXISTS discharge_checklists (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                patient_avatar TEXT,
                age_gender VARCHAR(50),
                blood_group VARCHAR(20),
                room_number VARCHAR(50),
                care_unit VARCHAR(100),
                admit_date_text VARCHAR(100),
                admit_days_text VARCHAR(50),
                checklist_status VARCHAR(50),
                progress_percentage INT DEFAULT 0,
                pending_items_count INT DEFAULT 0,
                total_items_count INT DEFAULT 14,
                completed_items_count INT DEFAULT 0,
                in_progress_items_count INT DEFAULT 0,
                not_started_items_count INT DEFAULT 0,
                expected_discharge_text VARCHAR(100),
                expected_discharge_relative VARCHAR(50),
                attending_doctor_name VARCHAR(200),
                care_team_members_count INT DEFAULT 3,
                notes TEXT,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS consultations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                patient_avatar TEXT,
                room_number VARCHAR(50),
                care_unit VARCHAR(100),
                age_gender VARCHAR(50),
                blood_group VARCHAR(20),
                consultation_type VARCHAR(150),
                consultation_subtitle VARCHAR(150),
                consultation_icon VARCHAR(50),
                physician_id UUID,
                physician_name VARCHAR(200),
                physician_role VARCHAR(100),
                physician_avatar TEXT,
                date_time_text VARCHAR(100),
                location VARCHAR(150),
                reason TEXT,
                status VARCHAR(50),
                follow_up_date_text VARCHAR(100),
                clinical_notes TEXT,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS care_plans (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                patient_avatar TEXT,
                room_number VARCHAR(50),
                care_unit VARCHAR(100),
                age_gender VARCHAR(50),
                blood_group VARCHAR(20),
                attending_doctor_name VARCHAR(200),
                care_team_members_count INT DEFAULT 3,
                length_of_stay_text VARCHAR(50),
                primary_condition VARCHAR(150),
                condition_icon VARCHAR(50),
                plan_title VARCHAR(200),
                goal_count INT DEFAULT 0,
                status VARCHAR(50),
                start_date_text VARCHAR(100),
                review_date_text VARCHAR(100),
                review_due_badge VARCHAR(50),
                assigned_nurse_name VARCHAR(200),
                assigned_nurse_avatar TEXT,
                overall_progress_percentage INT DEFAULT 0,
                completed_tasks_count INT DEFAULT 0,
                in_progress_tasks_count INT DEFAULT 0,
                not_started_tasks_count INT DEFAULT 0,
                overdue_tasks_count INT DEFAULT 0,
                last_updated_text VARCHAR(100),
                notes_json TEXT,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS vital_rounds (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                patient_avatar TEXT,
                age_gender VARCHAR(50),
                blood_group VARCHAR(20),
                room_bed VARCHAR(50),
                care_unit VARCHAR(100),
                patient_type VARCHAR(50),
                attending_doctor_name VARCHAR(200),
                care_team_members_count INT DEFAULT 3,
                length_of_stay_text VARCHAR(50),
                last_round_time_text VARCHAR(50),
                last_round_date_text VARCHAR(50),
                recorded_by_nurse_name VARCHAR(200),
                next_due_time_text VARCHAR(50),
                next_due_relative_text VARCHAR(50),
                status VARCHAR(50),
                blood_pressure VARCHAR(50),
                heart_rate VARCHAR(50),
                temperature VARCHAR(50),
                spo2 VARCHAR(50),
                respiratory_rate VARCHAR(50),
                pain_score VARCHAR(50),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS medication_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                medication_id_code VARCHAR(50),
                name VARCHAR(200),
                form VARCHAR(50),
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                patient_avatar TEXT,
                dosage VARCHAR(100),
                route VARCHAR(50),
                frequency VARCHAR(100),
                next_dose_time VARCHAR(100),
                relative_time_text VARCHAR(100),
                status VARCHAR(50),
                prescribed_by VARCHAR(150),
                prescribed_by_specialty VARCHAR(100),
                batch VARCHAR(100),
                expiry_date_text VARCHAR(100),
                days_left_text VARCHAR(100),
                category VARCHAR(100),
                adherence_percentage VARCHAR(50),
                active_prescriptions INT DEFAULT 156,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                alert_id_code VARCHAR(50),
                title VARCHAR(250),
                description TEXT,
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                patient_avatar TEXT,
                type VARCHAR(50),
                severity VARCHAR(30),
                room_location VARCHAR(150),
                reported_by VARCHAR(150),
                reported_by_role VARCHAR(100),
                trigger_condition VARCHAR(250),
                timestamp_text VARCHAR(50),
                status VARCHAR(50),
                is_acknowledged BOOLEAN DEFAULT FALSE,
                care_unit VARCHAR(100),
                age_gender VARCHAR(50),
                blood_group VARCHAR(20),
                patient_type VARCHAR(50),
                detected_by VARCHAR(100),
                source VARCHAR(100),
                notes TEXT,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            UPDATE app_menu_items SET path = '/shift-handover' WHERE menu_key = 'nurse_handover';
            UPDATE app_menu_items SET path = '/settings-profile' WHERE menu_key = 'nurse_settings';

            CREATE TABLE IF NOT EXISTS shift_handovers (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                handover_id_code VARCHAR(50),
                current_shift VARCHAR(100),
                handover_to_shift VARCHAR(100),
                outgoing_nurse_name VARCHAR(150),
                outgoing_nurse_role VARCHAR(100),
                outgoing_nurse_avatar TEXT,
                incoming_nurse_name VARCHAR(150),
                incoming_nurse_role VARCHAR(100),
                incoming_nurse_avatar TEXT,
                patients_assigned_count INT DEFAULT 24,
                high_priority_patients_count INT DEFAULT 5,
                pending_tasks_count INT DEFAULT 6,
                new_alerts_count INT DEFAULT 4,
                completed_sections_count INT DEFAULT 18,
                total_sections_count INT DEFAULT 24,
                completion_percentage INT DEFAULT 75,
                handover_notes TEXT,
                status VARCHAR(50) DEFAULT 'Draft',
                handover_date_text VARCHAR(50),
                handover_time_text VARCHAR(50),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS shift_handover_patient_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                handover_id UUID,
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                patient_avatar TEXT,
                age_gender VARCHAR(50),
                room_number VARCHAR(50),
                care_unit VARCHAR(100),
                condition_status VARCHAR(100),
                condition_subtitle VARCHAR(150),
                pending_tasks_count INT DEFAULT 2,
                special_instructions TEXT,
                priority VARCHAR(50),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS nurse_profiles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                full_name VARCHAR(150),
                employee_id_code VARCHAR(50),
                email VARCHAR(150),
                phone VARCHAR(50),
                role VARCHAR(100),
                department VARCHAR(100),
                unit_ward VARCHAR(100),
                date_of_joining VARCHAR(50),
                about_me TEXT,
                avatar TEXT,
                default_unit_ward VARCHAR(100),
                default_shift VARCHAR(100),
                theme VARCHAR(50),
                date_format VARCHAR(100),
                time_format VARCHAR(100),
                license_number VARCHAR(100),
                qualification VARCHAR(100),
                experience_text VARCHAR(100),
                specialization VARCHAR(100),
                certifications VARCHAR(200),
                emergency_contact_name VARCHAR(150),
                emergency_contact_phone VARCHAR(50),
                home_address TEXT,
                personal_email VARCHAR(150),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            UPDATE app_menu_items SET path = '/documentations' WHERE menu_key = 'nurse_doc';

            CREATE TABLE IF NOT EXISTS nurse_documentations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                document_code VARCHAR(50),
                document_name VARCHAR(200),
                patient_id UUID,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                patient_avatar TEXT,
                room_location VARCHAR(50),
                care_unit VARCHAR(100),
                age_gender VARCHAR(50),
                blood_group VARCHAR(20),
                patient_type VARCHAR(50),
                document_type VARCHAR(100),
                date_time_text VARCHAR(100),
                created_by_name VARCHAR(150),
                created_by_role VARCHAR(100),
                status VARCHAR(50),
                is_draft BOOLEAN DEFAULT FALSE,
                notes_content TEXT,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            UPDATE app_menu_items SET path = '/messages' WHERE menu_key = 'nurse_messages' OR menu_key = 'doc_messages';

            CREATE TABLE IF NOT EXISTS chat_conversations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                participant_name VARCHAR(150),
                participant_role VARCHAR(100),
                participant_avatar TEXT,
                is_online BOOLEAN DEFAULT TRUE,
                last_message_text TEXT,
                last_message_time_text VARCHAR(50),
                unread_count INT DEFAULT 0,
                is_group BOOLEAN DEFAULT FALSE,
                category VARCHAR(50) DEFAULT 'All',
                shared_patient_name VARCHAR(150),
                shared_patient_id_code VARCHAR(50),
                shared_patient_room VARCHAR(50),
                shared_patient_care_unit VARCHAR(100),
                shared_patient_status VARCHAR(50),
                shared_patient_avatar TEXT,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS chat_messages (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                conversation_id UUID NOT NULL,
                sender_name VARCHAR(150),
                sender_role VARCHAR(100),
                sender_avatar TEXT,
                message_text TEXT,
                time_text VARCHAR(50),
                is_me BOOLEAN DEFAULT FALSE,
                is_unread BOOLEAN DEFAULT FALSE,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            UPDATE app_menu_items SET path = '/reports' WHERE menu_key = 'nurse_reports' OR menu_key = 'doc_reports';
            UPDATE app_menu_items SET path = '/consultations' WHERE menu_key = 'doc_consultations';
            UPDATE app_menu_items SET path = '/care-plans' WHERE menu_key = 'doc_care_plans';
            UPDATE app_menu_items SET path = '/documentations' WHERE menu_key = 'doc_documents';
            UPDATE app_menu_items SET path = '/shift-handover' WHERE menu_key = 'nurse_handover';
            UPDATE app_menu_items SET path = '/settings-profile' WHERE menu_key = 'nurse_settings';

            CREATE TABLE IF NOT EXISTS nurse_reports (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                report_name VARCHAR(200),
                report_type VARCHAR(100),
                description TEXT,
                generated_by_name VARCHAR(150),
                generated_by_role VARCHAR(100),
                generated_on_text VARCHAR(100),
                format VARCHAR(50),
                category_tab VARCHAR(100) DEFAULT 'Overview',
                care_unit VARCHAR(100) DEFAULT 'All Units / Floors',
                patient_name VARCHAR(150) DEFAULT 'All Patients',
                shift VARCHAR(100) DEFAULT 'All Shift',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
        ";

        try
        {
            await context.Database.ExecuteSqlRawAsync(sql);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Notice during auto-migration SQL execution.");
        }
    }
}
