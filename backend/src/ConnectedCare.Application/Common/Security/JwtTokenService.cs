using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ConnectedCare.Domain.Entities;

namespace ConnectedCare.Application.Common.Security;

public static class JwtTokenService
{
    public static string GenerateToken(
        User user,
        string secretKey,
        string issuer = "ConnectedCare",
        string audience = "ConnectedCare.Web",
        string? primaryRole = null,
        Guid? doctorId = null,
        Guid? nurseId = null)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(secretKey.PadRight(64, '0'));

        var role = !string.IsNullOrWhiteSpace(primaryRole) ? primaryRole : user.Role;

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, role),
            new Claim("role", role)
        };

        if (doctorId.HasValue && doctorId.Value != Guid.Empty)
        {
            claims.Add(new Claim("doctorId", doctorId.Value.ToString()));
        }

        if (nurseId.HasValue && nurseId.Value != Guid.Empty)
        {
            claims.Add(new Claim("nurseId", nurseId.Value.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(24),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
