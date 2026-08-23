-- ConnectCare Complete Database Schema for PostgreSQL
-- Server: ConnectCare | Port: 5432 | Database: ConnectCare

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

----------------------------------------------------
-- 1. Create Base Trigger Function for Audit Update
----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

----------------------------------------------------
-- 2. Create Core Tables
----------------------------------------------------

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    doctor_id_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    avatar TEXT DEFAULT '',
    specialty VARCHAR(100) NOT NULL,
    specialty_icon VARCHAR(20) DEFAULT '🩺',
    department VARCHAR(100) NOT NULL,
    location VARCHAR(150) DEFAULT '',
    phone VARCHAR(30) DEFAULT '',
    email VARCHAR(150) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    experience VARCHAR(50) DEFAULT '',
    teleconsultation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Nurses Table
CREATE TABLE IF NOT EXISTS nurses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    nurse_id_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    avatar TEXT DEFAULT '',
    shift VARCHAR(100) NOT NULL DEFAULT 'Day Shift (08:00 AM - 04:00 PM)',
    department VARCHAR(100) NOT NULL DEFAULT 'General Ward',
    sub_unit VARCHAR(100) DEFAULT 'Floor 2',
    location VARCHAR(150) DEFAULT 'Main Campus',
    assigned_unit VARCHAR(100) DEFAULT 'General Ward',
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    phone VARCHAR(30) DEFAULT '',
    email VARCHAR(150) NOT NULL UNIQUE,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id_code VARCHAR(50) NOT NULL UNIQUE,
    mrn VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    avatar TEXT DEFAULT '',
    dob VARCHAR(50) DEFAULT '',
    gender VARCHAR(30) DEFAULT '',
    age_gender VARCHAR(50) DEFAULT '',
    phone VARCHAR(30) DEFAULT '',
    email VARCHAR(150) DEFAULT '',
    address VARCHAR(250) DEFAULT '',
    emergency_contact_name VARCHAR(150) DEFAULT '',
    emergency_contact_phone VARCHAR(50) DEFAULT '',
    emergency_contact_relationship VARCHAR(100) DEFAULT '',
    insurance_provider VARCHAR(150) DEFAULT '',
    insurance_policy_number VARCHAR(100) DEFAULT '',
    insurance_group_number VARCHAR(100) DEFAULT '',
    blood_group VARCHAR(20) DEFAULT '',
    allergies TEXT DEFAULT '',
    medical_conditions TEXT DEFAULT '',
    current_medications TEXT DEFAULT '',
    past_medical_history TEXT DEFAULT '',
    care_unit VARCHAR(100) NOT NULL DEFAULT 'General Medicine',
    floor_room VARCHAR(100) DEFAULT '',
    primary_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    primary_doctor_name VARCHAR(200) DEFAULT '',
    primary_doctor_specialty VARCHAR(100) DEFAULT '',
    primary_doctor_avatar TEXT DEFAULT '',
    status VARCHAR(30) NOT NULL DEFAULT 'InCare',
    risk_level VARCHAR(30) NOT NULL DEFAULT 'Medium',
    last_visit VARCHAR(100) DEFAULT '',
    admission_date VARCHAR(50) DEFAULT '',
    care_days INT NOT NULL DEFAULT 1,
    discharge_plan VARCHAR(150) DEFAULT 'Not Scheduled',
    blood_pressure VARCHAR(30) DEFAULT '120/80 mmHg',
    heart_rate VARCHAR(30) DEFAULT '72 bpm',
    blood_sugar VARCHAR(30) DEFAULT '110 mg/dL',
    temperature VARCHAR(30) DEFAULT '98.6 °F',
    spo2 VARCHAR(30) DEFAULT '98 %',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Care Team Members Table
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
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    shift VARCHAR(100) DEFAULT '',
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    nurse_id UUID REFERENCES nurses(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Location Units Table
CREATE TABLE IF NOT EXISTS location_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) DEFAULT '',
    name VARCHAR(150) NOT NULL UNIQUE,
    type VARCHAR(50) DEFAULT 'Hospital',
    facility VARCHAR(150) DEFAULT '',
    facility_location VARCHAR(150) DEFAULT '',
    units_count INT DEFAULT 10,
    beds INT DEFAULT 100,
    status VARCHAR(30) DEFAULT 'Active',
    floor VARCHAR(50) DEFAULT '',
    capacity VARCHAR(50) DEFAULT '',
    occupied VARCHAR(50) DEFAULT '',
    occupancy_rate VARCHAR(50) DEFAULT '',
    attention_priority VARCHAR(30) NOT NULL DEFAULT 'Low',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Care Units Table
