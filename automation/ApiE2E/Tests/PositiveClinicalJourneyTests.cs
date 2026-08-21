using System.Net;
using System.Text.Json;
using ConnectCare.AutomationTests.Helpers;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ConnectCare.AutomationTests.Tests;

[TestClass]
[TestCategory("E2E")]
[TestCategory("PositiveFlow")]
public class PositiveClinicalJourneyTests
{
    private ApiClient _api = null!;
    private AuthHelper _auth = null!;

    [TestInitialize]
    public void Initialize()
    {
        _api = new ApiClient(
            TestSettings.Get("BaseUrl", "http://localhost"),
            TestSettings.Get("Host", "connectcare.vensunsoftware.com"));
        _auth = new AuthHelper(_api);
    }

    [TestMethod]
    public async Task E2E_99_Full_Positive_Journey()
    {
        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");
        Console.WriteLine($"Starting ConnectCare E2E positive journey: {unique}");

        // 1. Admin login
        await LoginAdmin();

        Console.WriteLine("STEP 2: Create patient");
        // 2. Patient creation
        var patientResponse = await _api.PostAsync("api/patients", new
        {
            patientIdCode = $"AUTO-{unique}",
            mrn = $"MRN-AUTO-{unique}",
            name = $"Automation Patient {unique}",
            firstName = "Automation",
            lastName = $"Patient{unique}",
            dob = "01/15/1985",
            gender = "Male",
            bloodType = "O+",
            maritalStatus = "Married",
            phone = "5550101000",
            email = $"automation.{unique}@example.test",
            address = "100 Test Street",
            city = "Test City",
            state = "CA",
            zipCode = "90001",
            country = "USA",
            careUnit = "General Ward",
            floorRoom = "AUTO-101",
            emergencyContactName = "Test Contact",
            emergencyContactRelationship = "Spouse",
            emergencyContactPhone = "5550101001",
            emergencyContactIsPrimary = true,
            allergies = "No Known Allergies",
            insuranceProvider = "Test Health Plan",
            insurancePolicyNumber = $"AUTO-POL-{unique}",
            insuranceGroupNumber = "AUTO-GRP",
            insuranceValidUntil = "12/31/2030",
            additionalNotes = "Created by automated positive-flow test."
        });
        Assert.AreEqual(HttpStatusCode.Created, patientResponse.Status, patientResponse.Body.RootElement.ToString());
        var patient = ApiClient.Data(patientResponse.Body);
        var patientId = Guid.Parse(ApiClient.String(patient, "id")!);
        var patientCode = ApiClient.String(patient, "patientIdCode")!;
        Assert.IsFalse(string.IsNullOrWhiteSpace(patientCode));

        Console.WriteLine("STEP 3: Create doctor");
        // 3. Doctor creation
        var doctorResponse = await _api.PostAsync("api/doctors", new
        {
            doctorIdCode = $"AUTO-DOC-{unique}",
            name = $"Automation Doctor {unique}",
            specialty = "General Medicine",
            department = "Medicine",
            location = "Test Hospital",
            phone = "5550102000",
            email = $"doctor.{unique}@example.test",
            status = "Active",
            experience = "10 Years",
            teleconsultationEnabled = true
        });
        Assert.AreEqual(HttpStatusCode.OK, doctorResponse.Status, doctorResponse.Body.RootElement.ToString());
        var doctor = ApiClient.Data(doctorResponse.Body);
        var doctorId = Guid.Parse(ApiClient.String(doctor, "id")!);
        var doctorName = ApiClient.String(doctor, "name")!;

        Console.WriteLine("STEP 4: Create nurse");
        // 4. Nurse creation
        var nurseResponse = await _api.PostAsync("api/nurses", new
        {
            nurseIdCode = $"AUTO-NUR-{unique}",
            name = $"Automation Nurse {unique}",
            department = "General Medicine",
            subUnit = "General Ward",
            location = "Test Hospital",
            shift = "Day Shift",
            assignedUnit = "General Ward",
            phone = "5550103000",
            email = $"nurse.{unique}@example.test",
            status = "Active",
            experience = "5 Years"
        });
        Assert.AreEqual(HttpStatusCode.OK, nurseResponse.Status, nurseResponse.Body.RootElement.ToString());
        var nurse = ApiClient.Data(nurseResponse.Body);
        var nurseId = Guid.Parse(ApiClient.String(nurse, "id")!);
        var nurseName = ApiClient.String(nurse, "name")!;

        Console.WriteLine("STEP 5: Assign doctor");
        // 5. Assign doctor to patient
        await LoginAdmin();
        var doctorAssignment = await _api.PostAsync("api/careteams/assign", new
        {
            patientId,
            providerId = doctorId,
            role = "Doctor"
        });
        Assert.AreEqual(HttpStatusCode.OK, doctorAssignment.Status, doctorAssignment.Body.RootElement.ToString());

        // 6. Assign nurse to patient
        var nurseAssignment = await _api.PostAsync("api/careteams/assign", new
        {
            patientId,
            providerId = nurseId,
            role = "Nurse"
        });
        Assert.AreEqual(HttpStatusCode.OK, nurseAssignment.Status, nurseAssignment.Body.RootElement.ToString());

        var careTeam = await _api.GetAsync($"api/careteams?patientId={patientId}");
        Assert.AreEqual(HttpStatusCode.OK, careTeam.Status, careTeam.Body.RootElement.ToString());
        var careTeamData = ApiClient.Data(careTeam.Body);
        Assert.IsTrue(careTeamData.EnumerateArray().Any(x => ApiClient.String(x, "doctorId") == doctorId.ToString()));
        Assert.IsTrue(careTeamData.EnumerateArray().Any(x => ApiClient.String(x, "nurseId") == nurseId.ToString()));

        Console.WriteLine("STEP 7: Doctor diagnosis");
        // 7. Doctor diagnosis
        await LoginDoctor();
        var diagnosisResponse = await _api.PostAsync("api/diagnoses", new
        {
            patientId,
            doctorId,
            diagnosis = "Community acquired pneumonia",
            clinicalNotes = "Positive-flow automation diagnosis."
        });
        Assert.AreEqual(HttpStatusCode.Created, diagnosisResponse.Status, diagnosisResponse.Body.RootElement.ToString());
        var diagnosis = ApiClient.Data(diagnosisResponse.Body);
        var diagnosisId = Guid.Parse(ApiClient.String(diagnosis, "id")!);

        var diagnosisGet = await _api.GetAsync($"api/diagnoses?patientId={patientId}&doctorId={doctorId}");
        Assert.AreEqual(HttpStatusCode.OK, diagnosisGet.Status);
        Assert.IsTrue(ApiClient.Data(diagnosisGet.Body).EnumerateArray().Any(x => ApiClient.String(x, "id") == diagnosisId.ToString()));

        Console.WriteLine("STEP 8: Doctor creates medication");
        // 8. Doctor creates medication
        var medicationResponse = await _api.PostAsync("api/medications", new
        {
            medicationIdCode = $"AUTO-MED-{unique}",
            name = "Automation Medication",
            form = "Tablet",
            patientId,
            dosage = "500 mg",
            route = "Oral",
            frequency = "Every 8 hours",
            nextDoseTime = DateTime.UtcNow.AddHours(2).ToString("MMM dd, yyyy hh:mm tt"),
            status = "Pending",
            prescribedBy = doctorName,
            prescribedBySpecialty = "General Medicine",
            category = "Analgesic",
            adherencePercentage = "100%"
        });
        Assert.AreEqual(HttpStatusCode.Created, medicationResponse.Status, medicationResponse.Body.RootElement.ToString());
        var medication = ApiClient.Data(medicationResponse.Body);
        var medicationId = Guid.Parse(ApiClient.String(medication, "id")!);

        Console.WriteLine("STEP 9: Verify doctor and nurse medication alerts");
        // 9. Verify doctor and nurse medication alerts
        var doctorAlerts = await _api.GetAsync($"api/alerts?patientId={patientId}&recipientId={doctorId}&recipientRole=Doctor");
        Assert.AreEqual(HttpStatusCode.OK, doctorAlerts.Status, doctorAlerts.Body.RootElement.ToString());
        var doctorAlertData = ApiClient.Data(doctorAlerts.Body);
        Assert.IsTrue(doctorAlertData.EnumerateArray().Any(a => ApiClient.String(a, "type") == "Medication"));

        await LoginNurse();
        var nurseAlerts = await _api.GetAsync($"api/alerts?patientId={patientId}&recipientId={nurseId}&recipientRole=Nurse");
        Assert.AreEqual(HttpStatusCode.OK, nurseAlerts.Status, nurseAlerts.Body.RootElement.ToString());
        var nurseAlertData = ApiClient.Data(nurseAlerts.Body);
        var nurseAlert = nurseAlertData.EnumerateArray().FirstOrDefault(a => ApiClient.String(a, "type") == "Medication");
        Assert.AreNotEqual(JsonValueKind.Undefined, nurseAlert.ValueKind, "Nurse medication alert was not generated.");
        var nurseAlertId = Guid.Parse(ApiClient.String(nurseAlert, "id")!);

        Console.WriteLine("STEP 10: Vital round and vitals");
        // 10. Nurse creates and records a vital round
        var roundCreate = await _api.PostAsync("api/vital-rounds", new { patientId, nurseId });
        Assert.AreEqual(HttpStatusCode.OK, roundCreate.Status, roundCreate.Body.RootElement.ToString());
        var round = ApiClient.Data(roundCreate.Body);
        var vitalRoundId = Guid.Parse(ApiClient.String(round, "id")!);

        var vitalRecord = await _api.PostAsync($"api/vital-rounds/{vitalRoundId}/record", new
        {
            bloodPressure = "118/76 mmHg",
            heartRate = "78 bpm",
            temperature = "98.4 Â°F",
            spO2 = "97 %",
            respiratoryRate = "18 /min",
            painScore = "2/10",
            nurseName
        });
        Assert.AreEqual(HttpStatusCode.OK, vitalRecord.Status, vitalRecord.Body.RootElement.ToString());
        Assert.AreEqual("Completed", ApiClient.String(ApiClient.Data(vitalRecord.Body), "status"));

        Console.WriteLine("STEP 11: Medication administration");
        // 11. Nurse administers medication
        var administration = await _api.PostAsync($"api/medications/{medicationId}/administer", new
        {
            nurseId,
            status = "Given",
            notes = "Medication administered during positive-flow automation."
        });
        Assert.AreEqual(HttpStatusCode.OK, administration.Status, administration.Body.RootElement.ToString());
        Assert.AreEqual("Given", ApiClient.String(ApiClient.Data(administration.Body), "status"));

        var administrationGet = await _api.GetAsync($"api/medications/{medicationId}/administrations");
        Assert.AreEqual(HttpStatusCode.OK, administrationGet.Status);
        Assert.IsTrue(ApiClient.Data(administrationGet.Body).EnumerateArray().Any());

        // 12. Nurse creates documentation
        var documentationResponse = await _api.PostAsync("api/documentations", new
        {
            documentCode = $"AUTO-DOC-{unique}",
            documentName = "Automation Nursing Care Note",
            patientId,
            patientName = ApiClient.String(patient, "name"),
            patientIdCode = patientCode,
            roomLocation = "AUTO-101",
            careUnit = "General Ward",
            ageGender = "41 Y â€¢ Male",
            bloodGroup = "O+",
            patientType = "Inpatient",
            documentType = "Care Note",
            createdByName = nurseName,
            createdByRole = "Staff Nurse",
            status = "Completed",
            isDraft = false,
            notesContent = "Positive-flow automated nursing documentation."
        });
        Assert.AreEqual(HttpStatusCode.OK, documentationResponse.Status, documentationResponse.Body.RootElement.ToString());
        Assert.IsTrue(Guid.TryParse(ApiClient.String(ApiClient.Data(documentationResponse.Body), "id"), out _));

        // 13. Nurse creates and completes a patient task
        var taskResponse = await _api.PostAsync("api/tasks", new
        {
            taskIdCode = $"AUTO-TSK-{unique}",
            title = "Complete positive-flow nursing review",
            description = "Automation task for assigned patient.",
            patientId,
            patientName = ApiClient.String(patient, "name"),
            patientIdCode = patientCode,
            taskType = "Clinical Care",
            priority = "Medium",
            assignedCaregiver = nurseName,
            assigneeRole = "Nursing",
            dueTime = DateTime.UtcNow.AddHours(1).ToString("MMM dd, yyyy hh:mm tt"),
            status = "Pending",
            statusStr = "Open"
        });
        Assert.AreEqual(HttpStatusCode.OK, taskResponse.Status, taskResponse.Body.RootElement.ToString());
        var taskId = Guid.Parse(ApiClient.String(ApiClient.Data(taskResponse.Body), "id")!);
        var taskComplete = await _api.PostAsync($"api/tasks/{taskId}/toggle");
        Assert.AreEqual(HttpStatusCode.OK, taskComplete.Status, taskComplete.Body.RootElement.ToString());
        Assert.AreEqual("Completed", ApiClient.String(ApiClient.Data(taskComplete.Body), "statusStr"));

        // 14. Acknowledge both role-targeted medication alerts
        var doctorAlert = doctorAlertData.EnumerateArray()
            .First(a => ApiClient.String(a, "type") == "Medication");
        var doctorAlertId = Guid.Parse(ApiClient.String(doctorAlert, "id")!);

        var doctorAlertAck = await _api.PostAsync($"api/alerts/{doctorAlertId}/acknowledge");
        Assert.AreEqual(HttpStatusCode.OK, doctorAlertAck.Status, doctorAlertAck.Body.RootElement.ToString());
        Assert.AreEqual("Resolved", ApiClient.String(ApiClient.Data(doctorAlertAck.Body), "status"));

        var alertAck = await _api.PostAsync($"api/alerts/{nurseAlertId}/acknowledge");
        Assert.AreEqual(HttpStatusCode.OK, alertAck.Status, alertAck.Body.RootElement.ToString());
        Assert.AreEqual("Resolved", ApiClient.String(ApiClient.Data(alertAck.Body), "status"));

        // 15. Doctor reviews the patient journey
        await LoginDoctor();
        var patientGet = await _api.GetAsync($"api/patients/{patientId}");
        Assert.AreEqual(HttpStatusCode.OK, patientGet.Status, patientGet.Body.RootElement.ToString());
        Assert.AreEqual(patientId.ToString(), ApiClient.String(ApiClient.Data(patientGet.Body), "id"));

        var medicationGet = await _api.GetAsync($"api/medications?patientId={patientId}");
        Assert.AreEqual(HttpStatusCode.OK, medicationGet.Status);
        Assert.IsTrue(ApiClient.Data(medicationGet.Body).EnumerateArray().Any(m => ApiClient.String(m, "id") == medicationId.ToString()));

        Console.WriteLine("STEP 16: Discharge checklist");
        // 16. Nurse prepares discharge checklist
        await LoginNurse();
        var checklistResponse = await _api.PostAsync("api/discharge-checklists", new
        {
            patientId,
            patientName = ApiClient.String(patient, "name"),
            patientIdCode = patientCode,
            roomNumber = "AUTO-101",
            careUnit = "General Ward",
            admitDateText = DateTime.UtcNow.AddDays(-2).ToString("MMM dd, yyyy"),
            expectedDischargeText = DateTime.UtcNow.ToString("MMM dd, yyyy"),
            attendingDoctorName = doctorName,
            notes = "Positive-flow automated discharge preparation."
        });
        Assert.AreEqual(HttpStatusCode.OK, checklistResponse.Status, checklistResponse.Body.RootElement.ToString());
        var checklist = ApiClient.Data(checklistResponse.Body);
        var checklistId = Guid.Parse(ApiClient.String(checklist, "id")!);

        var checklistComplete = await _api.PostAsync($"api/discharge-checklists/{checklistId}/complete");
        Assert.AreEqual(HttpStatusCode.OK, checklistComplete.Status, checklistComplete.Body.RootElement.ToString());
        Assert.AreEqual("Ready", ApiClient.String(ApiClient.Data(checklistComplete.Body), "checklistStatus"));

        Console.WriteLine("STEP 17: Doctor discharge and summary");
        // 17. Doctor completes discharge and creates discharge summary
        await LoginDoctor();
        var dischargeResponse = await _api.PostAsync("api/discharge/complete", new
        {
            patientId,
            doctorId,
            checklistId,
            finalDiagnosis = "Community acquired pneumonia - improved",
            medications = "Automation Medication 500 mg orally every 8 hours as directed",
            treatmentSummary = "Patient improved with treatment and remained clinically stable.",
            dischargeInstructions = "Continue prescribed medications and follow the care instructions.",
            followUpInstructions = "Follow up with the attending physician as scheduled."
        });
        Assert.AreEqual(HttpStatusCode.OK, dischargeResponse.Status, dischargeResponse.Body.RootElement.ToString());
        var summary = ApiClient.Data(dischargeResponse.Body);
        var summaryId = Guid.Parse(ApiClient.String(summary, "id")!);
        Assert.AreEqual(patientId.ToString(), ApiClient.String(summary, "patientId"));
        Assert.AreEqual(doctorId.ToString(), ApiClient.String(summary, "doctorId"));

        Console.WriteLine("STEP 18: Final discharge verification");
        // 18. Final patient status and discharge summary verification
        var finalPatient = await _api.GetAsync($"api/patients/{patientId}");
        Assert.AreEqual(HttpStatusCode.OK, finalPatient.Status, finalPatient.Body.RootElement.ToString());
        Assert.AreEqual("Discharged", ApiClient.String(ApiClient.Data(finalPatient.Body), "status"));

        var summaryGet = await _api.GetAsync($"api/discharge/summaries/{summaryId}");
        Assert.AreEqual(HttpStatusCode.OK, summaryGet.Status, summaryGet.Body.RootElement.ToString());
        Assert.AreEqual("Completed", ApiClient.String(ApiClient.Data(summaryGet.Body), "status"));

        // 19. Final checklist status
        var checklistGet = await _api.GetAsync($"api/discharge-checklists?search={Uri.EscapeDataString(patientCode)}");
        Assert.AreEqual(HttpStatusCode.OK, checklistGet.Status);
        var checklists = ApiClient.Data(checklistGet.Body);
        Assert.IsTrue(checklists.EnumerateArray().Any(c =>
            ApiClient.String(c, "id") == checklistId.ToString() &&
            ApiClient.String(c, "checklistStatus") == "Discharged"));

        // 20. Final alert state for the patient
        var finalAlerts = await _api.GetAsync($"api/alerts?patientId={patientId}");
        Assert.AreEqual(HttpStatusCode.OK, finalAlerts.Status);
        Assert.IsTrue(ApiClient.Data(finalAlerts.Body).EnumerateArray().All(a =>
            ApiClient.String(a, "status") == "Resolved" ||
            ApiClient.String(a, "isAcknowledged")?.Equals("True", StringComparison.OrdinalIgnoreCase) == true));

        Console.WriteLine("CONNECTCARE E2E POSITIVE CLINICAL JOURNEY: PASSED");
        Console.WriteLine($"Patient={patientId}; Doctor={doctorId}; Nurse={nurseId}; Summary={summaryId}");
    }

    [TestMethod]
    public async Task API_IIS_Routing_Is_Available()
    {
        var response = await _api.GetAsync("api/locations");
        Assert.AreEqual(HttpStatusCode.OK, response.Status, response.Body.RootElement.ToString());
        Assert.IsTrue(response.Body.RootElement.TryGetProperty("success", out var success));
        Assert.IsTrue(success.GetBoolean(), response.Body.RootElement.ToString());
    }

    private async Task LoginAdmin()
    {
        var token = await _auth.LoginAsync(
            TestSettings.Get("AdminUsername", "admin"),
            TestSettings.Get("AdminPassword", "admin123"),
            "Admin");
        _api.SetBearerToken(token);
    }

    private async Task LoginDoctor()
    {
        var token = await _auth.LoginAsync(
            TestSettings.Get("DoctorUsername", "doctor"),
            TestSettings.Get("DoctorPassword", "doctor123"),
            "Doctor");
        _api.SetBearerToken(token);
    }

    private async Task LoginNurse()
    {
        var token = await _auth.LoginAsync(
            TestSettings.Get("NurseUsername", "nurse"),
            TestSettings.Get("NursePassword", "nurse123"),
            "Nurse");
        _api.SetBearerToken(token);
    }
}

