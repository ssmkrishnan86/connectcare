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

    private string _patientId = "";
    private string _patientCode = "";
    private string _doctorId = "";
    private string _nurseId = "";
    private string _medicationId = "";
    private string _alertId = "";
    private string _vitalRoundId = "";
    private string _taskId = "";
    private string _documentationId = "";

    [TestInitialize]
    public void Initialize()
    {
        var baseUrl = TestSettings.Get("BaseUrl", "http://localhost:5231");
        _api = new ApiClient(baseUrl);
        _auth = new AuthHelper(_api);
    }

    [TestMethod]
    public async Task E2E_01_Admin_Creates_Patient()
    {
        await LoginAdmin();

        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var response = await _api.PostAsync("api/patients", new
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
            medicalConditions = "",
            allergies = "No Known Allergies",
            currentMedications = "",
            pastMedicalHistory = "",
            insuranceProvider = "Test Health Plan",
            insurancePolicyNumber = $"AUTO-POL-{unique}",
            insuranceGroupNumber = "AUTO-GRP",
            insuranceValidUntil = "12/31/2030",
            additionalNotes = "Created by automated positive-flow test."
        });

        Assert.AreEqual(HttpStatusCode.Created, response.Status,
            $"Patient creation failed: {response.Body.RootElement}");

        var patient = ApiClient.Data(response.Body);
        _patientId = ApiClient.String(patient, "id") ?? "";
        _patientCode = ApiClient.String(patient, "patientIdCode") ?? "";

        Assert.IsTrue(Guid.TryParse(_patientId, out _), "Patient ID was not a GUID.");
        Assert.IsFalse(string.IsNullOrWhiteSpace(_patientCode), "Patient code was not generated.");
    }

    [TestMethod]
    public async Task E2E_02_Admin_Creates_Doctor()
    {
        await LoginAdmin();

        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var response = await _api.PostAsync("api/doctors", new
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

        Assert.AreEqual(HttpStatusCode.OK, response.Status,
            $"Doctor creation failed: {response.Body.RootElement}");

        var doctor = ApiClient.Data(response.Body);
        _doctorId = ApiClient.String(doctor, "id") ?? "";
        Assert.IsTrue(Guid.TryParse(_doctorId, out _), "Doctor ID was not a GUID.");
    }

    [TestMethod]
    public async Task E2E_03_Admin_Creates_Nurse()
    {
        await LoginAdmin();

        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var response = await _api.PostAsync("api/nurses", new
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

        Assert.AreEqual(HttpStatusCode.OK, response.Status,
            $"Nurse creation failed: {response.Body.RootElement}");

        var nurse = ApiClient.Data(response.Body);
        _nurseId = ApiClient.String(nurse, "id") ?? "";
        Assert.IsTrue(Guid.TryParse(_nurseId, out _), "Nurse ID was not a GUID.");
    }

    [TestMethod]
    public async Task E2E_04_Admin_Assigns_Doctor_To_Patient()
    {
        Assert.Inconclusive("Requires patientId and doctorId from the same test context. Run the suite using the master journey or add shared fixture state.");
    }

    [TestMethod]
    public async Task E2E_05_Admin_Assigns_Nurse_To_Patient()
    {
        Assert.Inconclusive("Requires patientId and nurseId from the same test context. Run the suite using the master journey or add shared fixture state.");
    }

    [TestMethod]
    public async Task E2E_06_Diagnosis_Workflow()
    {
        Assert.Inconclusive(
            "BLOCKER FOUND: Current API has no dedicated diagnosis create/update endpoint or diagnosis entity. " +
            "ClinicalEncounterRecord contains ReasonDiagnosis but no API writes it. Implement diagnosis endpoint before automating this step.");
    }

    [TestMethod]
    public async Task E2E_07_Doctor_Adds_Medication()
    {
        await LoginDoctor();

        Assert.IsFalse(string.IsNullOrWhiteSpace(_patientId),
            "This isolated test requires a patient created in the same fixture. Use the master journey after fixture extraction.");

        var response = await _api.PostAsync("api/medications", new
        {
            medicationIdCode = $"AUTO-MED-{DateTime.UtcNow:yyyyMMddHHmmss}",
            name = "Automation Medication",
            form = "Tablet",
            patientId = _patientId,
            patientName = "Automation Patient",
            patientIdCode = _patientCode,
            dosage = "500 mg",
            route = "Oral",
            frequency = "Every 8 hours",
            nextDoseTime = DateTime.UtcNow.AddHours(2).ToString("MMM dd, yyyy hh:mm tt"),
            status = "Pending",
            prescribedBy = "Automation Doctor",
            prescribedBySpecialty = "General Medicine",
            category = "Analgesic",
            adherencePercentage = "100%"
        });

        Assert.AreEqual(HttpStatusCode.OK, response.Status,
            $"Medication creation failed: {response.Body.RootElement}");

        var medication = ApiClient.Data(response.Body);
        _medicationId = ApiClient.String(medication, "id") ?? "";
        Assert.IsTrue(Guid.TryParse(_medicationId, out _));
    }

    [TestMethod]
    public async Task E2E_08_Doctor_Nurse_Alert_Workflow()
    {
        await LoginDoctor();

        var response = await _api.PostAsync("api/alerts", new
        {
            alertIdCode = $"AUTO-ALT-{DateTime.UtcNow:yyyyMMddHHmmss}",
            title = "Automation Medication Alert",
            description = "Medication requires nursing attention.",
            patientId = string.IsNullOrWhiteSpace(_patientId) ? null : _patientId,
            patientName = "Automation Patient",
            patientIdCode = _patientCode,
            type = "Medication",
            severity = "High",
            roomLocation = "AUTO-101 • General Ward",
            reportedBy = "Automation Doctor",
            reportedByRole = "Doctor",
            triggerCondition = "Medication administration requires attention",
            status = "New",
            isAcknowledged = false,
            careUnit = "General Ward",
            patientType = "Inpatient",
            detectedBy = "Automation Test",
            source = "ConnectCare API",
            notes = "Positive-flow automation alert."
        });

        Assert.AreEqual(HttpStatusCode.OK, response.Status,
            $"Alert creation failed: {response.Body.RootElement}");

        var alert = ApiClient.Data(response.Body);
        _alertId = ApiClient.String(alert, "id") ?? "";
        Assert.IsTrue(Guid.TryParse(_alertId, out _));

        await LoginNurse();

        var alerts = await _api.GetAsync("api/alerts");
        Assert.AreEqual(HttpStatusCode.OK, alerts.Status);

        var data = ApiClient.Data(alerts.Body);
        Assert.AreEqual(JsonValueKind.Array, data.ValueKind);

        var found = data.EnumerateArray()
            .Any(a => ApiClient.String(a, "id") == _alertId);

        Assert.IsTrue(found, "Created patient alert was not returned by /api/alerts.");

        var acknowledge = await _api.PostAsync($"api/alerts/{_alertId}/acknowledge");
        Assert.AreEqual(HttpStatusCode.OK, acknowledge.Status,
            $"Alert acknowledgement failed: {acknowledge.Body.RootElement}");
    }

    [TestMethod]
    public async Task E2E_09_Nurse_Records_Vitals()
    {
        await LoginNurse();

        var rounds = await _api.GetAsync("api/vital-rounds?search=Automation");
        Assert.AreEqual(HttpStatusCode.OK, rounds.Status,
            $"Vital rounds lookup failed: {rounds.Body.RootElement}");

        Assert.Inconclusive(
            "Current API requires an existing VitalRoundRecord ID before /api/vital-rounds/{id}/record can be called. " +
            "The test should first create a patient-specific vital round or expose a create endpoint.");
    }

    [TestMethod]
    public async Task E2E_10_Nurse_Creates_Documentation()
    {
        await LoginNurse();

        var response = await _api.PostAsync("api/documentations", new
        {
            documentCode = $"AUTO-DOC-{DateTime.UtcNow:yyyyMMddHHmmss}",
            documentName = "Automation Nursing Care Note",
            patientId = string.IsNullOrWhiteSpace(_patientId) ? null : _patientId,
            patientName = "Automation Patient",
            patientIdCode = _patientCode,
            roomLocation = "AUTO-101",
            careUnit = "General Ward",
            ageGender = "41 Y • Male",
            bloodGroup = "O+",
            patientType = "Inpatient",
            documentType = "Care Note",
            createdByName = "Automation Nurse",
            createdByRole = "Staff Nurse",
            status = "Completed",
            isDraft = false,
            notesContent = "Positive-flow automated nursing documentation."
        });

        Assert.AreEqual(HttpStatusCode.OK, response.Status,
            $"Documentation creation failed: {response.Body.RootElement}");

        var data = ApiClient.Data(response.Body);
        _documentationId = ApiClient.String(data, "id") ?? "";
        Assert.IsTrue(Guid.TryParse(_documentationId, out _));
    }

    [TestMethod]
    public async Task E2E_11_Nurse_Creates_Discharge_Checklist()
    {
        await LoginNurse();

        var response = await _api.PostAsync("api/discharge-checklists", new
        {
            patientName = "Automation Patient",
            patientIdCode = _patientCode,
            roomNumber = "AUTO-101",
            careUnit = "General Ward",
            admitDateText = DateTime.UtcNow.AddDays(-2).ToString("MMM dd, yyyy"),
            expectedDischargeText = DateTime.UtcNow.ToString("MMM dd, yyyy"),
            attendingDoctorName = "Automation Doctor",
            notes = "Positive-flow automated discharge preparation."
        });

        Assert.AreEqual(HttpStatusCode.OK, response.Status,
            $"Discharge checklist creation failed: {response.Body.RootElement}");
    }

    [TestMethod]
    public async Task E2E_12_Discharge_Summary()
    {
        Assert.Inconclusive(
            "BLOCKER FOUND: Current API exposes discharge checklist creation/read only. " +
            "There is no endpoint to complete checklist items, finalize discharge, or create a patient-specific discharge summary.");
    }

    [TestMethod]
    public async Task E2E_99_Full_Positive_Journey()
    {
        // This master test intentionally stops at the first implementation gap.
        // It documents the exact sequence and will become the regression gate once
        // diagnosis, role-targeted alerts, vital-round creation, assignment fixture state,
        // and discharge finalization APIs are available.

        await LoginAdmin();

        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");

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
            insuranceValidUntil = "12/31/2030"
        });

        Assert.AreEqual(HttpStatusCode.Created, patientResponse.Status);
        var patient = ApiClient.Data(patientResponse.Body);
        _patientId = ApiClient.String(patient, "id")!;
        _patientCode = ApiClient.String(patient, "patientIdCode")!;

        var doctorResponse = await _api.PostAsync("api/doctors", new
        {
            doctorIdCode = $"AUTO-DOC-{unique}",
            name = $"Automation Doctor {unique}",
            specialty = "General Medicine",
            department = "Medicine",
            location = "Test Hospital",
            phone = "5550102000",
            email = $"doctor.{unique}@example.test",
            status = "Active"
        });
        Assert.AreEqual(HttpStatusCode.OK, doctorResponse.Status);
        _doctorId = ApiClient.String(ApiClient.Data(doctorResponse.Body), "id")!;

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
            status = "Active"
        });
        Assert.AreEqual(HttpStatusCode.OK, nurseResponse.Status);
        _nurseId = ApiClient.String(ApiClient.Data(nurseResponse.Body), "id")!;

        var doctorAssignment = await _api.PostAsync("api/careteams", new
        {
            memberIdCode = $"AUTO-CT-DOC-{unique}",
            name = $"Automation Doctor {unique}",
            role = "Doctor",
            department = "Medicine",
            location = "Test Hospital",
            phone = "5550102000",
            email = $"doctor.{unique}@example.test",
            status = "Active",
            doctorId = _doctorId,
            patientId = _patientId
        });
        Assert.AreEqual(HttpStatusCode.OK, doctorAssignment.Status,
            $"Doctor assignment failed: {doctorAssignment.Body.RootElement}");

        var nurseAssignment = await _api.PostAsync("api/careteams", new
        {
            memberIdCode = $"AUTO-CT-NUR-{unique}",
            name = $"Automation Nurse {unique}",
            role = "Nurse",
            department = "General Medicine",
            location = "Test Hospital",
            phone = "5550103000",
            email = $"nurse.{unique}@example.test",
            status = "Active",
            nurseId = _nurseId,
            patientId = _patientId
        });
        Assert.AreEqual(HttpStatusCode.OK, nurseAssignment.Status,
            $"Nurse assignment failed: {nurseAssignment.Body.RootElement}");

        var careTeam = await _api.GetAsync($"api/careteams?patientId={Uri.EscapeDataString(_patientId)}");
        Assert.AreEqual(HttpStatusCode.OK, careTeam.Status,
            $"Care team verification failed: {careTeam.Body.RootElement}");

        var careData = ApiClient.Data(careTeam.Body);
        Assert.AreEqual(JsonValueKind.Array, careData.ValueKind);

        var doctorAssigned = careData.EnumerateArray().Any(x =>
            ApiClient.String(x, "doctorId") == _doctorId &&
            ApiClient.String(x, "patientId") == _patientId);

        var nurseAssigned = careData.EnumerateArray().Any(x =>
            ApiClient.String(x, "nurseId") == _nurseId &&
            ApiClient.String(x, "patientId") == _patientId);

        Assert.IsTrue(doctorAssigned, "Doctor assignment was not persisted.");
        Assert.IsTrue(nurseAssigned, "Nurse assignment was not persisted.");

        await LoginDoctor();

        Assert.Inconclusive(
            "MASTER JOURNEY BLOCKED AFTER MASTER-DATA + ASSIGNMENT PHASE: " +
            "No dedicated diagnosis write API exists. Once diagnosis is implemented, continue with medication, " +
            "patient-specific alert verification, nurse vitals, nursing tasks/documentation, discharge completion, and discharge summary.");
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
