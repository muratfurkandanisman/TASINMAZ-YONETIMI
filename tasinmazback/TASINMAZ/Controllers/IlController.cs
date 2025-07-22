using Microsoft.AspNetCore.Mvc;
using TASINMAZ.Interfaces;

namespace TASINMAZ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IlController : ControllerBase
    {
        private readonly IIlService _ilService; // Use interface

        public IlController(IIlService ilService) // Inject interface
        {
            _ilService = ilService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var iller = await _ilService.GetAllAsync();
            return Ok(iller);
        }
    }
}
