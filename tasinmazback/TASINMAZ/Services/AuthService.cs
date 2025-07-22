using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TASINMAZ.Data;
using TASINMAZ.Dtos;
using TASINMAZ.Entities;
using TASINMAZ.Utilities;
using TASINMAZ.Interfaces;

namespace TASINMAZ.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;

        public AuthService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> ValidateUserAsync(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                // Kullanıcı bulunamadıysa logla
                await _context.Logs.AddAsync(new Log
                {
                    UserId = 0, // Bilinmeyen kullanıcı için 0 veya -1 kullanabilirsiniz
                    Durum = "Başarısız",
                    IslemTipi = "Giriş",
                    Aciklama = $"Giriş başarısız: Kullanıcı bulunamadı ({email})",
                    Tarih = DateTime.UtcNow,
                    Saat = DateTime.UtcNow.TimeOfDay
                });
                await _context.SaveChangesAsync();
                return null;
            }

            using var hmac = new System.Security.Cryptography.HMACSHA256(user.PasswordSalt);
            var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            if (!computedHash.SequenceEqual(user.PasswordHash))
            {
                // Şifre hatalıysa logla
                await _context.Logs.AddAsync(new Log
                {
                    UserId = user.UserId,
                    Durum = "Başarısız",
                    IslemTipi = "Giriş",
                    Aciklama = $"Giriş başarısız: Hatalı şifre ({email})",
                    Tarih = DateTime.UtcNow,
                    Saat = DateTime.UtcNow.TimeOfDay
                });
                await _context.SaveChangesAsync();
                return null;
            }

            await _context.Logs.AddAsync(new Log
            {
                UserId = user.UserId,
                Durum = "Başarılı",
                IslemTipi = "Giriş",
                Aciklama = "Kullanıcı giriş yaptı",
                Tarih = DateTime.UtcNow,
                Saat = DateTime.UtcNow.TimeOfDay
            });
            await _context.SaveChangesAsync();

            return user;
        }
    }
}