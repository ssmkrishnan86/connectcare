using ConnectedCare.Application.Common.Interfaces;
using ConnectedCare.Application.Features.Dashboard.DTOs;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Features.Patients.Services;

public class PatientService : IPatientService
{
    private readonly IPatientRepository _repository;

    public PatientService(IPatientRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Patient>> GetPatientsAsync(
        string? search,
        string? status,
        string? careUnit,
        Guid? doctorId = null,
        Guid? nurseId = null)
    {
        return await _repository.SearchPatientsAsync(
            search,
            status,
            careUnit,
            doctorId,
            nurseId);
    }

    public async Task<Patient?> GetPatientByIdAsync(string id)
    {
        return await _repository.GetByIdCodeOrGuidAsync(id);
    }

    public async Task<Patient?> UpdatePatientAsync(
        string id,
        Patient updated)
    {
        var existing = await _repository.GetByIdCodeOrGuidAsync(id);

        if (existing == null)
            return null;

        existing.Name =
            string.IsNullOrWhiteSpace(updated.Name)
                ? existing.Name
                : updated.Name;

        existing.FirstName =
            string.IsNullOrWhiteSpace(updated.FirstName)
                ? existing.FirstName
                : updated.FirstName;

        existing.LastName =
            string.IsNullOrWhiteSpace(updated.LastName)
                ? existing.LastName
                : updated.LastName;

        existing.Phone = updated.Phone ?? existing.Phone;
        existing.Email = updated.Email ?? existing.Email;
        existing.Address = updated.Address ?? existing.Address;
        existing.City = updated.City ?? existing.City;
        existing.State = updated.State ?? existing.State;
        existing.ZipCode = updated.ZipCode ?? existing.ZipCode;
        existing.Country = updated.Country ?? existing.Country;

        existing.CareUnit =
            string.IsNullOrWhiteSpace(updated.CareUnit)
                ? existing.CareUnit
                : updated.CareUnit;

        existing.FloorRoom = updated.FloorRoom ?? existing.FloorRoom;
        existing.PrimaryDoctorName =
            updated.PrimaryDoctorName ?? existing.PrimaryDoctorName;

        existing.Status = updated.Status;
        existing.RiskLevel = updated.RiskLevel;

        if (!string.IsNullOrWhiteSpace(updated.Dob))
            existing.Dob = updated.Dob;

        if (!string.IsNullOrWhiteSpace(updated.Gender))
            existing.Gender = updated.Gender;

        if (!string.IsNullOrWhiteSpace(updated.AgeGender))
            existing.AgeGender = updated.AgeGender;

        if (!string.IsNullOrWhiteSpace(updated.BloodType))
            existing.BloodType = updated.BloodType;

        if (!string.IsNullOrWhiteSpace(updated.MaritalStatus))
            existing.MaritalStatus = updated.MaritalStatus;

        if (!string.IsNullOrWhiteSpace(updated.Avatar))
            existing.Avatar = updated.Avatar;

        existing.EmergencyContactName =
            updated.EmergencyContactName ??
            existing.EmergencyContactName;

        existing.EmergencyContactRelationship =
            updated.EmergencyContactRelationship ??
            existing.EmergencyContactRelationship;

        existing.EmergencyContactPhone =
            updated.EmergencyContactPhone ??
            existing.EmergencyContactPhone;

        existing.EmergencyContactIsPrimary =
            updated.EmergencyContactIsPrimary;

        existing.MedicalConditions =
            updated.MedicalConditions ??
            existing.MedicalConditions;

        existing.Allergies =
            updated.Allergies ??
            existing.Allergies;

        existing.CurrentMedications =
            updated.CurrentMedications ??
            existing.CurrentMedications;

        existing.PastMedicalHistory =
            updated.PastMedicalHistory ??
            existing.PastMedicalHistory;

        existing.InsuranceProvider =
            updated.InsuranceProvider ??
            existing.InsuranceProvider;

        existing.InsurancePolicyNumber =
            updated.InsurancePolicyNumber ??
            existing.InsurancePolicyNumber;

        existing.InsuranceGroupNumber =
            updated.InsuranceGroupNumber ??
            existing.InsuranceGroupNumber;

        existing.InsuranceValidUntil =
            updated.InsuranceValidUntil ??
            existing.InsuranceValidUntil;

        existing.AdditionalNotes =
            updated.AdditionalNotes ??
            existing.AdditionalNotes;

        await _repository.UpdateAsync(existing);

        return existing;
    }

    public async Task<Patient> CreatePatientAsync(Patient patient)
    {
        if (
            string.IsNullOrWhiteSpace(patient.Name) &&
            (
                !string.IsNullOrWhiteSpace(patient.FirstName) ||
                !string.IsNullOrWhiteSpace(patient.LastName)
            ))
        {
            patient.Name =
                $"{patient.FirstName} {patient.LastName}".Trim();
        }
        else if (
            !string.IsNullOrWhiteSpace(patient.Name) &&
            string.IsNullOrWhiteSpace(patient.FirstName))
        {
            var parts = patient.Name.Split(' ');

            patient.FirstName =
                parts.Length > 0
                    ? parts[0]
                    : patient.Name;

            patient.LastName =
                parts.Length > 1
                    ? string.Join(" ", parts.Skip(1))
                    : string.Empty;
        }

        if (
            string.IsNullOrWhiteSpace(patient.PatientIdCode) ||
            await _repository.GetByIdCodeOrGuidAsync(
                patient.PatientIdCode) != null)
        {
            patient.PatientIdCode =
                $"PT-{Random.Shared.Next(10000, 99999)}";
        }

        if (
            string.IsNullOrWhiteSpace(patient.Mrn) ||
            await _repository.GetByIdCodeOrGuidAsync(
                patient.Mrn) != null)
        {
            patient.Mrn =
                $"MRN-2026-{Random.Shared.Next(10000, 99999)}";
        }

        if (string.IsNullOrWhiteSpace(patient.Avatar))
        {
            patient.Avatar =
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80";
        }

        if (string.IsNullOrWhiteSpace(patient.LastVisit))
        {
            patient.LastVisit =
                DateTime.UtcNow.ToString("MMM dd, yyyy hh:mm tt");
        }

        if (string.IsNullOrWhiteSpace(patient.CareUnit))
        {
            patient.CareUnit = "General Ward";
        }

        if (string.IsNullOrWhiteSpace(patient.FloorRoom))
        {
            patient.FloorRoom = "1st Floor - 101";
        }

        try
        {
            return await _repository.AddAsync(patient);
        }
        catch (Exception ex)
            when (
                ex.GetType().Name.Contains("DbUpdateException") ||
                (
                    ex.InnerException != null &&
                    ex.InnerException.GetType().Name.Contains("PostgresException")
                ))
        {
            patient.Id = Guid.NewGuid();
            patient.PatientIdCode =
                $"PT-{Random.Shared.Next(10000, 99999)}";
            patient.Mrn =
                $"MRN-2026-{Random.Shared.Next(10000, 99999)}";

            return await _repository.AddAsync(patient);
        }
    }

    public async Task<bool> DeletePatientAsync(string id)
    {
        var patient =
            await _repository.GetByIdCodeOrGuidAsync(id);

        if (patient == null)
            return false;

        await _repository.DeleteAsync(patient.Id);

        return true;
    }

    public async Task<PatientStatsDto> GetPatientStatsAsync(
        Guid? doctorId = null,
        Guid? nurseId = null)
    {
        return await _repository.GetPatientStatsAsync(
            doctorId,
            nurseId);
    }
}
