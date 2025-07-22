using System.Collections.Generic;
using System.Threading.Tasks;
using TASINMAZ.Dtos;

namespace TASINMAZ.Interfaces
{
    public interface IUserService
    {
        Task<List<UserDto>> GetAllAsync();
        Task<UserDto> CreateAsync(UserCreateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<byte[]> ExportToExcelAsync(UserFilterDto filter);
        Task<byte[]> ExportToPdfAsync(UserFilterDto filter);
        Task<List<UserDto>> FilterAsync(UserFilterDto filter); // Yeni filtre metodu
        Task<UserDto?> UpdateAsync(int id, UserDto dto);
    }
}