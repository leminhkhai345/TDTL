using System;
using System.Net;

namespace ExchangeDocument.Common.Exceptions;

/// <summary>
/// Base class for all domain/application exceptions that should be translated to a specific HTTP status.
/// </summary>
public abstract class AppException : Exception
{
    /// <summary>
    ///     HTTP status code that will be sent to client.
    /// </summary>
    public abstract int StatusCode { get; }

    /// <summary>
    ///     Optional machine-readable error code (e.g. ORDER_NOT_FOUND).
    /// </summary>
    public string? ErrorCode { get; init; }

    protected AppException(string message) : base(message) { }
}
