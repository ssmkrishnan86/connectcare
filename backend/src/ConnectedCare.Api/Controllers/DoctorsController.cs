using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Domain.Enums;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Application.Features.Doctors.DTOs;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public DoctorsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDoctors([FromQuery] string? search, [FromQuery] string? specialty)
    {
        var query = _context.Doctors
            .Include(d => d.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(d => d.Name.ToLower().Contains(searchLower) ||
                                     d.DoctorIdCode.ToLower().Contains(searchLower) ||
                                     d.Email.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(specialty) && specialty != "All")
        {
            query = query.Where(d => d.Specialty.ToLower() == specialty.ToLower());
        }

        var list = await query.ToListAsync();
        return Ok(ApiResponse<List<Doctor>>.Ok(list));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDoctorById(Guid id)
    {
        var doctor = await _context.Doctors
            .Include(d => d.User)
            .Include(d => d.PatientDoctors)
                .ThenInclude(pd => pd.Patient)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doctor == null)
        {
            return NotFound(ApiResponse<Doctor>.Fail("Doctor not found"));
        }
        return Ok(ApiResponse<Doctor>.Ok(doctor));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDoctorStats()
    {
        var doctors = await _context.Doctors.ToListAsync();
        var stats = new
        {
            totalDoctors = doctors.Count,
            active = doctors.Count(d => d.Status == DoctorStatus.Active),
            onLeave = doctors.Count(d => d.Status == DoctorStatus.OnLeave),
            inactive = doctors.Count(d => d.Status == DoctorStatus.Inactive),
            teleconsultation = doctors.Count(d => d.TeleconsultationEnabled),
            specialties = doctors.Select(d => d.Specialty).Distinct().Count()
        };
        return Ok(ApiResponse<object>.Ok(stats));
    }

    [HttpPost]
    public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorRequest request)
    {
        var calculatedName = !string.IsNullOrWhiteSpace(request.Name)
            ? request.Name.Trim()
            : $"{request.FirstName} {request.MiddleName} {request.LastName}".Replace("  ", " ").Trim();
        var doctorName = !string.IsNullOrWhiteSpace(calculatedName) ? calculatedName : "Dr. New Doctor";
        var doctorEmail = request.Email?.Trim() ?? $"doctor_{Guid.NewGuid():N}"[..10] + "@connectcare.org";
        var doctorPhone = request.Phone?.Trim() ?? "(512) 555-0100";
        var doctorAvatar = string.IsNullOrWhiteSpace(request.Avatar)
            ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
            : request.Avatar;

        // 1. Create the user's login/account information in `users`
        var username = !string.IsNullOrWhiteSpace(request.Username)
            ? request.Username.Trim().ToLower()
            : doctorEmail.Split('@')[0].ToLower().Replace(".", "_");

        var rawPassword = !string.IsNullOrWhiteSpace(request.Password) ? request.Password : "doctor123";

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == username || u.Email.ToLower() == doctorEmail.ToLower());
        User userAccount;

        if (existingUser != null)
        {
            userAccount = existingUser;
            userAccount.FullName = doctorName;
            userAccount.Phone = doctorPhone;
            userAccount.Avatar = doctorAvatar;
            userAccount.Role = "Doctor";
        }
        else
        {
            var (pwdHash, pwdSalt) = ConnectedCare.Application.Common.Security.PasswordHasher.CreatePasswordHash(rawPassword);
            userAccount = new User
            {
                Username = username,
                Email = doctorEmail,
                FullName = doctorName,
                Phone = doctorPhone,
                Avatar = doctorAvatar,
                PasswordHash = pwdHash,
                PasswordSalt = pwdSalt,
                Role = "Doctor",
                IsActive = true
            };
            _context.Users.Add(userAccount);
            await _context.SaveChangesAsync();
        }

        // 2. Assign the Doctor role through `user_role`
        var doctorRole = await _context.AppRoles.FirstOrDefaultAsync(r => r.RoleName == "Doctor");
        if (doctorRole == null)
        {
            doctorRole = new AppRole { RoleName = "Doctor", DisplayName = "Physician / Specialist", Description = "Doctor role", IsSystemRole = true };
            _context.AppRoles.Add(doctorRole);
            await _context.SaveChangesAsync();
        }

        if (!await _context.UserRoles.AnyAsync(ur => ur.UserId == userAccount.Id && ur.RoleId == doctorRole.Id))
        {
            _context.UserRoles.Add(new UserRole { UserId = userAccount.Id, RoleId = doctorRole.Id });
            await _context.SaveChangesAsync();
        }

        // 3. Create the corresponding record in `doctors` with `user_id`
        var newDoctor = new Doctor
        {
            UserId = userAccount.Id,
            DoctorIdCode = !string.IsNullOrWhiteSpace(request.DoctorIdCode) ? request.DoctorIdCode : $"DOC-{Random.Shared.Next(1000, 9999)}",
            Name = doctorName,
            FirstName = request.FirstName ?? string.Empty,
            MiddleName = request.MiddleName ?? string.Empty,
            LastName = request.LastName ?? string.Empty,
            Avatar = doctorAvatar,
            Specialty = request.Specialty ?? "General Medicine",
            SpecialtyIcon = request.SpecialtyIcon ?? "🩺",
            Department = request.Department ?? "Clinical Department",
            Role = request.Role ?? "Physician",
            EmploymentType = request.EmploymentType ?? "Full-Time Staff",
            ReportingTo = request.ReportingTo ?? "Medical Director",
            DateOfJoining = request.DateOfJoining ?? string.Empty,
            Location = request.Location ?? "Main Hospital Building",
            Phone = doctorPhone,
            Email = doctorEmail,
            Gender = request.Gender ?? string.Empty,
            Dob = request.Dob ?? string.Empty,
            MaritalStatus = request.MaritalStatus ?? string.Empty,
            BloodGroup = request.BloodGroup ?? string.Empty,
            Languages = request.Languages ?? string.Empty,
            StreetAddress = request.StreetAddress ?? string.Empty,
            City = request.City ?? string.Empty,
            State = request.State ?? string.Empty,
            ZipCode = request.ZipCode ?? string.Empty,
            EmergencyContactName = request.EmergencyContactName ?? string.Empty,
            EmergencyContactPhone = request.EmergencyContactPhone ?? string.Empty,
            EmergencyContactRelation = request.EmergencyContactRelation ?? string.Empty,
            LicenseNumber = request.LicenseNumber ?? string.Empty,
            LicenseState = request.LicenseState ?? string.Empty,
            LicenseExpiry = request.LicenseExpiry ?? string.Empty,
            NpiNumber = request.NpiNumber ?? string.Empty,
            MedicalDegree = request.MedicalDegree ?? string.Empty,
            Experience = request.Experience ?? "10 Years",
            AccessLevel = request.AccessLevel ?? "Full Clinical Access",
            PatientRecordsAccess = request.PatientRecordsAccess ?? true,
            PrescriptionRights = request.PrescriptionRights ?? true,
            CarePlanManagement = request.CarePlanManagement ?? true,
            AiOperations = request.AiOperations ?? true,
            Status = !string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<DoctorStatus>(request.Status, true, out var sVal) ? sVal : DoctorStatus.Active,
            TeleconsultationEnabled = request.TeleconsultationEnabled ?? true,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _context.Doctors.Add(newDoctor);
        await _context.SaveChangesAsync();

        newDoctor.User = userAccount;
        return Ok(ApiResponse<Doctor>.Ok(newDoctor, "Doctor created and assigned user account successfully"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDoctor(Guid id, [FromBody] UpdateDoctorRequest updatedDoctor)
    {
        var doctor = await _context.Doctors
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doctor == null)
        {
            return NotFound(ApiResponse<Doctor>.Fail("Doctor not found"));
        }

        if (!string.IsNullOrWhiteSpace(updatedDoctor.Name)) doctor.Name = updatedDoctor.Name;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.FirstName)) doctor.FirstName = updatedDoctor.FirstName;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.MiddleName)) doctor.MiddleName = updatedDoctor.MiddleName;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.LastName)) doctor.LastName = updatedDoctor.LastName;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Specialty)) doctor.Specialty = updatedDoctor.Specialty;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.SpecialtyIcon)) doctor.SpecialtyIcon = updatedDoctor.SpecialtyIcon;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Department)) doctor.Department = updatedDoctor.Department;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Role)) doctor.Role = updatedDoctor.Role;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.EmploymentType)) doctor.EmploymentType = updatedDoctor.EmploymentType;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.ReportingTo)) doctor.ReportingTo = updatedDoctor.ReportingTo;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.DateOfJoining)) doctor.DateOfJoining = updatedDoctor.DateOfJoining;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Location)) doctor.Location = updatedDoctor.Location;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Phone)) doctor.Phone = updatedDoctor.Phone;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Email)) doctor.Email = updatedDoctor.Email;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Gender)) doctor.Gender = updatedDoctor.Gender;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Dob)) doctor.Dob = updatedDoctor.Dob;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.MaritalStatus)) doctor.MaritalStatus = updatedDoctor.MaritalStatus;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.BloodGroup)) doctor.BloodGroup = updatedDoctor.BloodGroup;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Languages)) doctor.Languages = updatedDoctor.Languages;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.StreetAddress)) doctor.StreetAddress = updatedDoctor.StreetAddress;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.City)) doctor.City = updatedDoctor.City;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.State)) doctor.State = updatedDoctor.State;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.ZipCode)) doctor.ZipCode = updatedDoctor.ZipCode;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.EmergencyContactName)) doctor.EmergencyContactName = updatedDoctor.EmergencyContactName;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.EmergencyContactPhone)) doctor.EmergencyContactPhone = updatedDoctor.EmergencyContactPhone;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.EmergencyContactRelation)) doctor.EmergencyContactRelation = updatedDoctor.EmergencyContactRelation;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.LicenseNumber)) doctor.LicenseNumber = updatedDoctor.LicenseNumber;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.LicenseState)) doctor.LicenseState = updatedDoctor.LicenseState;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.LicenseExpiry)) doctor.LicenseExpiry = updatedDoctor.LicenseExpiry;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.NpiNumber)) doctor.NpiNumber = updatedDoctor.NpiNumber;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.MedicalDegree)) doctor.MedicalDegree = updatedDoctor.MedicalDegree;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Experience)) doctor.Experience = updatedDoctor.Experience;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.AccessLevel)) doctor.AccessLevel = updatedDoctor.AccessLevel;
        if (updatedDoctor.PatientRecordsAccess.HasValue) doctor.PatientRecordsAccess = updatedDoctor.PatientRecordsAccess.Value;
        if (updatedDoctor.PrescriptionRights.HasValue) doctor.PrescriptionRights = updatedDoctor.PrescriptionRights.Value;
        if (updatedDoctor.CarePlanManagement.HasValue) doctor.CarePlanManagement = updatedDoctor.CarePlanManagement.Value;
        if (updatedDoctor.AiOperations.HasValue) doctor.AiOperations = updatedDoctor.AiOperations.Value;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Status) && Enum.TryParse<DoctorStatus>(updatedDoctor.Status, true, out var updateSVal)) doctor.Status = updateSVal;
        if (updatedDoctor.TeleconsultationEnabled.HasValue) doctor.TeleconsultationEnabled = updatedDoctor.TeleconsultationEnabled.Value;
        if (!string.IsNullOrWhiteSpace(updatedDoctor.Avatar)) doctor.Avatar = updatedDoctor.Avatar;
        doctor.UpdatedDate = DateTime.UtcNow;

        // Sync with linked User entity
        if (doctor.User != null)
        {
            if (!string.IsNullOrWhiteSpace(updatedDoctor.Name)) doctor.User.FullName = updatedDoctor.Name;
            if (!string.IsNullOrWhiteSpace(updatedDoctor.Email)) doctor.User.Email = updatedDoctor.Email;
            if (!string.IsNullOrWhiteSpace(updatedDoctor.Phone)) doctor.User.Phone = updatedDoctor.Phone;
            if (!string.IsNullOrWhiteSpace(updatedDoctor.Avatar)) doctor.User.Avatar = updatedDoctor.Avatar;
            doctor.User.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Doctor>.Ok(doctor, "Doctor updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDoctor(Guid id)
    {
        var doctor = await _context.Doctors
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doctor == null)
        {
            return NotFound(ApiResponse<string>.Fail("Doctor not found"));
        }

        var linkedUser = doctor.User;
        _context.Doctors.Remove(doctor);

        if (linkedUser != null)
        {
            // Remove associated user_role and user
            var userRoles = await _context.UserRoles.Where(ur => ur.UserId == linkedUser.Id).ToListAsync();
            _context.UserRoles.RemoveRange(userRoles);
            _context.Users.Remove(linkedUser);
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Doctor and associated user account removed successfully"));
    }
}
