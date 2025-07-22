using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TASINMAZ.Data;
using TASINMAZ.Dtos;
using TASINMAZ.Entities;
using TASINMAZ.Interfaces;
using OfficeOpenXml;
using System.IO;
using System.Linq;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using System;

namespace TASINMAZ.Services
{
    public class LogService : ILogService
    {
        private readonly AppDbContext _context;

        public LogService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<LogDto>> GetAllAsync()
        {
            return await _context.Logs
                .Select(log => new LogDto
                {
                    LogId = log.LogId,
                    UserId = log.UserId, // DÜZELTİLDİ: int? olarak DTO'ya atanıyor
                    Durum = log.Durum,
                    IslemTipi = log.IslemTipi,
                    Aciklama = log.Aciklama,
                    Tarih = log.Tarih,
                    Saat = log.Saat
                })
                .ToListAsync();
        }

        public async Task AddAsync(LogDto logDto)
        {
            var user = await _context.Users.FindAsync(logDto.UserId);
            var log = new Log
            {
                UserId = logDto.UserId,
                Durum = logDto.Durum,
                IslemTipi = logDto.IslemTipi,
                Aciklama = logDto.Aciklama,
                Tarih = logDto.Tarih,
                Saat = logDto.Saat
            };
            _context.Logs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<List<LogDto>> FilterAsync(LogFilterDto filter)
        {
            var query = _context.Logs.AsQueryable();

            if (filter.UserId.HasValue)
                query = query.Where(l => l.UserId == filter.UserId.Value);
            if (!string.IsNullOrEmpty(filter.Durum))
                query = query.Where(l => l.Durum.Contains(filter.Durum));
            if (!string.IsNullOrEmpty(filter.IslemTipi))
                query = query.Where(l => l.IslemTipi.Contains(filter.IslemTipi));
            if (!string.IsNullOrEmpty(filter.Aciklama))
                query = query.Where(l => l.Aciklama.Contains(filter.Aciklama));
            if (filter.TarihBaslangic.HasValue)
                query = query.Where(l => l.Tarih >= filter.TarihBaslangic.Value);
            if (filter.TarihBitis.HasValue)
                query = query.Where(l => l.Tarih <= filter.TarihBitis.Value);

            return await query
                .Select(log => new LogDto
                {
                    LogId = log.LogId,
                    UserId = log.UserId,
                    Durum = log.Durum,
                    IslemTipi = log.IslemTipi,
                    Aciklama = log.Aciklama,
                    Tarih = log.Tarih,
                    Saat = log.Saat
                })
                .ToListAsync();
        }

        public async Task<byte[]> ExportToExcelAsync(LogFilterDto filter)
        {
            var logs = await FilterAsync(filter);

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Logs");

            // Header
            worksheet.Cells[1, 1].Value = "LogId";
            worksheet.Cells[1, 2].Value = "UserId";
            worksheet.Cells[1, 3].Value = "Durum";
            worksheet.Cells[1, 4].Value = "IslemTipi";
            worksheet.Cells[1, 5].Value = "Aciklama";
            worksheet.Cells[1, 6].Value = "Tarih";
            worksheet.Cells[1, 7].Value = "Saat";

            // Data
            for (int i = 0; i < logs.Count; i++)
            {
                var log = logs[i];
                worksheet.Cells[i + 2, 1].Value = log.LogId;
                worksheet.Cells[i + 2, 2].Value = log.UserId;
                worksheet.Cells[i + 2, 3].Value = log.Durum;
                worksheet.Cells[i + 2, 4].Value = log.IslemTipi;
                worksheet.Cells[i + 2, 5].Value = log.Aciklama;
                worksheet.Cells[i + 2, 6].Value = log.Tarih.ToString("yyyy-MM-dd HH:mm:ss");
                worksheet.Cells[i + 2, 7].Value = log.Saat.ToString();
            }

            return package.GetAsByteArray();
        }

        public async Task<byte[]> ExportToPdfAsync(LogFilterDto filter)
        {
            var logs = await FilterAsync(filter);

            using var stream = new MemoryStream();
            var document = new PdfDocument();
            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var font = new XFont("Arial", 10, XFontStyle.Regular);

            double y = 20;
            gfx.DrawString("LogId | UserId | Durum | IslemTipi | Aciklama | Tarih | Saat", font, XBrushes.Black, new XRect(20, y, page.Width, page.Height), XStringFormats.TopLeft);
            y += 20;

            foreach (var log in logs)
            {
                string line = $"{log.LogId} | {log.UserId} | {log.Durum} | {log.IslemTipi} | {log.Aciklama} | {log.Tarih:yyyy-MM-dd HH:mm:ss} | {log.Saat}";
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

        public async Task<(List<LogDto> Logs, int TotalCount)> FilterPagedAsync(LogFilterDto filter)
        {
            var query = _context.Logs.AsQueryable();

            if (filter.UserId.HasValue)
                query = query.Where(l => l.UserId == filter.UserId.Value);
            if (!string.IsNullOrEmpty(filter.Durum))
                query = query.Where(l => l.Durum.Contains(filter.Durum));
            if (!string.IsNullOrEmpty(filter.IslemTipi))
                query = query.Where(l => l.IslemTipi.Contains(filter.IslemTipi));
            if (!string.IsNullOrEmpty(filter.Aciklama))
                query = query.Where(l => l.Aciklama.Contains(filter.Aciklama));
            if (filter.TarihBaslangic.HasValue)
                query = query.Where(l => l.Tarih >= filter.TarihBaslangic.Value);
            if (filter.TarihBitis.HasValue)
                query = query.Where(l => l.Tarih <= filter.TarihBitis.Value);

            int totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(l => l.Tarih)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(log => new LogDto
                {
                    LogId = log.LogId,
                    UserId = log.UserId,
                    Durum = log.Durum,
                    IslemTipi = log.IslemTipi,
                    Aciklama = log.Aciklama,
                    Tarih = log.Tarih,
                    Saat = log.Saat
                })
                .ToListAsync();

            return (logs, totalCount);
        }
    }
}
