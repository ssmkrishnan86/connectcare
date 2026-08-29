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
        var targetDatabase = string.IsNullOrEmpty(builder.Database) ? "connect_care" : builder.Database;

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
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS assigned_nurse_id UUID;
            ALTER TABLE patients ADD COLUMN IF NOT EXISTS assigned_nurse_name VARCHAR(150) DEFAULT '';

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
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS facility_location VARCHAR(150) DEFAULT 'Austin, TX';
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS units_count INT DEFAULT 18;
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS beds INT DEFAULT 220;
            ALTER TABLE location_units ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Active';

            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS title VARCHAR(250) DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS recipient_id UUID;
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS recipient_role VARCHAR(100) DEFAULT '';
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
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS resolution_notes TEXT DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS resolved_by VARCHAR(150) DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS resolved_date TIMESTAMP WITH TIME ZONE;
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS acknowledged_by VARCHAR(150) DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITH TIME ZONE;

            ALTER TABLE care_team_members ADD COLUMN IF NOT EXISTS team_name VARCHAR(150) DEFAULT 'General Care Team';
            ALTER TABLE care_team_members ADD COLUMN IF NOT EXISTS specialty VARCHAR(100) DEFAULT '';

            ALTER TABLE consultations ADD COLUMN IF NOT EXISTS is_liked BOOLEAN DEFAULT FALSE;

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
            ALTER TABLE integration_item_records ADD COLUMN IF NOT EXISTS endpoint_url VARCHAR(500) DEFAULT '';
            ALTER TABLE integration_item_records ADD COLUMN IF NOT EXISTS auth_type VARCHAR(100) DEFAULT 'OAuth 2.0';
            ALTER TABLE integration_item_records ADD COLUMN IF NOT EXISTS sync_interval VARCHAR(100) DEFAULT 'Real-Time';
            ALTER TABLE integration_item_records ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'Production';
            ALTER TABLE integration_item_records ADD COLUMN IF NOT EXISTS settings_json TEXT DEFAULT '';

            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS user_id UUID;
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Physician';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS employment_type VARCHAR(100) DEFAULT 'Full-Time Staff';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS reporting_to VARCHAR(150) DEFAULT 'Medical Director';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS date_of_joining VARCHAR(50) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS gender VARCHAR(30) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS dob VARCHAR(50) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS blood_group VARCHAR(20) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS languages VARCHAR(250) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS street_address VARCHAR(250) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS zip_code VARCHAR(30) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(150) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(100) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS license_number VARCHAR(100) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS license_state VARCHAR(100) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS license_expiry VARCHAR(50) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS npi_number VARCHAR(100) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS medical_degree VARCHAR(200) DEFAULT '';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS access_level VARCHAR(100) DEFAULT 'Full Clinical Access';
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS patient_records_access BOOLEAN DEFAULT TRUE;
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS prescription_rights BOOLEAN DEFAULT TRUE;
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS care_plan_management BOOLEAN DEFAULT TRUE;
            ALTER TABLE doctors ADD COLUMN IF NOT EXISTS ai_operations BOOLEAN DEFAULT TRUE;

            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS user_id UUID;
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS gender VARCHAR(30) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS dob VARCHAR(50) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS blood_group VARCHAR(20) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS languages VARCHAR(250) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Nurse';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS employment_type VARCHAR(100) DEFAULT 'Full-Time Staff';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS reporting_to VARCHAR(150) DEFAULT 'Head Nurse';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS date_of_joining VARCHAR(50) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS street_address VARCHAR(250) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS zip_code VARCHAR(30) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS license_number VARCHAR(100) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS license_state VARCHAR(100) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS license_expiry VARCHAR(50) DEFAULT '';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS certifications VARCHAR(250) DEFAULT 'BLS, ACLS';
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS care_plan_updates BOOLEAN DEFAULT TRUE;
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS vital_monitoring BOOLEAN DEFAULT TRUE;
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS medication_administration BOOLEAN DEFAULT TRUE;
            ALTER TABLE nurses ADD COLUMN IF NOT EXISTS shift_handover BOOLEAN DEFAULT TRUE;

            ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(200) DEFAULT '';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';

            -- Auto-Create Missing Core Tables
            CREATE TABLE IF NOT EXISTS care_units (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                code VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(150) NOT NULL,
                department VARCHAR(150),
                type VARCHAR(50) DEFAULT 'Inpatient',
                floor VARCHAR(100),
                location_unit_id UUID,
                is_active BOOLEAN DEFAULT TRUE,
                display_order INT DEFAULT 0,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS location_units (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                code VARCHAR(50) DEFAULT '',
                name VARCHAR(150) NOT NULL UNIQUE,
                avatar TEXT DEFAULT '',
                type VARCHAR(50) DEFAULT 'Hospital',
                facility VARCHAR(150) DEFAULT 'Connected Care Hospital',
                facility_location VARCHAR(150) DEFAULT 'Austin, TX',
                units_count INT DEFAULT 18,
                beds INT DEFAULT 220,
                status VARCHAR(30) DEFAULT 'Active',
                floor VARCHAR(50) DEFAULT 'Ground Floor',
                capacity VARCHAR(50) DEFAULT '220 Beds',
                occupied VARCHAR(50) DEFAULT '180 Beds',
                occupancy_rate VARCHAR(50) DEFAULT '81.8%',
                attention_priority VARCHAR(30) DEFAULT 'Low',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS care_team_members (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                member_id_code VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(200) NOT NULL,
                avatar TEXT DEFAULT '',
                role VARCHAR(50) NOT NULL DEFAULT 'Doctor',
                department VARCHAR(100) DEFAULT '',
                location VARCHAR(150) DEFAULT '',
                phone VARCHAR(30) DEFAULT '',
                email VARCHAR(150) DEFAULT '',
                status VARCHAR(30) DEFAULT 'Active',
                shift VARCHAR(100) DEFAULT '',
                doctor_id UUID,
                nurse_id UUID,
                patient_id UUID,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS patients (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id_code VARCHAR(50) NOT NULL UNIQUE,
                mrn VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(200) NOT NULL,
                first_name VARCHAR(100) DEFAULT '',
                last_name VARCHAR(100) DEFAULT '',
                avatar TEXT DEFAULT '',
                dob VARCHAR(50) DEFAULT '',
                gender VARCHAR(30) DEFAULT 'Female',
                age_gender VARCHAR(50) DEFAULT '',
                blood_type VARCHAR(20) DEFAULT 'O+',
                marital_status VARCHAR(50) DEFAULT 'Married',
                phone VARCHAR(30) DEFAULT '',
                email VARCHAR(150) DEFAULT '',
                address VARCHAR(250) DEFAULT '',
                city VARCHAR(100) DEFAULT '',
                state VARCHAR(100) DEFAULT '',
                zip_code VARCHAR(30) DEFAULT '',
                country VARCHAR(100) DEFAULT 'USA',
                care_unit VARCHAR(100) NOT NULL DEFAULT 'General Ward',
                floor_room VARCHAR(100) DEFAULT '',
                emergency_contact_name VARCHAR(150) DEFAULT '',
                emergency_contact_relationship VARCHAR(100) DEFAULT '',
                emergency_contact_phone VARCHAR(50) DEFAULT '',
                emergency_contact_is_primary BOOLEAN DEFAULT TRUE,
                medical_conditions TEXT DEFAULT '',
                allergies TEXT DEFAULT '',
                current_medications TEXT DEFAULT '',
                past_medical_history TEXT DEFAULT '',
                insurance_provider VARCHAR(150) DEFAULT '',
                insurance_policy_number VARCHAR(100) DEFAULT '',
                insurance_group_number VARCHAR(100) DEFAULT '',
                insurance_valid_until VARCHAR(50) DEFAULT '',
                additional_notes TEXT DEFAULT '',
                primary_doctor_id UUID,
                primary_doctor_name VARCHAR(200) DEFAULT '',
                primary_doctor_specialty VARCHAR(100) DEFAULT '',
                primary_doctor_avatar TEXT DEFAULT '',
                assigned_nurse_id UUID,
                assigned_nurse_name VARCHAR(150) DEFAULT '',
                status VARCHAR(30) NOT NULL DEFAULT 'InCare',
                risk_level VARCHAR(30) NOT NULL DEFAULT 'Low',
                last_visit VARCHAR(100) DEFAULT '',
                admission_date VARCHAR(50) DEFAULT '',
                care_days INT DEFAULT 1,
                discharge_plan VARCHAR(150) DEFAULT '',
                blood_pressure VARCHAR(30) DEFAULT '120/80',
                heart_rate VARCHAR(30) DEFAULT '72',
                blood_sugar VARCHAR(30) DEFAULT '95',
                temperature VARCHAR(30) DEFAULT '98.6',
                spo2 VARCHAR(30) DEFAULT '98',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS doctors (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID,
                doctor_id_code VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(200) NOT NULL,
                avatar TEXT DEFAULT '',
                specialty VARCHAR(100) NOT NULL DEFAULT 'General Medicine',
                specialty_icon VARCHAR(20) DEFAULT 'Stethoscope',
                department VARCHAR(100) NOT NULL DEFAULT 'General Medicine',
                location VARCHAR(150) DEFAULT '',
                phone VARCHAR(30) DEFAULT '',
                email VARCHAR(150) NOT NULL UNIQUE,
                status VARCHAR(30) NOT NULL DEFAULT 'Active',
                experience VARCHAR(50) DEFAULT '5 Years',
                teleconsultation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                first_name VARCHAR(100) DEFAULT '',
                middle_name VARCHAR(100) DEFAULT '',
                last_name VARCHAR(100) DEFAULT '',
                role VARCHAR(100) DEFAULT 'Physician',
                employment_type VARCHAR(100) DEFAULT 'Full-Time Staff',
                reporting_to VARCHAR(150) DEFAULT 'Medical Director',
                date_of_joining VARCHAR(50) DEFAULT '',
                gender VARCHAR(30) DEFAULT '',
                dob VARCHAR(50) DEFAULT '',
                marital_status VARCHAR(50) DEFAULT '',
                blood_group VARCHAR(20) DEFAULT '',
                languages VARCHAR(250) DEFAULT '',
                street_address VARCHAR(250) DEFAULT '',
                city VARCHAR(100) DEFAULT '',
                state VARCHAR(100) DEFAULT '',
                zip_code VARCHAR(30) DEFAULT '',
                emergency_contact_name VARCHAR(150) DEFAULT '',
                emergency_contact_phone VARCHAR(50) DEFAULT '',
                emergency_contact_relation VARCHAR(100) DEFAULT '',
                license_number VARCHAR(100) DEFAULT '',
                license_state VARCHAR(100) DEFAULT '',
                license_expiry VARCHAR(50) DEFAULT '',
                npi_number VARCHAR(100) DEFAULT '',
                medical_degree VARCHAR(200) DEFAULT '',
                access_level VARCHAR(100) DEFAULT 'Full Clinical Access',
                patient_records_access BOOLEAN DEFAULT TRUE,
                prescription_rights BOOLEAN DEFAULT TRUE,
                care_plan_management BOOLEAN DEFAULT TRUE,
                ai_operations BOOLEAN DEFAULT TRUE,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS nurses (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID,
                nurse_id_code VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(200) NOT NULL,
                avatar TEXT DEFAULT '',
                department VARCHAR(100) DEFAULT '',
                sub_unit VARCHAR(100) DEFAULT '',
                location VARCHAR(150) DEFAULT '',
                shift VARCHAR(100) NOT NULL DEFAULT 'Day Shift',
                assigned_unit VARCHAR(100) DEFAULT '',
                status VARCHAR(30) NOT NULL DEFAULT 'Active',
                phone VARCHAR(30) DEFAULT '',
                email VARCHAR(150) NOT NULL UNIQUE,
                experience VARCHAR(50) DEFAULT '5 Years',
                first_name VARCHAR(100) DEFAULT '',
                middle_name VARCHAR(100) DEFAULT '',
                last_name VARCHAR(100) DEFAULT '',
                gender VARCHAR(30) DEFAULT '',
                dob VARCHAR(50) DEFAULT '',
                marital_status VARCHAR(50) DEFAULT '',
                blood_group VARCHAR(20) DEFAULT '',
                languages VARCHAR(250) DEFAULT '',
                role VARCHAR(100) DEFAULT 'Staff Nurse',
                employment_type VARCHAR(100) DEFAULT 'Full-Time Staff',
                reporting_to VARCHAR(150) DEFAULT 'Head Nurse',
                date_of_joining VARCHAR(50) DEFAULT '',
                street_address VARCHAR(250) DEFAULT '',
                city VARCHAR(100) DEFAULT '',
                state VARCHAR(100) DEFAULT '',
                zip_code VARCHAR(30) DEFAULT '',
                license_number VARCHAR(100) DEFAULT '',
                license_state VARCHAR(100) DEFAULT '',
                license_expiry VARCHAR(50) DEFAULT '',
                certifications VARCHAR(250) DEFAULT 'BLS, ACLS',
                care_plan_updates BOOLEAN DEFAULT TRUE,
                vital_monitoring BOOLEAN DEFAULT TRUE,
                medication_administration BOOLEAN DEFAULT TRUE,
                shift_handover BOOLEAN DEFAULT TRUE,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                task_id_code VARCHAR(50) NOT NULL UNIQUE,
                patient_id UUID,
                title VARCHAR(250) NOT NULL,
                description TEXT DEFAULT '',
                patient_name VARCHAR(200) DEFAULT '',
                patient_id_code VARCHAR(50) DEFAULT '',
                patient_avatar TEXT DEFAULT '',
                task_type VARCHAR(100) DEFAULT 'Documentation',
                assigned_caregiver VARCHAR(200) DEFAULT '',
                assignee_role VARCHAR(100) DEFAULT '',
                assignee_avatar TEXT DEFAULT '',
                priority VARCHAR(30) NOT NULL DEFAULT 'Medium',
                due_time VARCHAR(50) DEFAULT '',
                is_overdue BOOLEAN DEFAULT FALSE,
                status VARCHAR(30) NOT NULL DEFAULT 'Pending',
                status_str VARCHAR(50) DEFAULT 'Open',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS user_settings_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                organization_name VARCHAR(200) DEFAULT 'Connected Care Senior Living',
                time_zone VARCHAR(150) DEFAULT '(UTC-06:00) Central Time (US & Canada)',
                date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
                time_format VARCHAR(50) DEFAULT '12 Hour (AM/PM)',
                language VARCHAR(50) DEFAULT 'English (US)',
                items_per_page INT DEFAULT 10,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS organization_settings_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                organization_name VARCHAR(200) DEFAULT 'Connected Care Senior Living',
                logo_url TEXT DEFAULT '',
                tagline TEXT DEFAULT '',
                primary_color VARCHAR(50) DEFAULT '#6B46C1',
                phone VARCHAR(50) DEFAULT '+1 (512) 555-0100',
                address TEXT DEFAULT '',
                email VARCHAR(150) DEFAULT 'info@connectedcare.com',
                organization_type VARCHAR(100) DEFAULT 'Senior Living / Assisted Living',
                registration_number VARCHAR(100) DEFAULT '',
                established_year VARCHAR(50) DEFAULT '2018',
                website VARCHAR(200) DEFAULT '',
                primary_contact_person VARCHAR(150) DEFAULT 'John Admin',
                primary_contact_designation VARCHAR(100) DEFAULT 'Administrator',
                primary_contact_email VARCHAR(150) DEFAULT 'admin@connectedcare.com',
                primary_contact_phone VARCHAR(50) DEFAULT '(512) 555-0100',
                primary_contact_alternate_phone VARCHAR(50) DEFAULT '',
                address_line_1 TEXT DEFAULT '',
                address_line_2 TEXT DEFAULT '',
                city VARCHAR(100) DEFAULT 'Austin',
                state VARCHAR(100) DEFAULT 'Texas',
                pin_code VARCHAR(50) DEFAULT '78705',
                country VARCHAR(100) DEFAULT 'United States',
                default_time_zone VARCHAR(150) DEFAULT '(UTC-06:00) Central Time (US & Canada)',
                default_language VARCHAR(50) DEFAULT 'English (United States)',
                default_date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY (05/19/2025)',
                default_time_format VARCHAR(50) DEFAULT '12 Hour (05:30 PM)',
                currency VARCHAR(50) DEFAULT 'USD ($) - US Dollar',
                week_starts_on VARCHAR(50) DEFAULT 'Sunday',
                enable_multi_location BOOLEAN DEFAULT TRUE,
                enabled_modules_json TEXT DEFAULT '[]',
                latitude DOUBLE PRECISION DEFAULT 30.2672,
                longitude DOUBLE PRECISION DEFAULT -97.7431,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS general_app_settings_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                organization_name VARCHAR(200) DEFAULT 'Connected Care Senior Living',
                tagline TEXT DEFAULT '',
                logo_url TEXT DEFAULT '',
                primary_color VARCHAR(50) DEFAULT '#6B46C1',
                phone VARCHAR(50) DEFAULT '+1 (512) 555-0100',
                email VARCHAR(150) DEFAULT 'info@connectedcare.com',
                address TEXT DEFAULT '',
                date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY (05/19/2025)',
                short_date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY (05/19/2025)',
                default_language VARCHAR(50) DEFAULT 'English (United States)',
                time_format VARCHAR(50) DEFAULT '12 Hour (05:30 PM)',
                items_per_page INT DEFAULT 20,
                week_starts_on VARCHAR(50) DEFAULT 'Sunday',
                default_dashboard VARCHAR(100) DEFAULT 'Resident Care Dashboard',
                allow_public_registration BOOLEAN DEFAULT FALSE,
                session_timeout_minutes INT DEFAULT 30,
                enable_audit_logs BOOLEAN DEFAULT TRUE,
                password_expiry_days INT DEFAULT 90,
                enable_two_factor_auth BOOLEAN DEFAULT FALSE,
                maintenance_mode BOOLEAN DEFAULT FALSE,
                weight_unit VARCHAR(50) DEFAULT 'Pounds (lbs)',
                height_unit VARCHAR(50) DEFAULT 'Feet / Inches (ft/in)',
                temperature_unit VARCHAR(50) DEFAULT 'Fahrenheit (°F)',
                currency VARCHAR(50) DEFAULT 'USD ($) - US Dollar',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS localization_settings_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                default_language VARCHAR(100) DEFAULT 'English (United States)',
                fallback_language VARCHAR(100) DEFAULT 'English (United States)',
                date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY (05/19/2025)',
                short_date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY (05/19/2025)',
                time_format VARCHAR(50) DEFAULT '12 Hour (05:30 PM)',
                week_starts_on VARCHAR(50) DEFAULT 'Sunday',
                time_zone VARCHAR(150) DEFAULT '(UTC-06:00) Central Time (US & Canada)',
                preview_region VARCHAR(100) DEFAULT 'United States (en-US)',
                calendar_type VARCHAR(100) DEFAULT 'Gregorian Calendar',
                supported_languages_json TEXT DEFAULT '[]',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS security_settings_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                min_password_length INT DEFAULT 8,
                require_uppercase BOOLEAN DEFAULT TRUE,
                require_lowercase BOOLEAN DEFAULT TRUE,
                require_numbers BOOLEAN DEFAULT TRUE,
                require_special_chars BOOLEAN DEFAULT TRUE,
                password_expiry_days INT DEFAULT 90,
                enable_mfa_for VARCHAR(50) DEFAULT 'Optional for all users',
                mfa_authenticator_app BOOLEAN DEFAULT TRUE,
                mfa_sms_verification BOOLEAN DEFAULT TRUE,
                mfa_email_verification BOOLEAN DEFAULT TRUE,
                remember_mfa_days INT DEFAULT 30,
                session_timeout_minutes INT DEFAULT 30,
                idle_timeout_minutes INT DEFAULT 15,
                force_logout_on_password_change BOOLEAN DEFAULT TRUE,
                allow_multiple_active_sessions BOOLEAN DEFAULT TRUE,
                lockout_threshold INT DEFAULT 5,
                lockout_duration_minutes INT DEFAULT 15,
                prevent_user_enumeration BOOLEAN DEFAULT TRUE,
                require_email_verification BOOLEAN DEFAULT TRUE,
                restrict_login_to_registered_devices BOOLEAN DEFAULT FALSE,
                allow_password_reset BOOLEAN DEFAULT TRUE,
                restrict_specific_ips BOOLEAN DEFAULT FALSE,
                allowed_ips_json TEXT DEFAULT '[]',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS backup_history_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                backup_name VARCHAR(200),
                type VARCHAR(50) DEFAULT 'Full System Backup',
                description TEXT DEFAULT '',
                size_text VARCHAR(50) DEFAULT '245 MB',
                created_on_text VARCHAR(100) DEFAULT '',
                status VARCHAR(50) DEFAULT 'Completed',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS subscription_plan_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                current_plan_name VARCHAR(100) DEFAULT 'Enterprise Healthcare Plan',
                status VARCHAR(50) DEFAULT 'Active',
                renewal_date_text VARCHAR(50) DEFAULT 'December 31, 2026',
                amount_text VARCHAR(50) DEFAULT '$ 2,499.00 / month',
                payment_method VARCHAR(100) DEFAULT 'Corporate Visa ending in 4421',
                residents_current INT DEFAULT 142,
                residents_limit INT DEFAULT 250,
                staff_current INT DEFAULT 48,
                storage_current_gb VARCHAR(20) DEFAULT '45.2 GB',
                storage_limit_gb INT DEFAULT 200,
                sms_current INT DEFAULT 1240,
                sms_limit INT DEFAULT 5000,
                api_current INT DEFAULT 89420,
                api_limit INT DEFAULT 500000,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS billing_invoice_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                invoice_number VARCHAR(100),
                date_text VARCHAR(50),
                amount_text VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Paid',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS user_account_item_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_name VARCHAR(150),
                email VARCHAR(150),
                role VARCHAR(100),
                department VARCHAR(100),
                location VARCHAR(150),
                status VARCHAR(50) DEFAULT 'Active',
                avatar TEXT DEFAULT '',
                last_sign_in_text VARCHAR(100),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS role_definition_item_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                role_name VARCHAR(100),
                description TEXT,
                users_count INT DEFAULT 0,
                status VARCHAR(50) DEFAULT 'Active',
                category_badge VARCHAR(50) DEFAULT 'Custom Role',
                permissions_matrix_json TEXT DEFAULT '[]',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS notification_template_item_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                template_name VARCHAR(150),
                description TEXT,
                category VARCHAR(100),
                channel VARCHAR(100),
                trigger_event VARCHAR(150),
                status VARCHAR(50) DEFAULT 'Active',
                is_enabled BOOLEAN DEFAULT TRUE,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID,
                user_role VARCHAR(50) DEFAULT 'All',
                title VARCHAR(250) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'System',
                severity VARCHAR(30) DEFAULT 'Info',
                action_url VARCHAR(500),
                related_entity_id VARCHAR(100),
                related_entity_type VARCHAR(100),
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                room_location VARCHAR(150),
                is_read BOOLEAN DEFAULT FALSE,
                read_at TIMESTAMP WITH TIME ZONE,
                timestamp_text VARCHAR(100),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
            CREATE INDEX IF NOT EXISTS idx_notifications_role_read ON notifications(user_role, is_read);
            CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_date);

            CREATE TABLE IF NOT EXISTS system_config_toggle_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                config_key VARCHAR(100) NOT NULL UNIQUE,
                config_label VARCHAR(200),
                is_enabled BOOLEAN DEFAULT TRUE,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS system_integrations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(200) NOT NULL,
                system_type VARCHAR(100) DEFAULT '',
                status VARCHAR(50) DEFAULT 'Connected',
                last_sync_time VARCHAR(100) DEFAULT 'Just now',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS audit_logs (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                log_id_code VARCHAR(50) NOT NULL,
                ""user"" VARCHAR(150) DEFAULT '',
                role VARCHAR(100) DEFAULT '',
                action VARCHAR(100) DEFAULT '',
                ip_address VARCHAR(50) DEFAULT '',
                timestamp_text VARCHAR(100) DEFAULT '',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS medication_reminders (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_name VARCHAR(200) DEFAULT '',
                patient_avatar TEXT DEFAULT '',
                medication_name VARCHAR(200) DEFAULT '',
                dose_time_text VARCHAR(100) DEFAULT '',
                relative_time_text VARCHAR(100) DEFAULT '',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS drug_interaction_alerts (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                severity VARCHAR(50) DEFAULT 'High',
                title VARCHAR(250) DEFAULT '',
                description TEXT DEFAULT '',
                count INT DEFAULT 1,
                status VARCHAR(100) DEFAULT 'Requires review',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                username VARCHAR(100) NOT NULL UNIQUE,
                email VARCHAR(150) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                full_name VARCHAR(200) DEFAULT '',
                phone VARCHAR(50) DEFAULT '',
                avatar TEXT DEFAULT '',
                role VARCHAR(50) NOT NULL DEFAULT 'Admin',
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS roles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(50) NOT NULL UNIQUE,
                display_name VARCHAR(100),
                description TEXT,
                is_system_role BOOLEAN DEFAULT TRUE,
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

            CREATE TABLE IF NOT EXISTS user_role (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL,
                role_id UUID NOT NULL,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            CREATE UNIQUE INDEX IF NOT EXISTS uq_user_role ON user_role (user_id, role_id);

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

            CREATE TABLE IF NOT EXISTS role_permission (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                role_id UUID NOT NULL,
                permission_id UUID,
                permission_key VARCHAR(100) DEFAULT '',
                permission_name VARCHAR(150) DEFAULT '',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );


            CREATE TABLE IF NOT EXISTS patient_doctors (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID NOT NULL,
                doctor_id UUID NOT NULL,
                is_primary BOOLEAN DEFAULT TRUE,
                assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                notes TEXT DEFAULT '',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            CREATE UNIQUE INDEX IF NOT EXISTS uq_patient_doctor ON patient_doctors (patient_id, doctor_id);

            CREATE TABLE IF NOT EXISTS patient_nurses (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID NOT NULL,
                nurse_id UUID NOT NULL,
                is_primary BOOLEAN DEFAULT FALSE,
                assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                shift VARCHAR(100) DEFAULT 'Day Shift',
                notes TEXT DEFAULT '',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            CREATE UNIQUE INDEX IF NOT EXISTS uq_patient_nurse ON patient_nurses (patient_id, nurse_id);

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
                endpoint_url VARCHAR(500) DEFAULT '',
                auth_type VARCHAR(100) DEFAULT 'OAuth 2.0',
                sync_interval VARCHAR(100) DEFAULT 'Real-Time',
                environment VARCHAR(50) DEFAULT 'Production',
                settings_json TEXT DEFAULT '',
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

            CREATE TABLE IF NOT EXISTS audit_log_entry_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                date_time_text VARCHAR(100),
                user_name VARCHAR(150),
                user_role VARCHAR(100),
                action VARCHAR(50),
                module VARCHAR(100),
                record_description TEXT,
                ip_address VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Success',
                user_details_json TEXT DEFAULT '',
                action_details_json TEXT DEFAULT '',
                tech_details_json TEXT DEFAULT '',
                changes_json TEXT DEFAULT '',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            ALTER TABLE audit_log_entry_records ADD COLUMN IF NOT EXISTS tech_details_json TEXT DEFAULT '';
            ALTER TABLE audit_log_entry_records ADD COLUMN IF NOT EXISTS changes_json TEXT DEFAULT '';

            CREATE TABLE IF NOT EXISTS ai_service_status_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                service_name VARCHAR(150),
                status VARCHAR(50) DEFAULT 'Healthy',
                model_version VARCHAR(100) DEFAULT 'gpt-4o',
                uptime_percentage VARCHAR(50) DEFAULT '99.9%',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS ai_workflow_metric_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                workflow_name VARCHAR(150),
                requests_count INT DEFAULT 0,
                success_rate VARCHAR(50) DEFAULT '98.0%',
                avg_response_time_seconds VARCHAR(50) DEFAULT '1.20 sec',
                trend_data_json TEXT DEFAULT '[]',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            ALTER TABLE organization_settings_records ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '';
            ALTER TABLE organization_settings_records ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION DEFAULT 30.2672;
            ALTER TABLE organization_settings_records ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION DEFAULT -97.7431;

            CREATE TABLE IF NOT EXISTS ai_activity_log_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                time_text VARCHAR(100),
                title VARCHAR(200),
                resident_info VARCHAR(200),
                type VARCHAR(50) DEFAULT 'Success',
                service VARCHAR(150),
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS ai_patient_summary_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID NOT NULL,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                current_status TEXT,
                recent_changes TEXT,
                active_concerns TEXT,
                outstanding_actions TEXT,
                follow_up_plan TEXT,
                citations_json TEXT DEFAULT '[]',
                data_freshness_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                model_version VARCHAR(100) DEFAULT 'gpt-4o',
                disposition_status VARCHAR(50) DEFAULT 'Draft',
                reviewed_by VARCHAR(150),
                reviewed_date TIMESTAMP WITH TIME ZONE,
                review_notes TEXT,
                raw_model_response TEXT,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            CREATE INDEX IF NOT EXISTS idx_ai_summary_patient ON ai_patient_summary_records(patient_id);

            CREATE TABLE IF NOT EXISTS ai_care_priority_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID NOT NULL,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                priority_level VARCHAR(50) DEFAULT 'High',
                target_role VARCHAR(100) DEFAULT 'Nurse',
                title VARCHAR(300),
                rationale TEXT,
                suggested_action TEXT,
                action_type VARCHAR(100) DEFAULT 'TaskCreation',
                urgency VARCHAR(50) DEFAULT 'Today',
                disposition_status VARCHAR(50) DEFAULT 'Pending',
                actioned_by VARCHAR(150),
                actioned_date TIMESTAMP WITH TIME ZONE,
                notes TEXT,
                resulting_task_id UUID,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            CREATE INDEX IF NOT EXISTS idx_ai_priorities_patient ON ai_care_priority_records(patient_id);

            CREATE TABLE IF NOT EXISTS ai_discharge_review_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID NOT NULL,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                readiness_score INT DEFAULT 0,
                readiness_status VARCHAR(50) DEFAULT 'Conditional',
                summary_findings TEXT,
                missing_items_json TEXT DEFAULT '[]',
                conflicting_items_json TEXT DEFAULT '[]',
                risk_flags_json TEXT DEFAULT '[]',
                actionable_recommendations_json TEXT DEFAULT '[]',
                checklist_ref_id UUID,
                disposition_status VARCHAR(50) DEFAULT 'Pending',
                reviewed_by VARCHAR(150),
                reviewed_date TIMESTAMP WITH TIME ZONE,
                review_notes TEXT,
                model_version VARCHAR(100) DEFAULT 'gpt-4o',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            CREATE INDEX IF NOT EXISTS idx_ai_discharge_patient ON ai_discharge_review_records(patient_id);

            CREATE TABLE IF NOT EXISTS ai_alert_prioritization_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                alert_id UUID NOT NULL,
                patient_id UUID NOT NULL,
                patient_name VARCHAR(200),
                ai_rank_score INT DEFAULT 50,
                urgency_level VARCHAR(50) DEFAULT 'High',
                clinical_rationale TEXT,
                suggested_intervention TEXT,
                original_severity VARCHAR(50),
                original_title VARCHAR(300),
                original_source VARCHAR(150),
                disposition_status VARCHAR(50) DEFAULT 'Active',
                actioned_by VARCHAR(150),
                actioned_date TIMESTAMP WITH TIME ZONE,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            CREATE INDEX IF NOT EXISTS idx_ai_alert_alert_id ON ai_alert_prioritization_records(alert_id);
            CREATE INDEX IF NOT EXISTS idx_ai_alert_patient_id ON ai_alert_prioritization_records(patient_id);

            CREATE TABLE IF NOT EXISTS ai_feedback_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                workflow_type VARCHAR(100) DEFAULT 'PatientSummary',
                target_entity_id VARCHAR(150),
                action VARCHAR(50) DEFAULT 'Accepted',
                user_role VARCHAR(100) DEFAULT 'Doctor',
                user_id VARCHAR(100),
                user_name VARCHAR(150),
                feedback_notes TEXT,
                original_output_json TEXT,
                edited_output_json TEXT,
                latency_ms BIGINT DEFAULT 0,
                model_version VARCHAR(100) DEFAULT 'gpt-4o',
                safety_flag BOOLEAN DEFAULT FALSE,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            CREATE TABLE IF NOT EXISTS ai_audit_entry_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID,
                patient_name VARCHAR(200),
                workflow_type VARCHAR(100) DEFAULT 'PatientSummary',
                model_version VARCHAR(100) DEFAULT 'gpt-4o',
                provider VARCHAR(100) DEFAULT 'OpenAI',
                prompt_tokens INT DEFAULT 0,
                completion_tokens INT DEFAULT 0,
                total_tokens INT DEFAULT 0,
                latency_ms BIGINT DEFAULT 0,
                safety_check_passed BOOLEAN DEFAULT TRUE,
                status VARCHAR(50) DEFAULT 'Success',
                error_message TEXT,
                user_role VARCHAR(100) DEFAULT 'Doctor',
                user_id VARCHAR(100),
                user_name VARCHAR(150),
                request_timestamp_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            CREATE INDEX IF NOT EXISTS idx_ai_audit_time ON ai_audit_entry_records(request_timestamp_utc);
            CREATE INDEX IF NOT EXISTS idx_ai_audit_workflow ON ai_audit_entry_records(workflow_type);

            CREATE TABLE IF NOT EXISTS ai_medication_reviews (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID NOT NULL,
                patient_name VARCHAR(200),
                patient_id_code VARCHAR(50),
                safety_score INT DEFAULT 95,
                review_status VARCHAR(50) DEFAULT 'Completed',
                clinical_synthesis TEXT,
                interactions_json TEXT DEFAULT '[]',
                dosage_adjustment_flags_json TEXT DEFAULT '[]',
                beers_criteria_flags_json TEXT DEFAULT '[]',
                recommendations_json TEXT DEFAULT '[]',
                disposition_status VARCHAR(50) DEFAULT 'Pending',
                reviewed_by VARCHAR(150),
                reviewed_date TIMESTAMP WITH TIME ZONE,
                review_notes TEXT,
                model_version VARCHAR(100) DEFAULT 'gpt-4o',
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            CREATE INDEX IF NOT EXISTS idx_ai_med_patient_id ON ai_medication_reviews(patient_id);

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
            
            CREATE TABLE IF NOT EXISTS medication_administrations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                medication_id UUID NOT NULL,
                patient_id UUID NOT NULL,
                nurse_id UUID NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'Given',
                notes TEXT,
                administered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );
            
            CREATE INDEX IF NOT EXISTS idx_medication_administrations_medication_id
                ON medication_administrations(medication_id);

            CREATE INDEX IF NOT EXISTS idx_medication_administrations_patient_id
                ON medication_administrations(patient_id);

            CREATE INDEX IF NOT EXISTS idx_medication_administrations_nurse_id
                ON medication_administrations(nurse_id);

            CREATE TABLE IF NOT EXISTS alerts (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                alert_id_code VARCHAR(50),
                title VARCHAR(250),
                description TEXT,
                patient_id UUID,
                recipient_id UUID,
                recipient_role VARCHAR(50),
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

            ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT FALSE;
            ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS creator_user_id UUID;
            ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS participant_user_id UUID;
            ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS shared_patient_id UUID;

            ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_user_id UUID;
            ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
            ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255);
            ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50);
            ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachment_size VARCHAR(50);

            UPDATE app_menu_items SET path = '/reports' WHERE menu_key = 'nurse_reports' OR menu_key = 'doc_reports';
            UPDATE app_menu_items SET path = '/consultations' WHERE menu_key = 'doc_consultations';
            UPDATE app_menu_items SET path = '/care-plans' WHERE menu_key = 'doc_care_plans';
            UPDATE app_menu_items SET path = '/documentations' WHERE menu_key = 'doc_documents';
            UPDATE app_menu_items SET path = '/shift-handover' WHERE menu_key = 'nurse_handover';
            UPDATE app_menu_items SET path = '/settings-profile' WHERE menu_key = 'nurse_settings';

            INSERT INTO app_menu_items (id, menu_key, title, path, icon, sort_order, roles_allowed_json, created_date, created_by, updated_date, updated_by)
            SELECT uuid_generate_v4(), 'doc_ai', 'AI Assistant', '/ai-operations', 'Sparkles', 11, '[""Doctor""]', CURRENT_TIMESTAMP, 'System', CURRENT_TIMESTAMP, 'System'
            WHERE NOT EXISTS (SELECT 1 FROM app_menu_items WHERE menu_key = 'doc_ai');

            INSERT INTO app_menu_items (id, menu_key, title, path, icon, sort_order, roles_allowed_json, created_date, created_by, updated_date, updated_by)
            SELECT uuid_generate_v4(), 'nurse_ai', 'AI Clinical Copilot', '/ai-operations', 'Sparkles', 14, '[""Nurse""]', CURRENT_TIMESTAMP, 'System', CURRENT_TIMESTAMP, 'System'
            WHERE NOT EXISTS (SELECT 1 FROM app_menu_items WHERE menu_key = 'nurse_ai');

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

            CREATE TABLE IF NOT EXISTS ai_settings_records (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                primary_model VARCHAR(100) DEFAULT 'gpt-4o',
                fallback_model VARCHAR(100) DEFAULT 'gpt-4o-mini',
                monthly_token_limit VARCHAR(50) DEFAULT '15M',
                max_concurrent_requests INTEGER DEFAULT 25,
                auto_retry_failed BOOLEAN DEFAULT TRUE,
                enable_safety_guardrails BOOLEAN DEFAULT TRUE,
                active_provider VARCHAR(100) DEFAULT 'OpenAI',
                tokens_used_this_month INTEGER DEFAULT 0,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100) DEFAULT 'System',
                updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100) DEFAULT 'System'
            );

            INSERT INTO ai_settings_records (id, primary_model, fallback_model, monthly_token_limit, max_concurrent_requests, auto_retry_failed, enable_safety_guardrails, active_provider, tokens_used_this_month, created_date, created_by, updated_date, updated_by)
            SELECT uuid_generate_v4(), 'gpt-4o', 'gpt-4o-mini', '15M', 25, TRUE, TRUE, 'OpenAI', 0, CURRENT_TIMESTAMP, 'System', CURRENT_TIMESTAMP, 'System'
            WHERE NOT EXISTS (SELECT 1 FROM ai_settings_records);

            -- Purge old dummy activity logs with RID- resident info or fake dummy titles
            DELETE FROM ai_activity_log_records WHERE resident_info LIKE '%RID-%' OR resident_info LIKE '%Assisted Living%' OR resident_info LIKE '%Resident%' OR title LIKE '%Allergy cross-reference%' OR title LIKE '%Anita Sharma%' OR resident_info LIKE '%Anita Sharma%' OR service = 'Conversation Assistant' OR title LIKE '%Conversation Assistant%';

            -- Reset dummy request counts in ai_workflow_metric_records
            UPDATE ai_workflow_metric_records SET requests_count = 0 WHERE requests_count >= 1000 OR success_rate = '96.3%';

            -- Clean up dummy degraded service records
            DELETE FROM ai_service_status_records WHERE service_name = 'Conversation Assistant' OR model_version = 'gpt-3.5-turbo';
            UPDATE ai_service_status_records SET status = 'Healthy', uptime_percentage = '99.9%' WHERE status = 'Degraded';

            -- Clean up dummy token count in ai_settings_records if set to fake 1240000
            UPDATE ai_settings_records SET tokens_used_this_month = 0 WHERE tokens_used_this_month >= 1000000;

            -- Clear legacy default dummy avatar URLs for doctors, nurses, and staff users
            UPDATE doctors SET avatar = '' WHERE avatar LIKE '%photo-1622253692010%' OR avatar LIKE '%photo-1559839734%' OR avatar LIKE '%photo-1534528741775%';
            UPDATE nurses SET avatar = '' WHERE avatar LIKE '%photo-1622253692010%' OR avatar LIKE '%photo-1559839734%' OR avatar LIKE '%photo-1534528741775%';
            UPDATE care_team_members SET avatar = '' WHERE avatar LIKE '%photo-1622253692010%' OR avatar LIKE '%photo-1559839734%' OR avatar LIKE '%photo-1534528741775%';
            UPDATE users SET avatar = '' WHERE (role IN ('Doctor', 'Nurse') OR role IS NULL) AND (avatar LIKE '%photo-1622253692010%' OR avatar LIKE '%photo-1559839734%' OR avatar LIKE '%photo-1534528741775%');
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
