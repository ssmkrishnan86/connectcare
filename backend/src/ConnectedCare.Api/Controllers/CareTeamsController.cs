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
}
