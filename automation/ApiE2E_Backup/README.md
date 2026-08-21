# ConnectCare Automation Tests

This project is the first API-level automation layer for the ConnectCare end-to-end positive clinical journey.

## Current implementation

The tests were created against the actual ConnectCare source in the supplied project.

### Covered/available API flows

- Admin login
- Patient creation
- Doctor creation
- Nurse creation
- Doctor-to-patient care-team assignment
- Nurse-to-patient care-team assignment
- Medication creation
- Alert creation and acknowledgement
- Nursing documentation creation
- Discharge checklist creation

### Current implementation gaps found during automation design

1. **Diagnosis**
   - No dedicated diagnosis create/update API exists.
   - `ClinicalEncounterRecord` contains `ReasonDiagnosis`, but there is no controller endpoint that writes a diagnosis.
   - Automation therefore stops at this point in the master journey.

2. **Role-targeted alerts**
   - `/api/alerts` returns all alerts.
   - There is no doctor-specific or nurse-specific alert query/authorization filter.
   - The test can validate patient association and acknowledgement, but not true role-specific delivery.

3. **Vital rounds**
   - `POST /api/vital-rounds/{id}/record` requires an existing VitalRoundRecord ID.
   - There is no create endpoint in the supplied API for creating a patient-specific vital round.

4. **Discharge**
   - `/api/discharge-checklists` supports GET and POST create.
   - There is no API to complete checklist items, finalize the patient's discharge status, or create a patient-specific discharge summary.
   - The discharge end-to-end test is therefore intentionally marked Inconclusive until those APIs are implemented.

5. **Test fixture state**
   - MSTest methods are isolated by design. The master journey keeps IDs within one test.
   - For production CI, move the create/assignment fixture into a shared class fixture or use a dedicated test-data setup/cleanup API.

## Run

From this directory:

```powershell
dotnet restore
dotnet test --settings runsettings.xml --logger "trx;LogFileName=ConnectCare-Automation.trx"
```

If the API is hosted publicly, change `BaseUrl` in `runsettings.xml`, for example:

```xml
<Parameter name="BaseUrl" value="https://connectcare.vensunsoftware.com" />
```

## Recommended next implementation

Do not simply bypass the Inconclusive steps. Add the missing business APIs first:

- `POST /api/patients/{patientId}/diagnosis`
- patient/role-scoped alert retrieval
- `POST /api/vital-rounds`
- discharge checklist update/complete endpoint
- patient discharge endpoint
- discharge summary create/get endpoint

Then extend `E2E_99_Full_Positive_Journey` until it ends with:

`Patient Status = Discharged`
