using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConnectedCare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCareUnits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "activity_summary_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    activity_type = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    details = table.Column<string>(type: "text", nullable: false),
                    related_to = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    location_unit = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    date_time_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    performed_by = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activity_summary_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ai_activity_log_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    time_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    resident_info = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    service = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_activity_log_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ai_service_status_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    model_version = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    uptime_percentage = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_service_status_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ai_workflow_metric_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    requests_count = table.Column<int>(type: "integer", nullable: false),
                    success_rate = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    avg_response_time_seconds = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    trend_data_json = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_workflow_metric_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "app_menu_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    menu_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    path = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    required_permission = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    roles_allowed_json = table.Column<string>(type: "text", nullable: false),
                    badge_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    badge_value = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_menu_items", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "app_permissions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    permission_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    module = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_permissions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "audit_log_entry_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    date_time_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    user_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    user_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    module = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    record_description = table.Column<string>(type: "text", nullable: false),
                    ip_address = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    user_details_json = table.Column<string>(type: "text", nullable: false),
                    action_details_json = table.Column<string>(type: "text", nullable: false),
                    tech_details_json = table.Column<string>(type: "text", nullable: false),
                    changes_json = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_log_entry_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LogIdCode = table.Column<string>(type: "text", nullable: false),
                    User = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    IpAddress = table.Column<string>(type: "text", nullable: false),
                    TimestampText = table.Column<string>(type: "text", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "backup_history_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    backup_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    size_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_on_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_backup_history_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "billing_invoice_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    invoice_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    date_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    amount_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_billing_invoice_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "care_plans",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_avatar = table.Column<string>(type: "text", nullable: false),
                    room_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    care_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    age_gender = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    blood_group = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    attending_doctor_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    care_team_members_count = table.Column<int>(type: "integer", nullable: false),
                    length_of_stay_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    primary_condition = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    condition_icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    plan_title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    goal_count = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    start_date_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    review_date_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    review_due_badge = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    assigned_nurse_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    assigned_nurse_avatar = table.Column<string>(type: "text", nullable: false),
                    overall_progress_percentage = table.Column<int>(type: "integer", nullable: false),
                    completed_tasks_count = table.Column<int>(type: "integer", nullable: false),
                    in_progress_tasks_count = table.Column<int>(type: "integer", nullable: false),
                    not_started_tasks_count = table.Column<int>(type: "integer", nullable: false),
                    overdue_tasks_count = table.Column<int>(type: "integer", nullable: false),
                    last_updated_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    notes_json = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_care_plans", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "care_units",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    department = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    floor = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    location_unit_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_care_units", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "chat_conversations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    participant_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    participant_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    participant_avatar = table.Column<string>(type: "text", nullable: false),
                    is_online = table.Column<bool>(type: "boolean", nullable: false),
                    last_message_text = table.Column<string>(type: "text", nullable: false),
                    last_message_time_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    unread_count = table.Column<int>(type: "integer", nullable: false),
                    is_group = table.Column<bool>(type: "boolean", nullable: false),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    shared_patient_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    shared_patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    shared_patient_room = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    shared_patient_care_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    shared_patient_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    shared_patient_avatar = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_conversations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "chat_messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    sender_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sender_avatar = table.Column<string>(type: "text", nullable: false),
                    message_text = table.Column<string>(type: "text", nullable: false),
                    time_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_me = table.Column<bool>(type: "boolean", nullable: false),
                    is_unread = table.Column<bool>(type: "boolean", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_messages", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "clinical_encounter_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    date_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    encounter_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    provider_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    reason_diagnosis = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clinical_encounter_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "consultations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_avatar = table.Column<string>(type: "text", nullable: false),
                    room_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    care_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    age_gender = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    blood_group = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    consultation_type = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    consultation_subtitle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    consultation_icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    physician_id = table.Column<Guid>(type: "uuid", nullable: true),
                    physician_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    physician_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    physician_avatar = table.Column<string>(type: "text", nullable: false),
                    date_time_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    follow_up_date_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    clinical_notes = table.Column<string>(type: "text", nullable: false),
                    is_liked = table.Column<bool>(type: "boolean", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_consultations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "custom_report_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    report_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_modified_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    frequency = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_custom_report_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "discharge_checklists",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_avatar = table.Column<string>(type: "text", nullable: false),
                    age_gender = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    blood_group = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    room_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    care_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    admit_date_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    admit_days_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    checklist_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    progress_percentage = table.Column<int>(type: "integer", nullable: false),
                    pending_items_count = table.Column<int>(type: "integer", nullable: false),
                    total_items_count = table.Column<int>(type: "integer", nullable: false),
                    completed_items_count = table.Column<int>(type: "integer", nullable: false),
                    in_progress_items_count = table.Column<int>(type: "integer", nullable: false),
                    not_started_items_count = table.Column<int>(type: "integer", nullable: false),
                    expected_discharge_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    expected_discharge_relative = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    attending_doctor_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    care_team_members_count = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_discharge_checklists", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "doctor_ai_conversations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    doctor_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    prompt_query = table.Column<string>(type: "text", nullable: false),
                    ai_response = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_doctor_ai_conversations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "doctor_consultations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    doctor_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    consultation_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    chief_complaint = table.Column<string>(type: "text", nullable: false),
                    diagnosis = table.Column<string>(type: "text", nullable: false),
                    clinical_notes = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_doctor_consultations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "DrugInteractionAlerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Count = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrugInteractionAlerts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "financial_transaction_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    date_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    reference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    customer_vendor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    amount_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_financial_transaction_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "general_app_settings_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    tagline = table.Column<string>(type: "text", nullable: false),
                    logo_url = table.Column<string>(type: "text", nullable: false),
                    primary_color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    address = table.Column<string>(type: "text", nullable: false),
                    date_format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    short_date_format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    default_language = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    time_format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    items_per_page = table.Column<int>(type: "integer", nullable: false),
                    week_starts_on = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    default_dashboard = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    allow_public_registration = table.Column<bool>(type: "boolean", nullable: false),
                    session_timeout_minutes = table.Column<int>(type: "integer", nullable: false),
                    enable_audit_logs = table.Column<bool>(type: "boolean", nullable: false),
                    password_expiry_days = table.Column<int>(type: "integer", nullable: false),
                    enable_two_factor_auth = table.Column<bool>(type: "boolean", nullable: false),
                    maintenance_mode = table.Column<bool>(type: "boolean", nullable: false),
                    weight_unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    height_unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    temperature_unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    currency = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_general_app_settings_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "integration_activity_log_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    date_time_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    integration_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    @event = table.Column<string>(name: "event", type: "character varying(150)", maxLength: 150, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    details = table.Column<string>(type: "text", nullable: false),
                    triggered_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_integration_activity_log_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "integration_item_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    system_application = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    last_sync_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    data_sync_rate_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    connection_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    connected_on_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    data_last_sync_count = table.Column<int>(type: "integer", nullable: false),
                    data_last_sync_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    next_sync_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    icon_logo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    endpoint_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    auth_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sync_interval = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    environment = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    settings_json = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_integration_item_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "localization_settings_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    default_language = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    fallback_language = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    date_format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    short_date_format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    time_format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    week_starts_on = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    time_zone = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    preview_region = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    calendar_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    supported_languages_json = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_localization_settings_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "location_units",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    avatar = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    facility = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    facility_location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    units_count = table.Column<int>(type: "integer", nullable: false),
                    beds = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    floor = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    capacity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    occupied = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    occupancy_rate = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    attention_priority = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_location_units", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "MedicationReminders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientName = table.Column<string>(type: "text", nullable: false),
                    PatientAvatar = table.Column<string>(type: "text", nullable: false),
                    MedicationName = table.Column<string>(type: "text", nullable: false),
                    DoseTimeText = table.Column<string>(type: "text", nullable: false),
                    RelativeTimeText = table.Column<string>(type: "text", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationReminders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "notification_template_item_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    channel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    trigger_event = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_template_item_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "nurse_documentations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    document_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_avatar = table.Column<string>(type: "text", nullable: false),
                    room_location = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    care_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    age_gender = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    blood_group = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    patient_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    document_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    date_time_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_by_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    created_by_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_draft = table.Column<bool>(type: "boolean", nullable: false),
                    notes_content = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nurse_documentations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "nurse_profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    employee_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    unit_ward = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    date_of_joining = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    about_me = table.Column<string>(type: "text", nullable: false),
                    avatar = table.Column<string>(type: "text", nullable: false),
                    default_unit_ward = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    default_shift = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    theme = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date_format = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    time_format = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    license_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    qualification = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    experience_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    specialization = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    certifications = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    emergency_contact_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    emergency_contact_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    home_address = table.Column<string>(type: "text", nullable: false),
                    personal_email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nurse_profiles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "nurse_reports",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    report_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    report_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    generated_by_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    generated_by_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    generated_on_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    category_tab = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    care_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    patient_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    shift = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nurse_reports", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "organization_settings_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    logo_url = table.Column<string>(type: "text", nullable: false),
                    tagline = table.Column<string>(type: "text", nullable: false),
                    primary_color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    address = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    organization_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    registration_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    established_year = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    website = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    primary_contact_person = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    primary_contact_designation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    primary_contact_email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    primary_contact_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    primary_contact_alternate_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    address_line_1 = table.Column<string>(type: "text", nullable: false),
                    address_line_2 = table.Column<string>(type: "text", nullable: false),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    state = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    pin_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    default_time_zone = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    default_language = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    default_date_format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    default_time_format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    currency = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    week_starts_on = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    enable_multi_location = table.Column<bool>(type: "boolean", nullable: false),
                    enabled_modules_json = table.Column<string>(type: "text", nullable: false),
                    latitude = table.Column<double>(type: "double precision", nullable: false),
                    longitude = table.Column<double>(type: "double precision", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_organization_settings_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "patient_care_plan_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    plan_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    start_date = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    review_date = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    progress_percentage = table.Column<int>(type: "integer", nullable: false),
                    goals_text = table.Column<string>(type: "text", nullable: false),
                    notes_text = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    prescribed_by = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_care_plan_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "patient_document_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    document_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    file_name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    document_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    file_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    uploaded_date = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    file_size_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    uploaded_by = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_document_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "role_definition_item_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    users_count = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    category_badge = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    permissions_matrix_json = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role_definition_item_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    is_system_role = table.Column<bool>(type: "boolean", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "security_settings_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    min_password_length = table.Column<int>(type: "integer", nullable: false),
                    require_uppercase = table.Column<bool>(type: "boolean", nullable: false),
                    require_lowercase = table.Column<bool>(type: "boolean", nullable: false),
                    require_numbers = table.Column<bool>(type: "boolean", nullable: false),
                    require_special_chars = table.Column<bool>(type: "boolean", nullable: false),
                    password_expiry_days = table.Column<int>(type: "integer", nullable: false),
                    enable_mfa_for = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    mfa_authenticator_app = table.Column<bool>(type: "boolean", nullable: false),
                    mfa_sms_verification = table.Column<bool>(type: "boolean", nullable: false),
                    mfa_email_verification = table.Column<bool>(type: "boolean", nullable: false),
                    remember_mfa_days = table.Column<int>(type: "integer", nullable: false),
                    session_timeout_minutes = table.Column<int>(type: "integer", nullable: false),
                    idle_timeout_minutes = table.Column<int>(type: "integer", nullable: false),
                    force_logout_on_password_change = table.Column<bool>(type: "boolean", nullable: false),
                    allow_multiple_active_sessions = table.Column<bool>(type: "boolean", nullable: false),
                    lockout_threshold = table.Column<int>(type: "integer", nullable: false),
                    lockout_duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    prevent_user_enumeration = table.Column<bool>(type: "boolean", nullable: false),
                    require_email_verification = table.Column<bool>(type: "boolean", nullable: false),
                    restrict_login_to_registered_devices = table.Column<bool>(type: "boolean", nullable: false),
                    allow_password_reset = table.Column<bool>(type: "boolean", nullable: false),
                    restrict_specific_ips = table.Column<bool>(type: "boolean", nullable: false),
                    allowed_ips_json = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_security_settings_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "shift_handover_patient_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    handover_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_avatar = table.Column<string>(type: "text", nullable: false),
                    age_gender = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    room_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    care_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    condition_status = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    condition_subtitle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    pending_tasks_count = table.Column<int>(type: "integer", nullable: false),
                    special_instructions = table.Column<string>(type: "text", nullable: false),
                    priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shift_handover_patient_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "shift_handovers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    handover_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    current_shift = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    handover_to_shift = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    outgoing_nurse_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    outgoing_nurse_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    outgoing_nurse_avatar = table.Column<string>(type: "text", nullable: false),
                    incoming_nurse_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    incoming_nurse_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    incoming_nurse_avatar = table.Column<string>(type: "text", nullable: false),
                    patients_assigned_count = table.Column<int>(type: "integer", nullable: false),
                    high_priority_patients_count = table.Column<int>(type: "integer", nullable: false),
                    pending_tasks_count = table.Column<int>(type: "integer", nullable: false),
                    new_alerts_count = table.Column<int>(type: "integer", nullable: false),
                    completed_sections_count = table.Column<int>(type: "integer", nullable: false),
                    total_sections_count = table.Column<int>(type: "integer", nullable: false),
                    completion_percentage = table.Column<int>(type: "integer", nullable: false),
                    handover_notes = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    handover_date_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    handover_time_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shift_handovers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subscription_plan_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    current_plan_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    renewal_date_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    amount_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    payment_method = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    residents_current = table.Column<int>(type: "integer", nullable: false),
                    residents_limit = table.Column<int>(type: "integer", nullable: false),
                    staff_current = table.Column<int>(type: "integer", nullable: false),
                    storage_current_gb = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    storage_limit_gb = table.Column<int>(type: "integer", nullable: false),
                    sms_current = table.Column<int>(type: "integer", nullable: false),
                    sms_limit = table.Column<int>(type: "integer", nullable: false),
                    api_current = table.Column<int>(type: "integer", nullable: false),
                    api_limit = table.Column<int>(type: "integer", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_subscription_plan_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "system_config_toggle_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    config_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    config_label = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_config_toggle_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "SystemIntegrations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    SystemType = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    LastSyncTime = table.Column<string>(type: "text", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemIntegrations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "user_account_item_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    last_sign_in_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    avatar = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_account_item_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    password_salt = table.Column<string>(type: "text", nullable: false),
                    full_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    avatar = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "UserSettingsRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationName = table.Column<string>(type: "text", nullable: false),
                    TimeZone = table.Column<string>(type: "text", nullable: false),
                    DateFormat = table.Column<string>(type: "text", nullable: false),
                    TimeFormat = table.Column<string>(type: "text", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    ItemsPerPage = table.Column<int>(type: "integer", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSettingsRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "vital_rounds",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_avatar = table.Column<string>(type: "text", nullable: false),
                    age_gender = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    blood_group = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    room_bed = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    care_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    patient_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    attending_doctor_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    care_team_members_count = table.Column<int>(type: "integer", nullable: false),
                    length_of_stay_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    last_round_time_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    last_round_date_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    recorded_by_nurse_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    next_due_time_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    next_due_relative_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    blood_pressure = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    heart_rate = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    temperature = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    spo2 = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    respiratory_rate = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    pain_score = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vital_rounds", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "role_permission",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    permission_id = table.Column<Guid>(type: "uuid", nullable: true),
                    permission_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    permission_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role_permission", x => x.id);
                    table.ForeignKey(
                        name: "FK_role_permission_app_permissions_permission_id",
                        column: x => x.permission_id,
                        principalTable: "app_permissions",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_role_permission_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "doctors",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    doctor_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    avatar = table.Column<string>(type: "text", nullable: false),
                    specialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    specialty_icon = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    experience = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    teleconsultation_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_doctors", x => x.id);
                    table.ForeignKey(
                        name: "FK_doctors_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "nurses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    nurse_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    avatar = table.Column<string>(type: "text", nullable: false),
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sub_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    shift = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    assigned_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    experience = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nurses", x => x.id);
                    table.ForeignKey(
                        name: "FK_nurses_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_role",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_role", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_role_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_role_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patients",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    mrn = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    avatar = table.Column<string>(type: "text", nullable: true),
                    dob = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    gender = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    age_gender = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    blood_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    marital_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    state = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    zip_code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    care_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    floor_room = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    emergency_contact_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    emergency_contact_relationship = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    emergency_contact_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    emergency_contact_is_primary = table.Column<bool>(type: "boolean", nullable: false),
                    medical_conditions = table.Column<string>(type: "text", nullable: false),
                    allergies = table.Column<string>(type: "text", nullable: false),
                    current_medications = table.Column<string>(type: "text", nullable: false),
                    past_medical_history = table.Column<string>(type: "text", nullable: false),
                    insurance_provider = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    insurance_policy_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    insurance_group_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    insurance_valid_until = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    additional_notes = table.Column<string>(type: "text", nullable: false),
                    primary_doctor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    primary_doctor_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    primary_doctor_specialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    primary_doctor_avatar = table.Column<string>(type: "text", nullable: false),
                    assigned_nurse_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_nurse_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    risk_level = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    last_visit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    admission_date = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    care_days = table.Column<int>(type: "integer", nullable: false),
                    discharge_plan = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    blood_pressure = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    heart_rate = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    blood_sugar = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    temperature = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    spo2 = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patients", x => x.id);
                    table.ForeignKey(
                        name: "FK_patients_doctors_primary_doctor_id",
                        column: x => x.primary_doctor_id,
                        principalTable: "doctors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "alerts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    alert_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    recipient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    recipient_role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_avatar = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    severity = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    room_location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    reported_by = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    reported_by_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    trigger_condition = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    timestamp_text = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_acknowledged = table.Column<bool>(type: "boolean", nullable: false),
                    care_unit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    age_gender = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    blood_group = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    patient_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    detected_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_alerts", x => x.id);
                    table.ForeignKey(
                        name: "FK_alerts_patients_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "care_team_members",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    member_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    avatar = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    shift = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    nurse_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_care_team_members", x => x.id);
                    table.ForeignKey(
                        name: "FK_care_team_members_doctors_doctor_id",
                        column: x => x.doctor_id,
                        principalTable: "doctors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_care_team_members_nurses_nurse_id",
                        column: x => x.nurse_id,
                        principalTable: "nurses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_care_team_members_patients_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "medication_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    medication_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    form = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_avatar = table.Column<string>(type: "text", nullable: false),
                    dosage = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    route = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    frequency = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    next_dose_time = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    relative_time_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    prescribed_by = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    prescribed_by_specialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    batch = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    expiry_date_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    days_left_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    adherence_percentage = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    active_prescriptions = table.Column<int>(type: "integer", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medication_records", x => x.id);
                    table.ForeignKey(
                        name: "FK_medication_records_patients_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patients",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "patient_doctors",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false),
                    assigned_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_doctors", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_doctors_doctors_doctor_id",
                        column: x => x.doctor_id,
                        principalTable: "doctors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_patient_doctors_patients_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patient_nurses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nurse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false),
                    assigned_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    shift = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_nurses", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_nurses_nurses_nurse_id",
                        column: x => x.nurse_id,
                        principalTable: "nurses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_patient_nurses_patients_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tasks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_id_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    patient_avatar = table.Column<string>(type: "text", nullable: false),
                    task_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    priority = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    assigned_caregiver = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    assignee_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    assignee_avatar = table.Column<string>(type: "text", nullable: false),
                    due_time = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_overdue = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    status_str = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tasks", x => x.id);
                    table.ForeignKey(
                        name: "FK_tasks_patients_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "medication_administrations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    medication_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nurse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    administered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medication_administrations", x => x.id);
                    table.ForeignKey(
                        name: "FK_medication_administrations_medication_records_medication_id",
                        column: x => x.medication_id,
                        principalTable: "medication_records",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_medication_administrations_nurses_nurse_id",
                        column: x => x.nurse_id,
                        principalTable: "nurses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_medication_administrations_patients_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_alerts_alert_id_code",
                table: "alerts",
                column: "alert_id_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_alerts_patient_id",
                table: "alerts",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_care_team_members_doctor_id",
                table: "care_team_members",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_care_team_members_member_id_code",
                table: "care_team_members",
                column: "member_id_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_care_team_members_nurse_id",
                table: "care_team_members",
                column: "nurse_id");

            migrationBuilder.CreateIndex(
                name: "IX_care_team_members_patient_id",
                table: "care_team_members",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_care_units_code",
                table: "care_units",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_care_units_name_is_active",
                table: "care_units",
                columns: new[] { "name", "is_active" });

            migrationBuilder.CreateIndex(
                name: "IX_doctors_doctor_id_code",
                table: "doctors",
                column: "doctor_id_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_doctors_email",
                table: "doctors",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_doctors_user_id",
                table: "doctors",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_location_units_name",
                table: "location_units",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_medication_administrations_medication_id",
                table: "medication_administrations",
                column: "medication_id");

            migrationBuilder.CreateIndex(
                name: "IX_medication_administrations_nurse_id",
                table: "medication_administrations",
                column: "nurse_id");

            migrationBuilder.CreateIndex(
                name: "IX_medication_administrations_patient_id",
                table: "medication_administrations",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_medication_records_patient_id",
                table: "medication_records",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_nurses_email",
                table: "nurses",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_nurses_nurse_id_code",
                table: "nurses",
                column: "nurse_id_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_nurses_user_id",
                table: "nurses",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_patient_doctors_doctor_id",
                table: "patient_doctors",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_doctors_patient_id_doctor_id",
                table: "patient_doctors",
                columns: new[] { "patient_id", "doctor_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_patient_nurses_nurse_id",
                table: "patient_nurses",
                column: "nurse_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_nurses_patient_id_nurse_id",
                table: "patient_nurses",
                columns: new[] { "patient_id", "nurse_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_patients_mrn",
                table: "patients",
                column: "mrn",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_patients_patient_id_code",
                table: "patients",
                column: "patient_id_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_patients_primary_doctor_id",
                table: "patients",
                column: "primary_doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_role_permission_permission_id",
                table: "role_permission",
                column: "permission_id");

            migrationBuilder.CreateIndex(
                name: "IX_role_permission_role_id",
                table: "role_permission",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_patient_id",
                table: "tasks",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_task_id_code",
                table: "tasks",
                column: "task_id_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_role_role_id",
                table: "user_role",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_role_user_id_role_id",
                table: "user_role",
                columns: new[] { "user_id", "role_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "activity_summary_logs");

            migrationBuilder.DropTable(
                name: "ai_activity_log_records");

            migrationBuilder.DropTable(
                name: "ai_service_status_records");

            migrationBuilder.DropTable(
                name: "ai_workflow_metric_records");

            migrationBuilder.DropTable(
                name: "alerts");

            migrationBuilder.DropTable(
                name: "app_menu_items");

            migrationBuilder.DropTable(
                name: "audit_log_entry_records");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "backup_history_records");

            migrationBuilder.DropTable(
                name: "billing_invoice_records");

            migrationBuilder.DropTable(
                name: "care_plans");

            migrationBuilder.DropTable(
                name: "care_team_members");

            migrationBuilder.DropTable(
                name: "care_units");

            migrationBuilder.DropTable(
                name: "chat_conversations");

            migrationBuilder.DropTable(
                name: "chat_messages");

            migrationBuilder.DropTable(
                name: "clinical_encounter_records");

            migrationBuilder.DropTable(
                name: "consultations");

            migrationBuilder.DropTable(
                name: "custom_report_records");

            migrationBuilder.DropTable(
                name: "discharge_checklists");

            migrationBuilder.DropTable(
                name: "doctor_ai_conversations");

            migrationBuilder.DropTable(
                name: "doctor_consultations");

            migrationBuilder.DropTable(
                name: "DrugInteractionAlerts");

            migrationBuilder.DropTable(
                name: "financial_transaction_records");

            migrationBuilder.DropTable(
                name: "general_app_settings_records");

            migrationBuilder.DropTable(
                name: "integration_activity_log_records");

            migrationBuilder.DropTable(
                name: "integration_item_records");

            migrationBuilder.DropTable(
                name: "localization_settings_records");

            migrationBuilder.DropTable(
                name: "location_units");

            migrationBuilder.DropTable(
                name: "medication_administrations");

            migrationBuilder.DropTable(
                name: "MedicationReminders");

            migrationBuilder.DropTable(
                name: "notification_template_item_records");

            migrationBuilder.DropTable(
                name: "nurse_documentations");

            migrationBuilder.DropTable(
                name: "nurse_profiles");

            migrationBuilder.DropTable(
                name: "nurse_reports");

            migrationBuilder.DropTable(
                name: "organization_settings_records");

            migrationBuilder.DropTable(
                name: "patient_care_plan_records");

            migrationBuilder.DropTable(
                name: "patient_doctors");

            migrationBuilder.DropTable(
                name: "patient_document_records");

            migrationBuilder.DropTable(
                name: "patient_nurses");

            migrationBuilder.DropTable(
                name: "role_definition_item_records");

            migrationBuilder.DropTable(
                name: "role_permission");

            migrationBuilder.DropTable(
                name: "security_settings_records");

            migrationBuilder.DropTable(
                name: "shift_handover_patient_records");

            migrationBuilder.DropTable(
                name: "shift_handovers");

            migrationBuilder.DropTable(
                name: "subscription_plan_records");

            migrationBuilder.DropTable(
                name: "system_config_toggle_records");

            migrationBuilder.DropTable(
                name: "SystemIntegrations");

            migrationBuilder.DropTable(
                name: "tasks");

            migrationBuilder.DropTable(
                name: "user_account_item_records");

            migrationBuilder.DropTable(
                name: "user_role");

            migrationBuilder.DropTable(
                name: "UserSettingsRecords");

            migrationBuilder.DropTable(
                name: "vital_rounds");

            migrationBuilder.DropTable(
                name: "medication_records");

            migrationBuilder.DropTable(
                name: "nurses");

            migrationBuilder.DropTable(
                name: "app_permissions");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "patients");

            migrationBuilder.DropTable(
                name: "doctors");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
