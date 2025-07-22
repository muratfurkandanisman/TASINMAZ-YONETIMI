using System.Collections.Generic;
using System.Threading.Tasks;
using TASINMAZ.Data;
using TASINMAZ.Dtos;
using TASINMAZ.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace TASINMAZ.Services
{
    public class IlceService : IIlceService
    {
        private readonly AppDbContext _context;

        public IlceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<IlceDto>> GetAllAsync()
        {
            return await _context.Ilceler
                .Select(i => new IlceDto
                {
                    IlceId = i.IlceId,
                    Name = i.Name,
                    IlId = i.IlId
                })
                .ToListAsync();
        }
    }
}