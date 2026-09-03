using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/doctor-profile")]
public class DoctorProfileController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public DoctorProfileController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile([FromQuery] Guid? doctorId)
    {
        Doctor? doctor = null;

        // 1. Check explicit doctorId query parameter
        if (doctorId.HasValue && doctorId.Value != Guid.Empty)
        {
            doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == doctorId.Value);
        }

        // 2. Check authenticated user's claim
        if (doctor == null && User?.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("userId")?.Value;

            if (Guid.TryParse(userIdClaim, out var uId))
            {
                doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == uId);
            }
        }

        // 3. Check by user email
        if (doctor == null && User?.Identity?.IsAuthenticated == true)
        {
            var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                ?? User.FindFirst("email")?.Value;
            if (!string.IsNullOrEmpty(emailClaim))
            {
                doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Email.ToLower() == emailClaim.ToLower());
            }
        }

        // 4. Fallback to most recently created doctor
        if (doctor == null)
        {
            doctor = await _context.Doctors.OrderByDescending(d => d.CreatedDate).FirstOrDefaultAsync();
        }

        if (doctor == null)
        {
            doctor = new Doctor
            {
                Name = "Dr. Sarah Wilson",
                DoctorIdCode = "DOC-1001",
                Email = "sarah.wilson@connectcare.com",
                Phone = "+1 (555) 234-5678",
                Specialty = "Cardiology",
                Department = "Cardiology Department",
                Role = "Attending Physician",
                DateOfJoining = "Mar 10, 2021",
                LicenseNumber = "MD-987654",
                MedicalDegree = "M.D. Cardiology, FACC",
                Experience = "12 Years",
                EmergencyContactName = "Robert Wilson (Spouse)",
                EmergencyContactPhone = "+1 (555) 987-6543",
                StreetAddress = "742 Evergreen Terrace, Austin, TX 78701, USA",
                City = "Austin",
                State = "TX"
            };
            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();
        }

        var profileDto = new
        {
            id = doctor.Id,
            fullName = doctor.Name,
            employeeIdCode = doctor.DoctorIdCode,
            email = doctor.Email,
            phone = doctor.Phone,
            role = !string.IsNullOrWhiteSpace(doctor.Role) ? doctor.Role : "Attending Physician",
            department = !string.IsNullOrWhiteSpace(doctor.Department) ? doctor.Department : "Clinical Department",
            unitWard = !string.IsNullOrWhiteSpace(doctor.Specialty) ? doctor.Specialty : "General Medicine",
            dateOfJoining = !string.IsNullOrWhiteSpace(doctor.DateOfJoining) ? doctor.DateOfJoining : DateTime.Now.ToString("MMM dd, yyyy"),
            aboutMe = !string.IsNullOrWhiteSpace(doctor.Specialty) 
                ? $"Licensed physician specializing in {doctor.Specialty} with dedicated experience in clinical practice and patient care."
                : "Board-certified physician specializing in acute patient care.",
            avatar = doctor.Avatar,
            defaultUnitWard = !string.IsNullOrWhiteSpace(doctor.Department) ? doctor.Department : "Clinical Unit",
            defaultShift = "08:00 AM - 05:00 PM (Clinical Shift)",
            theme = "Light",
            dateFormat = "May 22, 2024 (MM/DD/YYYY)",
            timeFormat = "12 Hour (hh:mm A)",
            licenseNumber = !string.IsNullOrWhiteSpace(doctor.LicenseNumber) ? doctor.LicenseNumber : "MD-987654",
            qualification = !string.IsNullOrWhiteSpace(doctor.MedicalDegree) ? doctor.MedicalDegree : "M.D. Medicine",
            experienceText = !string.IsNullOrWhiteSpace(doctor.Experience) ? doctor.Experience : "10 Years",
            specialization = !string.IsNullOrWhiteSpace(doctor.Specialty) ? doctor.Specialty : "General Medicine",
            certifications = "Board Certified in Medical Practice, BLS, ACLS",
            emergencyContactName = !string.IsNullOrWhiteSpace(doctor.EmergencyContactName) ? doctor.EmergencyContactName : "Emergency Contact",
            emergencyContactPhone = !string.IsNullOrWhiteSpace(doctor.EmergencyContactPhone) ? doctor.EmergencyContactPhone : doctor.Phone,
            homeAddress = !string.IsNullOrWhiteSpace(doctor.StreetAddress) ? doctor.StreetAddress : "Main Hospital Campus, Austin, TX",
            personalEmail = doctor.Email
        };

        return Ok(new { success = true, data = profileDto });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] DoctorProfileUpdateDto updated, [FromQuery] Guid? doctorId)
    {
        Doctor? doctor = null;

        if (doctorId.HasValue && doctorId.Value != Guid.Empty)
        {
            doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == doctorId.Value);
        }

        if (doctor == null && User?.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("userId")?.Value;

            if (Guid.TryParse(userIdClaim, out var uId))
            {
                doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == uId);
            }
        }

        if (doctor == null)
        {
            doctor = await _context.Doctors.OrderByDescending(d => d.CreatedDate).FirstOrDefaultAsync();
        }

        if (doctor != null)
        {
            if (!string.IsNullOrWhiteSpace(updated.FullName)) doctor.Name = updated.FullName;
            if (!string.IsNullOrWhiteSpace(updated.Email)) doctor.Email = updated.Email;
            if (!string.IsNullOrWhiteSpace(updated.Phone)) doctor.Phone = updated.Phone;
            if (!string.IsNullOrWhiteSpace(updated.Role)) doctor.Role = updated.Role;
            if (!string.IsNullOrWhiteSpace(updated.Department)) doctor.Department = updated.Department;
            if (!string.IsNullOrWhiteSpace(updated.UnitWard)) doctor.Specialty = updated.UnitWard;
            if (!string.IsNullOrWhiteSpace(updated.LicenseNumber)) doctor.LicenseNumber = updated.LicenseNumber;
            if (!string.IsNullOrWhiteSpace(updated.Qualification)) doctor.MedicalDegree = updated.Qualification;
            if (!string.IsNullOrWhiteSpace(updated.ExperienceText)) doctor.Experience = updated.ExperienceText;
            if (!string.IsNullOrWhiteSpace(updated.Specialization)) doctor.Specialty = updated.Specialization;
            if (!string.IsNullOrWhiteSpace(updated.EmergencyContactName)) doctor.EmergencyContactName = updated.EmergencyContactName;
            if (!string.IsNullOrWhiteSpace(updated.EmergencyContactPhone)) doctor.EmergencyContactPhone = updated.EmergencyContactPhone;
            if (!string.IsNullOrWhiteSpace(updated.HomeAddress)) doctor.StreetAddress = updated.HomeAddress;
            if (updated.Avatar != null) doctor.Avatar = updated.Avatar;
            doctor.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, message = "Doctor profile updated successfully", data = updated });
    }
}

public class DoctorProfileUpdateDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Role { get; set; }
    public string? Department { get; set; }
    public string? UnitWard { get; set; }
    public string? AboutMe { get; set; }
    public string? DefaultUnitWard { get; set; }
    public string? DefaultShift { get; set; }
    public string? Theme { get; set; }
    public string? DateFormat { get; set; }
    public string? TimeFormat { get; set; }
    public string? LicenseNumber { get; set; }
    public string? Qualification { get; set; }
    public string? ExperienceText { get; set; }
    public string? Specialization { get; set; }
    public string? Certifications { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? HomeAddress { get; set; }
    public string? PersonalEmail { get; set; }
    public string? Avatar { get; set; }
}
