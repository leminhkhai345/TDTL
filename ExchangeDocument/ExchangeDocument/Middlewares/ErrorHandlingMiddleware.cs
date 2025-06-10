using System.Net;
using System.Text.Json;
using ExchangeDocument.Common.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;

namespace ExchangeDocument.Middlewares;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ConcurrencyException ex)
        {
            await HandleConcurrencyExceptionAsync(context, ex);
        }
        catch (ForbiddenException ex)
        {
            await HandleForbiddenAsync(context, ex);
        }
        catch (AppException ex)
        {
            await HandleAppExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            await HandleUnknownExceptionAsync(context, ex);
        }
    }

    private async Task HandleConcurrencyExceptionAsync(HttpContext ctx, ConcurrencyException ex)
    {
        _logger.LogWarning(ex, "Handled concurrency exception");

        var problem = new ProblemDetails
        {
            Status = (int)HttpStatusCode.Conflict,
            Title = "Concurrency Exception",
            Detail = ex.Message,
            Instance = ctx.Request.Path
        };

        ctx.Response.ContentType = "application/json";
        ctx.Response.StatusCode = (int)HttpStatusCode.Conflict;
        var json = JsonSerializer.Serialize(problem);
        await ctx.Response.WriteAsync(json);
    }

    private async Task HandleAppExceptionAsync(HttpContext ctx, AppException ex)
    {
        _logger.LogWarning(ex, "Handled app exception");

        var problem = new ProblemDetails
        {
            Status = ex.StatusCode,
            Title = ex.ErrorCode ?? "Error",
            Detail = ex.Message,
            Instance = ctx.Request.Path
        };

        if (ex is ValidationException valEx && valEx.Errors.Any())
            problem.Extensions["errors"] = valEx.Errors;

        ctx.Response.ContentType = "application/json";
        ctx.Response.StatusCode = ex.StatusCode;
        var json = JsonSerializer.Serialize(problem);
        await ctx.Response.WriteAsync(json);
    }

    private async Task HandleUnknownExceptionAsync(HttpContext ctx, Exception ex)
    {
        _logger.LogError(ex, "Unhandled exception");
        var problem = new ProblemDetails
        {
            Status = (int)HttpStatusCode.InternalServerError,
            Title = "Internal Server Error",
            Detail = _env.IsDevelopment() ? ex.ToString() : "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.",
            Instance = ctx.Request.Path
        };

        ctx.Response.ContentType = "application/json";
        ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        var json = JsonSerializer.Serialize(problem);
        await ctx.Response.WriteAsync(json);
    }

    private async Task HandleForbiddenAsync(HttpContext ctx, ForbiddenException ex)
    {
        _logger.LogWarning(ex, "Forbidden access");

        var problem = new ProblemDetails
        {
            Status = (int)HttpStatusCode.Forbidden,
            Title = "Forbidden",
            Detail = ex.Message,
            Instance = ctx.Request.Path
        };

        ctx.Response.ContentType = "application/json";
        ctx.Response.StatusCode = (int)HttpStatusCode.Forbidden;
        var json = JsonSerializer.Serialize(problem);
        await ctx.Response.WriteAsync(json);
    }
}
