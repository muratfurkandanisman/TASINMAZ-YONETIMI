using Microsoft.AspNetCore.Mvc;
using TASINMAZ.Interfaces;
using System.Threading.Tasks;

namespace TASINMAZ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MahalleController : ControllerBase
    {
        private readonly IMahalleService _mahalleService;

        public MahalleController(IMahalleService mahalleService)
        {
            _mahalleService = mahalleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var mahalleler = await _mahalleService.GetAllAsync();
            return Ok(mahalleler);
        }
    }
}
