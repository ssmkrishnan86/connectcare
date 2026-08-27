-- ConnectCare Database Cleanup Script
-- Truncates all dummy clinical data, sample transactions, dummy logs, and clears avatar URLs.

DO $$
DECLARE
    tbl text;
    tbls text[] := ARRAY[
        'chat_messages',
        'chat_conversations',
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
        'tasks',
        'alerts',
        'care_team_members',
        'care_teams',
        'shift_handover_patient_records',
        'shift_handovers',
        'nurse_documentations',
        'nurse_reports',
        'clinical_encounter_records',
        'custom_report_records',
        'location_units',
        'care_units',
        'patient_doctors',
        'patient_nurses',
        'patients',
        'billing_invoice_records',
        'financial_transaction_records',
        'backup_history_records',
        'activity_summary_logs',
        'ai_activity_log_records',
        'doctor_ai_conversations',
        'integration_activity_log_records',
        'audit_log_entry_records',
        'audit_logs'
    ];
BEGIN
    FOREACH tbl IN ARRAY tbls LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(tbl) || ' CASCADE;';
            RAISE NOTICE 'Truncated %', tbl;
        END IF;
    END LOOP;
END $$;

-- Reset any avatar URLs to empty string
UPDATE users SET avatar = '' WHERE avatar IS NOT NULL AND avatar != '';
UPDATE doctors SET avatar = '' WHERE avatar IS NOT NULL AND avatar != '';
UPDATE nurses SET avatar = '' WHERE avatar IS NOT NULL AND avatar != '';
UPDATE nurse_profiles SET avatar = '' WHERE avatar IS NOT NULL AND avatar != '';
