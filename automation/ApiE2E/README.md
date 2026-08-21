# ConnectCare API E2E Automation

This project automates the positive clinical journey against the ConnectCare API through the current IIS deployment.

## Target

Base URL:
`http://localhost`

Host header:
`connectcare.vensunsoftware.com`

This matches the verified IIS routing:

`http://localhost/api/locations` -> HTTP 200.

## Positive flow

1. Admin login
2. Patient creation
3. Doctor creation
4. Nurse creation
5. Assign doctor to patient
6. Assign nurse to patient
7. Verify care team
8. Doctor login
9. Create diagnosis
10. Verify diagnosis
11. Create medication
12. Verify doctor medication alert
13. Verify nurse medication alert
14. Nurse login
15. Create vital round
16. Record vitals
17. Administer medication
18. Verify medication administration
19. Create nursing documentation
20. Create and complete nursing task
21. Acknowledge doctor and nurse medication alerts
22. Doctor reviews patient/medication
23. Create discharge checklist
24. Complete discharge checklist
25. Doctor completes discharge
26. Verify patient status = Discharged
27. Verify discharge summary = Completed
28. Verify checklist = Discharged
29. Verify patient alerts are resolved

## Run

From the extracted project directory:

```powershell
dotnet restore .\ConnectCare.AutomationTests.csproj
dotnet build .\ConnectCare.AutomationTests.csproj -c Release
dotnet test .\ConnectCare.AutomationTests.csproj -c Release --settings .
unsettings.xml --logger "trx;LogFileName=ConnectCare-E2E.trx"
```

Keep `ConnectCareApiPool` started before running the test.

## Public deployment

After the local IIS run passes, create a second runsettings file using:

- `BaseUrl = https://connectcare.vensunsoftware.com`
- `Host = connectcare.vensunsoftware.com`

and run the same test suite against the public deployment.

## Note

The test creates unique patient/doctor/nurse records on every run. The seeded login accounts (`admin`, `doctor`, `nurse`) are used only for authentication; the created Doctor/Nurse records are the clinical actors assigned to the test patient.

## Optional environment overrides

The test uses safe local defaults. To override them in PowerShell:

```powershell
$env:CONNECTCARE_BaseUrl="http://localhost"
$env:CONNECTCARE_Host="connectcare.vensunsoftware.com"
$env:CONNECTCARE_AdminUsername="admin"
$env:CONNECTCARE_AdminPassword="admin123"
$env:CONNECTCARE_DoctorUsername="doctor"
$env:CONNECTCARE_DoctorPassword="doctor123"
$env:CONNECTCARE_NurseUsername="nurse"
$env:CONNECTCARE_NursePassword="nurse123"
```
