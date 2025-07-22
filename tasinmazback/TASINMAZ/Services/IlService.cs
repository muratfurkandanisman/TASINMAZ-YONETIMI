using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TASINMAZ.Data;
using TASINMAZ.Dtos;
using TASINMAZ.Interfaces;

namespace TASINMAZ.Services
{
    public class IlService : IIlService // Interface implemented here
    {
        private readonly AppDbContext _context;

        public IlService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<IlDto>> GetAllAsync()
        {
            return await _context.Iller
                .Select(i => new IlDto
                {
                    IlId = i.IlId,
                    Name = i.Name
                })
                .ToListAsync();
        }
    }
}
