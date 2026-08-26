using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.Nurses.DTOs;

namespace ConnectedCare.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class NursesController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public NursesController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetNurses([FromQuery] string? search)
    {
        var query = _context.Nurses
            .Include(n => n.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(n => n.Name.ToLower().Contains(searchLower) ||
                                     n.NurseIdCode.ToLower().Contains(searchLower) ||
                                     n.Department.ToLower().Contains(searchLower) ||
                                     n.Email.ToLower().Contains(searchLower));
        }

        var list = await query.ToListAsync();
        return Ok(ApiResponse<List<Nurse>>.Ok(list));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetNurseById(Guid id)
    {
        var nurse = await _context.Nurses
            .Include(n => n.User)
            .Include(n => n.PatientNurses)
                .ThenInclude(pn => pn.Patient)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (nurse == null)
        {
            return NotFound(ApiResponse<Nurse>.Fail("Nurse not found"));
        }
        return Ok(ApiResponse<Nurse>.Ok(nurse));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetNurseStats()
    {
        var nurses = await _context.Nurses.ToListAsync();
        var stats = new
        {
            totalNurses = nurses.Count,
            active = nurses.Count(n => n.Status == DoctorStatus.Active),
            onLeave = nurses.Count(n => n.Status == DoctorStatus.OnLeave),
            inactive = nurses.Count(n => n.Status == DoctorStatus.Inactive),
            departments = nurses.Select(n => n.Department).Distinct().Count(),
            certificationsDue = 7
        };
        return Ok(ApiResponse<object>.Ok(stats));
    }

    [HttpPost]
    public async Task<IActionResult> CreateNurse([FromBody] CreateNurseRequest request)
    {
        var nurseName = !string.IsNullOrWhiteSpace(request.Name)
            ? request.Name.Trim()
            : $"{request.FirstName} {request.MiddleName} {request.LastName}".Replace("  ", " ").Trim();

        if (string.IsNullOrWhiteSpace(nurseName)) nurseName = "Nurse Practitioner";

        var nurseEmail = request.Email?.Trim() ?? $"nurse_{Guid.NewGuid():N}"[..10] + "@connectcare.org";
        var nursePhone = request.Phone?.Trim() ?? "(512) 555-0101";
        var nurseAvatar = request.Avatar?.Trim() ?? string.Empty;

        // 1. Create the user's login/account information in `users`
        var username = !string.IsNullOrWhiteSpace(request.Username)
            ? request.Username.Trim().ToLower()
            : nurseEmail.Split('@')[0].ToLower().Replace(".", "_");

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == username || u.Email.ToLower() == nurseEmail.ToLower());
        User userAccount;

        if (existingUser != null)
        {
            userAccount = existingUser;
            userAccount.FullName = nurseName;
            userAccount.Phone = nursePhone;
            userAccount.Avatar = nurseAvatar;
            userAccount.Role = "Nurse";
            userAccount.IsActive = true;
            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                var (pwdHash, pwdSalt) = ConnectedCare.Application.Common.Security.PasswordHasher.CreatePasswordHash(request.Password);
                userAccount.PasswordHash = pwdHash;
                userAccount.PasswordSalt = pwdSalt;
            }
            await _context.SaveChangesAsync();
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { success = false, message = "Password is required to create a new nurse account." });
            }

            var (pwdHash, pwdSalt) = ConnectedCare.Application.Common.Security.PasswordHasher.CreatePasswordHash(request.Password);

            userAccount = new User
            {
                Username = username,
                Email = nurseEmail,
                FullName = nurseName,
                Phone = nursePhone,
                Avatar = nurseAvatar,
                PasswordHash = pwdHash,
                PasswordSalt = pwdSalt,
                Role = "Nurse",
                IsActive = true
            };
            _context.Users.Add(userAccount);
            await _context.SaveChangesAsync();
        }

        // 2. Assign the Nurse role through `user_role`
        var nurseRole = await _context.AppRoles.FirstOrDefaultAsync(r => r.RoleName == "Nurse");
        if (nurseRole == null)
        {
            nurseRole = new AppRole { RoleName = "Nurse", DisplayName = "Staff Nurse", Description = "Nurse role", IsSystemRole = true };
            _context.AppRoles.Add(nurseRole);
            await _context.SaveChangesAsync();
        }

        if (!await _context.UserRoles.AnyAsync(ur => ur.UserId == userAccount.Id && ur.RoleId == nurseRole.Id))
        {
            _context.UserRoles.Add(new UserRole { UserId = userAccount.Id, RoleId = nurseRole.Id });
            await _context.SaveChangesAsync();
        }

        // 3. Create the corresponding record in `nurses` with `user_id`
        var newNurse = new Nurse
        {
            UserId = userAccount.Id,
            NurseIdCode = !string.IsNullOrWhiteSpace(request.NurseIdCode) ? request.NurseIdCode : $"NRS-{Random.Shared.Next(1000, 9999)}",
            Name = nurseName,
            FirstName = request.FirstName ?? "",
            MiddleName = request.MiddleName ?? "",
            LastName = request.LastName ?? "",
            Gender = request.Gender ?? "",
            Dob = request.Dob ?? "",
            MaritalStatus = request.MaritalStatus ?? "",
            BloodGroup = request.BloodGroup ?? "",
            Languages = request.Languages ?? "",
            Avatar = nurseAvatar,
            Department = request.Department ?? "General Ward",
            SubUnit = request.SubUnit ?? "Floor 2",
            Role = request.Role ?? "Nurse",
            EmploymentType = request.EmploymentType ?? "Full-Time Staff",
            ReportingTo = request.ReportingTo ?? "Head Nurse",
            DateOfJoining = request.DateOfJoining ?? "",
            Location = request.Location ?? "Main Hospital Building",
            Shift = request.Shift ?? "Day Shift (08:00 AM - 04:00 PM)",
            AssignedUnit = request.AssignedUnit ?? "Unit A",
            Phone = nursePhone,
            Email = nurseEmail,
            StreetAddress = request.StreetAddress ?? "",
            City = request.City ?? "",
            State = request.State ?? "",
            ZipCode = request.ZipCode ?? "",
            LicenseNumber = request.LicenseNumber ?? "",
            LicenseState = request.LicenseState ?? "",
            LicenseExpiry = request.LicenseExpiry ?? "",
            Certifications = request.Certifications ?? "BLS, ACLS",
            Experience = request.Experience ?? "5 Years",
            CarePlanUpdates = request.CarePlanUpdates ?? true,
            VitalMonitoring = request.VitalMonitoring ?? true,
            MedicationAdministration = request.MedicationAdministration ?? true,
            ShiftHandover = request.ShiftHandover ?? true,
            Status = !string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<DoctorStatus>(request.Status, true, out var nVal) ? nVal : DoctorStatus.Active,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _context.Nurses.Add(newNurse);
        await _context.SaveChangesAsync();

        newNurse.User = userAccount;
        return Ok(ApiResponse<Nurse>.Ok(newNurse, "Nurse created and assigned user account successfully"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateNurse(Guid id, [FromBody] UpdateNurseRequest updatedNurse)
    {
        var nurse = await _context.Nurses
            .Include(n => n.User)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (nurse == null)
        {
            return NotFound(ApiResponse<Nurse>.Fail("Nurse not found"));
        }

        if (!string.IsNullOrWhiteSpace(updatedNurse.FirstName)) nurse.FirstName = updatedNurse.FirstName;
        if (updatedNurse.MiddleName != null) nurse.MiddleName = updatedNurse.MiddleName;
        if (!string.IsNullOrWhiteSpace(updatedNurse.LastName)) nurse.LastName = updatedNurse.LastName;

        if (!string.IsNullOrWhiteSpace(updatedNurse.Name))
        {
            nurse.Name = updatedNurse.Name;
        }
        else if (!string.IsNullOrWhiteSpace(nurse.FirstName) || !string.IsNullOrWhiteSpace(nurse.LastName))
        {
            nurse.Name = $"{nurse.FirstName} {nurse.MiddleName} {nurse.LastName}".Replace("  ", " ").Trim();
        }

        if (updatedNurse.Gender != null) nurse.Gender = updatedNurse.Gender;
        if (updatedNurse.Dob != null) nurse.Dob = updatedNurse.Dob;
        if (updatedNurse.MaritalStatus != null) nurse.MaritalStatus = updatedNurse.MaritalStatus;
        if (updatedNurse.BloodGroup != null) nurse.BloodGroup = updatedNurse.BloodGroup;
        if (updatedNurse.Languages != null) nurse.Languages = updatedNurse.Languages;

        if (!string.IsNullOrWhiteSpace(updatedNurse.Department)) nurse.Department = updatedNurse.Department;
        if (!string.IsNullOrWhiteSpace(updatedNurse.SubUnit)) nurse.SubUnit = updatedNurse.SubUnit;
        if (updatedNurse.Role != null) nurse.Role = updatedNurse.Role;
        if (updatedNurse.EmploymentType != null) nurse.EmploymentType = updatedNurse.EmploymentType;
        if (updatedNurse.ReportingTo != null) nurse.ReportingTo = updatedNurse.ReportingTo;
        if (updatedNurse.DateOfJoining != null) nurse.DateOfJoining = updatedNurse.DateOfJoining;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Location)) nurse.Location = updatedNurse.Location;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Shift)) nurse.Shift = updatedNurse.Shift;
        if (!string.IsNullOrWhiteSpace(updatedNurse.AssignedUnit)) nurse.AssignedUnit = updatedNurse.AssignedUnit;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Phone)) nurse.Phone = updatedNurse.Phone;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Email)) nurse.Email = updatedNurse.Email;

        if (updatedNurse.StreetAddress != null) nurse.StreetAddress = updatedNurse.StreetAddress;
        if (updatedNurse.City != null) nurse.City = updatedNurse.City;
        if (updatedNurse.State != null) nurse.State = updatedNurse.State;
        if (updatedNurse.ZipCode != null) nurse.ZipCode = updatedNurse.ZipCode;

        if (updatedNurse.LicenseNumber != null) nurse.LicenseNumber = updatedNurse.LicenseNumber;
        if (updatedNurse.LicenseState != null) nurse.LicenseState = updatedNurse.LicenseState;
        if (updatedNurse.LicenseExpiry != null) nurse.LicenseExpiry = updatedNurse.LicenseExpiry;
        if (updatedNurse.Certifications != null) nurse.Certifications = updatedNurse.Certifications;

        if (updatedNurse.CarePlanUpdates.HasValue) nurse.CarePlanUpdates = updatedNurse.CarePlanUpdates.Value;
        if (updatedNurse.VitalMonitoring.HasValue) nurse.VitalMonitoring = updatedNurse.VitalMonitoring.Value;
        if (updatedNurse.MedicationAdministration.HasValue) nurse.MedicationAdministration = updatedNurse.MedicationAdministration.Value;
        if (updatedNurse.ShiftHandover.HasValue) nurse.ShiftHandover = updatedNurse.ShiftHandover.Value;

        if (!string.IsNullOrWhiteSpace(updatedNurse.Experience)) nurse.Experience = updatedNurse.Experience;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Status) && Enum.TryParse<DoctorStatus>(updatedNurse.Status, true, out var updateNVal)) nurse.Status = updateNVal;
        if (updatedNurse.Avatar != null) nurse.Avatar = updatedNurse.Avatar;
        nurse.UpdatedDate = DateTime.UtcNow;

        // Sync with linked User entity
        if (nurse.User != null)
        {
            if (!string.IsNullOrWhiteSpace(nurse.Name)) nurse.User.FullName = nurse.Name;
            if (!string.IsNullOrWhiteSpace(updatedNurse.Email)) nurse.User.Email = updatedNurse.Email;
            if (!string.IsNullOrWhiteSpace(updatedNurse.Phone)) nurse.User.Phone = updatedNurse.Phone;
            if (updatedNurse.Avatar != null) nurse.User.Avatar = updatedNurse.Avatar;
            nurse.User.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Nurse>.Ok(nurse, "Nurse updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNurse(Guid id)
    {
        var nurse = await _context.Nurses
            .Include(n => n.User)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (nurse == null)
        {
            return NotFound(ApiResponse<string>.Fail("Nurse not found"));
        }

        var linkedUser = nurse.User;
        _context.Nurses.Remove(nurse);

        if (linkedUser != null)
        {
            var userRoles = await _context.UserRoles.Where(ur => ur.UserId == linkedUser.Id).ToListAsync();
            _context.UserRoles.RemoveRange(userRoles);
            _context.Users.Remove(linkedUser);
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Nurse and associated user account removed successfully"));
    }

    [HttpGet("{id}/patients")]
    public async Task<IActionResult> GetNursePatients(Guid id)
    {
        var nurse = await _context.Nurses.FirstOrDefaultAsync(n => n.Id == id);
        if (nurse == null)
        {
            return NotFound(ApiResponse<string>.Fail("Nurse not found"));
        }

        var assignedPatientIds = await _context.PatientNurses
            .Where(pn => pn.NurseId == id)
            .Select(pn => pn.PatientId)
            .ToListAsync();

        var patients = await _context.Patients
            .Include(p => p.PrimaryDoctor)
            .Where(p => assignedPatientIds.Contains(p.Id))
            .OrderByDescending(p => p.CreatedDate)
            .ToListAsync();

        return Ok(ApiResponse<List<Patient>>.Ok(patients));
    }

    [HttpPost("{id}/assign-patient")]
    public async Task<IActionResult> AssignPatientToNurse(Guid id, [FromBody] AssignPatientToNurseRequest request)
    {
        var nurse = await _context.Nurses.FirstOrDefaultAsync(n => n.Id == id);
        if (nurse == null)
        {
            return NotFound(ApiResponse<string>.Fail("Nurse not found"));
        }

        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == request.PatientId);
        if (patient == null)
        {
            return NotFound(ApiResponse<string>.Fail("Patient not found"));
        }

        var existing = await _context.PatientNurses.FirstOrDefaultAsync(pn => pn.NurseId == id && pn.PatientId == request.PatientId);
        if (existing == null)
        {
            existing = new PatientNurse
            {
                NurseId = id,
                PatientId = request.PatientId,
                IsPrimary = request.IsPrimary,
                Shift = request.Shift ?? nurse.Shift ?? "Day Shift",
                AssignedDate = DateTime.UtcNow,
                Notes = request.Notes ?? "Assigned nurse care"
            };
            _context.PatientNurses.Add(existing);
        }
        else
        {
            existing.IsPrimary = request.IsPrimary;
            if (!string.IsNullOrWhiteSpace(request.Shift)) existing.Shift = request.Shift;
            if (!string.IsNullOrWhiteSpace(request.Notes)) existing.Notes = request.Notes;
            existing.UpdatedDate = DateTime.UtcNow;
        }

        patient.AssignedNurseId = id;
        patient.AssignedNurseName = nurse.Name;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<PatientNurse>.Ok(existing, "Patient assigned to nurse successfully"));
    }

    [HttpDelete("{id}/patients/{patientId}")]
    public async Task<IActionResult> RemovePatientFromNurse(Guid id, Guid patientId)
    {
        var existing = await _context.PatientNurses.FirstOrDefaultAsync(pn => pn.NurseId == id && pn.PatientId == patientId);
        if (existing != null)
        {
            _context.PatientNurses.Remove(existing);
            
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == patientId);
            if (patient != null && patient.AssignedNurseId == id)
            {
                patient.AssignedNurseId = null;
                patient.AssignedNurseName = string.Empty;
            }

            await _context.SaveChangesAsync();
        }

        return Ok(ApiResponse<string>.Ok("Patient removed from nurse successfully"));
    }
}

public record AssignPatientToNurseRequest(
    Guid PatientId,
    bool IsPrimary = false,
    string? Shift = null,
    string? Notes = null
);
