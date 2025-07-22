using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using TASINMAZ.Dtos;
using TASINMAZ.Interfaces;

namespace TASINMAZ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasinmazController : ControllerBase
    {
        private readonly ITasinmazService _service;

        public TasinmazController(ITasinmazService service)
        {
            _service = service;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAllAsync();
            return Ok(list);
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyTasinmazlar()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var list = await _service.GetAllByUserIdAsync(userId);
            return Ok(list);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TasinmazDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            if (userIdClaim == null || roleClaim == null)
                return Unauthorized();

            if (roleClaim.Value == "Admin")
                return Forbid("Admin kullanıcı taşınmaz oluşturamaz.");

            int userId = int.Parse(userIdClaim.Value);

            var created = await _service.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetAll), new { id = created.TasinmazId }, created);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            if (userIdClaim == null || roleClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);
            bool isAdmin = roleClaim.Value == "Admin";

            var deleted = await _service.DeleteAsync(id, userId, isAdmin);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TasinmazDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            if (userIdClaim == null || roleClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);
            bool isAdmin = roleClaim.Value == "Admin";

            var updated = await _service.UpdateAsync(id, dto, userId, isAdmin);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        [Authorize]
        [HttpPost("export-excel")]
        public async Task<IActionResult> ExportToExcel([FromBody] TasinmazFilterDto filter)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role);
            if (userIdClaim == null || roleClaim == null)
                return Unauthorized();

            // Sadece User ise kendi taşınmazlarını export edebilir
            if (roleClaim.Value == "User")
                filter.UserId = int.Parse(userIdClaim.Value);

            var fileContent = await _service.ExportToExcelAsync(filter);
            return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "tasinmazlar.xlsx");
        }

        [Authorize]
        [HttpPost("export-pdf")]
        public async Task<IActionResult> ExportToPdf([FromBody] TasinmazFilterDto filter)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role);
            if (userIdClaim == null || roleClaim == null)
                return Unauthorized();

            // Sadece User ise kendi taşınmazlarını export edebilir
            if (roleClaim.Value == "User")
                filter.UserId = int.Parse(userIdClaim.Value);

            var fileContent = await _service.ExportToPdfAsync(filter);
            return File(fileContent, "application/pdf", "tasinmazlar.pdf");
        }

        

    }
}
