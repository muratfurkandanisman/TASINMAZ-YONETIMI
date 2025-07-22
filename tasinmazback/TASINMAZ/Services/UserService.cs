using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TASINMAZ.Data;
using TASINMAZ.Dtos;
using TASINMAZ.Entities;
using TASINMAZ.Interfaces;
using OfficeOpenXml;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using System.IO;

namespace TASINMAZ.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserDto>> GetAllAsync()
        {
            return await _context.Users
                .Select(u => new UserDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role.ToString()
                })
                .ToListAsync();
        }

        public async Task<List<UserDto>> FilterAsync(UserFilterDto filter)
        {
            var query = _context.Users.AsQueryable();

            if (filter.UserId.HasValue)
                query = query.Where(u => u.UserId == filter.UserId.Value);
            if (!string.IsNullOrEmpty(filter.Email))
                query = query.Where(u => u.Email.Contains(filter.Email));
            if (!string.IsNullOrEmpty(filter.Role))
                query = query.Where(u => u.Role.ToString() == filter.Role);
            if (!string.IsNullOrEmpty(filter.FullName))
                query = query.Where(u => u.FullName.Contains(filter.FullName));

            return await query
                .Select(u => new UserDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role.ToString()
                    // Tasinmazlar property intentionally omitted
                })
                .ToListAsync();
        }

        public async Task<UserDto> CreateAsync(UserCreateDto dto)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existingUser != null)
                throw new System.Exception("Bu e-posta adresiyle zaten bir kullanıcı mevcut.");

            using var hmac = new System.Security.Cryptography.HMACSHA256();
            var entity = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(dto.Password)),
                PasswordSalt = hmac.Key,
                Role = Enum.Parse<Role>(dto.Role)
            };

            _context.Users.Add(entity);
            await _context.SaveChangesAsync();

            // Log kaydı ekle
            await _context.Logs.AddAsync(new Log
            {
                UserId = entity.UserId,
                Durum = "Başarılı",
                IslemTipi = "Kullanıcı Oluşturma",
                Aciklama = $"Yeni kullanıcı oluşturuldu: {entity.Email}",
                Tarih = DateTime.UtcNow,
                Saat = DateTime.UtcNow.TimeOfDay
            });
            await _context.SaveChangesAsync();

            return new UserDto
            {
                UserId = entity.UserId,
                FullName = entity.FullName,
                Email = entity.Email,
                Role = entity.Role.ToString()
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Users.FindAsync(id);
            if (entity == null) return false;

            _context.Users.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<byte[]> ExportToExcelAsync(UserFilterDto filter)
        {
            var users = await FilterAsync(filter);

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Users");

            worksheet.Cells[1, 1].Value = "UserId";
            worksheet.Cells[1, 2].Value = "FullName";
            worksheet.Cells[1, 3].Value = "Email";
            worksheet.Cells[1, 4].Value = "Role";

            for (int i = 0; i < users.Count; i++)
            {
                var u = users[i];
                worksheet.Cells[i + 2, 1].Value = u.UserId;
                worksheet.Cells[i + 2, 2].Value = u.FullName;
                worksheet.Cells[i + 2, 3].Value = u.Email;
                worksheet.Cells[i + 2, 4].Value = u.Role;
            }

            return package.GetAsByteArray();
        }

        public async Task<byte[]> ExportToPdfAsync(UserFilterDto filter)
        {
            var users = await FilterAsync(filter);

            using var stream = new MemoryStream();
            var document = new PdfDocument();
            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var font = new XFont("Arial", 10, XFontStyle.Regular);

            double y = 20;
            gfx.DrawString("UserId | FullName | Email | Role", font, XBrushes.Black, new XRect(20, y, page.Width, page.Height), XStringFormats.TopLeft);
            y += 20;

            foreach (var u in users)
            {
                string line = $"{u.UserId} | {u.FullName} | {u.Email} | {u.Role}";
                gfx.DrawString(line, font, XBrushes.Black, new XRect(20, y, page.Width, page.Height), XStringFormats.TopLeft);
                y += 15;
                if (y > page.Height - 40)
                {
                    page = document.AddPage();
                    gfx = XGraphics.FromPdfPage(page);
                    y = 20;
                }
            }

            document.Save(stream, false);
            return stream.ToArray();
        }

        public async Task<UserDto?> UpdateAsync(int id, UserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return null;

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Role = Enum.Parse<Role>(dto.Role);

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                using var hmac = new System.Security.Cryptography.HMACSHA256();
                user.PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(dto.Password));
                user.PasswordSalt = hmac.Key;
            }

            await _context.SaveChangesAsync();

            return new UserDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString()
            };
        }
    }
}