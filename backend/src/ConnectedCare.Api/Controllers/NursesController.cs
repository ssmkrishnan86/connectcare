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
        var nurseName = request.Name?.Trim() ?? "Nurse New";
        var nurseEmail = request.Email?.Trim() ?? $"nurse_{Guid.NewGuid():N}"[..10] + "@connectcare.org";
        var nursePhone = request.Phone?.Trim() ?? "(512) 555-0101";
        var nurseAvatar = string.IsNullOrWhiteSpace(request.Avatar)
            ? "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
            : request.Avatar;

        // 1. Create the user's login/account information in `users`
        var username = !string.IsNullOrWhiteSpace(request.Username)
            ? request.Username.Trim().ToLower()
            : nurseEmail.Split('@')[0].ToLower().Replace(".", "_");

        var rawPassword = !string.IsNullOrWhiteSpace(request.Password) ? request.Password : "nurse123";

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == username || u.Email.ToLower() == nurseEmail.ToLower());
        User userAccount;

        if (existingUser != null)
        {
            userAccount = existingUser;
            userAccount.FullName = nurseName;
            userAccount.Phone = nursePhone;
            userAccount.Avatar = nurseAvatar;
            userAccount.Role = "Nurse";
        }
        else
        {
            var (pwdHash, pwdSalt) = ConnectedCare.Application.Common.Security.PasswordHasher.CreatePasswordHash(rawPassword);
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
            Avatar = nurseAvatar,
            Department = request.Department ?? "General Ward",
            SubUnit = request.SubUnit ?? "Floor 2",
            Location = request.Location ?? "Main Hospital Building",
            Shift = request.Shift ?? "Day Shift (08:00 AM - 04:00 PM)",
            AssignedUnit = request.AssignedUnit ?? "Unit A",
            Phone = nursePhone,
            Email = nurseEmail,
            Status = !string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<DoctorStatus>(request.Status, true, out var nVal) ? nVal : DoctorStatus.Active,
            Experience = request.Experience ?? "5 Years",
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

        if (!string.IsNullOrWhiteSpace(updatedNurse.Name)) nurse.Name = updatedNurse.Name;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Department)) nurse.Department = updatedNurse.Department;
        if (!string.IsNullOrWhiteSpace(updatedNurse.SubUnit)) nurse.SubUnit = updatedNurse.SubUnit;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Location)) nurse.Location = updatedNurse.Location;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Shift)) nurse.Shift = updatedNurse.Shift;
        if (!string.IsNullOrWhiteSpace(updatedNurse.AssignedUnit)) nurse.AssignedUnit = updatedNurse.AssignedUnit;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Phone)) nurse.Phone = updatedNurse.Phone;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Email)) nurse.Email = updatedNurse.Email;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Experience)) nurse.Experience = updatedNurse.Experience;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Status) && Enum.TryParse<DoctorStatus>(updatedNurse.Status, true, out var updateNVal)) nurse.Status = updateNVal;
        if (!string.IsNullOrWhiteSpace(updatedNurse.Avatar)) nurse.Avatar = updatedNurse.Avatar;
        nurse.UpdatedDate = DateTime.UtcNow;

        // Sync with linked User entity
        if (nurse.User != null)
        {
            if (!string.IsNullOrWhiteSpace(updatedNurse.Name)) nurse.User.FullName = updatedNurse.Name;
            if (!string.IsNullOrWhiteSpace(updatedNurse.Email)) nurse.User.Email = updatedNurse.Email;
            if (!string.IsNullOrWhiteSpace(updatedNurse.Phone)) nurse.User.Phone = updatedNurse.Phone;
            if (!string.IsNullOrWhiteSpace(updatedNurse.Avatar)) nurse.User.Avatar = updatedNurse.Avatar;
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
}
