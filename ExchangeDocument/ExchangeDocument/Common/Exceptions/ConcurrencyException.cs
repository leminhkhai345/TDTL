namespace ExchangeDocument.Common.Exceptions;

public sealed class ConcurrencyException : AppException
{
    public override int StatusCode => 409;
    public ConcurrencyException(string message, string? errorCode = null) : base(message)
    {
        ErrorCode = errorCode;
    }
}
