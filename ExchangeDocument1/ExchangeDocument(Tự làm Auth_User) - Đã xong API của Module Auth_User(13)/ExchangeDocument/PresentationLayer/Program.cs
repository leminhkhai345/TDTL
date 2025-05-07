using Microsoft.EntityFrameworkCore;
using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using ExchangeDocument.DataAccessLayer.Repositories;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.BusinessLayer.Services;
using ExchangeDocument.BusinessLayer.Models;
using Serilog;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace ExchangeDocument.PresentationLayer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Configure Serilog for both console and file logging
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
                .CreateLogger();

            var builder = WebApplication.CreateBuilder(args);
            // Load additional config from PresentationLayer/appsettings.json
            builder.Configuration.AddJsonFile("PresentationLayer/appsettings.json", optional: false, reloadOnChange: true);
            // Use Serilog instead of default logging
            builder.Host.UseSerilog();

            // Add services to the container.

            builder.Services.AddControllers();
            // Đăng ký DbContext với chuỗi kết nối từ appsettings
            builder.Services.AddDbContext<ExchangeDocumentContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
            // Đăng ký Repository và Service cho Categories
            builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
            builder.Services.AddScoped<ICategoryService, CategoryService>();
            // Đăng ký Repository và Service cho Documents
            builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
            builder.Services.AddScoped<IDocumentService, DocumentService>();
            // Đăng ký Repository cho DocumentStatus
            builder.Services.AddScoped<IDocumentStatusRepository, DocumentStatusRepository>();
            // Register RoleRepository for admin user updates
            builder.Services.AddScoped<IRoleRepository, RoleRepository>();
            // --- Authentication Module Services ---
            builder.Services.AddMemoryCache();
            builder.Services.Configure<OtpSettings>(builder.Configuration.GetSection("OtpSettings"));
            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
            // Configure password reset token expiry settings
            builder.Services.Configure<PasswordResetSettings>(builder.Configuration.GetSection("PasswordResetSettings"));
            // Register JWT blacklist service
            builder.Services.AddScoped<IJwtBlacklistService, MemoryCacheJwtBlacklistService>();
            // JWT Authentication
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSettings.Issuer,
                        ValidAudience = jwtSettings.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                        ClockSkew = TimeSpan.Zero
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnTokenValidated = async context =>
                        {
                            var blacklistService = context.HttpContext.RequestServices.GetRequiredService<IJwtBlacklistService>();
                            var jti = context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Jti);
                            if (!string.IsNullOrEmpty(jti) && await blacklistService.IsBlacklistedAsync(jti))
                            {
                                context.Fail("Token has been revoked.");
                            }
                        }
                    };
                });
            builder.Services.AddAuthorization();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IEmailService, EmailService>();
            // Register UserService for profile endpoint
            builder.Services.AddScoped<IUserService, UserService>();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(options =>
            {
                // Define title and version (optional)
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "ExchangeDocument API", Version = "v1" });

                // Define the BearerAuth security scheme
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = @"JWT Authorization header using the Bearer scheme.
                                  Enter 'Bearer' [space] and then your token in the text input below.
                                  Example: 'Bearer 12345abcdef'",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey, // Use ApiKey for Bearer token
                    Scheme = "Bearer" // Must be lowercase "bearer"
                });

                // Make sure Swagger UI requires a Bearer token to be specified
                options.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer" // Must match the Id in AddSecurityDefinition
                            },
                            Scheme = "oauth2",
                            Name = "Bearer",
                            In = ParameterLocation.Header,
                        },
                        new List<string>()
                    }
                });
            });

            var app = builder.Build();

            // Log HTTP requests
            app.UseSerilogRequestLogging();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseDeveloperExceptionPage();  // Global error handling in Development
            }
            else
            {
                app.UseExceptionHandler("/error");  // Global error handling in Production
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
