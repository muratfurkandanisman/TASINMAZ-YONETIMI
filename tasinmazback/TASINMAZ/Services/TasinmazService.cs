using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TASINMAZ.Data;
using TASINMAZ.Dtos;
using TASINMAZ.Entities;
using TASINMAZ.Interfaces;
using TASINMAZ.Services;
using OfficeOpenXml;
using System.IO;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;

namespace TASINMAZ.Services
{
    public class TasinmazService : ITasinmazService
    {
        private readonly AppDbContext _context;
        private readonly ILogService _logService;

        public TasinmazService(AppDbContext context, ILogService logService)
        {
            _context = context;
            _logService = logService;
        }

        public async Task<List<TasinmazDto>> GetAllAsync()
        {
            return await _context.Tasinmazlar
                .Select(t => new TasinmazDto
                {
                    TasinmazId = t.TasinmazId,
                    MahalleId = t.MahalleId,
                    Ada = t.Ada,
                    Parsel = t.Parsel,
                    Nitelik = t.Nitelik.ToString(),
                    KoordinatBilgileri = t.KoordinatBilgileri
                })
                .ToListAsync();
        }

        public async Task<List<TasinmazDto>> GetAllByUserIdAsync(int userId)
        {
            return await _context.Tasinmazlar
                .Where(t => t.UserId == userId)
                .Select(t => new TasinmazDto
                {
                    TasinmazId = t.TasinmazId,
                    MahalleId = t.MahalleId,
                    Ada = t.Ada,
                    Parsel = t.Parsel,
                    Nitelik = t.Nitelik.ToString(),
                    KoordinatBilgileri = t.KoordinatBilgileri
                })
                .ToListAsync();
        }

        public async Task<TasinmazDto> CreateAsync(TasinmazDto dto)
        {
            var entity = new Tasinmaz
            {
                MahalleId = dto.MahalleId,
                Ada = dto.Ada,
                Parsel = dto.Parsel,
                Nitelik = Enum.Parse<Nitelik>(dto.Nitelik),
                KoordinatBilgileri = dto.KoordinatBilgileri
            };

            _context.Tasinmazlar.Add(entity);
            await _context.SaveChangesAsync();

            dto.TasinmazId = entity.TasinmazId;
            return dto;
        }

        public async Task<TasinmazDto> CreateAsync(TasinmazDto dto, int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("Kullanıcı bulunamadı.");

            var entity = new Tasinmaz
            {
                MahalleId = dto.MahalleId,
                Ada = dto.Ada,
                Parsel = dto.Parsel,
                Nitelik = Enum.Parse<Nitelik>(dto.Nitelik),
                KoordinatBilgileri = dto.KoordinatBilgileri,
                UserId = userId,
            };

            _context.Tasinmazlar.Add(entity);
            await _context.SaveChangesAsync();

            // Log ekle
            await _logService.AddAsync(new LogDto
            {
                UserId = userId,
                Durum = "Başarılı",
                IslemTipi = "Oluşturma",
                Aciklama = $"Taşınmaz eklendi: {entity.TasinmazId}",
                Tarih = DateTime.UtcNow,
                Saat = DateTime.UtcNow.TimeOfDay
            });

            dto.TasinmazId = entity.TasinmazId;
            return dto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Tasinmazlar.FindAsync(id);
            if (entity == null) return false;

            _context.Tasinmazlar.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            var entity = await _context.Tasinmazlar.FirstOrDefaultAsync(t => t.TasinmazId == id && t.UserId == userId);
            if (entity == null) return false;

            _context.Tasinmazlar.Remove(entity);
            await _context.SaveChangesAsync();

            // Log ekle
            await _logService.AddAsync(new LogDto
            {
                UserId = userId,
                Durum = "Başarılı",
                IslemTipi = "Silme",
                Aciklama = $"Taşınmaz silindi: {id}",
                Tarih = DateTime.UtcNow,
                Saat = DateTime.UtcNow.TimeOfDay
            });

            return true;
        }

        public async Task<bool> DeleteAsync(int id, int userId, bool isAdmin)
        {
            Tasinmaz? entity;
            if (isAdmin)
                entity = await _context.Tasinmazlar.FirstOrDefaultAsync(t => t.TasinmazId == id);
            else
                entity = await _context.Tasinmazlar.FirstOrDefaultAsync(t => t.TasinmazId == id && t.UserId == userId);

            if (entity == null) return false;

            _context.Tasinmazlar.Remove(entity);
            await _context.SaveChangesAsync();

            // Log ekle
            await _logService.AddAsync(new LogDto
            {
                UserId = userId,
                Durum = "Başarılı",
                IslemTipi = "Silme",
                Aciklama = $"Taşınmaz silindi: {id}",
                Tarih = DateTime.UtcNow,
                Saat = DateTime.UtcNow.TimeOfDay
            });

            return true;
        }

