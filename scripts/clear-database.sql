-- ==============================================================================
-- ConnectCare PostgreSQL Database Cleanup Script
-- Target: Render / PostgreSQL Database (https://connectcare-0k4a.onrender.com/)
--
-- Description:
-- Clears all transactional, clinical, patient, task, alert, communication,
-- and log data while preserving:
--   1. System Administrator account (admin / admin@connectcare.org)
--   2. Master App Roles (Admin, Doctor, Nurse, etc.)
--   3. App Permissions Catalog and Admin Role Permissions
--   4. Navigation Menu Catalog (app_menu_items)
--   5. Organization, General, Localization, Security, and AI Settings
--   6. Notification Templates, System Integrations, and Role Definitions
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    tbl text;
    -- Array of all clinical and transactional tables to truncate
    tbls text[] := ARRAY[
        -- Communication & Chat
        'chat_messages',
        'chat_conversations',
        'notifications',

        -- Clinical Records & Encounters
        'patient_document_records',
        'patient_care_plan_records',
        'medication_administrations',
        'medication_records',
        'medication_reminders',
        'drug_interaction_alerts',
        'discharge_checklists',
        'vital_rounds',
        'care_plans',
        'consultations',
        'doctor_consultations',
        'clinical_encounter_records',
        'nurse_documentations',
        'nurse_reports',

        -- Tasks, Alerts & Handover
        'tasks',
        'alerts',
        'shift_handover_patient_records',
        'shift_handovers',

        -- Patient & Care Team Associations
        'patient_doctors',
        'patient_nurses',
        'care_team_members',
        'patients',

        -- Staff Clinical Records (Non-master)
        'nurse_profiles',
        'doctors',
        'nurses',

        -- Location / Bed allocations (transient instances)
        'location_units',
        'care_units',

        -- AI Transactional Data & Logs
        'doctor_ai_conversations',
        'ai_patient_summary_records',
        'ai_care_priority_records',
        'ai_discharge_review_records',
        'ai_alert_prioritization_records',
        'ai_feedback_records',
        'ai_audit_entry_records',
        'ai_medication_reviews',
        'ai_activity_log_records',

        -- Financial & Backups & Reporting
        'billing_invoice_records',
        'financial_transaction_records',
        'custom_report_records',
        'backup_history_records',

        -- Activity & Audit Logs
        'activity_summary_logs',
        'integration_activity_log_records',
        'audit_log_entry_records',
        'audit_logs'
    ];
BEGIN
    RAISE NOTICE 'Starting ConnectCare database cleanup...';

    FOREACH tbl IN ARRAY tbls LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(tbl) || ' CASCADE;';
            RAISE NOTICE 'Truncated table: %', tbl;
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 1. Remove Non-Admin User Accounts & Roles
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_role') THEN
        DELETE FROM user_role 
        WHERE user_id NOT IN (
            SELECT id FROM users 
            WHERE lower(username) = 'admin' OR lower(role) = 'admin'
        );
        RAISE NOTICE 'Cleared non-admin user role mappings.';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        DELETE FROM users 
        WHERE lower(username) != 'admin' AND lower(role) != 'admin';
        RAISE NOTICE 'Cleared non-admin user accounts.';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_account_item_records') THEN
        DELETE FROM user_account_item_records 
        WHERE lower(email) != 'admin@connectcare.org' 
          AND lower(coalesce(role, '')) NOT IN ('admin', 'system administrator');
        RAISE NOTICE 'Cleared staff user directory entries.';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Ensure Default System Admin Account Exists
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    admin_user_id UUID;
    admin_role_id UUID;
    -- Password hash & salt for default password 'admin123'
    default_hash TEXT := '8zYkU2oX5Xw+vB1E+qA0wLgYtE2c/X0kG7R0jO3+J5Q=';
    default_salt TEXT := 'V1NuU3lzdGVtU2FsdDIwMjY=';
BEGIN
    -- Ensure Admin Role in app_roles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_roles') THEN
        SELECT id INTO admin_role_id FROM app_roles WHERE role_name = 'Admin' LIMIT 1;
        IF admin_role_id IS NULL THEN
            INSERT INTO app_roles (id, role_name, display_name, description, is_system_role, created_date, created_by, updated_date, updated_by)
            VALUES (gen_random_uuid(), 'Admin', 'System Administrator', 'Full unrestricted administrative access to all modules and system settings', true, CURRENT_TIMESTAMP, 'System', CURRENT_TIMESTAMP, 'System')
            RETURNING id INTO admin_role_id;
            RAISE NOTICE 'Created default Admin AppRole.';
        END IF;
    END IF;

    -- Ensure Admin User in users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        SELECT id INTO admin_user_id FROM users WHERE lower(username) = 'admin' LIMIT 1;
        IF admin_user_id IS NULL THEN
            INSERT INTO users (id, username, email, full_name, phone, avatar, password_hash, password_salt, role, is_active, created_date, created_by, updated_date, updated_by)
            VALUES (gen_random_uuid(), 'admin', 'admin@connectcare.org', 'System Administrator', '(512) 555-0100', '', default_hash, default_salt, 'Admin', true, CURRENT_TIMESTAMP, 'System', CURRENT_TIMESTAMP, 'System')
            RETURNING id INTO admin_user_id;
            RAISE NOTICE 'Created default Admin user (username: admin / password: admin123).';
        ELSE
            -- Ensure active and role is Admin
            UPDATE users 
            SET is_active = true, role = 'Admin', updated_date = CURRENT_TIMESTAMP, avatar = ''
            WHERE id = admin_user_id;
        END IF;

        -- Ensure user_role mapping
        IF admin_role_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_role') THEN
            IF NOT EXISTS (SELECT 1 FROM user_role WHERE user_id = admin_user_id AND role_id = admin_role_id) THEN
                INSERT INTO user_role (id, user_id, role_id, created_date, created_by, updated_date, updated_by)
                VALUES (gen_random_uuid(), admin_user_id, admin_role_id, CURRENT_TIMESTAMP, 'System', CURRENT_TIMESTAMP, 'System');
                RAISE NOTICE 'Mapped Admin user to Admin role.';
            END IF;
        END IF;
    END IF;

    -- Ensure Admin User Directory Record
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_account_item_records') THEN
        IF NOT EXISTS (SELECT 1 FROM user_account_item_records WHERE lower(email) = 'admin@connectcare.org') THEN
            INSERT INTO user_account_item_records (id, user_name, email, role, department, location, status, avatar, last_sign_in_text, created_date, created_by, updated_date, updated_by)
            VALUES (gen_random_uuid(), 'System Administrator', 'admin@connectcare.org', 'System Administrator', 'Administration', 'Main Campus', 'Active', '', 'Just now', CURRENT_TIMESTAMP, 'System', CURRENT_TIMESTAMP, 'System');
        ELSE
            UPDATE user_account_item_records SET avatar = '', status = 'Active', updated_date = CURRENT_TIMESTAMP WHERE lower(email) = 'admin@connectcare.org';
        END IF;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Reset Avatars & Counters in Master/Config Records
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Reset AI token counts and request metrics
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_settings_records') THEN
        UPDATE ai_settings_records SET tokens_used_this_month = 0, updated_date = CURRENT_TIMESTAMP;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_workflow_metric_records') THEN
        UPDATE ai_workflow_metric_records SET requests_count = 0;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_plan_records') THEN
        UPDATE subscription_plan_records 
        SET residents_current = 0, staff_current = 0, sms_current = 0, api_current = 0, storage_current_gb = '0 GB', updated_date = CURRENT_TIMESTAMP;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        UPDATE users SET avatar = '' WHERE avatar IS NOT NULL AND avatar != '';
    END IF;
END $$;

COMMIT;

-- Output confirmation summary
SELECT 'Database successfully cleared. All clinical and transactional data removed. Admin account, roles, permissions, and master data preserved.' AS cleanup_status;
