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
    public async Task<IActionResult> GetProfile()
    {
        var doctor = await _context.Doctors.FirstOrDefaultAsync();
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
            role = doctor.Role,
            department = doctor.Department,
            unitWard = doctor.Specialty,
            dateOfJoining = !string.IsNullOrWhiteSpace(doctor.DateOfJoining) ? doctor.DateOfJoining : "Mar 10, 2021",
            aboutMe = "Board-certified Cardiologist with 12+ years of clinical experience specializing in cardiology and acute patient care.",
            avatar = doctor.Avatar,
            defaultUnitWard = "Cardiology Unit",
            defaultShift = "08:00 AM - 05:00 PM (Clinical Shift)",
            theme = "Light",
            dateFormat = "May 22, 2024 (MM/DD/YYYY)",
            timeFormat = "12 Hour (hh:mm A)",
            licenseNumber = !string.IsNullOrWhiteSpace(doctor.LicenseNumber) ? doctor.LicenseNumber : "MD-987654",
            qualification = !string.IsNullOrWhiteSpace(doctor.MedicalDegree) ? doctor.MedicalDegree : "M.D. Cardiology, FACC",
            experienceText = !string.IsNullOrWhiteSpace(doctor.Experience) ? doctor.Experience : "12 Years",
            specialization = !string.IsNullOrWhiteSpace(doctor.Specialty) ? doctor.Specialty : "Cardiovascular Medicine",
            certifications = "Board Certified in Cardiovascular Disease, BLS, ACLS",
            emergencyContactName = !string.IsNullOrWhiteSpace(doctor.EmergencyContactName) ? doctor.EmergencyContactName : "Robert Wilson (Spouse)",
            emergencyContactPhone = !string.IsNullOrWhiteSpace(doctor.EmergencyContactPhone) ? doctor.EmergencyContactPhone : "+1 (555) 987-6543",
            homeAddress = !string.IsNullOrWhiteSpace(doctor.StreetAddress) ? doctor.StreetAddress : "742 Evergreen Terrace, Austin, TX 78701, USA",
            personalEmail = doctor.Email
        };

        return Ok(new { success = true, data = profileDto });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] DoctorProfileUpdateDto updated)
    {
        var doctor = await _context.Doctors.FirstOrDefaultAsync();
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
