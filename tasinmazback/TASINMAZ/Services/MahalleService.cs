using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TASINMAZ.Data;
using TASINMAZ.Dtos;
using TASINMAZ.Interfaces;
using System.Linq;

namespace TASINMAZ.Services
{
    public class MahalleService : IMahalleService
    {
        private readonly AppDbContext _context;

        public MahalleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MahalleDto>> GetAllAsync()
        {
            return await _context.Mahalleler
                .Select(m => new MahalleDto
                {
                    MahalleId = m.MahalleId,
                    Name = m.Name,
                    IlceId = m.IlceId
                })
                .ToListAsync();
        }
    }
}
