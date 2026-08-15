using System;
using System.Security.Cryptography;
using System.Text;

namespace ConnectedCare.Application.Common.Security;

public static class PasswordHasher
{
    public static (string Hash, string Salt) CreatePasswordHash(string password)
    {
        using var hmac = new HMACSHA512();
        var salt = Convert.ToBase64String(hmac.Key);
        var hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));
        return (hash, salt);
    }

    public static bool VerifyPasswordHash(string password, string storedHash, string storedSalt)
    {
        if (string.IsNullOrWhiteSpace(storedSalt) || string.IsNullOrWhiteSpace(storedHash))
            return false;

        try
        {
            var key = Convert.FromBase64String(storedSalt);
            using var hmac = new HMACSHA512(key);
            var computedHashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            var computedHash = Convert.ToBase64String(computedHashBytes);

            return computedHash == storedHash;
        }
        catch
        {
            return false;
        }
    }
}
