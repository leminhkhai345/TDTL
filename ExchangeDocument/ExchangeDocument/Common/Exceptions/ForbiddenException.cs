using System.Net;

namespace ExchangeDocument.Common.Exceptions;

public class ForbiddenException : AppException
{
    public override int StatusCode => (int)HttpStatusCode.Forbidden;
    public ForbiddenException(string message, string? errorCode = null) : base(message)
    {
        ErrorCode = errorCode;
    }
}
