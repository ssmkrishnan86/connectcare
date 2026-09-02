# ConnectCare Database Cleanup & Reset Guide

This guide describes how to clear all transactional, clinical, patient, and log records from the PostgreSQL database connected to **https://connectcare-0k4a.onrender.com/**, while preserving the **System Administrator account**, **Master Roles**, **Permissions Catalog**, and **App Master Settings**.

---

## 🛡️ What is Preserved vs What is Cleared

### ✅ Preserved (Admin & Master Data)
- **Administrator Account**: `admin` / `admin@connectcare.org` (password: `admin123` or your current admin password).
- **Master Roles**: `Admin`, `Doctor`, `Nurse`, etc. (`roles` & `app_roles`).
- **Permissions**: Full permissions matrix (`app_permissions` & `role_permission`).
- **App Menu Navigation**: Master navigation routes (`app_menu_items`).
- **System Master Settings**:
  - Organization branding & contact (`organization_settings_records`)
  - General app configuration (`general_app_settings_records`)
  - Localization & supported languages (`localization_settings_records`)
  - Security policies & MFA settings (`security_settings_records`)
  - Subscription plan details (`subscription_plan_records`)
  - System toggles & integrations (`system_config_toggle_records`, `integration_item_records`)
  - Role definition templates (`role_definition_item_records`)
  - Notification templates (`notification_template_item_records`)
  - AI services & model configuration (`ai_settings_records`, `ai_service_status_records`)

### 🗑️ Cleared (Transactional & Clinical Data)
- Patients & Bed allocations (`patients`, `patient_doctors`, `patient_nurses`, `care_team_members`, `location_units`, `care_units`)
- Clinical records (`vital_rounds`, `medication_records`, `medication_administrations`, `consultations`, `doctor_consultations`, `care_plans`, `discharge_checklists`, `shift_handovers`, `nurse_documentations`, `nurse_reports`, `patient_document_records`, `clinical_encounter_records`)
- Non-admin staff & accounts (`doctors`, `nurses`, `nurse_profiles`, non-admin users)
- Operational items (`tasks`, `alerts`, `drug_interaction_alerts`, `medication_reminders`)
- Messages & Notifications (`chat_conversations`, `chat_messages`, `notifications`)
- Logs & AI conversations (`audit_logs`, `audit_log_entry_records`, `activity_summary_logs`, `doctor_ai_conversations`, `ai_patient_summary_records`, `ai_care_priority_records`, `ai_discharge_review_records`, `ai_feedback_records`, `ai_audit_entry_records`)
- Financial & backups (`billing_invoice_records`, `financial_transaction_records`, `custom_report_records`, `backup_history_records`)

---

## 🚀 How to Run the Cleanup

You have 4 easy options to execute the cleanup:

---

### Option 1: Node.js Runner (Recommended)

1. Open your terminal in the repository root directory:
   ```bash
   cd c:\VenSun\ConnectCare
   ```

2. Run the Node.js cleanup script:
   ```bash
   node scripts/clear-database.js
   ```

3. When prompted, paste your Render **External Database URL** (found in [Render Dashboard](https://dashboard.render.com/) → `connectcare-db` → **External Database URL**):
   ```
   postgres://connectcare_user:xxxxxx@dpg-xxxxxx.oregon-postgres.render.com/connectcare
   ```

4. Type `YES` to confirm.

> **One-liner execution (Automated):**
> ```bash
> node scripts/clear-database.js "postgres://connectcare_user:xxxxxx@dpg-xxxxxx.oregon-postgres.render.com/connectcare" --yes
> ```

---

### Option 2: PowerShell Runner (Windows)

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd c:\VenSun\ConnectCare
   ```

2. Run:
   ```powershell
   .\scripts\clear-database.ps1
   ```
   Or pass the URL directly:
   ```powershell
   .\scripts\clear-database.ps1 -DatabaseUrl "postgres://connectcare_user:xxxxxx@dpg-xxxxxx.oregon-postgres.render.com/connectcare" -Force
   ```

---

### Option 3: Direct SQL in Render Dashboard (Web Shell / psql)

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click on your database service: **`connectcare-db`**.
3. In the left sidebar or top tabs, open **Shell** or use **psql** from your local terminal:
   ```bash
   psql "postgres://connectcare_user:xxxxxx@dpg-xxxxxx.oregon-postgres.render.com/connectcare" -f scripts/clear-database.sql
   ```
4. Or open [`scripts/clear-database.sql`](clear-database.sql), copy its contents, and paste it into any SQL client (pgAdmin, DBeaver, or Render Web Shell).

---

### Option 4: Admin REST API Endpoint

If your backend is running, you can also trigger the cleanup via HTTP POST:

- **Endpoint**: `POST https://connectcare-0k4a.onrender.com/api/settings/maintenance/clear-database`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer <ADMIN_JWT_TOKEN>
  ```
- **Body**:
  ```json
  {
    "confirmationCode": "CLEAR_TRANSACTIONAL_DATA"
  }
  ```

---

## 🔑 Post-Cleanup Login

Once the cleanup completes, log into the web application at **https://connectcare-0k4a.onrender.com/**:

- **Username**: `admin`
- **Password**: `admin123` (or your previous admin password)
- **Role**: System Administrator (Full Access)
