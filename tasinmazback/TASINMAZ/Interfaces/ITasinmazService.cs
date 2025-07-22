using System.Collections.Generic;
using System.Threading.Tasks;
using TASINMAZ.Dtos;

namespace TASINMAZ.Interfaces
{
    public interface ITasinmazService
    {
        Task<List<TasinmazDto>> GetAllAsync();
        Task<List<TasinmazDto>> GetAllByUserIdAsync(int userId);
        Task<TasinmazDto> CreateAsync(TasinmazDto dto, int userId);
        Task<bool> DeleteAsync(int id, int userId, bool isAdmin);
        Task<TasinmazDto?> UpdateAsync(int id, TasinmazDto dto, int userId, bool isAdmin);
        Task<byte[]> ExportToExcelAsync(TasinmazFilterDto filter); // Added this method
        Task<byte[]> ExportToPdfAsync(TasinmazFilterDto filter); // Added this line
    }
}