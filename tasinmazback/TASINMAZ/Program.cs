using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Collections.Generic;
using System.Threading.Tasks;
using TASINMAZ.Dtos;
using TASINMAZ.Interfaces;
using OfficeOpenXml;

// Bu satýrý, builder oluþturulmadan önce ekle!
ExcelPackage.License.SetNonCommercialOrganization("TAÞINMAZ");

var builder = WebApplication.CreateBuilder(args);

// Set the EPPlus license context to non-commercial
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TASINMAZ API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Add DbContext with PostgreSQL
builder.Services.AddDbContext<TASINMAZ.Data.AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication settings
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "çok-gizli-bir-anahtar";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme; // Default authentication scheme
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;    // Default challenge scheme
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false, // Issuer validation disabled (for development)
        ValidateAudience = false, // Audience validation disabled (for development)
        ValidateLifetime = true, // Validate token lifetime
        ValidateIssuerSigningKey = true, // Enable key validation
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)) // Key for JWT signature
    };
});

// Add your custom services

builder.Services.AddScoped<TASINMAZ.Interfaces.ITasinmazService, TASINMAZ.Services.TasinmazService>();
builder.Services.AddScoped<TASINMAZ.Interfaces.IMahalleService, TASINMAZ.Services.MahalleService>();
builder.Services.AddScoped<TASINMAZ.Interfaces.IIlceService, TASINMAZ.Services.IlceService>();
builder.Services.AddScoped<TASINMAZ.Interfaces.IUserService, TASINMAZ.Services.UserService>();
builder.Services.AddScoped<TASINMAZ.Interfaces.IIlService, TASINMAZ.Services.IlService>();
builder.Services.AddScoped<TASINMAZ.Interfaces.ILogService, TASINMAZ.Services.LogService>();
builder.Services.AddScoped<TASINMAZ.Interfaces.IAuthService, TASINMAZ.Services.AuthService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // Angular'ýn çalýþtýðý port
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();