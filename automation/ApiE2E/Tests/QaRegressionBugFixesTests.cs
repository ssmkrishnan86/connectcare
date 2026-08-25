using System.Net;
using System.Text.Json;
using ConnectCare.AutomationTests.Helpers;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ConnectCare.AutomationTests.Tests;

[TestClass]
[TestCategory("Regression")]
[TestCategory("BugFixes")]
public class QaRegressionBugFixesTests
{
    private ApiClient _api = null!;
    private AuthHelper _auth = null!;

    [TestInitialize]
    public void Initialize()
    {
        _api = new ApiClient(TestSettings.Get("BaseUrl", "http://localhost:5231"));
        _auth = new AuthHelper(_api);
    }

    private async Task LoginAdmin() => await _auth.LoginAsync("admin", "admin123", "Admin");

    [TestMethod]
    public async Task BugFix_04_ClinicalEncounters_Create_Update_Delete()
    {
        await LoginAdmin();
        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");

        // 1. Create Patient
        var patRes = await _api.PostAsync("api/patients", new
        {
            patientIdCode = $"QA4-{unique}",
            mrn = $"MRN-QA4-{unique}",
            name = $"Encounter Test {unique}",
            firstName = "Encounter",
            lastName = $"Test{unique}",
            dob = "03/15/1990",
            gender = "Female",
            phone = "5550194000",
            careUnit = "General Ward",
            floorRoom = "Room 201"
        });
        Assert.AreEqual(HttpStatusCode.Created, patRes.Status);
        var patientId = ApiClient.String(ApiClient.Data(patRes.Body), "id")!;

        // 2. Create Clinical Encounter (Issue 4)
        var encRes = await _api.PostAsync($"api/patients/{patientId}/clinical-encounters", new
        {
            encounterType = "Inpatient Review",
            reasonDiagnosis = "Initial assessment on admission",
            providerName = "Dr. Test Physician",
            dateText = "08/25/2026"
        });
        Assert.AreEqual(HttpStatusCode.OK, encRes.Status);
        var encData = ApiClient.Data(encRes.Body);
        var encounterId = ApiClient.String(encData, "id")!;
        Assert.IsFalse(string.IsNullOrWhiteSpace(encounterId));
        Assert.AreEqual("Initial assessment on admission", ApiClient.String(encData, "reasonDiagnosis"));

        // 3. Update Clinical Encounter (Issue 4)
        var updateRes = await _api.PutAsync($"api/patients/{patientId}/clinical-encounters/{encounterId}", new
        {
            encounterType = "Clinical Consultation",
            reasonDiagnosis = "Updated assessment: Patient improving",
            providerName = "Dr. Test Physician",
            dateText = "08/25/2026"
        });
        Assert.AreEqual(HttpStatusCode.OK, updateRes.Status);
        var updatedEncData = ApiClient.Data(updateRes.Body);
        Assert.AreEqual("Updated assessment: Patient improving", ApiClient.String(updatedEncData, "reasonDiagnosis"));

        // 4. Delete Clinical Encounter (Issue 4)
        var deleteRes = await _api.DeleteAsync($"api/patients/{patientId}/clinical-encounters/{encounterId}");
        Assert.AreEqual(HttpStatusCode.OK, deleteRes.Status);

        // 5. Verify deleted encounter is no longer in encounters list
        var listRes = await _api.GetAsync($"api/patients/{patientId}/clinical-encounters");
        Assert.AreEqual(HttpStatusCode.OK, listRes.Status);
        var listData = ApiClient.Data(listRes.Body);
        Assert.IsFalse(listData.EnumerateArray().Any(e => ApiClient.String(e, "id") == encounterId));
    }

    [TestMethod]
    public async Task BugFix_05_Doctor_CannotBeDeleted_WhenAssignedToPatient()
    {
        await LoginAdmin();
        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");

        // 1. Create Doctor
        var docRes = await _api.PostAsync("api/doctors", new
        {
            doctorIdCode = $"DOC-QA5-{unique}",
            username = $"doc_qa5_{unique}",
            password = "doctor123",
            name = $"Dr. Protected {unique}",
            specialty = "Cardiology",
            email = $"doc.qa5.{unique}@test.org",
            phone = "5550195000",
            status = "Active"
        });
        Assert.AreEqual(HttpStatusCode.OK, docRes.Status);
        var doctorId = Guid.Parse(ApiClient.String(ApiClient.Data(docRes.Body), "id")!);

        // 2. Create Patient assigned to this Doctor
        var patRes = await _api.PostAsync("api/patients", new
        {
            patientIdCode = $"QA5-PT-{unique}",
            mrn = $"MRN-QA5-{unique}",
            name = $"Protected Patient {unique}",
            firstName = "Protected",
            lastName = $"Patient{unique}",
            dob = "05/10/1988",
            gender = "Male",
            phone = "5550195001",
            primaryDoctorId = doctorId,
            primaryDoctorName = $"Dr. Protected {unique}"
        });
        Assert.AreEqual(HttpStatusCode.Created, patRes.Status);

        // 3. Attempt to delete Doctor -> Expect 400 BadRequest with constraint message (Issue 5)
        var delRes = await _api.DeleteAsync($"api/doctors/{doctorId}");
        Assert.AreEqual(HttpStatusCode.BadRequest, delRes.Status);
        var bodyStr = delRes.Body.RootElement.ToString();
        Assert.IsTrue(bodyStr.Contains("Cannot delete Doctor as they are assigned to patient(s).") || bodyStr.Contains("assigned"), bodyStr);
    }

