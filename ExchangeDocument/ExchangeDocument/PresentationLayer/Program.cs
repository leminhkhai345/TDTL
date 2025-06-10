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
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Cors;
using Google_GenerativeAI;
using Google_GenerativeAI.Tools;

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

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });
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
            // Register NotificationRepository and NotificationService
            builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
            builder.Services.AddScoped<INotificationService, NotificationService>();
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
            // Register Listing repositories & services
            builder.Services.AddScoped<IListingRepository, ListingRepository>();
            builder.Services.AddScoped<ISystemStatusRepository, SystemStatusRepository>();
            builder.Services.AddScoped<IListingService, ListingService>();
            // Statistics
            builder.Services.AddScoped<IAdminStatisticsService, AdminStatisticsService>();
            builder.Services.AddScoped<IUserStatisticsService, UserStatisticsService>();
            // Payment methods
            builder.Services.AddScoped<IPaymentMethodRepository, PaymentMethodRepository>();
            builder.Services.AddScoped<IPaymentMethodService, PaymentMethodService>();
            // Order dependencies
            builder.Services.AddScoped<IOrderRepository, OrderRepository>();
            builder.Services.AddScoped<IOrderService, OrderService>();
            // Review dependencies
            builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
            builder.Services.AddScoped<IReviewService, ReviewService>();
            // File storage for review evidences
            builder.Services.AddScoped<IFileStorageService, FileStorageService>();
            // --------- Chatbot ---------
            builder.Services.AddHttpClient();
            // Đăng ký singleton GenerativeModel
            builder.Services.AddSingleton<GenerativeModel>(sp =>
            {
                var cfg = sp.GetRequiredService<IConfiguration>();
                var apiKey = cfg["Chatbot:Gemini:GeminiAPIKey"];
                // Model name theo chuẩn Google AI
                var model = new GenerativeModel(apiKey: apiKey, modelName: "models/gemini-1.5-flash");
                // Bật các công cụ hỗ trợ tìm kiếm & grounding
                model.UseGoogleSearch = true;
                model.UseGrounding = true;
                // Bật function calling tự động nếu có tool
                model.FunctionCallingBehaviour.AutoCallFunction = true;
                model.FunctionCallingBehaviour.AutoReplyFunction = true;

                // Đăng ký tool GetOrderSummary
                var quickTool = new QuickTool(
                    async (ExchangeDocument.BusinessLayer.DTOs.OrderSummaryRequest req) =>
                    {
                        var dbCtx = sp.GetRequiredService<ExchangeDocument.DataAccessLayer.Data.ExchangeDocumentContext>();
                        var order = await dbCtx.Orders.AsNoTracking()
                            .Include(o => o.OrderStatus)
                            .FirstOrDefaultAsync(o => o.OrderId == req.OrderId);
                        if (order == null) return null;
                        return new ExchangeDocument.BusinessLayer.DTOs.OrderSummaryResponse
                        {
                            OrderId = order.OrderId,
                            Buyer = $"User#{order.BuyerId}",
                            Seller = $"User#{order.SellerId}",
                            TotalAmount = order.TotalAmount,
                            Status = order.OrderStatus?.Name
                        };
                    },
                    "GetOrderSummary",
                    "Lấy thông tin tóm tắt đơn hàng"
                );
                model.AddFunctionTool(quickTool);
                return model;
            });
            builder.Services.AddScoped<IChatbotService, ChatbotService>();
            // Register mapper if using AutoMapper or manually map in service/controller
            // builder.Services.AddAutoMapper(typeof(MappingProfile));
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();

            // --------- CORS ---------
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });

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
            app.UseMiddleware<ExchangeDocument.Middlewares.ErrorHandlingMiddleware>();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            else
            {
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            // Serve files in wwwroot (e.g., /images/*) so uploaded proofs are publicly accessible
            app.UseStaticFiles();
            app.UseAuthentication();
            app.UseAuthorization();
            // Enable CORS
            app.UseCors("AllowAll");
            app.MapControllers();

            app.Run();
        }
    }
}