CREATE TABLE IF NOT EXISTS care_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    floor VARCHAR(100) NOT NULL,
    location_unit_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(250) DEFAULT '',
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) NOT NULL,
    room_location VARCHAR(150) DEFAULT '',
    severity VARCHAR(30) NOT NULL DEFAULT 'Medium',
    trigger_condition VARCHAR(250) NOT NULL,
    timestamp_text VARCHAR(50) DEFAULT '',
    is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by VARCHAR(150) DEFAULT '',
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    notes TEXT DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(250) NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) DEFAULT '',
    assigned_caregiver VARCHAR(200) DEFAULT '',
    task_type VARCHAR(100) DEFAULT 'Routine',
    priority VARCHAR(30) NOT NULL DEFAULT 'Medium',
    due_time VARCHAR(50) DEFAULT '',
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    status_str VARCHAR(50) DEFAULT 'Pending',
    is_overdue BOOLEAN DEFAULT FALSE,
    notes TEXT DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Users & Authentication Tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    full_name VARCHAR(150) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    avatar TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    password_salt TEXT DEFAULT '',
    role VARCHAR(100) NOT NULL DEFAULT 'Admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS app_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT DEFAULT '',
    is_system_role BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS user_role (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS app_menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    path VARCHAR(200) NOT NULL,
    icon VARCHAR(100) DEFAULT '',
    sort_order INT DEFAULT 0,
    roles_allowed_json TEXT DEFAULT '["Admin"]',
    parent_menu_key VARCHAR(100) DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Clinical & Documentation Tables
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) NOT NULL,
    physician_name VARCHAR(200) DEFAULT '',
    care_unit VARCHAR(100) DEFAULT '',
    room_number VARCHAR(50) DEFAULT '',
    consultation_type VARCHAR(100) DEFAULT '',
    status VARCHAR(30) DEFAULT 'Scheduled',
    date_time_text VARCHAR(100) DEFAULT '',
    reason TEXT DEFAULT '',
    clinical_notes TEXT DEFAULT '',
    diagnosis TEXT DEFAULT '',
    recommendations TEXT DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS doctor_consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_name VARCHAR(150) DEFAULT '',
    patient_name VARCHAR(150) NOT NULL,
    patient_id_code VARCHAR(50) DEFAULT '',
    care_unit VARCHAR(100) DEFAULT '',
    room_number VARCHAR(50) DEFAULT '',
    date_text VARCHAR(100) DEFAULT '',
    consultation_type VARCHAR(100) DEFAULT '',
    clinical_notes TEXT DEFAULT '',
    diagnosis TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'Completed',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS care_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) NOT NULL,
    care_unit VARCHAR(100) DEFAULT '',
    room_bed VARCHAR(50) DEFAULT '',
    primary_condition VARCHAR(200) DEFAULT '',
    status VARCHAR(30) DEFAULT 'Active',
    created_date_text VARCHAR(50) DEFAULT '',
    last_reviewed_text VARCHAR(50) DEFAULT '',
    care_goals TEXT DEFAULT '',
    interventions TEXT DEFAULT '',
    review_frequency VARCHAR(50) DEFAULT '',
    assigned_lead VARCHAR(150) DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS patient_care_plan_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_name VARCHAR(150) DEFAULT '',
    patient_name VARCHAR(150) NOT NULL,
    patient_id_code VARCHAR(50) DEFAULT '',
    plan_name VARCHAR(200) NOT NULL,
    start_date VARCHAR(50) DEFAULT '',
    target_date VARCHAR(50) DEFAULT '',
    status VARCHAR(50) DEFAULT 'Active',
    progress_percentage INT DEFAULT 0,
    goals TEXT DEFAULT '',
    interventions TEXT DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS vital_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) NOT NULL,
    care_unit VARCHAR(100) DEFAULT '',
    room_bed VARCHAR(50) DEFAULT '',
    patient_type VARCHAR(30) DEFAULT 'Inpatient',
    status VARCHAR(30) DEFAULT 'Pending',
    last_round_date_text VARCHAR(50) DEFAULT '',
    next_due_time_text VARCHAR(50) DEFAULT '',
    recorded_by_nurse_name VARCHAR(150) DEFAULT '',
    blood_pressure VARCHAR(30) DEFAULT '120/80 mmHg',
    heart_rate VARCHAR(30) DEFAULT '72 bpm',
    temperature VARCHAR(30) DEFAULT '98.6 °F',
    respiratory_rate VARCHAR(30) DEFAULT '16 /min',
    sp_o2 VARCHAR(30) DEFAULT '98 %',
    notes TEXT DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS shift_handovers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outgoing_nurse_id UUID,
    outgoing_nurse_name VARCHAR(150) NOT NULL,
    incoming_nurse_id UUID,
    incoming_nurse_name VARCHAR(150) NOT NULL,
    care_unit VARCHAR(100) NOT NULL,
    shift_date VARCHAR(50) NOT NULL,
    from_shift VARCHAR(50) NOT NULL,
    to_shift VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'Draft',
    summary_notes TEXT DEFAULT '',
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS shift_handover_patient_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_handover_id UUID REFERENCES shift_handovers(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) NOT NULL,
    room_bed VARCHAR(50) DEFAULT '',
    acuity_level VARCHAR(30) DEFAULT 'Medium',
    current_status TEXT DEFAULT '',
    key_events_this_shift TEXT DEFAULT '',
    pending_tasks TEXT DEFAULT '',
    special_instructions TEXT DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS discharge_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) NOT NULL,
    care_unit VARCHAR(100) DEFAULT '',
    room_bed VARCHAR(50) DEFAULT '',
    planned_discharge_date VARCHAR(50) DEFAULT '',
    checklist_status VARCHAR(30) DEFAULT 'InProgress',
    is_clinical_stability_cleared BOOLEAN DEFAULT FALSE,
    is_medication_reconciliation_done BOOLEAN DEFAULT FALSE,
    is_discharge_summary_written BOOLEAN DEFAULT FALSE,
    is_follow_up_appointment_set BOOLEAN DEFAULT FALSE,
    is_patient_education_complete BOOLEAN DEFAULT FALSE,
    is_transportation_arranged BOOLEAN DEFAULT FALSE,
    is_billing_cleared BOOLEAN DEFAULT FALSE,
    discharge_physician_name VARCHAR(150) DEFAULT '',
    assigned_nurse_name VARCHAR(150) DEFAULT '',
    notes TEXT DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS patient_document_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_name VARCHAR(150) DEFAULT '',
    patient_name VARCHAR(150) NOT NULL,
    patient_id_code VARCHAR(50) DEFAULT '',
    document_name VARCHAR(200) NOT NULL,
    document_type VARCHAR(100) DEFAULT 'Lab Report',
    file_size VARCHAR(50) DEFAULT '',
    uploaded_date VARCHAR(50) DEFAULT '',
    file_path TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'Active',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS nurse_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) DEFAULT 'Staff Nurse',
    employee_id VARCHAR(50) DEFAULT '',
    email VARCHAR(150) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    department VARCHAR(100) DEFAULT 'General Ward',
    sub_unit VARCHAR(100) DEFAULT 'Floor 2',
    current_shift VARCHAR(100) DEFAULT 'Day Shift (08:00 AM - 04:00 PM)',
    license_number VARCHAR(100) DEFAULT '',
    status VARCHAR(50) DEFAULT 'Active',
    emergency_contact_name VARCHAR(150) DEFAULT '',
    emergency_contact_phone VARCHAR(50) DEFAULT '',
    notification_preferences TEXT DEFAULT '{"email":true,"sms":true,"push":true}',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS nurse_documentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nurse_name VARCHAR(150) DEFAULT '',
    patient_name VARCHAR(150) NOT NULL,
    patient_id_code VARCHAR(50) DEFAULT '',
    care_unit VARCHAR(100) DEFAULT '',
    room_bed VARCHAR(50) DEFAULT '',
    documentation_type VARCHAR(100) NOT NULL,
    notes TEXT DEFAULT '',
    recorded_date_text VARCHAR(100) DEFAULT '',
    status VARCHAR(50) DEFAULT 'Submitted',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS nurse_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    category_tab VARCHAR(100) NOT NULL,
    care_unit VARCHAR(100) DEFAULT 'All Units / Floors',
    shift VARCHAR(100) DEFAULT 'All Shift',
    description TEXT DEFAULT '',
    generated_by VARCHAR(150) DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_name VARCHAR(150) NOT NULL,
    contact_role VARCHAR(100) DEFAULT '',
    contact_avatar TEXT DEFAULT '',
    contact_status VARCHAR(50) DEFAULT 'Active',
    last_message_text TEXT DEFAULT '',
    last_message_time_text VARCHAR(50) DEFAULT '',
    unread_count INT DEFAULT 0,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID,
    sender_name VARCHAR(150) NOT NULL,
    sender_role VARCHAR(100) DEFAULT '',
    sender_avatar TEXT DEFAULT '',
    message_text TEXT NOT NULL,
    time_text VARCHAR(50) DEFAULT '',
    is_outgoing BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS doctor_ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_name VARCHAR(150) DEFAULT '',
    patient_name VARCHAR(150) DEFAULT '',
    patient_id_code VARCHAR(50) DEFAULT '',
    prompt_query TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Medications Tables
