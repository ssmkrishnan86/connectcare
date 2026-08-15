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