        public async Task<TasinmazDto?> UpdateAsync(int id, TasinmazDto dto, int userId)
        {
            var entity = await _context.Tasinmazlar.FirstOrDefaultAsync(t => t.TasinmazId == id && t.UserId == userId);
            if (entity == null) return null;

            entity.MahalleId = dto.MahalleId;
            entity.Ada = dto.Ada;
            entity.Parsel = dto.Parsel;
            entity.Nitelik = Enum.Parse<Nitelik>(dto.Nitelik);
            entity.KoordinatBilgileri = dto.KoordinatBilgileri; // <-- EKLENDİ

            await _context.SaveChangesAsync();

            // Log ekle
            await _logService.AddAsync(new LogDto
            {
                UserId = userId,
                Durum = "Başarılı",
                IslemTipi = "Güncelleme",
                Aciklama = $"Taşınmaz güncellendi: {id}",
                Tarih = DateTime.UtcNow,
                Saat = DateTime.UtcNow.TimeOfDay
            });

            return new TasinmazDto
            {
                TasinmazId = entity.TasinmazId,
                MahalleId = entity.MahalleId,
                Ada = entity.Ada,
                Parsel = entity.Parsel,
                Nitelik = entity.Nitelik.ToString(),
                KoordinatBilgileri = entity.KoordinatBilgileri
            };
        }

        public async Task<TasinmazDto?> UpdateAsync(int id, TasinmazDto dto, int userId, bool isAdmin)
        {
            Tasinmaz? entity;
            if (isAdmin)
                entity = await _context.Tasinmazlar.FirstOrDefaultAsync(t => t.TasinmazId == id);
            else
                entity = await _context.Tasinmazlar.FirstOrDefaultAsync(t => t.TasinmazId == id && t.UserId == userId);

            if (entity == null) return null;

            entity.MahalleId = dto.MahalleId;
            entity.Ada = dto.Ada;
            entity.Parsel = dto.Parsel;
            entity.Nitelik = Enum.Parse<Nitelik>(dto.Nitelik);
            entity.KoordinatBilgileri = dto.KoordinatBilgileri; // <-- EKLENDİ

            await _context.SaveChangesAsync();

            // Log ekle
            await _logService.AddAsync(new LogDto
            {
                UserId = userId,
                Durum = "Başarılı",
                IslemTipi = "Güncelleme",
                Aciklama = $"Taşınmaz güncellendi: {id}",
                Tarih = DateTime.UtcNow,
                Saat = DateTime.UtcNow.TimeOfDay
            });

            return new TasinmazDto
            {
                TasinmazId = entity.TasinmazId,
                MahalleId = entity.MahalleId,
                Ada = entity.Ada,
                Parsel = entity.Parsel,
                Nitelik = entity.Nitelik.ToString(),
                KoordinatBilgileri = entity.KoordinatBilgileri
            };
        }

        public async Task<List<TasinmazDto>> FilterAsync(TasinmazFilterDto filter)
        {
            var query = _context.Tasinmazlar.AsQueryable();

            if (filter.MahalleId.HasValue)
                query = query.Where(t => t.MahalleId == filter.MahalleId.Value);
            if (filter.Ada.HasValue)
                query = query.Where(t => t.Ada == filter.Ada.Value);
            if (filter.Parsel.HasValue)
                query = query.Where(t => t.Parsel == filter.Parsel.Value);
            if (!string.IsNullOrEmpty(filter.Nitelik))
                query = query.Where(t => t.Nitelik.ToString().Contains(filter.Nitelik));
            if (filter.UserId.HasValue)
                query = query.Where(t => t.UserId == filter.UserId.Value);

            return await query
                .Select(t => new TasinmazDto
                {
                    TasinmazId = t.TasinmazId,
                    MahalleId = t.MahalleId,
                    Ada = t.Ada,
                    Parsel = t.Parsel,
                    Nitelik = t.Nitelik.ToString(),
                    KoordinatBilgileri = t.KoordinatBilgileri
                })
                .ToListAsync();
        }

        public async Task<byte[]> ExportToExcelAsync(TasinmazFilterDto filter)
        {
            var tasinmazlar = await FilterAsync(filter);

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Tasinmazlar");

            // Header
            worksheet.Cells[1, 1].Value = "TasinmazId";
            worksheet.Cells[1, 2].Value = "MahalleId";
            worksheet.Cells[1, 3].Value = "Ada";
            worksheet.Cells[1, 4].Value = "Parsel";
            worksheet.Cells[1, 5].Value = "Nitelik";
            worksheet.Cells[1, 6].Value = "KoordinatBilgileri";

            // Data
            for (int i = 0; i < tasinmazlar.Count; i++)
            {
                var t = tasinmazlar[i];
                worksheet.Cells[i + 2, 1].Value = t.TasinmazId;
                worksheet.Cells[i + 2, 2].Value = t.MahalleId;
                worksheet.Cells[i + 2, 3].Value = t.Ada;
                worksheet.Cells[i + 2, 4].Value = t.Parsel;
                worksheet.Cells[i + 2, 5].Value = t.Nitelik;
                worksheet.Cells[i + 2, 6].Value = t.KoordinatBilgileri;
            }

            return package.GetAsByteArray();
        }

        public async Task<byte[]> ExportToPdfAsync(TasinmazFilterDto filter)
        {
            var tasinmazlar = await FilterAsync(filter);

            using var stream = new MemoryStream();
            var document = new PdfDocument();
            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var font = new XFont("Arial", 10, XFontStyle.Regular);

            double y = 20;
            gfx.DrawString("TasinmazId | MahalleId | Ada | Parsel | Nitelik | KoordinatBilgileri", font, XBrushes.Black, new XRect(20, y, page.Width, page.Height), XStringFormats.TopLeft);
            y += 20;

            foreach (var t in tasinmazlar)
            {
                string line = $"{t.TasinmazId} | {t.MahalleId} | {t.Ada} | {t.Parsel} | {t.Nitelik} | {t.KoordinatBilgileri}";
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
    }
}
