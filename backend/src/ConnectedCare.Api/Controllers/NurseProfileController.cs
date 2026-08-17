using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Infrastructure.Persistence;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/nurse-profile")]
public class NurseProfileController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public NurseProfileController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await _context.NurseProfiles.FirstOrDefaultAsync();
        if (profile == null)
        {
            profile = new NurseProfileRecord();
            _context.NurseProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }
        return Ok(new { success = true, data = profile });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] NurseProfileRecord updated)
    {
        var profile = await _context.NurseProfiles.FirstOrDefaultAsync();
        if (profile == null)
        {
            _context.NurseProfiles.Add(updated);
        }
        else
        {
            profile.FullName = updated.FullName;
            profile.Email = updated.Email;
            profile.Phone = updated.Phone;
            profile.Role = updated.Role;
            profile.Department = updated.Department;
            profile.UnitWard = updated.UnitWard;
            profile.AboutMe = updated.AboutMe;
            profile.DefaultUnitWard = updated.DefaultUnitWard;
            profile.DefaultShift = updated.DefaultShift;
            profile.Theme = updated.Theme;
            profile.DateFormat = updated.DateFormat;
            profile.TimeFormat = updated.TimeFormat;
            profile.LicenseNumber = updated.LicenseNumber;
            profile.Qualification = updated.Qualification;
            profile.ExperienceText = updated.ExperienceText;
            profile.Specialization = updated.Specialization;
            profile.Certifications = updated.Certifications;
            profile.EmergencyContactName = updated.EmergencyContactName;
            profile.EmergencyContactPhone = updated.EmergencyContactPhone;
            profile.HomeAddress = updated.HomeAddress;
            profile.PersonalEmail = updated.PersonalEmail;
            profile.UpdatedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Nurse profile updated successfully", data = profile });
    }
}
