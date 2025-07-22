using System.Collections.Generic;
using System.Threading.Tasks;
using TASINMAZ.Dtos;

namespace TASINMAZ.Interfaces
{
    public interface IMahalleService
    {
        Task<List<MahalleDto>> GetAllAsync();
        // Di�er gerekli metotlar burada tan�mlanabilir
    }
}