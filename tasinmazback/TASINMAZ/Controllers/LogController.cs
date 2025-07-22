using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using TASINMAZ.Dtos;
using TASINMAZ.Interfaces;

namespace TASINMAZ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LogController : ControllerBase
    {
        private readonly ILogService _logService;

        public LogController(ILogService logService)
        {
            _logService = logService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var logs = await _logService.GetAllAsync();
            return Ok(logs);
        }

        [HttpPost("filter")]
        public async Task<IActionResult> Filter([FromBody] LogFilterDto filter)
        {
            var logs = await _logService.FilterAsync(filter);
            return Ok(logs);
        }

        [HttpPost("export")]
        public async Task<IActionResult> ExportToExcel([FromBody] LogFilterDto filter)
        {
            var fileContent = await _logService.ExportToExcelAsync(filter);
            return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "logs.xlsx");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("export-pdf")]
        public async Task<IActionResult> ExportToPdf([FromBody] LogFilterDto filter)
        {
            var fileContent = await _logService.ExportToPdfAsync(filter);
            return File(fileContent, "application/pdf", "logs.pdf");
        }

        [HttpPost("filter-paged")]
        public async Task<IActionResult> FilterPaged([FromBody] LogFilterDto filter)
        {
            var (logs, totalCount) = await _logService.FilterPagedAsync(filter);
            return Ok(new { logs, totalCount, filter.PageNumber, filter.PageSize });
        }
    }
}
