-- ConnectCare Complete Database Schema for PostgreSQL
-- Server: ConnectCare | Port: 4532 | Database: ConnectCare

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
    nurse_id_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    shift VARCHAR(100) NOT NULL,
    assigned_unit VARCHAR(100) NOT NULL,
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
    age_gender VARCHAR(50) DEFAULT '',
    phone VARCHAR(30) DEFAULT '',
    email VARCHAR(150) DEFAULT '',
    address VARCHAR(250) DEFAULT '',
    care_unit VARCHAR(100) NOT NULL,
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
    name VARCHAR(150) NOT NULL UNIQUE,
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

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id_code VARCHAR(50) NOT NULL UNIQUE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) NOT NULL,
    room_location VARCHAR(150) DEFAULT '',
    severity VARCHAR(30) NOT NULL DEFAULT 'Medium',
    trigger_condition VARCHAR(250) NOT NULL,
    timestamp_text VARCHAR(50) DEFAULT '',
    is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
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
    priority VARCHAR(30) NOT NULL DEFAULT 'Medium',
    due_time VARCHAR(50) DEFAULT '',
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Medication Records Table
CREATE TABLE IF NOT EXISTS medication_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) DEFAULT '',
    adherence_percentage VARCHAR(20) DEFAULT '95%',
    active_prescriptions INT NOT NULL DEFAULT 100,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- System Integrations Table
CREATE TABLE IF NOT EXISTS system_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    system_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Connected',
    last_sync_time VARCHAR(100) DEFAULT 'Just now',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_id_code VARCHAR(50) NOT NULL UNIQUE,
    "user" VARCHAR(150) NOT NULL,
    role VARCHAR(100) DEFAULT '',
    action VARCHAR(250) NOT NULL,
    ip_address VARCHAR(50) DEFAULT '',
    timestamp_text VARCHAR(50) DEFAULT '',
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System',
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'System'
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'System Administrator',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
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

----------------------------------------------------
-- 5. Create PostgreSQL Views
----------------------------------------------------
CREATE OR REPLACE VIEW v_patient_overview AS
SELECT 
    p.id AS patient_id,
    p.patient_id_code,
    p.mrn,
    p.name AS patient_name,
    p.status AS patient_status,
    p.risk_level,
    p.care_unit,
    p.floor_room,
    d.name AS primary_doctor_name,
    d.specialty AS primary_doctor_specialty,
    (SELECT COUNT(*) FROM alerts a WHERE a.patient_id = p.id AND a.is_acknowledged = FALSE) AS active_alerts_count
FROM patients p
LEFT JOIN doctors d ON p.primary_doctor_id = d.id;

CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT 
    (SELECT COUNT(*) FROM patients) AS total_patients,
    (SELECT COUNT(*) FROM alerts WHERE is_acknowledged = FALSE) AS active_alerts,
    (SELECT COUNT(*) FROM alerts WHERE severity = 'Critical' AND is_acknowledged = FALSE) AS critical_alerts,
    (SELECT COUNT(*) FROM care_team_members WHERE status = 'Active') AS active_care_teams,
    (SELECT COUNT(*) FROM tasks WHERE status != 'Completed') AS open_tasks;

----------------------------------------------------
-- 6. Create PostgreSQL Functions & Procedures
----------------------------------------------------

-- Function to acknowledge an alert
CREATE OR REPLACE FUNCTION fn_acknowledge_alert(p_alert_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated INT;
BEGIN
    UPDATE alerts 
    SET is_acknowledged = TRUE, updated_date = CURRENT_TIMESTAMP 
    WHERE id = p_alert_id;
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get patient vitals summary
CREATE OR REPLACE FUNCTION fn_get_patient_vitals(p_patient_id UUID)
RETURNS TABLE (
    patient_id UUID,
    blood_pressure VARCHAR,
    heart_rate VARCHAR,
    blood_sugar VARCHAR,
    temperature VARCHAR,
    spo2 VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT id, p.blood_pressure, p.heart_rate, p.blood_sugar, p.temperature, p.spo2
    FROM patients p
    WHERE p.id = p_patient_id;
END;
$$ LANGUAGE plpgsql;
