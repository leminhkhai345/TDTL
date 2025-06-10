using System.Collections.Generic;

namespace ExchangeDocument.Common.Exceptions;

public sealed class ValidationException : AppException
{
    public override int StatusCode => 400;

    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(string message, IDictionary<string, string[]>? errors = null, string? errorCode = null) : base(message)
    {
        Errors = errors ?? new Dictionary<string, string[]>();
        ErrorCode = errorCode;
    }
}