    [TestMethod]
    public async Task BugFix_07_CareTeamMember_Creation_Validation()
    {
        await LoginAdmin();
        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");

        // 1. Create Doctor
        var docRes = await _api.PostAsync("api/doctors", new
        {
            doctorIdCode = $"DOC-QA7-{unique}",
            username = $"doc_qa7_{unique}",
            password = "doctor123",
            name = $"Dr. TeamMember {unique}",
            specialty = "Neurology",
            email = $"doc.qa7.{unique}@test.org",
            phone = "5550197000",
            status = "Active"
        });
        Assert.AreEqual(HttpStatusCode.OK, docRes.Status);
        var doctorId = Guid.Parse(ApiClient.String(ApiClient.Data(docRes.Body), "id")!);

        // 2. Create Care Team Member via POST /api/careteams (Issue 7)
        var memberRes = await _api.PostAsync("api/careteams", new
        {
            name = $"Dr. TeamMember {unique}",
            role = "Doctor",
            department = "Neurology",
            specialization = "Neuro-critical Care",
            contactNumber = "5550197000",
            email = $"doc.qa7.{unique}@test.org",
            doctorId
        });
        Assert.IsTrue(memberRes.Status == HttpStatusCode.OK || memberRes.Status == HttpStatusCode.Created, memberRes.Body.RootElement.ToString());
    }

    [TestMethod]
    public async Task BugFix_08_18_CarePlan_CustomValues_NoStaleData()
    {
        await LoginAdmin();
        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");

        // 1. Create Patient
        var patRes = await _api.PostAsync("api/patients", new
        {
            patientIdCode = $"QA8-{unique}",
            mrn = $"MRN-QA8-{unique}",
            name = $"CarePlan Patient {unique}",
            firstName = "CarePlan",
            lastName = $"Patient{unique}",
            dob = "07/20/1992",
            gender = "Female",
            phone = "5550198000"
        });
        Assert.AreEqual(HttpStatusCode.Created, patRes.Status);
        var patientId = ApiClient.String(ApiClient.Data(patRes.Body), "id")!;

        // 2. Save Custom Care Plan (Issue 8 & 18)
        var planRes = await _api.PostAsync($"api/patients/{patientId}/care-plan", new
        {
            planTitle = "Personalized Cardiac Recovery Plan",
            status = "Active",
            progressPercentage = 60,
            goals = new[] { "Custom Goal 1: Ambulate 100ft", "Custom Goal 2: Maintain BP < 130/80" },
            interventions = "Administer ACE-inhibitor daily; low-sodium diet; physical therapy.",
            attendingDoctorName = "Dr. Custom Attending"
        });
        Assert.AreEqual(HttpStatusCode.OK, planRes.Status);

        // 3. Fetch Care Plan and assert custom values persisted
        var getPlanRes = await _api.GetAsync($"api/patients/{patientId}/care-plan");
        Assert.AreEqual(HttpStatusCode.OK, getPlanRes.Status);
        var planData = ApiClient.Data(getPlanRes.Body);
        Assert.AreEqual("Personalized Cardiac Recovery Plan", ApiClient.String(planData, "planTitle"));
        Assert.IsTrue(ApiClient.String(planData, "interventions")!.Contains("low-sodium diet"));
    }

    [TestMethod]
    public async Task BugFix_11_NotifyCareTeam_StatusUpdatedToActionRequired()
    {
        await LoginAdmin();
        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");

        // 1. Create Alert
        var alertRes = await _api.PostAsync("api/alerts", new
        {
            alertIdCode = $"ALT-QA11-{unique}",
            title = $"Critical SpO2 Drop {unique}",
            description = "Patient oxygen saturation dropped to 88%",
            severity = "Critical",
            type = "Vitals",
            status = "Active",
            careUnit = "ICU",
            roomLocation = "ICU-04"
        });
        Assert.IsTrue(alertRes.Status == HttpStatusCode.OK || alertRes.Status == HttpStatusCode.Created, alertRes.Body.RootElement.ToString());
        var alertId = ApiClient.String(ApiClient.Data(alertRes.Body), "id")!;

        // 2. Notify Care Team (Issue 11)
        var notifyRes = await _api.PostAsync($"api/alerts/{alertId}/notify-care-team", new { });
        Assert.AreEqual(HttpStatusCode.OK, notifyRes.Status);

        // 3. Fetch alert and verify status is 'Action Required'
        var getAlertRes = await _api.GetAsync($"api/alerts/{alertId}");
        Assert.AreEqual(HttpStatusCode.OK, getAlertRes.Status);
        var alertData = ApiClient.Data(getAlertRes.Body);
        Assert.AreEqual("Action Required", ApiClient.String(alertData, "status"));
    }

