namespace ExchangeDocument.Common.Exceptions;

public sealed class NotFoundException : AppException
{
    public override int StatusCode => 404;

    public NotFoundException(string message, string? errorCode = null) : base(message)
        => ErrorCode = errorCode;
}
