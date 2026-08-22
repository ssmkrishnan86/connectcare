namespace ConnectedCare.Application.Features.Settings.DTOs;

public record SaveRolePermissionsRequest(
    List<string> PermissionKeys,
    string? PermissionsMatrixJson
);
