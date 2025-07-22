using System.Collections.Generic;
using System.Threading.Tasks;
using TASINMAZ.Dtos;

namespace TASINMAZ.Interfaces
{
    public interface ILogService
    {
        Task<List<LogDto>> GetAllAsync();
        Task AddAsync(LogDto logDto);
        Task<List<LogDto>> FilterAsync(LogFilterDto filter);
        Task<(List<LogDto> Logs, int TotalCount)> FilterPagedAsync(LogFilterDto filter); // Yeni metot
        Task<byte[]> ExportToExcelAsync(LogFilterDto filter);
        Task<byte[]> ExportToPdfAsync(LogFilterDto filter);
    }
}