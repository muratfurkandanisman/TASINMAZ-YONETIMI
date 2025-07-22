using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using System.Security.Claims;
using TASINMAZ.Dtos;
using TASINMAZ.Interfaces;
using TASINMAZ.Utilities;
using TASINMAZ.Data;
using TASINMAZ.Entities;

namespace TASINMAZ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;

        public AuthController(IAuthService authService, IConfiguration config, AppDbContext context)
        {
            _authService = authService;
            _config = config;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthDto dto)
        {
            var user = await _authService.ValidateUserAsync(dto.Email, dto.Password);
            if (user == null)
                return Unauthorized("Invalid credentials");

            var secret = _config["Jwt:Secret"];
            var token = TokenHelper.GenerateJwtToken(user, secret!);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                Role = user.Role.ToString()
            });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                int userId = int.Parse(userIdClaim.Value);

                // Log kaydı ekle
                await _context.Logs.AddAsync(new Log
                {
                    UserId = userId,
                    Durum = "Başarılı",
                    IslemTipi = "Çıkış",
                    Aciklama = "Kullanıcı çıkış yaptı",
                    Tarih = DateTime.UtcNow,
                    Saat = DateTime.UtcNow.TimeOfDay
                });
                await _context.SaveChangesAsync();
            }

            // JWT kullanıyorsanız, frontend token'ı silmeli.
            // Cookie tabanlı ise: await HttpContext.SignOutAsync();

            return Ok(new { message = "Çıkış başarılı." });
        }
    }
}