CREATE TABLE IF NOT EXISTS medication_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) DEFAULT '',
    adherence_percentage VARCHAR(20) DEFAULT '95%',
    active_prescriptions INT NOT NULL DEFAULT 100,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS medication_administrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) DEFAULT '',
    route VARCHAR(100) DEFAULT '',
    scheduled_time VARCHAR(50) DEFAULT '',
    administered_time VARCHAR(50) DEFAULT '',
    status VARCHAR(50) DEFAULT 'Administered',
    administered_by_nurse_name VARCHAR(150) DEFAULT '',
    notes TEXT DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Settings & Configuration Tables
CREATE TABLE IF NOT EXISTS general_app_settings_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name VARCHAR(200) DEFAULT 'Connected Care Senior Living',
    tagline VARCHAR(200) DEFAULT 'Compassionate Care, Connected Life',
    logo_url TEXT DEFAULT '',
    primary_color VARCHAR(50) DEFAULT '#6B46C1',
    phone VARCHAR(50) DEFAULT '+1 (512) 555-0100',
    email VARCHAR(150) DEFAULT 'info@connectedcare.com',
    address VARCHAR(250) DEFAULT '100 Hospital Drive, Suite 400, Austin, TX 78705, USA',
    date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
    short_date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
    default_language VARCHAR(50) DEFAULT 'English (United States)',
    time_format VARCHAR(50) DEFAULT '12 Hour (AM/PM)',
    items_per_page INT DEFAULT 20,
    week_starts_on VARCHAR(50) DEFAULT 'Sunday',
    default_dashboard VARCHAR(50) DEFAULT 'Overview',
    allow_public_registration BOOLEAN DEFAULT FALSE,
    session_timeout_minutes INT DEFAULT 30,
    enable_audit_logs BOOLEAN DEFAULT TRUE,
    password_expiry_days INT DEFAULT 90,
    enable_two_factor_auth BOOLEAN DEFAULT FALSE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    weight_unit VARCHAR(50) DEFAULT 'Pounds (lbs)',
    height_unit VARCHAR(50) DEFAULT 'Feet / Inches',
    temperature_unit VARCHAR(50) DEFAULT 'Fahrenheit (°F)',
    currency VARCHAR(50) DEFAULT 'USD ($) - US Dollar',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS organization_settings_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name VARCHAR(200) DEFAULT 'Connected Care Senior Living',
    logo_url TEXT DEFAULT '',
    tagline VARCHAR(200) DEFAULT 'Compassionate Care, Connected Life',
    primary_color VARCHAR(50) DEFAULT '#6B46C1',
    phone VARCHAR(50) DEFAULT '+1 (512) 555-0100',
    address VARCHAR(250) DEFAULT '100 Hospital Drive, Suite 400, Austin, TX 78705, USA',
    email VARCHAR(150) DEFAULT 'info@connectedcare.com',
    organization_type VARCHAR(100) DEFAULT 'Senior Living / Assisted Living',
    registration_number VARCHAR(100) DEFAULT 'TX-HSP-2018-55671',
    established_year VARCHAR(50) DEFAULT '2018',
    website VARCHAR(150) DEFAULT 'https://www.connectedcare.com',
    primary_contact_person VARCHAR(150) DEFAULT 'John Admin',
    primary_contact_designation VARCHAR(100) DEFAULT 'Administrator',
    primary_contact_email VARCHAR(150) DEFAULT 'admin@connectedcare.com',
    primary_contact_phone VARCHAR(50) DEFAULT '(512) 555-0100',
    primary_contact_alternate_phone VARCHAR(50) DEFAULT '(512) 555-0199',
    address_line1 VARCHAR(150) DEFAULT '100 Hospital Drive',
    address_line2 VARCHAR(150) DEFAULT 'Suite 400',
    city VARCHAR(100) DEFAULT 'Austin',
    state VARCHAR(100) DEFAULT 'Texas',
    pin_code VARCHAR(50) DEFAULT '78705',
    country VARCHAR(100) DEFAULT 'United States',
    default_time_zone VARCHAR(100) DEFAULT '(UTC-06:00) Central Time (US & Canada)',
    default_language VARCHAR(50) DEFAULT 'English (United States)',
    default_date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
    default_time_format VARCHAR(50) DEFAULT '12 Hour (AM/PM)',
    currency VARCHAR(50) DEFAULT 'USD ($) - US Dollar',
    week_starts_on VARCHAR(50) DEFAULT 'Sunday',
    enable_multi_location BOOLEAN DEFAULT TRUE,
    enabled_modules_json TEXT DEFAULT '["Residents", "Care & Clinical", "Medication", "Billing & Finance", "Reports & Analytics", "Alerts & Incidents", "Tasks & Activities", "Document Management"]',
    latitude DOUBLE PRECISION DEFAULT 30.2672,
    longitude DOUBLE PRECISION DEFAULT -97.7431,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS localization_settings_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    default_language VARCHAR(50) DEFAULT 'English (United States)',
    fallback_language VARCHAR(50) DEFAULT 'Spanish (United States)',
    date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
    short_date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
    time_format VARCHAR(50) DEFAULT '12 Hour (AM/PM)',
    week_starts_on VARCHAR(50) DEFAULT 'Sunday',
    time_zone VARCHAR(100) DEFAULT '(UTC-06:00) Central Time (US & Canada)',
    preview_region VARCHAR(100) DEFAULT 'United States (en-US)',
    calendar_type VARCHAR(50) DEFAULT 'Gregorian Calendar',
    supported_languages_json TEXT DEFAULT '[{"name":"English (United States)","code":"en-US","isDefault":true},{"name":"Spanish (United States)","code":"es-US"},{"name":"French","code":"fr-FR"},{"name":"Chinese (Simplified)","code":"zh-CN"}]',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    enable_mfa_for VARCHAR(100) DEFAULT 'Optional for all users',
    mfa_authenticator_app BOOLEAN DEFAULT TRUE,
    mfa_sms_verification BOOLEAN DEFAULT TRUE,
    mfa_email_verification BOOLEAN DEFAULT FALSE,
    remember_mfa_days INT DEFAULT 30,
    session_timeout_minutes INT DEFAULT 30,
    idle_timeout_minutes INT DEFAULT 15,
    force_logout_on_password_change BOOLEAN DEFAULT TRUE,
    allow_multiple_active_sessions BOOLEAN DEFAULT TRUE,
    lockout_threshold INT DEFAULT 5,
    lockout_duration_minutes INT DEFAULT 15,
    prevent_user_enumeration BOOLEAN DEFAULT TRUE,
    require_email_verification BOOLEAN DEFAULT FALSE,
    restrict_login_to_registered_devices BOOLEAN DEFAULT FALSE,
    allow_password_reset BOOLEAN DEFAULT TRUE,
    restrict_specific_ips BOOLEAN DEFAULT FALSE,
    allowed_ips_json TEXT DEFAULT '[]',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    residents_current INT DEFAULT 0,
    residents_limit INT DEFAULT 500,
    staff_current INT DEFAULT 0,
    storage_current_gb VARCHAR(50) DEFAULT '0 GB',
    storage_limit_gb INT DEFAULT 200,
    sms_current INT DEFAULT 0,
    sms_limit INT DEFAULT 5000,
    api_current INT DEFAULT 0,
    api_limit INT DEFAULT 500000,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS user_account_item_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(100) DEFAULT 'System Administrator',
    department VARCHAR(100) DEFAULT 'Administration',
    location VARCHAR(150) DEFAULT 'Main Campus',
    status VARCHAR(50) DEFAULT 'Active',
    last_sign_in_text VARCHAR(50) DEFAULT 'Just now',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS role_definition_item_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    users_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    category_badge VARCHAR(50) DEFAULT 'System Role',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS notification_template_item_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    category VARCHAR(100) DEFAULT 'User Management',
    channel VARCHAR(50) DEFAULT 'Email',
    trigger_event VARCHAR(100) DEFAULT '',
    status VARCHAR(50) DEFAULT 'Active',
    is_enabled BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS custom_report_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    category VARCHAR(100) DEFAULT 'Operational',
    frequency VARCHAR(50) DEFAULT 'Monthly',
    status VARCHAR(50) DEFAULT 'Active',
    last_modified_text VARCHAR(50) DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS integration_item_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    system_application VARCHAR(150) DEFAULT '',
    category VARCHAR(100) DEFAULT 'EHR',
    connection_type VARCHAR(100) DEFAULT 'REST API',
    description TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'Active',
    icon_logo VARCHAR(50) DEFAULT 'database',
    last_sync_text VARCHAR(50) DEFAULT 'Never',
    connected_on_text VARCHAR(50) DEFAULT '',
    data_sync_rate_text VARCHAR(50) DEFAULT '99.0%',
    data_last_sync_count INT DEFAULT 0,
    data_last_sync_text VARCHAR(50) DEFAULT 'Connected',
    next_sync_text VARCHAR(50) DEFAULT 'Continuous',
    endpoint_url TEXT DEFAULT '',
    auth_type VARCHAR(50) DEFAULT 'OAuth 2.0',
    sync_interval VARCHAR(50) DEFAULT 'Real-Time',
    environment VARCHAR(50) DEFAULT 'Production',
    settings_json TEXT DEFAULT '{}',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS ai_service_status_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(150) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'Healthy',
    model_version VARCHAR(50) DEFAULT 'gpt-4o',
    uptime_percentage VARCHAR(50) DEFAULT '99.9%',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