    [TestMethod]
    public async Task BugFix_12_13_DischargeChecklist_Creation_And_Summary()
    {
        await LoginAdmin();
        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");

        // 1. Create Discharge Checklist (Issue 12 & 13)
        var chkRes = await _api.PostAsync("api/discharge-checklists", new
        {
            patientName = $"Discharge Patient {unique}",
            roomNumber = "302-A",
            careUnit = "Cardiology Unit",
            attendingDoctorName = "Dr. Cardiology Specialist",
            expectedDischargeText = "May 28, 2026",
            admitDateText = "May 20, 2026",
            admitDaysText = "8 days"
        });
        Assert.AreEqual(HttpStatusCode.OK, chkRes.Status);

        // 2. Fetch Discharge Summary
        var sumRes = await _api.GetAsync("api/discharge-checklists/summary");
        Assert.AreEqual(HttpStatusCode.OK, sumRes.Status);
        var sumData = ApiClient.Data(sumRes.Body);
        Assert.IsNotNull(sumData);

        // 3. Fetch Discharge Checklists
        var listRes = await _api.GetAsync("api/discharge-checklists");
        Assert.AreEqual(HttpStatusCode.OK, listRes.Status);
        var listData = ApiClient.Data(listRes.Body);
        Assert.IsTrue(listData.EnumerateArray().Any(c => ApiClient.String(c, "patientName") == $"Discharge Patient {unique}"));
    }

    [TestMethod]
    public async Task BugFix_17_PatientCreated_WithoutAssignedDoctor_WhenNoneSelected()
    {
        await LoginAdmin();
        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");

        // 1. Create Patient without Doctor (Issue 17)
        var patRes = await _api.PostAsync("api/patients", new
        {
            patientIdCode = $"QA17-{unique}",
            mrn = $"MRN-QA17-{unique}",
            name = $"Unassigned Patient {unique}",
            firstName = "Unassigned",
            lastName = $"Patient{unique}",
            dob = "11/11/1995",
            gender = "Male",
            phone = "5550197777"
        });
        Assert.AreEqual(HttpStatusCode.Created, patRes.Status);
        var patData = ApiClient.Data(patRes.Body);
        
        // Assert no default doctor is assigned
        var primaryDocId = ApiClient.String(patData, "primaryDoctorId");
        var primaryDocName = ApiClient.String(patData, "primaryDoctorName");
        Assert.IsTrue(string.IsNullOrWhiteSpace(primaryDocId), $"Expected null primaryDoctorId but got {primaryDocId}");
        Assert.IsTrue(string.IsNullOrWhiteSpace(primaryDocName) || primaryDocName == "Unassigned", $"Expected empty primaryDoctorName but got {primaryDocName}");
    }

    [TestMethod]
    public async Task BugFix_01_14_VitalsTelemetry_Recording()
    {
        await LoginAdmin();
        var unique = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");

        // 1. Create Patient
        var patRes = await _api.PostAsync("api/patients", new
        {
            patientIdCode = $"QA1-{unique}",
            mrn = $"MRN-QA1-{unique}",
            name = $"Vitals Patient {unique}",
            firstName = "Vitals",
            lastName = $"Patient{unique}",
            dob = "01/01/1990",
            gender = "Male",
            phone = "5550191000",
            bloodPressure = "120/80 mmHg",
            heartRate = "72 bpm"
        });
        Assert.AreEqual(HttpStatusCode.Created, patRes.Status);
        var patientId = ApiClient.String(ApiClient.Data(patRes.Body), "id")!;

        // 2. Record Periodic Telemetry Round (Issue 1 & 14)
        var vitalRes = await _api.PostAsync($"api/patients/{patientId}/vitals", new
        {
            bloodPressure = "135/85 mmHg",
            heartRate = "84 bpm",
            bloodSugar = "115 mg/dL",
            temperature = "99.1 °F",
            spO2 = "97%",
            respiratoryRate = "18 /min",
            recordedBy = "Nurse Staff",
            timeText = "10:30 AM",
            dateText = "08/25/2026"
        });
        Assert.AreEqual(HttpStatusCode.OK, vitalRes.Status);

        // 3. Fetch Vitals History
        var vitalsHistRes = await _api.GetAsync($"api/patients/{patientId}/vitals");
        Assert.AreEqual(HttpStatusCode.OK, vitalsHistRes.Status);
        var vitalsData = ApiClient.Data(vitalsHistRes.Body);
        var history = vitalsData.GetProperty("history");
        Assert.IsTrue(history.EnumerateArray().Any(v => ApiClient.String(v, "bloodPressure") == "135/85 mmHg"));
    }
}
