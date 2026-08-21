using System;
using System.Collections.Generic;
using ConnectedCare.Domain.Enums;

namespace ConnectedCare.Application.Features.NurseApp.DTOs;

// --- Discharge Checklist DTOs ---
public class DischargeChecklistSummaryDto
{
    public int TotalPatients { get; set; } = 21;
    public int InProgress { get; set; } = 7;
    public int ReadyForDischarge { get; set; } = 9;
    public int PendingItems { get; set; } = 3;
    public int DischargedToday { get; set; } = 2;
}

public class DischargeChecklistDto
{
    public Guid Id { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AdmitDateText { get; set; } = string.Empty;
    public string AdmitDaysText { get; set; } = string.Empty;
    public string ChecklistStatus { get; set; } = "InProgress";
    public int ProgressPercentage { get; set; } = 70;
    public int PendingItemsCount { get; set; } = 2;
    public int TotalItemsCount { get; set; } = 14;
    public int CompletedItemsCount { get; set; } = 7;
    public int InProgressItemsCount { get; set; } = 4;
    public int NotStartedItemsCount { get; set; } = 1;
    public string ExpectedDischargeText { get; set; } = string.Empty;
    public string ExpectedDischargeRelative { get; set; } = "Today";
    public string AttendingDoctorName { get; set; } = "Dr. Sarah Wilson";
    public int CareTeamMembersCount { get; set; } = 3;
    public string Notes { get; set; } = string.Empty;
}

public class CreateDischargeChecklistDto
{
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AdmitDateText { get; set; } = string.Empty;
    public string ExpectedDischargeText { get; set; } = string.Empty;
    public string AttendingDoctorName { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

// --- Consultations DTOs ---
public class ConsultationSummaryDto
{
    public int TotalConsultations { get; set; } = 18;
    public int Completed { get; set; } = 6;
    public int InProgress { get; set; } = 7;
    public int Scheduled { get; set; } = 4;
    public int FollowUpDue { get; set; } = 1;
}

public class ConsultationDto
{
    public Guid Id { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string ConsultationType { get; set; } = string.Empty;
    public string ConsultationSubtitle { get; set; } = string.Empty;
    public string ConsultationIcon { get; set; } = "HeartPulse";
    public Guid? PhysicianId { get; set; }
    public string PhysicianName { get; set; } = string.Empty;
    public string PhysicianRole { get; set; } = "Cardiologist";
    public string PhysicianAvatar { get; set; } = string.Empty;
    public string DateTimeText { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "InProgress";
    public string FollowUpDateText { get; set; } = string.Empty;
    public string ClinicalNotes { get; set; } = string.Empty;
}

public class CreateConsultationDto
{
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string ConsultationType { get; set; } = string.Empty;
    public string PhysicianName { get; set; } = string.Empty;
    public string DateTimeText { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string FollowUpDateText { get; set; } = string.Empty;
}

// --- Care Plans DTOs ---
public class CarePlanSummaryDto
{
    public int TotalCarePlans { get; set; } = 28;
    public int ActivePlans { get; set; } = 16;
    public int ReviewDue { get; set; } = 6;
    public int Completed { get; set; } = 4;
    public int DraftPlans { get; set; } = 2;
}

public class CarePlanDto
{
    public Guid Id { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string AttendingDoctorName { get; set; } = "Dr. Sarah Wilson";
    public int CareTeamMembersCount { get; set; } = 3;
    public string LengthOfStayText { get; set; } = "4 Days";
    public string PrimaryCondition { get; set; } = string.Empty;
    public string ConditionIcon { get; set; } = "Heart";
    public string PlanTitle { get; set; } = string.Empty;
    public int GoalCount { get; set; } = 6;
    public string Status { get; set; } = "Active";
    public string StartDateText { get; set; } = string.Empty;
    public string ReviewDateText { get; set; } = string.Empty;
    public string ReviewDueBadge { get; set; } = "5 days left";
    public string AssignedNurseName { get; set; } = "Emma Johnson";
    public string AssignedNurseAvatar { get; set; } = string.Empty;
    public int OverallProgressPercentage { get; set; } = 78;
    public int CompletedTasksCount { get; set; } = 14;
    public int InProgressTasksCount { get; set; } = 8;
    public int NotStartedTasksCount { get; set; } = 4;
    public int OverdueTasksCount { get; set; } = 2;
    public string LastUpdatedText { get; set; } = "May 22, 2024 10:30 AM";
    public string NotesJson { get; set; } = "[]";
}

public class CreateCarePlanDto
{
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PrimaryCondition { get; set; } = string.Empty;
    public string PlanTitle { get; set; } = string.Empty;
    public int GoalCount { get; set; } = 5;
    public string StartDateText { get; set; } = string.Empty;
    public string ReviewDateText { get; set; } = string.Empty;
    public string AssignedNurseName { get; set; } = string.Empty;
}

public class AddCarePlanNoteDto
{
    public string NoteText { get; set; } = string.Empty;
}

// --- Vital Rounds DTOs ---
public class VitalRoundSummaryDto
{
    public int TotalPatients { get; set; } = 24;
    public int InpatientsCount { get; set; } = 12;
    public int OutpatientsCount { get; set; } = 12;
    public int Completed { get; set; } = 18;
    public int Pending { get; set; } = 4;
    public int Overdue { get; set; } = 2;
    public int OnTimeCount { get; set; } = 16;
    public int CompletedLateCount { get; set; } = 2;
    public string AverageCompletionTime { get; set; } = "5m 20s";
}

public class VitalRoundDto
{
    public Guid Id { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientIdCode { get; set; } = string.Empty;
    public string PatientAvatar { get; set; } = string.Empty;
    public string AgeGender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "A+";
    public string RoomBed { get; set; } = string.Empty;
    public string CareUnit { get; set; } = string.Empty;
    public string PatientType { get; set; } = "Inpatient";
    public string AttendingDoctorName { get; set; } = "Dr. Sarah Wilson";
    public int CareTeamMembersCount { get; set; } = 3;
    public string LengthOfStayText { get; set; } = "4 Days";
    public string LastRoundTimeText { get; set; } = "08:00 AM";
    public string LastRoundDateText { get; set; } = "May 22, 2024";
    public string RecordedByNurseName { get; set; } = "Emma Johnson";
    public string NextDueTimeText { get; set; } = "12:00 PM";
    public string NextDueRelativeText { get; set; } = "Due in 1h 15m";
    public string Status { get; set; } = "Pending";
    public string BloodPressure { get; set; } = "120/80 mmHg";
    public string HeartRate { get; set; } = "82 bpm";
    public string Temperature { get; set; } = "98.6 °F";
    public string SpO2 { get; set; } = "98 %";
    public string RespiratoryRate { get; set; } = "18 /min";
    public string PainScore { get; set; } = "2/10";
}

public class CreateVitalRoundDto
{
    public Guid PatientId { get; set; }
    public Guid NurseId { get; set; }
}

public class RecordVitalsDto
{
    public string BloodPressure { get; set; } = "120/80 mmHg";
    public string HeartRate { get; set; } = "82 bpm";
    public string Temperature { get; set; } = "98.6 °F";
    public string SpO2 { get; set; } = "98 %";
    public string RespiratoryRate { get; set; } = "18 /min";
    public string PainScore { get; set; } = "2/10";
    public string NurseName { get; set; } = "Emma Johnson";
}
