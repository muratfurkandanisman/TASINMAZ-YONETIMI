using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using TASINMAZ.Dtos;
using TASINMAZ.Interfaces;

namespace TASINMAZ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("filter")]
        public async Task<IActionResult> Filter([FromBody] UserFilterDto filter)
        {
            var users = await _userService.FilterAsync(filter);
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserCreateDto dto)
        {
            var created = await _userService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetAll), new { id = created.UserId }, created);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _userService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("export-excel")]
        public async Task<IActionResult> ExportToExcel([FromBody] UserFilterDto filter)
        {
            var fileContent = await _userService.ExportToExcelAsync(filter);
            return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "users.xlsx");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("export-pdf")]
        public async Task<IActionResult> ExportToPdf([FromBody] UserFilterDto filter)
        {
            var fileContent = await _userService.ExportToPdfAsync(filter);
            return File(fileContent, "application/pdf", "users.pdf");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserDto dto)
        {
            var updated = await _userService.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound();
            return Ok(updated);
        }
    }
}
