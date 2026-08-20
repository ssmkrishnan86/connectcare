using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConnectedCare.Application.Services;
using ConnectedCare.Domain.Entities;
using ConnectedCare.Application.Common.Models;
using ConnectedCare.Infrastructure.Persistence;

namespace ConnectedCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CareTeamsController : ControllerBase
{
    private readonly ConnectedCareDbContext _context;

    public CareTeamsController(ConnectedCareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCareTeamMembers()
    {
        var members = await _context.CareTeamMembers.ToListAsync();
        return Ok(ApiResponse<List<CareTeamMember>>.Ok(members));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCareTeamMemberById(Guid id)
    {
        var member = await _context.CareTeamMembers.FindAsync(id);
        if (member == null)
        {
            return NotFound(ApiResponse<CareTeamMember>.Fail("Care team member not found"));
        }
        return Ok(ApiResponse<CareTeamMember>.Ok(member));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCareTeamMember([FromBody] CareTeamMember newMember)
    {
        if (string.IsNullOrWhiteSpace(newMember.MemberIdCode))
        {
            newMember.MemberIdCode = $"CTM-{Random.Shared.Next(1000, 9999)}";
        }
        if (string.IsNullOrWhiteSpace(newMember.Avatar))
        {
            newMember.Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
        }
        newMember.CreatedDate = DateTime.UtcNow;
        newMember.UpdatedDate = DateTime.UtcNow;

        _context.CareTeamMembers.Add(newMember);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<CareTeamMember>.Ok(newMember, "Care team member added successfully"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCareTeamMember(Guid id, [FromBody] CareTeamMember updatedMember)
    {
        var member = await _context.CareTeamMembers.FindAsync(id);
        if (member == null)
        {
            return NotFound(ApiResponse<CareTeamMember>.Fail("Care team member not found"));
        }

        member.Name = updatedMember.Name;
        member.Role = updatedMember.Role;
        member.Department = updatedMember.Department;
        member.Location = updatedMember.Location;
        member.Phone = updatedMember.Phone;
        member.Email = updatedMember.Email;
        member.Shift = updatedMember.Shift;
        member.Status = updatedMember.Status;
        if (!string.IsNullOrWhiteSpace(updatedMember.Avatar))
        {
            member.Avatar = updatedMember.Avatar;
        }
        member.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<CareTeamMember>.Ok(member, "Care team member updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCareTeamMember(Guid id)
    {
        var member = await _context.CareTeamMembers.FindAsync(id);
        if (member == null)
        {
            return NotFound(ApiResponse<string>.Fail("Care team member not found"));
        }

        _context.CareTeamMembers.Remove(member);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Care team member removed successfully"));
    }
}
