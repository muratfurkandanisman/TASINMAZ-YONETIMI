using System.Collections.Generic;
using System.Threading.Tasks;
using TASINMAZ.Dtos;

namespace TASINMAZ.Interfaces
{
    public interface IMahalleService
    {
        Task<List<MahalleDto>> GetAllAsync();
        // Diğer gerekli metotlar burada tanımlanabilir
    }
}