CREATE TABLE IF NOT EXISTS ai_workflow_metric_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(150) NOT NULL UNIQUE,
    requests_count INT DEFAULT 0,
    success_rate VARCHAR(50) DEFAULT '99.0%',
    avg_response_time_seconds VARCHAR(50) DEFAULT '1.2 sec',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

----------------------------------------------------
-- 3. Create Performance Indexes
----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients(name, patient_id_code, mrn);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_risk ON patients(risk_level);
CREATE INDEX IF NOT EXISTS idx_patients_primary_doctor ON patients(primary_doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);

CREATE INDEX IF NOT EXISTS idx_nurses_assigned_unit ON nurses(assigned_unit);
CREATE INDEX IF NOT EXISTS idx_nurses_status ON nurses(status);

CREATE INDEX IF NOT EXISTS idx_alerts_patient ON alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(is_acknowledged);

CREATE INDEX IF NOT EXISTS idx_tasks_patient ON tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

CREATE INDEX IF NOT EXISTS idx_care_team_doctor ON care_team_members(doctor_id);
CREATE INDEX IF NOT EXISTS idx_care_team_nurse ON care_team_members(nurse_id);

----------------------------------------------------
-- 4. Create Triggers for Auto-updating updated_date
----------------------------------------------------
DROP TRIGGER IF EXISTS trg_patients_updated ON patients;
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_doctors_updated ON doctors;
CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_nurses_updated ON nurses;
CREATE TRIGGER trg_nurses_updated BEFORE UPDATE ON nurses FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_alerts_updated ON alerts;
CREATE TRIGGER trg_alerts_updated BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_tasks_updated ON tasks;
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
