namespace ConnectedCare.Application.Common.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = "Request executed successfully";
    public T? Data { get; set; }
    public string? ErrorCode { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Success")
    {
        return new ApiResponse<T> { Success = true, Data = data, Message = message };
    }

    public static ApiResponse<T> Fail(string message, string? errorCode = null)
    {
        return new ApiResponse<T> { Success = false, Message = message, ErrorCode = errorCode };
    }
}
